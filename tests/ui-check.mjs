import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = process.env.E2E_URL || 'http://127.0.0.1:8080';
const OUT = 'docs/screenshots';
fs.mkdirSync(OUT, { recursive: true });
let fails = 0;
const check = (name, cond, extra = '') => {
  if (!cond) fails++;
  console.log(`${cond ? '✔' : '✖'} ${name}${extra ? ` — ${extra}` : ''}`);
};

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(String(e)));
await page.addInitScript(() => {
  localStorage.setItem('samurai_settings_v1', JSON.stringify({
    quality: 'low', resolutionScale: '0.6', targetFps: 60, ao: false, grain: false,
    shadowQuality: 'off', vegDensity: 'normal', waterQuality: 'basic', weatherFx: 'basic',
    musicOn: false, sfxOn: false, ambOn: false,
  }));
});
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);
check('menu hiển thị', await page.locator('.menu-screen').isVisible());
await page.screenshot({ path: `${OUT}/ui-v2-menu.png` });

await page.getByRole('button', { name: 'Chơi Mới (Chiến Dịch)' }).click();
await page.waitForTimeout(6500);
let st = await page.evaluate(() => ({ state: window.game?.state, region: window.game?.world?.def?.name }));
check('vào game chiến dịch', st.state === 'playing', JSON.stringify(st));

const hud = await page.evaluate(() => ({
  party: document.querySelectorAll('#hud-party .party-card').length,
  skill: document.querySelector('#hud-skillname')?.textContent,
  ult: document.querySelector('#hud-ultname')?.textContent,
  item: document.querySelector('#hud-itemname')?.textContent,
  char: window.game.player.character?.id,
}));
check('HUD đội 4 người + E/Q/Z', hud.party === 4 && hud.skill !== '—' && hud.ult !== '—', JSON.stringify(hud));
await page.screenshot({ path: `${OUT}/ui-v2-hud.png` });

async function openKey(key, selector, label) {
  await page.keyboard.press(key);
  await page.waitForTimeout(450);
  const ok = await page.locator(selector).isVisible();
  check(`${label} mở đúng`, ok);
  return ok;
}
async function closeEsc() {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  const closed = !(await page.locator('.panels').isVisible());
  check('Esc đóng panel', closed);
}

await openKey('KeyC', '.char-layout', 'C nhân vật');
await page.screenshot({ path: `${OUT}/ui-v2-character.png` });
await page.locator('.aspect-card[data-aspect="1"]').click();
await page.waitForTimeout(900);
check('đổi nhân vật từ panel (2 = Hayate)', (await page.evaluate(() => window.game.player.character.id)) === 'hayate');
await closeEsc();

await openKey('KeyB', '.inv-layout', 'B túi đồ');
await closeEsc();
await openKey('KeyJ', '.quest-layout', 'J nhiệm vụ');
await closeEsc();
await openKey('KeyM', '.map-layout', 'M bản đồ');
await closeEsc();
await openKey('F1', '.handbook-layout', 'F1 sổ tay');
await page.screenshot({ path: `${OUT}/ui-v2-handbook.png` });
await closeEsc();
await openKey('F2', '.mp-layout', 'F2 nhiều người');
await closeEsc();
await openKey('KeyL', '.formation-layout', 'L đội hình');
await page.screenshot({ path: `${OUT}/ui-v2-formation.png` });
await closeEsc();
await openKey('Tab', '.quick-layout', 'Tab vòng nhanh');
await page.screenshot({ path: `${OUT}/ui-v2-quickwheel.png` });
await page.keyboard.press('Tab');
await page.waitForTimeout(400);
check('Tab đóng vòng nhanh', !(await page.locator('.panels').isVisible()));

// chat
await page.keyboard.press('Enter');
await page.waitForTimeout(400);
check('Enter mở chat', await page.locator('.chat-overlay.open').isVisible());
await page.locator('#chat-input').fill('xin chào đội');
await page.keyboard.press('Enter');
await page.waitForTimeout(400);
const chatText = await page.locator('#chat-log').innerText();
check('chat gửi tin', /xin chào đội/.test(chatText), chatText.slice(-60));
await page.screenshot({ path: `${OUT}/ui-v2-chat.png` });
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
check('Esc đóng chat', !(await page.locator('.chat-overlay.open').isVisible()));

// party hotkeys 1-4
const ids = [];
for (const [key, id] of [['Digit1', 'kensei'], ['Digit3', 'onmyoji'], ['Digit4', 'tetsu'], ['Digit2', 'hayate']]) {
  await page.keyboard.press(key);
  await page.waitForTimeout(700);
  ids.push(await page.evaluate(() => window.game.player.character.id));
}
check('phím 1-4 đổi nhân vật', ids.join(',') === 'kensei,onmyoji,tetsu,hayate', ids.join(','));

// aim
await page.keyboard.press('KeyR');
await page.waitForTimeout(500);
const aim = await page.evaluate(() => ({ aim: window.game.cameraRig.aimMode, ret: document.querySelector('#hud-reticle').classList.contains('on') }));
check('R bật ngắm + reticle', aim.aim && aim.ret, JSON.stringify(aim));
await page.screenshot({ path: `${OUT}/ui-v2-aim.png` });
await page.keyboard.press('KeyR');
await page.waitForTimeout(300);

