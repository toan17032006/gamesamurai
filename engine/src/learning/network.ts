/**
 * @file network.ts
 * @module @aetheria/engine/learning/network
 * @description Cầu nối gradient cho `NeuralNetwork` hiện có. Thay vì buộc mọi
 * thuật toán mới phải sửa lõi mạng, module này cung cấp:
 *
 * - lan truyền ngược theo lô và cộng dồn gradient,
 * - cắt norm gradient toàn cục,
 * - đóng băng từng tầng (fine-tuning/layer freezing),
 * - chuyển mạng thành vector tham số (di truyền, federated, checkpoint),
 * - các loss/softmax/one-hot và gradient tương ứng.
 *
 * Mọi hàm đều thao tác trên mạng đã được forward trước đó; người gọi chịu trách
 * nhiệm gọi `forward` đúng một lần cho mỗi mẫu trước khi backprop.
 */

import {
  NeuralNetwork,
  type DenseLayer,
  type OptimizerConfig,
} from '../deeplearning/nn.js';
import { DeepRandom, clamp01, clampRange } from '../deeplearning/random.js';

/** Gradient của toàn bộ tham số mạng theo cấu trúc tầng. */
export interface NetworkGradient {
  /** `[layer][output][input]` */
  weights: number[][][];
  /** `[layer][output]` */
  biases: number[][];
}

/** Kết quả một lần lan truyền ngược. */
export interface BackpropResult {
  /** Gradient theo input của mạng (hữu ích cho actor-critic/GAN/VAE). */
  gradInput: number[];
  /** Gradient tích lũy của toàn bộ tham số. */
  gradient: NetworkGradient;
}

/** Tùy chọn lan truyền ngược. */
export interface BackpropOptions {
  /** Bỏ đạo hàm activation ở tầng ra (dùng khi output là softmax + CE). */
  skipOutputActivation?: boolean;
  /** Gradient tích lũy sẵn; nếu bỏ qua sẽ tạo mới. */
  gradient?: NetworkGradient;
  /** Có cập nhật trọng số ngay không. */
  apply?: boolean;
  /** Optimizer dùng khi apply; mặc định lấy từ mạng. */
  optimizer?: OptimizerConfig;
  /** Số mẫu trong batch để chuẩn hóa gradient. */
  batchSize?: number;
  /** Mask tầng được cập nhật; `false` = đóng băng tầng tương ứng. */
  trainable?: readonly boolean[];
  /** Cắt norm gradient trước khi cập nhật. */
  clipNorm?: number;
}

/** Tạo bộ chứa gradient rỗng đúng kích thước mạng. */
export function createNetworkGradient(network: NeuralNetwork): NetworkGradient {
  return {
    weights: network.layers.map((layer) =>
      Array.from({ length: layer.outputSize }, () => new Array<number>(layer.inputSize).fill(0)),
    ),
    biases: network.layers.map((layer) => new Array<number>(layer.outputSize).fill(0)),
  };
}

/** Xóa gradient về 0 để tái sử dụng bộ đệm. */
export function zeroNetworkGradient(gradient: NetworkGradient): void {
  for (const layer of gradient.weights) {
    for (const row of layer) row.fill(0);
  }
  for (const layer of gradient.biases) layer.fill(0);
}

/** Cộng gradient `source` vào `target` tại chỗ. */
export function accumulateNetworkGradient(target: NetworkGradient, source: NetworkGradient): void {
  assertSameGradientShape(target, source);
  for (let l = 0; l < target.weights.length; l++) {
    for (let o = 0; o < target.weights[l].length; o++) {
      const targetRow = target.weights[l][o];
      const sourceRow = source.weights[l][o];
      for (let i = 0; i < targetRow.length; i++) targetRow[i] += sourceRow[i];
      target.biases[l][o] += source.biases[l][o];
    }
  }
}

/**
 * Lan truyền ngược qua toàn bộ mạng.
 *
 * Lưu ý: `gradOutput` là đạo hàm loss theo *output của mạng*, không phải theo
 * logits. Với softmax + cross-entropy, hãy truyền `softmax(logits) - target` và
 * bật `skipOutputActivation` để tránh nhân đạo hàm softmax hai lần.
 */
