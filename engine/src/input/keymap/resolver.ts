/**
 * @file resolver.ts
 * @module @aetheria/engine/input/keymap/resolver
 * @description Bộ giải sự kiện theo vai trò nhân vật: `RoleKeyResolver` bọc
 * `CustomKeyMap` và trả về action **khớp vai trò hiện tại của nhân vật đang điều
 * khiển** — binding role khác vẫn tồn tại nhưng không kích hoạt cho nhân vật
 * này (vd action ngắm cung chỉ vào tay cung thủ). Role KHÔNG khóa data: profile
 * vẫn đầy đủ, đây là lớp lọc runtime.
 */

import type { CharacterRole, InputContext, RawInputEvent } from './types.js';
import { CustomKeyMap } from './builder.js';

/** Kết quả resolve cho một frame. */
export interface ResolvedInput {
  /** Action khớp sự kiện (đã lọc role + context), theo thứ tự ưu tiên. */
  actions: string[];
  /** Action có emphasis cho role hiện tại (gợi ý highlight UI). */
  emphasized: string[];
}

/** Resolver gắn vai trò: input event → action của nhân vật đang điều khiển. */
export class RoleKeyResolver {
  private currentRole: CharacterRole = 'all';
  private currentContext: InputContext = 'gameplay';

  constructor(
    private readonly keyMap: CustomKeyMap,
    /** Vai trò của từng nhân vật theo ô đội hình (slot 1–4). */
    private readonly partyRoles: readonly CharacterRole[] = ['all', 'all', 'all', 'all'],
    private activeSlot = 0,
  ) {}

  /** Đổi vai trò hiện tại (khi đổi nhân vật trong đội). */
  public setRole(role: CharacterRole): void {
    this.currentRole = role;
  }

  /** Vai trò hiện tại. */
  public get role(): CharacterRole {
    return this.currentRole;
  }

  /** Đổi ô đội hình đang điều khiển → tự cập nhật role. */
  public setActiveSlot(slot: number): void {
    const clamped = Math.max(0, Math.min(this.partyRoles.length - 1, Math.floor(slot)));
    this.activeSlot = clamped;
    this.currentRole = this.partyRoles[clamped] ?? 'all';
  }

  /** Ô đội hình đang điều khiển. */
  public get activeSlotIndex(): number {
    return this.activeSlot;
  }

  /** Đặt ngữ cảnh hiện tại (gameplay/aiming/swimming...). */
  public setContext(context: InputContext): void {
    this.currentContext = context;
  }

  /**
   * Resolve một sự kiện thô: trả action khớp role hiện tại; action của role
   * khác bị lọc (không kích hoạt) — đúng nghĩa "phím ai dùng được".
   */
  public resolve(event: Omit<RawInputEvent, 'context'> & { context?: InputContext }): ResolvedInput {
    const held = event.heldModifiers ?? [];
    const actions = this.keyMap.resolve({
      device: event.device === 'gamepad' ? 'keyboard' : event.device,
      code: event.code,
      gesture: event.gesture,
      button: event.button,
      heldModifiers: held,
      context: event.context ?? this.currentContext,
    });
    const filtered = actions.filter((action) => this.actionAllowedForRole(action));
    return {
      actions: filtered,
      emphasized: this.keyMap.emphasizedForRole(this.currentRole).map((binding) => binding.action),
    };
  }

  /** Action có binding/combo cho role hiện tại không (truy vấn, không khóa profile). */
  public actionAllowedForRole(action: string): boolean {
    const roles = this.keyMap.actionRoles(action);
    if (roles.length === 0) return false;
    return roles.includes('all') || roles.includes(this.currentRole);
  }

  /** Tất cả action khả dụng cho role hiện tại (gợi ý UI thiết lập). */
  public availableActions(): string[] {
    return this.keyMap.actionsForRole(this.currentRole);
  }

  /** Đổi toàn bộ vai trò đội hình (vd load save). */
  public setPartyRoles(roles: readonly CharacterRole[]): void {
    (this.partyRoles as CharacterRole[]).splice(0, this.partyRoles.length, ...roles);
    this.setActiveSlot(this.activeSlot);
  }
}