// vision (giữ chuột giữa)
await page.mouse.move(720, 450);
await page.mouse.down({ button: 'middle' });
await page.waitForTimeout(600);
const vision = await page.evaluate(() => document.querySelector('.hud').classList.contains('vision'));
check('giữ chuột giữa bật thị giác nguyên tố', vision);
await page.screenshot({ path: `${OUT}/ui-v2-vision.png` });
await page.mouse.up({ button: 'middle' });
await page.waitForTimeout(300);
check('thả chuột giữa tắt thị giác', !(await page.evaluate(() => document.querySelector('.hud').classList.contains('vision'))));

// E/Q
const skill = await page.evaluate(() => {
  const p = window.game.player;
  const e = p.character.skills.elemental;
  p.stamina = p.maxStamina;
  const before = p.stamina;
  p.trySkill('elemental');
  return { before, after: p.stamina, cd: p.skillCd[e.id] || 0, anim: p.animator?.current?.name };
});
check('E dùng kỹ năng nguyên tố + hồi chiêu', skill.after < skill.before && skill.cd > 0, JSON.stringify(skill));
await page.waitForTimeout(2600);
await page.evaluate(() => { const p = window.game.player; p.state = 'move'; p.combat.attack = null; p.stamina = p.maxStamina; p.trySkill('ultimate'); });
await page.waitForTimeout(500);
const ultCd = await page.evaluate(() => {
  const p = window.game.player; const q = p.character.skills.ultimate;
  return p.skillCd[q.id] || 0;
});
check('Q dùng kỹ năng nộ + hồi chiêu', ultCd > 0, `cd=${ultCd}`);

// Z quick item, T meditate, Alt cursor, Shift dodge, Space jump, W move
const before = await page.evaluate(() => ({ hp: window.game.player.hp, sta: window.game.player.stamina }));
await page.keyboard.press('KeyZ');
await page.waitForTimeout(300);
check('Z dùng vật phẩm nhanh không lỗi', pageErrors.length === 0, `hp ${before.hp}`);
await page.waitForTimeout(2600);
await page.evaluate(() => { const p = window.game.player; p.state = 'move'; p.combat.attack = null; });
await page.keyboard.press('KeyT');
await page.waitForTimeout(400);
check('T thiền định', await page.evaluate(() => window.game.player.meditating));
await page.keyboard.down('KeyW');
await page.waitForTimeout(1200);
await page.keyboard.up('KeyW');
const meditateOff = await page.evaluate(() => window.game.player.meditating);
check('di chuyển huỷ thiền', !meditateOff);

const p0 = await page.evaluate(() => ({ x: window.game.player.pos.x, z: window.game.player.pos.z }));
await page.keyboard.down('KeyS');
await page.waitForTimeout(2000);
const p1 = await page.evaluate(() => ({ x: window.game.player.pos.x, z: window.game.player.pos.z }));
await page.keyboard.up('KeyS');
const moved = Math.hypot(p1.x - p0.x, p1.z - p0.z);
check('W/S di chuyển', moved > 0.3, `d=${moved.toFixed(2)}`);

const y0 = await page.evaluate(() => window.game.player.pos.y);
await page.keyboard.press('Space');
await page.waitForTimeout(500);
const jumped = await page.evaluate(() => window.game.player.pos.y > window.game.world.groundAt(window.game.player.pos.x, window.game.player.pos.z) + 0.05);
check('Space nhảy', jumped, `y0=${y0.toFixed(1)}`);

await page.keyboard.down('Alt');
await page.waitForTimeout(200);
check('giữ Alt hiện con trỏ', await page.evaluate(() => window.game.input.altCursor));
await page.keyboard.up('Alt');

// walk/sprint
await page.keyboard.down('ControlLeft');
await page.keyboard.down('KeyW');
await page.waitForTimeout(500);
const walkMode = await page.evaluate(() => window.game.player.moveMode);
await page.keyboard.up('KeyW');
await page.keyboard.up('ControlLeft');
check('giữ Ctrl đi bộ', walkMode === 'walk', walkMode);
await page.keyboard.down('ShiftLeft');
await page.keyboard.down('KeyW');
await page.waitForTimeout(500);
const runMode = await page.evaluate(() => window.game.player.moveMode);
await page.keyboard.up('KeyW');
await page.keyboard.up('ShiftLeft');
check('giữ Shift chạy nhanh', runMode === 'sprint', runMode);

// pause overlay
await page.keyboard.press('Escape');
await page.waitForTimeout(500);
check('Esc mở tạm dừng', await page.evaluate(() => window.game.state === 'paused'));
await page.screenshot({ path: `${OUT}/ui-v2-pause.png` });

check('không có pageerror', pageErrors.length === 0, pageErrors.join(' | ').slice(0, 400));
console.log(`\n${fails === 0 ? 'PASS' : 'FAIL'} — ${fails} lỗi`);
await browser.close();
process.exit(fails ? 1 : 0);
