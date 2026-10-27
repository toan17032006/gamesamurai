/**
 * @file generated-runtime-bindings.ts
 * @module @aetheria/engine/render/interop/generated
 * @description SINH TỰ ĐỘNG bởi `scripts/generate-interop-matrix.mjs` — KHÔNG
 * sửa tay. Mỗi hàm ủy quyền vào `matrix-core.ts` / `animation`; quy ước riêng
 * của từng thư viện (trục lên, tay hệ trục, đơn vị, prefix event) lấy từ bảng
 * trong script. Chạy lại script sau khi đổi bảng hoặc core.
 */
import {
  sanitizeSample,
  mapEventNameToLibrary,
} from '../matrix-core.js';


/** [Three.js] Gắn track scalar: giữ giá trị gần nhất cho tầng render. */
export function bindThreeScalarTrack(samples: ReadonlyArray<{ time: number; value: number }>): { read(time: number): number } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number {
      let value = sorted.length > 0 ? sorted[0].value : 0;
      for (const sample of sorted) {
        if (sample.time <= time) value = sanitizeSample(sample.value);
        else break;
      }
      return value;
    },
  };
}

/** [Three.js] Gắn track vector: nội suy tuyến tính giữa hai mẫu. */
export function bindThreeVectorTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number[] {
      if (sorted.length === 0) return [];
      if (time <= sorted[0].time) return [...sorted[0].value];
      for (let i = 0; i < sorted.length - 1; i++) {
        const a = sorted[i];
        const b = sorted[i + 1];
        if (time >= a.time && time <= b.time) {
          const span = Math.max(b.time - a.time, 1e-9);
          const alpha = (time - a.time) / span;
          return a.value.map((value, index) => value + ((b.value[index] ?? value) - value) * alpha);
        }
      }
      return [...sorted[sorted.length - 1].value];
    },
  };
}

/** [Three.js] Gắn track quaternion: nlerp giữa hai mẫu. */
export function bindThreeQuaternionTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const vectorBinding = bindThreeVectorTrack(samples);
  return {
    read(time: number): number[] {
      const values = vectorBinding.read(time);
      const length = Math.hypot(...values) || 1;
      return values.map((value) => value / length);
    },
  };
}

/** [Three.js] Gắn pose vào target: áp danh sách binding theo thời gian. */
export function bindThreePoseToTarget(
  bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>,
  time: number,
): Record<string, number[]> {
  const result: Record<string, number[]> = {};
  for (const binding of bindings) {
    result[binding.targetPath] = bindThreeVectorTrack(binding.samples).read(time);
  }
  return result;
}

/** [Three.js] Tạo player runtime tối thiểu (clock + bindings). */
export function createThreeRuntimePlayer(bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>): { update(dt: number): Record<string, number[]> } {
  let time = 0;
  return {
    update(dt: number): Record<string, number[]> {
      time += Math.max(0, dt);
      return bindThreePoseToTarget(bindings, time);
    },
  };
}

/** [Three.js] Ánh xạ tên event gameplay sang tên event thư viện. */
export function mapThreeEventName(name: string): string {
  return mapEventNameToLibrary(name, 'three');
}

/** [Babylon.js] Gắn track scalar: giữ giá trị gần nhất cho tầng render. */
export function bindBabylonScalarTrack(samples: ReadonlyArray<{ time: number; value: number }>): { read(time: number): number } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number {
      let value = sorted.length > 0 ? sorted[0].value : 0;
      for (const sample of sorted) {
        if (sample.time <= time) value = sanitizeSample(sample.value);
        else break;
      }
      return value;
    },
  };
}

/** [Babylon.js] Gắn track vector: nội suy tuyến tính giữa hai mẫu. */
export function bindBabylonVectorTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number[] {
      if (sorted.length === 0) return [];
      if (time <= sorted[0].time) return [...sorted[0].value];
      for (let i = 0; i < sorted.length - 1; i++) {
        const a = sorted[i];
        const b = sorted[i + 1];
        if (time >= a.time && time <= b.time) {
          const span = Math.max(b.time - a.time, 1e-9);
          const alpha = (time - a.time) / span;
          return a.value.map((value, index) => value + ((b.value[index] ?? value) - value) * alpha);
        }
      }
      return [...sorted[sorted.length - 1].value];
    },
  };
}

/** [Babylon.js] Gắn track quaternion: nlerp giữa hai mẫu. */
export function bindBabylonQuaternionTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const vectorBinding = bindBabylonVectorTrack(samples);
  return {
    read(time: number): number[] {
      const values = vectorBinding.read(time);
      const length = Math.hypot(...values) || 1;
      return values.map((value) => value / length);
    },
  };
}

/** [Babylon.js] Gắn pose vào target: áp danh sách binding theo thời gian. */
export function bindBabylonPoseToTarget(
  bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>,
  time: number,
): Record<string, number[]> {
  const result: Record<string, number[]> = {};
  for (const binding of bindings) {
    result[binding.targetPath] = bindBabylonVectorTrack(binding.samples).read(time);
  }
  return result;
}

/** [Babylon.js] Tạo player runtime tối thiểu (clock + bindings). */
export function createBabylonRuntimePlayer(bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>): { update(dt: number): Record<string, number[]> } {
  let time = 0;
  return {
    update(dt: number): Record<string, number[]> {
      time += Math.max(0, dt);
      return bindBabylonPoseToTarget(bindings, time);
    },
  };
}

/** [Babylon.js] Ánh xạ tên event gameplay sang tên event thư viện. */
export function mapBabylonEventName(name: string): string {
  return mapEventNameToLibrary(name, 'babylon');
}

/** [Babylon Native] Gắn track scalar: giữ giá trị gần nhất cho tầng render. */
export function bindBabylonNativeScalarTrack(samples: ReadonlyArray<{ time: number; value: number }>): { read(time: number): number } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number {
      let value = sorted.length > 0 ? sorted[0].value : 0;
      for (const sample of sorted) {
        if (sample.time <= time) value = sanitizeSample(sample.value);
        else break;
      }
      return value;
    },
  };
}

