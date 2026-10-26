# Samurai — Viết lại 100% bằng Engine

> **Bản viết lại (2026-10-26):** toàn bộ map, UI, nhân vật, quái, vật phẩm cũ đã bị xóa
> khỏi `main` theo yêu cầu và viết lại từ đầu, bọc bằng **@aetheria/engine** (`engine/`,
> vendored, không kèm `.git` của engine). Bản cũ vẫn còn trong lịch sử git ở commit
> `fde8324` nếu cần khôi phục.
>
> Bản mới hiện có (mốc 1, chơi được ngay): 1 map engine (Terrain/Water/Foliage/
> Atmosphere), 1 nhân vật `buildCharacter` + kiếm/bow qua `SocketBinder` + bao kiếm
> (đứng yên 3s tự tra, chạy/nhảy tra ngay, đã tra không tự rút, X tra/rút), 4 quái
> `buildMonster` có AI đuổi/đánh, vật phẩm nhặt (xu, hồi máu), combat chém + hạt
> engine, camera thứ ba, HUD FPS/HP. Chưa có lại 15 chương, quest, inventory,
> crafting, save — các hệ đó sẽ port dần lên nền engine.

Game samurai 3D chạy trên web, mọi render/tính toán/FPS đi qua API engine:
vòng lặp `Ticker`, vật lý `GravityEngine`, địa hình/nước/cỏ/khí quyển, nhân vật/quái
`buildCharacter`/`buildMonster`, vũ khí `AssetFactory` + `SocketBinder`, input `InputMap`,
hiệu ứng `ParticleSystem`. HUD chỉ là chữ DOM vì engine không có hệ HUD 2D.

---

## 1. Chạy nhanh

```bash
# 1) Backend (Python 3.10+)
pip install -r requirements.txt
pip install -e .            # tạo lệnh CLI `samurai`

# 2) Frontend build (Node 18+)
npm install
npm run build               # bundle -> web/dist/

# 3) Chơi
samurai serve               # mở http://127.0.0.1:8000 tự động trong trình duyệt
```

Biến thể lệnh:

| Lệnh | Ý nghĩa |
|---|---|
| `samurai serve` | Chạy backend + client, tự mở trình duyệt |
| `samurai serve --port 9000` | Chọn cổng (tự dò cổng trống nếu bận) |
| `samurai serve --no-browser` | Không tự mở trình duyệt |
| `samurai serve --reload` | Dev: tự nạp lại backend khi sửa Python |
| `python -m server serve` | Tương đương `samurai serve` khi chưa cài `pip install -e .` |
| `npm run build:watch` | Dev: bundle lại tự động khi sửa JS |
| `npm run serve:dev` | Dev thay thế khi máy không có Python: server tĩnh Node + save API (JSON file) |
| `npm test` | Test unit (node --test): framework + worldgen/progression/save |
| `npm run test:levels` | E2E: vào lần lượt 15 chương trong Chromium headless |
| `npm run test:e2e` | E2E: kịch bản đầy đủ (campaign, thời tiết, vô cực, save/continue) |

Nếu `web/dist` chưa được build, server vẫn phục vụ `web/index.html` (báo lỗi thiếu bundle) —
hãy chạy `npm run build` trước. Database SQLite (`samurai.db`) **tự tạo lần đầu chạy**.

## 2. Kiến trúc

```
gamesamurai/
├── server/                 # Backend FastAPI (không đổi so với bản đã nghiệm thu)
│   ├── main.py             # App: static client + REST save API
│   ├── db.py               # SQLite (schema versioned, validate payload, WAL)
│   └── cli.py              # CLI `samurai serve`
├── scripts/dev-server.mjs  # Dev thay thế (Node): tĩnh + save API giống server/main.py
├── web/
│   ├── index.html
│   ├── dist/               # Kết quả build (bundle.js/css + index.html)
│   └── src/
│       ├── main.js         # Entry
│       ├── game.js         # Orchestrator: 2 chế độ (campaign/infinite), state, vòng lặp
│       ├── core/           # engine (renderer/loop/quality/shadow), input (rebindable),
│       │                   #  cameraRig (1st/3rd, lock-on), utils
│       ├── data/           # Dữ liệu tách khỏi mã: items, skills, enemies, bosses,
│       │                   #  recipes, quests, levels (15), regions (15 bản đồ nền +
│       │                   #  biến thể), wildlife, keys
│       ├── gfx/            # humanoid + animator + clips, terrain, props (instancing),
│       │                   #  water (mặt nước sóng + lũ + thác + dung nham), particles/
│       │                   #  weather, vfx, sky (PMREM), audio (WebAudio procedural)
│       ├── entities/       # player, npc (FSM AI), boss (pha/telegraph), creature
│       │                   #  (chim/cá/hươu/lợn/sói), dragon (world-boss bay), interactable
│       ├── systems/        # combat, world (builder 14 kiểu địa hình + nước/mercury mối
│       │                   #  nguy), levelManager (15 chương), weather (thời tiết động +
│       │                   #  siêu nhiên + lũ), infiniteWorld (streaming ô vô cực),
│       │                   #  worldgen (seed/biome thuần, test được), progression
│       │                   #  (cấp 1–25 + thưởng), inventory, crafting, quests,
│       │                   #  factions, saveSystem (schema v2)
│       └── ui/             # HUD (thời tiết/waypoint), panels (túi đồ/kỹ năng/chế tạo/
│                           #  nhiệm vụ/shop), worldMap (bản đồ vô cực canvas), screens, styles
├── tests/
│   ├── framework/          # 37 test framework (node --test)
│   ├── world/              # 19 test: worldgen seed/biome, liên tục địa hình vô cực,
│   │                       #  thời tiết, cấp 25 + thưởng, save v2 migration
│   ├── e2e.mjs             # E2E trình duyệt (Playwright + SwiftShader)
│   └── e2e-levels.mjs      # E2E 15 chương
├── pyproject.toml          # console script: samurai
├── requirements.txt        # fastapi, uvicorn
└── build.mjs               # esbuild bundler
```

