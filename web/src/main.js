// Entry — chỉ dựng game, gắn HUD và màn start. Mọi logic ở game/.
import './styles.css';
import { Game } from './game/game.js';
import { attachStartScreen } from './game/boot.js';

const canvas = document.getElementById('game-canvas');
const game = new Game(canvas);
window.game = game;
game.bindHud(document.getElementById('hud'));
attachStartScreen(canvas, game);
