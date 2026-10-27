/**
 * @file index.ts
 * @module @aetheria/engine/render/interop
 * @description Entry point cầu nối thư viện đồ họa: descriptor scene + hoạt ảnh
 * cho three, babylon, babylon-native, playcanvas, verge3d, a-frame,
 * react-three-fiber, threlte, ogl, regl, twgl, luma.gl, vtk.js, deck.gl, xeokit,
 * cesium, zdog, filament, openscenegraph và ogre.
 */

export * from './types.js';
export * from './scene-descriptors.js';
export * from './engine-bridges.js';
export * from './framework-glue.js';
export * from './webgl-utility.js';
export * from './data-viz-minimal.js';
export * from './registry.js';
export * from './matrix-core.js';
export * from './generated/index.js';
