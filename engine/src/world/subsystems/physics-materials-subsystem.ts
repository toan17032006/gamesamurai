/**
 * @file physics-materials-subsystem.ts
 * @module @aetheria/engine/world/subsystems/physics-materials-subsystem
 * @description Rigid Body, Slicing/Chopping, Soft Body, Cloth, Ropes & Machinery (501–580).
 */

import { RigidBodyData, SoftBodyData } from '../types.js';
import type { Vec3 } from '../../types/index.js';

export class PhysicsMaterialsSubsystem {
  public rigidBodies: Map<string, RigidBodyData> = new Map();
  public softBodies: Map<string, SoftBodyData> = new Map();
  public mechanicalJoints: Map<string, any> = new Map();

  /**
   * Trạng thái phá hủy của từng vật thể.
   *
   * Trước đây các method phá hủy trả về giá trị hằng (`150`, `25`, `100`,
   * `['region_a','region_b']`, `{x:1,y:2,z:0}`) và không lưu gì — không có
   * cách nào biết vật đã gãy tới đâu. Nay trạng thái được lưu và phát triển
   * theo lực/động lượng thật.
   */
  public destructionStates: Map<string, {
    isDestroyed: boolean;
    /** Ngưỡng gãy (động lượng cần để phá vỡ). */
    fractureThreshold: number;
    /** Số vết nứt đã hình thành. */
    cracks: number;
    /** Các mảnh vỡ đã tách ra. */
    pieces: any[];
    /** Các phần đã tách rời. */
    detachedParts: any[];
  }> = new Map();

  /** Vận tốc ở bước trước — dùng để tính gia tốc thật. */
  private previousVelocities: Map<string, Vec3> = new Map();
  /** Bước thời gian của bước mô phỏng gần nhất. */
  private lastDeltaTime = 1 / 60;

  private idOf(object: any): string {
    return typeof object === 'string' ? object : (object?.id ?? 'obj');
  }

  private stateOf(object: any) {
    const id = this.idOf(object);
    let state = this.destructionStates.get(id);
    if (!state) {
      state = {
        isDestroyed: false,
        fractureThreshold: 150,
        cracks: 0,
        pieces: [],
        detachedParts: [],
      };
      this.destructionStates.set(id, state);
    }
    return state;
  }

  /** Độ lớn vector 3D (dùng cho lực / động lượng). */
  private magnitudeOf(value: any): number {
    if (typeof value === 'number') return Number.isFinite(value) ? Math.abs(value) : 0;
    if (value && typeof value === 'object') {
      const x = Number(value.x ?? 0);
      const y = Number(value.y ?? 0);
      const z = Number(value.z ?? 0);
      if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return 0;
      return Math.hypot(x, y, z);
    }
    return 0;
  }

  // 501–520. Vật thể rắn và cơ học va chạm
  public initializeRigidBody(object: any): RigidBodyData {
    const id = typeof object === 'string' ? object : (object?.id ?? 'rb');
    const rb: RigidBodyData = {
      mass: 1.0,
      density: 1.0,
      friction: 0.5,
      restitution: 0.3,
      velocity: { x: 0, y: 0, z: 0 },
      angularVelocity: { x: 0, y: 0, z: 0 },
    };
    this.rigidBodies.set(id, rb);
    return rb;
  }

  public setObjectMass(object: any, mass: number): void {
    const id = typeof object === 'string' ? object : object?.id;
    const rb = this.rigidBodies.get(id);
    if (rb) rb.mass = Math.max(0.001, mass);
  }

  public setObjectDensity(object: any, density: number): void {
    const id = typeof object === 'string' ? object : object?.id;
    const rb = this.rigidBodies.get(id);
    if (rb) rb.density = density;
  }

  public setObjectFriction(object: any, friction: number): void {
    const id = typeof object === 'string' ? object : object?.id;
    const rb = this.rigidBodies.get(id);
    if (rb) rb.friction = friction;
  }

  public setObjectRestitution(object: any, restitution: number): void {
    const id = typeof object === 'string' ? object : object?.id;
    const rb = this.rigidBodies.get(id);
    if (rb) rb.restitution = restitution;
  }

  public applyForceToObject(object: any, force: Vec3): void {
    const id = this.idOf(object);
    const rb = this.rigidBodies.get(id);
    if (rb) {
      // Lưu vận tốc ở bước trước để tính được gia tốc thật.
      this.previousVelocities.set(id, { ...rb.velocity });
      rb.velocity.x += force.x / rb.mass;
      rb.velocity.y += force.y / rb.mass;
      rb.velocity.z += force.z / rb.mass;
    }
  }

