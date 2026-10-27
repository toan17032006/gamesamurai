/**
 * @file types.ts
 * @module @aetheria/engine/input/keymap/types
 * @description Hợp đồng dữ liệu cho hệ thống key map tách biệt 3 trường:
 * `key` (phím/chuột/thao tác), `action` (chức năng ngữ nghĩa) và
 * `characterCompatibility` (ai dùng được — vai trò chiến đấu, KHÔNG phải giới
 * hạn cứng của phím).
 *
 * Nguyên tắc thiết kế (rút từ bảng điều khiển chuẩn):
 * - `E`/`Q` là kỹ năng của MỌI nhân vật — role chỉ dùng để truy vấn/lọc gợi ý,
 *   không chặn input.
 * - `R` là chuyển chế độ ngắm, "đặc biệt hữu ích với cung thủ" → thể hiện qua
 *   `emphasis` (đánh dấu nổi bật) chứ không phải độc quyền.
 * - Chuột có *thao tác* (nhấn/giữ/di chuyển/con lăn) chứ không chỉ nút.
 * - Combo phím (vd `LeftAlt + Digit1`) là một binding với `chord`.
 */

/** Vai trò chiến đấu của nhân vật — dùng để TRUY VẤN độ phù hợp, không khóa phím. */
export type CharacterRole =
  | 'all'
  | 'archer'
  | 'melee-dps'
  | 'ranged-dps'
  | 'support'
  | 'healer'
  | 'shielder'
  | 'movement-special'
  | 'gadget-user'
  | (string & {});

/** Phím vật lý theo chuẩn `KeyboardEvent.code` (không phụ thuộc layout). */
export type KeyboardKey = string;

/** Nút chuột theo chỉ số `MouseEvent.button` (0 trái, 1 giữa, 2 phải...). */
export type MouseButtonIndex = 0 | 1 | 2 | 3 | 4;

/** Thao tác chuột ngoài nút bấm. */
export type PointerGestureKind =
  | 'button-press'   // nhấn (tap)
  | 'button-hold'    // giữ (tích lực trọng kích)
  | 'button-double'  // nhấn đúp
  | 'move'           // di chuyển chuột (xoay camera / chỉnh ngắm)
  | 'wheel-up'
  | 'wheel-down'
  | 'wheel-press'
  | 'wheel-hold';

/** Nguồn input: bàn phím, chuột hoặc gamepad. */
export type InputDevice = 'keyboard' | 'mouse' | 'gamepad';

/** Mô tả nguồn kích hoạt của một binding. */
export interface InputSource {
  device: InputDevice;
  /** Bàn phím: `KeyboardEvent.code`; chuột: chỉ số nút (kèm gesture); gamepad: chỉ số nút. */
  code: string;
  /** Thao tác chuột (mặc định 'button-press'); bàn phím bỏ trống. */
  gesture?: PointerGestureKind;
  /** Chỉ số nút chuột (0 trái, 2 phải, 1 giữa...) khi `device = 'mouse'`. */
  button?: MouseButtonIndex;
}

/** Ngữ cảnh kích hoạt — action chỉ có nghĩa trong context tương ứng. */
export type InputContext =
  | 'gameplay'
  | 'aiming'
  | 'swimming'
  | 'climbing'
  | 'gliding'
  | 'ui'
  | 'dialog'
  | (string & {});

/** Đối tượng nhận Binding — vai trò + emphasis, KHÔNG phải khóa cứng. */
export interface CharacterCompatibility {
  /** Vai trò dùng được binding này; `'all'` = mọi nhân vật. */
  roles: readonly CharacterRole[];
  /**
   * `true` = binding đặc biệt hữu ích cho role đầu tiên (vd `R` với cung thủ)
   * nhưng VẪN dùng được cho mọi nhân vật khác.
   */
  emphasis?: boolean;
  /** Ngữ cảnh binding có nghĩa (mặc định `gameplay`). */
  contexts?: readonly InputContext[];
}

/** Binding hoàn chỉnh — đúng 3 trường dữ liệu chính: key/action/compatibility. */
export interface KeyBinding {
  /** Định danh hành động ngữ nghĩa (vd `move_forward`, `elemental_skill`). */
  action: string;
  /** Nguồn kích hoạt: phím/nút/gesture (có thể nhiều nguồn cho 1 action). */
  source: InputSource;
  /** Ai dùng được (truy vấn, không khóa). */
  compatibility: CharacterCompatibility;
  /** Nhãn hiển thị tiếng Việt cho UI thiết lập điều khiển. */
  label: string;
  /** Combo chord: modifier phải giữ kèm (vd `LeftAlt` cho `Alt+1`). */
  chord?: KeyboardKey;
  /** Trọng số ưu tiên khi hai binding cùng khớp một sự kiện (cao thắng). */
  priority?: number;
}

/** Cặp combo `LeftAlt + 1..4`: đổi nhân vật + kích hoạt nộ. */
export interface ComboDefinition {
  /** Chord phải giữ. */
  modifier: KeyboardKey;
  /** Danh sách key thành viên. */
  keys: readonly KeyboardKey[];
  /** Action phát ra cho mỗi thành viên (thứ tự khớp `keys`). */
  actions: readonly string[];
  compatibility: CharacterCompatibility;
  label: string;
}

/** Bộ key map hoàn chỉnh (một profile). */
export interface KeyMapProfileData {
  name: string;
  bindings: readonly KeyBinding[];
  combos: readonly ComboDefinition[];
  metadata?: Record<string, unknown>;
}

/** Sự kiện input thô đưa vào resolver. */
export interface RawInputEvent {
  device: InputDevice;
  code: string;
  gesture?: PointerGestureKind;
  button?: MouseButtonIndex;
  /** Các modifier đang giữ (vd `['LeftAlt']`, `['ShiftLeft']`). */
  heldModifiers?: readonly KeyboardKey[];
  /** Ngữ cảnh hiện tại của game (mặc định `gameplay`). */
  context?: InputContext;
}
