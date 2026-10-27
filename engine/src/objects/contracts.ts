/**
 * @file contracts.ts
 * @module @aetheria/engine/objects/contracts
 * @description Lớp RÀNG BUỘC thuộc tính cho objects: mỗi loại đối tượng
 * (`EntityKind`) buộc phải mang đầy đủ các nhóm thuộc tính phù hợp được nêu
 * trong ENGINE.md (bảng phân hệ + contract `IEntity`, `IHealthPool`,
 * `PhysicsBody`, inventory, progression...). Hợp đồng được thi hành ở CẢ hai
 * mức:
 *
 * - **Compile-time**: generic `RequiredGroups<TKind>` và `ConstrainedEntity`
 *   buộc kiểu dữ liệu mang đủ nhóm bắt buộc (thiếu thuộc tính → lỗi TS).
 * - **Runtime**: `validateEntityContract` trả danh sách nhóm thiếu/sai với
 *   thông báo tiếng Việt chính xác; `assertEntityContract` ném lỗi fail-fast.
 *
 * Về thuộc tính "quốc gia, giáo phái": ĐƯỢC PHÉP — nằm trong nhóm
 * `LoreIdentity` **tùy chọn** (dữ liệu thế giới giả tưởng: quốc gia/phái/giáo
 * phái là lore id, không phải dữ liệu người chơi thật; engine đã có module
 * `civilization` + `law` implying các thực thể này). Mọi object KHÔNG bắt buộc
 * mang lore — một hòn đá không có quốc tịch.
 */

import type { CollisionShape, PhysicsBody } from '../types/physics.types.js';
import type { IEntity, Transform3D, EntityLifecycleState } from './entities.js';

// ---------------------------------------------------------------------------
// Nhóm thuộc tính (property groups) — mỗi nhóm là một "mặt" của object
// ---------------------------------------------------------------------------

/** Nhóm nhận diện bắt buộc cho MỌI object. */
export interface IdentityContract {
  readonly id: string;
  name: string;
  kind: EntityKind;
  tags: ReadonlySet<string>;
  lifecycle: EntityLifecycleState;
}

/** Nhóm không gian (khớp `Transform3D`). */
export interface SpatialContract {
  transform: Transform3D;
}

/** Nhóm vật lý (tham chiếu `PhysicsBody` của physics module). */
export interface PhysicalContract {
  physics: Pick<PhysicsBody, 'mass' | 'velocity' | 'shape' | 'drag' | 'gravityScale'>;
  /** Shape rút gọn cho truy vấn nhanh (khớp `CollisionShape`). */
  collisionShape: CollisionShape;
}

/** Nhóm sinh tồn — máu/mana/năng lượng (khớp `IHealthPool`/`IManaPool`/`IEnergyPool`). */
export interface VitalContract {
  health: { current: number; max: number };
  mana?: { current: number; max: number };
  energy?: { current: number; max: number };
}

/** Nhóm chiến đấu. */
export interface CombatContract {
  attack: number;
  defense: number;
  /** Id kỹ năng khả dụng (khớp `skills.ts`). */
  skillIds: readonly string[];
}

/** Nhóm kho đồ (khớp `inventory.ts`). */
export interface InventoryContract {
  /** Id item trong kho (khem chi tiết Item — tra `inventory.ts`). */
  itemIds: readonly string[];
  capacity: number;
}

/** Nhóm tiến hóa (khớp `progression.ts`). */
export interface ProgressionContract {
  level: number;
  experience: number;
}

/** Nhóm render. */
export interface RenderContract {
  meshId: string;
  materialId?: string;
  /** Uri texture nếu có (khớp `MaterialData.textureUri`). */
  textureUri?: string;
}

/** Nhóm hoạt ảnh (khớp `animation/` clip names). */
export interface AnimationContract {
  /** Tên clip mặc định (vd 'idle'). */
  defaultClipName: string;
  /** Danh sách clip khả dụng. */
  clipNames: readonly string[];
}

/** Nhóm trí tuệ (khớp `ai/` brain refs). */
export interface AIContract {
  /** Loại não: FSM/behaviour tree/agentic... */
  brainKind: 'fsm' | 'behavior-tree' | 'agentic' | 'none';
  /** Id behaviour tree / brain config nếu có. */
  brainConfigId?: string;
}

// ---------------------------------------------------------------------------
// LoreIdentity — quốc gia / giáo phái / phái: ĐƯỢC PHÉP, TÙY CHỌN
// ---------------------------------------------------------------------------

