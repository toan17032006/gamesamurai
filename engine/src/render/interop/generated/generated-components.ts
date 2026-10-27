/**
 * @file generated-components.ts
 * @module @aetheria/engine/render/interop/generated
 * @description SINH TỰ ĐỘNG bởi `scripts/generate-interop-matrix.mjs` — KHÔNG
 * sửa tay. Mỗi hàm ủy quyền vào `matrix-core.ts` / `animation`; quy ước riêng
 * của từng thư viện (trục lên, tay hệ trục, đơn vị, prefix event) lấy từ bảng
 * trong script. Chạy lại script sau khi đổi bảng hoặc core.
 */
import { buildStyledComponent } from '../matrix-core.js';


/** [Three.js] Dựng component 'mesh' theo quy ước đặt trường của thư viện. */
export function threeMesh(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'id': 'name', 'positions': 'vertices', 'indices': 'triangles' };
  return buildStyledComponent('mesh', data, fieldStyle);
}

/** [Three.js] Dựng component 'material' theo quy ước đặt trường của thư viện. */
export function threeMaterialComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'baseColor', 'roughness': 'roughnessValue', 'metalness': 'metallicValue' };
  return buildStyledComponent('material', data, fieldStyle);
}

/** [Three.js] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function threeAmbientLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [Three.js] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function threeDirectionalLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'direction': 'dir' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [Three.js] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function threePointLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'position': 'at' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [Three.js] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function threeSpotLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'angle': 'coneAngle' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [Three.js] Dựng component 'camera' theo quy ước đặt trường của thư viện. */
export function threeCameraComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'fov': 'fovY', 'near': 'zNear', 'far': 'zFar' };
  return buildStyledComponent('camera', data, fieldStyle);
}

/** [Three.js] Dựng component 'points' theo quy ước đặt trường của thư viện. */
export function threePointsComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'count': 'count', 'size': 'pointSize' };
  return buildStyledComponent('points', data, fieldStyle);
}

/** [Three.js] Dựng component 'fog' theo quy ước đặt trường của thư viện. */
export function threeFogComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'colorHex', 'near': 'startDist', 'far': 'endDist' };
  return buildStyledComponent('fog', data, fieldStyle);
}

/** [Three.js] Dựng component 'environment' theo quy ước đặt trường của thư viện. */
export function threeEnvironmentComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'environmentMapUri': 'mapUri' };
  return buildStyledComponent('environment', data, fieldStyle);
}

/** [Babylon.js] Dựng component 'mesh' theo quy ước đặt trường của thư viện. */
export function babylonMesh(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'id': 'name', 'positions': 'vertices', 'indices': 'triangles' };
  return buildStyledComponent('mesh', data, fieldStyle);
}

/** [Babylon.js] Dựng component 'material' theo quy ước đặt trường của thư viện. */
export function babylonMaterialComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'baseColor', 'roughness': 'roughnessValue', 'metalness': 'metallicValue' };
  return buildStyledComponent('material', data, fieldStyle);
}

/** [Babylon.js] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function babylonAmbientLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [Babylon.js] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function babylonDirectionalLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'direction': 'dir' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [Babylon.js] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function babylonPointLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'position': 'at' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [Babylon.js] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function babylonSpotLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'angle': 'coneAngle' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [Babylon.js] Dựng component 'camera' theo quy ước đặt trường của thư viện. */
export function babylonCameraComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'fov': 'fovY', 'near': 'zNear', 'far': 'zFar' };
  return buildStyledComponent('camera', data, fieldStyle);
}

/** [Babylon.js] Dựng component 'points' theo quy ước đặt trường của thư viện. */
export function babylonPointsComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'count': 'count', 'size': 'pointSize' };
  return buildStyledComponent('points', data, fieldStyle);
}

/** [Babylon.js] Dựng component 'fog' theo quy ước đặt trường của thư viện. */
export function babylonFogComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'colorHex', 'near': 'startDist', 'far': 'endDist' };
  return buildStyledComponent('fog', data, fieldStyle);
}

/** [Babylon.js] Dựng component 'environment' theo quy ước đặt trường của thư viện. */
export function babylonEnvironmentComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'environmentMapUri': 'mapUri' };
  return buildStyledComponent('environment', data, fieldStyle);
}

/** [Babylon Native] Dựng component 'mesh' theo quy ước đặt trường của thư viện. */
export function babylonnativeMesh(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'id': 'name', 'positions': 'vertices', 'indices': 'triangles' };
  return buildStyledComponent('mesh', data, fieldStyle);
}

