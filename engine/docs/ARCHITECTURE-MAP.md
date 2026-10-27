# ARCHITECTURE-MAP.md — Bản đồ tổ chức module engine

> Mục đích: chuẩn hóa **thứ tự và ranh giới** của các module trong
> `engine/src/` sau đợt tổng thể tổ chức lại, làm chuẩn khi bổ sung module mới.
> Quy tắc chung: mỗi module có `index.ts` barrel, subpath `@aetheria/engine/<module>`
> trong `package.json`, và được tái xuất từ root `src/index.ts` (namespace
> `export * as X` cho nhóm lớn, `export *` cho nhóm nền tảng).

## 1. Bốn tầng logic (từ dưới lên)

| Tầng | Vai trò | Module |
| --- | --- | --- |
| **T1 — Nền tảng thuần** | Kiểu, tiện ích, không phụ thuộc gì ngoài nhau | `types`, `core`, `memory`, `network-sync` |
| **T2 — Đặc tả thế giới** | Sinh/đặc tả dữ liệu game | `procedural`, `combiner`, `asset-parser`, `transformer`, `environment`, `world`, `open-world`, `navigation`, `spatial` |
| **T3 — Thực thể & mô phỏng** | Cái sống trong game | `player`, `animal`, `npc`, `objects`, `life`, `psychology`, `behavior`, `ai`, `knowledge`, `civilization`, `law`, `research`, `worldview`, `training` |
| **T4 — Trình bày & vận hành** | Render, âm thanh, input, boot | `render` (+`render/interop`), `renderer`, `effects`, `spatial-ui`, `audio`, `input`, `boot`, `physics`, `animation` |
| **T5 — Trí tuệ học được** | AI học sâu/học tăng cường (thuần TS, không DOM) | `deeplearning`, `learning` (+`learning/vision`), `ui-procedural` |

## 2. Quy tắc phụ thuộc (Dependency Rule)

1. Chỉ được phụ thuộc **xuống dưới** trong bảng trên (T5 không import T4 ngược
   lại là được, T4 không import T3... ngoại lệ có kiểm soát: `render` đọc
   `types/renderer.types` thuộc T1 — hợp lệ vì T1 nằm dưới mọi tầng).
2. `learning/` và `deeplearning/` **cấm** import Three.js/DOM/Next.js — kiểm
   chứng bằng test (`runtime-contracts`, environment node của vitest).
3. Module mới bắt buộc có: barrel `index.ts`, subpath `package.json`, entry ở
   root `src/index.ts`, test, mục CHANGELOG.

## 3. Điểm sửa tập trung (single source of truth)

| Mối quan tâm | Nơi sửa duy nhất |
| --- | --- |
| Khôi phục snapshot trọng số (`learning`) | `learning/internal.ts` → `restoreWeightsFromSnapshot` |
| Report rỗng chuẩn (`learning`) | `learning/internal.ts` → `emptyLearningReport` |
| Copy/soft-copy trọng số mạng↔mạng | `learning/reinforcement/dqn.ts` → `copyNetworkWeights`/`softCopyNetworkWeights` |
| Converter/validator/component per-library | `render/interop/matrix-core.ts` + regenerate `scripts/generate-interop-matrix.mjs` (không sửa `generated/*`) |
| API catalog | `scripts/generate-engine-doc.mjs` → `ENGINE.md` |

## 4. Vệ sinh đã thực hiện (2.8.0)

- Gỡ 13 bản sao helper khôi phục snapshot nhân bản trong 11 file → `internal.ts`.
- Gỡ artifacts test bị track: `tests/__tmp_scale_root__/` (checkpoint/dataset sinh
  ra mỗi lần chạy), `tests/__debug-tr.test.ts`; thêm `__tmp_scale_root__/` vào
  `.gitignore` (test `scale.test.ts` tự sinh lại khi chạy).
- Kiểm chứng: 0 dùng `any` trong `src` (ngoại trừ file `generated/` nếu có),
  39/39 module có barrel + subpath, root index bao phủ 100% module.

## 5. Kiểm chứng

```powershell
cd engine
npx tsc --noEmit          # 0 lỗi
npx vitest run            # toàn bộ suite pass
node scripts/generate-engine-doc.mjs   # đồng bộ ENGINE.md
node scripts/generate-interop-matrix.mjs  # đồng bộ ma trận interop
```
