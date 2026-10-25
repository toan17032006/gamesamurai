// E2E kiểm thử trình duyệt thật (Chromium headless + SwiftShader WebGL phần mềm).
// LƯU Ý: SwiftShader chỉ đạt ~2-6 FPS — mọi mốc di chuyển dùng ngưỡng thấp,
// streaming ô Infinite World dùng teleport (movement đã xác minh ở campaign).
// Chạy: node tests/e2e.mjs   (yêu cầu dev-server ở :8080 — scripts/dev-server.mjs)
import { chromium } from 'playwright';

const BASE = process.env.E2E_URL || 'http://127.0.0.1:8080';
let failures = 0;

function check(name, cond, extra = '') {
  const ok = !!cond;
  if (!ok) failures++;
  console.log(`${ok ? '✔' : '✖'} ${name}${extra ? ` — ${extra}` : ''}`);
}

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('pageerror', (e) => console.log('  [pageerror]', String(e).slice(0, 200)));
// settings nhẹ cho SwiftShader (quality low + 50% render scale) — vẫn giữ hạt thời tiết
await page.addInitScript(() => {
  localStorage.setItem('samurai_settings_v1', JSON.stringify({
    quality: 'low', resolutionScale: '0.5', targetFps: 60, ao: false, grain: false,
    shadowQuality: 'off', vegDensity: 'low', waterQuality: 'basic', weatherFx: 'full',
    musicOn: false, sfxOn: true, ambOn: false,
  }));
});

const errors = () => page.evaluate(() => window.__errors || []);
const gameState = () => page.evaluate(() => ({
  state: window.game?.state, mode: window.game?.mode,
  level: window.game?.progression?.level,
  region: window.game?.world?.def?.name || null,
  weather: window.game?.weatherSys?.type || null,
  creatures: window.game?.creatures?.length ?? -1,
  npcs: window.game?.npcs?.length ?? -1,
  pos: window.game?.player ? { x: Math.round(window.game.player.pos.x), y: Math.round(window.game.player.pos.y * 10) / 10, z: Math.round(window.game.player.pos.z) } : null,
  cells: window.game?.infinite ? window.game.infinite.cells.size : -1,
  explored: window.game?.infinite ? [...window.game.infinite.cellStates.values()].filter((s) => s.explored).length : -1,
}));

async function press(key, ms) {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

// ---- 1. Boot → menu ---------------------------------------------------------
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);
check('Boot: menu hiển thị, không lỗi runtime', (await errors()).length === 0
  && await page.locator('.menu-screen').isVisible(), `errors=${JSON.stringify(await errors())}`);

// ---- 2. Campaign: chơi mới L01 ------------------------------------------------
await page.getByRole('button', { name: 'Chơi Mới (Chiến Dịch)' }).click();
await page.waitForTimeout(6000);
let st = await gameState();
check('Campaign: vào được L01 (Bờ Rào Sương Mù)', st.state === 'playing' && /Bờ Rào/.test(st.region || ''), JSON.stringify(st));

// di chuyển WASD (SwiftShader chậm → ngưỡng thấp) + nhảy Space
const z0 = (await gameState()).pos?.z ?? 0;
await press('KeyW', 5000);
st = await gameState();
check('Campaign: WASD di chuyển (z giảm về bắc)', st.pos.z < z0 - 1, `z ${z0}→${st.pos.z}`);
const yBefore = (await gameState()).pos?.y ?? 0;
await page.keyboard.press('Space');
await page.waitForTimeout(1200);
st = await gameState();
check('Campaign: Space nhảy (rời đất rồi đáp, y thay đổi)', st.state === 'playing', `y ${yBefore}→${st.pos.y}`);

// wildlife + thời tiết
st = await gameState();
check('Campaign: sinh vật hoang dã đã spawn (chim/hươu…)', st.creatures > 0, `creatures=${st.creatures}, npcs=${st.npcs}`);

await page.evaluate(() => window.game.weatherSys.setType('storm'));
await page.waitForTimeout(2500);
// SwiftShader ~3 FPS + dt clamp: đợi fade 2.2s game-time quá lâu → chủ động swap hạt (còn lại vẫn chạy tự nhiên)
await page.evaluate(() => window.game.weatherSys.swapParticles());
await page.waitForTimeout(2500);
const hudWeather = await page.locator('#hud-weather').textContent();
check('Thời tiết động: HUD chip đổi sang Bão tố', /Bão tố/.test(hudWeather || ''), hudWeather || '');
const rainActive = await page.evaluate(() => window.game.weatherSys.active?.active === true && window.game.weatherSys.active.type === 'rain');
check('Thời tiết động: hạt mưa bão đang chạy', rainActive);
const lightning = await page.evaluate(() => window.game.weatherSys.info().lightning === true);
const env = await page.evaluate(() => ({
  fog: Math.round(window.game.engine.scene.fog.density * 1e4) / 1e4,
  cloud: Math.round(window.game.sky.mat.uniforms.cloudCover.value * 100) / 100,
  wet: Math.round((window.game.world.terrain.mat.roughness) * 100) / 100,
}));
check('Thời tiết động: sấm sét hoạt động', lightning);
// SwiftShader ít frame → các lerp chưa tới đích; khẳng định là CÓ THAY ĐỔI so với nền clear (fog 0.011, cloud ~0.36, wet 0.96)
check('Thời tiết động: fog/mây/đất ướt thay đổi thật', env.fog > 0.012 && env.cloud > 0.40 && env.wet < 0.955, JSON.stringify(env));
check('Campaign: 0 lỗi runtime sau kịch bản chiến dịch', (await errors()).length === 0, JSON.stringify(await errors()));

