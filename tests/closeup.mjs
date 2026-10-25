import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = process.env.E2E_URL || 'http://127.0.0.1:8080';
const OUT = 'docs/screenshots';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox', '--disable-dev-shm-usage'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(String(e)));
await page.addInitScript(() => {
  localStorage.setItem('samurai_settings_v1', JSON.stringify({
    quality: 'low', resolutionScale: '0.6', targetFps: 60, ao: false, grain: false,
    shadowQuality: 'off', vegDensity: 'normal', waterQuality: 'basic', weatherFx: 'basic',
    musicOn: false, sfxOn: false, ambOn: false,
  }));
});
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);
await page.getByRole('button', { name: 'Chơi Mới (Chiến Dịch)' }).click();
await page.waitForTimeout(6500);

// HUD close-up + layout metrics
const metrics = await page.evaluate(() => {
  const r = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const b = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), display: cs.display, opacity: cs.opacity, color: cs.color, bg: cs.backgroundImage.slice(0, 40) };
  };
  return { bl: r('.hud-bl'), vitals: r('.vitals'), bars: r('.bars'), hp: r('.hpbar'), hpfill: r('.hpfill'), sta: r('.stabar'), badge: r('.level-badge'), party: r('.party-bar'), abil: r('.ability-bar') };
});
console.log('HUD metrics', JSON.stringify(metrics, null, 1));
await page.locator('.hud-bl').screenshot({ path: `${OUT}/closeup-hud-bl.png` });

// Animation close-ups (hide HUD)
await page.evaluate(() => { document.querySelector('.hud').style.display = 'none'; });
const zoom = async (yawOff = 0.25, dist = 3.1, pitch = 0.02) => page.evaluate(([yo, d, pi]) => {
  const g = window.game, p = g.player;
  g.cameraRig.dist = d; g.cameraRig.pitch = pi; g.cameraRig.yaw = p.yaw + yo;
}, [yawOff, dist, pitch]);
const clip = { x: 470, y: 190, width: 500, height: 560 };

const chars = ['kensei', 'hayate', 'onmyoji', 'tetsu'];
for (let i = 0; i < 4; i++) {
  await page.evaluate((idx) => { window.game.switchCharacter(idx); }, i);
  await page.waitForTimeout(900);
  await zoom();
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/anim-${i}-${chars[i]}-idle.png`, clip });
  // attack
  await page.evaluate(() => { const p = window.game.player; p.tryAttack('light'); });
  await page.waitForTimeout(350);
  await zoom(0.15, 2.9, 0.3);
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${OUT}/anim-${i}-${chars[i]}-attack.png`, clip });
  await page.waitForTimeout(1600);
  // skill
  await page.evaluate(() => { const p = window.game.player; p.state = 'move'; p.combat.attack = null; p.trySkill('elemental'); });
  await page.waitForTimeout(350);
  await zoom(0.2, 3.1, 0.06);
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${OUT}/anim-${i}-${chars[i]}-skill.png`, clip });
  await page.waitForTimeout(1800);
  // run pose
  await page.keyboard.down('ShiftLeft');
  await page.keyboard.down('KeyW');
  await page.waitForTimeout(500);
  await zoom(0.35, 3.2, 0.08);
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${OUT}/anim-${i}-${chars[i]}-run.png`, clip });
  await page.keyboard.up('KeyW');
  await page.keyboard.up('ShiftLeft');
  await page.waitForTimeout(500);
}

// NPC close-up: stand in front of first humanoid NPC
const npcInfo = await page.evaluate(() => {
  const g = window.game;
  const n = g.npcs.find((x) => !x.disposed && x.rig && x.name && !x.isBoss) || g.npcs[0];
  if (!n) return null;
  const p = g.player;
  const dx = 0, dz = 2.6;
  p.pos.set(n.pos.x, g.world.groundAt(n.pos.x, n.pos.z + dz) + 1, n.pos.z + dz);
  p.vel.set(0, 0, 0);
  p.yaw = Math.atan2(n.pos.x - p.pos.x, n.pos.z - p.pos.z);
  g.cameraRig.yaw = p.yaw; g.cameraRig.dist = 2.4; g.cameraRig.pitch = 0.12;
  return { name: n.name, kind: n.kind, faction: n.faction };
});
console.log('npc', JSON.stringify(npcInfo));
await page.waitForTimeout(1200);
await page.screenshot({ path: `${OUT}/anim-npc-idle.png`, clip });

// NPC in combat state: aggro it if bandit/oni
await page.evaluate(() => {
  const g = window.game;
  const n = g.npcs.find((x) => x.combat && !x.combat.dead && x.faction && !['player', 'samurai_ally', 'villager'].includes(x.faction));
  if (n) { n.aggro = true; n.combat.target = g.player; n.state = 'chase'; n.tryAttack?.('light'); }
});
await page.waitForTimeout(700);
await page.screenshot({ path: `${OUT}/anim-npc-attack.png`, clip });

console.log('errors:', JSON.stringify(errs));
await browser.close();
