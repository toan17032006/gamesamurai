/**
 * @file defaults.ts
 * @module @aetheria/engine/input/keymap/defaults
 * @description Bộ key map mặc định chuẩn "Genshin-style" đối chiếu từ bảng điều
 * khiển PC: 34 binding bàn phím + 10 binding chuột + combo `LeftAlt + 1–4`.
 * Mục `characterCompatibility.roles` là vai trò chiến đấu để TRUY VẤN — không
 * phải giới hạn cứng; `emphasis: true` đánh dấu "đặc biệt hữu ích" (vd `R` với
 * cung thủ) mà vẫn cho mọi role dùng.
 *
 * Game khác 100% key map? Dùng `KeyMapBuilder`/`CustomKeyMap` (builder.ts) tự
 * dựng profile riêng — defaults này chỉ là một profile có thể bỏ hoàn toàn.
 */

import type { CharacterRole, ComboDefinition, KeyBinding, KeyMapProfileData } from './types.js';

const ALL: readonly CharacterRole[] = ['all'];
const TEAM: readonly CharacterRole[] = ['all'];

/** Context rút gọn. */
const GAMEPLAY = ['gameplay'] as const;
const AIMING = ['gameplay', 'aiming'] as const;

/** Binding bàn phím — đối chiếu bảng §1 của đặc tả key map. */
export const DEFAULT_KEYBOARD_BINDINGS: readonly KeyBinding[] = Object.freeze([
  { action: 'move_forward', source: { device: 'keyboard', code: 'KeyW' }, compatibility: { roles: ALL, contexts: [...GAMEPLAY, 'swimming', 'climbing', 'gliding'] }, label: 'Di chuyển về phía trước' },
  { action: 'move_left', source: { device: 'keyboard', code: 'KeyA' }, compatibility: { roles: ALL, contexts: [...GAMEPLAY, 'swimming', 'climbing', 'gliding'] }, label: 'Di chuyển sang trái' },
  { action: 'move_backward', source: { device: 'keyboard', code: 'KeyS' }, compatibility: { roles: ALL, contexts: [...GAMEPLAY, 'swimming', 'climbing', 'gliding'] }, label: 'Di chuyển lùi' },
  { action: 'move_right', source: { device: 'keyboard', code: 'KeyD' }, compatibility: { roles: ALL, contexts: [...GAMEPLAY, 'swimming', 'climbing', 'gliding'] }, label: 'Di chuyển sang phải' },
  { action: 'jump', source: { device: 'keyboard', code: 'Space' }, compatibility: { roles: ALL, contexts: [...GAMEPLAY, 'swimming', 'climbing', 'gliding'] }, label: 'Nhảy; leo trèo, bay lượn và bơi theo ngữ cảnh' },
  { action: 'sprint', source: { device: 'keyboard', code: 'ShiftLeft' }, compatibility: { roles: ALL }, label: 'Chạy nhanh / né bằng cách chạy nước rút' },
  { action: 'toggle_walk_run', source: { device: 'keyboard', code: 'ControlLeft' }, compatibility: { roles: ALL }, label: 'Chuyển đổi đi bộ/chạy' },
  { action: 'elemental_skill', source: { device: 'keyboard', code: 'KeyE' }, compatibility: { roles: ALL }, label: 'Sử dụng Kỹ năng nguyên tố' },
  { action: 'burst_skill', source: { device: 'keyboard', code: 'KeyQ' }, compatibility: { roles: ALL }, label: 'Sử dụng Kỹ năng nộ' },
  { action: 'aim_mode', source: { device: 'keyboard', code: 'KeyR' }, compatibility: { roles: ['archer', 'ranged-dps', 'all'], emphasis: true }, label: 'Chuyển sang chế độ ngắm' },
  { action: 'party_slot_1', source: { device: 'keyboard', code: 'Digit1' }, compatibility: { roles: TEAM }, label: 'Chuyển sang nhân vật trong ô đội hình 1' },
  { action: 'party_slot_2', source: { device: 'keyboard', code: 'Digit2' }, compatibility: { roles: TEAM }, label: 'Chuyển sang nhân vật trong ô đội hình 2' },
  { action: 'party_slot_3', source: { device: 'keyboard', code: 'Digit3' }, compatibility: { roles: TEAM }, label: 'Chuyển sang nhân vật trong ô đội hình 3' },
  { action: 'party_slot_4', source: { device: 'keyboard', code: 'Digit4' }, compatibility: { roles: TEAM }, label: 'Chuyển sang nhân vật trong ô đội hình 4' },
  { action: 'interact_pickup', source: { device: 'keyboard', code: 'KeyF' }, compatibility: { roles: ALL, contexts: [...GAMEPLAY, 'dialog'] }, label: 'Nhặt vật phẩm / tương tác / nói chuyện' },
  { action: 'open_inventory', source: { device: 'keyboard', code: 'KeyB' }, compatibility: { roles: ALL, contexts: ['gameplay', 'ui'] }, label: 'Mở túi đồ' },
  { action: 'open_character', source: { device: 'keyboard', code: 'KeyC' }, compatibility: { roles: ALL, contexts: ['gameplay', 'ui'] }, label: 'Mở giao diện nhân vật' },
  { action: 'open_map', source: { device: 'keyboard', code: 'KeyM' }, compatibility: { roles: ALL, contexts: ['gameplay', 'ui'] }, label: 'Mở bản đồ' },
  { action: 'open_paimon_menu', source: { device: 'keyboard', code: 'Escape' }, compatibility: { roles: ALL, contexts: ['gameplay', 'ui'] }, label: 'Mở menu Paimon' },
  { action: 'open_quests', source: { device: 'keyboard', code: 'KeyJ' }, compatibility: { roles: ALL, contexts: ['gameplay', 'ui'] }, label: 'Mở menu nhiệm vụ' },
  { action: 'open_party', source: { device: 'keyboard', code: 'KeyL' }, compatibility: { roles: ALL, contexts: ['gameplay', 'ui'] }, label: 'Mở giao diện đội hình' },
  { action: 'open_friends', source: { device: 'keyboard', code: 'KeyO' }, compatibility: { roles: ALL, contexts: ['gameplay', 'ui'] }, label: 'Mở giao diện bạn bè' },
  { action: 'open_chat', source: { device: 'keyboard', code: 'Enter' }, compatibility: { roles: ALL, contexts: ['gameplay', 'ui'] }, label: 'Mở giao diện trò chuyện' },
  { action: 'open_adventurer_handbook', source: { device: 'keyboard', code: 'F1' }, compatibility: { roles: ALL, contexts: ['gameplay', 'ui'] }, label: 'Mở Sổ tay Nhà mạo hiểm' },
  { action: 'open_coop', source: { device: 'keyboard', code: 'F2' }, compatibility: { roles: ALL, contexts: ['gameplay', 'ui'] }, label: 'Mở giao diện Co-op' },
  { action: 'open_wish', source: { device: 'keyboard', code: 'F3' }, compatibility: { roles: ALL, contexts: ['gameplay', 'ui'] }, label: 'Mở giao diện Cầu Nguyện' },
  { action: 'open_journal_battle_pass', source: { device: 'keyboard', code: 'F4' }, compatibility: { roles: ALL, contexts: ['gameplay', 'ui'] }, label: 'Mở giao diện Nhật ký hành trình / Battle Pass' },
  { action: 'open_events', source: { device: 'keyboard', code: 'F5' }, compatibility: { roles: ALL, contexts: ['gameplay', 'ui'] }, label: 'Mở giao diện sự kiện' },
  { action: 'track_quest', source: { device: 'keyboard', code: 'KeyV' }, compatibility: { roles: ALL }, label: 'Theo dõi hoặc điều hướng đến nhiệm vụ' },
  { action: 'open_notification_detail', source: { device: 'keyboard', code: 'KeyY' }, compatibility: { roles: ALL }, label: 'Mở chi tiết thông báo' },
  { action: 'open_arcane', source: { device: 'keyboard', code: 'KeyU' }, compatibility: { roles: ALL }, label: 'Mở giao diện bí cảnh (thiết lập được hỗ trợ)' },
  { action: 'open_help', source: { device: 'keyboard', code: 'KeyG' }, compatibility: { roles: ALL }, label: 'Xem hướng dẫn hoặc chi tiết trợ giúp' },
  { action: 'use_gadget', source: { device: 'keyboard', code: 'KeyZ' }, compatibility: { roles: ['all', 'gadget-user'], emphasis: true }, label: 'Sử dụng công cụ tiện ích (Gadget) — tùy Gadget trang bị' },
  { action: 'quick_use_context', source: { device: 'keyboard', code: 'KeyT' }, compatibility: { roles: ALL }, label: 'Chức năng nhanh hoặc tương tác theo ngữ cảnh' },
]);

