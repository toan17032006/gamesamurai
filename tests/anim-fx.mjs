import { chromium } from 'playwright';
import fs from 'node:fs';
const OUT = 'docs/screenshots';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox', '--disable-dev-shm-usage'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const errs = []; page.on('pageerror', (e) => errs.push(String(e)));
await page.addInitScript(() => localStorage.setItem('samurai_settings_v1', JSON.stringify({ quality: 'low', resolutionScale: '0.6', targetFps: 60, ao: false, grain: false, shadowQuality: 'off', vegDensity: 'normal', waterQuality: 'basic', weatherFx: 'basic', musicOn: false, sfxOn: false, ambOn: false })));
await page.goto('http://127.0.0.1:8080', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);
await page.getByRole('button', { name: 'Chơi Mới (Chiến Dịch)' }).click();
await page.waitForTimeout(7000);
await page.evaluate(() => { document.querySelector('.hud').style.display = 'none'; });
const clip = { x: 470, y: 170, width: 520, height: 600 };

// --- player attacks seen from the front-side (rotate camera after the player faces its attack direction)
for (const [i, name] of [[0, 'kensei'], [3, 'tetsu']]) {
  await page.evaluate((idx) => {
    const g = window.game;
    g.switchCharacter(idx);
    g.particles?.clear?.();
  }, i);
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    const g = window.game, p = g.player;
    g.cameraRig.dist = 2.6; g.cameraRig.pitch = 0.1;
    p.tryAttack('light');
    g.cameraRig.yaw = p.yaw + 0.65;
  });
  await page.waitForTimeout(220);
  await page.screenshot({ path: `${OUT}/fx-${i}-${name}-attack-a.png`, clip });
  await page.waitForTimeout(320);
  await page.screenshot({ path: `${OUT}/fx-${i}-${name}-attack-b.png`, clip });
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    const g = window.game, p = g.player;
    p.state = 'move'; p.combat.attack = null;
    p.trySkill('elemental');
    g.cameraRig.yaw = p.yaw + 0.65;
  });
  await page.waitForTimeout(420);
  await page.screenshot({ path: `${OUT}/fx-${i}-${name}-skill.png`, clip });
  await page.waitForTimeout(2200);
}

// --- NPC seen from ~3m with the player's back in the foreground
const npcInfo = await page.evaluate(() => {
  const g = window.game, p = g.player;
  const n = g.npcs.find((x) => x.name === 'Sơn tặc' && !x.disposed) || g.npcs.find((x) => !x.disposed);
  if (!n) return null;
  n.yaw = 0; // face +z toward the player
  p.pos.set(n.pos.x, g.world.groundAt(n.pos.x, n.pos.z + 3.2) + 1, n.pos.z + 3.2);
  p.vel.set(0, 0, 0);
  p.yaw = Math.atan2(n.pos.x - p.pos.x, n.pos.z - p.pos.z);
  g.cameraRig.yaw = p.yaw + Math.PI + 0.3; g.cameraRig.dist = 3.2; g.cameraRig.pitch = 0.16;
  g.particles?.clear?.();
  return { name: n.name, weapon: n.rig?.hasWeapon?.() };
});
console.log('npc', JSON.stringify(npcInfo));
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT}/fx-npc-idle.png` });

console.log('errors', JSON.stringify(errs));
await browser.close();
