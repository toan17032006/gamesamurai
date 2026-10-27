/**
 * @file tensor.ts
 * @module @aetheria/engine/deeplearning/tensor
 * @description Tensor N chiều tối giản, thuần TypeScript, dùng `Float64Array`.
 * Hỗ trợ reshape, cộng/trừ/nhân vô hướng, dot, matmul, transpose, softmax và
 * các phép giảm (sum/mean/max). Đây là nền tảng cho MLP, DQN và embedding.
 */

/** Dữ liệu đầu vào của tensor. */
export type TensorData = readonly number[] | Float64Array;

/** Tensor bất biến về hình dạng sau khi tạo (reshape trả tensor mới). */
export class Tensor {
  /** Kích thước từng chiều. */
  public readonly shape: readonly number[];
  /** Bộ đệm số thực, thứ tự row-major. */
  public readonly data: Float64Array;

  constructor(shape: readonly number[], data?: TensorData) {
    if (shape.length === 0) throw new RangeError('Tensor cần ít nhất một chiều');
    const size = shape.reduce((acc, dim) => acc * dim, 1);
    if (!Number.isInteger(size) || size < 0) throw new RangeError('Kích thước tensor không hợp lệ');
    if (data && data.length !== size) {
      throw new RangeError(`Tensor cần ${size} phần tử, nhận ${data.length}`);
    }
    this.shape = [...shape];
    this.data = data ? new Float64Array(data) : new Float64Array(size);
  }

  /** Tổng số phần tử. */
  public get size(): number {
    return this.data.length;
  }

  /** Số chiều. */
  public get rank(): number {
    return this.shape.length;
  }

  /** Tensor toàn số 0. */
  public static zeros(...shape: number[]): Tensor {
    return new Tensor(shape);
  }

  /** Tensor từ mảng phẳng và hình dạng. */
  public static from(data: TensorData, shape?: readonly number[]): Tensor {
    return new Tensor(shape ?? [data.length], data);
  }

  /** Ma trận đơn vị kích thước `n`. */
  public static identity(n: number): Tensor {
    const out = new Tensor([n, n]);
    for (let i = 0; i < n; i++) out.data[i * n + i] = 1;
    return out;
  }

  /** Chỉ số phẳng từ toạ độ nhiều chiều. */
  public offset(indices: readonly number[]): number {
    if (indices.length !== this.shape.length) {
      throw new RangeError('Số chỉ số phải bằng số chiều');
    }
    let offset = 0;
    for (let i = 0; i < indices.length; i++) {
      const index = indices[i];
      const dim = this.shape[i];
      if (!Number.isInteger(index) || index < 0 || index >= dim) {
        throw new RangeError(`Chỉ số ${index} ngoài chiều ${dim}`);
      }
      offset = offset * dim + index;
    }
    return offset;
  }

  /** Đọc phần tử theo toạ độ. */
  public at(...indices: number[]): number {
    return this.data[this.offset(indices)];
  }

  /** Ghi phần tử theo toạ độ. */
  public setAt(value: number, ...indices: number[]): this {
    this.data[this.offset(indices)] = value;
    return this;
  }

  /** Bản sao độc lập. */
  public clone(): Tensor {
    return new Tensor(this.shape, Float64Array.from(this.data));
  }

  /** Đổi hình dạng (trả tensor mới chia sẻ dữ liệu đã sao). */
  public reshape(shape: readonly number[]): Tensor {
    return new Tensor(shape, Float64Array.from(this.data));
  }

  /** Áp dụng hàm lên từng phần tử. */
  public map(fn: (value: number, index: number) => number): Tensor {
    const out = new Tensor(this.shape);
    for (let i = 0; i < this.data.length; i++) out.data[i] = fn(this.data[i], i);
    return out;
  }

  /** Cộng từng phần tử với tensor khác cùng kích thước. */
  public add(other: Tensor): Tensor {
    this.assertSameSize(other);
    const out = new Tensor(this.shape);
    for (let i = 0; i < this.data.length; i++) out.data[i] = this.data[i] + other.data[i];
    return out;
  }

  /** Trừ từng phần tử. */
  public sub(other: Tensor): Tensor {
    this.assertSameSize(other);
    const out = new Tensor(this.shape);
    for (let i = 0; i < this.data.length; i++) out.data[i] = this.data[i] - other.data[i];
    return out;
  }

  /** Nhân từng phần tử (Hadamard). */
  public mul(other: Tensor): Tensor {
    this.assertSameSize(other);
    const out = new Tensor(this.shape);
    for (let i = 0; i < this.data.length; i++) out.data[i] = this.data[i] * other.data[i];
    return out;
  }