/**
 * Nhóm bản sắc lore (dữ liệu thế giới giả tưởng) — **TÙY CHỌN**.
 *
 * Vì sao ĐƯỢC PHÉP: đây là dữ liệu fiction phục vụ gameplay (dụng cụ nhận diện
 * phe, nhiệm vụ theo quốc gia, hệ luật `law/` xét xử theo pháp điển của đất
 * nước trong game...). Giá trị là **lore id** do game định nghĩa (vd
 * `'mondstadt'`, `'church-of-favonius'`) — không liên kết dữ liệu người thật.
 * Mọi object KHÔNG bắt buộc mang lore: một hòn đá không có quốc tịch.
 */
export interface LoreIdentityContract {
  /** Quốc gia trong lore (vd `'liyue'`). */
  nationality?: { nationId: string; nationName: string };
  /** Phái/tổ chức (vd `'knights-of-favonius'`). */
  faction?: { factionId: string; factionName: string };
  /** Giáo phái/tôn giáo trong lore (vd `'church-of-the-winds'`). */
  religion?: { faithId: string; faithName: string };
  /** Nơi sinh/origin. */
  origin?: { regionId: string; regionName: string };
}

/** Type-guard: object có LoreIdentity không. */
export function hasLoreIdentity(
  entity: object,
): entity is object & { lore: LoreIdentityContract } {
  return typeof (entity as { lore?: unknown }).lore === 'object' && (entity as { lore?: object }).lore !== null;
}

// ---------------------------------------------------------------------------
// EntityKind → ma trận nhóm bắt buộc ("buộc phải mang đủ thuộc tính phù hợp")
// ---------------------------------------------------------------------------

/** Loại đối tượng được engine nhận diện. */
export type EntityKind =
  | 'creature'
  | 'item'
  | 'structure'
  | 'vehicle'
  | 'projectile'
  | 'prop';

/** Tên nhóm thuộc tính. */
export type PropertyGroupName =
  | 'identity'
  | 'spatial'
  | 'physical'
  | 'vital'
  | 'combat'
  | 'inventory'
  | 'progression'
  | 'render'
  | 'animation'
  | 'ai';

/**
 * Ma trận RÀNG BUỘC: mỗi kind buộc phải mang những nhóm nào.
 * `identity` + `spatial` bắt buộc cho mọi kind.
 */
export const ENTITY_KIND_REQUIREMENTS: Readonly<Record<EntityKind, readonly PropertyGroupName[]>> = Object.freeze({
  creature: ['identity', 'spatial', 'physical', 'vital', 'combat', 'progression', 'render', 'animation', 'ai'],
  item: ['identity', 'spatial', 'inventory', 'render'],
  structure: ['identity', 'spatial', 'physical', 'render'],
  vehicle: ['identity', 'spatial', 'physical', 'render', 'animation'],
  projectile: ['identity', 'spatial', 'physical', 'render'],
  prop: ['identity', 'spatial', 'render'],
});

/** Type-level: nhóm bắt buộc của kind (dùng cho generic). */
export type RequiredGroups<TKind extends EntityKind> =
  TKind extends 'creature' ? PhysicalContract & VitalContract & CombatContract & ProgressionContract & RenderContract & AnimationContract & AIContract
  : TKind extends 'item' ? InventoryContract & RenderContract
  : TKind extends 'structure' ? PhysicalContract & RenderContract
  : TKind extends 'vehicle' ? PhysicalContract & RenderContract & AnimationContract
  : TKind extends 'projectile' ? PhysicalContract & RenderContract
  : RenderContract;

/** Input chung: identity + transform bắt buộc cho mọi kind. */
export interface EntityIdentityInput {
  id: string;
  name: string;
  tags?: readonly string[];
}

/** Giao diện runtime phẳng của entity đã ràng buộc (validate theo kind). */
export interface ConstrainedEntityShape extends IEntity<Record<string, unknown>> {
  kind: EntityKind;
  tags: ReadonlySet<string>;
  transform: Transform3D;
}

// ---------------------------------------------------------------------------
// Validator runtime
// ---------------------------------------------------------------------------

/** Một mục thiếu/sai khi validate. */
export interface PropertyViolation {
  group: PropertyGroupName;
  /** Tên trường cụ thể thiếu/sai (vd `health.max`). */
  field: string;
  reason: string;
}

/** Kết quả validate contract. */
export interface EntityValidationResult {
  kind: EntityKind;
  valid: boolean;
  missing: PropertyViolation[];
  /** Các nhóm không bắt buộc nhưng có sẵn (telemetry). */
  presentGroups: readonly PropertyGroupName[];
}