/** [Babylon Native] Dựng component 'material' theo quy ước đặt trường của thư viện. */
export function babylonnativeMaterialComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'baseColor', 'roughness': 'roughnessValue', 'metalness': 'metallicValue' };
  return buildStyledComponent('material', data, fieldStyle);
}

/** [Babylon Native] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function babylonnativeAmbientLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [Babylon Native] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function babylonnativeDirectionalLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'direction': 'dir' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [Babylon Native] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function babylonnativePointLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'position': 'at' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [Babylon Native] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function babylonnativeSpotLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'angle': 'coneAngle' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [Babylon Native] Dựng component 'camera' theo quy ước đặt trường của thư viện. */
export function babylonnativeCameraComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'fov': 'fovY', 'near': 'zNear', 'far': 'zFar' };
  return buildStyledComponent('camera', data, fieldStyle);
}

/** [Babylon Native] Dựng component 'points' theo quy ước đặt trường của thư viện. */
export function babylonnativePointsComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'count': 'count', 'size': 'pointSize' };
  return buildStyledComponent('points', data, fieldStyle);
}

/** [Babylon Native] Dựng component 'fog' theo quy ước đặt trường của thư viện. */
export function babylonnativeFogComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'colorHex', 'near': 'startDist', 'far': 'endDist' };
  return buildStyledComponent('fog', data, fieldStyle);
}

/** [Babylon Native] Dựng component 'environment' theo quy ước đặt trường của thư viện. */
export function babylonnativeEnvironmentComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'environmentMapUri': 'mapUri' };
  return buildStyledComponent('environment', data, fieldStyle);
}

/** [PlayCanvas Engine] Dựng component 'mesh' theo quy ước đặt trường của thư viện. */
export function playcanvasMesh(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'id': 'name', 'positions': 'vertices', 'indices': 'triangles' };
  return buildStyledComponent('mesh', data, fieldStyle);
}

/** [PlayCanvas Engine] Dựng component 'material' theo quy ước đặt trường của thư viện. */
export function playcanvasMaterialComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'baseColor', 'roughness': 'roughnessValue', 'metalness': 'metallicValue' };
  return buildStyledComponent('material', data, fieldStyle);
}

/** [PlayCanvas Engine] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function playcanvasAmbientLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [PlayCanvas Engine] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function playcanvasDirectionalLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'direction': 'dir' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [PlayCanvas Engine] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function playcanvasPointLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'position': 'at' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [PlayCanvas Engine] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function playcanvasSpotLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'angle': 'coneAngle' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [PlayCanvas Engine] Dựng component 'camera' theo quy ước đặt trường của thư viện. */
export function playcanvasCameraComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'fov': 'fovY', 'near': 'zNear', 'far': 'zFar' };
  return buildStyledComponent('camera', data, fieldStyle);
}

/** [PlayCanvas Engine] Dựng component 'points' theo quy ước đặt trường của thư viện. */
export function playcanvasPointsComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'count': 'count', 'size': 'pointSize' };
  return buildStyledComponent('points', data, fieldStyle);
}

/** [PlayCanvas Engine] Dựng component 'fog' theo quy ước đặt trường của thư viện. */
export function playcanvasFogComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'colorHex', 'near': 'startDist', 'far': 'endDist' };
  return buildStyledComponent('fog', data, fieldStyle);
}

/** [PlayCanvas Engine] Dựng component 'environment' theo quy ước đặt trường của thư viện. */
export function playcanvasEnvironmentComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'environmentMapUri': 'mapUri' };
  return buildStyledComponent('environment', data, fieldStyle);
}

/** [Verge3D] Dựng component 'mesh' theo quy ước đặt trường của thư viện. */
export function verge3dMesh(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'id': 'name', 'positions': 'vertices', 'indices': 'triangles' };
  return buildStyledComponent('mesh', data, fieldStyle);
}

/** [Verge3D] Dựng component 'material' theo quy ước đặt trường của thư viện. */
export function verge3dMaterialComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'baseColor', 'roughness': 'roughnessValue', 'metalness': 'metallicValue' };
  return buildStyledComponent('material', data, fieldStyle);
}

/** [Verge3D] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function verge3dAmbientLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [Verge3D] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function verge3dDirectionalLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'direction': 'dir' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [Verge3D] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function verge3dPointLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'position': 'at' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [Verge3D] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function verge3dSpotLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'angle': 'coneAngle' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [Verge3D] Dựng component 'camera' theo quy ước đặt trường của thư viện. */
export function verge3dCameraComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'fov': 'fovY', 'near': 'zNear', 'far': 'zFar' };
  return buildStyledComponent('camera', data, fieldStyle);
}

