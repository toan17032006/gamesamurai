// Di chuyển — hàm thuần, test được bằng Node (không cần three):
// hướng thế giới từ hướng camera + vector input của InputMap.
import { CONFIG } from './config.js';

// vec: {x: trái/phải (-1..1), y: lùi/tiến (-1..1)} từ InputMap.getMovementVector().
// Trả về {x, z} đã chuẩn hóa, hoặc null nếu không di chuyển.
export function moveDirection(camYaw, vec) {
  if (vec.x === 0 && vec.y === 0) return null;
  // forward=(sin yaw, cos yaw), right=(cos yaw, -sin yaw).
  const x = Math.sin(camYaw) * vec.y + Math.cos(camYaw) * vec.x;
  const z = Math.cos(camYaw) * vec.y - Math.sin(camYaw) * vec.x;
  const len = Math.hypot(x, z) || 1;
  return { x: x / len, z: z / len };
}

export function speedFor(sprint) {
  return sprint ? CONFIG.sprintSpeed : CONFIG.walkSpeed;
}

export function cycleRateFor(sprint) {
  return sprint ? CONFIG.sprintCycleRate : CONFIG.walkCycleRate;
}