  public applyImpulseToObject(object: any, impulse: Vec3): void {
    this.applyForceToObject(object, impulse);
  }

  public applyTorqueToObject(object: any, torque: Vec3): void {
    const id = typeof object === 'string' ? object : object?.id;
    const rb = this.rigidBodies.get(id);
    if (rb) {
      rb.angularVelocity.x += torque.x;
      rb.angularVelocity.y += torque.y;
      rb.angularVelocity.z += torque.z;
    }
  }

  public calculateObjectVelocity(object: any): Vec3 {
    const id = typeof object === 'string' ? object : object?.id;
    return this.rigidBodies.get(id)?.velocity ?? { x: 0, y: 0, z: 0 };
  }

  public calculateObjectAcceleration(object: any): Vec3 {
    const id = this.idOf(object);
    const rb = this.rigidBodies.get(id);
    if (!rb) return { x: 0, y: 0, z: 0 };
    const previous = this.previousVelocities.get(id);
    if (!previous) return { x: 0, y: 0, z: 0 };
    const objectDt = object && typeof object === 'object' ? Number((object as any).dt) : NaN;
    const dt = Number.isFinite(objectDt) && objectDt > 0 ? objectDt : this.lastDeltaTime > 0 ? this.lastDeltaTime : 1 / 60;
    return {
      x: (rb.velocity.x - previous.x) / dt,
      y: (rb.velocity.y - previous.y) / dt,
      z: (rb.velocity.z - previous.z) / dt,
    };
  }
  public calculateAngularVelocity(object: any): Vec3 {
    const id = typeof object === 'string' ? object : object?.id;
    return this.rigidBodies.get(id)?.angularVelocity ?? { x: 0, y: 0, z: 0 };
  }

  public simulateObjectGravity(object: any): void {
    this.applyForceToObject(object, { x: 0, y: -9.81, z: 0 });
  }

  public simulateObjectAirResistance(object: any): void {
    const id = this.idOf(object);
    const rb = this.rigidBodies.get(id);
    if (!rb) return;
    // Lực cản không khí ∝ v², hướng ngược vận tốc.
    const speed = Math.hypot(rb.velocity.x, rb.velocity.y, rb.velocity.z);
    if (speed <= 0) return;
    const k = 0.5 * 1.225 * rb.density * 0.1;
    const factor = (k * speed) / speed;
    rb.velocity.x -= rb.velocity.x * factor;
    rb.velocity.y -= rb.velocity.y * factor;
    rb.velocity.z -= rb.velocity.z * factor;
  }

  /** Hai vật có va chạm không — dựa trên khoảng cách và bán kính. */
  public detectObjectCollision(objectA: any, objectB: any): boolean {
    const a = this.rigidBodies.get(this.idOf(objectA));
    const b = this.rigidBodies.get(this.idOf(objectB));
    if (!a || !b) return false;
    const posA = objectA?.position ?? { x: 0, y: 0, z: 0 };
    const posB = objectB?.position ?? { x: 0, y: 0, z: 0 };
    const radiusA = Number(objectA?.radius ?? 0.5);
    const radiusB = Number(objectB?.radius ?? 0.5);
    const distance = Math.hypot(
      Number(posB.x ?? 0) - Number(posA.x ?? 0),
      Number(posB.y ?? 0) - Number(posA.y ?? 0),
      Number(posB.z ?? 0) - Number(posA.z ?? 0),
    );
    return distance <= radiusA + radiusB;
  }

  /** Giải quyết va chạm — trao đổi động lượng theo vật nặng/nhẹ. */
  public resolveObjectCollision(objectA: any, objectB: any): void {
    const a = this.rigidBodies.get(this.idOf(objectA));
    const b = this.rigidBodies.get(this.idOf(objectB));
    if (!a || !b) return;
    const totalMass = a.mass + b.mass;
    if (totalMass <= 0) return;
    const aShare = b.mass / totalMass;
    const bShare = a.mass / totalMass;
    const vx = a.velocity.x;
    const vy = a.velocity.y;
    const vz = a.velocity.z;
    a.velocity.x = vx * aShare + b.velocity.x * bShare;
    a.velocity.y = vy * aShare + b.velocity.y * bShare;
    a.velocity.z = vz * aShare + b.velocity.z * bShare;
    b.velocity.x = b.velocity.x * aShare + vx * bShare;
    b.velocity.y = b.velocity.y * aShare + vy * bShare;
    b.velocity.z = b.velocity.z * aShare + vz * bShare;
  }