/** Binding chuột — đối chiếu bảng §2 (kèm thao tác nhấn/giữ/move/wheel). */
export const DEFAULT_MOUSE_BINDINGS: readonly KeyBinding[] = Object.freeze([
  { action: 'normal_attack', source: { device: 'mouse', code: '0', button: 0, gesture: 'button-press' }, compatibility: { roles: ALL, contexts: [...GAMEPLAY, 'aiming'] }, label: 'Tấn công thường (chuột trái — nhấn)' },
  { action: 'charged_attack', source: { device: 'mouse', code: '0', button: 0, gesture: 'button-hold' }, compatibility: { roles: ALL, contexts: [...GAMEPLAY, 'aiming'] }, label: 'Trọng kích / ngắm bắn (chuột trái — giữ)' },
  { action: 'sprint_mouse', source: { device: 'mouse', code: '2', button: 2, gesture: 'button-press' }, compatibility: { roles: ALL }, label: 'Chạy nhanh (chuột phải — nhấn)' },
  { action: 'aim_modifier', source: { device: 'mouse', code: '2', button: 2, gesture: 'button-hold' }, compatibility: { roles: ['all', 'archer'], emphasis: true, contexts: AIMING }, label: 'Điều khiển theo trạng thái ngắm (chuột phải — giữ)' },
  { action: 'camera_look', source: { device: 'mouse', code: 'move', gesture: 'move' }, compatibility: { roles: ALL, contexts: [...GAMEPLAY, 'aiming'] }, label: 'Xoay camera, đổi hướng quan sát' },
  { action: 'elemental_sight_toggle', source: { device: 'mouse', code: '1', button: 1, gesture: 'wheel-press' }, compatibility: { roles: ALL }, label: 'Tầm nhìn nguyên tố (nhấn con lăn)' },
  { action: 'elemental_sight_hold', source: { device: 'mouse', code: '1', button: 1, gesture: 'wheel-hold' }, compatibility: { roles: ALL }, label: 'Tầm nhìn nguyên tố (giữ con lăn)' },
  { action: 'zoom_in', source: { device: 'mouse', code: 'wheel-up', gesture: 'wheel-up' }, compatibility: { roles: ALL, contexts: [...GAMEPLAY, 'ui'] }, label: 'Phóng to camera/giao diện (cuộn lên)' },
  { action: 'zoom_out', source: { device: 'mouse', code: 'wheel-down', gesture: 'wheel-down' }, compatibility: { roles: ALL, contexts: [...GAMEPLAY, 'ui'] }, label: 'Thu nhỏ camera/giao diện (cuộn xuống)' },
  { action: 'adjust_aim', source: { device: 'mouse', code: 'move', gesture: 'move' }, compatibility: { roles: ['archer'], emphasis: true, contexts: ['aiming'] }, label: 'Điều chỉnh hướng ngắm khi ngắm cung' },
  { action: 'shoot_arrow', source: { device: 'mouse', code: '0', button: 0, gesture: 'button-press' }, compatibility: { roles: ['archer'], emphasis: true, contexts: ['aiming'] }, label: 'Bắn tên khi ngắm cung (giữ để tích lực trọng kích)' },
]);

/** Combo `LeftAlt + 1–4`: đổi nhân vật + kích hoạt Kỹ năng nộ. */
export const DEFAULT_COMBOS: readonly ComboDefinition[] = Object.freeze([
  { modifier: 'AltLeft', keys: ['Digit1', 'Digit2', 'Digit3', 'Digit4'], actions: ['party_slot_1_burst', 'party_slot_2_burst', 'party_slot_3_burst', 'party_slot_4_burst'], compatibility: { roles: TEAM }, label: 'Left Alt + 1–4: đổi nhân vật và kích hoạt Kỹ năng nộ' },
]);

/** Profile mặc định đầy đủ (keyboard + mouse + combo). */
export function createDefaultKeyMapProfile(): KeyMapProfileData {
  return {
    name: 'genshin-style-default',
    bindings: [...DEFAULT_KEYBOARD_BINDINGS, ...DEFAULT_MOUSE_BINDINGS],
    combos: [...DEFAULT_COMBOS],
    metadata: { source: 'engine-default', version: 1 },
  };
}
