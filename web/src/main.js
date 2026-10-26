// Entry mới — game viết lại 100% bằng engine, không còn code cũ nào.
import './styles.css';
import { Game } from './game/game.js';

const canvas = document.getElementById('game-canvas');
const game = new Game(canvas);
window.game = game;
game.bindHud(document.getElementById('hud'));

const startBox = document.getElementById('start');
document.getElementById('start-btn').addEventListener('click', () => {
  startBox.style.display = 'none';
  canvas.requestPointerLock?.();
  game.start();
});
canvas.addEventListener('click', () => {
  if (startBox.style.display === 'none') canvas.requestPointerLock?.();
});
