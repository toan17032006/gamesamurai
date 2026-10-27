/**
 * @file builder.ts
 * @module @aetheria/engine/input/keymap/builder
 * @description Lớp tùy chỉnh key map: `KeyMapBuilder` (fluent) + `CustomKeyMap`
 * (runtime). Game khác 100% key map mặc định → chỉ cần import các lớp này,
 * `bind()`/`rebind()`/`setKey()` theo ý thích, hoặc dựng profile từ đầu.
 *
 * Năng lực:
 * - `bind()` thêm binding mới; `rebind()` thay nguồn của action; `unbind()`.
 * - Combo chord (`LeftAlt + 1`) khai báo qua `addCombo()`.
 * - Phát hiện xung đột: hai action khác nhau cùng một nguồn + context.
 * - Serialize/parse JSON (lưu thiết lập người chơi) + validation.
 * - `KeyMapBuilder.fromDefaults()` khởi đầu từ profile chuẩn rồi chỉnh.
 */

import { clampRange } from '../../deeplearning/random.js';
import type {
  CharacterCompatibility,
  CharacterRole,
  ComboDefinition,
  InputContext,
  InputSource,
  KeyBinding,
  KeyMapProfileData,
  KeyboardKey,
} from './types.js';
import { createDefaultKeyMapProfile } from './defaults.js';

/** Khóa nguồn chuẩn hóa để so sánh/phát hiện xung đột. */
export function sourceKey(source: InputSource, chord?: KeyboardKey): string {
  const gesture = source.gesture ?? (source.device === 'keyboard' ? 'press' : 'button-press');
  return `${source.device}:${source.code}:${gesture}${chord ? `+${chord}` : ''}`;
}

/** Kết quả kiểm tra xung đột. */
export interface BindingConflict {
  actionA: string;
  actionB: string;
  source: InputSource;
  context: InputContext;
}

/** Kiểm tra hai binding có va chạm nguồn trong context chung không.
 *
 * Cặp "chuyên biệt hóa" (một binding có `emphasis: true` cho role khác) cố tình
 * dùng chung nguồn (vd camera_look vs adjust_aim đều là di chuyển chuột) —
 * không tính là xung đột.
 */
function conflicts(a: KeyBinding, b: KeyBinding): boolean {
  const contextOverlap = (a.compatibility.contexts ?? ['gameplay']).some((context) =>
    (b.compatibility.contexts ?? ['gameplay']).includes(context),
  );
  if (!contextOverlap) return false;
  const isSpecialization = a.compatibility.emphasis === true || b.compatibility.emphasis === true;
  if (isSpecialization) return false;
  const sameDevice = a.source.device === b.source.device;
  const sameCode = a.source.code === b.source.code;
  const sameGesture = (a.source.gesture ?? (a.source.device === 'keyboard' ? 'press' : 'button-press')) ===
    (b.source.gesture ?? (b.source.device === 'keyboard' ? 'press' : 'button-press'));
  const sameChord = (a.chord ?? null) === (b.chord ?? null);
  return sameDevice && sameCode && sameGesture && sameChord;
}

/**
 * `KeyMapBuilder` — dựng profile bằng chuỗi gọi hàm (fluent).
 *
 * ```ts
 * const profile = new KeyMapBuilder('my-game')
 *   .bind({ action: 'dash', source: { device: 'keyboard', code: 'Space' },
 *           compatibility: { roles: ['all'] }, label: 'Dash' })
 *   .addCombo({ modifier: 'ShiftLeft', keys: ['Digit1'], actions: ['ult_1'],
 *               compatibility: { roles: ['all'] }, label: 'Shift+1' })
 *   .build();
 * ```
 */
export class KeyMapBuilder {
  private readonly bindings: KeyBinding[] = [];
  private readonly combos: ComboDefinition[] = [];
  private readonly metadata: Record<string, unknown>;

  constructor(private readonly name: string, metadata: Record<string, unknown> = {}) {
    this.metadata = { ...metadata };
  }

  /** Khởi đầu từ profile mặc định (Genshin-style) rồi chỉnh tiếp. */
  public static fromDefaults(name = 'custom-from-defaults'): KeyMapBuilder {
    const builder = new KeyMapBuilder(name, { basedOn: 'genshin-style-default' });
    const defaults = createDefaultKeyMapProfile();
    for (const binding of defaults.bindings) builder.bindings.push({ ...binding });
    for (const combo of defaults.combos) builder.combos.push({ ...combo });
    return builder;
  }