function hasOwn(obj: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/** Kiểm một nhóm có "hiện diện đầy đủ" trên object không; trả vi phạm cụ thể. */
function checkGroup(
  obj: object,
  group: PropertyGroupName,
  out: PropertyViolation[],
): boolean {
  const record = obj as Record<string, unknown>;
  const requireNumber = (path: string): boolean => {
    const value = path.split('.').reduce<unknown>(
      (acc, key) => (typeof acc === 'object' && acc !== null ? (acc as Record<string, unknown>)[key] : undefined),
      record,
    );
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      out.push({ group, field: path, reason: 'thiếu hoặc không phải số hữu hạn' });
      return false;
    }
    return true;
  };
  const requireString = (path: string): boolean => {
    const value = path.split('.').reduce<unknown>(
      (acc, key) => (typeof acc === 'object' && acc !== null ? (acc as Record<string, unknown>)[key] : undefined),
      record,
    );
    if (typeof value !== 'string' || value.trim() === '') {
      out.push({ group, field: path, reason: 'thiếu hoặc rỗng' });
      return false;
    }
    return true;
  };
  const requireArray = (path: string): boolean => {
    const value = path.split('.').reduce<unknown>(
      (acc, key) => (typeof acc === 'object' && acc !== null ? (acc as Record<string, unknown>)[key] : undefined),
      record,
    );
    if (!Array.isArray(value)) {
      out.push({ group, field: path, reason: 'thiếu hoặc không phải mảng' });
      return false;
    }
    return true;
  };

  switch (group) {
    // Mỗi nhóm thu thập ĐỦ vi phạm (không short-circuit) để diagnostics
    // liệt kê cùng lúc mọi trường thiếu/sai.
    case 'identity': {
      const ok = [requireString('id'), requireString('name'), requireString('kind')];
      return ok.every(Boolean);
    }
    case 'spatial': {
      const ok = [
        requireArray('transform.position'),
        requireArray('transform.rotation'),
        requireArray('transform.scale'),
      ];
      return ok.every(Boolean);
    }
    case 'physical': {
      const ok = [
        requireNumber('physics.mass'),
        requireNumber('physics.velocity.x'),
        hasOwn(record, 'collisionShape'),
      ];
      return ok.every(Boolean);
    }
    case 'vital': {
      const ok = [requireNumber('health.current'), requireNumber('health.max')];
      return ok.every(Boolean);
    }
    case 'combat': {
      const ok = [requireNumber('attack'), requireNumber('defense'), requireArray('skillIds')];
      return ok.every(Boolean);
    }
    case 'inventory': {
      const ok = [requireArray('itemIds'), requireNumber('capacity')];
      return ok.every(Boolean);
    }
    case 'progression': {
      const ok = [requireNumber('level'), requireNumber('experience')];
      return ok.every(Boolean);
    }
    case 'render':
      return requireString('meshId');
    case 'animation': {
      const ok = [requireString('defaultClipName'), requireArray('clipNames')];
      return ok.every(Boolean);
    }
    case 'ai':
      return requireString('brainKind');
    default:
      return true;
  }
}

/** Nhóm hiện diện trên object (kể cả nhóm không bắt buộc cho kind). */
const ALL_GROUPS: readonly PropertyGroupName[] = [
  'identity', 'spatial', 'physical', 'vital', 'combat', 'inventory',
  'progression', 'render', 'animation', 'ai',
];

/**
 * Validate một object theo contract của kind: trả danh sách nhóm/field
 * thiếu hoặc sai. Không ném lỗi — caller quyết định.
 */
export function validateEntityContract(
  entity: object,
  kind: EntityKind,
): EntityValidationResult {
  const required = ENTITY_KIND_REQUIREMENTS[kind] ?? ['identity', 'spatial'];
  const missing: PropertyViolation[] = [];
  const presentGroups: PropertyGroupName[] = [];

  for (const group of required) {
    const present = checkGroup(entity, group, missing);
    if (present) presentGroups.push(group);
  }
  for (const group of ALL_GROUPS) {
    if (!required.includes(group) && !presentGroups.includes(group)) {
      // Nhóm tùy chọn: nếu object có sẵn data hợp lệ thì ghi nhận present.
      const probe: PropertyViolation[] = [];
      if (checkGroup(entity, group, probe)) presentGroups.push(group);
    }
  }

  return { kind, valid: missing.length === 0, missing, presentGroups };
}

/** Validate fail-fast: ném Error với danh sách vi phạm tiếng Việt. */
export function assertEntityContract(entity: object, kind: EntityKind): void {
  const result = validateEntityContract(entity, kind);
  if (!result.valid) {
    const details = result.missing
      .map((violation) => `[${violation.group}] ${violation.field}: ${violation.reason}`)
      .join('; ');
    throw new TypeError(`Object "${(entity as { id?: string }).id ?? '?'}" thiếu contract của kind "${kind}": ${details}`);
  }
}

