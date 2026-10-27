/**
 * @file math.ts
 * @module @aetheria/engine/spatial/math
 * @description Dependency-free vector, quaternion and 4x4 matrix math used by the
 * spatial bounds, physics sweep and raycast systems.
 *
 * The module is intentionally independent from `three` so it can run in workers,
 * on the server and inside deterministic simulation tests.
 */

/** Structural 3D vector accepted by every spatial API. */
export interface Vec3Like {
  x: number;
  y: number;
  z: number;
}

/** Structural quaternion accepted by every spatial API. */
export interface QuatLike {
  x: number;
  y: number;
  z: number;
  w: number;
}

/** Tuple form accepted by convenience constructors. */
export type Vec3Tuple = readonly [number, number, number];

/** Hit record shared by bounds, triangles and sweep tests. */
export interface SpatialHit {
  hit: boolean;
  distance: number;
  point: Vec3;
  normal: Vec3;
}

/** Structural ray accepted by bounds intersection helpers. */
export interface RayLike {
  origin: Vec3Like;
  direction: Vec3Like;
  maxDistance?: number;
}

/** Sweep record shared by continuous collision helpers. */
export interface SweepHitResult {
  hit: boolean;
  /** Normalised time of impact in `[0, 1]` along the sweep displacement. */
  timeOfImpact: number;
  /** World-space distance travelled before impact. */
  distance: number;
  point: Vec3;
  normal: Vec3;
  /** Optional identifier supplied by the broadphase caller. */
  id?: string;
}

export const EPSILON = 1e-9;
export const EPSILON_SQ = EPSILON * EPSILON;

/** Clamp a number into an inclusive range. */
export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

/** Linear interpolation. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Convert degrees to radians. */
export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Convert radians to degrees. */
export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}

/** Normalize an angle to `[-PI, PI]`. */
export function wrapAngle(radians: number): number {
  let angle = radians % (Math.PI * 2);
  if (angle > Math.PI) angle -= Math.PI * 2;
  if (angle < -Math.PI) angle += Math.PI * 2;
  return angle;
}

/**
 * Mutable, allocation-friendly 3D vector.
 *
 * Methods mutate `this`; the `static` helpers return new vectors. Use `clone()`
 * when you need to preserve an input across operations.
 */
export class Vec3 implements Vec3Like {
  public x: number;
  public y: number;
  public z: number;

  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public static readonly zero = (): Vec3 => new Vec3(0, 0, 0);
  public static readonly one = (): Vec3 => new Vec3(1, 1, 1);
  public static readonly up = (): Vec3 => new Vec3(0, 1, 0);
  public static readonly down = (): Vec3 => new Vec3(0, -1, 0);
  public static readonly left = (): Vec3 => new Vec3(-1, 0, 0);
  public static readonly right = (): Vec3 => new Vec3(1, 0, 0);
  public static readonly forward = (): Vec3 => new Vec3(0, 0, -1);
  public static readonly back = (): Vec3 => new Vec3(0, 0, 1);

  /** Build from a structural vector or tuple. */
  public static from(value: Vec3Like | Vec3Tuple): Vec3 {
    if (Array.isArray(value)) {
      const tuple = value as Vec3Tuple;
      return new Vec3(tuple[0], tuple[1], tuple[2]);
    }
    const vector = value as Vec3Like;
    return new Vec3(vector.x, vector.y, vector.z);
  }

  public static add(a: Vec3Like, b: Vec3Like): Vec3 {
    return new Vec3(a.x + b.x, a.y + b.y, a.z + b.z);
  }

  public static sub(a: Vec3Like, b: Vec3Like): Vec3 {
    return new Vec3(a.x - b.x, a.y - b.y, a.z - b.z);
  }

  public static mul(a: Vec3Like, b: Vec3Like): Vec3 {
    return new Vec3(a.x * b.x, a.y * b.y, a.z * b.z);
  }

