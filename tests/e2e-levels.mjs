// Vào lần lượt cả 15 chương campaign — xác minh mọi bản đồ nền build được, không lỗi.
import { chromium } from 'playwright';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage({ viewport: { width: 960, height: 600 } });
page.on('pageerror', (e) => console.log('  [pageerror]', String(e).slice(0, 250)));
await page.addInitScript(() => {
  localStorage.setItem('samurai_settings_v1', JSON.stringify({ quality: 'low', resolutionScale: '0.5', targetFps: 60, ao: false, grain: false, shadowQuality: 'off', vegDensity: 'low', waterQuality: 'basic', weatherFx: 'basic', musicOn: false, sfxOn: false, ambOn: false }));
});
await page.goto('http://127.0.0.1:8080', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);
await page.evaluate(() => window.game.newGame('slot1'));
await page.waitForTimeout(6000);
let fails = 0;
for (let i = 1; i <= 15; i++) {
  const id = 'L' + String(i).padStart(2, '0');
  const r = await page.evaluate(async (id) => {
    try {
      await window.game.enterLevel(id);
      return {
        ok: window.game.state === 'playing',
        region: window.game.world.def?.name,
        builder: window.game.world.def?.builder,
        water: window.game.world.waterSurface?.level ?? null,
        npcs: window.game.npcs.length, creatures: window.game.creatures.length,
        boss: window.game.currentBoss?.name || null,
      };
    } catch (e) { return { ok: false, err: String(e && e.message || e) }; }
  }, id);
  const errs = await page.evaluate(() => window.__errors.splice(0));
  const ok = r.ok && errs.length === 0;
  if (!ok) fails++;
  console.log(`${ok ? '✔' : '✖'} ${id} — ${r.region || r.err} [${r.builder}] water=${r.water ?? '—'} npc=${r.npcs} creature=${r.creatures} boss=${r.boss || '—'}${errs.length ? ' errors=' + JSON.stringify(errs) : ''}`);
}
console.log(fails === 0 ? '\n15/15 CHƯƠNG ĐẠT' : `\n${fails} chương kém đạt`);
await browser.close();
process.exit(fails === 0 ? 0 : 1);