export function backpropagateNetwork(
  network: NeuralNetwork,
  gradOutput: readonly number[],
  options: BackpropOptions = {},
): BackpropResult {
  if (gradOutput.length !== network.outputSize) {
    throw new RangeError(`Gradient ra cần ${network.outputSize} phần tử, nhận ${gradOutput.length}`);
  }
  const gradient = options.gradient ?? createNetworkGradient(network);
  const optimizer = options.optimizer ?? network.optimizer;
  let grad = [...gradOutput];

  for (let l = network.layers.length - 1; l >= 0; l--) {
    const layer = network.layers[l];
    const skip = l === network.layers.length - 1 && options.skipOutputActivation === true;
    const result = layer.backward(grad, optimizer, skip, false);
    const targetWeights = gradient.weights[l];
    const targetBiases = gradient.biases[l];
    for (let o = 0; o < layer.outputSize; o++) {
      const row = result.gradWeights[o];
      const targetRow = targetWeights[o];
      for (let i = 0; i < layer.inputSize; i++) targetRow[i] += row[i];
      targetBiases[o] += result.gradBiases[o];
    }
    grad = result.gradInput;
  }

  if (options.apply) {
    if (options.clipNorm !== undefined) clipNetworkGradient(gradient, options.clipNorm);
    applyNetworkGradient(network, gradient, {
      optimizer,
      batchSize: options.batchSize ?? 1,
      trainable: options.trainable,
    });
  }

  return { gradInput: grad, gradient };
}

/** Áp gradient vào mạng, có thể bỏ qua các tầng bị đóng băng. */
export function applyNetworkGradient(
  network: NeuralNetwork,
  gradient: NetworkGradient,
  options: {
    optimizer?: OptimizerConfig;
    batchSize?: number;
    trainable?: readonly boolean[];
  } = {},
): void {
  const optimizer = options.optimizer ?? network.optimizer;
  const batchSize = Math.max(1, options.batchSize ?? 1);
  for (let l = 0; l < network.layers.length; l++) {
    if (options.trainable && options.trainable[l] === false) continue;
    const layer = network.layers[l];
    if (isLayerFrozen(layer)) continue;
    layer.applyGradients(gradient.weights[l], gradient.biases[l], optimizer, batchSize);
  }
}

/** Cắt norm L2 toàn cục của gradient tại chỗ; trả norm trước khi cắt. */
export function clipNetworkGradient(gradient: NetworkGradient, maxNorm: number): number {
  if (!Number.isFinite(maxNorm) || maxNorm <= 0) return 0;
  let sum = 0;
  for (let l = 0; l < gradient.weights.length; l++) {
    for (const row of gradient.weights[l]) {
      for (const value of row) sum += value * value;
    }
    for (const value of gradient.biases[l]) sum += value * value;
  }
  const norm = Math.sqrt(sum);
  if (norm <= maxNorm || norm === 0) return norm;
  const scale = maxNorm / norm;
  for (let l = 0; l < gradient.weights.length; l++) {
    for (const row of gradient.weights[l]) {
      for (let i = 0; i < row.length; i++) row[i] *= scale;
    }
    for (let i = 0; i < gradient.biases[l].length; i++) gradient.biases[l][i] *= scale;
  }
  return norm;
}

/** Forward rồi backprop với gradient output cho trước. */
export function trainNetworkFromOutputGradient(
  network: NeuralNetwork,
  input: readonly number[],
  gradOutput: readonly number[],
  options: BackpropOptions = {},
): number[] {
  network.forward(input, true);
  return backpropagateNetwork(network, gradOutput, {
    ...options,
    gradient: options.gradient,
    apply: options.apply ?? true,
  }).gradInput;
}

/** Lấy gradient theo input mà không cập nhật trọng số. */
export function networkInputGradient(
  network: NeuralNetwork,
  gradOutput: readonly number[],
  skipOutputActivation = false,
): number[] {
  return backpropagateNetwork(network, gradOutput, {
    skipOutputActivation,
    apply: false,
  }).gradInput;
}

/** Chuyển mạng thành vector tham số phẳng (weights từng tầng rồi biases). */
export function flattenNetworkParameters(network: NeuralNetwork): number[] {
  const parameters: number[] = [];
  for (const layer of network.layers) {
    for (const row of layer.weights) parameters.push(...row);
    parameters.push(...layer.biases);
  }
  return parameters;
}

/** Số tham số của mạng. */
export function networkParameterCount(network: NeuralNetwork): number {
  let count = 0;
  for (const layer of network.layers) count += layer.inputSize * layer.outputSize + layer.outputSize;
  return count;
}

/** Ghi vector tham số vào mạng; kiểm tra đúng số chiều. */
export function applyNetworkParameters(network: NeuralNetwork, parameters: readonly number[]): void {
  const expected = networkParameterCount(network);
  if (parameters.length !== expected) {
    throw new RangeError(`Cần ${expected} tham số, nhận ${parameters.length}`);
  }
  let cursor = 0;
  for (const layer of network.layers) {
    for (let o = 0; o < layer.outputSize; o++) {
      for (let i = 0; i < layer.inputSize; i++) layer.weights[o][i] = parameters[cursor++];
    }
    for (let o = 0; o < layer.outputSize; o++) layer.biases[o] = parameters[cursor++];
  }
}