/** [Babylon Native] Gắn track vector: nội suy tuyến tính giữa hai mẫu. */
export function bindBabylonNativeVectorTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number[] {
      if (sorted.length === 0) return [];
      if (time <= sorted[0].time) return [...sorted[0].value];
      for (let i = 0; i < sorted.length - 1; i++) {
        const a = sorted[i];
        const b = sorted[i + 1];
        if (time >= a.time && time <= b.time) {
          const span = Math.max(b.time - a.time, 1e-9);
          const alpha = (time - a.time) / span;
          return a.value.map((value, index) => value + ((b.value[index] ?? value) - value) * alpha);
        }
      }
      return [...sorted[sorted.length - 1].value];
    },
  };
}

/** [Babylon Native] Gắn track quaternion: nlerp giữa hai mẫu. */
export function bindBabylonNativeQuaternionTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const vectorBinding = bindBabylonNativeVectorTrack(samples);
  return {
    read(time: number): number[] {
      const values = vectorBinding.read(time);
      const length = Math.hypot(...values) || 1;
      return values.map((value) => value / length);
    },
  };
}

/** [Babylon Native] Gắn pose vào target: áp danh sách binding theo thời gian. */
export function bindBabylonNativePoseToTarget(
  bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>,
  time: number,
): Record<string, number[]> {
  const result: Record<string, number[]> = {};
  for (const binding of bindings) {
    result[binding.targetPath] = bindBabylonNativeVectorTrack(binding.samples).read(time);
  }
  return result;
}

/** [Babylon Native] Tạo player runtime tối thiểu (clock + bindings). */
export function createBabylonNativeRuntimePlayer(bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>): { update(dt: number): Record<string, number[]> } {
  let time = 0;
  return {
    update(dt: number): Record<string, number[]> {
      time += Math.max(0, dt);
      return bindBabylonNativePoseToTarget(bindings, time);
    },
  };
}

/** [Babylon Native] Ánh xạ tên event gameplay sang tên event thư viện. */
export function mapBabylonNativeEventName(name: string): string {
  return mapEventNameToLibrary(name, 'bnative');
}

/** [PlayCanvas Engine] Gắn track scalar: giữ giá trị gần nhất cho tầng render. */
export function bindPlaycanvasScalarTrack(samples: ReadonlyArray<{ time: number; value: number }>): { read(time: number): number } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number {
      let value = sorted.length > 0 ? sorted[0].value : 0;
      for (const sample of sorted) {
        if (sample.time <= time) value = sanitizeSample(sample.value);
        else break;
      }
      return value;
    },
  };
}

/** [PlayCanvas Engine] Gắn track vector: nội suy tuyến tính giữa hai mẫu. */
export function bindPlaycanvasVectorTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number[] {
      if (sorted.length === 0) return [];
      if (time <= sorted[0].time) return [...sorted[0].value];
      for (let i = 0; i < sorted.length - 1; i++) {
        const a = sorted[i];
        const b = sorted[i + 1];
        if (time >= a.time && time <= b.time) {
          const span = Math.max(b.time - a.time, 1e-9);
          const alpha = (time - a.time) / span;
          return a.value.map((value, index) => value + ((b.value[index] ?? value) - value) * alpha);
        }
      }
      return [...sorted[sorted.length - 1].value];
    },
  };
}

/** [PlayCanvas Engine] Gắn track quaternion: nlerp giữa hai mẫu. */
export function bindPlaycanvasQuaternionTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const vectorBinding = bindPlaycanvasVectorTrack(samples);
  return {
    read(time: number): number[] {
      const values = vectorBinding.read(time);
      const length = Math.hypot(...values) || 1;
      return values.map((value) => value / length);
    },
  };
}

/** [PlayCanvas Engine] Gắn pose vào target: áp danh sách binding theo thời gian. */
export function bindPlaycanvasPoseToTarget(
  bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>,
  time: number,
): Record<string, number[]> {
  const result: Record<string, number[]> = {};
  for (const binding of bindings) {
    result[binding.targetPath] = bindPlaycanvasVectorTrack(binding.samples).read(time);
  }
  return result;
}

/** [PlayCanvas Engine] Tạo player runtime tối thiểu (clock + bindings). */
export function createPlaycanvasRuntimePlayer(bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>): { update(dt: number): Record<string, number[]> } {
  let time = 0;
  return {
    update(dt: number): Record<string, number[]> {
      time += Math.max(0, dt);
      return bindPlaycanvasPoseToTarget(bindings, time);
    },
  };
}

/** [PlayCanvas Engine] Ánh xạ tên event gameplay sang tên event thư viện. */
export function mapPlaycanvasEventName(name: string): string {
  return mapEventNameToLibrary(name, 'pc');
}

/** [Verge3D] Gắn track scalar: giữ giá trị gần nhất cho tầng render. */
export function bindVerge3dScalarTrack(samples: ReadonlyArray<{ time: number; value: number }>): { read(time: number): number } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number {
      let value = sorted.length > 0 ? sorted[0].value : 0;
      for (const sample of sorted) {
        if (sample.time <= time) value = sanitizeSample(sample.value);
        else break;
      }
      return value;
    },
  };
}

/** [Verge3D] Gắn track vector: nội suy tuyến tính giữa hai mẫu. */
export function bindVerge3dVectorTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number[] {
      if (sorted.length === 0) return [];
      if (time <= sorted[0].time) return [...sorted[0].value];
      for (let i = 0; i < sorted.length - 1; i++) {
        const a = sorted[i];
        const b = sorted[i + 1];
        if (time >= a.time && time <= b.time) {
          const span = Math.max(b.time - a.time, 1e-9);
          const alpha = (time - a.time) / span;
          return a.value.map((value, index) => value + ((b.value[index] ?? value) - value) * alpha);
        }
      }
      return [...sorted[sorted.length - 1].value];
    },
  };
}

/** [Verge3D] Gắn track quaternion: nlerp giữa hai mẫu. */
export function bindVerge3dQuaternionTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const vectorBinding = bindVerge3dVectorTrack(samples);
  return {
    read(time: number): number[] {
      const values = vectorBinding.read(time);
      const length = Math.hypot(...values) || 1;
      return values.map((value) => value / length);
    },
  };
}

/** [Verge3D] Gắn pose vào target: áp danh sách binding theo thời gian. */
export function bindVerge3dPoseToTarget(
  bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>,
  time: number,
): Record<string, number[]> {
  const result: Record<string, number[]> = {};
  for (const binding of bindings) {
    result[binding.targetPath] = bindVerge3dVectorTrack(binding.samples).read(time);
  }
  return result;
}

