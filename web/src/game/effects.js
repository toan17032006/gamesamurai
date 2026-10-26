// Hiệu ứng: chỉ là lớp mỏng trên ParticleSystem của engine.
// Một chùm hạt rồi dừng ngay (không phun liên tục); lỗi hiệu ứng
// không được làm vỡ game.
export class Effects {
  constructor(particles) {
    this.particles = particles;
  }

  burst(pos, color) {
    try {
      const id = this.particles.spawn({
        id: `hit_${Date.now()}_${Math.random()}`,
        max: 24, rate: 24, lifetime: [0.3, 0.6], size: [0.08, 0.16],
        velocity: [0, 3, 0], velocityJitter: [4, 2, 4],
        colorFrom: color, colorTo: 0xffffff, gravity: 6,
      }, pos);
      this.particles.stop(id);
    } catch { /* bỏ qua */ }
  }
}