/** [Verge3D] Dựng component 'points' theo quy ước đặt trường của thư viện. */
export function verge3dPointsComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'count': 'count', 'size': 'pointSize' };
  return buildStyledComponent('points', data, fieldStyle);
}

/** [Verge3D] Dựng component 'fog' theo quy ước đặt trường của thư viện. */
export function verge3dFogComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'colorHex', 'near': 'startDist', 'far': 'endDist' };
  return buildStyledComponent('fog', data, fieldStyle);
}

/** [Verge3D] Dựng component 'environment' theo quy ước đặt trường của thư viện. */
export function verge3dEnvironmentComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'environmentMapUri': 'mapUri' };
  return buildStyledComponent('environment', data, fieldStyle);
}

/** [A-Frame] Dựng component 'mesh' theo quy ước đặt trường của thư viện. */
export function aframeMesh(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'id': 'name', 'positions': 'vertices', 'indices': 'triangles' };
  return buildStyledComponent('mesh', data, fieldStyle);
}

/** [A-Frame] Dựng component 'material' theo quy ước đặt trường của thư viện. */
export function aframeMaterialComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'baseColor', 'roughness': 'roughnessValue', 'metalness': 'metallicValue' };
  return buildStyledComponent('material', data, fieldStyle);
}

/** [A-Frame] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function aframeAmbientLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [A-Frame] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function aframeDirectionalLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'direction': 'dir' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [A-Frame] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function aframePointLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'position': 'at' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [A-Frame] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function aframeSpotLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'angle': 'coneAngle' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [A-Frame] Dựng component 'camera' theo quy ước đặt trường của thư viện. */
export function aframeCameraComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'fov': 'fovY', 'near': 'zNear', 'far': 'zFar' };
  return buildStyledComponent('camera', data, fieldStyle);
}

/** [A-Frame] Dựng component 'points' theo quy ước đặt trường của thư viện. */
export function aframePointsComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'count': 'count', 'size': 'pointSize' };
  return buildStyledComponent('points', data, fieldStyle);
}

/** [A-Frame] Dựng component 'fog' theo quy ước đặt trường của thư viện. */
export function aframeFogComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'colorHex', 'near': 'startDist', 'far': 'endDist' };
  return buildStyledComponent('fog', data, fieldStyle);
}

/** [A-Frame] Dựng component 'environment' theo quy ước đặt trường của thư viện. */
export function aframeEnvironmentComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'environmentMapUri': 'mapUri' };
  return buildStyledComponent('environment', data, fieldStyle);
}

/** [React Three Fiber] Dựng component 'mesh' theo quy ước đặt trường của thư viện. */
export function r3fMesh(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'id': 'name', 'positions': 'vertices', 'indices': 'triangles' };
  return buildStyledComponent('mesh', data, fieldStyle);
}

/** [React Three Fiber] Dựng component 'material' theo quy ước đặt trường của thư viện. */
export function r3fMaterialComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'baseColor', 'roughness': 'roughnessValue', 'metalness': 'metallicValue' };
  return buildStyledComponent('material', data, fieldStyle);
}

/** [React Three Fiber] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function r3fAmbientLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [React Three Fiber] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function r3fDirectionalLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'direction': 'dir' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [React Three Fiber] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function r3fPointLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'position': 'at' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [React Three Fiber] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function r3fSpotLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'angle': 'coneAngle' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [React Three Fiber] Dựng component 'camera' theo quy ước đặt trường của thư viện. */
export function r3fCameraComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'fov': 'fovY', 'near': 'zNear', 'far': 'zFar' };
  return buildStyledComponent('camera', data, fieldStyle);
}

/** [React Three Fiber] Dựng component 'points' theo quy ước đặt trường của thư viện. */
export function r3fPointsComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'count': 'count', 'size': 'pointSize' };
  return buildStyledComponent('points', data, fieldStyle);
}

/** [React Three Fiber] Dựng component 'fog' theo quy ước đặt trường của thư viện. */
export function r3fFogComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'colorHex', 'near': 'startDist', 'far': 'endDist' };
  return buildStyledComponent('fog', data, fieldStyle);
}

/** [React Three Fiber] Dựng component 'environment' theo quy ước đặt trường của thư viện. */
export function r3fEnvironmentComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'environmentMapUri': 'mapUri' };
  return buildStyledComponent('environment', data, fieldStyle);
}

/** [Threlte] Dựng component 'mesh' theo quy ước đặt trường của thư viện. */
export function threlteMesh(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'id': 'name', 'positions': 'vertices', 'indices': 'triangles' };
  return buildStyledComponent('mesh', data, fieldStyle);
}