/** [Verge3D] Tạo player runtime tối thiểu (clock + bindings). */
export function createVerge3dRuntimePlayer(bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>): { update(dt: number): Record<string, number[]> } {
  let time = 0;
  return {
    update(dt: number): Record<string, number[]> {
      time += Math.max(0, dt);
      return bindVerge3dPoseToTarget(bindings, time);
    },
  };
}

/** [Verge3D] Ánh xạ tên event gameplay sang tên event thư viện. */
export function mapVerge3dEventName(name: string): string {
  return mapEventNameToLibrary(name, 'v3d');
}

/** [A-Frame] Gắn track scalar: giữ giá trị gần nhất cho tầng render. */
export function bindAframeScalarTrack(samples: ReadonlyArray<{ time: number; value: number }>): { read(time: number): number } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number {
      let value = sorted.length > 0 ? sorted[0].value : 0;
      for (const sample of sorted) {
        if (sample.time <= time) value = sanitizeSample(sample.value);
        else break;
      }
      return value;
    },
  };
}

/** [A-Frame] Gắn track vector: nội suy tuyến tính giữa hai mẫu. */
export function bindAframeVectorTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number[] {
      if (sorted.length === 0) return [];
      if (time <= sorted[0].time) return [...sorted[0].value];
      for (let i = 0; i < sorted.length - 1; i++) {
        const a = sorted[i];
        const b = sorted[i + 1];
        if (time >= a.time && time <= b.time) {
          const span = Math.max(b.time - a.time, 1e-9);
          const alpha = (time - a.time) / span;
          return a.value.map((value, index) => value + ((b.value[index] ?? value) - value) * alpha);
        }
      }
      return [...sorted[sorted.length - 1].value];
    },
  };
}

/** [A-Frame] Gắn track quaternion: nlerp giữa hai mẫu. */
export function bindAframeQuaternionTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const vectorBinding = bindAframeVectorTrack(samples);
  return {
    read(time: number): number[] {
      const values = vectorBinding.read(time);
      const length = Math.hypot(...values) || 1;
      return values.map((value) => value / length);
    },
  };
}

/** [A-Frame] Gắn pose vào target: áp danh sách binding theo thời gian. */
export function bindAframePoseToTarget(
  bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>,
  time: number,
): Record<string, number[]> {
  const result: Record<string, number[]> = {};
  for (const binding of bindings) {
    result[binding.targetPath] = bindAframeVectorTrack(binding.samples).read(time);
  }
  return result;
}

/** [A-Frame] Tạo player runtime tối thiểu (clock + bindings). */
export function createAframeRuntimePlayer(bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>): { update(dt: number): Record<string, number[]> } {
  let time = 0;
  return {
    update(dt: number): Record<string, number[]> {
      time += Math.max(0, dt);
      return bindAframePoseToTarget(bindings, time);
    },
  };
}

/** [A-Frame] Ánh xạ tên event gameplay sang tên event thư viện. */
export function mapAframeEventName(name: string): string {
  return mapEventNameToLibrary(name, 'aframe');
}

/** [React Three Fiber] Gắn track scalar: giữ giá trị gần nhất cho tầng render. */
export function bindR3fScalarTrack(samples: ReadonlyArray<{ time: number; value: number }>): { read(time: number): number } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number {
      let value = sorted.length > 0 ? sorted[0].value : 0;
      for (const sample of sorted) {
        if (sample.time <= time) value = sanitizeSample(sample.value);
        else break;
      }
      return value;
    },
  };
}

/** [React Three Fiber] Gắn track vector: nội suy tuyến tính giữa hai mẫu. */
export function bindR3fVectorTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number[] {
      if (sorted.length === 0) return [];
      if (time <= sorted[0].time) return [...sorted[0].value];
      for (let i = 0; i < sorted.length - 1; i++) {
        const a = sorted[i];
        const b = sorted[i + 1];
        if (time >= a.time && time <= b.time) {
          const span = Math.max(b.time - a.time, 1e-9);
          const alpha = (time - a.time) / span;
          return a.value.map((value, index) => value + ((b.value[index] ?? value) - value) * alpha);
        }
      }
      return [...sorted[sorted.length - 1].value];
    },
  };
}

/** [React Three Fiber] Gắn track quaternion: nlerp giữa hai mẫu. */
export function bindR3fQuaternionTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const vectorBinding = bindR3fVectorTrack(samples);
  return {
    read(time: number): number[] {
      const values = vectorBinding.read(time);
      const length = Math.hypot(...values) || 1;
      return values.map((value) => value / length);
    },
  };
}

/** [React Three Fiber] Gắn pose vào target: áp danh sách binding theo thời gian. */
export function bindR3fPoseToTarget(
  bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>,
  time: number,
): Record<string, number[]> {
  const result: Record<string, number[]> = {};
  for (const binding of bindings) {
    result[binding.targetPath] = bindR3fVectorTrack(binding.samples).read(time);
  }
  return result;
}

/** [React Three Fiber] Tạo player runtime tối thiểu (clock + bindings). */
export function createR3fRuntimePlayer(bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>): { update(dt: number): Record<string, number[]> } {
  let time = 0;
  return {
    update(dt: number): Record<string, number[]> {
      time += Math.max(0, dt);
      return bindR3fPoseToTarget(bindings, time);
    },
  };
}

/** [React Three Fiber] Ánh xạ tên event gameplay sang tên event thư viện. */
export function mapR3fEventName(name: string): string {
  return mapEventNameToLibrary(name, 'r3f');
}

/** [Threlte] Gắn track scalar: giữ giá trị gần nhất cho tầng render. */
export function bindThrelteScalarTrack(samples: ReadonlyArray<{ time: number; value: number }>): { read(time: number): number } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number {
      let value = sorted.length > 0 ? sorted[0].value : 0;
      for (const sample of sorted) {
        if (sample.time <= time) value = sanitizeSample(sample.value);
        else break;
      }
      return value;
    },
  };
}