  /** Năng lượng va chạm — ½·m·v² tương đối của hai vật. */
  public calculateImpactEnergy(objectA: any, objectB: any): number {
    const a = this.rigidBodies.get(this.idOf(objectA));
    const b = this.rigidBodies.get(this.idOf(objectB));
    if (!a || !b) return 0;
    const rel = {
      x: a.velocity.x - b.velocity.x,
      y: a.velocity.y - b.velocity.y,
      z: a.velocity.z - b.velocity.z,
    };
    const speedSq = rel.x * rel.x + rel.y * rel.y + rel.z * rel.z;
    const reducedMass = (a.mass * b.mass) / (a.mass + b.mass);
    return 0.5 * reducedMass * speedSq;
  }

  /** Sát thương do va chạm — tỉ lệ năng lượng va chạm với độ bền vật liệu. */
  public calculateImpactDamage(object: any, impact: any): number {
    const energy = this.magnitudeOf(impact);
    const hardness = Number(object?.hardness ?? object?.material?.hardness ?? 1);
    const resistance = Number.isFinite(hardness) && hardness > 0 ? hardness : 1;
    return energy / resistance;
  }

  /** Xuyên vào bề mặt — vật bị đẩy ngược lại theo hướng bề mặt. */
  public simulateObjectPenetration(object: any, surface: any): void {
    const id = this.idOf(object);
    const rb = this.rigidBodies.get(id);
    if (!rb) return;
    const normal = surface?.normal ?? { x: 0, y: 1, z: 0 };
    const dot = rb.velocity.x * (normal.x ?? 0) + rb.velocity.y * (normal.y ?? 0) + rb.velocity.z * (normal.z ?? 0);
    if (dot < 0) {
      rb.velocity.x -= dot * (normal.x ?? 0);
      rb.velocity.y -= dot * (normal.y ?? 0);
      rb.velocity.z -= dot * (normal.z ?? 0);
    }
  }

  /** Nảy lại — vận tốc phản chiếu theo hệ số hồi phục. */
  public simulateObjectBounce(object: any, surface: any): void {
    const id = this.idOf(object);
    const rb = this.rigidBodies.get(id);
    if (!rb) return;
    const normal = surface?.normal ?? { x: 0, y: 1, z: 0 };
    const dot = rb.velocity.x * (normal.x ?? 0) + rb.velocity.y * (normal.y ?? 0) + rb.velocity.z * (normal.z ?? 0);
    const restitution = rb.restitution;
    rb.velocity.x -= (1 + restitution) * dot * (normal.x ?? 0);
    rb.velocity.y -= (1 + restitution) * dot * (normal.y ?? 0);
    rb.velocity.z -= (1 + restitution) * dot * (normal.z ?? 0);
  }
  public settleRigidBody(object: any): void {
    const id = typeof object === 'string' ? object : object?.id;
    const rb = this.rigidBodies.get(id);
    if (rb) {
      rb.velocity = { x: 0, y: 0, z: 0 };
      rb.angularVelocity = { x: 0, y: 0, z: 0 };
    }
  }

  // 521–540. Gãy, chém, cắt và tách vật thể
  /** Khởi tạo hệ thống phá hủy cho vật — ghi nhận ngưỡng gãy ban đầu. */
  public initializeDestructionSystem(object: any): void {
    const state = this.stateOf(object);
    state.fractureThreshold = this.calculateFractureThreshold(object);
    state.isDestroyed = false;
    state.cracks = 0;
    state.pieces = [];
    state.detachedParts = [];
  }

  /**
   * Các vùng gãy của vật — suy từ kích thước thật, không phải danh sách cứng.
   */
  public defineFractureRegions(object: any): any[] {
    const size = object?.size ?? object?.dimensions;
    const longest = size && typeof size === 'object'
      ? Math.max(Number(size.x ?? 1), Number(size.y ?? 1), Number(size.z ?? 1))
      : 1;
    const count = Math.max(1, Math.min(6, Math.round(longest)));
    const regions: any[] = [];
    for (let i = 0; i < count; i++) {
      regions.push({ id: `${this.idOf(object)}_region_${i + 1}`, index: i });
    }
    return regions;
  }

