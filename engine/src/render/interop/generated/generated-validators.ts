/**
 * @file generated-validators.ts
 * @module @aetheria/engine/render/interop/generated
 * @description SINH TỰ ĐỘNG bởi `scripts/generate-interop-matrix.mjs` — KHÔNG
 * sửa tay. Mỗi hàm ủy quyền vào `matrix-core.ts` / `animation`; quy ước riêng
 * của từng thư viện (trục lên, tay hệ trục, đơn vị, prefix event) lấy từ bảng
 * trong script. Chạy lại script sau khi đổi bảng hoặc core.
 */
import {
  validatePayloadKeys,
  validateMeshList,
  validateLightList,
  validateCameraDescriptor,
} from '../matrix-core.js';


/** [Three.js] Kiểm tra payload scene có đủ khóa chuẩn. */
export function validateThreeScenePayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['meshes', 'lights', 'camera']);
}

/** [Three.js] Kiểm tra payload animation (name/duration/channels...). */
export function validateThreeAnimationPayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['name', 'duration']);
}

/** [Three.js] Kiểm tra danh sách mesh descriptor trung gian. */
export function validateThreeMeshNodes(meshes: unknown): boolean {
  return validateMeshList(meshes);
}

/** [Three.js] Kiểm tra danh sách light descriptor trung gian. */
export function validateThreeLights(lights: unknown): boolean {
  return validateLightList(lights);
}

/** [Three.js] Kiểm tra descriptor camera trung gian. */
export function validateThreeCamera(camera: unknown): boolean {
  return validateCameraDescriptor(camera);
}

/** [Babylon.js] Kiểm tra payload scene có đủ khóa chuẩn. */
export function validateBabylonScenePayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['meshes', 'lights', 'camera']);
}

/** [Babylon.js] Kiểm tra payload animation (name/duration/channels...). */
export function validateBabylonAnimationPayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['name', 'duration']);
}

/** [Babylon.js] Kiểm tra danh sách mesh descriptor trung gian. */
export function validateBabylonMeshNodes(meshes: unknown): boolean {
  return validateMeshList(meshes);
}

/** [Babylon.js] Kiểm tra danh sách light descriptor trung gian. */
export function validateBabylonLights(lights: unknown): boolean {
  return validateLightList(lights);
}

/** [Babylon.js] Kiểm tra descriptor camera trung gian. */
export function validateBabylonCamera(camera: unknown): boolean {
  return validateCameraDescriptor(camera);
}

/** [Babylon Native] Kiểm tra payload scene có đủ khóa chuẩn. */
export function validateBabylonNativeScenePayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['meshes', 'lights', 'camera']);
}

/** [Babylon Native] Kiểm tra payload animation (name/duration/channels...). */
export function validateBabylonNativeAnimationPayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['name', 'duration']);
}

/** [Babylon Native] Kiểm tra danh sách mesh descriptor trung gian. */
export function validateBabylonNativeMeshNodes(meshes: unknown): boolean {
  return validateMeshList(meshes);
}

/** [Babylon Native] Kiểm tra danh sách light descriptor trung gian. */
export function validateBabylonNativeLights(lights: unknown): boolean {
  return validateLightList(lights);
}

/** [Babylon Native] Kiểm tra descriptor camera trung gian. */
export function validateBabylonNativeCamera(camera: unknown): boolean {
  return validateCameraDescriptor(camera);
}

/** [PlayCanvas Engine] Kiểm tra payload scene có đủ khóa chuẩn. */
export function validatePlaycanvasScenePayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['meshes', 'lights', 'camera']);
}

/** [PlayCanvas Engine] Kiểm tra payload animation (name/duration/channels...). */
export function validatePlaycanvasAnimationPayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['name', 'duration']);
}

/** [PlayCanvas Engine] Kiểm tra danh sách mesh descriptor trung gian. */
export function validatePlaycanvasMeshNodes(meshes: unknown): boolean {
  return validateMeshList(meshes);
}

/** [PlayCanvas Engine] Kiểm tra danh sách light descriptor trung gian. */
export function validatePlaycanvasLights(lights: unknown): boolean {
  return validateLightList(lights);
}

/** [PlayCanvas Engine] Kiểm tra descriptor camera trung gian. */
export function validatePlaycanvasCamera(camera: unknown): boolean {
  return validateCameraDescriptor(camera);
}

/** [Verge3D] Kiểm tra payload scene có đủ khóa chuẩn. */
export function validateVerge3dScenePayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['meshes', 'lights', 'camera']);
}