/** [Threlte] Gắn track vector: nội suy tuyến tính giữa hai mẫu. */
export function bindThrelteVectorTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number[] {
      if (sorted.length === 0) return [];
      if (time <= sorted[0].time) return [...sorted[0].value];
      for (let i = 0; i < sorted.length - 1; i++) {
        const a = sorted[i];
        const b = sorted[i + 1];
        if (time >= a.time && time <= b.time) {
          const span = Math.max(b.time - a.time, 1e-9);
          const alpha = (time - a.time) / span;
          return a.value.map((value, index) => value + ((b.value[index] ?? value) - value) * alpha);
        }
      }
      return [...sorted[sorted.length - 1].value];
    },
  };
}

/** [Threlte] Gắn track quaternion: nlerp giữa hai mẫu. */
export function bindThrelteQuaternionTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const vectorBinding = bindThrelteVectorTrack(samples);
  return {
    read(time: number): number[] {
      const values = vectorBinding.read(time);
      const length = Math.hypot(...values) || 1;
      return values.map((value) => value / length);
    },
  };
}

/** [Threlte] Gắn pose vào target: áp danh sách binding theo thời gian. */
export function bindThreltePoseToTarget(
  bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>,
  time: number,
): Record<string, number[]> {
  const result: Record<string, number[]> = {};
  for (const binding of bindings) {
    result[binding.targetPath] = bindThrelteVectorTrack(binding.samples).read(time);
  }
  return result;
}

/** [Threlte] Tạo player runtime tối thiểu (clock + bindings). */
export function createThrelteRuntimePlayer(bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>): { update(dt: number): Record<string, number[]> } {
  let time = 0;
  return {
    update(dt: number): Record<string, number[]> {
      time += Math.max(0, dt);
      return bindThreltePoseToTarget(bindings, time);
    },
  };
}

/** [Threlte] Ánh xạ tên event gameplay sang tên event thư viện. */
export function mapThrelteEventName(name: string): string {
  return mapEventNameToLibrary(name, 'threlte');
}

/** [OGL] Gắn track scalar: giữ giá trị gần nhất cho tầng render. */
export function bindOglScalarTrack(samples: ReadonlyArray<{ time: number; value: number }>): { read(time: number): number } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number {
      let value = sorted.length > 0 ? sorted[0].value : 0;
      for (const sample of sorted) {
        if (sample.time <= time) value = sanitizeSample(sample.value);
        else break;
      }
      return value;
    },
  };
}

/** [OGL] Gắn track vector: nội suy tuyến tính giữa hai mẫu. */
export function bindOglVectorTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number[] {
      if (sorted.length === 0) return [];
      if (time <= sorted[0].time) return [...sorted[0].value];
      for (let i = 0; i < sorted.length - 1; i++) {
        const a = sorted[i];
        const b = sorted[i + 1];
        if (time >= a.time && time <= b.time) {
          const span = Math.max(b.time - a.time, 1e-9);
          const alpha = (time - a.time) / span;
          return a.value.map((value, index) => value + ((b.value[index] ?? value) - value) * alpha);
        }
      }
      return [...sorted[sorted.length - 1].value];
    },
  };
}

/** [OGL] Gắn track quaternion: nlerp giữa hai mẫu. */
export function bindOglQuaternionTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const vectorBinding = bindOglVectorTrack(samples);
  return {
    read(time: number): number[] {
      const values = vectorBinding.read(time);
      const length = Math.hypot(...values) || 1;
      return values.map((value) => value / length);
    },
  };
}

/** [OGL] Gắn pose vào target: áp danh sách binding theo thời gian. */
export function bindOglPoseToTarget(
  bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>,
  time: number,
): Record<string, number[]> {
  const result: Record<string, number[]> = {};
  for (const binding of bindings) {
    result[binding.targetPath] = bindOglVectorTrack(binding.samples).read(time);
  }
  return result;
}

/** [OGL] Tạo player runtime tối thiểu (clock + bindings). */
export function createOglRuntimePlayer(bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>): { update(dt: number): Record<string, number[]> } {
  let time = 0;
  return {
    update(dt: number): Record<string, number[]> {
      time += Math.max(0, dt);
      return bindOglPoseToTarget(bindings, time);
    },
  };
}

/** [OGL] Ánh xạ tên event gameplay sang tên event thư viện. */
export function mapOglEventName(name: string): string {
  return mapEventNameToLibrary(name, 'ogl');
}

/** [regl] Gắn track scalar: giữ giá trị gần nhất cho tầng render. */
export function bindReglScalarTrack(samples: ReadonlyArray<{ time: number; value: number }>): { read(time: number): number } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number {
      let value = sorted.length > 0 ? sorted[0].value : 0;
      for (const sample of sorted) {
        if (sample.time <= time) value = sanitizeSample(sample.value);
        else break;
      }
      return value;
    },
  };
}

/** [regl] Gắn track vector: nội suy tuyến tính giữa hai mẫu. */
export function bindReglVectorTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number[] {
      if (sorted.length === 0) return [];
      if (time <= sorted[0].time) return [...sorted[0].value];
      for (let i = 0; i < sorted.length - 1; i++) {
        const a = sorted[i];
        const b = sorted[i + 1];
        if (time >= a.time && time <= b.time) {
          const span = Math.max(b.time - a.time, 1e-9);
          const alpha = (time - a.time) / span;
          return a.value.map((value, index) => value + ((b.value[index] ?? value) - value) * alpha);
        }
      }
      return [...sorted[sorted.length - 1].value];
    },
  };
}

/** [regl] Gắn track quaternion: nlerp giữa hai mẫu. */
export function bindReglQuaternionTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const vectorBinding = bindReglVectorTrack(samples);
  return {
    read(time: number): number[] {
      const values = vectorBinding.read(time);
      const length = Math.hypot(...values) || 1;
      return values.map((value) => value / length);
    },
  };
}

/** [regl] Gắn pose vào target: áp danh sách binding theo thời gian. */
export function bindReglPoseToTarget(
  bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>,
  time: number,
): Record<string, number[]> {
  const result: Record<string, number[]> = {};
  for (const binding of bindings) {
    result[binding.targetPath] = bindReglVectorTrack(binding.samples).read(time);
  }
  return result;
}

/** [regl] Tạo player runtime tối thiểu (clock + bindings). */
export function createReglRuntimePlayer(bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>): { update(dt: number): Record<string, number[]> } {
  let time = 0;
  return {
    update(dt: number): Record<string, number[]> {
      time += Math.max(0, dt);
      return bindReglPoseToTarget(bindings, time);
    },
  };
}

