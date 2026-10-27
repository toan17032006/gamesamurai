# ANIMATION-INTEROP.md — Hồ sơ kiến trúc hoạt ảnh và cầu nối thư viện đồ họa

> Phạm vi: `engine/src/animation/` và `engine/src/render/interop/` — hai module
> bổ sung trong đợt tổ chức lại engine. Tài liệu mô tả ranh giới tầng, luồng
> dữ liệu và quy tắc mở rộng; bổ sung cho `ENGINE.md` (danh mục API sinh tự động)
> và `LEARNING-RUNTIME.md`.

## 1. Mục tiêu

1. **Quản lý render hoạt ảnh** cho agent/NPC/game: curve keyframe, clip, blend
   tree, state machine, player/mixer, event track, retargeting — trung tính với
   thư viện đồ họa.
2. **Cầu nối (interop)** tới các thư viện đồ họa phổ biến mà **không phụ thuộc
   runtime của chúng**: engine sinh descriptor (JSON/markup/text) theo idiom
   từng thư viện; tầng Application của game nạp descriptor đó bằng thư viện của
   mình.

## 2. Luồng dữ liệu

```
asset-parser (BVH/VMD/gltf/FBX/...)          render backends trung tính
        │ samples/keyframes                         │ RenderSceneData
        ▼                                           ▼
src/animation/  ── clip/player/state machine ──► AnimationPose
        │                                           │
        ▼                                           ▼
animation/library-export.ts          render/interop/registry.ts
  (clip → LibraryAnimationExport)      (RenderSceneData → LibrarySceneExport)
        └──────────────┬────────────────────────────┘
                       ▼
        Game Application nạp payload bằng thư viện đích
        (three / babylon / playcanvas / a-frame / cesium / ogre / ...)
```

## 3. Ranh giới và quy tắc

1. **Không import thư viện đồ họa nào** (Three/Babylon/...) vào hai module này —
   payload là dữ liệu thuần tuần tự hóa được.
2. `AnimationPose` (`Map<targetPath, TrackEvaluation>`) là hợp đồng đầu ra chuẩn;
   tầng render của từng backend tự giải `targetPath` (vd `hips.translation`)
   sang API của mình qua `PoseTarget`.
3. Quy ước đơn vị: giây, radian, quaternion (x, y, z, w), matrix column-major
   16 floats (khớp `types/renderer.types.ts`).
4. Track `name` phải trùng `targetPath` (builder đảm bảo; `retargetTrack` đồng bộ).
5. Thêm thư viện mới = (a) exporter trong `animation/library-export.ts`
   (`CLIP_EXPORTERS`), (b) entry `LibraryInterop` trong `render/interop/`,
   (c) đưa vào `BUILT_IN_INTEROPS`. Không sửa lõi.

## 4. Danh mục API chính

### 4.1 `src/animation/`

| File | API chính |
| --- | --- |
| `types.ts` | `AnimationTrack`, `AnimationClipData`, `AnimationPose`, `TrackEvaluation`, `PoseTarget`, `WrapMode`, `InterpolationKind` |
| `easing.ts` | 34 easing chuẩn, `EASING_FUNCTIONS`, `applyEasing`, `reverseEasing`, `composeEasing`, `easedLerp` |
| `curve.ts` | `evaluateTrack`, `evaluateScalar`, `quatSlerpVector`, `insertKey`, `removeKey`, `scaleKeyTimes`, `sliceTrack`, `resampleTrack`, `trackFromSamples`, `constantTrack`, `trackStats` |
| `clip.ts` | `AnimationClip` (sample/slice/scaleTime/reversed/concatenated/merge/ensureDuration/stats), `buildClip`, `constantClip`, `insertClipKey`, `mergeClips` |
| `blend.ts` | `blendValues`, `blend1D`, `blend2D`, `blendWeightedPoses`, `blendLayers`, `mergePoses`, `crossfadePoses`, `extractAdditive`, `dedupeEvents` |
| `state-machine.ts` | `AnimationStateMachine`, `createStateMachine`, `greater/less/equals/trigger` |
| `player.ts` | `AnimationPlayer` (addLayer/play/crossfade/fadeLayer/seekLayer/onEvent/update/applyTo/snapshot) |
| `events.ts` | `buildEventTrack`, `assignEventTrack`, `eventsInWindow`, `eventsInLoopedWindow`, `mergeEventTracks`, `offsetEventTrack` |
| `retarget.ts` | `guessBoneMapping`, `retargetTrack`, `retargetClip`, `retargetHumanoid`, `bonesOfClip`, `HUMANOID_BONE_ALIASES` |
| `library-export.ts` | `CLIP_EXPORTERS` (20 thư viện), `exportClipForLibrary`, `supportedAnimationLibraries`, `secondsToFrames` |

### 4.2 `src/render/interop/`

| File | API chính |
| --- | --- |
| `types.ts` | `LibraryInterop`, `LibrarySceneExport`, `InteropCategory`, `InteropOptions`, `FullLibraryExport` |
| `scene-descriptors.ts` | `toIntermediateScene`, `ensureIntermediate`, `matrixPosition`, `matrixScale`, `IntermediateScene` |
| `engine-bridges.ts` | three/babylon/babylon-native/playcanvas/verge3d payload + `hexToRgb01` |
| `framework-glue.ts` | a-frame (markup `<a-scene>`), react-three-fiber, threlte |
| `webgl-utility.ts` | ogl/regl/twgl/luma.gl buffer & pipeline descriptors |
| `data-viz-minimal.ts` | vtk.js/deck.gl/xeokit/cesium/zdog/filament/openscenegraph/ogre |
| `registry.ts` | `BUILT_IN_INTEROPS` (20), `getInterop`, `interopsByCategory`, `exportSceneForLibrary`, `exportForLibrary`, `exportAllLibraries`, `summarizeScene` |

## 5. Kiểm chứng

```powershell
cd engine
npx vitest run tests/animation-interop.test.ts
npx vitest run
npx tsc --noEmit
```

Định dạng asset (mô hình/cảnh/texture/animation) được nạp ở tầng
`asset-parser` (22 extension đã đăng ký trong `format-registry.ts`); module này
phụ trách phía *chơi và xuất* hoạt ảnh + descriptor scene cho thư viện đích.
