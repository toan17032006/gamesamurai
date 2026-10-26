// Hệ thống tra / rút vũ khí — dùng chung cho player, NPC, boss, mọi loại vũ khí.
// Luật (theo yêu cầu):
//  - Đứng yên 3s (không di chuyển, không đánh, không đỡ, không ngắm, đứng đất)
//    -> tự tra vũ khí vào bao (kiếm) / đeo sau lưng (cung, thương, chùy, móng).
//  - Đã tra vào rồi thì chạy / nhảy / lăn KHÔNG tự rút lại — vũ khí ở yên
//    trong bao cho tới khi có hành động chiến đấu.
//  - Chạy nhanh / chạy / nhảy / rơi mà đang cầm vũ khí -> tra vào ngay lúc
//    bắt đầu (khi chạy, khi nhảy không cầm vũ khí trên tay).
//  - Rút ra chỉ khi: đánh, kỹ năng, đỡ/parry, ngắm (cung), hoặc người chơi
//    bấm phím tra/rút khi đang đứng yên. Rút ra không cần đứng yên 3s;
//    3s là thời gian để TỰ TRA vào, không phải điều kiện để rút.
//  - Đi bộ (không chạy) giữ nguyên trạng thái đang cầm — chỉ chạy/nhảy mới ép tra.
// Vũ khí không bao giờ biến mất: tra/rút chỉ đổi parent của mesh (tay <-> bao/lưng),
// xem gfx/humanoid.js placeWeapon().
export const SHEATH_IDLE_SECONDS = 3;

export class WeaponSheath {
  constructor(rig) {
    this.rig = rig;
    this.idleT = 0;
  }

  get sheathed() { return !!(this.rig && this.rig.isSheathed && this.rig.isSheathed()); }
  get hasWeapon() { return !!(this.rig && this.rig.hasWeapon && this.rig.hasWeapon()); }

  draw() {
    if (!this.hasWeapon || !this.sheathed) return;
    if (this.rig.drawWeapon) this.rig.drawWeapon();
    this.idleT = 0;
  }
  sheath() {
    if (!this.hasWeapon || this.sheathed) return;
    if (this.rig.sheathWeapon) this.rig.sheathWeapon();
    this.idleT = 0;
  }
  toggle() { if (this.sheathed) this.draw(); else this.sheath(); }

  // ctx: { idle, running, jumping, airborne, dodging, attacking, blocking,
  //        aiming, dead } — do Character.update suy ra từ clip + trạng thái.
  update(dt, ctx = {}) {
    if (!this.hasWeapon || ctx.dead || dt <= 0) return;
    // Chiến đấu luôn cầm vũ khí: đánh/đỡ/ngắm rút ra ngay, không chờ.
    if (ctx.attacking || ctx.blocking || ctx.aiming) { this.draw(); return; }
    // Lăn giữ nguyên (lăn xong phản đòn ngay) — tư thế lăn đã ôm kiếm sát thân.
    if (ctx.dodging) { this.idleT = 0; return; }
    // Chạy / nhảy / rơi: không cầm vũ khí. Nếu đang cầm -> tra vào ngay;
    // nếu đã tra -> ở yên, không tự rút.
    if (ctx.running || ctx.jumping || ctx.airborne) { this.sheath(); return; }
    // Đứng yên đủ 3s -> tự tra vào.
    if (ctx.idle) {
      this.idleT += dt;
      if (this.idleT >= SHEATH_IDLE_SECONDS) this.sheath();
      return;
    }
    // Đi bộ, tương tác...: không phải đứng yên, reset đồng hồ nhưng giữ vũ khí.
    this.idleT = 0;
  }
}