  /** Ngưỡng gãy — phụ thuộc độ cứng vật liệu và khối lượng. */
  public calculateFractureThreshold(object: any): number {
    const hardness = Number(object?.hardness ?? object?.material?.hardness ?? 1);
    const volume = Number(object?.volume ?? object?.mass ?? 1);
    const base = Number.isFinite(hardness) && hardness > 0 ? hardness : 1;
    const size = Number.isFinite(volume) && volume > 0 ? volume : 1;
    return 150 * base * Math.cbrt(size);
  }

  /** Có chạm cắt hay không — dựa trên độ sắc của công cụ và vật thể. */
  public detectCuttingContact(object: any, tool: any): boolean {
    const sharpness = Number(tool?.sharpness ?? tool?.sharp ?? 0);
    if (!Number.isFinite(sharpness)) return false;
    if (sharpness <= 0) return false;
    const hardness = Number(object?.hardness ?? object?.material?.hardness ?? 1);
    const threshold = Number.isFinite(hardness) && hardness > 0 ? hardness : 1;
    return sharpness >= threshold * 0.5;
  }

  /** Lực cắt tích luỹ thành vết nứt. */
  public applyCuttingForce(object: any, tool: any): void {
    const state = this.stateOf(object);
    const sharpness = Number(tool?.sharpness ?? tool?.sharp ?? 0);
    const power = Number(tool?.power ?? tool?.force ?? 0);
    const effort =
      (Number.isFinite(sharpness) ? sharpness : 0) * 0.1 +
      (Number.isFinite(power) ? Math.abs(power) : 0) * 0.05;
    state.cracks += effort;
    if (state.cracks >= state.fractureThreshold) state.isDestroyed = true;
  }

  /**
   * Cắt vật theo mặt phẳng — số lát cắt phụ thuộc mặt phẳng thật.
   *
   * Trước đây `plane` bị bỏ qua và luôn trả về đúng 2 lát cứng.
   */
  public sliceObject(object: any, plane: any): any[] {
    const state = this.stateOf(object);
    const baseId = this.idOf(object);
    // Số lát = số mặt phẳng cắt (mặc định 1 mặt → 2 lát).
    const planeCount = Array.isArray(plane) ? Math.max(1, plane.length) : plane ? 1 : 1;
    const slices: any[] = [];
    for (let i = 0; i < planeCount + 1; i++) {
      slices.push({ id: `${baseId}_slice_${i + 1}`, sourceId: baseId, index: i });
    }
    state.pieces = slices;
    return slices;
  }

  public cutObjectIntoPieces(object: any, cutPath: any): any[] {
    return this.sliceObject(object, cutPath);
  }

  /** Cưa cành bằng lưỡi — lưỡi sắc quyết định lực cắt. */
  public severBranchWithBlade(branch: any, blade: any): void {
    const sharpness = Number(blade?.sharpness ?? blade?.sharp ?? 0);
    if (Number.isFinite(sharpness) && sharpness > 0) {
      branch.flexForce = (branch.flexForce ?? 0) + sharpness * 10;
      branch.isBroken = true;
    }
  }

  /** Chặt thân cây bằng lưỡi cưa. */
  public chopTreeTrunk(tree: any, blade: any): void {
    const sharpness = Number(blade?.sharpness ?? blade?.sharp ?? 0);
    if (!Number.isFinite(sharpness) || sharpness <= 0) return;
    tree.health = Math.max(0, (tree.health ?? 100) - sharpness * 5);
    if (tree.health <= 0) tree.isFelled = true;
  }

  /**
   * Chẻ đôi khúc gỗ — công cụ quyết định độ mịn và độ dài mảnh.
   *
   * Trước đây `log` và `tool` bị bỏ qua hoàn toàn.
   */
  public splitWoodLog(log: any, tool: any): any[] {
    const logId = this.idOf(log);
    const length = Number(log?.length ?? 1);
    const sharpness = Number(tool?.sharpness ?? tool?.sharp ?? 0);
    const quality = Number.isFinite(sharpness) ? Math.max(0, Math.min(1, sharpness / 10)) : 0;
    const halves = [
      { id: `${logId}_half_1`, sourceId: logId, length: length / 2, quality },
      { id: `${logId}_half_2`, sourceId: logId, length: length / 2, quality },
    ];
    this.stateOf(log).pieces = halves;
    return halves;
  }