/** [regl] Ánh xạ tên event gameplay sang tên event thư viện. */
export function mapReglEventName(name: string): string {
  return mapEventNameToLibrary(name, 'regl');
}

/** [twgl.js] Gắn track scalar: giữ giá trị gần nhất cho tầng render. */
export function bindTwglScalarTrack(samples: ReadonlyArray<{ time: number; value: number }>): { read(time: number): number } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number {
      let value = sorted.length > 0 ? sorted[0].value : 0;
      for (const sample of sorted) {
        if (sample.time <= time) value = sanitizeSample(sample.value);
        else break;
      }
      return value;
    },
  };
}

/** [twgl.js] Gắn track vector: nội suy tuyến tính giữa hai mẫu. */
export function bindTwglVectorTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number[] {
      if (sorted.length === 0) return [];
      if (time <= sorted[0].time) return [...sorted[0].value];
      for (let i = 0; i < sorted.length - 1; i++) {
        const a = sorted[i];
        const b = sorted[i + 1];
        if (time >= a.time && time <= b.time) {
          const span = Math.max(b.time - a.time, 1e-9);
          const alpha = (time - a.time) / span;
          return a.value.map((value, index) => value + ((b.value[index] ?? value) - value) * alpha);
        }
      }
      return [...sorted[sorted.length - 1].value];
    },
  };
}

/** [twgl.js] Gắn track quaternion: nlerp giữa hai mẫu. */
export function bindTwglQuaternionTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const vectorBinding = bindTwglVectorTrack(samples);
  return {
    read(time: number): number[] {
      const values = vectorBinding.read(time);
      const length = Math.hypot(...values) || 1;
      return values.map((value) => value / length);
    },
  };
}

/** [twgl.js] Gắn pose vào target: áp danh sách binding theo thời gian. */
export function bindTwglPoseToTarget(
  bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>,
  time: number,
): Record<string, number[]> {
  const result: Record<string, number[]> = {};
  for (const binding of bindings) {
    result[binding.targetPath] = bindTwglVectorTrack(binding.samples).read(time);
  }
  return result;
}

/** [twgl.js] Tạo player runtime tối thiểu (clock + bindings). */
export function createTwglRuntimePlayer(bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>): { update(dt: number): Record<string, number[]> } {
  let time = 0;
  return {
    update(dt: number): Record<string, number[]> {
      time += Math.max(0, dt);
      return bindTwglPoseToTarget(bindings, time);
    },
  };
}

/** [twgl.js] Ánh xạ tên event gameplay sang tên event thư viện. */
export function mapTwglEventName(name: string): string {
  return mapEventNameToLibrary(name, 'twgl');
}

/** [luma.gl] Gắn track scalar: giữ giá trị gần nhất cho tầng render. */
export function bindLumaScalarTrack(samples: ReadonlyArray<{ time: number; value: number }>): { read(time: number): number } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number {
      let value = sorted.length > 0 ? sorted[0].value : 0;
      for (const sample of sorted) {
        if (sample.time <= time) value = sanitizeSample(sample.value);
        else break;
      }
      return value;
    },
  };
}

/** [luma.gl] Gắn track vector: nội suy tuyến tính giữa hai mẫu. */
export function bindLumaVectorTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number[] {
      if (sorted.length === 0) return [];
      if (time <= sorted[0].time) return [...sorted[0].value];
      for (let i = 0; i < sorted.length - 1; i++) {
        const a = sorted[i];
        const b = sorted[i + 1];
        if (time >= a.time && time <= b.time) {
          const span = Math.max(b.time - a.time, 1e-9);
          const alpha = (time - a.time) / span;
          return a.value.map((value, index) => value + ((b.value[index] ?? value) - value) * alpha);
        }
      }
      return [...sorted[sorted.length - 1].value];
    },
  };
}

/** [luma.gl] Gắn track quaternion: nlerp giữa hai mẫu. */
export function bindLumaQuaternionTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const vectorBinding = bindLumaVectorTrack(samples);
  return {
    read(time: number): number[] {
      const values = vectorBinding.read(time);
      const length = Math.hypot(...values) || 1;
      return values.map((value) => value / length);
    },
  };
}

/** [luma.gl] Gắn pose vào target: áp danh sách binding theo thời gian. */
export function bindLumaPoseToTarget(
  bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>,
  time: number,
): Record<string, number[]> {
  const result: Record<string, number[]> = {};
  for (const binding of bindings) {
    result[binding.targetPath] = bindLumaVectorTrack(binding.samples).read(time);
  }
  return result;
}

/** [luma.gl] Tạo player runtime tối thiểu (clock + bindings). */
export function createLumaRuntimePlayer(bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>): { update(dt: number): Record<string, number[]> } {
  let time = 0;
  return {
    update(dt: number): Record<string, number[]> {
      time += Math.max(0, dt);
      return bindLumaPoseToTarget(bindings, time);
    },
  };
}

/** [luma.gl] Ánh xạ tên event gameplay sang tên event thư viện. */
export function mapLumaEventName(name: string): string {
  return mapEventNameToLibrary(name, 'luma');
}

/** [vtk.js] Gắn track scalar: giữ giá trị gần nhất cho tầng render. */
export function bindVtkScalarTrack(samples: ReadonlyArray<{ time: number; value: number }>): { read(time: number): number } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number {
      let value = sorted.length > 0 ? sorted[0].value : 0;
      for (const sample of sorted) {
        if (sample.time <= time) value = sanitizeSample(sample.value);
        else break;
      }
      return value;
    },
  };
}

/** [vtk.js] Gắn track vector: nội suy tuyến tính giữa hai mẫu. */
export function bindVtkVectorTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number[] {
      if (sorted.length === 0) return [];
      if (time <= sorted[0].time) return [...sorted[0].value];
      for (let i = 0; i < sorted.length - 1; i++) {
        const a = sorted[i];
        const b = sorted[i + 1];
        if (time >= a.time && time <= b.time) {
          const span = Math.max(b.time - a.time, 1e-9);
          const alpha = (time - a.time) / span;
          return a.value.map((value, index) => value + ((b.value[index] ?? value) - value) * alpha);
        }
      }
      return [...sorted[sorted.length - 1].value];
    },
  };
}