  public static scale(v: Vec3Like, scalar: number): Vec3 {
    return new Vec3(v.x * scalar, v.y * scalar, v.z * scalar);
  }

  public static dot(a: Vec3Like, b: Vec3Like): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }

  public static cross(a: Vec3Like, b: Vec3Like): Vec3 {
    return new Vec3(
      a.y * b.z - a.z * b.y,
      a.z * b.x - a.x * b.z,
      a.x * b.y - a.y * b.x,
    );
  }

  public static distance(a: Vec3Like, b: Vec3Like): number {
    return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
  }

  public static distanceSq(a: Vec3Like, b: Vec3Like): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return dx * dx + dy * dy + dz * dz;
  }

  public static lerp(a: Vec3Like, b: Vec3Like, t: number): Vec3 {
    return new Vec3(
      a.x + (b.x - a.x) * t,
      a.y + (b.y - a.y) * t,
      a.z + (b.z - a.z) * t,
    );
  }

  public static min(a: Vec3Like, b: Vec3Like): Vec3 {
    return new Vec3(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.min(a.z, b.z));
  }

  public static max(a: Vec3Like, b: Vec3Like): Vec3 {
    return new Vec3(Math.max(a.x, b.x), Math.max(a.y, b.y), Math.max(a.z, b.z));
  }

  public static isFinite(v: Vec3Like): boolean {
    return Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.z);
  }

  public set(x: number, y: number, z: number): this {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  public setFrom(v: Vec3Like): this {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }

  public copy(v: Vec3Like): this {
    return this.setFrom(v);
  }

  public clone(): Vec3 {
    return new Vec3(this.x, this.y, this.z);
  }

  public add(v: Vec3Like): this {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }

  public addScaled(v: Vec3Like, scalar: number): this {
    this.x += v.x * scalar;
    this.y += v.y * scalar;
    this.z += v.z * scalar;
    return this;
  }

  public sub(v: Vec3Like): this {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }

  public mul(v: Vec3Like): this {
    this.x *= v.x;
    this.y *= v.y;
    this.z *= v.z;
    return this;
  }

  public mulScalar(scalar: number): this {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
    return this;
  }

  public divideScalar(scalar: number): this {
    const inv = Math.abs(scalar) < EPSILON ? 0 : 1 / scalar;
    this.x *= inv;
    this.y *= inv;
    this.z *= inv;
    return this;
  }

  public negate(): this {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
    return this;
  }

  public abs(): this {
    this.x = Math.abs(this.x);
    this.y = Math.abs(this.y);
    this.z = Math.abs(this.z);
    return this;
  }

  public floor(): this {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    this.z = Math.floor(this.z);
    return this;
  }

  public min(v: Vec3Like): this {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);
    this.z = Math.min(this.z, v.z);
    return this;
  }

  public max(v: Vec3Like): this {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);
    this.z = Math.max(this.z, v.z);
    return this;
  }

  public lengthSq(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  public length(): number {
    return Math.hypot(this.x, this.y, this.z);
  }

  public normalize(): this {
    const len = this.length();
    return len < EPSILON ? this.set(0, 0, 0) : this.mulScalar(1 / len);
  }

  public normalized(): Vec3 {
    return this.clone().normalize();
  }

  public dot(v: Vec3Like): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  public cross(v: Vec3Like): this {
    const { x, y, z } = this;
    this.x = y * v.z - z * v.y;
    this.y = z * v.x - x * v.z;
    this.z = x * v.y - y * v.x;
    return this;
  }

  public crossOf(a: Vec3Like, b: Vec3Like): this {
    this.x = a.y * b.z - a.z * b.y;
    this.y = a.z * b.x - a.x * b.z;
    this.z = a.x * b.y - a.y * b.x;
    return this;
  }

  public distanceTo(v: Vec3Like): number {
    return Math.hypot(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  public distanceSqTo(v: Vec3Like): number {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    const dz = this.z - v.z;
    return dx * dx + dy * dy + dz * dz;
  }

  public lerp(v: Vec3Like, t: number): this {
    this.x += (v.x - this.x) * t;
    this.y += (v.y - this.y) * t;
    this.z += (v.z - this.z) * t;
    return this;
  }

  /** Rotate this vector by a unit quaternion. */
  public applyQuat(q: QuatLike): this {
    const ix = q.w * this.x + q.y * this.z - q.z * this.y;
    const iy = q.w * this.y + q.z * this.x - q.x * this.z;
    const iz = q.w * this.z + q.x * this.y - q.y * this.x;
    const iw = -q.x * this.x - q.y * this.y - q.z * this.z;

    this.x = ix * q.w + iw * -q.x + iy * -q.z - iz * -q.y;
    this.y = iy * q.w + iw * -q.y + iz * -q.x - ix * -q.z;
    this.z = iz * q.w + iw * -q.z + ix * -q.y - iy * -q.x;
    return this;
  }

  public equals(v: Vec3Like, tolerance = EPSILON): boolean {
    return Math.abs(this.x - v.x) <= tolerance
      && Math.abs(this.y - v.y) <= tolerance
      && Math.abs(this.z - v.z) <= tolerance;
  }

  public toArray(): [number, number, number] {
    return [this.x, this.y, this.z];
  }

  public toJSON(): Vec3Like {
    return { x: this.x, y: this.y, z: this.z };
  }
}

/** Mutable quaternion used for OBB orientation and transform composition. */
export class Quat implements QuatLike {
  public x: number;
  public y: number;
  public z: number;
  public w: number;

  constructor(x = 0, y = 0, z = 0, w = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  public static identity(): Quat {
    return new Quat(0, 0, 0, 1);
  }

  public static from(value: QuatLike): Quat {
    return new Quat(value.x, value.y, value.z, value.w);
  }

  public static fromAxisAngle(axis: Vec3Like, radians: number): Quat {
    const half = radians * 0.5;
    const sin = Math.sin(half);
    const len = Math.hypot(axis.x, axis.y, axis.z);
    if (len < EPSILON) return Quat.identity();
    return new Quat(
      (axis.x / len) * sin,
      (axis.y / len) * sin,
      (axis.z / len) * sin,
      Math.cos(half),
    );
  }

  /** Compose intrinsic Euler rotation in XYZ order (radians). */
  public static fromEuler(x: number, y: number, z: number): Quat {
    const cx = Math.cos(x * 0.5);
    const sx = Math.sin(x * 0.5);
    const cy = Math.cos(y * 0.5);
    const sy = Math.sin(y * 0.5);
    const cz = Math.cos(z * 0.5);
    const sz = Math.sin(z * 0.5);

    return new Quat(
      sx * cy * cz + cx * sy * sz,
      cx * sy * cz - sx * cy * sz,
      cx * cy * sz + sx * sy * cz,
      cx * cy * cz - sx * sy * sz,
    );
  }

  public set(x: number, y: number, z: number, w: number): this {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    return this;
  }

  public copy(q: QuatLike): this {
    return this.set(q.x, q.y, q.z, q.w);
  }

  public clone(): Quat {
    return new Quat(this.x, this.y, this.z, this.w);
  }

  public setFromAxisAngle(axis: Vec3Like, radians: number): this {
    const q = Quat.fromAxisAngle(axis, radians);
    return this.copy(q);
  }

  public setFromEuler(x: number, y: number, z: number): this {
    return this.copy(Quat.fromEuler(x, y, z));
  }

  public lengthSq(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
  }

  public normalize(): this {
    const len = Math.sqrt(this.lengthSq());
    if (len < EPSILON) return this.set(0, 0, 0, 1);
    const inv = 1 / len;
    this.x *= inv;
    this.y *= inv;
    this.z *= inv;
    this.w *= inv;
    return this;
  }

  public conjugate(): this {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
    return this;
  }

  /** Hamilton product of `a * b` (apply `b` first, then `a`). */
  public multiply(a: QuatLike, b: QuatLike): this {
    const ax = a.x, ay = a.y, az = a.z, aw = a.w;
    const bx = b.x, by = b.y, bz = b.z, bw = b.w;
    this.x = aw * bx + ax * bw + ay * bz - az * by;
    this.y = aw * by - ax * bz + ay * bw + az * bx;
    this.z = aw * bz + ax * by - ay * bx + az * bw;
    this.w = aw * bw - ax * bx - ay * by - az * bz;
    return this;
  }

  public rotate(v: Vec3Like): Vec3 {
    return Vec3.from(v).applyQuat(this);
  }

  public toArray(): [number, number, number, number] {
    return [this.x, this.y, this.z, this.w];
  }
}

/**
 * Column-major 4x4 matrix. Elements match WebGL / `three` ordering:
 * `m[column * 4 + row]`.
 */
export class Mat4 {
  public elements: Float64Array;

  constructor(elements?: ArrayLike<number>) {
    this.elements = new Float64Array(16);
    if (elements) {
      for (let i = 0; i < 16; i += 1) this.elements[i] = elements[i] ?? 0;
    } else {
      this.elements[0] = 1;
      this.elements[5] = 1;
      this.elements[10] = 1;
      this.elements[15] = 1;
    }
  }

  public static identity(): Mat4 {
    return new Mat4();
  }

  public static translation(x: number, y: number, z: number): Mat4 {
    const m = new Mat4();
    m.elements[12] = x;
    m.elements[13] = y;
    m.elements[14] = z;
    return m;
  }

  public static scaling(x: number, y: number, z: number): Mat4 {
    const m = new Mat4();
    m.elements[0] = x;
    m.elements[5] = y;
    m.elements[10] = z;
    return m;
  }

  public static fromQuat(q: QuatLike): Mat4 {
    const { x, y, z, w } = q;
    const x2 = x + x, y2 = y + y, z2 = z + z;
    const xx = x * x2, xy = x * y2, xz = x * z2;
    const yy = y * y2, yz = y * z2, zz = z * z2;
    const wx = w * x2, wy = w * y2, wz = w * z2;

    const m = new Mat4();
    const e = m.elements;
    e[0] = 1 - (yy + zz); e[4] = xy - wz; e[8] = xz + wy;
    e[1] = xy + wz; e[5] = 1 - (xx + zz); e[9] = yz - wx;
    e[2] = xz - wy; e[6] = yz + wx; e[10] = 1 - (xx + yy);
    return m;
  }

  /** Compose translation * rotation * scale. */
  public static compose(position: Vec3Like, orientation: QuatLike, scale: Vec3Like): Mat4 {
    const m = Mat4.fromQuat(orientation);
    const e = m.elements;
    e[0] *= scale.x; e[1] *= scale.x; e[2] *= scale.x;
    e[4] *= scale.y; e[5] *= scale.y; e[6] *= scale.y;
    e[8] *= scale.z; e[9] *= scale.z; e[10] *= scale.z;
    e[12] = position.x; e[13] = position.y; e[14] = position.z;
    return m;
  }

  public clone(): Mat4 {
    return new Mat4(this.elements);
  }

  public multiply(b: Mat4): Mat4 {
    return Mat4.multiply(this, b);
  }

  public static multiply(a: Mat4, b: Mat4): Mat4 {
    const out = new Mat4();
    const ae = a.elements;
    const be = b.elements;
    const oe = out.elements;
    for (let col = 0; col < 4; col += 1) {
      for (let row = 0; row < 4; row += 1) {
        let sum = 0;
        for (let k = 0; k < 4; k += 1) {
          sum += ae[k * 4 + row] * be[col * 4 + k];
        }
        oe[col * 4 + row] = sum;
      }
    }
    return out;
  }

  public transformPoint(v: Vec3Like): Vec3 {
    const e = this.elements;
    const x = v.x, y = v.y, z = v.z;
    const w = e[3] * x + e[7] * y + e[11] * z + e[15];
    const invW = Math.abs(w) < EPSILON ? 0 : 1 / w;
    return new Vec3(
      (e[0] * x + e[4] * y + e[8] * z + e[12]) * invW,
      (e[1] * x + e[5] * y + e[9] * z + e[13]) * invW,
      (e[2] * x + e[6] * y + e[10] * z + e[14]) * invW,
    );
  }

  public transformDirection(v: Vec3Like): Vec3 {
    const e = this.elements;
    return new Vec3(
      e[0] * v.x + e[4] * v.y + e[8] * v.z,
      e[1] * v.x + e[5] * v.y + e[9] * v.z,
      e[2] * v.x + e[6] * v.y + e[10] * v.z,
    );
  }

  public transpose(): Mat4 {
    const m = new Mat4();
    for (let col = 0; col < 4; col += 1) {
      for (let row = 0; row < 4; row += 1) {
        m.elements[col * 4 + row] = this.elements[row * 4 + col];
      }
    }
    return m;
  }

  public determinant(): number {
    const e = this.elements;
    const b00 = e[0] * e[5] - e[1] * e[4];
    const b01 = e[0] * e[6] - e[2] * e[4];
    const b02 = e[0] * e[7] - e[3] * e[4];
    const b03 = e[1] * e[6] - e[2] * e[5];
    const b04 = e[1] * e[7] - e[3] * e[5];
    const b05 = e[2] * e[7] - e[3] * e[6];
    const b06 = e[8] * e[13] - e[9] * e[12];
    const b07 = e[8] * e[14] - e[10] * e[12];
    const b08 = e[8] * e[15] - e[11] * e[12];
    const b09 = e[9] * e[14] - e[10] * e[13];
    const b10 = e[9] * e[15] - e[11] * e[13];
    const b11 = e[10] * e[15] - e[11] * e[14];
    return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  }

  public invert(): Mat4 {
    const e = this.elements;
    const out = new Float64Array(16);

    out[0] = e[5] * e[10] * e[15] - e[5] * e[11] * e[14] - e[9] * e[6] * e[15]
      + e[9] * e[7] * e[14] + e[13] * e[6] * e[11] - e[13] * e[7] * e[10];
    out[4] = -e[4] * e[10] * e[15] + e[4] * e[11] * e[14] + e[8] * e[6] * e[15]
      - e[8] * e[7] * e[14] - e[12] * e[6] * e[11] + e[12] * e[7] * e[10];
    out[8] = e[4] * e[9] * e[15] - e[4] * e[11] * e[13] - e[8] * e[5] * e[15]
      + e[8] * e[7] * e[13] + e[12] * e[5] * e[11] - e[12] * e[7] * e[9];
    out[12] = -e[4] * e[9] * e[14] + e[4] * e[10] * e[13] + e[8] * e[5] * e[14]
      - e[8] * e[6] * e[13] - e[12] * e[5] * e[10] + e[12] * e[6] * e[9];

    out[1] = -e[1] * e[10] * e[15] + e[1] * e[11] * e[14] + e[9] * e[2] * e[15]
      - e[9] * e[3] * e[14] - e[13] * e[2] * e[11] + e[13] * e[3] * e[10];
    out[5] = e[0] * e[10] * e[15] - e[0] * e[11] * e[14] - e[8] * e[2] * e[15]
      + e[8] * e[3] * e[14] + e[12] * e[2] * e[11] - e[12] * e[3] * e[10];
    out[9] = -e[0] * e[9] * e[15] + e[0] * e[11] * e[13] + e[8] * e[1] * e[15]
      - e[8] * e[3] * e[13] - e[12] * e[1] * e[11] + e[12] * e[3] * e[9];
    out[13] = e[0] * e[9] * e[14] - e[0] * e[10] * e[13] - e[8] * e[1] * e[14]
      + e[8] * e[2] * e[13] + e[12] * e[1] * e[10] - e[12] * e[2] * e[9];

    out[2] = e[1] * e[6] * e[15] - e[1] * e[7] * e[14] - e[5] * e[2] * e[15]
      + e[5] * e[3] * e[14] + e[13] * e[2] * e[7] - e[13] * e[3] * e[6];
    out[6] = -e[0] * e[6] * e[15] + e[0] * e[7] * e[14] + e[4] * e[2] * e[15]
      - e[4] * e[3] * e[14] - e[12] * e[2] * e[7] + e[12] * e[3] * e[6];
    out[10] = e[0] * e[5] * e[15] - e[0] * e[7] * e[13] - e[4] * e[1] * e[15]
      + e[4] * e[3] * e[13] + e[12] * e[1] * e[7] - e[12] * e[3] * e[5];
    out[14] = -e[0] * e[5] * e[14] + e[0] * e[6] * e[13] + e[4] * e[1] * e[14]
      - e[4] * e[2] * e[13] - e[12] * e[1] * e[6] + e[12] * e[2] * e[5];

    out[3] = -e[1] * e[6] * e[11] + e[1] * e[7] * e[10] + e[5] * e[2] * e[11]
      - e[5] * e[3] * e[10] - e[9] * e[2] * e[7] + e[9] * e[3] * e[6];
    out[7] = e[0] * e[6] * e[11] - e[0] * e[7] * e[10] - e[4] * e[2] * e[11]
      + e[4] * e[3] * e[10] + e[8] * e[2] * e[7] - e[8] * e[3] * e[6];
    out[11] = -e[0] * e[5] * e[11] + e[0] * e[7] * e[9] + e[4] * e[1] * e[11]
      - e[4] * e[3] * e[9] - e[8] * e[1] * e[7] + e[8] * e[3] * e[5];
    out[15] = e[0] * e[5] * e[10] - e[0] * e[6] * e[9] - e[4] * e[1] * e[10]
      + e[4] * e[2] * e[9] + e[8] * e[1] * e[6] - e[8] * e[2] * e[5];

    const det = this.determinant();
    if (Math.abs(det) < EPSILON) return Mat4.identity();
    const invDet = 1 / det;
    for (let i = 0; i < 16; i += 1) out[i] *= invDet;
    return new Mat4(out);
  }

  public toArray(): number[] {
    return Array.from(this.elements);
  }
}

/**
 * Closest point on segment `[a, b]` to point `p`.
 * Writes into `out` when supplied, otherwise returns a new vector.
 */
export function closestPointOnSegment(p: Vec3Like, a: Vec3Like, b: Vec3Like, out?: Vec3): Vec3 {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const abz = b.z - a.z;
  const lenSq = abx * abx + aby * aby + abz * abz;
  const target = out ?? new Vec3();
  if (lenSq < EPSILON_SQ) return target.set(a.x, a.y, a.z);

  let t = ((p.x - a.x) * abx + (p.y - a.y) * aby + (p.z - a.z) * abz) / lenSq;
  t = clamp(t, 0, 1);
  return target.set(a.x + abx * t, a.y + aby * t, a.z + abz * t);
}

/** Squared distance between two segments. */
export function segmentDistanceSq(
  p1: Vec3Like, q1: Vec3Like,
  p2: Vec3Like, q2: Vec3Like,
): number {
  const d1 = Vec3.sub(q1, p1);
  const d2 = Vec3.sub(q2, p2);
  const r = Vec3.sub(p1, p2);
  const a = Vec3.dot(d1, d1);
  const e = Vec3.dot(d2, d2);
  const f = Vec3.dot(d2, r);
  let s: number;
  let t: number;

  if (a <= EPSILON_SQ && e <= EPSILON_SQ) return Vec3.distanceSq(p1, p2);
  if (a <= EPSILON_SQ) {
    s = 0;
    t = clamp(f / e, 0, 1);
  } else {
    const c = Vec3.dot(d1, r);
    if (e <= EPSILON_SQ) {
      t = 0;
      s = clamp(-c / a, 0, 1);
    } else {
      const b = Vec3.dot(d1, d2);
      const denom = a * e - b * b;
      s = denom !== 0 ? clamp((b * f - c * e) / denom, 0, 1) : 0;
      t = (b * s + f) / e;
      if (t < 0) {
        t = 0;
        s = clamp(-c / a, 0, 1);
      } else if (t > 1) {
        t = 1;
        s = clamp((b - c) / a, 0, 1);
      }
    }
  }

  const c1 = new Vec3(p1.x + d1.x * s, p1.y + d1.y * s, p1.z + d1.z * s);
  const c2 = new Vec3(p2.x + d2.x * t, p2.y + d2.y * t, p2.z + d2.z * t);
  return Vec3.distanceSq(c1, c2);
}

/** Closest points between two segments. */
export function closestPointsBetweenSegments(
  p1: Vec3Like, q1: Vec3Like,
  p2: Vec3Like, q2: Vec3Like,
): { c1: Vec3; c2: Vec3; distance: number } {
  const d1 = Vec3.sub(q1, p1);
  const d2 = Vec3.sub(q2, p2);
  const r = Vec3.sub(p1, p2);
  const a = Vec3.dot(d1, d1);
  const e = Vec3.dot(d2, d2);
  const f = Vec3.dot(d2, r);
  let s = 0;
  let t = 0;

  if (a > EPSILON_SQ || e > EPSILON_SQ) {
    if (a <= EPSILON_SQ) {
      t = clamp(f / e, 0, 1);
    } else {
      const c = Vec3.dot(d1, r);
      if (e <= EPSILON_SQ) {
        s = clamp(-c / a, 0, 1);
      } else {
        const b = Vec3.dot(d1, d2);
        const denom = a * e - b * b;
        s = denom !== 0 ? clamp((b * f - c * e) / denom, 0, 1) : 0;
        t = (b * s + f) / e;
        if (t < 0) {
          t = 0;
          s = clamp(-c / a, 0, 1);
        } else if (t > 1) {
          t = 1;
          s = clamp((b - c) / a, 0, 1);
        }
      }
    }
  }

  const c1 = new Vec3(p1.x + d1.x * s, p1.y + d1.y * s, p1.z + d1.z * s);
  const c2 = new Vec3(p2.x + d2.x * t, p2.y + d2.y * t, p2.z + d2.z * t);
  return { c1, c2, distance: Vec3.distance(c1, c2) };
}

/** Distance from a point to an axis-aligned box described by min/max. */
export function pointAABBDistanceSq(p: Vec3Like, min: Vec3Like, max: Vec3Like): number {
  const dx = Math.max(min.x - p.x, 0, p.x - max.x);
  const dy = Math.max(min.y - p.y, 0, p.y - max.y);
  const dz = Math.max(min.z - p.z, 0, p.z - max.z);
  return dx * dx + dy * dy + dz * dz;
}

/** Closest point on an axis-aligned box to `p`. */
export function closestPointOnAABB(p: Vec3Like, min: Vec3Like, max: Vec3Like, out = new Vec3()): Vec3 {
  return out.set(
    clamp(p.x, min.x, max.x),
    clamp(p.y, min.y, max.y),
    clamp(p.z, min.z, max.z),
  );
}

/** Squared distance between two axis-aligned boxes (0 when overlapping). */
export function AABBDistanceSq(aMin: Vec3Like, aMax: Vec3Like, bMin: Vec3Like, bMax: Vec3Like): number {
  const dx = Math.max(aMin.x - bMax.x, 0, bMin.x - aMax.x);
  const dy = Math.max(aMin.y - bMax.y, 0, bMin.y - aMax.y);
  const dz = Math.max(aMin.z - bMax.z, 0, bMin.z - aMax.z);
  return dx * dx + dy * dy + dz * dz;
}