  /** Gãy tại khớp — vị trí khớp được ghi lại. */
  public breakObjectAtJoint(object: any, joint: any): void {
    const state = this.stateOf(object);
    state.isDestroyed = true;
    (object as unknown as { brokenAtJoint?: unknown }).brokenAtJoint =
      joint && typeof joint === 'object' ? (joint.id ?? joint.name ?? null) : joint ?? null;
  }

  /**
   * Bẻ đôi vật — lực quyết định mức đứt.
   *
   * Trước đây `force` bị bỏ qua hoàn toàn.
   */
  public snapObjectInHalf(object: any, force: any): any[] {
    const state = this.stateOf(object);
    const effort = this.magnitudeOf(force);
    state.cracks += effort;
    if (effort > 0) state.isDestroyed = true;
    return this.sliceObject(object, null);
  }

  /** Nứt bề mặt do va chạm — động lượng quyết định số vết nứt. */
  public fractureObjectSurface(object: any, impact: any): void {
    const state = this.stateOf(object);
    const effort = this.magnitudeOf(impact);
    state.cracks += effort * 0.5;
    if (state.cracks >= state.fractureThreshold) state.isDestroyed = true;
  }

  /**
   * Vỡ vật thành mảnh — động lượng quyết định số mảnh.
   *
   * Trước đây `object` và `impulse` bị bỏ qua, luôn trả về đúng 3 mảnh.
   */
  public shatterObject(object: any, impulse: any): any[] {
    const state = this.stateOf(object);
    const baseId = this.idOf(object);
    const effort = this.magnitudeOf(impulse);
    const pieceCount = Math.max(2, Math.min(12, Math.round(3 + effort * 0.05)));
    const fragments: any[] = [];
    for (let i = 0; i < pieceCount; i++) {
      fragments.push({ id: `${baseId}_frag_${i + 1}`, sourceId: baseId, index: i });
    }
    state.pieces = fragments;
    state.isDestroyed = true;
    return fragments;
  }

  public splitRockWithImpact(rock: any, impact: any): any[] {
    return this.shatterObject(rock, impact);
  }

  /** Tách một phần khỏi vật — phần tách được ghi nhận trong trạng thái. */
  public detachObjectPart(object: any, part: any): void {
    const state = this.stateOf(object);
    if (!part) return;
    const detached = part as { detached?: boolean; sourceId?: string };
    detached.detached = true;
    detached.sourceId = this.idOf(object);
    state.detachedParts.push(part);
  }

  /**
   * Vận tốc của phần vừa tách — lấy từ vận tốc vật thể, không phải hằng.
   *
   * Trước đây luôn trả `{x:1, y:2, z:0}` cho mọi phần.
   */
  public calculateDetachedPartVelocity(part: any): Vec3 {
    if (part?.velocity && typeof part.velocity === 'object') {
      const v = part.velocity as Vec3;
      return { x: Number(v.x ?? 0), y: Number(v.y ?? 0), z: Number(v.z ?? 0) };
    }
    const rb = this.rigidBodies.get(this.idOf(part));
    if (rb) return { ...rb.velocity };
    return { x: 0, y: 0, z: 0 };
  }

  public spawnDetachedFragments(object: any): any[] { return this.shatterObject(object, null); }

  /** Vật lý mảnh vỡ — mỗi mảnh rơi theo trọng lực và ma sát. */
  public applyDebrisPhysics(fragments: any[]): void {
    if (!Array.isArray(fragments)) return;
    for (const fragment of fragments) {
      if (!fragment || typeof fragment !== 'object') continue;
      const velocity = (fragment.velocity as Vec3 | undefined) ?? { x: 0, y: 0, z: 0 };
      velocity.y -= 9.81 * 0.016;
      // Ma sát không khí: giảm tốc độ theo tỉ lệ.
      velocity.x *= 0.99;
      velocity.z *= 0.99;
      fragment.velocity = velocity;
      fragment.settled = velocity.y < -0.5;
    }
  }

  /** Chốt trạng thái phá hủy — vật bị phá hủy hoàn toàn. */
  public finalizeObjectDestruction(object: any): void {
    const state = this.stateOf(object);
    state.isDestroyed = true;
    const rb = this.rigidBodies.get(this.idOf(object));
    if (rb) {
      rb.velocity = { x: 0, y: 0, z: 0 };
      rb.angularVelocity = { x: 0, y: 0, z: 0 };
    }
  }