Nguyên tắc: gameplay/rendering/AI/dữ liệu/UI tách module; dữ liệu cân bằng nằm ở `web/src/data/*`;
tách logic thuần (`systems/worldgen.js`) khỏi three.js để test headless; vật lý đơn giản tự viết
(heightfield + collider tròn) thay vì kéo engine vật lý ngoài.

## 3. Hai chế độ chơi

**Chiến dịch (Campaign)** — 15 chương, mỗi chương một bản đồ nền: L01 Bờ Rào Sương Mù (đồi cỏ) →
L02 Làng Hạc Bạch → L03 Rừng Tre Mật → L04 Rừng Thông Đen (thú rừng) → L05 Khúc Sông Ngân (sông,
cầu, thác) → L06 Đèo Gió Lạnh (núi cao) → L07 Đền Hoang (boss Kurogane) → L08 Hồ Vong Hồn (hồ/lầy
đêm) → L09 Chiến Trường → L10 Sân Đấu Ronin (hẻm núi) → L11 Núi Lửa Tu La (dung nham, boss Hi no
Ou) → L12 Mỏ Cốc Tro (hang) → L13 Băng Nguyên Vĩnh Đông (tuyết) → L14 Thành Bóng Đêm (thành trì
đêm mưa) → L15 Ngự Sảnh Bóng Tối (siêu nhiên, Yamikage). Hoàn thành mở chương kế.

**Thế Giới Vô Cực (Infinite World)** — menu → "Thế Giới Vô Cực" → nhập seed bất kỳ (cùng seed =
cùng thế giới, tái tạo được). Thế giới ghép các ô 168m sinh từ **15 bản đồ nền** theo trường
noise xác định (độ cao/độ ẩm/nhiệt độ → biome), địa hình liên tục xuyên ranh giới ô (có test tự
động), sông chảy xuyên ô, hồ/núi lửa/hang ở nơi đủ điều kiện. Streaming: 3×3 ô đầy đủ quanh người
chơi, ring 5×5 LOD terrain, dỡ xa hơn (ngân sách ~12ms/frame). Mức nguy hiểm tăng theo khoảng cách
tính từ ô xuất phát; ô nguy hiểm ≥5 có boss trấn giữ (dùng 5 boss sẵn có hoặc **Rồng** bay 3 pha);
mỗi ô có đài hồi sinh, tài nguyên, sinh vật. Bản đồ (M) tự sinh theo dữ liệu worldgen: ô đã khám
phá đầy màu, ô kề bên mờ, ☠ = mức nguy hiểm, click đặt điểm hẹn (🚩 + khoảng cách trên HUD).

## 4. Điều khiển

| Phím | Hành động |
|---|---|
| W / A / S / D | Di chuyển theo hướng camera |
| Shift | Sprint (tốn khí lực) |
| Space | Nhảy |
| J | Đòn nhanh (combo đến 3–4 nhánh theo vũ khí) |
| K | Đòn mạnh (sát thương lớn, phá đỡ) |
| L (giữ) | Đỡ đòn; **nhấn đúng thời điểm** = Parry → đòn kế x2 |
| I | Né / lăn (bất khả xâm phạm ngắn, tối đa 2 lần liên tiếp) |
| U | Kỹ năng đặc biệt (gán ở cây kỹ năng) |
| C | Khóa mục tiêu (khóa được cả thú để săn) |
| V | Đổi góc nhìn thứ nhất ↔ thứ ba |
| E | Tương tác (tài nguyên, đài hồi sinh, rương, thương nhân, nhặt loot săn) |
| Tab / T / G / Q / M | Túi đồ / Kỹ năng / Chế tạo / Nhiệm vụ / Bản đồ |
| Esc | Tạm dừng · đóng panel |
| Chuột | Nhìn quanh (khóa con trỏ) · lăn = zoom |

Lội nước chậm lại; dung nham gây thương theo nhịp; lũ dâng khi bão làm ngập lối thấp.

## 5. Cấp độ & sinh vật

- **Cấp 1–25** (chặn cứng): mỗi cấp +1 điểm thuộc tính; cấp chẵn +1 điểm kỹ năng; cột mốc
  4/8/14/18/22/25 tặng trang bị/vàng; cấp 10/15/20/25 thưởng lớn — cấp 25 tặng **Triệt Nguyệt**
  và danh hiệu *Kiếm Thánh*. Bảng đầy đủ: `web/src/systems/progression.js` (LEVEL_REWARDS).
