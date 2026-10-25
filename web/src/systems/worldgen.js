// Worldgen thuần (không three.js/DOM) — quy tắc sinh Infinite World + thời tiết.
// Mọi hàm đều xác định theo seed: cùng seed → cùng thế giới (tái tạo được).
import { makeNoise2D, mulberry32 } from '../framework/math.js';

// ---- seed -------------------------------------------------------------------
export function hashSeed(str) {
  // FNV-1a 32bit — chuỗi seed bất kỳ → số nguyên ổn định
  const s = String(str ?? '');
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function cellSeed(worldSeed, cx, cz) {
  let h = worldSeed >>> 0;
  h = Math.imul(h ^ (cx & 0xffff), 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (cz & 0xffff), 0xc2b2ae35) >>> 0;
  h ^= h >>> 13;
  return h >>> 0;
}

export function cellRandom(worldSeed, cx, cz, salt = 0) {
  return mulberry32(cellSeed(worldSeed, cx, cz) ^ (salt * 0x9e3779b9));
}

// ---- biome rules --------------------------------------------------------------
// Noise trường toàn cục: độ cao / độ ẩm / nhiệt độ — liên tục qua các ô,
// nên địa hình khi ghép vùng không đứt gãy.
export function makeFieldSampler(worldSeed) {
  const elevN = makeNoise2D(worldSeed ^ 0x51a7);
  const moistN = makeNoise2D(worldSeed ^ 0x9e21);
  const tempN = makeNoise2D(worldSeed ^ 0x2f63);
  const riverN = makeNoise2D(worldSeed ^ 0x77d4);
  return {
    elevation(cx, cz) { return elevN.fbm(cx * 0.11 + 3.7, cz * 0.11 - 8.1, 3); },
    moisture(cx, cz) { return moistN.fbm(cx * 0.09 - 50, cz * 0.09 + 40, 3); },
    temperature(cx, cz) { return tempN.fbm(cx * 0.07 + 90, cz * 0.07 + 15, 3); },
    // dải sông chảy bắc-nam: |riverBand| nhỏ = trong lòng sông (liên tục toàn thế giới)
    riverBand(cx, cz) { return riverN.fbm(cx * 0.17 + 7, cz * 0.05 - 2, 2); },
  };
}

// Kết quả biome cho 1 ô: quyết định template region + mức nguy hiểm.
export function biomeForCell(worldSeed, cx, cz) {
  const f = makeFieldSampler(worldSeed);
  const elev = f.elevation(cx, cz);
  const moist = f.moisture(cx, cz);
  const temp = f.temperature(cx, cz);
  const cheb = Math.max(Math.abs(cx), Math.abs(cz));
  const rng = cellRandom(worldSeed, cx, cz, 5);
  const r = rng();

  if (cx === 0 && cz === 0) return { biome: 'village', danger: 1, reason: 'start' };
  // sông: dải hẹp chảy dọc thế giới (không áp ô xuất phát)
  if (cheb > 0 && Math.abs(f.riverBand(cx, cz)) < 0.045) return { biome: 'river', danger: cheb + 1, reason: 'river' };

  if (elev > 0.42 && temp > 0.3) return { biome: 'volcano', danger: cheb + 3, reason: 'hot+high' };
  if (elev > 0.38 && temp < -0.26) return { biome: 'snow', danger: cheb + 2, reason: 'cold+high' };
  if (elev > 0.3) return { biome: 'mountain', danger: cheb + 2, reason: 'high' };
  if (moist < -0.32 && elev > -0.12) return { biome: 'badlands', danger: cheb + 2, reason: 'dry' };
  if (moist > 0.36 && elev < 0.08) return { biome: 'lake', danger: cheb + 1, reason: 'wet+low' };
  if (moist > 0.22 && temp > 0.08 && r < 0.55) return { biome: 'bamboo', danger: cheb + 1, reason: 'warm+wet' };
  if (moist > 0.02) return { biome: 'forest', danger: cheb + 1, reason: 'wet' };

  // vùng thấp vừa phải: làng/đền/hang theo xác suất + khoảng cách
  if (cheb >= 6 && r > 0.965) return { biome: 'throne_hall', danger: cheb + 4, reason: 'cursed' };
  if (cheb >= 5 && r < 0.05) return { biome: 'castle', danger: cheb + 3, reason: 'keep' };
  if (cheb >= 3 && r < 0.09) return { biome: 'cave', danger: cheb + 2, reason: 'pocket' };
  if (cheb >= 2 && r > 0.86 && r < 0.94) return { biome: 'shrine', danger: cheb + 1, reason: 'landmark' };
  if (cheb <= 2 && r < 0.16) return { biome: 'village', danger: 1, reason: 'hamlet' };
  return { biome: 'outskirts', danger: cheb + 1, reason: 'plains' };
}

// ---- weather ------------------------------------------------------------------
// Chọn loại thời tiết kế tiếp từ pool [type, weight][] — không lặp loại hiện tại nếu còn lựa chọn.
export function pickWeather(pool, current, rng) {
  const total = pool.reduce((a, [t, w]) => a + (t === current ? 0 : w), 0);
  if (total <= 0) return current;
  let roll = rng() * total;
  for (const [type, w] of pool) {
    if (type === current) continue;
    roll -= w;
    if (roll <= 0) return type;
  }
  return pool[pool.length - 1][0];
}

export function weatherDuration(type, rng) {
  const base = { storm: 60, rain: 100, snow: 130, fog: 90, dust: 80, clear: 150, cloudy: 110, leaves: 90,
    petals: 100, embers: 120, ash: 120, spirit: 55, wraith_fog: 70, magic_storm: 50 }[type] || 100;
  return base * (0.7 + rng() * 0.6);
}
