/**
 * @file library-export.ts
 * @module @aetheria/engine/animation/library-export
 * @description Xuất hoạt ảnh trung tính sang descriptor/idiom của từng thư viện
 * đồ họa mà engine kết nối (`render/interop`). Mỗi exporter nhận `AnimationClip`
 * và trả `LibraryAnimationExport` tuần tự hóa được:
 *
 * - `three`/`verge3d`/`filament`: track kiểu glTF/KeyframeTrack (name:
 *   `bone.position` → `node.uuid.position`).
 * - `babylon`/`babylon-native`: mảng `{ frame, value }` (frame theo FPS 60).
 * - `playcanvas`: curve `{ keys: number[], values: number[][] }`.
 * - `a-frame`/`react-three-fiber`/`threlte`: phần tử/component descriptor.
 * - `ogl`/`regl`/`twgl`/`luma.gl`: attribute buffer phẳng + bước thời gian.
 * - `vtk.js`/`deck.gl`/`xeokit`/`cesium`: dataset/layer/tileset descriptor.
 * - `zdog`: shape timeline đơn giản.
 * - `openscenegraph`/`ogre`: payload văn bản theo định dạng của từng engine.
 */

import type { AnimationClip } from './clip.js';
import type { LibraryAnimationExport, AnimationTrack } from './types.js';

/** FPS quy ước khi chuyển thời gian sang frame (Babylon/gltf exporters). */
export const EXPORT_FPS = 60;

/** Chuyển thời gian giây → frame theo EXPORT_FPS. */
export function secondsToFrames(seconds: number): number {
  return Math.round(seconds * EXPORT_FPS);
}

/** Ghi keyframe track thành cặp thời điểm/giá trị chuẩn hóa. */
export function trackToSamples(track: AnimationTrack): { times: number[]; values: number[][] } {
  const stride = 1 + track.componentCount;
  const times: number[] = [];
  const values: number[][] = [];
  for (let base = 0; base < track.keys.length; base += stride) {
    times.push(track.keys[base] ?? 0);
    values.push(Array.from({ length: track.componentCount }, (_, c) => track.keys[base + 1 + c] ?? 0));
  }
  return { times, values };
}

/** Payload chung glTF-style: `/bone.property` với keyframe time:value. */
export function exportGltfStyle(clip: AnimationClip, library: string): LibraryAnimationExport {
  const channels = clip.tracks.map((track) => {
    const samples = trackToSamples(track);
    return {
      target: track.targetPath,
      kind: track.kind,
      interpolation: track.interpolation,
      input: samples.times,
      output: samples.values,
    };
  });
  return {
    library,
    payloadKind: 'json',
    payload: {
      name: clip.name,
      duration: clip.duration,
      fps: EXPORT_FPS,
      channels,
      events: clip.events.map((event) => ({ ...event })),
    },
  };
}

/** Payload Babylon/Babylon Native: mảng Animation `{ frame, value }`. */
export function exportBabylonStyle(clip: AnimationClip, library: string): LibraryAnimationExport {
  const animations = clip.tracks.map((track) => {
    const samples = trackToSamples(track);
    const frames: Array<{ frame: number; value: number[] }> = samples.times.map((time, index) => ({
      frame: secondsToFrames(time),
      value: samples.values[index] ?? [],
    }));
    return {
      targetPropertyPath: track.targetPath,
      dataType: track.kind,
      keys: frames,
    };
  });
  return {
    library,
    payloadKind: 'json',
    payload: { name: clip.name, from: 0, to: secondsToFrames(clip.duration), animations },
  };
}

/** Payload PlayCanvas: curve keys/values. */
export function exportPlayCanvasStyle(clip: AnimationClip): LibraryAnimationExport {
  const curves = clip.tracks.map((track) => {
    const samples = trackToSamples(track);
    return {
      entityPath: track.targetPath,
      component: 'animation',
      keys: samples.times,
      values: samples.values,
    };
  });
  return {
    library: 'playcanvas',
    payloadKind: 'json',
    payload: { name: clip.name, duration: clip.duration, curves },
  };
}