/** [Threlte] Dựng component 'material' theo quy ước đặt trường của thư viện. */
export function threlteMaterialComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'baseColor', 'roughness': 'roughnessValue', 'metalness': 'metallicValue' };
  return buildStyledComponent('material', data, fieldStyle);
}

/** [Threlte] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function threlteAmbientLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [Threlte] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function threlteDirectionalLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'direction': 'dir' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [Threlte] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function threltePointLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'position': 'at' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [Threlte] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function threlteSpotLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'angle': 'coneAngle' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [Threlte] Dựng component 'camera' theo quy ước đặt trường của thư viện. */
export function threlteCameraComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'fov': 'fovY', 'near': 'zNear', 'far': 'zFar' };
  return buildStyledComponent('camera', data, fieldStyle);
}

/** [Threlte] Dựng component 'points' theo quy ước đặt trường của thư viện. */
export function threltePointsComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'count': 'count', 'size': 'pointSize' };
  return buildStyledComponent('points', data, fieldStyle);
}

/** [Threlte] Dựng component 'fog' theo quy ước đặt trường của thư viện. */
export function threlteFogComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'colorHex', 'near': 'startDist', 'far': 'endDist' };
  return buildStyledComponent('fog', data, fieldStyle);
}

/** [Threlte] Dựng component 'environment' theo quy ước đặt trường của thư viện. */
export function threlteEnvironmentComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'environmentMapUri': 'mapUri' };
  return buildStyledComponent('environment', data, fieldStyle);
}

/** [OGL] Dựng component 'mesh' theo quy ước đặt trường của thư viện. */
export function oglMesh(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'id': 'name', 'positions': 'vertices', 'indices': 'triangles' };
  return buildStyledComponent('mesh', data, fieldStyle);
}

/** [OGL] Dựng component 'material' theo quy ước đặt trường của thư viện. */
export function oglMaterialComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'baseColor', 'roughness': 'roughnessValue', 'metalness': 'metallicValue' };
  return buildStyledComponent('material', data, fieldStyle);
}

/** [OGL] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function oglAmbientLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [OGL] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function oglDirectionalLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'direction': 'dir' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [OGL] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function oglPointLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'position': 'at' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [OGL] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function oglSpotLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'angle': 'coneAngle' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [OGL] Dựng component 'camera' theo quy ước đặt trường của thư viện. */
export function oglCameraComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'fov': 'fovY', 'near': 'zNear', 'far': 'zFar' };
  return buildStyledComponent('camera', data, fieldStyle);
}

/** [OGL] Dựng component 'points' theo quy ước đặt trường của thư viện. */
export function oglPointsComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'count': 'count', 'size': 'pointSize' };
  return buildStyledComponent('points', data, fieldStyle);
}

/** [OGL] Dựng component 'fog' theo quy ước đặt trường của thư viện. */
export function oglFogComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'colorHex', 'near': 'startDist', 'far': 'endDist' };
  return buildStyledComponent('fog', data, fieldStyle);
}

/** [OGL] Dựng component 'environment' theo quy ước đặt trường của thư viện. */
export function oglEnvironmentComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'environmentMapUri': 'mapUri' };
  return buildStyledComponent('environment', data, fieldStyle);
}

/** [regl] Dựng component 'mesh' theo quy ước đặt trường của thư viện. */
export function reglMesh(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'id': 'name', 'positions': 'vertices', 'indices': 'triangles' };
  return buildStyledComponent('mesh', data, fieldStyle);
}

/** [regl] Dựng component 'material' theo quy ước đặt trường của thư viện. */
export function reglMaterialComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'baseColor', 'roughness': 'roughnessValue', 'metalness': 'metallicValue' };
  return buildStyledComponent('material', data, fieldStyle);
}

/** [regl] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function reglAmbientLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [regl] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function reglDirectionalLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'direction': 'dir' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [regl] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function reglPointLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'position': 'at' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [regl] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function reglSpotLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'angle': 'coneAngle' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [regl] Dựng component 'camera' theo quy ước đặt trường của thư viện. */
export function reglCameraComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'fov': 'fovY', 'near': 'zNear', 'far': 'zFar' };
  return buildStyledComponent('camera', data, fieldStyle);
}

/** [regl] Dựng component 'points' theo quy ước đặt trường của thư viện. */
export function reglPointsComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'count': 'count', 'size': 'pointSize' };
  return buildStyledComponent('points', data, fieldStyle);
}

/** [regl] Dựng component 'fog' theo quy ước đặt trường của thư viện. */
export function reglFogComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'colorHex', 'near': 'startDist', 'far': 'endDist' };
  return buildStyledComponent('fog', data, fieldStyle);
}