// ---------------------------------------------------------------------------
// Abstract base + generic concrete class
// ---------------------------------------------------------------------------

/**
 * Abstract base: buộc mọi entity hiện thực `kind` và các nhóm bắt buộc của
 * kind qua abstract getters — quên một nhóm là không compile được.
 */
export abstract class AbstractGameEntity<TKind extends EntityKind> implements IEntity<Record<string, unknown>> {
  public abstract readonly kind: TKind;
  public abstract readonly id: string;
  public abstract name: string;
  public abstract transform: Transform3D;
  public abstract lifecycle: EntityLifecycleState;
  public abstract tags: ReadonlySet<string>;
  public abstract state: Record<string, unknown>;

  public abstract update(dt: number): void;
  public abstract destroy(): void;
}

/** Constructor input cho ConstrainedEntity: identity + các nhóm của kind. */
export interface ConstrainedEntityInput<TKind extends EntityKind> {
  id: string;
  name: string;
  tags?: readonly string[];
  /** Các nhóm bắt buộc theo kind (compile-time enforced). */
  groups: RequiredGroups<TKind> & { transform: Transform3D };
  /** Lore tùy chọn (quốc gia/giáo phái/pái/origin). */
  lore?: LoreIdentityContract;
  updateHook?: (dt: number) => void;
}

/**
 * `ConstrainedEntity<TKind>` — entity generic mang ĐỦ nhóm thuộc tính mà
 * `ENTITY_KIND_REQUIREMENTS` yêu cầu cho kind của nó, validate fail-fast lúc
 * khởi tạo, kèm `lore` tùy chọn (quốc gia/giáo phái được phép, không bắt buộc).
 */
export class ConstrainedEntity<TKind extends EntityKind>
  extends AbstractGameEntity<TKind>
  implements ConstrainedEntityShape {
  public readonly kind: TKind;
  public readonly id: string;
  public name: string;
  public transform: Transform3D;
  public lifecycle: EntityLifecycleState = 'active';
  public tags: ReadonlySet<string>;
  public state: Record<string, unknown> = {};
  /** Nhóm thuộc tính đầy đủ của entity (đúng shape theo kind). */
  public readonly groups: RequiredGroups<TKind> & { transform: Transform3D };
  /** Lore tùy chọn (quốc gia/giáo phái/faction/origin). */
  public readonly lore: LoreIdentityContract | null;
  /** Physics body gốc nếu kind yêu cầu physical (dùng bởi physics module). */
  public readonly physicsBody: PhysicsBody | null;

  private readonly updateHook: ((dt: number) => void) | undefined;

  constructor(input: ConstrainedEntityInput<TKind> & { kind: TKind }) {
    super();
    this.kind = input.kind;
    this.id = input.id;
    this.name = input.name;
    this.transform = input.groups.transform;
    this.tags = new Set(input.tags ?? []);
    this.groups = input.groups;
    this.lore = input.lore ?? null;
    this.updateHook = input.updateHook;
    // Spread groups lên top-level instance: entity MANG trực tiếp các thuộc tính
    // (entity.health, entity.meshId...) đúng contract phẳng mà validator đọc.
    Object.assign(this, input.groups);
    this.physicsBody = 'physics' in input.groups
      ? {
          id: input.id,
          mass: (input.groups as unknown as PhysicalContract).physics.mass,
          position: { x: input.groups.transform.position[0], y: input.groups.transform.position[1], z: input.groups.transform.position[2] },
          velocity: { ...((input.groups as unknown as PhysicalContract).physics.velocity) },
          shape: (input.groups as unknown as PhysicalContract).collisionShape,
          drag: (input.groups as unknown as PhysicalContract).physics.drag,
          gravityScale: (input.groups as unknown as PhysicalContract).physics.gravityScale,
        }
      : null;
    // Fail-fast: thiếu nhóm nào báo ngay với thông báo tiếng Việt.
    assertEntityContract(this, input.kind);
  }

  public update(dt: number): void {
    this.updateHook?.(dt);
  }

  public destroy(): void {
    this.lifecycle = 'destroyed';
  }

  /** Lore id quốc gia nếu có (tiện query). */
  public get nationalityId(): string | null {
    return this.lore?.nationality?.nationId ?? null;
  }

  /** Lore id giáo phái nếu có. */
  public get faithId(): string | null {
    return this.lore?.religion?.faithId ?? null;
  }
}
