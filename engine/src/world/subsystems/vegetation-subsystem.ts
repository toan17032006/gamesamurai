/**
 * @file vegetation-subsystem.ts
 * @module @aetheria/engine/world/subsystems/vegetation-subsystem
 * @description Trees, Branches, Leaves, Roots, Flowers, Fruits, Decay & Flora (041–220).
 */

import {
  TreeEntity,
  BranchEntity,
  LeafEntity,
  RootEntity,
  FlowerEntity,
  FruitEntity,
  SeedEntity,
} from '../types.js';
import type { Vec3 } from '../../types/index.js';

// ---------------------------------------------------------------------------
// Trợ giúp đo lực / gió — dùng để các method thực sự phản ánh tham số
// ---------------------------------------------------------------------------

/**
 * Độ lớn của một lực (số hoặc vector 3D).
 *
 * Trước đây các method nhận `force` bỏ qua hoàn toàn và dùng hằng số
 * (`+0.1`, `+0.2`) — tức là "return có sẵn". Nay lực thật quyết định kết quả.
 */
export function forceMagnitude(force: any): number {
  if (typeof force === 'number') return Number.isFinite(force) ? Math.abs(force) : 0;
  if (force && typeof force === 'object') {
    const x = Number(force.x ?? 0);
    const y = Number(force.y ?? 0);
    const z = Number(force.z ?? 0);
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return 0;
    return Math.hypot(x, y, z);
  }
  return 0;
}

/** Tốc độ gió (m/s) từ `{ speed }` hoặc vector hướng gió. */
export function windSpeedOf(wind: any): number {
  if (typeof wind === 'number') return Number.isFinite(wind) ? Math.abs(wind) : 0;
  if (!wind || typeof wind !== 'object') return 0;
  if (typeof wind.speed === 'number') return Number.isFinite(wind.speed) ? Math.abs(wind.speed) : 0;
  const x = Number(wind.x ?? 0);
  const y = Number(wind.y ?? 0);
  const z = Number(wind.z ?? 0);
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return 0;
  return Math.hypot(x, y, z);
}

/** Diện tích chắn gió của một vật (m²) — suy từ kích thước nếu có. */
export function windAreaOf(object: any): number {
  if (!object || typeof object !== 'object') return 1;
  const size = object.size ?? object.dimensions;
  if (size && typeof size === 'object') {
    const sx = Math.abs(Number(size.x ?? 1));
    const sy = Math.abs(Number(size.y ?? 1));
    const sz = Math.abs(Number(size.z ?? 1));
    if (Number.isFinite(sx) && Number.isFinite(sy) && Number.isFinite(sz)) {
      return Math.max(1e-6, sx * sy * sz);
    }
  }
  if (typeof object.area === 'number' && Number.isFinite(object.area)) {
    return Math.max(1e-6, object.area);
  }
  if (typeof object.radius === 'number' && Number.isFinite(object.radius)) {
    return Math.max(1e-6, Math.PI * object.radius * object.radius);
  }
  return 1;
}

/** Cánh tay lực (m) — nửa chiều cao vật, dùng cho mô-men xoắn. */
function leverArmOf(object: any): number {
  if (!object || typeof object !== 'object') return 0.5;
  const size = object.size ?? object.dimensions;
  if (size && typeof size === 'object') {
    const sy = Math.abs(Number(size.y ?? 1));
    if (Number.isFinite(sy)) return Math.max(1e-6, sy / 2);
  }
  if (typeof object.radius === 'number' && Number.isFinite(object.radius)) {
    return Math.max(1e-6, object.radius);
  }
  return 0.5;
}

/** Khối lượng riêng không khí (kg/m³) — dùng cho công thức áp suất gió. */
const AIR_DENSITY = 1.225;
/** Hệ số cản gió cho vật cầu. */
const DRAG_COEFFICIENT = 1.2;

export class VegetationSubsystem {
  public trees: Map<string, TreeEntity> = new Map();
  public branches: Map<string, BranchEntity> = new Map();
  public leaves: Map<string, LeafEntity> = new Map();
  public roots: Map<string, RootEntity> = new Map();
  public flowers: Map<string, FlowerEntity> = new Map();
  public fruits: Map<string, FruitEntity> = new Map();
  public seeds: Map<string, SeedEntity> = new Map();
  public grassPatches: Map<string, any> = new Map();
  public shrubs: Map<string, any> = new Map();
  public vines: Map<string, any> = new Map();

  // -------------------------------------------------------------------------
  // Helper đọc dữ liệu thật — thay cho giá trị đóng cứng
  // -------------------------------------------------------------------------

  /** Kích thước đặc trưng (bán kính / cạnh lớn nhất) của đối tượng. */
  private extentOf(source: any, fallback = 1): number {
    const size = source?.size ?? source?.radius ?? source?.scale ?? source?.bounds;
    if (typeof size === 'number' && Number.isFinite(size) && size > 0) return size;
    if (size && typeof size === 'object') {
      const values = [size.x, size.y, size.z, size.max, size.width, size.height]
        .map((v) => Number(v))
        .filter((v) => Number.isFinite(v) && v > 0)
        .sort((a, b) => b - a);
      if (values.length > 0) return values[0];
    }
    const radius = Number(source?.canopyRadius ?? NaN);
    if (Number.isFinite(radius) && radius > 0) return radius;
    return fallback;
  }

  /** Đọc số từ nhiều khoá, có giá trị thay thế khi dữ liệu thiếu. */
  private numOf(source: any, keys: string[], fallback: number): number {
    if (source && typeof source === 'object') {
      for (const key of keys) {
        const value = (source as Record<string, unknown>)[key];
        if (typeof value === 'number' && Number.isFinite(value)) return value;
      }
    }
    return fallback;
  }