/** [regl] Dựng component 'environment' theo quy ước đặt trường của thư viện. */
export function reglEnvironmentComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'environmentMapUri': 'mapUri' };
  return buildStyledComponent('environment', data, fieldStyle);
}

/** [twgl.js] Dựng component 'mesh' theo quy ước đặt trường của thư viện. */
export function twglMesh(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'id': 'name', 'positions': 'vertices', 'indices': 'triangles' };
  return buildStyledComponent('mesh', data, fieldStyle);
}

/** [twgl.js] Dựng component 'material' theo quy ước đặt trường của thư viện. */
export function twglMaterialComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'baseColor', 'roughness': 'roughnessValue', 'metalness': 'metallicValue' };
  return buildStyledComponent('material', data, fieldStyle);
}

/** [twgl.js] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function twglAmbientLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [twgl.js] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function twglDirectionalLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'direction': 'dir' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [twgl.js] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function twglPointLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'position': 'at' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [twgl.js] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function twglSpotLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'angle': 'coneAngle' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [twgl.js] Dựng component 'camera' theo quy ước đặt trường của thư viện. */
export function twglCameraComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'fov': 'fovY', 'near': 'zNear', 'far': 'zFar' };
  return buildStyledComponent('camera', data, fieldStyle);
}

/** [twgl.js] Dựng component 'points' theo quy ước đặt trường của thư viện. */
export function twglPointsComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'count': 'count', 'size': 'pointSize' };
  return buildStyledComponent('points', data, fieldStyle);
}

/** [twgl.js] Dựng component 'fog' theo quy ước đặt trường của thư viện. */
export function twglFogComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'colorHex', 'near': 'startDist', 'far': 'endDist' };
  return buildStyledComponent('fog', data, fieldStyle);
}

/** [twgl.js] Dựng component 'environment' theo quy ước đặt trường của thư viện. */
export function twglEnvironmentComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'environmentMapUri': 'mapUri' };
  return buildStyledComponent('environment', data, fieldStyle);
}

/** [luma.gl] Dựng component 'mesh' theo quy ước đặt trường của thư viện. */
export function lumaMesh(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'id': 'name', 'positions': 'vertices', 'indices': 'triangles' };
  return buildStyledComponent('mesh', data, fieldStyle);
}

/** [luma.gl] Dựng component 'material' theo quy ước đặt trường của thư viện. */
export function lumaMaterialComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'baseColor', 'roughness': 'roughnessValue', 'metalness': 'metallicValue' };
  return buildStyledComponent('material', data, fieldStyle);
}

/** [luma.gl] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function lumaAmbientLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [luma.gl] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function lumaDirectionalLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'direction': 'dir' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [luma.gl] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function lumaPointLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'position': 'at' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [luma.gl] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function lumaSpotLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'angle': 'coneAngle' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [luma.gl] Dựng component 'camera' theo quy ước đặt trường của thư viện. */
export function lumaCameraComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'fov': 'fovY', 'near': 'zNear', 'far': 'zFar' };
  return buildStyledComponent('camera', data, fieldStyle);
}

/** [luma.gl] Dựng component 'points' theo quy ước đặt trường của thư viện. */
export function lumaPointsComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'count': 'count', 'size': 'pointSize' };
  return buildStyledComponent('points', data, fieldStyle);
}

/** [luma.gl] Dựng component 'fog' theo quy ước đặt trường của thư viện. */
export function lumaFogComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'colorHex', 'near': 'startDist', 'far': 'endDist' };
  return buildStyledComponent('fog', data, fieldStyle);
}

/** [luma.gl] Dựng component 'environment' theo quy ước đặt trường của thư viện. */
export function lumaEnvironmentComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'environmentMapUri': 'mapUri' };
  return buildStyledComponent('environment', data, fieldStyle);
}

/** [vtk.js] Dựng component 'mesh' theo quy ước đặt trường của thư viện. */
export function vtkMesh(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'id': 'name', 'positions': 'vertices', 'indices': 'triangles' };
  return buildStyledComponent('mesh', data, fieldStyle);
}

/** [vtk.js] Dựng component 'material' theo quy ước đặt trường của thư viện. */
export function vtkMaterialComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'baseColor', 'roughness': 'roughnessValue', 'metalness': 'metallicValue' };
  return buildStyledComponent('material', data, fieldStyle);
}