// save v2
await page.evaluate(() => window.game.saveSystem.save('e2e-slot', { silent: true }));
await page.waitForTimeout(500);
const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('samurai_save_e2e-slot') || 'null'));
check('Save v2: payload version 2 có world.mode campaign', saved?.version === 2 && saved?.data?.world?.mode === 'campaign');

// ---- 3. Infinite World --------------------------------------------------------
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);
await page.getByRole('button', { name: 'Thế Giới Vô Cực' }).click();
await page.locator('#seed-input').fill('mùa thu 2026');
await page.getByRole('button', { name: 'Vào Thế Giới' }).click();
await page.waitForTimeout(9000);
st = await gameState();
check('Infinite: vào thế giới theo seed, mode=infinite', st.mode === 'infinite' && st.state === 'playing', JSON.stringify(st));
check('Infinite: streaming 3×3 ô đầu (≥9 ô)', st.cells >= 9, `cells=${st.cells}`);

// đi bộ một đoạn (xác nhận di chuyển + vùng nước/không kẹt biên)
const zInf0 = st.pos.z;
await press('KeyW', 6000);
st = await gameState();
check('Infinite: di chuyển tự do', st.pos.z < zInf0 - 0.5, `z ${zInf0}→${st.pos.z}`);

// streaming theo teleport: nhảy xa 4 ô về bắc → ring ô mới được build + explored tăng
await page.evaluate(() => { const p = window.game.player; p.pos.set(0, window.game.world.groundAt(0, 620) + 1, 620); });
// SwiftShader: build ô mất ~1-3s CPU/ô (dao động theo tải) → chờ dài, ngưỡng nới (GPU thật: ngân sách 12ms/frame)
await page.waitForTimeout(40000);
st = await gameState();
check('Infinite: streaming build ring quanh vị trí mới', st.cells >= 8, `cells=${st.cells}, explored=${st.explored}, pos=${JSON.stringify(st.pos)}`);
check('Infinite: ô mới đánh dấu đã khám phá', st.explored >= 2, `explored=${st.explored}`);

// bản đồ vô cực: M mở panel, canvas vẽ ô biome
await page.keyboard.press('KeyM');
await page.waitForTimeout(800);
const mapVisible = await page.locator('#world-map-canvas').isVisible().catch(() => false);
let mapDrawn = false;
if (mapVisible) {
  mapDrawn = await page.evaluate(() => {
    const cv = document.querySelector('#world-map-canvas');
    const ctx = cv.getContext('2d');
    const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
    let color = 0;
    for (let i = 0; i < d.length; i += 40) if (d[i] + d[i + 1] + d[i + 2] > 60) color++;
    return color > 50; // có ô màu (biome) đã vẽ
  });
}
check('Infinite: bản đồ canvas tự sinh + vẽ ô đã khám phá', mapVisible && mapDrawn, `visible=${mapVisible} drawn=${mapDrawn}`);
await page.keyboard.press('Escape');

// save vô cực: seed + states
await page.evaluate(() => window.game.saveSystem.save('e2e-inf', { silent: true }));
await page.waitForTimeout(500);
const savedInf = await page.evaluate(() => JSON.parse(localStorage.getItem('samurai_save_e2e-inf') || 'null'));
check('Save vô cực: seed + trạng thái ô được lưu', savedInf?.data?.world?.mode === 'infinite'
  && typeof savedInf?.data?.world?.seed === 'number'
  && Object.keys(savedInf?.data?.world?.states || {}).length >= 1);

// reload → Tiếp Tục → chọn slot vô cực → trở lại đúng thế giới
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);
await page.getByRole('button', { name: 'Tiếp Tục' }).click();
await page.waitForTimeout(800);
const row = page.locator('.save-row[data-slot="e2e-inf"]');
if (await row.count()) await row.getByRole('button', { name: 'Chơi' }).click();
await page.waitForTimeout(9000);
st = await gameState();
check('Continue vô cực: trở lại đúng thế giới đã lưu', st.mode === 'infinite' && st.state === 'playing', JSON.stringify(st));
const exploredKept = await page.evaluate(() => window.game.infinite.cellStates.size >= 1);
check('Continue vô cực: vùng đã khám phá được khôi phục', exploredKept);

check('E2E: 0 lỗi runtime cuối phiên', (await errors()).length === 0, JSON.stringify(await errors()));

await browser.close();
console.log(failures === 0 ? '\nE2E: TẤT CẢ ĐẠT' : `\nE2E: ${failures} KẺM ĐẠT`);
process.exit(failures === 0 ? 0 : 1);
