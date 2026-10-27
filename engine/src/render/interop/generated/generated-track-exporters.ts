/**
 * @file generated-track-exporters.ts
 * @module @aetheria/engine/render/interop/generated
 * @description SINH TỰ ĐỘNG bởi `scripts/generate-interop-matrix.mjs` — KHÔNG
 * sửa tay. Mỗi hàm ủy quyền vào `matrix-core.ts` / `animation`; quy ước riêng
 * của từng thư viện (trục lên, tay hệ trục, đơn vị, prefix event) lấy từ bảng
 * trong script. Chạy lại script sau khi đổi bảng hoặc core.
 */
import { trackToSamples } from '../../../animation/library-export.js';
import type { AnimationTrack } from '../../../animation/types.js';
import { sanitizeSample } from '../matrix-core.js';


/** [Three.js] Xuất track scalar thành cặp thời gian/giá trị cho thư viện. */
export function exportThreeScalarTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [Three.js] Xuất track vector2 thành cặp thời gian/giá trị cho thư viện. */
export function exportThreeVector2Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [Three.js] Xuất track vector3 thành cặp thời gian/giá trị cho thư viện. */
export function exportThreeVector3Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [Three.js] Xuất track quaternion thành cặp thời gian/giá trị cho thư viện. */
export function exportThreeQuaternionTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [Three.js] Xuất track color thành cặp thời gian/giá trị cho thư viện. */
export function exportThreeColorTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [Babylon.js] Xuất track scalar thành cặp thời gian/giá trị cho thư viện. */
export function exportBabylonScalarTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [Babylon.js] Xuất track vector2 thành cặp thời gian/giá trị cho thư viện. */
export function exportBabylonVector2Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [Babylon.js] Xuất track vector3 thành cặp thời gian/giá trị cho thư viện. */
export function exportBabylonVector3Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [Babylon.js] Xuất track quaternion thành cặp thời gian/giá trị cho thư viện. */
export function exportBabylonQuaternionTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [Babylon.js] Xuất track color thành cặp thời gian/giá trị cho thư viện. */
export function exportBabylonColorTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [Babylon Native] Xuất track scalar thành cặp thời gian/giá trị cho thư viện. */
export function exportBabylonNativeScalarTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [Babylon Native] Xuất track vector2 thành cặp thời gian/giá trị cho thư viện. */
export function exportBabylonNativeVector2Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [Babylon Native] Xuất track vector3 thành cặp thời gian/giá trị cho thư viện. */
export function exportBabylonNativeVector3Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [Babylon Native] Xuất track quaternion thành cặp thời gian/giá trị cho thư viện. */
export function exportBabylonNativeQuaternionTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [Babylon Native] Xuất track color thành cặp thời gian/giá trị cho thư viện. */
export function exportBabylonNativeColorTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [PlayCanvas Engine] Xuất track scalar thành cặp thời gian/giá trị cho thư viện. */
export function exportPlaycanvasScalarTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [PlayCanvas Engine] Xuất track vector2 thành cặp thời gian/giá trị cho thư viện. */
export function exportPlaycanvasVector2Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [PlayCanvas Engine] Xuất track vector3 thành cặp thời gian/giá trị cho thư viện. */
export function exportPlaycanvasVector3Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [PlayCanvas Engine] Xuất track quaternion thành cặp thời gian/giá trị cho thư viện. */
export function exportPlaycanvasQuaternionTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [PlayCanvas Engine] Xuất track color thành cặp thời gian/giá trị cho thư viện. */
export function exportPlaycanvasColorTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [Verge3D] Xuất track scalar thành cặp thời gian/giá trị cho thư viện. */
export function exportVerge3dScalarTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [Verge3D] Xuất track vector2 thành cặp thời gian/giá trị cho thư viện. */
export function exportVerge3dVector2Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [Verge3D] Xuất track vector3 thành cặp thời gian/giá trị cho thư viện. */
export function exportVerge3dVector3Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [Verge3D] Xuất track quaternion thành cặp thời gian/giá trị cho thư viện. */
export function exportVerge3dQuaternionTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [Verge3D] Xuất track color thành cặp thời gian/giá trị cho thư viện. */
export function exportVerge3dColorTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [A-Frame] Xuất track scalar thành cặp thời gian/giá trị cho thư viện. */
export function exportAframeScalarTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [A-Frame] Xuất track vector2 thành cặp thời gian/giá trị cho thư viện. */
export function exportAframeVector2Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [A-Frame] Xuất track vector3 thành cặp thời gian/giá trị cho thư viện. */
export function exportAframeVector3Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [A-Frame] Xuất track quaternion thành cặp thời gian/giá trị cho thư viện. */
export function exportAframeQuaternionTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [A-Frame] Xuất track color thành cặp thời gian/giá trị cho thư viện. */
export function exportAframeColorTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [React Three Fiber] Xuất track scalar thành cặp thời gian/giá trị cho thư viện. */
export function exportR3fScalarTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [React Three Fiber] Xuất track vector2 thành cặp thời gian/giá trị cho thư viện. */
export function exportR3fVector2Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [React Three Fiber] Xuất track vector3 thành cặp thời gian/giá trị cho thư viện. */
export function exportR3fVector3Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [React Three Fiber] Xuất track quaternion thành cặp thời gian/giá trị cho thư viện. */
export function exportR3fQuaternionTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [React Three Fiber] Xuất track color thành cặp thời gian/giá trị cho thư viện. */
export function exportR3fColorTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [Threlte] Xuất track scalar thành cặp thời gian/giá trị cho thư viện. */
export function exportThrelteScalarTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [Threlte] Xuất track vector2 thành cặp thời gian/giá trị cho thư viện. */
export function exportThrelteVector2Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [Threlte] Xuất track vector3 thành cặp thời gian/giá trị cho thư viện. */
export function exportThrelteVector3Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [Threlte] Xuất track quaternion thành cặp thời gian/giá trị cho thư viện. */
export function exportThrelteQuaternionTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [Threlte] Xuất track color thành cặp thời gian/giá trị cho thư viện. */
export function exportThrelteColorTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [OGL] Xuất track scalar thành cặp thời gian/giá trị cho thư viện. */
export function exportOglScalarTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [OGL] Xuất track vector2 thành cặp thời gian/giá trị cho thư viện. */
export function exportOglVector2Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [OGL] Xuất track vector3 thành cặp thời gian/giá trị cho thư viện. */
export function exportOglVector3Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [OGL] Xuất track quaternion thành cặp thời gian/giá trị cho thư viện. */
export function exportOglQuaternionTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [OGL] Xuất track color thành cặp thời gian/giá trị cho thư viện. */
export function exportOglColorTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [regl] Xuất track scalar thành cặp thời gian/giá trị cho thư viện. */
export function exportReglScalarTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [regl] Xuất track vector2 thành cặp thời gian/giá trị cho thư viện. */
export function exportReglVector2Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [regl] Xuất track vector3 thành cặp thời gian/giá trị cho thư viện. */
export function exportReglVector3Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [regl] Xuất track quaternion thành cặp thời gian/giá trị cho thư viện. */
export function exportReglQuaternionTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [regl] Xuất track color thành cặp thời gian/giá trị cho thư viện. */
export function exportReglColorTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [twgl.js] Xuất track scalar thành cặp thời gian/giá trị cho thư viện. */
export function exportTwglScalarTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [twgl.js] Xuất track vector2 thành cặp thời gian/giá trị cho thư viện. */
export function exportTwglVector2Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [twgl.js] Xuất track vector3 thành cặp thời gian/giá trị cho thư viện. */
export function exportTwglVector3Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [twgl.js] Xuất track quaternion thành cặp thời gian/giá trị cho thư viện. */
export function exportTwglQuaternionTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [twgl.js] Xuất track color thành cặp thời gian/giá trị cho thư viện. */
export function exportTwglColorTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [luma.gl] Xuất track scalar thành cặp thời gian/giá trị cho thư viện. */
export function exportLumaScalarTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [luma.gl] Xuất track vector2 thành cặp thời gian/giá trị cho thư viện. */
export function exportLumaVector2Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [luma.gl] Xuất track vector3 thành cặp thời gian/giá trị cho thư viện. */
export function exportLumaVector3Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [luma.gl] Xuất track quaternion thành cặp thời gian/giá trị cho thư viện. */
export function exportLumaQuaternionTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [luma.gl] Xuất track color thành cặp thời gian/giá trị cho thư viện. */
export function exportLumaColorTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [vtk.js] Xuất track scalar thành cặp thời gian/giá trị cho thư viện. */
export function exportVtkScalarTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [vtk.js] Xuất track vector2 thành cặp thời gian/giá trị cho thư viện. */
export function exportVtkVector2Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [vtk.js] Xuất track vector3 thành cặp thời gian/giá trị cho thư viện. */
export function exportVtkVector3Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [vtk.js] Xuất track quaternion thành cặp thời gian/giá trị cho thư viện. */
export function exportVtkQuaternionTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [vtk.js] Xuất track color thành cặp thời gian/giá trị cho thư viện. */
export function exportVtkColorTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [deck.gl] Xuất track scalar thành cặp thời gian/giá trị cho thư viện. */
export function exportDeckScalarTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [deck.gl] Xuất track vector2 thành cặp thời gian/giá trị cho thư viện. */
export function exportDeckVector2Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [deck.gl] Xuất track vector3 thành cặp thời gian/giá trị cho thư viện. */
export function exportDeckVector3Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [deck.gl] Xuất track quaternion thành cặp thời gian/giá trị cho thư viện. */
export function exportDeckQuaternionTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [deck.gl] Xuất track color thành cặp thời gian/giá trị cho thư viện. */
export function exportDeckColorTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [xeokit] Xuất track scalar thành cặp thời gian/giá trị cho thư viện. */
export function exportXeokitScalarTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [xeokit] Xuất track vector2 thành cặp thời gian/giá trị cho thư viện. */
export function exportXeokitVector2Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [xeokit] Xuất track vector3 thành cặp thời gian/giá trị cho thư viện. */
export function exportXeokitVector3Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [xeokit] Xuất track quaternion thành cặp thời gian/giá trị cho thư viện. */
export function exportXeokitQuaternionTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [xeokit] Xuất track color thành cặp thời gian/giá trị cho thư viện. */
export function exportXeokitColorTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [CesiumJS] Xuất track scalar thành cặp thời gian/giá trị cho thư viện. */
export function exportCesiumScalarTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [CesiumJS] Xuất track vector2 thành cặp thời gian/giá trị cho thư viện. */
export function exportCesiumVector2Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [CesiumJS] Xuất track vector3 thành cặp thời gian/giá trị cho thư viện. */
export function exportCesiumVector3Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [CesiumJS] Xuất track quaternion thành cặp thời gian/giá trị cho thư viện. */
export function exportCesiumQuaternionTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [CesiumJS] Xuất track color thành cặp thời gian/giá trị cho thư viện. */
export function exportCesiumColorTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [Zdog] Xuất track scalar thành cặp thời gian/giá trị cho thư viện. */
export function exportZdogScalarTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [Zdog] Xuất track vector2 thành cặp thời gian/giá trị cho thư viện. */
export function exportZdogVector2Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [Zdog] Xuất track vector3 thành cặp thời gian/giá trị cho thư viện. */
export function exportZdogVector3Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [Zdog] Xuất track quaternion thành cặp thời gian/giá trị cho thư viện. */
export function exportZdogQuaternionTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [Zdog] Xuất track color thành cặp thời gian/giá trị cho thư viện. */
export function exportZdogColorTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [Filament] Xuất track scalar thành cặp thời gian/giá trị cho thư viện. */
export function exportFilamentScalarTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [Filament] Xuất track vector2 thành cặp thời gian/giá trị cho thư viện. */
export function exportFilamentVector2Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [Filament] Xuất track vector3 thành cặp thời gian/giá trị cho thư viện. */
export function exportFilamentVector3Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [Filament] Xuất track quaternion thành cặp thời gian/giá trị cho thư viện. */
export function exportFilamentQuaternionTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [Filament] Xuất track color thành cặp thời gian/giá trị cho thư viện. */
export function exportFilamentColorTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [OpenSceneGraph] Xuất track scalar thành cặp thời gian/giá trị cho thư viện. */
export function exportOsgScalarTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [OpenSceneGraph] Xuất track vector2 thành cặp thời gian/giá trị cho thư viện. */
export function exportOsgVector2Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [OpenSceneGraph] Xuất track vector3 thành cặp thời gian/giá trị cho thư viện. */
export function exportOsgVector3Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [OpenSceneGraph] Xuất track quaternion thành cặp thời gian/giá trị cho thư viện. */
export function exportOsgQuaternionTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [OpenSceneGraph] Xuất track color thành cặp thời gian/giá trị cho thư viện. */
export function exportOsgColorTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [OGRE] Xuất track scalar thành cặp thời gian/giá trị cho thư viện. */
export function exportOgreScalarTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [OGRE] Xuất track vector2 thành cặp thời gian/giá trị cho thư viện. */
export function exportOgreVector2Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [OGRE] Xuất track vector3 thành cặp thời gian/giá trị cho thư viện. */
export function exportOgreVector3Track(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [OGRE] Xuất track quaternion thành cặp thời gian/giá trị cho thư viện. */
export function exportOgreQuaternionTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}

/** [OGRE] Xuất track color thành cặp thời gian/giá trị cho thư viện. */
export function exportOgreColorTrack(track: AnimationTrack): { targetPath: string; samples: Array<{ time: number; value: number[] }> } {
  const samples = trackToSamples(track);
  return {
    targetPath: track.targetPath,
    samples: samples.times.map((time, index) => ({
      time: sanitizeSample(time),
      value: (samples.values[index] ?? []).map((value) => sanitizeSample(value)),
    })),
  };
}