/** [vtk.js] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function vtkAmbientLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [vtk.js] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function vtkDirectionalLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'direction': 'dir' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [vtk.js] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function vtkPointLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'position': 'at' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [vtk.js] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function vtkSpotLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'angle': 'coneAngle' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [vtk.js] Dựng component 'camera' theo quy ước đặt trường của thư viện. */
export function vtkCameraComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'fov': 'fovY', 'near': 'zNear', 'far': 'zFar' };
  return buildStyledComponent('camera', data, fieldStyle);
}

/** [vtk.js] Dựng component 'points' theo quy ước đặt trường của thư viện. */
export function vtkPointsComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'count': 'count', 'size': 'pointSize' };
  return buildStyledComponent('points', data, fieldStyle);
}

/** [vtk.js] Dựng component 'fog' theo quy ước đặt trường của thư viện. */
export function vtkFogComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'colorHex', 'near': 'startDist', 'far': 'endDist' };
  return buildStyledComponent('fog', data, fieldStyle);
}

/** [vtk.js] Dựng component 'environment' theo quy ước đặt trường của thư viện. */
export function vtkEnvironmentComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'environmentMapUri': 'mapUri' };
  return buildStyledComponent('environment', data, fieldStyle);
}

/** [deck.gl] Dựng component 'mesh' theo quy ước đặt trường của thư viện. */
export function deckMesh(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'id': 'name', 'positions': 'vertices', 'indices': 'triangles' };
  return buildStyledComponent('mesh', data, fieldStyle);
}

/** [deck.gl] Dựng component 'material' theo quy ước đặt trường của thư viện. */
export function deckMaterialComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'baseColor', 'roughness': 'roughnessValue', 'metalness': 'metallicValue' };
  return buildStyledComponent('material', data, fieldStyle);
}

/** [deck.gl] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function deckAmbientLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [deck.gl] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function deckDirectionalLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'direction': 'dir' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [deck.gl] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function deckPointLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'position': 'at' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [deck.gl] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function deckSpotLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'angle': 'coneAngle' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [deck.gl] Dựng component 'camera' theo quy ước đặt trường của thư viện. */
export function deckCameraComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'fov': 'fovY', 'near': 'zNear', 'far': 'zFar' };
  return buildStyledComponent('camera', data, fieldStyle);
}

/** [deck.gl] Dựng component 'points' theo quy ước đặt trường của thư viện. */
export function deckPointsComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'count': 'count', 'size': 'pointSize' };
  return buildStyledComponent('points', data, fieldStyle);
}

/** [deck.gl] Dựng component 'fog' theo quy ước đặt trường của thư viện. */
export function deckFogComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'colorHex', 'near': 'startDist', 'far': 'endDist' };
  return buildStyledComponent('fog', data, fieldStyle);
}

/** [deck.gl] Dựng component 'environment' theo quy ước đặt trường của thư viện. */
export function deckEnvironmentComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'environmentMapUri': 'mapUri' };
  return buildStyledComponent('environment', data, fieldStyle);
}

/** [xeokit] Dựng component 'mesh' theo quy ước đặt trường của thư viện. */
export function xeokitMesh(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'id': 'name', 'positions': 'vertices', 'indices': 'triangles' };
  return buildStyledComponent('mesh', data, fieldStyle);
}

/** [xeokit] Dựng component 'material' theo quy ước đặt trường của thư viện. */
export function xeokitMaterialComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'baseColor', 'roughness': 'roughnessValue', 'metalness': 'metallicValue' };
  return buildStyledComponent('material', data, fieldStyle);
}

/** [xeokit] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function xeokitAmbientLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [xeokit] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function xeokitDirectionalLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'direction': 'dir' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [xeokit] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function xeokitPointLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'position': 'at' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [xeokit] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function xeokitSpotLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'angle': 'coneAngle' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [xeokit] Dựng component 'camera' theo quy ước đặt trường của thư viện. */
export function xeokitCameraComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'fov': 'fovY', 'near': 'zNear', 'far': 'zFar' };
  return buildStyledComponent('camera', data, fieldStyle);
}

/** [xeokit] Dựng component 'points' theo quy ước đặt trường của thư viện. */
export function xeokitPointsComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'count': 'count', 'size': 'pointSize' };
  return buildStyledComponent('points', data, fieldStyle);
}

/** [xeokit] Dựng component 'fog' theo quy ước đặt trường của thư viện. */
export function xeokitFogComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'colorHex', 'near': 'startDist', 'far': 'endDist' };
  return buildStyledComponent('fog', data, fieldStyle);
}

/** [xeokit] Dựng component 'environment' theo quy ước đặt trường của thư viện. */
export function xeokitEnvironmentComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'environmentMapUri': 'mapUri' };
  return buildStyledComponent('environment', data, fieldStyle);
}