/** [Verge3D] Kiểm tra payload animation (name/duration/channels...). */
export function validateVerge3dAnimationPayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['name', 'duration']);
}

/** [Verge3D] Kiểm tra danh sách mesh descriptor trung gian. */
export function validateVerge3dMeshNodes(meshes: unknown): boolean {
  return validateMeshList(meshes);
}

/** [Verge3D] Kiểm tra danh sách light descriptor trung gian. */
export function validateVerge3dLights(lights: unknown): boolean {
  return validateLightList(lights);
}

/** [Verge3D] Kiểm tra descriptor camera trung gian. */
export function validateVerge3dCamera(camera: unknown): boolean {
  return validateCameraDescriptor(camera);
}

/** [A-Frame] Kiểm tra payload scene có đủ khóa chuẩn. */
export function validateAframeScenePayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['meshes', 'lights', 'camera']);
}

/** [A-Frame] Kiểm tra payload animation (name/duration/channels...). */
export function validateAframeAnimationPayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['name', 'duration']);
}

/** [A-Frame] Kiểm tra danh sách mesh descriptor trung gian. */
export function validateAframeMeshNodes(meshes: unknown): boolean {
  return validateMeshList(meshes);
}

/** [A-Frame] Kiểm tra danh sách light descriptor trung gian. */
export function validateAframeLights(lights: unknown): boolean {
  return validateLightList(lights);
}

/** [A-Frame] Kiểm tra descriptor camera trung gian. */
export function validateAframeCamera(camera: unknown): boolean {
  return validateCameraDescriptor(camera);
}

/** [React Three Fiber] Kiểm tra payload scene có đủ khóa chuẩn. */
export function validateR3fScenePayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['meshes', 'lights', 'camera']);
}

/** [React Three Fiber] Kiểm tra payload animation (name/duration/channels...). */
export function validateR3fAnimationPayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['name', 'duration']);
}

/** [React Three Fiber] Kiểm tra danh sách mesh descriptor trung gian. */
export function validateR3fMeshNodes(meshes: unknown): boolean {
  return validateMeshList(meshes);
}

/** [React Three Fiber] Kiểm tra danh sách light descriptor trung gian. */
export function validateR3fLights(lights: unknown): boolean {
  return validateLightList(lights);
}

/** [React Three Fiber] Kiểm tra descriptor camera trung gian. */
export function validateR3fCamera(camera: unknown): boolean {
  return validateCameraDescriptor(camera);
}

/** [Threlte] Kiểm tra payload scene có đủ khóa chuẩn. */
export function validateThrelteScenePayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['meshes', 'lights', 'camera']);
}

/** [Threlte] Kiểm tra payload animation (name/duration/channels...). */
export function validateThrelteAnimationPayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['name', 'duration']);
}

/** [Threlte] Kiểm tra danh sách mesh descriptor trung gian. */
export function validateThrelteMeshNodes(meshes: unknown): boolean {
  return validateMeshList(meshes);
}

/** [Threlte] Kiểm tra danh sách light descriptor trung gian. */
export function validateThrelteLights(lights: unknown): boolean {
  return validateLightList(lights);
}

/** [Threlte] Kiểm tra descriptor camera trung gian. */
export function validateThrelteCamera(camera: unknown): boolean {
  return validateCameraDescriptor(camera);
}

/** [OGL] Kiểm tra payload scene có đủ khóa chuẩn. */
export function validateOglScenePayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['meshes', 'lights', 'camera']);
}

/** [OGL] Kiểm tra payload animation (name/duration/channels...). */
export function validateOglAnimationPayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['name', 'duration']);
}

/** [OGL] Kiểm tra danh sách mesh descriptor trung gian. */
export function validateOglMeshNodes(meshes: unknown): boolean {
  return validateMeshList(meshes);
}

/** [OGL] Kiểm tra danh sách light descriptor trung gian. */
export function validateOglLights(lights: unknown): boolean {
  return validateLightList(lights);
}

/** [OGL] Kiểm tra descriptor camera trung gian. */
export function validateOglCamera(camera: unknown): boolean {
  return validateCameraDescriptor(camera);
}

/** [regl] Kiểm tra payload scene có đủ khóa chuẩn. */
export function validateReglScenePayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['meshes', 'lights', 'camera']);
}

/** [regl] Kiểm tra payload animation (name/duration/channels...). */
export function validateReglAnimationPayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['name', 'duration']);
}

/** [regl] Kiểm tra danh sách mesh descriptor trung gian. */
export function validateReglMeshNodes(meshes: unknown): boolean {
  return validateMeshList(meshes);
}

