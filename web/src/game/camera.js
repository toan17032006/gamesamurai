// Camera thứ ba: xoay bằng chuột (khi khóa con trỏ), bám sau lưng
// nhân vật theo yaw. Không chứa logic người chơi hay combat.
import { CONFIG } from './config.js';

export class ThirdPersonCamera {
  constructor() {
    this.yaw = CONFIG.camera.yaw;
    this.pitch = CONFIG.camera.pitch;
  }

  updateFromMouse(input, canvas) {
    if (typeof document === 'undefined' || document.pointerLockElement !== canvas) return;
    const md = input.getMouseDelta();
    this.yaw -= md.x * CONFIG.camera.mouseYaw;
    this.pitch = Math.max(
      CONFIG.camera.pitchMin,
      Math.min(CONFIG.camera.pitchMax, this.pitch + md.y * CONFIG.camera.mousePitch),
    );
  }

  follow(camera, playerPos) {
    const cx = playerPos.x - Math.sin(this.yaw) * CONFIG.camera.distance;
    const cz = playerPos.z - Math.cos(this.yaw) * CONFIG.camera.distance;
    camera.position.set(cx, playerPos.y + CONFIG.camera.height + Math.sin(this.pitch) * 2, cz);
    camera.lookAt(playerPos.x, playerPos.y + CONFIG.camera.lookHeight, playerPos.z);
  }
}
