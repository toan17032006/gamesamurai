// Test worldgen thuần: seed xác định, biome rules, liên tục của trường địa hình.
import test from 'node:test';
import assert from 'node:assert/strict';
import { hashSeed, cellSeed, biomeForCell, makeFieldSampler, pickWeather, weatherDuration } from '../../web/src/systems/worldgen.js';
import { InfiniteWorld, CELL } from '../../web/src/systems/infiniteWorld.js';

test('hashSeed: cùng chuỗi → cùng seed, khác chuỗi → khác seed', () => {
  assert.equal(hashSeed('mùa thu 1234'), hashSeed('mùa thu 1234'));
  assert.notEqual(hashSeed('a'), hashSeed('b'));
  assert.equal(typeof hashSeed(''), 'number');
});

test('cellSeed: xác định theo (seed, cx, cz) và khác nhau giữa các ô', () => {
  assert.equal(cellSeed(42, 1, 2), cellSeed(42, 1, 2));
  assert.notEqual(cellSeed(42, 1, 2), cellSeed(42, 2, 1));
  assert.notEqual(cellSeed(42, 1, 2), cellSeed(43, 1, 2));
});

test('biomeForCell: ô (0,0) luôn là village (spawn)', () => {
  for (const seed of [1, 999, hashSeed('abc')]) {
    const b = biomeForCell(seed, 0, 0);
    assert.equal(b.biome, 'village');
  }
});

test('biomeForCell: xác định theo seed + trả biome hợp lệ + danger tăng theo khoảng cách', () => {
  const VALID = new Set(['outskirts', 'village', 'bamboo', 'forest', 'mountain', 'snow', 'river',
    'lake', 'shrine', 'battlefield', 'castle', 'cave', 'badlands', 'volcano', 'throne_hall']);
  const seed = hashSeed('test-world');
  // deterministic
  assert.deepEqual(biomeForCell(seed, 3, -4), biomeForCell(seed, 3, -4));
  // cùng seed khác seed khác layout (không chứng minh từng ô khác, đo tỷ lệ khác nhau)
  const seed2 = seed + 1;
  let diff = 0, n = 0;
  for (let cx = -4; cx <= 4; cx++) for (let cz = -4; cz <= 4; cz++) {
    n++;
    if (biomeForCell(seed, cx, cz).biome !== biomeForCell(seed2, cx, cz).biome) diff++;
  }
  assert.ok(diff / n > 0.5, `hai seed phải cho layout khác nhau (diff=${diff}/${n})`);
  // danger ≥ chebyshev distance với mọi ô đều dàng cho các biome ngoài start
  for (let cx = -6; cx <= 6; cx++) for (let cz = -6; cz <= 6; cz++) {
    const info = biomeForCell(seed, cx, cz);
    assert.ok(VALID.has(info.biome), `biome lạ: ${info.biome}`);
    if (cx !== 0 || cz !== 0) assert.ok(info.danger >= Math.max(Math.abs(cx), Math.abs(cz)));
  }
});

test('Trường địa hình: liên tục qua ranh giới ô (không đứt gãy)', () => {
  const world = new InfiniteWorld({ group: { add() {} }, game: { engine: { qualityKey: 'low' } } }, hashSeed('seamless'));
  // quét các ranh giới ô trong vùng 5×5: chênh lệch height qua mép phải nhỏ
  let maxDelta = 0;
  for (let cx = -2; cx <= 2; cx++) {
    for (let cz = -2; cz <= 2; cz++) {
      const bx = cx * CELL + CELL / 2; // mép phải của ô
      for (let z = -0.5; z < 0.5; z += 0.1) {
        const zAbs = cz * CELL + z * CELL;
        const hL = world.heightAt(bx - 0.05, zAbs);
        const hR = world.heightAt(bx + 0.05, zAbs);
        maxDelta = Math.max(maxDelta, Math.abs(hL - hR));
      }
    }
  }
  assert.ok(maxDelta < 0.5, `heightAt không liên tục tại mép ô: delta=${maxDelta.toFixed(3)}`);
});