  /** Thêm một binding; trả `this` để chuỗi gọi. */
  public bind(binding: KeyBinding): this {
    this.bindings.push({ ...binding, compatibility: cloneCompatibility(binding.compatibility) });
    return this;
}

  /** Shortcut: gắn phím bàn phím cho action. */
  public bindKey(
    action: string,
    code: KeyboardKey,
    label: string,
    roles: readonly CharacterRole[] = ['all'],
    options: { chord?: KeyboardKey; contexts?: readonly InputContext[]; emphasis?: boolean } = {},
  ): this {
    return this.bind({
      action,
      source: { device: 'keyboard', code },
      compatibility: { roles: [...roles], ...(options.emphasis !== undefined ? { emphasis: options.emphasis } : {}), ...(options.contexts ? { contexts: [...options.contexts] } : {}) },
      label,
      ...(options.chord ? { chord: options.chord } : {}),
    });
  }

  /** Shortcut: gắn nút chuột + gesture cho action. */
  public bindMouse(
    action: string,
    button: 0 | 1 | 2 | 3 | 4,
    gesture: 'button-press' | 'button-hold' | 'button-double',
    label: string,
    roles: readonly CharacterRole[] = ['all'],
    contexts?: readonly InputContext[],
  ): this {
    return this.bind({
      action,
      source: { device: 'mouse', code: String(button), button, gesture },
      compatibility: { roles: [...roles], ...(contexts ? { contexts: [...contexts] } : {}) },
      label,
    });
  }

  /** Thêm combo chord. */
  public addCombo(combo: ComboDefinition): this {
    this.combos.push({ ...combo, compatibility: cloneCompatibility(combo.compatibility) });
    return this;
  }

  /** Gắn metadata. */
  public setMetadata(key: string, value: unknown): this {
    this.metadata[key] = value;
    return this;
  }

  /** Danh sách xung đột hiện tại (không chặn build — để game tự quyết). */
  public conflicts(): BindingConflict[] {
    const result: BindingConflict[] = [];
    for (let i = 0; i < this.bindings.length; i++) {
      for (let j = i + 1; j < this.bindings.length; j++) {
        if (conflicts(this.bindings[i], this.bindings[j])) {
          result.push({
            actionA: this.bindings[i].action,
            actionB: this.bindings[j].action,
            source: { ...this.bindings[i].source },
            context: (this.bindings[i].compatibility.contexts ?? ['gameplay'])[0] ?? 'gameplay',
          });
        }
      }
    }
    return result;
  }

  /** Hoàn tất profile. */
  public build(): KeyMapProfileData {
    return {
      name: this.name,
      bindings: this.bindings.map((binding) => ({ ...binding })),
      combos: this.combos.map((combo) => ({ ...combo })),
      metadata: { ...this.metadata, conflicts: this.conflicts().length },
    };
  }
}

function cloneCompatibility(compatibility: CharacterCompatibility): CharacterCompatibility {
  return {
    roles: [...compatibility.roles],
    ...(compatibility.emphasis !== undefined ? { emphasis: compatibility.emphasis } : {}),
    ...(compatibility.contexts ? { contexts: [...compatibility.contexts] } : {}),
  };
}

/**
 * `CustomKeyMap` — key map runtime cho một profile bất kỳ.
 *
 * Khác `InputMap` (input-map.ts, engine-level event loop): lớp này quản lý
 * **dữ liệu mapping** — tra cứu action theo sự kiện, rebind, vai trò nhân vật,
 * serialize thiết lập. Có thể ghép với `InputMap` (cấp sự kiện) hoặc hệ input
 * riêng của game.
 */
export class CustomKeyMap {
  private bindings: KeyBinding[] = [];
  private combos: ComboDefinition[];
  public readonly name: string;

  constructor(profile: KeyMapProfileData) {
    this.name = profile.name;
    this.bindings = profile.bindings.map((binding) => ({ ...binding }));
    this.combos = profile.combos.map((combo) => ({ ...combo }));
  }

  /** Tra binding theo action (tất cả nguồn). */
  public bindingsOf(action: string): KeyBinding[] {
    return this.bindings.filter((binding) => binding.action === action);
  }