/** Payload OGL/regl/twgl/luma.gl: attribute buffer phẳng + thời gian. */
export function exportBufferStyle(clip: AnimationClip, library: string): LibraryAnimationExport {
  const buffers = clip.tracks.map((track) => {
    const samples = trackToSamples(track);
    return {
      attribute: track.targetPath,
      stride: track.componentCount,
      timeBuffer: samples.times,
      valueBuffer: samples.values.flat(),
      interpolation: track.interpolation,
    };
  });
  return {
    library,
    payloadKind: 'json',
    payload: { name: clip.name, duration: clip.duration, buffers, stepHint: 1 / EXPORT_FPS },
  };
}

/** Payload khung component (R3F/Threlte): cây element với props keyframe. */
export function exportFrameworkStyle(clip: AnimationClip, library: string): LibraryAnimationExport {
  const nodes = clip.tracks.map((track) => {
    const samples = trackToSamples(track);
    return {
      element: library === 'react-three-fiber' ? 'useFrame' : 'T',
      target: track.targetPath,
      kind: track.kind,
      keyframes: samples.times.map((time, index) => ({
        clock: time,
        value: samples.values[index] ?? [],
      })),
    };
  });
  return {
    library,
    payloadKind: 'json',
    payload: { name: clip.name, nodes, events: clip.events.map((event) => ({ ...event })) },
  };
}

/** Payload A-Frame: markup entity-animation chuỗi. */
export function exportAFrameMarkup(clip: AnimationClip): LibraryAnimationExport {
  const lines: string[] = [];
  for (const track of clip.tracks) {
    const samples = trackToSamples(track);
    const property = track.targetPath.replace(/\./g, '__');
    const keyframes = samples.times
      .map((time, index) => `${time.toFixed(3)}: ${JSON.stringify(samples.values[index] ?? [])}`)
      .join('; ');
    lines.push(
      `<a-entity animation__${property}="property: ${track.targetPath}; dur: ${Math.round(clip.duration * 1000)}; keyframes: ${keyframes}"></a-entity>`,
    );
  }
  return {
    library: 'a-frame',
    payloadKind: 'markup',
    payload: lines.join('\n'),
  };
}

/** Payload vtk.js/deck.gl/xeokit/cesium: dataset/layer descriptor. */
export function exportDatasetStyle(clip: AnimationClip, library: string): LibraryAnimationExport {
  const series = clip.tracks.map((track) => {
    const samples = trackToSamples(track);
    return {
      dataPath: track.targetPath,
      timeSteps: samples.times,
      values: samples.values,
      kind: track.kind,
    };
  });
  return {
    library,
    payloadKind: 'json',
    payload: {
      name: clip.name,
      timeRange: [0, clip.duration],
      timeSeries: series,
      metadata: clip.metadata,
    },
  };
}

/** Payload Zdog: shape timeline tối giản (anchor + giá trị scalar). */
export function exportZdog(clip: AnimationClip): LibraryAnimationExport {
  const shapes = clip.tracks.map((track) => {
    const samples = trackToSamples(track);
    return {
      anchor: track.targetPath,
      kind: track.kind,
      timeline: samples.times.map((time, index) => ({
        at: time,
        value: (samples.values[index] ?? [])[0] ?? 0,
      })),
    };
  });
  return { library: 'zdog', payloadKind: 'json', payload: { name: clip.name, shapes } };
}

/** Payload Babylon Native: giống Babylon nhưng không DOM, thêm hints native. */
export function exportBabylonNative(clip: AnimationClip): LibraryAnimationExport {
  const base = exportBabylonStyle(clip, 'babylon-native');
  return {
    ...base,
    payload: {
      ...(base.payload as Record<string, unknown>),
      native: { noDom: true, deterministicTime: true },
    },
  };
}

