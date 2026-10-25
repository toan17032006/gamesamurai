import { chromium } from 'playwright';
import fs from 'node:fs';
const OUT = 'docs/screenshots';
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox', '--disable-dev-shm-usage'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const errs = []; page.on('pageerror', (e) => errs.push(String(e)));
await page.addInitScript(() => localStorage.setItem('samurai_settings_v1', JSON.stringify({ quality: 'low', resolutionScale: '0.6', targetFps: 60, ao: false, grain: false, shadowQuality: 'off', vegDensity: 'normal', waterQuality: 'basic', weatherFx: 'basic', musicOn: false, sfxOn: false, ambOn: false })));
await page.goto('http://127.0.0.1:8080', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);
await page.getByRole('button', { name: 'Chơi Mới (Chiến Dịch)' }).click();
await page.waitForTimeout(6500);
await page.evaluate(() => {
  document.querySelector('.hud').style.display = 'none';
  const g = window.game, p = g.player;
  g.cameraRig.dist = 3.0; g.cameraRig.pitch = 0.02; g.cameraRig.yaw = p.yaw + 0.3;
});

const variants = [
  { name: 'a-current', anchor: 1.82, idle: null },
  { name: 'b-low', anchor: 1.42, idle: { armR_sh: [-0.26, -0.02, -0.3], armR_el: [-0.55, 0, 0], armR_hand: [0.1, 0, 0], armL_sh: [-0.42, 0.12, 0.44], armL_el: [-0.8, 0, 0.06], armL_hand: [0.06, 0, 0], torso: [null, 0.1, null] } },
  { name: 'c-cant', anchor: 1.3, idle: { armR_sh: [-0.3, -0.06, -0.34], armR_el: [-0.5, 0, 0], armR_hand: [0.08, 0, -0.25], armL_sh: [-0.4, 0.14, 0.46], armL_el: [-0.78, 0, 0.05], armL_hand: [0.05, 0, -0.12], torso: [null, 0.08, null] } },
  { name: 'd-side', anchor: 1.15, idle: { armR_sh: [-0.16, 0.16, -0.5], armR_el: [-0.45, 0, 0], armR_hand: [0.05, 0, -0.35], armL_sh: [-0.3, 0.2, 0.5], armL_el: [-0.65, 0, 0], armL_hand: [0.02, 0, -0.15], torso: [null, 0.04, null] } },
];

for (const v of variants) {
  await page.evaluate((v) => {
    const g = window.game, p = g.player;
    if (v.idle) Object.assign(window.__stance.idle, v.idle);
    p.rig.weaponAnchor.rotation.x = v.anchor;
    // clear particle clutter near the player
    g.particles?.clear?.();
  }, v);
  await page.waitForTimeout(2200);
  const info = await page.evaluate(() => {
    const g = window.game, p = g.player, rig = p.rig;
    const V = (o) => { const v = new (o.position.constructor)(); o.getWorldPosition(v); return [v.x, v.y, v.z].map((n) => +n.toFixed(2)); };
    return { head: V(rig.joints.head), handR: V(rig.joints.armR_hand), handL: V(rig.joints.armL_hand), tip: V(rig.trailTip), base: V(rig.trailBase), anchor: +rig.weaponAnchor.rotation.x.toFixed(2) };
  });
  console.log(v.name, JSON.stringify(info));
  await page.screenshot({ path: `${OUT}/stance-${v.name}.png`, clip: { x: 470, y: 190, width: 500, height: 560 } });
}
console.log('errors', JSON.stringify(errs));
await browser.close();