/** [regl] Kiểm tra danh sách light descriptor trung gian. */
export function validateReglLights(lights: unknown): boolean {
  return validateLightList(lights);
}

/** [regl] Kiểm tra descriptor camera trung gian. */
export function validateReglCamera(camera: unknown): boolean {
  return validateCameraDescriptor(camera);
}

/** [twgl.js] Kiểm tra payload scene có đủ khóa chuẩn. */
export function validateTwglScenePayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['meshes', 'lights', 'camera']);
}

/** [twgl.js] Kiểm tra payload animation (name/duration/channels...). */
export function validateTwglAnimationPayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['name', 'duration']);
}

/** [twgl.js] Kiểm tra danh sách mesh descriptor trung gian. */
export function validateTwglMeshNodes(meshes: unknown): boolean {
  return validateMeshList(meshes);
}

/** [twgl.js] Kiểm tra danh sách light descriptor trung gian. */
export function validateTwglLights(lights: unknown): boolean {
  return validateLightList(lights);
}

/** [twgl.js] Kiểm tra descriptor camera trung gian. */
export function validateTwglCamera(camera: unknown): boolean {
  return validateCameraDescriptor(camera);
}

/** [luma.gl] Kiểm tra payload scene có đủ khóa chuẩn. */
export function validateLumaScenePayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['meshes', 'lights', 'camera']);
}

/** [luma.gl] Kiểm tra payload animation (name/duration/channels...). */
export function validateLumaAnimationPayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['name', 'duration']);
}

/** [luma.gl] Kiểm tra danh sách mesh descriptor trung gian. */
export function validateLumaMeshNodes(meshes: unknown): boolean {
  return validateMeshList(meshes);
}

/** [luma.gl] Kiểm tra danh sách light descriptor trung gian. */
export function validateLumaLights(lights: unknown): boolean {
  return validateLightList(lights);
}

/** [luma.gl] Kiểm tra descriptor camera trung gian. */
export function validateLumaCamera(camera: unknown): boolean {
  return validateCameraDescriptor(camera);
}

/** [vtk.js] Kiểm tra payload scene có đủ khóa chuẩn. */
export function validateVtkScenePayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['meshes', 'lights', 'camera']);
}

/** [vtk.js] Kiểm tra payload animation (name/duration/channels...). */
export function validateVtkAnimationPayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['name', 'duration']);
}

/** [vtk.js] Kiểm tra danh sách mesh descriptor trung gian. */
export function validateVtkMeshNodes(meshes: unknown): boolean {
  return validateMeshList(meshes);
}

/** [vtk.js] Kiểm tra danh sách light descriptor trung gian. */
export function validateVtkLights(lights: unknown): boolean {
  return validateLightList(lights);
}

/** [vtk.js] Kiểm tra descriptor camera trung gian. */
export function validateVtkCamera(camera: unknown): boolean {
  return validateCameraDescriptor(camera);
}

/** [deck.gl] Kiểm tra payload scene có đủ khóa chuẩn. */
export function validateDeckScenePayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['meshes', 'lights', 'camera']);
}

/** [deck.gl] Kiểm tra payload animation (name/duration/channels...). */
export function validateDeckAnimationPayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['name', 'duration']);
}

/** [deck.gl] Kiểm tra danh sách mesh descriptor trung gian. */
export function validateDeckMeshNodes(meshes: unknown): boolean {
  return validateMeshList(meshes);
}

/** [deck.gl] Kiểm tra danh sách light descriptor trung gian. */
export function validateDeckLights(lights: unknown): boolean {
  return validateLightList(lights);
}

/** [deck.gl] Kiểm tra descriptor camera trung gian. */
export function validateDeckCamera(camera: unknown): boolean {
  return validateCameraDescriptor(camera);
}

/** [xeokit] Kiểm tra payload scene có đủ khóa chuẩn. */
export function validateXeokitScenePayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['meshes', 'lights', 'camera']);
}

/** [xeokit] Kiểm tra payload animation (name/duration/channels...). */
export function validateXeokitAnimationPayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['name', 'duration']);
}

/** [xeokit] Kiểm tra danh sách mesh descriptor trung gian. */
export function validateXeokitMeshNodes(meshes: unknown): boolean {
  return validateMeshList(meshes);
}

/** [xeokit] Kiểm tra danh sách light descriptor trung gian. */
export function validateXeokitLights(lights: unknown): boolean {
  return validateLightList(lights);
}