/** Payload Filament: glTF-style + material param hints. */
export function exportFilament(clip: AnimationClip): LibraryAnimationExport {
  const base = exportGltfStyle(clip, 'filament');
  return {
    ...base,
    payload: {
      ...(base.payload as Record<string, unknown>),
      filament: { resourcePrefix: 'glb', needsUvTransform: false },
    },
  };
}

/** Payload OpenSceneGraph: text node theo khái niệm AnimationPath. */
export function exportOpenSceneGraphText(clip: AnimationClip): LibraryAnimationExport {
  const lines: string[] = ['osg::AnimationPath {'];
  for (const track of clip.tracks) {
    const samples = trackToSamples(track);
    lines.push(`  // ${track.targetPath}`);
    samples.times.forEach((time, index) => {
      const value = (samples.values[index] ?? []).join(' ');
      lines.push(`  ${time.toFixed(4)} ${value}`);
    });
  }
  lines.push('}');
  return { library: 'openscenegraph', payloadKind: 'text', payload: lines.join('\n') };
}

/** Payload OGRE: khối XML-like `<animation>` cho ogre mesh/scene. */
export function exportOgreText(clip: AnimationClip): LibraryAnimationExport {
  const lines: string[] = [`<animation name="${clip.name}" length="${clip.duration.toFixed(4)}">`];
  for (const track of clip.tracks) {
    const samples = trackToSamples(track);
    lines.push(`  <tracks target="${track.targetPath}">`);
    samples.times.forEach((time, index) => {
      const value = (samples.values[index] ?? []).join(', ');
      lines.push(`    <keyframe time="${time.toFixed(4)}"><value>${value}</value></keyframe>`);
    });
    lines.push('  </tracks>');
  }
  lines.push('</animation>');
  return { library: 'ogre', payloadKind: 'text', payload: lines.join('\n') };
}

/** Type của registry exporter. */
export type ClipExporter = (clip: AnimationClip) => LibraryAnimationExport;

/** Registry exporter theo library id (khớp `render/interop`). */
export const CLIP_EXPORTERS: Readonly<Record<string, ClipExporter>> = Object.freeze({
  three: (clip) => exportGltfStyle(clip, 'three'),
  verge3d: (clip) => exportGltfStyle(clip, 'verge3d'),
  filament: exportFilament,
  babylon: (clip) => exportBabylonStyle(clip, 'babylon'),
  'babylon-native': exportBabylonNative,
  playcanvas: exportPlayCanvasStyle,
  ogl: (clip) => exportBufferStyle(clip, 'ogl'),
  regl: (clip) => exportBufferStyle(clip, 'regl'),
  twgl: (clip) => exportBufferStyle(clip, 'twgl'),
  'luma.gl': (clip) => exportBufferStyle(clip, 'luma.gl'),
  'react-three-fiber': (clip) => exportFrameworkStyle(clip, 'react-three-fiber'),
  threlte: (clip) => exportFrameworkStyle(clip, 'threlte'),
  'a-frame': exportAFrameMarkup,
  'vtk.js': (clip) => exportDatasetStyle(clip, 'vtk.js'),
  'deck.gl': (clip) => exportDatasetStyle(clip, 'deck.gl'),
  xeokit: (clip) => exportDatasetStyle(clip, 'xeokit'),
  cesium: (clip) => exportDatasetStyle(clip, 'cesium'),
  zdog: exportZdog,
  openscenegraph: exportOpenSceneGraphText,
  ogre: exportOgreText,
});

/** Danh sách library id có exporter hoạt ảnh. */
export function supportedAnimationLibraries(): string[] {
  return Object.keys(CLIP_EXPORTERS).sort();
}

/** Xuất clip cho một thư viện; ném lỗi nếu library chưa hỗ trợ. */
export function exportClipForLibrary(clip: AnimationClip, library: string): LibraryAnimationExport {
  const exporter = CLIP_EXPORTERS[library];
  if (!exporter) throw new RangeError(`Chưa có exporter hoạt ảnh cho thư viện "${library}"`);
  return exporter(clip);
}
