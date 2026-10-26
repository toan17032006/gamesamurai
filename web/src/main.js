// Entry — chỉ dựng game, gắn HUD và màn start. Mọi logic ở game/.
// Chẩn đoán màn đen: trước đây lỗi lúc dựng game hoặc lỗi runtime
// trong vòng lặp chỉ rơi vào window.__errors (phải mở F12 mới thấy),
// còn màn hình thì đen trơn. Nay mọi lỗi chưa bắt đều được viết chữ
// lên màn hình (khung start nếu chưa bấm, HUD nếu đã bấm) để thấy ngay.
import './styles.css';
import { Game } from './game/game.js';
import { attachStartScreen } from './game/boot.js';

function showError(message) {
  const bootEl = document.getElementById('boot-error');
  if (bootEl) {
    bootEl.style.display = 'block';
    bootEl.textContent = `Lỗi: ${message}`;
  }
  const hud = document.getElementById('hud');
  if (hud) hud.textContent = `Lỗi: ${message}`;
  console.error(message);
}

window.addEventListener('error', (e) => {
  showError(String((e && e.message) || e));
});

const canvas = document.getElementById('game-canvas');
let game;
try {
  game = new Game(canvas);
} catch (err) {
  // Dựng game lỗi (WebGL, engine, map...) -> hiện lỗi ngay trên khung
  // start thay vì để màn đen / nút bấm chết.
  showError(String((err && err.message) || err));
  throw err;
}
window.game = game;
game.bindHud(document.getElementById('hud'));
attachStartScreen(canvas, game);
