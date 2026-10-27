# KEYMAP.md — Hệ thống key map 3 trường (key / action / characterCompatibility)

> Phạm vi: `engine/src/input/keymap/`. Thiết kế theo đặc tả bảng điều khiển
> chuẩn (đối chiếu danh sách điều khiển PC Genshin-style): tách biệt **ba trường
> dữ liệu** `key`, `action`, `character_compatibility` — không gán cứng phím cho
> lớp nhân vật — kèm **các lớp tùy chọn** để game tự dựng key map 100% khác.

## 1. Mô hình dữ liệu (`types.ts`)

- `KeyBinding` = { `action`, `source` (device/code/gesture/button), `compatibility` (roles + emphasis + contexts), `label`, `chord?`, `priority? }`.
- `CharacterRole`: `all | archer | melee-dps | ranged-dps | support | healer | shielder | movement-special | gadget-user` + string tùy ý — **vai trò chiến đấu, không phải giới hạn cứng của phím**.
- `PointerGesture`: `button-press | button-hold | button-double | move | wheel-up | wheel-down | wheel-press | wheel-hold` — chuột có *thao tác* chứ không chỉ nút.
- `InputContext`: `gameplay | aiming | swimming | climbing | gliding | ui | dialog` — cùng phím, khác ngữ cảnh = khác action (vd chuột trái: tấn công thường ở gameplay, bắn tên ở aiming của cung thủ).

## 2. Profile mặc định (`defaults.ts`)

`createDefaultKeyMapProfile()` trả 45 binding + 1 combo:

- **Bàn phím (34)**: WASD/Space/Shift/Ctrl di chuyển; `E` kỹ năng nguyên tố + `Q` nộ (roles `all` — mọi nhân vật); `R` chế độ ngắm (`roles: [archer, ranged-dps, all]` + `emphasis` cho archer — nổi bật nhưng không độc quyền); `1–4` đổi đội hình; `LeftAlt + 1–4` combo đổi nhân vật + kích hoạt nộ; `F/B/C/M/Esc/J/L/O/Enter/F1–F5/V/Y/U/G/Z/T` menu & tiện ích.
- **Chuột (11)**: trái nhấn = tấn công thường, trái giữ = trọng kích; phải nhấn = chạy nhanh, phải giữ = điều khiển ngắm; di chuyển = xoay camera; con lăn nhấn/giữ = Tầm nhìn nguyên tố; cuộn = zoom; aiming context: di chuyển = chỉnh ngắm, trái = bắn tên (archer).
- **Combo (1)**: `AltLeft + Digit1–4 → party_slot_N_burst`.

## 3. Lớp tùy chỉnh (`builder.ts`) — game khác 100% key map

```ts
import { KeyMapBuilder, CustomKeyMap, RoleKeyResolver } from '@aetheria/engine/input';

// 1) Dựng profile riêng (hoặc .fromDefaults() rồi chỉnh):
const profile = new KeyMapBuilder('my-game', { genre: 'bullet-hell' })
  .bindKey('shoot', 'KeyZ', 'Bắn')
  .bindMouse('pause_menu', 1, 'button-press', 'Tạm dừng')
  .addCombo({ modifier: 'ShiftLeft', keys: ['Digit1'], actions: ['ult_1'],
              compatibility: { roles: ['all'] }, label: 'Shift+1' })
  .build();

// 2) Runtime: tra cứu, rebind, serialize thiết lập người chơi:
const map = CustomKeyMap.fromJSON(JSON.parse(JSON.stringify(profile)));
map.setKey('shoot', 'KeyC');                  // đổi phím giữ device/gesture
map.rebind('bomb', { device: 'keyboard', code: 'KeyV' });
const conflicts = map.conflicts();            // phát hiện va chạm nguồn
localStorage.setItem('controls', JSON.stringify(map.toJSON()));

// 3) Lọc theo vai trò nhân vật đang điều khiển (role lọc runtime, không khóa data):
const resolver = new RoleKeyResolver(map, ['archer', 'melee-dps', 'healer', 'shielder']);
resolver.setActiveSlot(0);                    // → role archer
resolver.setContext('aiming');
const { actions } = resolver.resolve({ device: 'mouse', code: '0', button: 0, gesture: 'button-press' });
// actions = ['shoot_arrow'] — melee-dps ở slot 1 thì được ['normal_attack'].
```

## 4. Quy tắc

1. **Không khóa cứng**: `roles` chỉ dùng trong `actionsForRole`/`emphasizedForRole`/resolver để *lọc runtime* và gợi ý UI — dữ liệu profile luôn đầy đủ cho mọi role.
2. `emphasis: true` = "đặc biệt hữu ích" cho role đầu danh sách; cặp binding chia sẻ nguồn với emphasis không tính là xung đột.
3. Conflict: cùng device+code+gesture+chord trong context trùng nhau và KHÔNG phải cặp chuyên biệt hóa.
4. `parseKeyMapProfile` là ranh giới tin cậy duy nhất khi nạp profile từ localStorage/network (type-guard `unknown`).
5. Ghép với `InputMap` (input-map.ts): `InputMap` cấp sự kiện/DOM; keymap cấp dữ liệu mapping + role filtering — ghép qua `resolve()` mỗi frame.

## 5. Kiểm chứng

`npx vitest run tests/keymap.test.ts` — 15 test: đầy đủ 34+11 binding, roles `all` cho E/Q, emphasis `R`, combo Alt+1–4, lọc role runtime, serialize round-trip, conflict detection, profile tùy chỉnh 100% khác mặc định.