/** [xeokit] Kiểm tra descriptor camera trung gian. */
export function validateXeokitCamera(camera: unknown): boolean {
  return validateCameraDescriptor(camera);
}

/** [CesiumJS] Kiểm tra payload scene có đủ khóa chuẩn. */
export function validateCesiumScenePayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['meshes', 'lights', 'camera']);
}

/** [CesiumJS] Kiểm tra payload animation (name/duration/channels...). */
export function validateCesiumAnimationPayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['name', 'duration']);
}

/** [CesiumJS] Kiểm tra danh sách mesh descriptor trung gian. */
export function validateCesiumMeshNodes(meshes: unknown): boolean {
  return validateMeshList(meshes);
}

/** [CesiumJS] Kiểm tra danh sách light descriptor trung gian. */
export function validateCesiumLights(lights: unknown): boolean {
  return validateLightList(lights);
}

/** [CesiumJS] Kiểm tra descriptor camera trung gian. */
export function validateCesiumCamera(camera: unknown): boolean {
  return validateCameraDescriptor(camera);
}

/** [Zdog] Kiểm tra payload scene có đủ khóa chuẩn. */
export function validateZdogScenePayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['meshes', 'lights', 'camera']);
}

/** [Zdog] Kiểm tra payload animation (name/duration/channels...). */
export function validateZdogAnimationPayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['name', 'duration']);
}

/** [Zdog] Kiểm tra danh sách mesh descriptor trung gian. */
export function validateZdogMeshNodes(meshes: unknown): boolean {
  return validateMeshList(meshes);
}

/** [Zdog] Kiểm tra danh sách light descriptor trung gian. */
export function validateZdogLights(lights: unknown): boolean {
  return validateLightList(lights);
}

/** [Zdog] Kiểm tra descriptor camera trung gian. */
export function validateZdogCamera(camera: unknown): boolean {
  return validateCameraDescriptor(camera);
}

/** [Filament] Kiểm tra payload scene có đủ khóa chuẩn. */
export function validateFilamentScenePayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['meshes', 'lights', 'camera']);
}

/** [Filament] Kiểm tra payload animation (name/duration/channels...). */
export function validateFilamentAnimationPayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['name', 'duration']);
}

/** [Filament] Kiểm tra danh sách mesh descriptor trung gian. */
export function validateFilamentMeshNodes(meshes: unknown): boolean {
  return validateMeshList(meshes);
}

/** [Filament] Kiểm tra danh sách light descriptor trung gian. */
export function validateFilamentLights(lights: unknown): boolean {
  return validateLightList(lights);
}

/** [Filament] Kiểm tra descriptor camera trung gian. */
export function validateFilamentCamera(camera: unknown): boolean {
  return validateCameraDescriptor(camera);
}

/** [OpenSceneGraph] Kiểm tra payload scene có đủ khóa chuẩn. */
export function validateOsgScenePayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['meshes', 'lights', 'camera']);
}

/** [OpenSceneGraph] Kiểm tra payload animation (name/duration/channels...). */
export function validateOsgAnimationPayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['name', 'duration']);
}

/** [OpenSceneGraph] Kiểm tra danh sách mesh descriptor trung gian. */
export function validateOsgMeshNodes(meshes: unknown): boolean {
  return validateMeshList(meshes);
}

/** [OpenSceneGraph] Kiểm tra danh sách light descriptor trung gian. */
export function validateOsgLights(lights: unknown): boolean {
  return validateLightList(lights);
}

/** [OpenSceneGraph] Kiểm tra descriptor camera trung gian. */
export function validateOsgCamera(camera: unknown): boolean {
  return validateCameraDescriptor(camera);
}

/** [OGRE] Kiểm tra payload scene có đủ khóa chuẩn. */
export function validateOgreScenePayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['meshes', 'lights', 'camera']);
}

/** [OGRE] Kiểm tra payload animation (name/duration/channels...). */
export function validateOgreAnimationPayload(payload: unknown): boolean {
  return validatePayloadKeys(payload, ['name', 'duration']);
}

/** [OGRE] Kiểm tra danh sách mesh descriptor trung gian. */
export function validateOgreMeshNodes(meshes: unknown): boolean {
  return validateMeshList(meshes);
}

/** [OGRE] Kiểm tra danh sách light descriptor trung gian. */
export function validateOgreLights(lights: unknown): boolean {
  return validateLightList(lights);
}

/** [OGRE] Kiểm tra descriptor camera trung gian. */
export function validateOgreCamera(camera: unknown): boolean {
  return validateCameraDescriptor(camera);
}