- **Sinh vật hoang dã** (`data/wildlife.js`): chim (bay, đậu, né người), cá (bơi trong vùng nước,
  né), hươu (gặm ở, bỏ chạy), lợn rừng (hoành động khi lại gần), **sói rừng** (săn theo bầy).
  Săn được thịt/da → chế tạo **thịt khô**. AI phân tầng: sinh vật xa người chơi dừng mô phỏng.
- **Thời tiết động** (`systems/weather.js`): chu kỳ theo pool từng vùng (nắng/mây/sương/mưa/bão/
  tuyết/bão tuyết/tro/bão cát...), chuyển mượt fog–mây–ánh sáng; mưa làm **ướt bề mặt** (bóng,
  phản chiếu); **bão có sấm sét** (chớp + sấm trễ theo khoảng cách); mưa lớn ở vùng sông/hồ làm
  **lũ dâng** ngập lối thấp rồi rút; **siêu nhiên**: Sương Ma (gọi vong linh), Mưa Linh Khí
  (+15% XP), Bão Ma Thuật (sét tím, địch cường hóa) — đều thông báo rõ cho người chơi.

## 6. Save & backend

- Save schema **v2**: meta (mode/seed), player, progress, `world` (campaign hoặc infinite:
  seed, toạ độ, các ô đã khám phá/trinh sát, vùng an toàn, boss đã hạ, waypoint — chặn ≤600 ô),
  `weather`. Migration v1→v2 tự động; schema tương lai bị từ chối (không đoán mò).
- Lưu **cục bộ (localStorage)** + đồng bộ server `POST /api/saves/{slot}` vào SQLite.
- Server validate: tên slot, kích thước ≤2MB, schema — dữ liệu client không được tin tưởng tuyệt đối
  (game đơn người nên client là nguồn sự thật).
- API: `GET /api/health` · `GET/POST/DELETE /api/saves/{slot}` · `GET /api/saves`.
- Đài hồi sinh (E) = hồi đầy + lưu ngay. Trong Thế Giới Vô Cực, điểm hồi sinh là ô gần nhất.

## 7. Build production & triển khai

```bash
npm run build              # minify -> web/dist/
uvicorn server.main:app --host 0.0.0.0 --port 8000
```

Khuyến nghị deploy: nginx/Caddy phía trước, HTTPS, cache `web/dist/*` dài hạn; backup định kỳ
`samurai.db` (SQLite) — backend không stateful khác. Không có bí mật trong frontend.

## 8. Kiểm thử

| Bộ | Lệnh | Phạm vi |
|---|---|---|
| Unit (framework) | `npm test` (tests/framework) | 37 test: events, fsm, entity, registry, pool, ticker, cache, settings, math… |
| Unit (world) | `npm test` (tests/world) | 19 test: seed/biome xác định, **liên tục địa hình vô cực qua mép ô**, trường noise, thời tiết, cấp 25 + bảng thưởng, save v2 migration |
| E2E 15 chương | `npm run test:levels` | Chromium headless: mỗi chương build, region/water/boss đúng, 0 lỗi runtime |
| E2E tổng | `npm run test:e2e` | Boot, WASD, nhảy, wildlife, bão (mưa/sét/ướt), save v2, vô cực seed/streaming/bản đồ, save vô cực + continue |

E2E dùng SwiftShader (WebGL phần mềm, ~3–6 FPS) — số FPS không đại diện; dùng máy có GPU để đo
hiệu năng thật. Ảnh xác minh: `docs/screenshots/`.

## 9. Tài nguyên & giấy phép

- Mã nguồn dự án: viết mới trong repo này.
- `three` (MIT), `esbuild` (MIT), `playwright` (Apache-2.0, chỉ dev/test), FastAPI/uvicorn (MIT/BSD).
- Mọi mesh/animation/texture canvas/âm thanh WebAudio: **procedural, tự tạo**, không bản quyền ngoài.

## 10. Giới hạn đã biết

- Nhân vật/cảnh low-poly cách điệu (procedural), không thay thế asset AAA.
- Vật lý: heightfield + collider tròn (không ragdoll); lội nước sâu tối đa ngực (không bơi lặn).
- Cá/chim không có hệ thống câu/thả lưới — chỉ sinh thái + săn thú cạn.
- Không chu kỳ ngày–đêm liên tục (ngày/đêm theo vùng; thời tiết động thay đổi ánh sáng trong phiên).
- Thế Giới Vô Cực: nội dung ô sinh từ 15 template + biến thể procedural (không phải nội dung
  thiết kế tay vô hạn); ô đã "an toàn" không respawn địch cho tới khi tải lại save.
- Server không chống gian lận (client-authoritative, game đơn người); xác thực v2 chưa chạy trên
  FastAPI thật trong máy phát triển này (không có Python) — đã xác minh qua dev-server Node cùng
  API surface; code `server/` không đổi so với bản đã nghiệm thu trước đó.