  /**
   * Vai trò được phép dùng action — tính từ binding lẫn combo (action chỉ tồn
   * tại trong combo — vd `party_slot_2_burst` — vẫn có roles).
   */
  public actionRoles(action: string): readonly CharacterRole[] {
    const bindingRoles = this.bindingsOf(action).flatMap((binding) => binding.compatibility.roles);
    const comboRoles = this.combos.flatMap((combo) =>
      combo.actions.includes(action) ? combo.compatibility.roles : [],
    );
    if (bindingRoles.includes('all') || comboRoles.includes('all')) return ['all'];
    return [...new Set([...bindingRoles, ...comboRoles])];
  }

  /** Đổi nguồn của một action (rebind): thay toàn bộ nguồn cũ bằng nguồn mới. */
  public rebind(action: string, source: InputSource, chord?: KeyboardKey): void {
    const kept = this.bindings.filter((binding) => binding.action !== action);
    const replaced = this.bindingsOf(action);
    if (replaced.length === 0) throw new RangeError(`Action "${action}" chưa được gán`);
    const template = replaced[0];
    this.bindings = [
      ...kept,
      { ...template, source: { ...source }, ...(chord ? { chord } : { chord: undefined }) },
    ];
  }

  /** Đổi chỉ phím của action (giữ device/gesture). */
  public setKey(action: string, code: KeyboardKey): void {
    const targets = this.bindings.filter((binding) => binding.action === action);
    if (targets.length === 0) throw new RangeError(`Action "${action}" chưa được gán`);
    for (const binding of targets) {
      binding.source = { ...binding.source, code };
    }
  }

  /** Gỡ mọi nguồn của action. */
  public unbind(action: string): void {
    this.bindings = this.bindings.filter((binding) => binding.action !== action);
  }

  /** Thêm binding mới vào runtime. */
  public addBinding(binding: KeyBinding): void {
    this.bindings.push({ ...binding, compatibility: cloneCompatibility(binding.compatibility) });
  }

  /** Danh sách action có sẵn cho một vai trò: `'all'` luôn được tính. */
  public actionsForRole(role: CharacterRole): string[] {
    const actions = new Set<string>();
    for (const binding of this.bindings) {
      const roles = binding.compatibility.roles;
      if (roles.includes('all') || roles.includes(role)) actions.add(binding.action);
    }
    for (const combo of this.combos) {
      if (combo.compatibility.roles.includes('all') || combo.compatibility.roles.includes(role)) {
        for (const action of combo.actions) actions.add(action);
      }
    }
    return [...actions].sort();
  }

  /** Các binding "đặc biệt hữu ích" cho vai trò (emphasis khớp role). */
  public emphasizedForRole(role: CharacterRole): KeyBinding[] {
    return this.bindings.filter(
      (binding) =>
        binding.compatibility.emphasis === true &&
        (binding.compatibility.roles.includes('all') || binding.compatibility.roles.includes(role)),
    );
  }

  /**
   * Resolve sự kiện thô → danh sách action khớp (ưu tiên priority cao, có
   * chord khớp heldModifiers, lọc context).
   */
  public resolve(event: {
    device: 'keyboard' | 'mouse';
    code: string;
    gesture?: 'button-press' | 'button-hold' | 'button-double' | 'move' | 'wheel-up' | 'wheel-down' | 'wheel-press' | 'wheel-hold' | 'press';
    button?: 0 | 1 | 2 | 3 | 4;
    heldModifiers?: readonly string[];
    context?: InputContext;
  }): string[] {
    const held = event.heldModifiers ?? [];
    const context = event.context ?? 'gameplay';
    const gesture = event.gesture ?? (event.device === 'keyboard' ? 'press' : 'button-press');
    const matches = this.bindings
      .filter((binding) => {
        const bindingGesture = binding.source.gesture ?? (binding.source.device === 'keyboard' ? 'press' : 'button-press');
        const chordOk = binding.chord ? held.includes(binding.chord) : !held.some((modifier) =>
          this.bindings.some((candidate) => candidate.chord === modifier && candidate.source.code === event.code),
        );
        return (
          binding.source.device === event.device &&
          binding.source.code === event.code &&
          bindingGesture === gesture &&
          chordOk &&
          (binding.compatibility.contexts ?? ['gameplay']).includes(context)
        );
      })
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    // Combo chord: ưu tiên action có chord khi modifier đang giữ.
    for (const combo of this.combos) {
      if (!held.includes(combo.modifier)) continue;
      const index = combo.keys.indexOf(event.code);
      if (index >= 0 && combo.actions[index]) {
        matches.unshift({
          action: combo.actions[index],
          source: { device: 'keyboard', code: event.code },
          compatibility: { ...combo.compatibility },
          label: combo.label,
          chord: combo.modifier,
          priority: 100,
        });
      }
    }
    return [...new Set(matches.map((match) => match.action))];
  }