/** [CesiumJS] Dựng component 'mesh' theo quy ước đặt trường của thư viện. */
export function cesiumMesh(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'id': 'name', 'positions': 'vertices', 'indices': 'triangles' };
  return buildStyledComponent('mesh', data, fieldStyle);
}

/** [CesiumJS] Dựng component 'material' theo quy ước đặt trường của thư viện. */
export function cesiumMaterialComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'baseColor', 'roughness': 'roughnessValue', 'metalness': 'metallicValue' };
  return buildStyledComponent('material', data, fieldStyle);
}

/** [CesiumJS] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function cesiumAmbientLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [CesiumJS] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function cesiumDirectionalLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'direction': 'dir' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [CesiumJS] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function cesiumPointLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'position': 'at' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [CesiumJS] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function cesiumSpotLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'angle': 'coneAngle' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [CesiumJS] Dựng component 'camera' theo quy ước đặt trường của thư viện. */
export function cesiumCameraComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'fov': 'fovY', 'near': 'zNear', 'far': 'zFar' };
  return buildStyledComponent('camera', data, fieldStyle);
}

/** [CesiumJS] Dựng component 'points' theo quy ước đặt trường của thư viện. */
export function cesiumPointsComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'count': 'count', 'size': 'pointSize' };
  return buildStyledComponent('points', data, fieldStyle);
}

/** [CesiumJS] Dựng component 'fog' theo quy ước đặt trường của thư viện. */
export function cesiumFogComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'colorHex', 'near': 'startDist', 'far': 'endDist' };
  return buildStyledComponent('fog', data, fieldStyle);
}

/** [CesiumJS] Dựng component 'environment' theo quy ước đặt trường của thư viện. */
export function cesiumEnvironmentComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'environmentMapUri': 'mapUri' };
  return buildStyledComponent('environment', data, fieldStyle);
}

/** [Zdog] Dựng component 'mesh' theo quy ước đặt trường của thư viện. */
export function zdogMesh(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'id': 'name', 'positions': 'vertices', 'indices': 'triangles' };
  return buildStyledComponent('mesh', data, fieldStyle);
}

/** [Zdog] Dựng component 'material' theo quy ước đặt trường của thư viện. */
export function zdogMaterialComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'baseColor', 'roughness': 'roughnessValue', 'metalness': 'metallicValue' };
  return buildStyledComponent('material', data, fieldStyle);
}

/** [Zdog] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function zdogAmbientLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [Zdog] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function zdogDirectionalLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'direction': 'dir' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [Zdog] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function zdogPointLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'position': 'at' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [Zdog] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function zdogSpotLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'angle': 'coneAngle' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [Zdog] Dựng component 'camera' theo quy ước đặt trường của thư viện. */
export function zdogCameraComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'fov': 'fovY', 'near': 'zNear', 'far': 'zFar' };
  return buildStyledComponent('camera', data, fieldStyle);
}

/** [Zdog] Dựng component 'points' theo quy ước đặt trường của thư viện. */
export function zdogPointsComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'count': 'count', 'size': 'pointSize' };
  return buildStyledComponent('points', data, fieldStyle);
}

/** [Zdog] Dựng component 'fog' theo quy ước đặt trường của thư viện. */
export function zdogFogComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'colorHex', 'near': 'startDist', 'far': 'endDist' };
  return buildStyledComponent('fog', data, fieldStyle);
}

/** [Zdog] Dựng component 'environment' theo quy ước đặt trường của thư viện. */
export function zdogEnvironmentComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'environmentMapUri': 'mapUri' };
  return buildStyledComponent('environment', data, fieldStyle);
}

/** [Filament] Dựng component 'mesh' theo quy ước đặt trường của thư viện. */
export function filamentMesh(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'id': 'name', 'positions': 'vertices', 'indices': 'triangles' };
  return buildStyledComponent('mesh', data, fieldStyle);
}

/** [Filament] Dựng component 'material' theo quy ước đặt trường của thư viện. */
export function filamentMaterialComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'baseColor', 'roughness': 'roughnessValue', 'metalness': 'metallicValue' };
  return buildStyledComponent('material', data, fieldStyle);
}

/** [Filament] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function filamentAmbientLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [Filament] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function filamentDirectionalLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'direction': 'dir' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [Filament] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function filamentPointLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'position': 'at' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [Filament] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function filamentSpotLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'angle': 'coneAngle' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [Filament] Dựng component 'camera' theo quy ước đặt trường của thư viện. */
export function filamentCameraComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'fov': 'fovY', 'near': 'zNear', 'far': 'zFar' };
  return buildStyledComponent('camera', data, fieldStyle);
}