/** [vtk.js] Gắn track quaternion: nlerp giữa hai mẫu. */
export function bindVtkQuaternionTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const vectorBinding = bindVtkVectorTrack(samples);
  return {
    read(time: number): number[] {
      const values = vectorBinding.read(time);
      const length = Math.hypot(...values) || 1;
      return values.map((value) => value / length);
    },
  };
}

/** [vtk.js] Gắn pose vào target: áp danh sách binding theo thời gian. */
export function bindVtkPoseToTarget(
  bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>,
  time: number,
): Record<string, number[]> {
  const result: Record<string, number[]> = {};
  for (const binding of bindings) {
    result[binding.targetPath] = bindVtkVectorTrack(binding.samples).read(time);
  }
  return result;
}

/** [vtk.js] Tạo player runtime tối thiểu (clock + bindings). */
export function createVtkRuntimePlayer(bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>): { update(dt: number): Record<string, number[]> } {
  let time = 0;
  return {
    update(dt: number): Record<string, number[]> {
      time += Math.max(0, dt);
      return bindVtkPoseToTarget(bindings, time);
    },
  };
}

/** [vtk.js] Ánh xạ tên event gameplay sang tên event thư viện. */
export function mapVtkEventName(name: string): string {
  return mapEventNameToLibrary(name, 'vtk');
}

/** [deck.gl] Gắn track scalar: giữ giá trị gần nhất cho tầng render. */
export function bindDeckScalarTrack(samples: ReadonlyArray<{ time: number; value: number }>): { read(time: number): number } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number {
      let value = sorted.length > 0 ? sorted[0].value : 0;
      for (const sample of sorted) {
        if (sample.time <= time) value = sanitizeSample(sample.value);
        else break;
      }
      return value;
    },
  };
}

/** [deck.gl] Gắn track vector: nội suy tuyến tính giữa hai mẫu. */
export function bindDeckVectorTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number[] {
      if (sorted.length === 0) return [];
      if (time <= sorted[0].time) return [...sorted[0].value];
      for (let i = 0; i < sorted.length - 1; i++) {
        const a = sorted[i];
        const b = sorted[i + 1];
        if (time >= a.time && time <= b.time) {
          const span = Math.max(b.time - a.time, 1e-9);
          const alpha = (time - a.time) / span;
          return a.value.map((value, index) => value + ((b.value[index] ?? value) - value) * alpha);
        }
      }
      return [...sorted[sorted.length - 1].value];
    },
  };
}

/** [deck.gl] Gắn track quaternion: nlerp giữa hai mẫu. */
export function bindDeckQuaternionTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const vectorBinding = bindDeckVectorTrack(samples);
  return {
    read(time: number): number[] {
      const values = vectorBinding.read(time);
      const length = Math.hypot(...values) || 1;
      return values.map((value) => value / length);
    },
  };
}

/** [deck.gl] Gắn pose vào target: áp danh sách binding theo thời gian. */
export function bindDeckPoseToTarget(
  bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>,
  time: number,
): Record<string, number[]> {
  const result: Record<string, number[]> = {};
  for (const binding of bindings) {
    result[binding.targetPath] = bindDeckVectorTrack(binding.samples).read(time);
  }
  return result;
}

/** [deck.gl] Tạo player runtime tối thiểu (clock + bindings). */
export function createDeckRuntimePlayer(bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>): { update(dt: number): Record<string, number[]> } {
  let time = 0;
  return {
    update(dt: number): Record<string, number[]> {
      time += Math.max(0, dt);
      return bindDeckPoseToTarget(bindings, time);
    },
  };
}

/** [deck.gl] Ánh xạ tên event gameplay sang tên event thư viện. */
export function mapDeckEventName(name: string): string {
  return mapEventNameToLibrary(name, 'deck');
}

/** [xeokit] Gắn track scalar: giữ giá trị gần nhất cho tầng render. */
export function bindXeokitScalarTrack(samples: ReadonlyArray<{ time: number; value: number }>): { read(time: number): number } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number {
      let value = sorted.length > 0 ? sorted[0].value : 0;
      for (const sample of sorted) {
        if (sample.time <= time) value = sanitizeSample(sample.value);
        else break;
      }
      return value;
    },
  };
}

/** [xeokit] Gắn track vector: nội suy tuyến tính giữa hai mẫu. */
export function bindXeokitVectorTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number[] {
      if (sorted.length === 0) return [];
      if (time <= sorted[0].time) return [...sorted[0].value];
      for (let i = 0; i < sorted.length - 1; i++) {
        const a = sorted[i];
        const b = sorted[i + 1];
        if (time >= a.time && time <= b.time) {
          const span = Math.max(b.time - a.time, 1e-9);
          const alpha = (time - a.time) / span;
          return a.value.map((value, index) => value + ((b.value[index] ?? value) - value) * alpha);
        }
      }
      return [...sorted[sorted.length - 1].value];
    },
  };
}

/** [xeokit] Gắn track quaternion: nlerp giữa hai mẫu. */
export function bindXeokitQuaternionTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const vectorBinding = bindXeokitVectorTrack(samples);
  return {
    read(time: number): number[] {
      const values = vectorBinding.read(time);
      const length = Math.hypot(...values) || 1;
      return values.map((value) => value / length);
    },
  };
}

/** [xeokit] Gắn pose vào target: áp danh sách binding theo thời gian. */
export function bindXeokitPoseToTarget(
  bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>,
  time: number,
): Record<string, number[]> {
  const result: Record<string, number[]> = {};
  for (const binding of bindings) {
    result[binding.targetPath] = bindXeokitVectorTrack(binding.samples).read(time);
  }
  return result;
}

/** [xeokit] Tạo player runtime tối thiểu (clock + bindings). */
export function createXeokitRuntimePlayer(bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>): { update(dt: number): Record<string, number[]> } {
  let time = 0;
  return {
    update(dt: number): Record<string, number[]> {
      time += Math.max(0, dt);
      return bindXeokitPoseToTarget(bindings, time);
    },
  };
}

/** [xeokit] Ánh xạ tên event gameplay sang tên event thư viện. */
export function mapXeokitEventName(name: string): string {
  return mapEventNameToLibrary(name, 'xeo');
}

