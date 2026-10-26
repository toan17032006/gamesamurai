// Vận động của một thân: di chuyển ngang, trọng lực/nhảy, lăn.
// Không chứa input, kiếm, hoạt ảnh hay combat — chỉ vị trí + vận tốc.
import * as THREE from 'three';
import { CONFIG } from './config.js';
import { moveDirection, speedFor, cycleRateFor } from './movement.js';

export class Locomotion {
  constructor(startPos) {
    this.pos = startPos.clone ? startPos.clone() : new THREE.Vector3(startPos.x, startPos.y, startPos.z);
    this.velY = 0;
    this.walkPhase = 0;
    this.dodgeTimer = 0;
  }

  // Trả về {moving, sprint, dir} — dir là {x, z} hoặc null.
  stepHorizontal(dt, inputVec, camYaw, sprint) {
    const dir = moveDirection(camYaw, inputVec);
    const moving = dir !== null;
    if (moving) {
      this.pos.x += dir.x * speedFor(sprint) * dt;
      this.pos.z += dir.z * speedFor(sprint) * dt;
      this.walkPhase += dt * cycleRateFor(sprint);
    }
    return { moving, sprint, dir };
  }

  // Trả về grounded của đầu frame (trước khi nhảy/rơi).
  // Sửa bug của bản viết lại: trước đây frame đứng đất gán velY rồi
  // không cộng vị trí, nên frame sau lại đứng đất và velY bị reset 0 —
  // bấm nhảy không bao giờ rời mặt đất. Nay nhảy thì cộng vị trí ngay
  // trong frame đó để frame sau rơi vào trạng thái airborne.
  stepVertical(dt, groundY, jumpPressed) {
    const grounded = this.pos.y <= groundY + 0.001;
    if (grounded) {
      if (jumpPressed) {
        this.velY = CONFIG.jumpVelocity;
        this.pos.y += this.velY * dt;
      } else {
        this.pos.y = groundY;
        this.velY = 0;
      }
    } else {
      this.velY = Math.max(this.velY - CONFIG.gravity * dt, -CONFIG.terminalVelocity);
      this.pos.y += this.velY * dt;
      if (this.pos.y < groundY) { this.pos.y = groundY; this.velY = 0; }
    }
    return grounded;
  }

  // Lăn: bấm dodge -> lăn 0.35s theo hướng đang đối mặt (facingYaw).
  stepDodge(dt, dodgePressed, facingYaw) {
    if (dodgePressed && this.dodgeTimer <= 0) this.dodgeTimer = CONFIG.dodgeTime;
    if (this.dodgeTimer > 0) {
      this.dodgeTimer -= dt;
      this.pos.x += Math.sin(facingYaw) * CONFIG.dodgeSpeed * dt;
      this.pos.z += Math.cos(facingYaw) * CONFIG.dodgeSpeed * dt;
    }
  }
}
