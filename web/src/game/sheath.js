// Vỏ kiếm — logic thuần, không phụ thuộc three.js nên test được bằng Node.
// Quy tắc (giữ nguyên yêu cầu cũ của người chơi):
//  - Đứng yên trên mặt đất đủ 3s -> tự tra kiếm vào bao.
//  - Đang chạy / nhảy / rơi mà kiếm đang rút -> tra kiếm ngay lập tức.
//  - Đã tra kiếm thì chạy/nhảy vẫn giữ nguyên trong bao, KHÔNG tự rút.
//  - Chỉ rút kiếm khi: tấn công, kỹ năng, đỡ, ngắm, hoặc bấm phím tra/rút.
//  - Đi bộ giữ nguyên trạng thái đang rút và reset đồng hồ đứng yên.
export const SHEATH_IDLE_SECONDS = 3;

export class WeaponSheath {
  constructor() {
    this.sheathed = false;
    this.idleTime = 0;
  }

  draw() { this.sheathed = false; this.idleTime = 0; }
  sheath() { this.sheathed = true; this.idleTime = 0; }
  toggle() { if (this.sheathed) this.draw(); else this.sheath(); }

  // ctx: { moving, running, grounded, attacking, blocking, aiming, dt }
  //  - moving = đang di chuyển (đi bộ hoặc chạy); running = chạy (Shift).
  //  - Đi bộ: giữ nguyên trạng thái, reset đồng hồ đứng yên.
  //  - Chạy / nhảy / rơi: nếu đang rút thì tra ngay; đã tra thì giữ nguyên.
  // Trả về true nếu trạng thái thay đổi trong frame này.
  update(ctx) {
    const before = this.sheathed;
    if (ctx.attacking || ctx.blocking || ctx.aiming) {
      this.draw();
    } else if (!ctx.grounded || ctx.running) {
      if (!this.sheathed) this.sheath();
      this.idleTime = 0;
    } else if (ctx.moving) {
      this.idleTime = 0;
    } else if (ctx.grounded && !this.sheathed) {
      this.idleTime += ctx.dt;
      if (this.idleTime >= SHEATH_IDLE_SECONDS) this.sheath();
    }
    return this.sheathed !== before;
  }
}