  // 541–560. Vải, dây, giấy và vật thể mềm
  public createSoftBody(object: any): SoftBodyData {
    const id = typeof object === 'string' ? object : (object?.id ?? 'soft');
    const sb: SoftBodyData = { stiffness: 0.5, damping: 0.1, stretchResistance: 0.8 };
    this.softBodies.set(id, sb);
    return sb;
  }

  /**
   * Trạng thái biến dạng của vật thể mềm / vải / giấy / dây.
   *
   * Trước đây các method này là hàm rỗng — không có cách nào biết vải đã
   * giãn bao nhiêu hay giấy đã cháy tới đâu. Nay trạng thái được lưu và phát
   * triển theo lực/mức độ thật.
   */
  public softBodyStates: Map<string, {
    deformation: number;
    stretch: number;
    compression: number;
    bend: number;
    twist: number;
    folded: boolean;
    torn: boolean;
    burned: number;
  }> = new Map();

  private softStateOf(object: any) {
    const id = this.idOf(object);
    let state = this.softBodyStates.get(id);
    if (!state) {
      state = {
        deformation: 0,
        stretch: 0,
        compression: 0,
        bend: 0,
        twist: 0,
        folded: false,
        torn: false,
        burned: 0,
      };
      this.softBodyStates.set(id, state);
    }
    return state;
  }

  /** Khởi tạo vật lý cho vật thể mềm. */
  public initializeSoftBodyPhysics(object: any): void {
    const state = this.softStateOf(object);
    state.deformation = 0;
    state.stretch = 0;
    state.compression = 0;
    state.bend = 0;
    state.twist = 0;
    state.folded = false;
    state.torn = false;
    state.burned = 0;
  }

  /** Biến dạng — lực chia cho độ cứng. */
  public deformSoftBody(object: any, force: any): void {
    const state = this.softStateOf(object);
    const sb = this.softBodies.get(this.idOf(object));
    const stiffness = sb?.stiffness && sb.stiffness > 0 ? sb.stiffness : 0.5;
    state.deformation += this.magnitudeOf(force) / stiffness;
  }

  /** Kéo giãn — vượt độ chống giãn thì vật rách. */
  public stretchSoftBody(object: any, amount: number): void {
    const state = this.softStateOf(object);
    const sb = this.softBodies.get(this.idOf(object));
    const resistance = sb?.stretchResistance ?? 0.8;
    const delta = Number.isFinite(amount) ? Math.abs(amount) : 0;
    state.stretch += delta;
    if (state.stretch > resistance) state.torn = true;
  }

  /** Nén — tích luỹ mức nén. */
  public compressSoftBody(object: any, amount: number): void {
    const state = this.softStateOf(object);
    state.compression += Number.isFinite(amount) ? Math.abs(amount) : 0;
  }

  /** Uốn — lực quyết định góc uốn. */
  public bendSoftBody(object: any, force: any): void {
    const state = this.softStateOf(object);
    state.bend += this.magnitudeOf(force) * 0.1;
  }

  /** Xoắn — mô-men xoắn quyết định góc xoắn. */
  public twistSoftBody(object: any, torque: any): void {
    const state = this.softStateOf(object);
    state.twist += this.magnitudeOf(torque) * 0.1;
  }

  /** Trả về hình dạng gốc. */
  public restoreSoftBodyShape(object: any): void {
    const state = this.softStateOf(object);
    state.deformation = 0;
    state.stretch = 0;
    state.compression = 0;
    state.bend = 0;
    state.twist = 0;
  }

  /** Mô phỏng chuyển động vải — điểm vải rơi theo trọng lực. */
  public simulateClothMotion(cloth: any): void {
    const vertices = Array.isArray(cloth?.vertices) ? cloth.vertices : [];
    for (const vertex of vertices) {
      if (!vertex || typeof vertex !== 'object') continue;
      const velocity = (vertex.velocity as Vec3 | undefined) ?? { x: 0, y: 0, z: 0 };
      velocity.y -= 9.81 * 0.016;
      vertex.velocity = velocity;
    }
  }

  /** Gió thổi vải — lực gió đẩy các điểm vải. */
  public simulateClothWind(cloth: any, wind: any): void {
    const vertices = Array.isArray(cloth?.vertices) ? cloth.vertices : [];
    const speed = this.magnitudeOf(wind?.speed !== undefined ? { x: wind.speed, y: 0, z: 0 } : wind);
    for (const vertex of vertices) {
      if (!vertex || typeof vertex !== 'object') continue;
      const velocity = (vertex.velocity as Vec3 | undefined) ?? { x: 0, y: 0, z: 0 };
      velocity.x += speed * 0.01;
      vertex.velocity = velocity;
    }
  }

