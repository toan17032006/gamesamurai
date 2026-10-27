/**
 * @file interaction-ledger.ts
 * @module @aetheria/engine/worldview/interaction-ledger
 * @description Sổ cái tương tác thế giới (append-only): MỌI tác động của agent
 * và động vật — mua, chế tạo, đập phá, khôi phục, xếp đặt, đào, đốt, chôn… —
 * được ghi một entry có số thứ tự tuyệt đối (seq) thành **lịch sử tính được**;
 * state hiện tại của thế giới suy ra bằng `replay()`; mọi agent khác đọc được
 * sổ để biết "ở đây đã có gì xảy ra" rồi tác động tiếp. Entry tự publish vào
 * `SystemEventBus` chung và đổi thành `WorldEventMark` cho renderer.
 */

import type { Vec2, WorldEventMark } from './types.js';
import { clamp01, hashSeed } from '../deeplearning/random.js';
import { SystemEventBus } from './system-events.js';

/** Loại tương tác làm thay đổi thế giới. */
export type InteractionKind =
  | 'buy'
  | 'craft'
  | 'smash'
  | 'restore'
  | 'place'
  | 'arrange'
  | 'dig'
  | 'build'
  | 'chop'
  | 'burn'
  | 'bury'
  | 'steal'
  | 'harvest';

/** Ai gây ra tương tác. */
export type ActorKind = 'agent' | 'animal' | 'system';

/** Một mutation trên thế giới — bất biến, append-only. */
export interface WorldMutation<TPayload = unknown> {
  id: string;
  /** Số thứ tự tuyệt đối trong sổ — tính lịch sử, không thể chỉnh. */
  seq: number;
  actorId: string;
  actorKind: ActorKind;
  kind: InteractionKind;
  /** Loại đối tượng bị tác động (house/tree/ground/recipe…). */
  targetKind: string;
  targetId?: string;
  location: Vec2;
  /** Thời điểm thế giới. */
  sourceTime: number;
  /** Trạng thái trước/sau của đối tượng — tái dựng và đối chiếu được. */
  before?: unknown;
  after?: unknown;
  payload: TPayload;
  /** Mô tả tiếng Việt ngắn. */
  note: string;
}

/** Tuỳ chọn ghi sổ. */
export interface RecordOptions {
  targetId?: string;
  before?: unknown;
  after?: unknown;
  /** Publish vào bus sự kiện hệ thống chung (mặc định có). */
  publish?: boolean;
  /** Mức nặng cho marker render. */
  severity?: number;
}

/** Trạng thái một ô thế giới suy từ replay. */
export interface ReplayedCellState {
  location: Vec2;
  /** Loại đối tượng hiện hành tại ô này (mutate sau cùng thắng). */
  currentKind: string | null;
  currentTargetId: string | null;
  /** Số lần bị phá/khôi phục — lịch sử va chạm. */
  smashed: number;
  restored: number;
  built: number;
  lastActorId: string | null;
  /** Có đang chờ ai đó "tác động vô" không (đã smash chưa restore). */
  awaitingRestoration: boolean;
}

/** Sổ cái tương tác — nguồn chân lý lịch sử của thế giới. */
export class WorldLedger {
  /** Sổ append-only — KHÔNG sửa/xoá entry (lịch sử là lịch sử). */
  public readonly entries: WorldMutation[] = [];
  public readonly bus: SystemEventBus;
  private seq = 0;

  constructor(options: { bus?: SystemEventBus } = {}) {
    this.bus = options.bus ?? new SystemEventBus();
  }

  /**
   * Ghi một tương tác: seq tăng tuyệt đối, entry bất biến, tự publish vào bus
   * sự kiện chung (kind = `interaction.${kind}`) để hệ thống + agent khác nhận.
   */
  public record<TPayload>(
    actor: { id: string; kind: ActorKind },
    kind: InteractionKind,
    target: { kind: string; id?: string; location: Vec2 },
    payload: TPayload,
    sourceTime: number,
    note: string,
    options: RecordOptions = {},
  ): WorldMutation<TPayload> {
    const entry: WorldMutation<TPayload> = {
      id: `mut_${++this.seq}_${hashSeed(`${actor.id}:${kind}:${sourceTime}`).toString(16)}`,
      seq: this.seq,
      actorId: actor.id,
      actorKind: actor.kind,
      kind,
      targetKind: target.kind,
      targetId: options.targetId ?? target.id,
      location: { ...target.location },
      sourceTime,
      before: options.before,
      after: options.after,
      payload,
      note,
    };
    this.entries.push(entry as WorldMutation);
    if (options.publish ?? true) {
      this.bus.publish(
        `interaction.${kind}`,
        entry,
        sourceTime,
        {
          severity: clamp01(options.severity ?? (kind === 'smash' || kind === 'burn' ? 0.7 : 0.4)),
          location: entry.location,
          label: note,
        },
      );
    }
    return entry;
  }

