// Vòng truy cập nhanh (Tab): lưới biểu tượng điều hướng, không phải túi đồ.
import { PARTY } from '../../data/characters.js';

const ENTRIES = [
  { id: 'inventory', key: 'B', label: 'Túi đồ' },
  { id: 'character', key: 'C', label: 'Nhân vật' },
  { id: 'quests', key: 'J', label: 'Nhiệm vụ' },
  { id: 'map', key: 'M', label: 'Bản đồ' },
  { id: 'handbook', key: 'F1', label: 'Sổ tay' },
  { id: 'formation', key: 'L', label: 'Đội hình' },
  { id: 'multiplayer', key: 'F2', label: 'Nhiều người' },
  { id: 'settings', key: 'Esc', label: 'Tạm dừng' },
];

export class Quickwheel {
  constructor(panels) { this.panels = panels; }

  render(body) {
    const g = this.panels.game;
    const active = g.player?.characterIndex ?? 0;
    body.innerHTML = `
      <div class="quick-layout">
        <div class="quick-head">
          <h2>Vòng Truy Cập Nhanh</h2>
          <p class="dim">Chọn để mở · Tab hoặc Esc để đóng</p>
        </div>
        <div class="quick-grid">
          ${ENTRIES.map((e) => `
            <button class="quick-slot" data-quick="${e.id}">
              <span class="quick-glyph${e.key.length > 1 ? ' sm' : ''}">${e.key}</span>
              <span class="quick-label">${e.label}</span>
            </button>`).join('')}
        </div>
        <div class="quick-party">
          ${PARTY.map((c, i) => `
            <button class="quick-aspect ${i === active ? 'active' : ''}" data-aspect="${i}" style="--cc:${c.css}">
              <span class="qa-key">${i + 1}</span>
              <span class="qa-portrait">${c.portrait}</span>
              <span class="qa-name">${c.name}</span>
              <span class="qa-el">${c.element}</span>
            </button>`).join('')}
        </div>
        <div class="quick-actions">
          <button data-quick-action="item"><b>Z</b> Dùng vật phẩm nhanh</button>
          <button data-quick-action="aim"><b>R</b> Bật / tắt ngắm</button>
          <button data-quick-action="meditate"><b>T</b> Thiền định</button>
        </div>
      </div>`;
    body.querySelectorAll('[data-quick]').forEach((b) => b.addEventListener('click', () => {
      if (b.dataset.quick === 'settings') {
        this.panels.closeAll();
        g.ui.showSettings('pause');
        return;
      }
      this.panels.show(b.dataset.quick);
    }));
    body.querySelectorAll('[data-aspect]').forEach((b) => b.addEventListener('click', () => {
      if (g.switchCharacter(Number(b.dataset.aspect))) this.render(body);
    }));
    body.querySelectorAll('[data-quick-action]').forEach((b) => b.addEventListener('click', () => {
      const act = b.dataset.quickAction;
      if (act === 'item') g.inventory.quickUse();
      if (act === 'aim') g.player.toggleAim();
      if (act === 'meditate') g.player.toggleMeditate();
      this.render(body);
    }));
  }
}