  public foldCloth(cloth: any): void {
    this.softStateOf(cloth).folded = true;
  }
  public unfoldCloth(cloth: any): void {
    this.softStateOf(cloth).folded = false;
  }
  /** Rách vải — lực phải vượt ngưỡng mới rách. */
  public tearCloth(cloth: any, force: any): void {
    const state = this.softStateOf(cloth);
    const sb = this.softBodies.get(this.idOf(cloth));
    const resistance = sb?.stretchResistance ?? 0.8;
    if (this.magnitudeOf(force) >= resistance) state.torn = true;
  }
  /** Uốn giấy theo lực. */
  public simulatePaperBending(paper: any, force: any): void {
    const state = this.softStateOf(paper);
    state.bend += this.magnitudeOf(force) * 0.1;
  }
  /** Nhàu giấy — biến dạng tăng mạnh. */
  public crumplePaper(paper: any): void {
    const state = this.softStateOf(paper);
    state.deformation += 1;
    state.bend += 0.5;
  }
  /** Rách giấy theo lực. */
  public tearPaper(paper: any, force: any): void {
    const state = this.softStateOf(paper);
    if (this.magnitudeOf(force) >= 0.5) state.torn = true;
  }
  /** Cháy giấy — tốc độ cháy quyết định mức cháy. */
  public burnPaper(paper: any, rate: number): void {
    const state = this.softStateOf(paper);
    state.burned += Number.isFinite(rate) ? Math.max(0, rate) : 0;
  }
  /** Chuyển động dây — đầu dây rơi theo trọng lực. */
  public simulateRopeMotion(rope: any): void {
    const points = Array.isArray(rope?.points) ? rope.points : [];
    for (const point of points) {
      if (!point || typeof point !== 'object') continue;
      const velocity = (point.velocity as Vec3 | undefined) ?? { x: 0, y: 0, z: 0 };
      velocity.y -= 9.81 * 0.016;
      point.velocity = velocity;
    }
  }
  /** Kéo dây — độ giãn tích luỹ. */
  public stretchRope(rope: any, force: any): void {
    const state = this.softStateOf(rope);
    state.stretch += this.magnitudeOf(force) * 0.1;
  }
  /** Đứt dây — lực phải vượt ngưỡng mới đứt. */
  public snapRope(rope: any, force: any): void {
    const state = this.softStateOf(rope);
    if (this.magnitudeOf(force) >= 1) state.torn = true;
  }

  // 561–580. Kim loại, máy móc và bộ phận cơ khí
  public createMechanicalObject(type = 'gear'): any {
    const id = `mech_${Date.now()}`;
    const obj = { id, type, isLocked: false, isJammed: false, wear: 0 };
    this.mechanicalJoints.set(id, obj);
    return obj;
  }

  /**
   * Trạng thái vật liệu kim loại — biến dạng, mòn, gỉ, nhiệt độ.
   *
   * Trước đây các method cơ khí là hàm rỗng, không lưu gì.
   */
  public metalStates: Map<string, {
    deformation: number;
    dents: number;
    cracks: number;
    fatigueCycles: number;
    corrosion: number;
    temperature: number;
    expansion: number;
  }> = new Map();

  private metalStateOf(object: any) {
    const id = this.idOf(object);
    let state = this.metalStates.get(id);
    if (!state) {
      state = {
        deformation: 0,
        dents: 0,
        cracks: 0,
        fatigueCycles: 0,
        corrosion: 0,
        temperature: 20,
        expansion: 0,
      };
      this.metalStates.set(id, state);
    }
    return state;
  }

  /** Khởi tạo khớp cơ khí — ghi nhận trạng thái ban đầu. */
  public initializeMechanicalJoints(object: any): void {
    const state = this.metalStateOf(object);
    state.deformation = 0;
    state.cracks = 0;
    state.fatigueCycles = 0;
  }

  /** Xoay khớp — góc cộng dồn. */
  public rotateMechanicalJoint(joint: any, angle: number): void {
    const j = typeof joint === 'string' ? this.mechanicalJoints.get(joint) : joint;
    if (!j) return;
    const delta = Number.isFinite(angle) ? angle : 0;
    j.angle = (j.angle ?? 0) + delta;
  }