/** [CesiumJS] Gắn track scalar: giữ giá trị gần nhất cho tầng render. */
export function bindCesiumScalarTrack(samples: ReadonlyArray<{ time: number; value: number }>): { read(time: number): number } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number {
      let value = sorted.length > 0 ? sorted[0].value : 0;
      for (const sample of sorted) {
        if (sample.time <= time) value = sanitizeSample(sample.value);
        else break;
      }
      return value;
    },
  };
}

/** [CesiumJS] Gắn track vector: nội suy tuyến tính giữa hai mẫu. */
export function bindCesiumVectorTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number[] {
      if (sorted.length === 0) return [];
      if (time <= sorted[0].time) return [...sorted[0].value];
      for (let i = 0; i < sorted.length - 1; i++) {
        const a = sorted[i];
        const b = sorted[i + 1];
        if (time >= a.time && time <= b.time) {
          const span = Math.max(b.time - a.time, 1e-9);
          const alpha = (time - a.time) / span;
          return a.value.map((value, index) => value + ((b.value[index] ?? value) - value) * alpha);
        }
      }
      return [...sorted[sorted.length - 1].value];
    },
  };
}

/** [CesiumJS] Gắn track quaternion: nlerp giữa hai mẫu. */
export function bindCesiumQuaternionTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const vectorBinding = bindCesiumVectorTrack(samples);
  return {
    read(time: number): number[] {
      const values = vectorBinding.read(time);
      const length = Math.hypot(...values) || 1;
      return values.map((value) => value / length);
    },
  };
}

/** [CesiumJS] Gắn pose vào target: áp danh sách binding theo thời gian. */
export function bindCesiumPoseToTarget(
  bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>,
  time: number,
): Record<string, number[]> {
  const result: Record<string, number[]> = {};
  for (const binding of bindings) {
    result[binding.targetPath] = bindCesiumVectorTrack(binding.samples).read(time);
  }
  return result;
}

/** [CesiumJS] Tạo player runtime tối thiểu (clock + bindings). */
export function createCesiumRuntimePlayer(bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>): { update(dt: number): Record<string, number[]> } {
  let time = 0;
  return {
    update(dt: number): Record<string, number[]> {
      time += Math.max(0, dt);
      return bindCesiumPoseToTarget(bindings, time);
    },
  };
}

/** [CesiumJS] Ánh xạ tên event gameplay sang tên event thư viện. */
export function mapCesiumEventName(name: string): string {
  return mapEventNameToLibrary(name, 'cesium');
}

/** [Zdog] Gắn track scalar: giữ giá trị gần nhất cho tầng render. */
export function bindZdogScalarTrack(samples: ReadonlyArray<{ time: number; value: number }>): { read(time: number): number } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number {
      let value = sorted.length > 0 ? sorted[0].value : 0;
      for (const sample of sorted) {
        if (sample.time <= time) value = sanitizeSample(sample.value);
        else break;
      }
      return value;
    },
  };
}

/** [Zdog] Gắn track vector: nội suy tuyến tính giữa hai mẫu. */
export function bindZdogVectorTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number[] {
      if (sorted.length === 0) return [];
      if (time <= sorted[0].time) return [...sorted[0].value];
      for (let i = 0; i < sorted.length - 1; i++) {
        const a = sorted[i];
        const b = sorted[i + 1];
        if (time >= a.time && time <= b.time) {
          const span = Math.max(b.time - a.time, 1e-9);
          const alpha = (time - a.time) / span;
          return a.value.map((value, index) => value + ((b.value[index] ?? value) - value) * alpha);
        }
      }
      return [...sorted[sorted.length - 1].value];
    },
  };
}

/** [Zdog] Gắn track quaternion: nlerp giữa hai mẫu. */
export function bindZdogQuaternionTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const vectorBinding = bindZdogVectorTrack(samples);
  return {
    read(time: number): number[] {
      const values = vectorBinding.read(time);
      const length = Math.hypot(...values) || 1;
      return values.map((value) => value / length);
    },
  };
}

/** [Zdog] Gắn pose vào target: áp danh sách binding theo thời gian. */
export function bindZdogPoseToTarget(
  bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>,
  time: number,
): Record<string, number[]> {
  const result: Record<string, number[]> = {};
  for (const binding of bindings) {
    result[binding.targetPath] = bindZdogVectorTrack(binding.samples).read(time);
  }
  return result;
}

/** [Zdog] Tạo player runtime tối thiểu (clock + bindings). */
export function createZdogRuntimePlayer(bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>): { update(dt: number): Record<string, number[]> } {
  let time = 0;
  return {
    update(dt: number): Record<string, number[]> {
      time += Math.max(0, dt);
      return bindZdogPoseToTarget(bindings, time);
    },
  };
}

/** [Zdog] Ánh xạ tên event gameplay sang tên event thư viện. */
export function mapZdogEventName(name: string): string {
  return mapEventNameToLibrary(name, 'zdog');
}

/** [Filament] Gắn track scalar: giữ giá trị gần nhất cho tầng render. */
export function bindFilamentScalarTrack(samples: ReadonlyArray<{ time: number; value: number }>): { read(time: number): number } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number {
      let value = sorted.length > 0 ? sorted[0].value : 0;
      for (const sample of sorted) {
        if (sample.time <= time) value = sanitizeSample(sample.value);
        else break;
      }
      return value;
    },
  };
}

/** [Filament] Gắn track vector: nội suy tuyến tính giữa hai mẫu. */
export function bindFilamentVectorTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number[] {
      if (sorted.length === 0) return [];
      if (time <= sorted[0].time) return [...sorted[0].value];
      for (let i = 0; i < sorted.length - 1; i++) {
        const a = sorted[i];
        const b = sorted[i + 1];
        if (time >= a.time && time <= b.time) {
          const span = Math.max(b.time - a.time, 1e-9);
          const alpha = (time - a.time) / span;
          return a.value.map((value, index) => value + ((b.value[index] ?? value) - value) * alpha);
        }
      }
      return [...sorted[sorted.length - 1].value];
    },
  };
}

/** [Filament] Gắn track quaternion: nlerp giữa hai mẫu. */
export function bindFilamentQuaternionTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const vectorBinding = bindFilamentVectorTrack(samples);
  return {
    read(time: number): number[] {
      const values = vectorBinding.read(time);
      const length = Math.hypot(...values) || 1;
      return values.map((value) => value / length);
    },
  };
}