/** Khoảng cách Euclid giữa hai vector tham số. */
export function parameterDistance(a: readonly number[], b: readonly number[]): number {
  const length = Math.min(a.length, b.length);
  let sum = 0;
  for (let i = 0; i < length; i++) sum += (a[i] - b[i]) ** 2;
  return Math.sqrt(sum);
}

/** Trung bình có trọng số các vector tham số (FedAvg/model averaging). */
export function averageParameters(
  parameterSets: ReadonlyArray<{ parameters: readonly number[]; weight?: number }>,
): number[] {
  if (parameterSets.length === 0) return [];
  const length = parameterSets[0].parameters.length;
  const result = new Array<number>(length).fill(0);
  let totalWeight = 0;
  for (const set of parameterSets) {
    if (set.parameters.length !== length) throw new RangeError('Các vector tham số khác số chiều');
    const weight = Math.max(0, set.weight ?? 1);
    totalWeight += weight;
    for (let i = 0; i < length; i++) result[i] += set.parameters[i] * weight;
  }
  const scale = totalWeight > 0 ? 1 / totalWeight : 0;
  for (let i = 0; i < length; i++) result[i] *= scale;
  return result;
}

/** Đột biến vector tham số tại chỗ (dùng cho GA/ES). */
export function mutateParameters(
  parameters: number[],
  rate: number,
  scale: number,
  random: DeepRandom,
): number[] {
  const probability = clamp01(rate);
  for (let i = 0; i < parameters.length; i++) {
    if (random.chance(probability)) parameters[i] += random.gaussian(0, clonePositive(scale));
  }
  return parameters;
}

/** Softmax ổn định số học. */
export function softmaxVector(logits: readonly number[]): number[] {
  if (logits.length === 0) return [];
  let max = -Infinity;
  for (const value of logits) max = Math.max(max, value);
  const exps = logits.map((value) => Math.exp(value - max));
  const total = exps.reduce((sum, value) => sum + value, 0) || 1;
  return exps.map((value) => value / total);
}

/** Log-softmax ổn định số học. */
export function logSoftmaxVector(logits: readonly number[]): number[] {
  if (logits.length === 0) return [];
  let max = -Infinity;
  for (const value of logits) max = Math.max(max, value);
  const shifted = logits.map((value) => value - max);
  const logSumExp = Math.log(shifted.reduce((sum, value) => sum + Math.exp(value), 0) || 1);
  return shifted.map((value) => value - logSumExp);
}

/** Chỉ số phần tử lớn nhất. */
export function argmaxIndex(values: readonly number[]): number {
  if (values.length === 0) throw new RangeError('argmax cần ít nhất một phần tử');
  let best = 0;
  for (let i = 1; i < values.length; i++) {
    if (values[i] > values[best]) best = i;
  }
  return best;
}

/** One-hot vector. */
export function oneHot(index: number, size: number, scale = 1): number[] {
  const vector = new Array<number>(size).fill(0);
  if (index >= 0 && index < size) vector[index] = scale;
  return vector;
}

/** Sigmoid ổn định. */
export function sigmoid(value: number): number {
  return 1 / (1 + Math.exp(-clampRange(value, -60, 60)));
}

/** Cross-entropy từ xác suất dự đoán và nhãn one-hot/soft. */
export function categoricalCrossEntropy(
  probabilities: readonly number[],
  target: readonly number[],
): number {
  if (probabilities.length !== target.length) throw new RangeError('Xác suất và target khác chiều');
  let loss = 0;
  for (let i = 0; i < probabilities.length; i++) {
    if (target[i] === 0) continue;
    loss -= target[i] * Math.log(Math.max(probabilities[i], 1e-12));
  }
  return loss;
}

/** Loss + gradient wrt logits cho phân loại softmax. */
export function softmaxCrossEntropyGradient(
  logits: readonly number[],
  target: readonly number[],
  sampleWeight = 1,
): { loss: number; gradLogits: number[] } {
  const probabilities = softmaxVector(logits);
  const loss = categoricalCrossEntropy(probabilities, target) * sampleWeight;
  const gradLogits = probabilities.map((probability, index) => (probability - target[index]) * sampleWeight);
  return { loss, gradLogits };
}

