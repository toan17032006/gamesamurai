// Hoạt ảnh thủ tục trên xương của engine (không phải clip tự chế):
// đi -> tay/chân đung đưa theo walkPhase, chém -> tay phải vung.
// Không động vào saya ở đây — saya là vật cứng gắn ở thắt lưng.
import { CONFIG } from './config.js';

export function boneOf(built, name) {
  const b = built.boneHierarchy?.find((e) => e.name === name);
  return b ? b.node : null;
}

export function posePlayer(built, { moving, walkPhase, attackTimer }) {
  const armR = boneOf(built, 'arm_r');
  const armL = boneOf(built, 'arm_l');
  const legR = boneOf(built, 'thigh_r');
  const legL = boneOf(built, 'thigh_l');
  const swing = moving ? Math.sin(walkPhase) * 0.55 : 0;
  if (legR) legR.rotation.x = swing;
  if (legL) legL.rotation.x = -swing;
  if (armR) armR.rotation.x = attackTimer > 0 ? -1.6 + (CONFIG.attackTime - attackTimer) * 6 : -swing * 0.7;
  if (armL) armL.rotation.x = swing * 0.7;
}