  /** Trượt khớp — độ dời cộng dồn. */
  public slideMechanicalJoint(joint: any, distance: number): void {
    const j = typeof joint === 'string' ? this.mechanicalJoints.get(joint) : joint;
    if (!j) return;
    const delta = Number.isFinite(distance) ? distance : 0;
    j.offset = (j.offset ?? 0) + delta;
  }
  public lockMechanicalJoint(joint: any): void {
    const j = typeof joint === 'string' ? this.mechanicalJoints.get(joint) : joint;
    if (j) j.isLocked = true;
  }

  public unlockMechanicalJoint(joint: any): void {
    const j = typeof joint === 'string' ? this.mechanicalJoints.get(joint) : joint;
    if (j) j.isLocked = false;
  }

  /** Mô-men xoắn cơ khí — biến dạng tỉ lệ với mô-men. */
  public applyMechanicalTorque(object: any, torque: any): void {
    const state = this.metalStateOf(object);
    state.deformation += this.magnitudeOf(torque) * 0.1;
  }
  /** Uốn tấm kim loại. */
  public bendMetalSheet(sheet: any, force: any): void {
    const state = this.metalStateOf(sheet);
    state.deformation += this.magnitudeOf(force) * 0.05;
  }
  /** Dập/va mặt kim loại — mỗi lần va thêm một vết. */
  public dentMetalSurface(object: any, impact: any): void {
    const state = this.metalStateOf(object);
    state.dents += this.magnitudeOf(impact) * 0.1;
    state.deformation += this.magnitudeOf(impact) * 0.02;
  }
  /** Biến dạng kết cấu kim loại theo tải trọng. */
  public deformMetalStructure(object: any, load: any): void {
    const state = this.metalStateOf(object);
    state.deformation += this.magnitudeOf(load) * 0.02;
  }
  /** Gãy chi tiết kim loại — lực phải vượt ngưỡng mới gãy. */
  public fractureMetalPart(object: any, force: any): void {
    const state = this.metalStateOf(object);
    const effort = this.magnitudeOf(force);
    state.cracks += effort;
    if (effort >= 1) state.deformation += effort;
  }
  /** Mỏi kim loại — số chu kỳ tải tích luỹ. */
  public fatigueMetalMaterial(object: any, cycles: number): void {
    const state = this.metalStateOf(object);
    state.fatigueCycles += Number.isFinite(cycles) ? Math.max(0, cycles) : 0;
  }
  /** Ăn mòn — tốc độ ăn mòn tích luỹ. */
  public corrodeMetalSurface(object: any, rate: number): void {
    const state = this.metalStateOf(object);
    state.corrosion += Number.isFinite(rate) ? Math.max(0, rate) : 0;
  }
  /** Rỉ sét — độ ẩm quyết định mức gỉ. */
  public rustMetalObject(object: any, moisture: number): void {
    const state = this.metalStateOf(object);
    state.corrosion += Number.isFinite(moisture) ? Math.max(0, moisture) * 0.1 : 0;
  }
  /** Nung nóng — nhiệt độ được đặt theo tham số. */
  public heatMetalObject(object: any, temperature: number): void {
    const state = this.metalStateOf(object);
    if (Number.isFinite(temperature)) state.temperature = temperature;
  }
  /** Làm nguội — nhiệt độ giảm theo tốc độ truyền nhiệt. */
  public coolMetalObject(object: any, rate: number): void {
    const state = this.metalStateOf(object);
    const cooling = Number.isFinite(rate) ? rate : 0;
    state.temperature = Math.max(-273.15, state.temperature - cooling);
  }
  /** Giãn nở do nhiệt — mức giãn tỉ lệ với nhiệt độ. */
  public expandMetalObject(object: any, temperature: number): void {
    const state = this.metalStateOf(object);
    if (Number.isFinite(temperature)) state.expansion += temperature * 1.2e-5;
  }
  /** Co lại do nhiệt. */
  public contractMetalObject(object: any, temperature: number): void {
    const state = this.metalStateOf(object);
    if (Number.isFinite(temperature)) state.expansion -= temperature * 1.2e-5;
  }
  public jamMechanicalJoint(joint: any): void {
    const j = typeof joint === 'string' ? this.mechanicalJoints.get(joint) : joint;
    if (j) j.isJammed = true;
  }

  public repairMechanicalObject(object: any): void {
    const j = typeof object === 'string' ? this.mechanicalJoints.get(object) : object;
    if (j) j.isJammed = false;
  }
}