  /** Nhân với một vô hướng. */
  public scale(factor: number): Tensor {
    return this.map((value) => value * factor);
  }

  /** Tích vô hướng với tensor cùng kích thước. */
  public dot(other: Tensor): number {
    this.assertSameSize(other);
    let sum = 0;
    for (let i = 0; i < this.data.length; i++) sum += this.data[i] * other.data[i];
    return sum;
  }

  /** Nhân ma trận 2 chiều. */
  public matmul(other: Tensor): Tensor {
    if (this.rank !== 2 || other.rank !== 2) throw new RangeError('matmul chỉ hỗ trợ ma trận 2 chiều');
    const rows = this.shape[0];
    const inner = this.shape[1];
    if (inner !== other.shape[0]) throw new RangeError('Hình dạng không tương thích cho matmul');
    const cols = other.shape[1];
    const out = new Tensor([rows, cols]);
    for (let r = 0; r < rows; r++) {
      for (let k = 0; k < inner; k++) {
        const a = this.data[r * inner + k];
        if (a === 0) continue;
        for (let c = 0; c < cols; c++) {
          out.data[r * cols + c] += a * other.data[k * cols + c];
        }
      }
    }
    return out;
  }

  /** Chuyển vị ma trận 2 chiều. */
  public transpose(): Tensor {
    if (this.rank !== 2) throw new RangeError('transpose chỉ hỗ trợ ma trận 2 chiều');
    const rows = this.shape[0];
    const cols = this.shape[1];
    const out = new Tensor([cols, rows]);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) out.data[c * rows + r] = this.data[r * cols + c];
    }
    return out;
  }

  /** Softmax ổn định số học trên toàn bộ tensor (thường là vector logits). */
  public softmax(): Tensor {
    let max = -Infinity;
    for (const value of this.data) max = Math.max(max, value);
    let sum = 0;
    const out = new Tensor(this.shape);
    for (let i = 0; i < this.data.length; i++) {
      const exp = Math.exp(this.data[i] - max);
      out.data[i] = exp;
      sum += exp;
    }
    if (sum > 0) {
      for (let i = 0; i < out.data.length; i++) out.data[i] /= sum;
    }
    return out;
  }

  /** Tổng các phần tử. */
  public sum(): number {
    let total = 0;
    for (const value of this.data) total += value;
    return total;
  }

  /** Trung bình các phần tử. */
  public mean(): number {
    return this.size === 0 ? 0 : this.sum() / this.size;
  }

  /** Giá trị lớn nhất. */
  public max(): number {
    let value = -Infinity;
    for (const item of this.data) value = Math.max(value, item);
    return value;
  }

  /** Chuẩn L2. */
  public norm(): number {
    let sum = 0;
    for (const value of this.data) sum += value * value;
    return Math.sqrt(sum);
  }

  /** Giá trị nhỏ nhất. */
  public min(): number {
    let value = Infinity;
    for (const item of this.data) value = Math.min(value, item);
    return value;
  }

  /** Chỉ số phần tử lớn nhất. */
  public argmax(): number {
    let best = 0;
    for (let i = 1; i < this.data.length; i++) {
      if (this.data[i] > this.data[best]) best = i;
    }
    return best;
  }

  /** Phương sai dân số của các phần tử. */
  public variance(): number {
    if (this.size === 0) return 0;
    const mean = this.mean();
    let sum = 0;
    for (const value of this.data) sum += (value - mean) * (value - mean);
    return sum / this.size;
  }

  /** Độ lệch chuẩn dân số. */
  public std(): number {
    return Math.sqrt(this.variance());
  }

  // -------------------------------------------------------------------------
  // Phép toán tại chỗ (in-place) — tránh cấp phát trong vòng lặp nóng
  // -------------------------------------------------------------------------

  /** Cộng tại chỗ: `this += other`. */
  public addInPlace(other: Tensor): this {
    this.assertSameSize(other);
    for (let i = 0; i < this.data.length; i++) this.data[i] += other.data[i];
    return this;
  }

  /** Nhân vô hướng tại chỗ: `this *= factor`. */
  public scaleInPlace(factor: number): this {
    for (let i = 0; i < this.data.length; i++) this.data[i] *= factor;
    return this;
  }

  /** Cộng có hệ số tại chỗ: `this += factor * other`. */
  public addScaledInPlace(other: Tensor, factor: number): this {
    this.assertSameSize(other);
    for (let i = 0; i < this.data.length; i++) this.data[i] += other.data[i] * factor;
    return this;
  }

  /** Kẹp mọi phần tử vào `[min, max]` tại chỗ. */
  public clampInPlace(min: number, max: number): this {
    for (let i = 0; i < this.data.length; i++) {
      const value = this.data[i];
      this.data[i] = value < min ? min : value > max ? max : value;
    }
    return this;
  }

  // -------------------------------------------------------------------------
  // Phép toán đại số tuyến tính bổ sung
  // -------------------------------------------------------------------------

  /** Nhân ma trận với vector: `(rows × cols) · (cols,) → (rows,)`. */
  public matvec(vector: TensorData): Tensor {
    if (this.rank !== 2) throw new RangeError('matvec yêu cầu ma trận 2 chiều');
    const rows = this.shape[0];
    const cols = this.shape[1];
    if (vector.length !== cols) {
      throw new RangeError(`matvec cần vector ${cols} phần tử, nhận ${vector.length}`);
    }
    const out = new Tensor([rows]);
    for (let r = 0; r < rows; r++) {
      let sum = 0;
      const base = r * cols;
      for (let c = 0; c < cols; c++) sum += this.data[base + c] * vector[c];
      out.data[r] = sum;
    }
    return out;
  }

  /** Cộng vector bias vào từng hàng ma trận `(rows × cols) + (cols,)`. */
  public addBias(bias: TensorData): Tensor {
    if (this.rank !== 2) throw new RangeError('addBias yêu cầu ma trận 2 chiều');
    const cols = this.shape[1];
    if (bias.length !== cols) {
      throw new RangeError(`addBias cần bias ${cols} phần tử, nhận ${bias.length}`);
    }
    const out = new Tensor(this.shape);
    const rows = this.shape[0];
    for (let r = 0; r < rows; r++) {
      const base = r * cols;
      for (let c = 0; c < cols; c++) out.data[base + c] = this.data[base + c] + bias[c];
    }
    return out;
  }

  /** Ma trận ngoại `(m,) ⊗ (n,) → (m × n)`. */
  public static outer(a: TensorData, b: TensorData): Tensor {
    const rows = a.length;
    const cols = b.length;
    const out = new Tensor([rows, cols]);
    for (let r = 0; r < rows; r++) {
      const ai = a[r];
      const base = r * cols;
      for (let c = 0; c < cols; c++) out.data[base + c] = ai * b[c];
    }
    return out;
  }

  /** Xếp chồng nhiều tensor cùng hình dạng thành tensor mới ở chiều 0. */
  public static stack(tensors: ReadonlyArray<Tensor>): Tensor {
    if (tensors.length === 0) throw new RangeError('stack cần ít nhất một tensor');
    const first = tensors[0];
    for (const t of tensors) {
      if (t.size !== first.size) throw new RangeError('stack yêu cầu các tensor cùng kích thước');
    }
    const shape = [tensors.length, ...first.shape];
    const out = new Tensor(shape);
    for (let i = 0; i < tensors.length; i++) {
      out.data.set(tensors[i].data, i * first.size);
    }
    return out;
  }

  /** Vector đơn vị (trả bản sao nếu chuẩn bằng 0). */
  public normalize(): Tensor {
    const norm = this.norm();
    return norm > 0 ? this.scale(1 / norm) : this.clone();
  }

  /** Chuyển về mảng số thường. */
  public toArray(): number[] {
    return Array.from(this.data);
  }

  private assertSameSize(other: Tensor): void {
    if (this.size !== other.size) {
      throw new RangeError(`Kích thước không khớp: ${this.size} và ${other.size}`);
    }
  }
}

/** Tích vô hướng hai vector thường. */
export function dot(a: readonly number[], b: readonly number[]): number {
  const length = Math.min(a.length, b.length);
  let sum = 0;
  for (let i = 0; i < length; i++) sum += a[i] * b[i];
  return sum;
}

/** Chuẩn L2 của vector. */
export function vectorNorm(values: readonly number[]): number {
  let sum = 0;
  for (const value of values) sum += value * value;
  return Math.sqrt(sum);
}

/** Cosine similarity, trả 0 nếu một vector bằng 0. */
export function cosineSimilarity(a: readonly number[], b: readonly number[]): number {
  const na = vectorNorm(a);
  const nb = vectorNorm(b);
  if (na === 0 || nb === 0) return 0;
  return dot(a, b) / (na * nb);
}
