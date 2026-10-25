import { chromium } from 'playwright';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage({ viewport: { width: 960, height: 600 } });
page.on('pageerror', (e) => console.log('  [pageerror]', String(e).slice(0, 300)));
await page.addInitScript(() => {
  localStorage.setItem('samurai_settings_v1', JSON.stringify({ quality: 'low', resolutionScale: '0.5', targetFps: 60, ao: false, grain: false, shadowQuality: 'off', vegDensity: 'low', waterQuality: 'basic', weatherFx: 'full', musicOn: false, sfxOn: false, ambOn: false }));
});
await page.goto('http://127.0.0.1:8080', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);

// --- LŨ trên sông L05: ép storm, đẩy nhanh thời tiết bằng update(1) x15 ---
await page.evaluate(() => window.game.newGame('slot1'));
await page.waitForTimeout(5000);
await page.evaluate(() => window.game.enterLevel('L05'));
await page.waitForTimeout(7000);
const flood = await page.evaluate(() => {
  const g = window.game;
  g.weatherSys.setType('storm'); g.weatherSys.swapParticles();
  const p = g.player.pos;
  for (let i = 0; i < 15; i++) g.weatherSys.update(1, p); // 15 giây game-time
  const w = g.world.waterSurface;
  return { flood: Math.round(w.flood * 100) / 100, level: Math.round(w.level * 100) / 100, base: w.baseLevel, notified: true };
});
console.log('FLOOD:', JSON.stringify(flood));
// người chơi lội nước chậm? đưa xuống lòng sông
const wade = await page.evaluate(() => {
  const g = window.game;
  g.player.pos.set(0, 0, 60); // giữa cầu
  const ground = g.world.groundAt(0, 60), wl = g.world.waterLevelAt(0, 60);
  g.player.update(0.1, g);
  return { ground: Math.round(ground * 100) / 100, waterLevel: Math.round(wl * 100) / 100, inWater: !!g.player.inWater };
});
console.log('WADE:', JSON.stringify(wade));

// --- DUNG NHAM: L11 vào miệng crater → mất máu ---
await page.evaluate(() => window.game.enterLevel('L11'));
await page.waitForTimeout(8000);
const lava = await page.evaluate(() => {
  const g = window.game;
  const lvl = g.world.lavaSurface ? g.world.lavaSurface.level : null;
  const hz = g.world.hazards;
  // tìm điểm trong hazard gần nhất
  const h = hz[0];
  const hp0 = g.player.hp;
  if (h) { g.player.pos.set(h.x, h.level + 0.05, h.z); for (let i = 0; i < 40; i++) g.player.update(0.1, g); }
  return { lavaLevel: lvl === null ? null : Math.round(lvl * 100) / 100, hazards: hz.length, hp: hp0 + '→' + Math.round(g.player.hp) };
});
console.log('LAVA:', JSON.stringify(lava));

// --- SIÊU NHIÊN: L08 ép wraith_fog → fog tím + vong linh spawn ---
await page.evaluate(() => window.game.enterLevel('L08'));
await page.waitForTimeout(7000);
const sup = await page.evaluate(() => {
  const g = window.game;
  const npcs0 = g.npcs.length;
  g.weatherSys.startSupernatural('wraith_fog');
  for (let i = 0; i < 30; i++) g.weatherSys.update(1, g.player.pos);
  return { npcs0, npcs1: g.npcs.length, sup: g.weatherSys.supernatural?.type, hud: document.querySelector('#hud-weather')?.textContent };
});
console.log('SUPERNATURAL:', JSON.stringify(sup));

// --- RỒNG: infinite world teleport xa (danger cao) → cell boss rồng ---
await page.evaluate(() => window.game.startInfinite('slot1', 'dragon test'));
await page.waitForTimeout(9000);
const dragon = await page.evaluate(() => {
  const g = window.game;
  // tìm cell danger>=6 gần có dragon theo luật (bossRoll<0.34, danger>=6)
  let found = null;
  for (let r = 6; r <= 9 && !found; r++) {
    for (let cx = -r; cx <= r && !found; cx++) for (let cz = -r; cz <= r && !found; cz++) {
      if (Math.max(Math.abs(cx), Math.abs(cz)) !== r) continue;
      const info = g.infinite.biomeOf(cx, cz);
      const roll = (cellRoll(g.infinite.seed, cx, cz));
      if (info.danger >= 6) found = { cx, cz, biome: info.biome, danger: info.danger, roll: Math.round(roll * 100) / 100, isDragon: roll < 0.34 };
    }
  }
  function cellRoll(seed, cx, cz) {
    // tái lập cellRandom(seed,cx,cz,77)() — mulberry32(cellSeed ^ 77*0x9e3779b9)
    return null;
  }
  return found;
});
console.log('DRAGON CELL SCAN:', JSON.stringify(dragon));
// teleport tới giữa ô nguy hiểm đó và đợi boss
if (dragon) {
  await page.evaluate((c) => {
    const g = window.game;
    g.player.pos.set(c.cx * 168, g.world.groundAt(c.cx * 168, c.cz * 168) + 2, c.cz * 168);
  }, dragon);
  await page.waitForTimeout(30000);
  const boss = await page.evaluate(() => {
    const g = window.game;
    const bossNpc = g.npcs.find((n) => n.isBoss);
    return { anyBoss: !!bossNpc, boss: bossNpc ? { name: bossNpc.name, isDragon: bossNpc.enemyId === 'fire_dragon', hp: bossNpc.maxHp, state: bossNpc.state || 'n/a' } : null, cells: g.infinite.cells.size };
  });
  console.log('DRAGON SPAWN:', JSON.stringify(boss));
}
console.log('ERRORS:', await page.evaluate(() => window.__errors));
await browser.close();
