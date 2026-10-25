// UI manager: screens (menu/loading/pause/death/level-complete/victory), toasts, hud & panels wiring.
import { HUD } from './hud.js';
import { Panels } from './panels.js';
import { ChatOverlay } from './components/chat.js';
import { esc, formatTime } from '../core/utils.js';
import { LEVEL_MAP } from '../data/levels.js';
import { actionsByGroup } from '../data/keys.js';

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

export class UIManager {
  constructor(game) {
    this.game = game;
    game.ui = this;
    this.root = document.getElementById('ui');
    this.hud = new HUD(game);
    this.panels = new Panels(game);
    this.chat = new ChatOverlay(game);
    this.overlay = null;
    this.screens = {};
    this.toasts = el('div', 'toasts');
    this.root.appendChild(this.toasts);
    this.letterbox = el('div', 'letterbox');
    this.root.appendChild(this.letterbox);
    this.buildScreens();
    this._fpsAcc = 0;
  }

  buildScreens() {
    const r = this.root;
    // main menu
    const menu = el('div', 'screen menu-screen');
    menu.innerHTML = `
      <div class="menu-inner">
        <div class="title-block">
          <div class="title-emblem" aria-hidden="true"><span class="te-ring"></span><span class="te-blade a"></span><span class="te-blade b"></span><span class="te-dot"></span></div>
          <h1>ĐẠO CỦA KẺ VÔ DANH</h1>
          <p class="subtitle">Samurai 3D Action RPG · 15 chương · 15 bản đồ nền · Thế Giới Vô Cực</p>
        </div>
        <div class="menu-buttons">
          <button data-act="continue">Tiếp Tục</button>
          <button data-act="new">Chơi Mới (Chiến Dịch)</button>
          <button data-act="infinite">Thế Giới Vô Cực</button>
          <button data-act="help">Hướng Dẫn</button>
          <button data-act="settings">Cài Đặt</button>
        </div>
        <div class="seed-row" id="seed-row" style="display:none">
          <label>Seed: <input id="seed-input" placeholder="gõ gì cũng được — trống = ngẫu nhiên" maxlength="32"></label>
          <button data-act="infinite-go">Vào Thế Giới</button>
        </div>
        <div class="save-slots" id="save-slots"></div>
        <div class="menu-footer" id="menu-footer"></div>
      </div>`;
    menu.querySelectorAll('.menu-buttons button').forEach((b) => {
      b.addEventListener('click', () => { this.game.audio.ensure(); this.menuAction(b.dataset.act); });
    });
    // nút "Vào Thế Giới" nằm ngoài .menu-buttons (trong seed-row)
    menu.querySelectorAll('.seed-row [data-act="infinite-go"]').forEach((b) => {
      b.addEventListener('click', () => { this.game.audio.ensure(); this.menuAction('infinite-go'); });
    });
    r.appendChild(menu);
    this.screens.menu = menu;

    // loading
    const loading = el('div', 'screen loading-screen');
    loading.innerHTML = `<div class="loading-inner"><div class="loading-kanji">S</div><h2 id="loading-title">Đang tải...</h2><div class="loading-bar"><div class="loading-fill" id="loading-fill"></div></div><p id="loading-step">Chuẩn bị</p></div>`;
    r.appendChild(loading);
    this.screens.loading = loading;

    // pause
    const pause = el('div', 'screen');
    pause.innerHTML = `
      <div class="modal">
        <h2>TẠM DỪNG</h2>
        <div class="menu-buttons">
          <button data-act="resume">Tiếp Tục</button>
          <button data-act="save">Lưu Game</button>
          <button data-act="psettings">Cài Đặt</button>
          <button data-act="phelp">Điều Khiển</button>
          <button data-act="tomenu">Về Menu Chính</button>
        </div>
        <div id="pause-sub"></div>
      </div>`;
    pause.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      this.game.audio.sfx('ui');
      const a = b.dataset.act;
      if (a === 'resume') this.game.resume();
      if (a === 'save') this.game.saveSystem.save(this.game.currentSlot);
      if (a === 'psettings') this.showSettings('pause');
      if (a === 'phelp') this.showHelp('pause');
      if (a === 'tomenu') this.game.toMenu();
    }));
    r.appendChild(pause);
    this.screens.pause = pause;

    // death
    const death = el('div', 'screen death-screen');
    death.innerHTML = `
      <div class="modal">
        <div class="death-kanji">✕</div>
        <h2>NGƯƠI ĐÃ NGÃ</h2>
        <p class="dim">"Cái chết không phải kết thúc - đó là một bài học."</p>
        <div class="menu-buttons">
          <button data-act="respawn">Hồi Sinh Tại Đài</button>
          <button data-act="retry">Chơi Lại Màn Này</button>
          <button data-act="tomenu">Về Menu Chính</button>
        </div>
      </div>`;
    death.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      const a = b.dataset.act;
      if (a === 'respawn') this.game.respawnPlayer();
      if (a === 'retry') this.game.retryLevel();
      if (a === 'tomenu') this.game.toMenu();
    }));
    r.appendChild(death);
    this.screens.death = death;

    // level complete
    const lc = el('div', 'screen');
    lc.innerHTML = `<div class="modal" id="lc-modal"></div>`;
    r.appendChild(lc);
    this.screens.levelComplete = lc;

    // victory
    const vic = el('div', 'screen victory-screen');
    vic.innerHTML = `
      <div class="modal">
        <div class="title-emblem small" aria-hidden="true"><span class="te-ring"></span><span class="te-blade a"></span><span class="te-blade b"></span><span class="te-dot"></span></div>
        <h2>CÂU CHUYỆN KHÉP LẠI</h2>
        <p>Yamikage tan thành tro. Ánh sáng trở lại những vùng đất bóng tối.<br>
        Nhưng thanh kiếm của ngươi... vẫn còn đó những chuyện phải làm.</p>
        <div id="victory-stats" class="stat-list"></div>
        <div class="menu-buttons">
          <button data-act="tomenu">Về Menu Chính</button>
        </div>
      </div>`;
    vic.querySelector('[data-act="tomenu"]').addEventListener('click', () => this.game.toMenu());
    r.appendChild(vic);
    this.screens.victory = vic;
  }

  async menuAction(a) {
    this.game.audio.sfx('ui');
    if (a === 'new') {
      this.game.newGame('slot1');
    } else if (a === 'infinite') {
      // hiện/ẩn ô nhập seed
      const row = this.screens.menu.querySelector('#seed-row');
      row.style.display = row.style.display === 'none' ? 'flex' : 'none';
      if (row.style.display === 'flex') {
        const inp = row.querySelector('#seed-input');
        inp.value = `mùa thu ${1000 + ((Math.random() * 9000) | 0)}`;
        inp.focus();
      }
    } else if (a === 'infinite-go') {
      const seed = this.screens.menu.querySelector('#seed-input').value.trim()
        || `seed-${(Math.random() * 1e9) | 0}`;
      // màn hình tải trước khi build 3×3 ô đầu (đồng bộ, nặng)
      this.hideAll();
      const loading = this.screens.loading;
      loading.querySelector('#loading-title').textContent = 'Thế Giới Vô Cực';
      loading.querySelector('#loading-step').textContent = `Đang dệt thế giới từ seed "${seed}"...`;
      loading.style.display = 'flex';
      await new Promise((r) => setTimeout(r, 80));
      this.game.startInfinite('slot1', seed);
    } else if (a === 'continue') {
      this.refreshSaveSlots(true);
    } else if (a === 'help') {
      this.showHelp('menu');
    } else if (a === 'settings') {
      this.showSettings('menu');
    }
  }

  async refreshSaveSlots(expand = false) {
    const box = this.screens.menu.querySelector('#save-slots');
    if (!expand && box.style.display !== 'block') { box.style.display = 'block'; }
    const slots = await this.game.saveSystem.listSlots();
    box.innerHTML = slots.length
      ? slots.map((s) => {
        const meta = s.meta || {};
        const mode = meta.mode === 'infinite' ? '∞ Vô Cực' : 'Chiến Dịch';
        const info = meta.slotName ? `${esc(meta.slotName)} · ${mode} · ${meta.mode === 'infinite' ? `seed ${esc(meta.seed || '?')}` : `C.${meta.levelId || '?'}`} · ${formatTime(meta.playtime || 0)}` : `Lưu trên server · C.${meta.level ?? '?'}`;
        return `<div class="save-row" data-slot="${esc(s.slot)}">
          <span>${esc(s.slot)} — ${info} <i class="dim">(${s.source})</i></span>
          <span class="save-actions"><button data-play="${esc(s.slot)}">Chơi</button><button class="danger" data-del="${esc(s.slot)}">Xóa</button></span>
        </div>`;
      }).join('')
      : '<p class="dim">Chưa có save nào. Hãy chọn "Chơi Mới".</p>';
    box.style.display = 'block';
    box.querySelectorAll('[data-play]').forEach((b) => b.addEventListener('click', async () => {
      this.game.audio.sfx('ui');
      const ok = await this.game.continueGame(b.dataset.play);
      if (!ok) this.notify('bad', 'Không thể tải save');
    }));
    box.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', async () => {
      this.game.audio.sfx('ui');
      await this.game.saveSystem.deleteSlot(b.dataset.del);
      this.refreshSaveSlots(true);
    }));
    fetch('/api/health').then((r) => r.json()).then((h) => {
      const f = this.screens.menu.querySelector('#menu-footer');
      if (f) f.innerHTML = `Backend: ${esc(h.status)} · DB: ${esc(h.database ? 'SQLite OK' : 'chưa tạo')} · v${esc(h.version)}`;
    }).catch(() => {
      const f = this.screens.menu.querySelector('#menu-footer');
      if (f) f.innerHTML = 'Backend offline — save chỉ lưu cục bộ.';
    });
  }

  showMenu() {
    this.hideAll();
    this.screens.menu.style.display = 'flex';
    this.refreshSaveSlots();
    this.panels.closeAll();
  }

  showLoading(levelId) {
    this.hideAll();
    const def = LEVEL_MAP[levelId];
    this.screens.loading.querySelector('#loading-title').textContent = def ? `Chương ${levelId.slice(1)} — ${def.name}` : 'Đang tải';
    this.screens.loading.querySelector('#loading-step').textContent = def ? def.desc : '';
    this.screens.loading.querySelector('#loading-fill').style.width = '8%';
    this.screens.loading.style.display = 'flex';
    setTimeout(() => { const f = this.screens.loading.querySelector('#loading-fill'); if (f) f.style.width = '100%'; }, 60);
  }

  showHud() {
    this.hideAll();
    this.hud.show();
    this.inputFocusHack();
  }

  inputFocusHack() { /* pointer lock requested by game.enterLevel */ }

  setLetterbox(on) { this.letterbox.classList.toggle('on', !!on); }

  get chatOpen() { return this.chat.isOpen; }
  openChat() { if (this.game.state === 'playing') this.chat.open(); }
  closeChat() { this.chat.close(); }

  openOverlay(html, cls = '') {
    this.closeOverlay();
    const ov = el('div', 'ui-overlay');
    ov.innerHTML = `<div class="modal overlay-modal ${cls}"><button class="overlay-close" data-overlay-close>✕</button>${html}</div>`;
    this.root.appendChild(ov);
    ov.querySelectorAll('[data-overlay-close]').forEach((b) => b.addEventListener('click', () => this.closeOverlay()));
    this.overlay = ov;
    return ov;
  }

  closeOverlay() {
    if (this.overlay) { this.overlay.remove(); this.overlay = null; }
  }

  showPause() {
    this.screens.pause.style.display = 'flex';
    const sub = this.screens.pause.querySelector('#pause-sub');
    sub.innerHTML = '';
  }

  showDeath() { this.screens.death.style.display = 'flex'; }

  showLevelComplete(def, next, rewards) {
    this.hideAll();
    const m = this.screens.levelComplete.querySelector('#lc-modal');
    m.innerHTML = `
      <h2>HOÀN THÀNH: ${esc(def.name)}</h2>
      <p class="dim">${esc(def.desc)}</p>
      <div class="stat-list"><h3>Phần thưởng</h3>
        <ul>${rewards.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      </div>
      <div class="menu-buttons">
        <button id="lc-next">Chương Tiếp Theo: ${esc(LEVEL_MAP[next]?.name || next)}</button>
        <button id="lc-stay">Ở Lại Khám Phá</button>
        <button id="lc-menu">Về Menu Chính</button>
      </div>`;
    m.querySelector('#lc-next').addEventListener('click', () => this.game.enterLevel(next));
    m.querySelector('#lc-stay').addEventListener('click', () => { this.game.state = 'playing'; this.showHud(); this.game.input.enabled = true; this.game.input.requestPointer(); });
    m.querySelector('#lc-menu').addEventListener('click', () => this.game.toMenu());
    this.screens.levelComplete.style.display = 'flex';
  }

  showVictory(def) {
    this.hideAll();
    const p = this.game.progression;
    this.screens.victory.querySelector('#victory-stats').innerHTML = `
      <ul>
        <li>Cấp độ cuối: <b>${p.level}</b></li>
        <li>Kẻ địch đã hạ: <b>${p.stats.kills}</b></li>
        <li>Số lần ngã: <b>${p.stats.deaths}</b></li>
        <li>Thời gian chơi: <b>${formatTime(p.stats.playtime)}</b></li>
      </ul>`;
    this.screens.victory.style.display = 'flex';
  }

  showSettings() {
    const g = this.game;
    const s = g.settings;
    const host = this.openOverlay(`
      <div class="settings-box">
        <h3>Cài đặt</h3>
        <label>Chất lượng đồ họa
          <select id="set-quality">
            <option value="low">Thấp</option><option value="medium">Trung bình</option><option value="high">Cao</option><option value="ultra">Cực cao (Ultra)</option><option value="cinematic">Điện ảnh (4K)</option>
          </select></label>
        <label>Độ phân giải render
          <select id="set-res">
            <option value="auto">Tự động thích ứng</option><option value="1">100% (native)</option><option value="0.8">80%</option><option value="0.65">65%</option><option value="0.5">50%</option>
          </select></label>
        <label>FPS mục tiêu (tự động)
          <select id="set-fps">
            <option value="60">60</option><option value="120">120</option><option value="144">144</option><option value="240">240</option><option value="300">300 (max)</option>
          </select></label>
        <label>Bóng đổ
          <select id="set-shadow">
            <option value="off">Tắt</option><option value="low">Thấp (1024, gần)</option><option value="high">Cao (2048)</option><option value="ultra">Siêu (3072, xa)</option>
          </select></label>
        <label>Mật độ thực vật
          <select id="set-veg">
            <option value="low">Thưa (nhanh)</option><option value="normal">Vừa</option><option value="high">Rậm (đẹp)</option>
          </select></label>
        <label>Chất lượng nước
          <select id="set-water">
            <option value="off">Tắt</option><option value="basic">Cơ bản</option><option value="high">Cao (phản chiếu)</option>
          </select></label>
        <label>Hiệu ứng thời tiết
          <select id="set-wfx">
            <option value="off">Tắt</option><option value="basic">Cơ bản (ít hạt)</option><option value="full">Đầy đủ</option>
          </select></label>
        <label><input id="set-ao" type="checkbox"> Ambient Occlusion (GTAO)</label>
        <label><input id="set-grain" type="checkbox"> Film grain</label>
        <label>Độ nhạy chuột <input id="set-sens" type="range" min="0.4" max="2" step="0.1"></label>
        <label><input id="set-invert" type="checkbox"> Đảo trục Y</label>
        <label>Âm lượng tổng <input id="set-vm" type="range" min="0" max="1" step="0.05"></label>
        <label><input id="set-sfx-on" type="checkbox"> Hiệu ứng âm thanh (SFX)</label>
        <label>Hiệu ứng <input id="set-vs" type="range" min="0" max="1" step="0.05"></label>
        <label><input id="set-music-on" type="checkbox"> Nhạc nền</label>
        <label>Nhạc <input id="set-vu" type="range" min="0" max="1" step="0.05"></label>
        <label><input id="set-amb-on" type="checkbox"> Âm thanh môi trường</label>
        <label>Môi trường <input id="set-va" type="range" min="0" max="1" step="0.05"></label>
        <div class="menu-buttons"><button id="set-back">Quay lại</button></div>
      </div>`, 'wide');
    const q = host.querySelector('#set-quality');
    q.value = s.quality;
    host.querySelector('#set-res').value = String(s.resolutionScale);
    host.querySelector('#set-fps').value = String(s.targetFps || 60);
    host.querySelector('#set-shadow').value = s.shadowQuality || 'high';
    host.querySelector('#set-veg').value = s.vegDensity || 'normal';
    host.querySelector('#set-water').value = s.waterQuality || 'high';
    host.querySelector('#set-wfx').value = s.weatherFx || 'full';
    host.querySelector('#set-ao').checked = s.ao !== false;
    host.querySelector('#set-grain').checked = !!s.grain;
    host.querySelector('#set-sens').value = s.sensitivity;
    host.querySelector('#set-invert').checked = s.invertY;
    host.querySelector('#set-vm').value = s.volMaster;
    host.querySelector('#set-vs').value = s.volSfx;
    host.querySelector('#set-vu').value = s.volMusic;
    host.querySelector('#set-va').value = s.volAmbient;
    host.querySelector('#set-sfx-on').checked = s.sfxOn !== false;
    host.querySelector('#set-music-on').checked = s.musicOn !== false;
    host.querySelector('#set-amb-on').checked = s.ambOn !== false;
    const apply = () => {
      g.settingsStore.set({
        quality: q.value,
        resolutionScale: host.querySelector('#set-res').value,
        targetFps: parseInt(host.querySelector('#set-fps').value, 10) || 60,
        shadowQuality: host.querySelector('#set-shadow').value,
        vegDensity: host.querySelector('#set-veg').value,
        waterQuality: host.querySelector('#set-water').value,
        weatherFx: host.querySelector('#set-wfx').value,
        ao: host.querySelector('#set-ao').checked,
        grain: host.querySelector('#set-grain').checked,
        sensitivity: parseFloat(host.querySelector('#set-sens').value),
        invertY: host.querySelector('#set-invert').checked,
        volMaster: parseFloat(host.querySelector('#set-vm').value),
        volSfx: parseFloat(host.querySelector('#set-vs').value),
        volMusic: parseFloat(host.querySelector('#set-vu').value),
        volAmbient: parseFloat(host.querySelector('#set-va').value),
        sfxOn: host.querySelector('#set-sfx-on').checked,
        musicOn: host.querySelector('#set-music-on').checked,
        ambOn: host.querySelector('#set-amb-on').checked,
      }); // onChanged → applySettings + persist tự động
    };
    host.querySelectorAll('input, select').forEach((i) => i.addEventListener('change', apply));
    host.querySelector('#set-back').addEventListener('click', () => this.closeOverlay());
  }

  showHelp() {
    const groups = actionsByGroup();
    const host = this.openOverlay(`
      <div class="help-box">
        <h2>Điều Khiển</h2>
        <p class="dim">Chuột nhìn quanh · lăn chuột zoom · nhấp vào màn hình để khoá con trỏ.</p>
        <div class="help-groups">
          ${[...groups.entries()].map(([group, list]) => `
            <div class="help-group">
              <h3>${esc(group)}</h3>
              ${list.map((a) => `<div class="help-row"><kbd>${esc(a.key)}</kbd><span>${esc(a.label)}</span></div>`).join('')}
            </div>`).join('')}
        </div>
        <p class="dim">Giữ <b>chuột phải</b> đúng lúc đòn địch chạm người = <b>Parry</b> → kẻ địch mất thăng bằng.<br>
        Gõ nhanh <b>Shift</b> để né · giữ <b>Shift</b> để chạy · <b>Alt</b> hiện con trỏ chuột.</p>
        <div class="menu-buttons"><button id="help-back">Quay lại</button></div>
      </div>`, 'wide');
    host.querySelector('#help-back').addEventListener('click', () => this.closeOverlay());
  }

  hideAll() {
    for (const k in this.screens) this.screens[k].style.display = 'none';
    this.hud.hide();
  }

  notify(type, text) {
    const colors = { item: '#9ad0ff', gold: '#ffd257', xp: '#b0e0a0', level: '#ffb057', quest: '#c8a0ff',
      save: '#8ad0b0', info: '#c8d0d8', good: '#9ae08a', bad: '#ff8a7a', warn: '#ffb057', boss: '#ff6a5a' };
    const t = el('div', 'toast', `<span style="color:${colors[type] || '#fff'}">${esc(text)}</span>`);
    this.toasts.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3400);
    while (this.toasts.children.length > 6) this.toasts.firstChild.remove();
  }

  frame(dt) {
    this.hud.frame(dt);
  }
}
