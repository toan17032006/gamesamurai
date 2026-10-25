import { chromium } from 'playwright';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.addInitScript(() => {
  localStorage.setItem('samurai_settings_v1', JSON.stringify({ quality: 'medium', resolutionScale: '0.7', targetFps: 60, ao: false, grain: false, shadowQuality: 'low', vegDensity: 'normal', waterQuality: 'high', weatherFx: 'full', musicOn: false, sfxOn: false, ambOn: false }));
});
await page.goto('http://127.0.0.1:8080', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);

// 1. Campaign L01 ngày + wildlife
await page.getByRole('button', { name: 'Chơi Mới (Chiến Dịch)' }).click();
await page.waitForTimeout(6000);
await page.screenshot({ path: 'docs/screenshots/campaign-l01-day.png' });

// 2. L05 river: nước + cầu + thác (tiến thẳng tới sông bằng teleport nhẹ)
await page.evaluate(() => { window.game.enterLevel('L05'); });
await page.waitForTimeout(8000);
await page.screenshot({ path: 'docs/screenshots/campaign-l05-river.png' });

// 3. Bão trên sông: mưa + tối + đất ướt
await page.evaluate(() => { window.game.weatherSys.setType('storm'); window.game.weatherSys.swapParticles(); });
await page.waitForTimeout(5000);
await page.screenshot({ path: 'docs/screenshots/campaign-l05-storm.png' });

// 4. L11 volcano: dung nham
await page.evaluate(() => { window.game.enterLevel('L11'); });
await page.waitForTimeout(9000);
await page.evaluate(() => { const p = window.game.player; p.pos.set(0, window.game.world.groundAt(0, -40) + 1, -40); window.game.cameraRig.yaw = 0.4; });
await page.waitForTimeout(2500);
await page.screenshot({ path: 'docs/screenshots/campaign-l11-volcano.png' });

// 5. Infinite world: bản đồ
await page.evaluate(() => window.game.startInfinite('slot1', 'mùa thu 2026'));
await page.waitForTimeout(10000);
await page.evaluate(() => { const p = window.game.player; p.pos.set(0, window.game.world.groundAt(0, 380) + 1, 380); });
await page.waitForTimeout(20000);
await page.keyboard.press('KeyM');
await page.waitForTimeout(1500);
await page.screenshot({ path: 'docs/screenshots/infinite-worldmap.png' });
await page.keyboard.press('Escape');

// 6. Infinite world cảnh 3D
await page.keyboard.press('Escape');
await page.waitForTimeout(1500);
await page.screenshot({ path: 'docs/screenshots/infinite-3d.png' });

const errs = await page.evaluate(() => window.__errors || []);
console.log('errors:', JSON.stringify(errs));
await browser.close();