  /** Lịch sử của một đối tượng cụ thể (theo targetId) — đầu vào cuối cùng là hiện tại. */
  public historyOf(targetId: string): WorldMutation[] {
    return this.entries.filter((entry) => entry.targetId === targetId);
  }

  /** Lịch sử của một tác nhân (agent/động vật) — nó đã đổi thế giới ra sao. */
  public actorHistory(actorId: string): WorldMutation[] {
    return this.entries.filter((entry) => entry.actorId === actorId);
  }

  /** Mọi tương tác trong bán kính R quanh một điểm — agent khác "tác động vô". */
  public near(location: Vec2, radius: number): WorldMutation[] {
    return this.entries.filter((entry) => Math.hypot(entry.location.x - location.x, entry.location.y - location.y) <= radius);
  }

  /**
   * Replay sổ cái → trạng thái suy luận của từng ô thế giới: cái gì đang đứng
   * ở đâu, đã bị phá bao nhiêu lần, được khôi phục chưa — nguồn để agent khác
   * quyết định tác động tiếp (ví dụ: nhà smash chưa restore → có thể restore).
   */
  public replay(): Map<string, ReplayedCellState> {
    const cells = new Map<string, ReplayedCellState>();
    const keyOf = (location: Vec2) => `${Math.round(location.x)},${Math.round(location.y)}`;
    for (const entry of this.entries) {
      const key = entry.targetId ?? keyOf(entry.location);
      let cell = cells.get(key);
      if (!cell) {
        cell = {
          location: { ...entry.location },
          currentKind: null,
          currentTargetId: null,
          smashed: 0,
          restored: 0,
          built: 0,
          lastActorId: null,
          awaitingRestoration: false,
        };
        cells.set(key, cell);
      }
      cell.lastActorId = entry.actorId;
      cell.currentKind = entry.targetKind;
      cell.currentTargetId = entry.targetId ?? cell.currentTargetId;
      switch (entry.kind) {
        case 'smash':
        case 'burn':
          cell.smashed++;
          cell.awaitingRestoration = true;
          break;
        case 'restore':
        case 'build':
          cell.restored++;
          cell.built++;
          cell.awaitingRestoration = false;
          break;
        default:
          break;
      }
    }
    return cells;
  }

  /** Kiểm tra tính toàn vẹn: seq liên tục tăng 1, không entry nào lệch. */
  public integrityCheck(): { valid: boolean; brokenAtSeq: number | null } {
    for (let i = 0; i < this.entries.length; i++) {
      if (this.entries[i].seq !== i + 1) {
        return { valid: false, brokenAtSeq: this.entries[i].seq };
      }
    }
    return { valid: true, brokenAtSeq: null };
  }

  /** Chuyển toàn bộ entry thành marker render (giới hạn gần nhất). */
  public toWorldEventMarks(limit = 50): WorldEventMark[] {
    const direct = ['battle', 'execution', 'burial', 'rebuilding', 'tsunami', 'eruption', 'earthquake', 'meteor', 'harvest_festival'];
    const mapped = this.entries.slice(-limit).map((entry) => ({
      kind: (
        direct.includes(entry.kind)
          ? entry.kind
          : entry.kind === 'smash' || entry.kind === 'burn' || entry.kind === 'chop'
            ? 'earthquake'
            : entry.kind === 'build' || entry.kind === 'restore' || entry.kind === 'craft'
              ? 'rebuilding'
              : entry.kind === 'buy'
                ? 'harvest_festival'
                : 'random_event'
      ) as WorldEventMark['kind'],
      x: entry.location.x,
      y: entry.location.y,
      intensity: entry.kind === 'smash' || entry.kind === 'burn' ? 0.8 : 0.4,
      t: 0.5,
    }));
    return mapped;
  }

  public stats(): { mutations: number; actors: number; smashed: number; restored: number } {
    const actors = new Set(this.entries.map((entry) => entry.actorId));
    return {
      mutations: this.entries.length,
      actors: actors.size,
      smashed: this.entries.filter((entry) => entry.kind === 'smash' || entry.kind === 'burn').length,
      restored: this.entries.filter((entry) => entry.kind === 'restore' || entry.kind === 'build').length,
    };
  }
}