  /** Vị trí thế giới của đối tượng. */
  private positionOf(source: any): Vec3 {
    const p = source?.position;
    if (p && typeof p === 'object') {
      const x = Number(p.x ?? 0);
      const y = Number(p.y ?? 0);
      const z = Number(p.z ?? 0);
      if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)) return { x, y, z };
    }
    return { x: 0, y: 0, z: 0 };
  }

  // 041–060. Cây và cấu trúc thực vật
  public createTree(species = 'Oak'): TreeEntity {
    const id = `tree_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const tree: TreeEntity = {
      id,
      species,
      age: 1.0,
      height: 4.0,
      thickness: 0.3,
      health: 100,
      canopyRadius: 2.5,
      branches: [],
      roots: [],
      position: { x: 0, y: 0, z: 0 },
    };
    this.trees.set(id, tree);
    return tree;
  }

  public initializeTree(tree: TreeEntity | string): boolean {
    const t = typeof tree === 'string' ? this.trees.get(tree) : tree;
    if (t) {
      this.generateTreeBranches(t);
      this.createRootSystem(t);
      return true;
    }
    return false;
  }

  public updateTree(tree: TreeEntity | string, deltaTime: number): void {
    const t = typeof tree === 'string' ? this.trees.get(tree) : tree;
    if (t) {
      t.age += deltaTime * 0.001;
      this.growTree(t, deltaTime * 0.005);
    }
  }

  public growTree(tree: TreeEntity | string, amount: number): void {
    const t = typeof tree === 'string' ? this.trees.get(tree) : tree;
    if (t) {
      t.height += amount;
      t.thickness += amount * 0.05;
      t.canopyRadius += amount * 0.2;
    }
  }

  public setTreeAge(tree: TreeEntity | string, age: number): void {
    const t = typeof tree === 'string' ? this.trees.get(tree) : tree;
    if (t) t.age = age;
  }

  public updateTreeHeight(tree: TreeEntity | string): void {}
  public updateTreeThickness(tree: TreeEntity | string): void {}
  public updateTreeCanopy(tree: TreeEntity | string): void {}
  public updateTreeRootSystem(tree: TreeEntity | string): void {}
  public updateTreeTrunk(tree: TreeEntity | string): void {}
  public updateTreeBark(tree: TreeEntity | string): void {}
  public updateTreeBranchStructure(tree: TreeEntity | string): void {}

  public generateTreeBranches(tree: TreeEntity | string): void {
    const t = typeof tree === 'string' ? this.trees.get(tree) : tree;
    if (t && t.branches.length === 0) {
      for (let i = 0; i < 4; i++) {
        const b = this.createBranch(t);
        t.branches.push(b.id);
      }
    }
  }

  public extendTreeBranch(branch: BranchEntity | string): void {
    const b = typeof branch === 'string' ? this.branches.get(branch) : branch;
    if (b) b.length += 0.2;
  }

  public shortenTreeBranch(branch: BranchEntity | string): void {
    const b = typeof branch === 'string' ? this.branches.get(branch) : branch;
    if (b) b.length = Math.max(0.1, b.length - 0.2);
  }

  /**
   * Uốn cành theo lực tác dụng.
   *
   * Trước đây `force` bị bỏ qua và `flexForce` luôn tăng đúng `0.1` — cành
   * uốn như nhau dù lực nhỏ hay lớn. Nay độ uốn tỉ lệ với lực thật.
   */
  public bendTreeBranch(branch: BranchEntity | string, force: any): void {
    const b = typeof branch === 'string' ? this.branches.get(branch) : branch;
    if (b) b.flexForce += forceMagnitude(force) * 0.1;
  }

  /** Xoắn cành — `torque` điều khiển góc xoay của cành. */
  public twistTreeBranch(branch: BranchEntity | string, torque: any): void {
    const b = typeof branch === 'string' ? this.branches.get(branch) : branch;
    if (!b) return;
    const magnitude = forceMagnitude(torque);
    b.angle += Number.isFinite(Number(torque)) ? Number(torque) : magnitude * 0.1;
  }
  public repairTreeDamage(tree: TreeEntity | string): void {
    const t = typeof tree === 'string' ? this.trees.get(tree) : tree;
    if (t) t.health = Math.min(100, t.health + 20);
  }

  public removeTree(tree: TreeEntity | string): void {
    const id = typeof tree === 'string' ? tree : tree.id;
    this.trees.delete(id);
  }

  public regenerateTreeGeometry(tree: TreeEntity | string): void {}

  // 061–080. Cành cây, nhánh nhỏ và gỗ
  public createBranch(tree: TreeEntity | string, parentBranch?: BranchEntity | string): BranchEntity {
    const treeId = typeof tree === 'string' ? tree : tree.id;
    const parentBranchId = parentBranch ? (typeof parentBranch === 'string' ? parentBranch : parentBranch.id) : undefined;
    const id = `branch_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const b: BranchEntity = {
      id,
      treeId,
      parentBranchId,
      length: 1.5,
      thickness: 0.08,
      angle: 0.6,
      flexForce: 0,
      isBroken: false,
    };
    this.branches.set(id, b);
    return b;
  }

  public splitBranch(branch: BranchEntity | string): BranchEntity {
    const b = typeof branch === 'string' ? this.branches.get(branch) : branch;
    return this.createBranch(b ? b.treeId : 'unknown_tree', b);
  }

  public growBranch(branch: BranchEntity | string, amount: number): void {
    const b = typeof branch === 'string' ? this.branches.get(branch) : branch;
    if (b) b.length += amount;
  }

  public thickenBranch(branch: BranchEntity | string, amount: number): void {
    const b = typeof branch === 'string' ? this.branches.get(branch) : branch;
    if (b) b.thickness += amount;
  }

  /**
   * Uốn nhánh theo lực thật.
   *
   * Trước đây `force` bị bỏ qua và `flexForce` luôn tăng đúng `0.2`.
   */
  public bendBranch(branch: BranchEntity | string, force: any): void {
    const b = typeof branch === 'string' ? this.branches.get(branch) : branch;
    if (b) b.flexForce += forceMagnitude(force) * 0.2;
  }

  public straightenBranch(branch: BranchEntity | string): void {
    const b = typeof branch === 'string' ? this.branches.get(branch) : branch;
    if (b) b.flexForce = 0;
  }

  public rotateBranch(branch: BranchEntity | string, angle: number): void {
    const b = typeof branch === 'string' ? this.branches.get(branch) : branch;
    if (b) b.angle = angle;
  }

  /** Xoắn nhánh — góc cộng dồn theo `angle`. */
  public twistBranch(branch: BranchEntity | string, angle: number): void {
    const b = typeof branch === 'string' ? this.branches.get(branch) : branch;
    if (!b) return;
    const delta = Number.isFinite(angle) ? angle : 0;
    b.angle += delta;
    b.flexForce += Math.abs(delta) * 0.5;
  }

  /** Rung nhánh — cường độ rung quyết định lực uốn. */
  public shakeBranch(branch: BranchEntity | string, intensity: number): void {
    const b = typeof branch === 'string' ? this.branches.get(branch) : branch;
    if (!b) return;
    const amount = Number.isFinite(intensity) ? Math.abs(intensity) : 0;
    b.flexForce += amount * 0.05;
  }

  /** Gán tải lên nhánh — `force` tích luỹ vào ứng lực. */
  public applyBranchLoad(branch: BranchEntity | string, force: any): void {
    const b = typeof branch === 'string' ? this.branches.get(branch) : branch;
    if (!b) return;
    b.flexForce += forceMagnitude(force) * 0.1;
  }
  public detectBranchStress(branch: BranchEntity | string): number {
    const b = typeof branch === 'string' ? this.branches.get(branch) : branch;
    if (!b) return 0;
    return this.numOf(b, ['flexForce'], 0) * 50;
  }

  public detectBranchFracture(branch: BranchEntity | string): boolean {
    return this.detectBranchStress(branch) > 80;
  }

  /**
   * Gãy nhánh.
   *
   * Lực (nếu có) được cộng vào ứng lực trước khi gãy — trước đây `force`
   * bị bỏ qua hoàn toàn nên mọi lần gọi cho kết quả giống hệt nhau.
   */
  public breakBranch(branch: BranchEntity | string, force?: any): void {
    const b = typeof branch === 'string' ? this.branches.get(branch) : branch;
    if (!b) return;
    b.flexForce += forceMagnitude(force);
    b.isBroken = true;
  }

  /**
   * Gãy tại khớp — vị trí khớp được ghi lại để biết nhánh gãy ở đâu.
   *
   * Trước đây `joint` bị bỏ qua hoàn toàn.
   */
  public snapBranchAtJoint(branch: BranchEntity | string, joint: any): void {
    const b = typeof branch === 'string' ? this.branches.get(branch) : branch;
    if (!b) return;
    // Khớp là điểm yếu: ứng lực dồn tại đó và nhánh gãy đúng chỗ.
    b.flexForce = Math.max(b.flexForce, 80);
    b.isBroken = true;
    const jointId =
      joint && typeof joint === 'object' ? (joint.id ?? joint.name ?? joint.boneId ?? null) : joint ?? null;
    (b as unknown as { brokenAtJoint?: unknown }).brokenAtJoint = jointId;
  }

  public detachBranch(branch: BranchEntity | string): void {
    this.breakBranch(branch);
  }

  public fallBranch(branch: BranchEntity | string, gravity?: any): void {}
  public splitWoodGrain(branch: BranchEntity | string): void {}
  public crackWoodSurface(branch: BranchEntity | string): void {}
  public decayWood(branch: BranchEntity | string, rate: number): void {}
  public regenerateBranchMesh(branch: BranchEntity | string): void {}

  // 081–100. Lá cây và chuyển động từng chiếc lá
  public createLeaf(plant: any): LeafEntity {
    const plantId = typeof plant === 'string' ? plant : (plant?.id ?? 'plant');
    const id = `leaf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const leaf: LeafEntity = {
      id,
      plantId,
      size: 0.1,
      color: '#22c55e',
      flutter: 0,
      isAttached: true,
      position: { x: 0, y: 0, z: 0 },
    };
    this.leaves.set(id, leaf);
    return leaf;
  }

  public initializeLeaf(leaf: LeafEntity | string): void {}
  public updateLeaf(leaf: LeafEntity | string, deltaTime: number): void {}
  public growLeaf(leaf: LeafEntity | string, amount: number): void {
    const l = typeof leaf === 'string' ? this.leaves.get(leaf) : leaf;
    if (l) l.size += amount;
  }

  public shrinkLeaf(leaf: LeafEntity | string, amount: number): void {
    const l = typeof leaf === 'string' ? this.leaves.get(leaf) : leaf;
    if (l) l.size = Math.max(0.01, l.size - amount);
  }

  public unfoldLeaf(leaf: LeafEntity | string): void {
    const l = typeof leaf === 'string' ? this.leaves.get(leaf) : leaf;
    if (!l) return;
    l.curl = 0;
    l.folded = false;
  }
  public foldLeaf(leaf: LeafEntity | string): void {
    const l = typeof leaf === 'string' ? this.leaves.get(leaf) : leaf;
    if (!l) return;
    l.curl = 1;
    l.folded = true;
  }
  public curlLeaf(leaf: LeafEntity | string, amount: number): void {
    const l = typeof leaf === 'string' ? this.leaves.get(leaf) : leaf;
    if (!l) return;
    const delta = Number.isFinite(amount) ? amount : 0;
    l.curl = Math.max(0, Math.min(1, (l.curl ?? 0) + delta));
    l.folded = l.curl > 0.5;
  }
  public uncurlLeaf(leaf: LeafEntity | string): void {
    const l = typeof leaf === 'string' ? this.leaves.get(leaf) : leaf;
    if (!l) return;
    l.curl = 0;
    l.folded = false;
  }
  public bendLeaf(leaf: LeafEntity | string, force: any): void {
    const l = typeof leaf === 'string' ? this.leaves.get(leaf) : leaf;
    if (!l) return;
    l.bend = (l.bend ?? 0) + forceMagnitude(force) * 0.05;
  }
  public twistLeaf(leaf: LeafEntity | string, angle: number): void {
    const l = typeof leaf === 'string' ? this.leaves.get(leaf) : leaf;
    if (!l) return;
    l.twist = (l.twist ?? 0) + (Number.isFinite(angle) ? angle : 0);
  }

  /**
   * Rung lá theo gió.
   *
   * Trước đây `wind` bị bỏ qua và `flutter` LUÔN bằng `1.0` — mọi gió, mọi lá
   * đều rung giống nhau. Nay độ rung tỉ lệ với tốc độ gió thật.
   */
  public flutterLeaf(leaf: LeafEntity | string, wind: any): void {
    const l = typeof leaf === 'string' ? this.leaves.get(leaf) : leaf;
    if (!l) return;
    l.flutter = Math.max(0, Math.min(1, windSpeedOf(wind) / 10));
  }

  public shakeLeaf(leaf: LeafEntity | string, intensity: number): void {
    const l = typeof leaf === 'string' ? this.leaves.get(leaf) : leaf;
    if (!l) return;
    const amount = Number.isFinite(intensity) ? Math.abs(intensity) : 0;
    l.bend = (l.bend ?? 0) + amount * 0.02;
  }
  public droopLeaf(leaf: LeafEntity | string, amount: number): void {
    const l = typeof leaf === 'string' ? this.leaves.get(leaf) : leaf;
    if (!l) return;
    const delta = Number.isFinite(amount) ? amount : 0;
    l.droop = Math.max(0, Math.min(1, (l.droop ?? 0) + delta));
  }
  public restoreLeafPose(leaf: LeafEntity | string): void {
    const l = typeof leaf === 'string' ? this.leaves.get(leaf) : leaf;
    if (l) l.flutter = 0;
  }

  public changeLeafColor(leaf: LeafEntity | string, color: string): void {
    const l = typeof leaf === 'string' ? this.leaves.get(leaf) : leaf;
    if (l) l.color = color;
  }

  /**
   * Lá khô dần theo tốc độ `rate`.
   *
   * Trước đây `rate` bị bỏ qua — mọi lá khô đều giống nhau. Nay tốc độ khô
   * quyết định mức co lại, màu và độ rung còn lại.
   */
  public dryLeaf(leaf: LeafEntity | string, rate: number): void {
    const l = typeof leaf === 'string' ? this.leaves.get(leaf) : leaf;
    if (!l) return;
    const step = Number.isFinite(rate) ? Math.max(0, rate) : 0;
    l.size = Math.max(0.01, l.size * (1 - Math.min(0.9, step * 0.1)));
    l.color = '#b45309';
    l.flutter = Math.max(0, l.flutter - step * 0.1);
  }

  public detachLeaf(leaf: LeafEntity | string): void {
    const l = typeof leaf === 'string' ? this.leaves.get(leaf) : leaf;
    if (l) l.isAttached = false;
  }

  public fallLeaf(leaf: LeafEntity | string, gravity?: any): void {}
  public landLeaf(leaf: LeafEntity | string, surface?: any): void {}

  // 101–120. Gió tác động lên cây, cành và lá
  public applyWindToTree(tree: TreeEntity | string, wind: any): void {
    this.swayTreeTrunk(tree, wind);
    this.swayTreeCanopy(tree, wind);
  }

  public applyWindToBranch(branch: BranchEntity | string, wind: any): void {
    this.oscillateBranch(branch, wind);
  }

  public applyWindToLeaf(leaf: LeafEntity | string, wind: any): void {
    this.flutterLeaf(leaf, wind);
  }

  /**
   * Áp suất gió lên vật thể: p = ½·ρ·v²·A.
   *
   * Trước đây `object` bị bỏ qua và kết quả chỉ phụ thuộc tốc độ gió qua
   * một hệ số cố định. Nay diện tích chắn gió của vật cũng quyết định kết quả.
   */
  public calculateWindPressure(object: any, wind: any): number {
    const v = windSpeedOf(wind);
    return 0.5 * AIR_DENSITY * v * v * windAreaOf(object);
  }

  /** Lực cản gió: F = ½·ρ·v²·C_d·A. */
  public calculateWindDrag(object: any, wind: any): number {
    const v = windSpeedOf(wind);
    return 0.5 * AIR_DENSITY * v * v * DRAG_COEFFICIENT * windAreaOf(object);
  }

  /** Mô-men xoắn do gió: τ = F·l (l = cánh tay lực). */
  public calculateWindTorque(object: any, wind: any): number {
    return this.calculateWindDrag(object, wind) * leverArmOf(object);
  }

  /** Đung đưa thân cây theo gió — lực gió làm tăng ứng lực các cành. */
  public swayTreeTrunk(tree: TreeEntity | string, wind: any): void {
    const t = typeof tree === 'string' ? this.trees.get(tree) : tree;
    if (!t) return;
    const load = this.calculateWindDrag({ size: { x: t.thickness, y: t.height, z: t.thickness } }, wind);
    t.canopyRadius = Math.max(0, t.canopyRadius - load * 0.0005);
    for (const branchId of t.branches) {
      const b = this.branches.get(branchId);
      if (b) b.flexForce += load * 0.001;
    }
  }

  /** Đung đưa tán cây theo gió. */
  public swayTreeCanopy(tree: TreeEntity | string, wind: any): void {
    const t = typeof tree === 'string' ? this.trees.get(tree) : tree;
    if (!t) return;
    const speed = windSpeedOf(wind);
    t.canopyRadius = Math.max(0.01, t.canopyRadius * (1 + speed * 0.0005));
  }

  /** Dao động cành theo gió. */
  public oscillateBranch(branch: BranchEntity | string, wind: any): void {
    const b = typeof branch === 'string' ? this.branches.get(branch) : branch;
    if (!b) return;
    const speed = windSpeedOf(wind);
    b.flexForce += speed * 0.002 * Math.max(0.5, b.thickness);
  }

  /** Rung cả nhóm lá theo gió. */
  public flutterLeaves(leafGroup: any, wind: any): void {
    const leaves = Array.isArray(leafGroup)
      ? leafGroup
      : Array.isArray(leafGroup?.leaves)
        ? leafGroup.leaves
        : [];
    for (const leaf of leaves) this.flutterLeaf(leaf, wind);
  }
  public simulateWindGust(gust: any): void {}
  public simulateTurbulentWind(wind: any): void {}
  public simulateWindShear(wind: any): void {}
  public updateWindDirection(direction: any): void {}
  public updateWindStrength(strength: any): void {}
  public updateWindFrequency(frequency: any): void {}
  /**
   * Vật thể có bị hư hại do gió không.
   *
   * Trước đây luôn `false`. Nay tải gió (tốc độ × diện tích chắn gió) được
   * so với sức chịu gió của vật thể, tức là sức chịu suy ra từ kích thước
   * hoặc `windResistance` khai báo.
   */
  public detectWindDamage(object: any): boolean {
    if (!object) return false;
    const wind = Number(object?.windSpeed ?? object?.windForce ?? object?.wind ?? 0);
    if (!Number.isFinite(wind) || wind <= 0) return false;
    const extent = this.extentOf(object, 1);
    const crossSection = extent * extent;
    const load = wind * crossSection;
    const resistance = Number(object?.windResistance ?? extent * 12);
    const limit = Number.isFinite(resistance) && resistance > 0 ? resistance : 1;
    const stress = Number(object?.flexForce ?? 0);
    return load > limit || (Number.isFinite(stress) && stress > limit);
  }

  public breakWindDamagedBranch(branch: BranchEntity | string): void {
    this.breakBranch(branch);
  }
  public shedLeavesInWind(tree: TreeEntity | string, wind: any): void {}
  public stabilizeVegetationAfterWind(tree: TreeEntity | string): void {}

  // 121–140. Rễ cây, đất và sự phát triển
  public createRootSystem(tree: TreeEntity | string): RootEntity {
    const treeId = typeof tree === 'string' ? tree : tree.id;
    const id = `root_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const root: RootEntity = {
      id,
      treeId,
      length: 2.0,
      depth: 1.2,
      stability: 100,
    };
    this.roots.set(id, root);
    return root;
  }

  public growRoot(root: RootEntity | string, amount: number): void {
    const r = typeof root === 'string' ? this.roots.get(root) : root;
    if (r) r.length += amount;
  }

  public extendRootIntoSoil(root: RootEntity | string, direction: any): void {}
  public thickenRoot(root: RootEntity | string, amount: number): void {}
  public branchRootSystem(root: RootEntity | string): void {}
  /**
   * Rễ có bị vướng vật cản không.
   *
   * Trước đây luôn `false`. Nay rễ bị chặn khi độ sâu vượt quá độ sâu mà tầng
   * đất cứng cho phép đào, hoặc khi rễ đã ghi nhận vật cản.
   */
  public detectRootObstacles(root: RootEntity | string): boolean {
    const r = typeof root === 'string' ? this.roots.get(root) : root;
    if (!r) return false;
    const record = r as any;
    if (Array.isArray(record.obstacles) && record.obstacles.length > 0) return true;
    const depth = this.numOf(record, ['depth'], 0);
    const hardness = this.numOf(record.soil, ['hardness'], this.numOf(record, ['hardness'], 1));
    const maxDepth = 0.5 + hardness * 0.5;
    return depth > maxDepth;
  }
  public wrapRootAroundObstacle(root: RootEntity | string, obstacle: any): void {}
  public penetrateSoil(root: RootEntity | string, soil: any): void {}

  /**
   * Lượng nước hấp thụ qua rễ (đơn vị lượng/giây).
   *
   * Trước đây luôn `1.5`. Nay tính từ độ ẩm đất, độ dài rễ và độ xốp của đất.
   */
  public absorbWaterThroughRoots(root: RootEntity | string): number {
    const r = typeof root === 'string' ? this.roots.get(root) : root;
    if (!r) return 0;
    const record = r as any;
    const moisture = this.numOf(record.soil, ['moisture'], this.numOf(record, ['moisture'], 0.4));
    const length = this.numOf(record, ['length'], 0);
    const porosity = this.numOf(record, ['porosity'], 0.35);
    return Math.max(0, moisture * length * porosity * 10);
  }

  /**
   * Lượng dinh dưỡng hấp thụ qua rễ (đơn vị lượng/giây).
   *
   * Trước đây luôn `1.0`. Nay tính từ độ phì của đất, độ dài rễ và mật độ đất.
   */
  public absorbNutrientsThroughRoots(root: RootEntity | string): number {
    const r = typeof root === 'string' ? this.roots.get(root) : root;
    if (!r) return 0;
    const record = r as any;
    const fertility = this.numOf(record.soil, ['fertility'], this.numOf(record, ['fertility'], 0.5));
    const length = this.numOf(record, ['length'], 0);
    const density = this.numOf(record, ['density'], 1.2);
    return Math.max(0, fertility * length * Math.max(0.1, density));
  }

  /**
   * Rễ có bị hư hại không.
   *
   * Trước đây luôn `false`. Nay rễ hư hại khi độ toàn vẹn thấp, hoặc khi ứng
   * suất vượt quá khả năng giữ của rễ.
   */
  public detectRootDamage(root: RootEntity | string): boolean {
    const r = typeof root === 'string' ? this.roots.get(root) : root;
    if (!r) return false;
    const record = r as any;
    const integrity = this.numOf(record, ['integrity'], 1);
    const stress = this.numOf(record, ['stress'], 0);
    return integrity < 0.5 || stress > 0.5;
  }
  public breakRoot(root: RootEntity | string, force?: any): void {}
  public decayRoot(root: RootEntity | string, rate: number): void {}
  public anchorTreeWithRoots(tree: TreeEntity | string): void {}
  public loosenRootAnchorage(tree: TreeEntity | string): void {}

  /**
   * Độ ổn định của hệ rễ (0..100).
   *
   * Trước đây luôn `85`. Nay tính từ độ ổn định của đất, mức bám của từng rễ
   * và tải trọng do chiều cao cây gây ra.
   */
  public calculateRootStability(tree: TreeEntity | string): number {
    const t = typeof tree === 'string' ? this.trees.get(tree) : tree;
    if (!t) return 0;
    const record = t as any;
    const rootIds = Array.isArray(record.roots) ? record.roots : [];
    let anchor = 0;
    for (const id of rootIds) {
      const r = this.roots.get(id);
      if (r) anchor += this.numOf(r, ['stability'], 0) * this.numOf(r, ['depth'], 0);
    }
    if (rootIds.length > 0) anchor /= rootIds.length;
    const soilStability = this.numOf(record.soil, ['stability'], this.numOf(record, ['stability'], 0.7));
    const load = this.numOf(record, ['height'], 0) * 8;
    return Math.max(0, Math.min(100, (soilStability * 60 + anchor * 40) / (1 + load * 0.05)));
  }
  public simulateRootCompetition(root: any, neighbor: any): void {}
  public updateRootGrowthDirection(root: RootEntity | string): void {}
  public regenerateRootMesh(tree: TreeEntity | string): void {}
  public updateRootSoilInteraction(tree: TreeEntity | string): void {}

  // 141–160. Hoa, nụ hoa và cánh hoa
  public createFlower(plant: any): FlowerEntity {
    const plantId = typeof plant === 'string' ? plant : (plant?.id ?? 'plant');
    const id = `flower_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const flower: FlowerEntity = {
      id,
      plantId,
      bloomState: 0.1,
      petalColor: '#f43f5e',
      isOpen: false,
    };
    this.flowers.set(id, flower);
    return flower;
  }

  public initializeFlower(flower: FlowerEntity | string): void {}
  public growFlower(flower: FlowerEntity | string, amount: number): void {
    const f = typeof flower === 'string' ? this.flowers.get(flower) : flower;
    if (f) f.bloomState = Math.min(1.0, f.bloomState + amount);
  }

  public developFlowerBud(flower: FlowerEntity | string): void {}
  public swellFlowerBud(flower: FlowerEntity | string): void {}
  public openFlowerBud(flower: FlowerEntity | string): void {
    const f = typeof flower === 'string' ? this.flowers.get(flower) : flower;
    if (f) f.isOpen = true;
  }

  public bloomFlower(flower: FlowerEntity | string): void {
    const f = typeof flower === 'string' ? this.flowers.get(flower) : flower;
    if (f) { f.bloomState = 1.0; f.isOpen = true; }
  }

  public unfoldPetals(flower: FlowerEntity | string): void { this.bloomFlower(flower); }
  public foldPetals(flower: FlowerEntity | string): void {
    const f = typeof flower === 'string' ? this.flowers.get(flower) : flower;
    if (f) f.isOpen = false;
  }

  public rotateFlower(flower: FlowerEntity | string, angle: number): void {}
  public swayFlower(flower: FlowerEntity | string, wind: any): void {}
  public flutterPetals(flower: FlowerEntity | string, wind: any): void {}
  public changePetalColor(flower: FlowerEntity | string, color: string): void {
    const f = typeof flower === 'string' ? this.flowers.get(flower) : flower;
    if (f) f.petalColor = color;
  }

  public closeFlowerAtNight(flower: FlowerEntity | string): void { this.foldPetals(flower); }
  public reopenFlowerAtDay(flower: FlowerEntity | string): void { this.unfoldPetals(flower); }
  public wiltFlower(flower: FlowerEntity | string, rate: number): void {
    const f = typeof flower === 'string' ? this.flowers.get(flower) : flower;
    if (f) f.bloomState = Math.max(0, f.bloomState - rate);
  }

  public dryPetals(flower: FlowerEntity | string, rate: number): void {}
  public detachPetal(petal: any): void {}
  public scatterPetals(flower: FlowerEntity | string, force?: any): void {}
  public dropWitheredFlower(flower: FlowerEntity | string): void {
    const id = typeof flower === 'string' ? flower : flower.id;
    this.flowers.delete(id);
  }

  // 161–180. Quả, hạt và vòng đời thực vật
  public createFruit(plant: any): FruitEntity {
    const plantId = typeof plant === 'string' ? plant : (plant?.id ?? 'plant');
    const id = `fruit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const fruit: FruitEntity = {
      id,
      plantId,
      ripeness: 0.2,
      isDetached: false,
    };
    this.fruits.set(id, fruit);
    return fruit;
  }

  public developFruit(fruit: FruitEntity | string): void {}
  public growFruit(fruit: FruitEntity | string, amount: number): void {}
  public ripenFruit(fruit: FruitEntity | string, rate: number): void {
    const f = typeof fruit === 'string' ? this.fruits.get(fruit) : fruit;
    if (f) f.ripeness = Math.min(1.0, f.ripeness + rate);
  }

  public changeFruitColor(fruit: FruitEntity | string, color: string): void {}
  public softenFruit(fruit: FruitEntity | string, amount: number): void {}
  public rotFruit(fruit: FruitEntity | string, rate: number): void {}
  public detachFruit(fruit: FruitEntity | string): void {
    const f = typeof fruit === 'string' ? this.fruits.get(fruit) : fruit;
    if (f) f.isDetached = true;
  }

  public fallFruit(fruit: FruitEntity | string, gravity?: any): void {}
  public bounceFruit(fruit: FruitEntity | string, surface?: any): void {}
  public splitFruit(fruit: FruitEntity | string, force?: any): void {}
  public exposeSeeds(fruit: FruitEntity | string): void {}

  public createSeed(plant: any): SeedEntity {
    const id = `seed_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const seed: SeedEntity = {
      id,
      species: plant?.species ?? 'Oak',
      germinated: false,
    };
    this.seeds.set(id, seed);
    return seed;
  }

  public disperseSeed(seed: SeedEntity | string, force?: any): void {}
  public burySeed(seed: SeedEntity | string, soil?: any): void {}
  public germinateSeed(seed: SeedEntity | string): boolean {
    const s = typeof seed === 'string' ? this.seeds.get(seed) : seed;
    if (s) { s.germinated = true; return true; }
    return false;
  }

  public sproutSeed(seed: SeedEntity | string): void { this.germinateSeed(seed); }
  public developSeedling(seedling: any): void {}
  public maturePlant(plant: any): void {}
  public restartPlantGrowthCycle(plant: any): void {}

  // 181–200. Héo úa, chết, mục nát và tái sinh
  public calculatePlantHealth(plant: any): number { return plant?.health ?? 100; }
  public calculatePlantStress(plant: any): number { return 100 - (plant?.health ?? 100); }
  /**
   * Cây có bị hạn hán không.
   *
   * Trước đây luôn `false`. Nay hạn hán xảy ra khi độ ẩm đất thấp hơn ngưỡng
   * mà cây cần để duy trì.
   */
  public detectPlantDrought(plant: any): boolean {
    if (!plant) return false;
    const moisture = this.numOf(plant.soil, ['moisture'], this.numOf(plant, ['moisture'], 0.4));
    const threshold = this.numOf(plant, ['droughtThreshold', 'waterDemand'], 0.5);
    return moisture < threshold;
  }

  /**
   * Cây có bị bệnh không.
   *
   * Trước đây luôn `false`. Nay bệnh xuất hiện khi sức khoẻ thấp, độc tố
   * cao, có ký sinh trùng, hoặc cây đang chịu ứng suất lớn.
   */
  public detectPlantDisease(plant: any): boolean {
    if (!plant) return false;
    const health = this.numOf(plant, ['health'], 100);
    const toxicity = this.numOf(plant, ['toxicity'], 0);
    const parasites = this.numOf(plant, ['parasiteCount'], 0);
    const stress = this.numOf(plant, ['stress'], 0);
    return health < 60 || toxicity > 0.5 || parasites > 0 || stress > 0.5;
  }

  public detectPlantDamage(plant: any): boolean { return (plant?.health ?? 100) < 90; }
  public reducePlantVitality(plant: any, amount: number): void {
    if (plant && plant.health) plant.health = Math.max(0, plant.health - amount);
  }

  public wiltPlant(plant: any, rate: number): void { this.reducePlantVitality(plant, rate); }
  public dryPlantLeaves(plant: any, rate: number): void {}
  public discolorPlantLeaves(plant: any, color: string): void {}
  public shedDeadLeaves(plant: any): void {}
  public killPlant(plant: any): void {
    if (plant) plant.health = 0;
  }

  public enterDormancy(plant: any): void {}
  public resumePlantGrowth(plant: any): void {}
  public decayPlantTissue(plant: any, rate: number): void {}
  public decomposeDeadPlant(plant: any): void {}
  public detachDeadBranch(branch: BranchEntity | string): void { this.detachBranch(branch); }
  public collapseDeadTree(tree: TreeEntity | string): void {}
  public spreadPlantDisease(plant: any, neighbor: any): void {}
  public regenerateDamagedPlant(plant: any): void {
    if (plant) plant.health = 100;
  }
  public recyclePlantNutrients(plant: any, soil: any): void {}

  // 201–220. Cỏ, bụi cây, dây leo và rêu
  public createGrassPatch(area: any): any {
    const id = `grass_${Date.now()}`;
    // `initialHeight` giữ chiều cao gốc để `restoreGrassPatch` phục hồi đúng.
    const patch = {
      id,
      area,
      height: 0.2,
      initialHeight: 0.2,
      trampled: false,
      isDry: false,
      dryness: 0,
    };
    this.grassPatches.set(id, patch);
    return patch;
  }

  public growGrassBlade(blade: any): void {
    if (!blade) return;
    blade.height = Math.max(0, blade.height ?? 0) + 0.05;
    blade.alive = true;
  }
  public bendGrassBlade(blade: any, wind: any): void {
    if (!blade) return;
    const speed = windSpeedOf(wind);
    blade.bend = (blade.bend ?? 0) + speed * 0.01;
  }
  public swayGrassPatch(patch: any, wind: any): void {
    const p = typeof patch === 'string' ? this.grassPatches.get(patch) : patch;
    if (!p) return;
    const speed = windSpeedOf(wind);
    p.sway = (p.sway ?? 0) + speed * 0.01;
  }

  /**
   * Dập cỏ — lực quyết định mức dập.
   *
   * Trước đây `force` bị bỏ qua, mọi lần dập đều cho kết quả giống nhau.
   */
  public flattenGrassPatch(patch: any, force?: any): void {
    const p = typeof patch === 'string' ? this.grassPatches.get(patch) : patch;
    if (!p) return;
    const magnitude = forceMagnitude(force);
    if (typeof p.height === 'number') {
      p.height = Math.max(0, p.height - Math.min(p.height, magnitude * 0.05));
    }
    p.trampled = true;
  }

  public restoreGrassPatch(patch: any): void {
    const p = typeof patch === 'string' ? this.grassPatches.get(patch) : patch;
    if (!p) return;
    p.trampled = false;
    if (typeof p.height === 'number' && typeof p.initialHeight === 'number') {
      p.height = p.initialHeight;
    }
  }

  public trampleGrassPatch(patch: any): void { this.flattenGrassPatch(patch); }
  public regrowTrampledGrass(patch: any): void { this.restoreGrassPatch(patch); }

  /**
   * Cỏ khô dần theo tốc độ `rate`.
   *
   * Trước đây `rate` bị bỏ qua và mọi lần đều khô hẳn ngay lập tức.
   */
  public dryGrassPatch(patch: any, rate?: number): void {
    const p = typeof patch === 'string' ? this.grassPatches.get(patch) : patch;
    if (!p) return;
    const step = Number.isFinite(rate) ? Math.max(0, rate as number) : 1;
    p.dryness = Math.min(1, (p.dryness ?? 0) + step * 0.1);
    p.isDry = p.dryness >= 1;
  }

  public igniteDryGrass(patch: any): boolean {
    const p = typeof patch === 'string' ? this.grassPatches.get(patch) : patch;
    return p?.isDry ?? false;
  }

  public createShrub(species = 'Berry'): any {
    const id = `shrub_${Date.now()}`;
    const shrub = { id, species, size: 1.0, isCrushed: false };
    this.shrubs.set(id, shrub);
    return shrub;
  }

  public growShrub(shrub: any, amount: number): void {
    const s = typeof shrub === 'string' ? this.shrubs.get(shrub) : shrub;
    if (s) s.size += amount;
  }

  public trimShrub(shrub: any, amount: number): void {
    const s = typeof shrub === 'string' ? this.shrubs.get(shrub) : shrub;
    if (s) s.size = Math.max(0.2, s.size - amount);
  }

  /**
   * Nghiền bụi — lực quyết định mức nghiền.
   *
   * Trước đây `force` bị bỏ qua hoàn toàn.
   */
  public crushShrub(shrub: any, force?: any): void {
    const s = typeof shrub === 'string' ? this.shrubs.get(shrub) : shrub;
    if (!s) return;
    const magnitude = forceMagnitude(force);
    if (typeof s.size === 'number') {
      s.size = Math.max(0.2, s.size - Math.min(Math.max(0, s.size - 0.2), magnitude * 0.02));
    }
    s.isCrushed = true;
  }

  /**
   * Tạo dây leo bám vào cây.
   *
   * Trước đây `plant` bị bỏ qua — dây leo không biết mình bám vào cây nào.
   */
  public createVine(plant: any): any {
    const id = `vine_${Date.now()}`;
    const plantId = typeof plant === 'string' ? plant : (plant?.id ?? null);
    const vine = { id, length: 1.0, attachedTo: plant ?? null, plantId };
    this.vines.set(id, vine);
    return vine;
  }

  public extendVine(vine: any, amount: number): void {
    const v = typeof vine === 'string' ? this.vines.get(vine) : vine;
    if (v) v.length += amount;
  }

  public wrapVineAroundObject(vine: any, object: any): void {
    const v = typeof vine === 'string' ? this.vines.get(vine) : vine;
    if (v) v.attachedTo = object;
  }

  public detachVine(vine: any): void {
    const v = typeof vine === 'string' ? this.vines.get(vine) : vine;
    if (v) v.attachedTo = null;
  }

  public growMoss(surface: any): any { return { surface, coverage: 0.5 }; }
  public dryMoss(surface: any, rate?: number): void {}
}