/** Loss + gradient wrt output cho MSE. */
export function meanSquaredErrorGradient(
  predicted: readonly number[],
  target: readonly number[],
  sampleWeight = 1,
): { loss: number; gradOutput: number[] } {
  if (predicted.length !== target.length) throw new RangeError('Dự đoán và target khác chiều');
  if (predicted.length === 0) return { loss: 0, gradOutput: [] };
  const count = predicted.length;
  let loss = 0;
  const gradOutput = new Array<number>(count);
  for (let i = 0; i < count; i++) {
    const error = predicted[i] - target[i];
    loss += error * error;
    gradOutput[i] = (2 * error * sampleWeight) / count;
  }
  return { loss: (loss * sampleWeight) / count, gradOutput };
}

/** Loss + gradient wrt output cho Huber. */
export function huberLossGradient(
  predicted: readonly number[],
  target: readonly number[],
  delta = 1,
  sampleWeight = 1,
): { loss: number; gradOutput: number[] } {
  if (predicted.length !== target.length) throw new RangeError('Dự đoán và target khác chiều');
  if (predicted.length === 0) return { loss: 0, gradOutput: [] };
  const count = predicted.length;
  let loss = 0;
  const gradOutput = new Array<number>(count);
  for (let i = 0; i < count; i++) {
    const error = predicted[i] - target[i];
    const absolute = Math.abs(error);
    loss += absolute <= delta ? 0.5 * error * error : delta * (absolute - 0.5 * delta);
    gradOutput[i] = (absolute <= delta ? error : Math.sign(error) * delta) * sampleWeight / count;
  }
  return { loss: (loss * sampleWeight) / count, gradOutput };
}

/** Loss + gradient wrt logits cho BCE (output sigmoid). */
export function binaryCrossEntropyGradient(
  logits: readonly number[],
  target: readonly number[],
  sampleWeight = 1,
): { loss: number; gradLogits: number[] } {
  if (logits.length !== target.length) throw new RangeError('Logits và target khác chiều');
  const probabilities = logits.map(sigmoid);
  let loss = 0;
  let count = 0;
  const gradLogits = new Array<number>(logits.length);
  for (let i = 0; i < logits.length; i++) {
    const probability = probabilities[i];
    const label = clamp01(target[i]);
    loss -= label * Math.log(Math.max(probability, 1e-12)) +
      (1 - label) * Math.log(Math.max(1 - probability, 1e-12));
    gradLogits[i] = (probability - label) * sampleWeight;
    count++;
  }
  return { loss: (loss * sampleWeight) / Math.max(1, count), gradLogits };
}

/** Độ chính xác phân loại từ logits và nhãn rời rạc. */
export function classificationAccuracy(
  predictions: ReadonlyArray<readonly number[]>,
  labels: readonly number[],
): number {
  if (predictions.length === 0) return 0;
  let correct = 0;
  for (let i = 0; i < predictions.length; i++) {
    if (argmaxIndex(predictions[i]) === labels[i]) correct++;
  }
  return correct / predictions.length;
}

/** Lấy danh sách tầng mặc định cho fine-tuning. */
export function trainableLayerMask(
  layerCount: number,
  mode: 'all' | 'last' | 'except-first' | readonly number[],
  lastCount = 1,
): boolean[] {
  if (mode === 'all') return new Array<boolean>(layerCount).fill(true);
  if (mode === 'last') {
    const count = Math.max(1, Math.min(layerCount, Math.floor(lastCount)));
    return Array.from({ length: layerCount }, (_, index) => index >= layerCount - count);
  }
  if (mode === 'except-first') {
    return Array.from({ length: layerCount }, (_, index) => index > 0);
  }
  const frozen = new Set(mode);
  return Array.from({ length: layerCount }, (_, index) => !frozen.has(index));
}

/** Tập tầng bị đóng băng, tách khỏi cấu trúc DenseLayer của engine lõi. */
const frozenLayers = new WeakSet<DenseLayer>();

/** Đặt tầng đóng băng mà không sửa đối tượng DenseLayer gốc. */
export function setLayerFrozen(layer: DenseLayer, frozen: boolean): void {
  if (frozen) frozenLayers.add(layer);
  else frozenLayers.delete(layer);
}

/** Đọc trạng thái đóng băng của tầng. */
export function isLayerFrozen(layer: DenseLayer): boolean {
  return frozenLayers.has(layer);
}

/** Kiểm tra hai gradient cùng cấu trúc. */
function assertSameGradientShape(a: NetworkGradient, b: NetworkGradient): void {
  if (a.weights.length !== b.weights.length) throw new RangeError('Gradient khác số tầng');
  for (let l = 0; l < a.weights.length; l++) {
    if (a.weights[l].length !== b.weights[l].length) throw new RangeError('Gradient khác số output');
    if (a.biases[l].length !== b.biases[l].length) throw new RangeError('Gradient bias khác chiều');
  }
}

function clonePositive(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}