/** [Filament] Dựng component 'points' theo quy ước đặt trường của thư viện. */
export function filamentPointsComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'count': 'count', 'size': 'pointSize' };
  return buildStyledComponent('points', data, fieldStyle);
}

/** [Filament] Dựng component 'fog' theo quy ước đặt trường của thư viện. */
export function filamentFogComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'colorHex', 'near': 'startDist', 'far': 'endDist' };
  return buildStyledComponent('fog', data, fieldStyle);
}

/** [Filament] Dựng component 'environment' theo quy ước đặt trường của thư viện. */
export function filamentEnvironmentComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'environmentMapUri': 'mapUri' };
  return buildStyledComponent('environment', data, fieldStyle);
}

/** [OpenSceneGraph] Dựng component 'mesh' theo quy ước đặt trường của thư viện. */
export function osgMesh(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'id': 'name', 'positions': 'vertices', 'indices': 'triangles' };
  return buildStyledComponent('mesh', data, fieldStyle);
}

/** [OpenSceneGraph] Dựng component 'material' theo quy ước đặt trường của thư viện. */
export function osgMaterialComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'baseColor', 'roughness': 'roughnessValue', 'metalness': 'metallicValue' };
  return buildStyledComponent('material', data, fieldStyle);
}

/** [OpenSceneGraph] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function osgAmbientLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [OpenSceneGraph] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function osgDirectionalLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'direction': 'dir' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [OpenSceneGraph] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function osgPointLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'position': 'at' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [OpenSceneGraph] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function osgSpotLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'angle': 'coneAngle' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [OpenSceneGraph] Dựng component 'camera' theo quy ước đặt trường của thư viện. */
export function osgCameraComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'fov': 'fovY', 'near': 'zNear', 'far': 'zFar' };
  return buildStyledComponent('camera', data, fieldStyle);
}

/** [OpenSceneGraph] Dựng component 'points' theo quy ước đặt trường của thư viện. */
export function osgPointsComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'count': 'count', 'size': 'pointSize' };
  return buildStyledComponent('points', data, fieldStyle);
}

/** [OpenSceneGraph] Dựng component 'fog' theo quy ước đặt trường của thư viện. */
export function osgFogComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'colorHex', 'near': 'startDist', 'far': 'endDist' };
  return buildStyledComponent('fog', data, fieldStyle);
}

/** [OpenSceneGraph] Dựng component 'environment' theo quy ước đặt trường của thư viện. */
export function osgEnvironmentComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'environmentMapUri': 'mapUri' };
  return buildStyledComponent('environment', data, fieldStyle);
}

/** [OGRE] Dựng component 'mesh' theo quy ước đặt trường của thư viện. */
export function ogreMesh(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'id': 'name', 'positions': 'vertices', 'indices': 'triangles' };
  return buildStyledComponent('mesh', data, fieldStyle);
}

/** [OGRE] Dựng component 'material' theo quy ước đặt trường của thư viện. */
export function ogreMaterialComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'baseColor', 'roughness': 'roughnessValue', 'metalness': 'metallicValue' };
  return buildStyledComponent('material', data, fieldStyle);
}

/** [OGRE] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function ogreAmbientLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [OGRE] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function ogreDirectionalLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'direction': 'dir' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [OGRE] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function ogrePointLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'position': 'at' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [OGRE] Dựng component 'light' theo quy ước đặt trường của thư viện. */
export function ogreSpotLightComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'kind': 'kind', 'angle': 'coneAngle' };
  return buildStyledComponent('light', data, fieldStyle);
}

/** [OGRE] Dựng component 'camera' theo quy ước đặt trường của thư viện. */
export function ogreCameraComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'fov': 'fovY', 'near': 'zNear', 'far': 'zFar' };
  return buildStyledComponent('camera', data, fieldStyle);
}

/** [OGRE] Dựng component 'points' theo quy ước đặt trường của thư viện. */
export function ogrePointsComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'count': 'count', 'size': 'pointSize' };
  return buildStyledComponent('points', data, fieldStyle);
}

/** [OGRE] Dựng component 'fog' theo quy ước đặt trường của thư viện. */
export function ogreFogComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'color': 'colorHex', 'near': 'startDist', 'far': 'endDist' };
  return buildStyledComponent('fog', data, fieldStyle);
}

/** [OGRE] Dựng component 'environment' theo quy ước đặt trường của thư viện. */
export function ogreEnvironmentComponent(data: Record<string, unknown>): Record<string, unknown> {
  const fieldStyle: Record<string, string> = { 'environmentMapUri': 'mapUri' };
  return buildStyledComponent('environment', data, fieldStyle);
}
