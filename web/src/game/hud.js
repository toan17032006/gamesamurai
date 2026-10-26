// HUD: chỉ là chữ DOM (engine không có hệ HUD 2D). Không chứa logic game.
export function renderHud(el, { player, monsters, fps }) {
  if (!el) return;
  const alive = monsters.filter((m) => !m.dead).length;
  el.innerHTML =
    `HP ${player.hp}/${player.maxHp} &nbsp;|&nbsp; Xu ${player.coins} &nbsp;|&nbsp; Hạ ${player.kills} &nbsp;|&nbsp; ` +
    `${player.drawn ? 'Kiếm đã rút' : 'Kiếm trong bao'} &nbsp;|&nbsp; FPS ${fps} &nbsp;|&nbsp; Quái còn ${alive}`;
}
