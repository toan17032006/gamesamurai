// Bản đồ Thế Giới Vô Cực: canvas tự cập nhật theo dữ liệu worldgen — không tạo DOM
// node cho từng vật thể. Vẽ ô theo biome (fog-of-war: chỉ ô đã khám phá), marker
// (đài hồi sinh, boss, làng), player + hướng nhìn, waypoint đặt bằng click; zoom/pan.
import { CELL } from '../systems/infiniteWorld.js';

const BIOME_COLORS = {
  outskirts: '#5e7a48', village: '#8a7a5a', bamboo: '#4e6a3e', forest: '#3e5a38',
  mountain: '#6e6e6a', snow: '#c8d4de', river: '#3a6a8a', lake: '#4a6a58',
  shrine: '#8a5a6a', battlefield: '#7a6a4e', castle: '#4c4c58', cave: '#4a4440',
  badlands: '#9a6a4a', volcano: '#6a2e1e', throne_hall: '#3a3a50',
};

export class WorldMap {
  constructor(game) {
    this.game = game;
    this.zoom = 34;            // px / ô
    this.panX = 0; this.panY = 0;
    this.dragging = false;
    this._last = null;
    this._raf = null;
  }

  attach(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    canvas.onmousedown = (e) => { this.dragging = true; this._last = [e.clientX, e.clientY]; };
    window.addEventListener('mouseup', () => { this.dragging = false; });
    canvas.onmousemove = (e) => {
      if (!this.dragging || !this._last) return;
      this.panX += e.clientX - this._last[0];
      this.panY += e.clientY - this._last[1];
      this._last = [e.clientX, e.clientY];
      this.draw();
    };
    canvas.onwheel = (e) => {
      e.preventDefault();
      this.zoom = Math.max(16, Math.min(72, this.zoom * (e.deltaY < 0 ? 1.15 : 0.87)));
      this.draw();
    };
    canvas.onclick = (e) => {
      if (this.dragging || !this.game.infinite) return;
      // đặt waypoint tại ô click (nếu đã khám phá)
      const inf = this.game.infinite;
      const rect = canvas.getBoundingClientRect();
      const u = this.toWorld(e.clientX - rect.left, e.clientY - rect.top);
      const cx = Math.round(u.x / CELL), cz = Math.round(u.z / CELL);
      const st = inf.stateFor(inf.key(cx, cz));
      if (!st.explored) { this.game.ui.notify('info', 'Vùng chưa khám phá — không thể đặt điểm hẹn.'); return; }
      inf.waypoint = { x: u.x, z: u.z, cx, cz };
      this.game.ui.notify('good', `Đã đặt điểm hẹn tại ô [${cx},${cz}]`);
      this.draw();
    };
  }

  // world (m) -> canvas px
  toCanvas(wx, wz, cw, ch) {
    const p = this.game.player.pos;
    return [cw / 2 + (wx - p.x) * (this.zoom / CELL) + this.panX,
            ch / 2 + (wz - p.z) * (this.zoom / CELL) + this.panY];
  }

  toWorld(px, py) {
    const p = this.game.player.pos;
    return { x: p.x + ((px - this.canvas.width / 2 - this.panX) * CELL) / this.zoom,
             z: p.z + ((py - this.canvas.height / 2 - this.panY) * CELL) / this.zoom };
  }

  draw() {
    if (!this.canvas) return;
    const g = this.game;
    const inf = g.infinite;
    const ctx = this.ctx;
    const cw = this.canvas.width, ch = this.canvas.height;
    ctx.fillStyle = '#0c0e12';
    ctx.fillRect(0, 0, cw, ch);
    if (!inf) {
      ctx.fillStyle = '#666';
      ctx.font = '14px sans-serif';
      ctx.fillText('Không ở chế độ Thế Giới Vô Cực.', 20, 30);
      return;
    }
    const p = g.player.pos;
    const pcx = Math.round(p.x / CELL), pcz = Math.round(p.z / CELL);
    const range = 12; // vẽ 25×25 ô quanh player (ô chưa khám phá = tối)
    for (let dz = -range; dz <= range; dz++) {
      for (let dx = -range; dx <= range; dx++) {
        const cx = pcx + dx, cz = pcz + dz;
        const st = inf.stateFor(inf.key(cx, cz));
        const info = inf.biomeOf(cx, cz);
        const [x0, y0] = this.toCanvas(cx * CELL - CELL / 2, cz * CELL - CELL / 2, cw, ch);
        const s = this.zoom - 1.5;
        if (st.explored) {
          ctx.fillStyle = BIOME_COLORS[info.biome] || '#555';
          ctx.globalAlpha = 0.92;
          ctx.fillRect(x0, y0, s, s);
          ctx.globalAlpha = 1;
          // danger số ở ô đang đứng
          if (dx === 0 && dz === 0) {
            ctx.fillStyle = '#fff';
            ctx.font = '10px sans-serif';
            ctx.fillText(`☠${info.danger}`, x0 + 3, y0 + 12);
          }
          // marker: boss đã hạ / vùng an toàn
          if (st.bossKilled) { ctx.fillStyle = '#ffd257'; ctx.fillRect(x0 + s - 8, y0 + 3, 5, 5); }
          if (st.cleared) { ctx.strokeStyle = '#8ad0b0'; ctx.strokeRect(x0 + 1.5, y0 + 1.5, s - 3, s - 3); }
        } else if (st.scouted) {
          // ô kề bên đã lượn qua: hiện mờ (vị trí, không chi tiết)
          ctx.fillStyle = BIOME_COLORS[info.biome] || '#555';
          ctx.globalAlpha = 0.3;
          ctx.fillRect(x0, y0, s, s);
          ctx.globalAlpha = 1;
        } else {
          ctx.fillStyle = '#181b20';
          ctx.fillRect(x0, y0, s, s);
        }
      }
    }
    // grid mờ
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    for (let dz = -range; dz <= range + 1; dz++) {
      const [x0, y0] = this.toCanvas((pcx - range) * CELL - CELL / 2, (pcz + dz) * CELL - CELL / 2, cw, ch);
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + range * 2 * this.zoom, y0); ctx.stroke();
    }
    // waypoint
    if (inf.waypoint) {
      const [wx, wy] = this.toCanvas(inf.waypoint.x, inf.waypoint.z, cw, ch);
      ctx.strokeStyle = '#ffd257';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(wx, wy, 7, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(wx, wy - 12); ctx.lineTo(wx, wy + 12); ctx.moveTo(wx - 12, wy); ctx.lineTo(wx + 12, wy); ctx.stroke();
      ctx.lineWidth = 1;
    }
    // player marker + hướng camera
    const [px, py] = this.toCanvas(p.x, p.z, cw, ch);
    const yaw = g.cameraRig.yaw + Math.PI; // hướng nhìn (world)
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(-yaw);
    ctx.fillStyle = '#c8a0ff';
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(9, 0); ctx.lineTo(-6, -5.5); ctx.lineTo(-3, 0); ctx.lineTo(-6, 5.5);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();
    // chú thích
    ctx.fillStyle = '#9aa5ad';
    ctx.font = '11px sans-serif';
    ctx.fillText(`Ô hiện tại [${pcx},${pcz}] · zoom ${(this.zoom / 34).toFixed(1)}× · click: đặt điểm hẹn · kéo: di chuyển`, 12, ch - 10);
  }
}
