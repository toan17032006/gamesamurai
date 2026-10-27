/**
 * @file index.ts
 * @module @aetheria/engine/animation
 * @description Entry point của module quản lý render hoạt ảnh: curve/easing,
 * clip, blend tree, state machine, player/mixer, event track, retargeting và
 * exporter descriptor cho các thư viện đồ họa (three, babylon, playcanvas,
 * a-frame, ogl, r3f, threlte, regl, twgl, luma.gl, vtk.js, xeokit, cesium,
 * deck.gl, zdog, verge3d, babylon-native, filament, openscenegraph, ogre).
 *
 * Game import từ `@aetheria/engine/animation`; các cầu nối sang thư viện đồ họa
 * nằm ở `@aetheria/engine/render/interop`.
 */

export * from './types.js';
export * from './easing.js';
export * from './curve.js';
export * from './clip.js';
export * from './blend.js';
export * from './state-machine.js';
export * from './player.js';
export * from './events.js';
export * from './retarget.js';
export * from './library-export.js';
export * from './samplers.js';
export * from './pose-ops.js';
export * from './root-motion.js';
export * from './curves-ops.js';
export * from './timeline.js';
export * from './compression.js';
export * from './procedural.js';
