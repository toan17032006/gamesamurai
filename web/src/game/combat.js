// Combat thuần (không cần three, test được bằng Node):
// nhát chém trúng những mục tiêu còn sống, trong tầm, trong góc chém
// (tích vô hướng hướng tới mục tiêu với hướng nhân vật > ngưỡng).
import { CONFIG } from './config.js';

export function findAttackHits(attackerPos, attackerYaw, targets, range = CONFIG.playerAttackRange, arcDot = CONFIG.playerAttackArcDot) {
  const fx = Math.sin(attackerYaw);
  const fz = Math.cos(attackerYaw);
  const hits = [];
  for (const t of targets) {
    if (t.dead) continue;
    const dx = t.pos.x - attackerPos.x;
    const dz = t.pos.z - attackerPos.z;
    const dist = Math.hypot(dx, dz);
    if (dist >= range || dist === 0) continue;
    if ((dx / dist) * fx + (dz / dist) * fz > arcDot) hits.push(t);
  }
  return hits;
}
