/**
 * @file matrix-core.ts
 * @module @aetheria/engine/render/interop/matrix-core
 * @description Lõi dùng chung cho ma trận per-library (sinh bởi
 * `scripts/generate-interop-matrix.mjs`): quy ước hệ trục/tay/đơn vị của từng
 * thư viện, chuyển đổi tọa độ, kiểm tra payload và dựng component trung gian.
 * Các hàm sinh ra ủy quyền vào đây nên chỉnh sửa tập trung tại một chỗ.
 */

import { clampRange } from '../../deeplearning/random.js';

/** Quy ước hệ trục của một thư viện đồ họa. */
export interface CoordinateConvention {
  /** Trục hướng lên. */
  upAxis: 'y' | 'z';
  /** Tay hệ trục. */
  handedness: 'left' | 'right';
  /** Hệ số đơn vị (nhân để đổi từ mét của engine sang đơn vị thư viện). */
  unitScale: number;
}

/** Đổi một vector vị trí từ quy ước engine (Y-up, RH, mét) sang thư viện. */
export function convertPositionToLibrary(
  position: readonly number[],
  convention: CoordinateConvention,
): number[] {
  let [x, y, z] = [position[0] ?? 0, position[1] ?? 0, position[2] ?? 0];
  if (convention.upAxis === 'z') {
    // Engine Y-up → thư viện Z-up: hoán y/z và đổi dấu để giữ hướng lên.
    [y, z] = [z, -y];
  }
  if (convention.handedness === 'left') {
    // Đổi tay: lật trục z.
    z = -z;
  }
  return [x * convention.unitScale, y * convention.unitScale, z * convention.unitScale];
}

/** Đổi ngược vị trí từ quy ước thư viện về engine (Y-up, RH, mét). */
export function convertPositionFromLibrary(
  position: readonly number[],
  convention: CoordinateConvention,
): number[] {
  let [x, y, z] = [
    (position[0] ?? 0) / convention.unitScale,
    (position[1] ?? 0) / convention.unitScale,
    (position[2] ?? 0) / convention.unitScale,
  ];
  if (convention.handedness === 'left') z = -z;
  if (convention.upAxis === 'z') [y, z] = [-z, y];
  return [x, y, z];
}

/** Đổi quaternion theo tay hệ trục (lật z/w khi chuyển RH↔LH). */
export function convertQuaternionToLibrary(
  quaternion: readonly number[],
  convention: CoordinateConvention,
): number[] {
  const [x, y, z, w] = quaternion;
  if (convention.handedness === 'left') return [x, y, -z, -w];
  if (convention.upAxis === 'z') return [x, -z, y, w];
  return [x, y, z, w];
}

/** Đổi vector scale (chỉ nhân đơn vị). */
export function convertScaleToLibrary(scale: readonly number[], unitScale: number): number[] {
  return scale.map((value) => value * unitScale);
}

/** Kiểm tra payload JSON có đủ các khóa bắt buộc (top-level) hay không. */
export function validatePayloadKeys(
  payload: unknown,
  requiredKeys: readonly string[],
): boolean {
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) return false;
  const record = payload as Record<string, unknown>;
  return requiredKeys.every((key) => key in record);
}

/** Kiểm tra danh sách descriptor mesh trung gian (dùng cho validator sinh ra). */
export function validateMeshList(meshes: unknown): boolean {
  if (!Array.isArray(meshes)) return false;
  return meshes.every((mesh) => {
    if (typeof mesh !== 'object' || mesh === null) return false;
    const record = mesh as Record<string, unknown>;
    return typeof record.id === 'string' && typeof record.geometry === 'object';
  });
}

/** Kiểm tra descriptor ánh sáng trung gian. */
export function validateLightList(lights: unknown): boolean {
  if (!Array.isArray(lights)) return false;
  return lights.every((light) => {
    if (typeof light !== 'object' || light === null) return false;
    const record = light as Record<string, unknown>;
    return typeof record.kind === 'string' && typeof record.intensity === 'number';
  });
}

/** Kiểm tra descriptor camera trung gian. */
export function validateCameraDescriptor(camera: unknown): boolean {
  if (typeof camera !== 'object' || camera === null) return false;
  const record = camera as Record<string, unknown>;
  return typeof record.fov === 'number' && typeof record.near === 'number' && typeof record.far === 'number';
}

/** Dựng component trung gian theo "style" của thư viện (khóa trường đổi tên). */
export function buildStyledComponent(
  kind: string,
  data: Record<string, unknown>,
  fieldStyle: Readonly<Record<string, string>>,
): Record<string, unknown> {
  const result: Record<string, unknown> = { component: kind };
  for (const [key, value] of Object.entries(data)) {
    result[fieldStyle[key] ?? key] = value;
  }
  return result;
}

/** Gói payload animation + scene cho một library id (facade dùng chung). */
export function combineExports(
  scenePayload: unknown,
  animationPayload: unknown | null,
): Record<string, unknown> {
  return animationPayload === null
    ? { scene: scenePayload }
    : { scene: scenePayload, animation: animationPayload };
}

/** Kẹp giá trị mẫu keyframe trước khi đóng gói (an toàn số học). */
export function sanitizeSample(value: number): number {
  return Number.isFinite(value) ? clampRange(value, -1e9, 1e9) : 0;
}

/** Quy ước ánh xạ tên event gameplay → tên event của thư viện (prefix). */
export function mapEventNameToLibrary(name: string, prefix: string): string {
  return `${prefix}:${name}`;
}

/** Đảo ngược ánh xạ event (bỏ prefix nếu khớp). */
export function mapEventNameFromLibrary(name: string, prefix: string): string {
  return name.startsWith(`${prefix}:`) ? name.slice(prefix.length + 1) : name;
}
