// Bảng phím điều khiển (có thể đổi phím trong Settings).
// Mouse0/1/2 = chuột trái/giữa/phải. Toàn bộ hành động đọc qua Input.
export const ACTIONS = {
  // ---- di chuyển ----
  forward: { label: 'Tiến lên', default: 'KeyW', group: 'Di chuyển' },
  back: { label: 'Lùi lại', default: 'KeyS', group: 'Di chuyển' },
  left: { label: 'Sang trái', default: 'KeyA', group: 'Di chuyển' },
  right: { label: 'Sang phải', default: 'KeyD', group: 'Di chuyển' },
  jump: { label: 'Nhảy', default: 'Space', group: 'Di chuyển' },
  sprint: { label: 'Chạy nhanh (giữ) · Né (gõ nhanh)', default: 'ShiftLeft', group: 'Di chuyển' },
  walk: { label: 'Đi bộ', default: 'ControlLeft', group: 'Di chuyển' },
  cursor: { label: 'Hiện con trỏ chuột (giữ)', default: 'AltLeft', group: 'Di chuyển' },

  // ---- chiến đấu ----
  attack: { label: 'Đánh thường', default: 'Mouse0', group: 'Chiến đấu', mouse: true },
  elemental: { label: 'Kỹ năng nguyên tố', default: 'KeyE', group: 'Chiến đấu' },
  ultimate: { label: 'Kỹ năng nộ', default: 'KeyQ', group: 'Chiến đấu' },
  aim: { label: 'Chế độ ngắm', default: 'KeyR', group: 'Chiến đấu' },
  switch1: { label: 'Nhân vật 1', default: 'Digit1', group: 'Chiến đấu' },
  switch2: { label: 'Nhân vật 2', default: 'Digit2', group: 'Chiến đấu' },
  switch3: { label: 'Nhân vật 3', default: 'Digit3', group: 'Chiến đấu' },
  switch4: { label: 'Nhân vật 4', default: 'Digit4', group: 'Chiến đấu' },
  vision: { label: 'Thị giác nguyên tố (giữ)', default: 'Mouse1', group: 'Chiến đấu', mouse: true },
  block: { label: 'Đỡ / Parry', default: 'Mouse2', group: 'Chiến đấu', mouse: true },
  sheath: { label: 'Tra / rút vũ khí', default: 'KeyX', group: 'Chiến đấu' },
  special: { label: 'Thiền định / cơ chế đặc biệt', default: 'KeyT', group: 'Chiến đấu' },
  quickItem: { label: 'Dùng vật phẩm nhanh', default: 'KeyZ', group: 'Chiến đấu' },

  // ---- giao diện ----
  interact: { label: 'Tương tác / nhặt đồ', default: 'KeyF', group: 'Tương tác' },
  quests: { label: 'Nhiệm vụ', default: 'KeyJ', group: 'Tương tác' },
  map: { label: 'Bản đồ', default: 'KeyM', group: 'Tương tác' },
  inventory: { label: 'Túi đồ', default: 'KeyB', group: 'Tương tác' },
  character: { label: 'Nhân vật', default: 'KeyC', group: 'Tương tác' },
  handbook: { label: 'Sổ tay Nhà Mạo Hiểm', default: 'F1', group: 'Tương tác' },
  multiplayer: { label: 'Menu nhiều người chơi', default: 'F2', group: 'Tương tác' },
  quickwheel: { label: 'Vòng truy cập nhanh', default: 'Tab', group: 'Tương tác' },
  chat: { label: 'Chat', default: 'Enter', group: 'Tương tác' },
  pause: { label: 'Menu chính / tạm dừng', default: 'Escape', group: 'Tương tác' },
  formation: { label: 'Đội hình', default: 'KeyL', group: 'Tương tác' },
};

export const MOUSE_ACTIONS = {
  look: 'mouse',
  zoom: 'wheel',
};

const LABELS = {
  Space: 'Space', ShiftLeft: 'Shift', ControlLeft: 'Ctrl', AltLeft: 'Alt',
  Escape: 'Esc', Enter: 'Enter', Tab: 'Tab', F1: 'F1', F2: 'F2',
  Mouse0: 'Chuột trái', Mouse1: 'Chuột giữa', Mouse2: 'Chuột phải',
};

export function keyLabel(code) {
  if (!code) return '—';
  if (LABELS[code]) return LABELS[code];
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  return code;
}

export function actionsByGroup() {
  const out = new Map();
  for (const [id, a] of Object.entries(ACTIONS)) {
    const g = a.group || 'Khác';
    if (!out.has(g)) out.set(g, []);
    out.get(g).push({ id, ...a, key: keyLabel(a.default) });
  }
  return out;
}
