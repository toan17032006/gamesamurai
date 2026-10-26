// Màn hình bắt đầu + khóa con trỏ — toàn bộ DOM id của màn start
// nằm ở đây, main.js chỉ còn 3 dòng dựng game.
export function attachStartScreen(canvas, game) {
  const startBox = document.getElementById('start');
  const startBtn = document.getElementById('start-btn');
  startBtn.addEventListener('click', () => {
    startBox.style.display = 'none';
    canvas.requestPointerLock?.();
    game.start();
  });
  canvas.addEventListener('click', () => {
    if (startBox.style.display === 'none') canvas.requestPointerLock?.();
  });
}
