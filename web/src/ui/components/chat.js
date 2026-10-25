// Chat overlay component: Enter mở, Enter gửi, Esc đóng. Không chặn gameplay keys khi đóng.
import { esc } from '../../core/utils.js';
import { PARTY } from '../../data/characters.js';

const MAX_LINES = 8;

export class ChatOverlay {
  constructor(game) {
    this.game = game;
    this.messages = [];
    this.root = document.createElement('div');
    this.root.className = 'chat-overlay';
    this.root.innerHTML = `
      <div class="chat-log" id="chat-log"></div>
      <div class="chat-input-row">
        <span class="chat-prefix">›</span>
        <input id="chat-input" maxlength="140" autocomplete="off" spellcheck="false"
          placeholder="Nhập tin nhắn · /help để xem lệnh">
      </div>`;
    document.getElementById('ui').appendChild(this.root);
    this.input = this.root.querySelector('#chat-input');
    this.log = this.root.querySelector('#chat-log');
    this.input.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') { e.preventDefault(); this.submit(); }
      else if (e.key === 'Escape') { e.preventDefault(); this.close(); }
    });
    this.root.addEventListener('click', (e) => e.stopPropagation());
    this.push('Hệ thống', 'Chào mừng trở lại, lãng khách. Gõ /help để xem lệnh.', 'sys');
  }

  get isOpen() { return this.root.classList.contains('open'); }

  open() {
    if (this.isOpen) return;
    const g = this.game;
    g.ui.panels.closeAll();
    this.root.classList.add('open');
    g.input.chatMode = true;
    g.input.enabled = false;
    g.input.releasePointer();
    this.input.value = '';
    setTimeout(() => this.input.focus(), 30);
  }

  close() {
    if (!this.isOpen) return;
    this.root.classList.remove('open');
    const g = this.game;
    g.input.chatMode = false;
    this.input.blur();
    if (g.state === 'playing') {
      g.input.enabled = true;
      g.input.requestPointer();
    }
  }

  push(author, text, cls = '') {
    const t = new Date();
    const time = `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
    this.messages.push({ author, text, cls, time });
    if (this.messages.length > 40) this.messages.shift();
    this.render();
  }

  render() {
    const lines = this.messages.slice(-MAX_LINES);
    this.log.innerHTML = lines.map((m) => `
      <div class="chat-line ${m.cls}">
        <span class="chat-time">${m.time}</span>
        <span class="chat-author">${esc(m.author)}:</span>
        <span class="chat-text">${esc(m.text)}</span>
      </div>`).join('');
    this.log.scrollTop = this.log.scrollHeight;
  }

  submit() {
    const text = this.input.value.trim();
    if (!text) { this.close(); return; }
    this.input.value = '';
    if (text.startsWith('/')) { this.command(text); return; }
    this.push('Bạn', text, 'me');
    // câu đáp nhẹ của đội để khung chat có phản hồi khi chơi đơn
    const c = this.game.player?.character;
    if (c) {
      const replies = {
        kensei: 'Gió đang đổi chiều. Đi thôi.',
        hayate: 'Ta giữ cung, ngươi cứ tiến.',
        onmyoji: 'Ta thấy khí âm đang tụ phía trước.',
        tetsu: 'Cứ đứng sau lưng ta.',
      };
      setTimeout(() => this.push(c.name, replies[c.id] || '...', 'ally'), 420);
    }
  }

  command(text) {
    const g = this.game;
    const [cmd, ...rest] = text.slice(1).split(/\s+/);
    switch (cmd.toLowerCase()) {
      case 'help':
        this.push('Hệ thống', '/party đội hình · /where vị trí · /seed seed thế giới · /clear xoá chat', 'sys');
        break;
      case 'party':
        this.push('Hệ thống', 'Đội: ' + PARTY.map((c, i) => `${i + 1} ${c.name}`).join(' · '), 'sys');
        break;
      case 'where': {
        const p = g.player;
        this.push('Hệ thống', p ? `Vị trí: ${p.pos.x.toFixed(1)}, ${p.pos.z.toFixed(1)}` : 'Chưa vào thế giới.', 'sys');
        break;
      }
      case 'seed':
        this.push('Hệ thống', g.infinite?.seed ? `Seed: ${g.infinite.seed}` : 'Chế độ chiến dịch không dùng seed.', 'sys');
        break;
      case 'clear':
        this.messages = [];
        this.render();
        break;
      default:
        this.push('Hệ thống', `Không rõ lệnh /${esc(cmd)}. Gõ /help.`, 'warn');
    }
    if (rest.length === 0) this.input.focus();
  }
}