test('Trường địa hình: cùng seed tái tạo cùng cao độ; seed khác thì khác', () => {
  const a = new InfiniteWorld({ group: { add() {} }, game: {} }, hashSeed('lặp lại được'));
  const b = new InfiniteWorld({ group: { add() {} }, game: {} }, hashSeed('lặp lại được'));
  const c = new InfiniteWorld({ group: { add() {} }, game: {} }, hashSeed('khác'));
  for (const [x, z] of [[0, 0], [130, -220], [-300, 90], [1000, 1000]]) {
    assert.ok(Math.abs(a.heightAt(x, z) - b.heightAt(x, z)) < 1e-9);
  }
  let differs = false;
  for (const [x, z] of [[0, 0], [130, -220], [-300, 90]]) {
    if (Math.abs(a.heightAt(x, z) - c.heightAt(x, z)) > 1e-6) differs = true;
  }
  assert.ok(differs, 'seed khác phải cho địa hình khác');
});

test('Trường địa hình: không NaN trên lưới lớn', () => {
  const w = new InfiniteWorld({ group: { add() {} }, game: {} }, 777);
  for (let x = -1200; x <= 1200; x += 83) {
    for (let z = -1200; z <= 1200; z += 97) {
      const h = w.heightAt(x, z);
      assert.ok(Number.isFinite(h), `NaN tại (${x},${z})`);
      assert.ok(Math.abs(h) < 60, `cao độ phi lý ${h} tại (${x},${z})`);
    }
  }
});

test('pickWeather: không chọn lại loại hiện tại khi pool còn lựa chọn; fallback khi pool đơn', () => {
  const pool = [['clear', 3], ['rain', 2], ['storm', 1]];
  const rng = () => 0.999; // cuốn tới cuối
  // với rng luôn cuối, mọi pick rơi vào phần tử hợp lệ cuối (storm) — không phải clear
  assert.equal(pickWeather(pool, 'clear', rng), 'storm');
  assert.equal(pickWeather([['fog', 1]], 'fog', Math.random), 'fog'); // pool đơn: giữ nguyên
});

test('weatherDuration: trong khoảng hợp lý theo loại', () => {
  const rng = () => 0.5;
  assert.ok(weatherDuration('storm', rng) >= 42 && weatherDuration('storm', rng) <= 78);
  assert.ok(weatherDuration('clear', rng) >= 105 && weatherDuration('clear', rng) <= 195);
});

test('Seed fidelity: chuỗi gốc → hash → restore bằng số phải cho CÙNG thế giới', () => {
  // luồng save/continue: startInfinite('mùa thu 2026') hash chuỗi; save lưu seed số;
  // continue phải dùng số trực tiếp (enterInfinite(number)) chứ không hash lại chuỗi số
  const fromString = new InfiniteWorld({ group: { add() {} }, game: {} }, hashSeed('mùa thu 2026'));
  const numeric = hashSeed('mùa thu 2026') >>> 0;
  const fromNumber = new InfiniteWorld({ group: { add() {} }, game: {} }, numeric);
  for (const [x, z] of [[0, 0], [250, -500], [-1000, 700]]) {
    assert.equal(fromString.heightAt(x, z), fromNumber.heightAt(x, z));
  }
  // hash lại CHUỖI SỐ (luồng sai cũ) sẽ khác thế giới gốc — ghi nhận để không hồi quy
  const wrong = new InfiniteWorld({ group: { add() {} }, game: {} }, hashSeed(String(numeric)));
  let differs = false;
  for (const [x, z] of [[0, 0], [250, -500]]) {
    if (fromString.heightAt(x, z) !== wrong.heightAt(x, z)) differs = true;
  }
  assert.ok(differs, 'hash chuỗi số phải cho thế giới khác — continue phải dùng số trực tiếp');
});

test('makeFieldSampler: các trường liên tục (elevation/moisture/riverBand)', () => {
  const f = makeFieldSampler(12345);
  let maxD = 0;
  for (let i = -10; i <= 10; i++) {
    for (let j = -10; j <= 10; j++) {
      maxD = Math.max(maxD, Math.abs(f.elevation(i + 0.01, j) - f.elevation(i - 0.01, j)));
      maxD = Math.max(maxD, Math.abs(f.moisture(i, j + 0.01) - f.moisture(i, j - 0.01)));
      maxD = Math.max(maxD, Math.abs(f.riverBand(i + 0.01, j) - f.riverBand(i - 0.01, j)));
    }
  }
  assert.ok(maxD < 0.1, `trường noise phải liên tục, delta=${maxD}`);
});