/** [Filament] Gắn pose vào target: áp danh sách binding theo thời gian. */
export function bindFilamentPoseToTarget(
  bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>,
  time: number,
): Record<string, number[]> {
  const result: Record<string, number[]> = {};
  for (const binding of bindings) {
    result[binding.targetPath] = bindFilamentVectorTrack(binding.samples).read(time);
  }
  return result;
}

/** [Filament] Tạo player runtime tối thiểu (clock + bindings). */
export function createFilamentRuntimePlayer(bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>): { update(dt: number): Record<string, number[]> } {
  let time = 0;
  return {
    update(dt: number): Record<string, number[]> {
      time += Math.max(0, dt);
      return bindFilamentPoseToTarget(bindings, time);
    },
  };
}

/** [Filament] Ánh xạ tên event gameplay sang tên event thư viện. */
export function mapFilamentEventName(name: string): string {
  return mapEventNameToLibrary(name, 'filament');
}

/** [OpenSceneGraph] Gắn track scalar: giữ giá trị gần nhất cho tầng render. */
export function bindOsgScalarTrack(samples: ReadonlyArray<{ time: number; value: number }>): { read(time: number): number } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number {
      let value = sorted.length > 0 ? sorted[0].value : 0;
      for (const sample of sorted) {
        if (sample.time <= time) value = sanitizeSample(sample.value);
        else break;
      }
      return value;
    },
  };
}

/** [OpenSceneGraph] Gắn track vector: nội suy tuyến tính giữa hai mẫu. */
export function bindOsgVectorTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number[] {
      if (sorted.length === 0) return [];
      if (time <= sorted[0].time) return [...sorted[0].value];
      for (let i = 0; i < sorted.length - 1; i++) {
        const a = sorted[i];
        const b = sorted[i + 1];
        if (time >= a.time && time <= b.time) {
          const span = Math.max(b.time - a.time, 1e-9);
          const alpha = (time - a.time) / span;
          return a.value.map((value, index) => value + ((b.value[index] ?? value) - value) * alpha);
        }
      }
      return [...sorted[sorted.length - 1].value];
    },
  };
}

/** [OpenSceneGraph] Gắn track quaternion: nlerp giữa hai mẫu. */
export function bindOsgQuaternionTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const vectorBinding = bindOsgVectorTrack(samples);
  return {
    read(time: number): number[] {
      const values = vectorBinding.read(time);
      const length = Math.hypot(...values) || 1;
      return values.map((value) => value / length);
    },
  };
}

/** [OpenSceneGraph] Gắn pose vào target: áp danh sách binding theo thời gian. */
export function bindOsgPoseToTarget(
  bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>,
  time: number,
): Record<string, number[]> {
  const result: Record<string, number[]> = {};
  for (const binding of bindings) {
    result[binding.targetPath] = bindOsgVectorTrack(binding.samples).read(time);
  }
  return result;
}

/** [OpenSceneGraph] Tạo player runtime tối thiểu (clock + bindings). */
export function createOsgRuntimePlayer(bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>): { update(dt: number): Record<string, number[]> } {
  let time = 0;
  return {
    update(dt: number): Record<string, number[]> {
      time += Math.max(0, dt);
      return bindOsgPoseToTarget(bindings, time);
    },
  };
}

/** [OpenSceneGraph] Ánh xạ tên event gameplay sang tên event thư viện. */
export function mapOsgEventName(name: string): string {
  return mapEventNameToLibrary(name, 'osg');
}

/** [OGRE] Gắn track scalar: giữ giá trị gần nhất cho tầng render. */
export function bindOgreScalarTrack(samples: ReadonlyArray<{ time: number; value: number }>): { read(time: number): number } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number {
      let value = sorted.length > 0 ? sorted[0].value : 0;
      for (const sample of sorted) {
        if (sample.time <= time) value = sanitizeSample(sample.value);
        else break;
      }
      return value;
    },
  };
}

/** [OGRE] Gắn track vector: nội suy tuyến tính giữa hai mẫu. */
export function bindOgreVectorTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const sorted = [...samples].sort((a, b) => a.time - b.time);
  return {
    read(time: number): number[] {
      if (sorted.length === 0) return [];
      if (time <= sorted[0].time) return [...sorted[0].value];
      for (let i = 0; i < sorted.length - 1; i++) {
        const a = sorted[i];
        const b = sorted[i + 1];
        if (time >= a.time && time <= b.time) {
          const span = Math.max(b.time - a.time, 1e-9);
          const alpha = (time - a.time) / span;
          return a.value.map((value, index) => value + ((b.value[index] ?? value) - value) * alpha);
        }
      }
      return [...sorted[sorted.length - 1].value];
    },
  };
}

/** [OGRE] Gắn track quaternion: nlerp giữa hai mẫu. */
export function bindOgreQuaternionTrack(samples: ReadonlyArray<{ time: number; value: readonly number[] }>): { read(time: number): number[] } {
  const vectorBinding = bindOgreVectorTrack(samples);
  return {
    read(time: number): number[] {
      const values = vectorBinding.read(time);
      const length = Math.hypot(...values) || 1;
      return values.map((value) => value / length);
    },
  };
}

/** [OGRE] Gắn pose vào target: áp danh sách binding theo thời gian. */
export function bindOgrePoseToTarget(
  bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>,
  time: number,
): Record<string, number[]> {
  const result: Record<string, number[]> = {};
  for (const binding of bindings) {
    result[binding.targetPath] = bindOgreVectorTrack(binding.samples).read(time);
  }
  return result;
}

/** [OGRE] Tạo player runtime tối thiểu (clock + bindings). */
export function createOgreRuntimePlayer(bindings: ReadonlyArray<{ targetPath: string; kind: string; samples: ReadonlyArray<{ time: number; value: readonly number[] }> }>): { update(dt: number): Record<string, number[]> } {
  let time = 0;
  return {
    update(dt: number): Record<string, number[]> {
      time += Math.max(0, dt);
      return bindOgrePoseToTarget(bindings, time);
    },
  };
}

/** [OGRE] Ánh xạ tên event gameplay sang tên event thư viện. */
export function mapOgreEventName(name: string): string {
  return mapEventNameToLibrary(name, 'ogre');
}