  /** Xung đột nguồn trong profile hiện tại. */
  public conflicts(): BindingConflict[] {
    const result: BindingConflict[] = [];
    for (let i = 0; i < this.bindings.length; i++) {
      for (let j = i + 1; j < this.bindings.length; j++) {
        if (conflicts(this.bindings[i], this.bindings[j])) {
          result.push({
            actionA: this.bindings[i].action,
            actionB: this.bindings[j].action,
            source: { ...this.bindings[i].source },
            context: (this.bindings[i].compatibility.contexts ?? ['gameplay'])[0] ?? 'gameplay',
          });
        }
      }
    }
    return result;
  }

  /** Serialize thành JSON thuần (lưu thiết lập người chơi). */
  public toJSON(): KeyMapProfileData {
    return {
      name: this.name,
      bindings: this.bindings.map((binding) => ({
        ...binding,
        compatibility: cloneCompatibility(binding.compatibility),
        source: { ...binding.source },
      })),
      combos: this.combos.map((combo) => ({ ...combo, compatibility: cloneCompatibility(combo.compatibility) })),
    };
  }

  /** Khôi phục từ JSON (đã validate bằng `parseKeyMapProfile`). */
  public static fromJSON(data: KeyMapProfileData): CustomKeyMap {
    return new CustomKeyMap(parseKeyMapProfile(data));
  }
}

/** Validate dữ liệu profile từ nguồn không tin cậy (localStorage/network). */
export function parseKeyMapProfile(data: unknown): KeyMapProfileData {
  if (typeof data !== 'object' || data === null) throw new TypeError('KeyMap profile phải là object');
  const record = data as Record<string, unknown>;
  if (typeof record.name !== 'string' || !record.name.trim()) {
    throw new TypeError('KeyMap profile cần name');
  }
  if (!Array.isArray(record.bindings)) throw new TypeError('KeyMap profile cần bindings');
  const bindings: KeyBinding[] = record.bindings.map((item) => {
    if (typeof item !== 'object' || item === null) throw new TypeError('Binding phải là object');
    const binding = item as Record<string, unknown>;
    const source = binding.source as Record<string, unknown> | undefined;
    const compatibility = binding.compatibility as Record<string, unknown> | undefined;
    if (!source || typeof source.device !== 'string' || typeof source.code !== 'string') {
      throw new TypeError('Binding cần source { device, code }');
    }
    if (!compatibility || !Array.isArray(compatibility.roles)) {
      throw new TypeError('Binding cần compatibility.roles');
    }
    return {
      action: String(binding.action ?? ''),
      source: { device: source.device as 'keyboard' | 'mouse' | 'gamepad', code: String(source.code) },
      compatibility: { roles: compatibility.roles as readonly string[] },
      label: String(binding.label ?? binding.action ?? ''),
    };
  });
  const combos: ComboDefinition[] = Array.isArray(record.combos)
    ? record.combos.map((item) => {
        if (typeof item !== 'object' || item === null) throw new TypeError('Combo phải là object');
        const combo = item as Record<string, unknown>;
        return {
          modifier: String(combo.modifier ?? ''),
          keys: (combo.keys as readonly string[] ?? []).map(String),
          actions: (combo.actions as readonly string[] ?? []).map(String),
          compatibility: { roles: ((combo.compatibility as Record<string, unknown>)?.roles as readonly string[]) ?? ['all'] },
          label: String(combo.label ?? ''),
        };
      })
    : [];
  return { name: record.name, bindings, combos };
}

/** Giới hạn số binding an toàn (phòng dữ liệu lỗi phình to). */
export function clampBindingCount(count: number): number {
  return clampRange(Math.floor(count), 0, 4096);
}
