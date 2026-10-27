/**
 * @file system-events.ts
 * @module @aetheria/engine/worldview/system-events
 * @description Bus sự kiện hệ thống CHUNG: mọi sự kiện của thế giới (chém
 * giết, tử hình, chôn lấp, tái xây, thiên tai, dịch bệnh, lễ hội, khởi nghĩa…)
 * chảy về một dòng duy nhất, generic theo payload; subscriber theo loại hoặc
 * nhận tất cả; và chuyển đổi sang `WorldEventMark` cho renderer tự căn chỉnh.
 */

import type { WorldEventMark } from './types.js';
import { clamp01, hashSeed } from '../deeplearning/random.js';

/** Một sự kiện hệ thống — generic theo payload. */
export interface SystemEvent<TPayload = unknown> {
  id: string;
  /** Loại sự kiện: 'battle' | 'execution' | 'burial' | 'rebuilding' | 'pestilence' | … */
  kind: string;
  /** Thời điểm thế giới (giây hoặc năm tuỳ lớp gọi). */
  sourceTime: number;
  /** Mức nặng `[0, 1]`. */
  severity: number;
  /** Tên hiển thị (tiếng Việt) cho UI/log. */
  label: string;
  /** Toạ độ thế giới để renderer đặt marker. */
  location: { x: number; y: number };
  payload: TPayload;
}

/** Handler nhận sự kiện. */
export type SystemEventHandler<TPayload> = (event: SystemEvent<TPayload>) => void;

/** Tuỳ chọn publish. */
export interface PublishOptions {
  severity?: number;
  location?: { x: number; y: number };
  label?: string;
}

/** Cấu hình bus. */
export interface SystemEventBusOptions {
  /** Số sự kiện giữ trong lịch sử tối đa. */
  historyLimit?: number;
}

/**
 * Bus sự kiện hệ thống chung — mọi phân hệ (pháp luật, kị sĩ khải huyền,
 * sinh mệnh, văn minh) publish vào đây; renderer và UI subscribe theo kind
 * hoặc `'*'` (tất cả). Generic: `publish<T>` / `subscribe<T>` giữ kiểu payload.
 */
export class SystemEventBus {
  public readonly history: SystemEvent[] = [];
  public readonly historyLimit: number;
  private readonly handlers = new Map<string, Set<SystemEventHandler<never>>>();
  private counter = 0;

  constructor(options: SystemEventBusOptions = {}) {
    this.historyLimit = Math.max(1, options.historyLimit ?? 2000);
  }

  /** Đăng ký nhận sự kiện theo kind; `'*'` nhận tất cả. Trả hàm huỷ đăng ký. */
  public subscribe<TPayload>(kind: string, handler: SystemEventHandler<TPayload>): () => void {
    let set = this.handlers.get(kind);
    if (!set) {
      set = new Set();
      this.handlers.set(kind, set);
    }
    set.add(handler as unknown as SystemEventHandler<never>);
    return () => {
      set!.delete(handler as unknown as SystemEventHandler<never>);
    };
  }

  /** Phát một sự kiện vào bus — fan-out tới handlers và ghi lịch sử. */
  public publish<TPayload>(
    kind: string,
    payload: TPayload,
    sourceTime: number,
    options: PublishOptions = {},
  ): SystemEvent<TPayload> {
    const event: SystemEvent<TPayload> = {
      id: `sys_${++this.counter}_${hashSeed(`${kind}:${sourceTime}:${this.counter}`).toString(16)}`,
      kind,
      sourceTime,
      severity: clamp01(options.severity ?? 0.5),
      label: options.label ?? kind,
      location: options.location ?? { x: 0, y: 0 },
      payload,
    };
    this.history.push(event as SystemEvent);
    if (this.history.length > this.historyLimit) {
      this.history.splice(0, this.history.length - this.historyLimit);
    }
    for (const handler of this.handlers.get(kind) ?? []) {
      (handler as unknown as SystemEventHandler<TPayload>)(event);
    }
    for (const handler of this.handlers.get('*') ?? []) {
      (handler as unknown as SystemEventHandler<TPayload>)(event);
    }
    return event;
  }

  /** Lọc lịch sử theo kind ( '*' trả tất cả ). */
  public of(kind: string): SystemEvent[] {
    return kind === '*' ? [...this.history] : this.history.filter((event) => event.kind === kind);
  }

  /**
   * Chuyển sự kiện thành `WorldEventMark` để renderer tự sinh marker:
   * kind khớp trực tiếp (battle/execution/burial/rebuilding/tsunami…); kind
   * lạ rơi về `random_event`. Tiến trình t suy từ severity, intensity từ mức nặng.
   */
  public toWorldEventMarks(): WorldEventMark[] {
    const direct = ['tsunami', 'eruption', 'earthquake', 'meteor', 'harvest_festival', 'execution', 'battle', 'burial', 'rebuilding'];
    return this.history
      .filter((event) => event.location && (event.location.x !== 0 || event.location.y !== 0))
      .map((event) => {
        let kind = event.kind;
        if (kind.startsWith('interaction.')) {
          const act = kind.slice('interaction.'.length);
          kind =
            act === 'smash' || act === 'burn' || act === 'chop'
              ? 'earthquake'
              : act === 'build' || act === 'restore' || act === 'craft'
                ? 'rebuilding'
                : act === 'buy'
                  ? 'harvest_festival'
                  : 'random_event';
        }
        return {
          kind: (direct.includes(kind) ? kind : 'random_event') as WorldEventMark['kind'],
          x: event.location.x,
          y: event.location.y,
          intensity: event.severity,
          t: clamp01(event.severity * 0.8 + 0.1),
        };
      });
  }

  public stats(): { published: number; subscribers: number; kinds: number } {
    let subscriberCount = 0;
    for (const set of this.handlers.values()) subscriberCount += set.size;
    // Số loại sự kiện ĐÃ XẢY RA trong lịch sử (không phải số kênh subscribe).
    const kinds = new Set(this.history.map((event) => event.kind));
    return { published: this.history.length, subscribers: subscriberCount, kinds: kinds.size };
  }
}
