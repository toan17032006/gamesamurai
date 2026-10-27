/**
 * @file internal.ts
 * @module @aetheria/engine/learning/internal
 * @description Tiện ích nội bộ dùng chung cho các trainer của learning runtime —
 * thay thế các bản sao `restoreWeights`/`copyWeights`/`emptyReport` previously
 * bị nhân bản trong nhiều file (dqn, ppo, alignment, preference, muzero,
 * dreamer, marl...). Đây là điểm sửa tập trung: đổi cách khôi phục snapshot chỉ
 * cần sửa một nơi.
 */

import { NeuralNetwork } from '../deeplearning/nn.js';
import type { LearningReport } from './types.js';

/**
 * Ghi trọng số từ snapshot vào mạng đích (không đổi cấu trúc tầng).
 *
 * Chấp nhận `undefined` cho thuận tiện các `fromSnapshot` có trường tùy chọn:
 * khi không có snapshot, hàm bỏ qua im lặng. Tầng thiếu trong snapshot được
 * giữ nguyên trọng số hiện tại.
 */
export function restoreWeightsFromSnapshot(
  snapshot: ReturnType<NeuralNetwork['snapshot']> | undefined,
  target: NeuralNetwork,
): void {
  if (!snapshot) return;
  for (let l = 0; l < target.layers.length; l++) {
    const saved = snapshot.layers[l];
    const layer = target.layers[l];
    if (!saved) continue;
    for (let o = 0; o < layer.outputSize; o++) {
      layer.biases[o] = saved.biases[o] ?? 0;
      for (let i = 0; i < layer.inputSize; i++) {
        layer.weights[o][i] = saved.weights[o]?.[i] ?? 0;
      }
    }
  }
}

/** Report rỗng chuẩn hóa dùng khi tập dữ liệu trống hoặc bỏ qua huấn luyện. */
export function emptyLearningReport(startedAt: number): LearningReport {
  return {
    epochs: 0,
    steps: 0,
    samples: 0,
    initialLoss: 0,
    finalLoss: 0,
    bestLoss: 0,
    lossHistory: [],
    metrics: {},
    elapsedMs: Date.now() - startedAt,
    stoppedEarly: false,
  };
}
