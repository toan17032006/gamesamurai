// Bốn nhân vật trong đội (1-4). Mỗi người có tạo hình, vũ khí, chỉ số và bộ kỹ năng E/Q riêng.
// Kỹ năng dùng cùng pipeline đòn đánh của CombatSystem (arc / AoE / projectileFan).

const sword = { style: 'katana', len: 1.14, color: 0xdde8f4 };
const bow = { style: 'bow', len: 1, color: 0x8a6a3a };
const staff = { style: 'spear', len: 1.62, color: 0xc9a24a };
const greatsword = { style: 'nodachi', len: 1.9, color: 0xb8c4d8 };

export const PARTY = [
  {
    id: 'kensei', name: 'Kensei', title: 'Lãng Khách Gió', kanji: '剣', element: 'Phong',
    color: 0x8ad8ff, css: '#8ad8ff', portrait: 'K',
    desc: 'Kiếm khách cân bằng. Nhất đao đoạt mệnh, xoáy kiếm quét sạch vòng vây.',
    colors: { cloth: 0x263241, skin: 0xd8b090, hair: 0x14100c, accent: 0x8a2a2a, plate: 0x424a56 },
    armor: { model: { tint: 0x263241, parts: ['sash', 'fur'] } },
    helmet: null, weapon: sword, topknot: true,
    mods: { hp: 1, atk: 1, def: 1, speed: 1.05, stamina: 1 },
    skills: {
      elemental: {
        id: 'e_kensei', name: 'Phong Nhất Đao', tag: 'Nguyên tố · Phong', element: 'Phong', color: 0x8ad8ff,
        desc: 'Lao tới và chém xuyên một đường, sát thương lớn.',
        dmgMul: 2.5, dur: 0.85, hitAt: 0.4, range: 3.6, arc: 1.25, anim: 'skill_iai',
        stamina: 28, knockback: 7, moveImpulse: 11, cooldown: 6,
      },
      ultimate: {
        id: 'q_kensei', name: 'Bão Kiếm · Thiên Phong', tag: 'Nộ · Phong', element: 'Phong', color: 0x7ae0ff,
        desc: 'Xoáy ba nhát quanh người, đánh văng mọi kẻ địch trong tầm.',
        dmgMul: 1.35, dur: 1.5, hitAt: [0.25, 0.5, 0.78], range: 3.4, arc: 6.3, anim: 'skill_whirl',
        stamina: 40, knockback: 6, moveImpulse: 0, aoe: true, cooldown: 18,
      },
    },
  },
  {
    id: 'hayate', name: 'Hayate', title: 'Xạ Thủ Sương Mù', kanji: '弓', element: 'Lôi',
    color: 0x9ae08a, css: '#9ae08a', portrait: 'H',
    desc: 'Cung thủ tầm xa. Giữ R để ngắm, bắn tên xuyên phá và mưa tên diện rộng.',
    colors: { cloth: 0x2e3a2c, skin: 0xd0aa88, hair: 0x1a140c, accent: 0x6a7a3a, plate: 0x3a4436 },
    armor: { model: { tint: 0x2e3a2c, parts: ['sash'] } },
    helmet: { model: { style: 'straw' } }, weapon: bow, topknot: true,
    mods: { hp: 0.88, atk: 0.94, def: 0.85, speed: 1.12, stamina: 1.1 },
    aimSupported: true,
    attack: {
      anim: 'bow', dmgMul: 0.95, dur: 0.68, hitAt: 0.55, range: 0, arc: 0,
      stamina: 9, knockback: 2, moveImpulse: 0.6,
      projectileFan: { count: 1, speed: 32, spread: 0 },
    },
    skills: {
      elemental: {
        id: 'e_hayate', name: 'Ngũ Tiễn · Tán Hoa', tag: 'Nguyên tố · Lôi', element: 'Lôi', color: 0x9ae08a,
        desc: 'Bắn năm mũi tên toả quạt về phía ngắm.',
        dmgMul: 1.05, dur: 0.95, hitAt: 0.45, range: 0, arc: 0, anim: 'e_cast',
        stamina: 26, knockback: 3, moveImpulse: 0,
        projectileFan: { count: 5, speed: 26, spread: 1.15 }, cooldown: 7,
      },
      ultimate: {
        id: 'q_hayate', name: 'Bão Tiễn · Sương Phá', tag: 'Nộ · Lôi', element: 'Lôi', color: 0xbaf0a0,
        desc: 'Giương cung xoay một vòng, mười hai mũi tên phóng ra tứ phía.',
        dmgMul: 1.15, dur: 1.5, hitAt: 0.5, range: 0, arc: 0, anim: 'e_cast',
        stamina: 42, knockback: 4, moveImpulse: 0,
        projectileFan: { count: 12, speed: 22, spread: 6.283 }, cooldown: 18,
      },
    },
  },
  {
    id: 'onmyoji', name: 'Genkai', title: 'Âm Dương Sư', kanji: '炎', element: 'Hỏa',
    color: 0xffa060, css: '#ffa060', portrait: 'G',
    desc: 'Pháp sư nguyên tố. Thiêu đốt một mục tiêu hoặc trải vòng lửa quanh mình.',
    colors: { cloth: 0x3a2c4a, skin: 0xd8b89a, hair: 0x181018, accent: 0x8a3a6a, plate: 0x5a4a68 },
    armor: { model: { tint: 0x3a2c4a, parts: ['sash'] } },
    helmet: { model: { style: 'straw' } }, weapon: staff, topknot: false,
    mods: { hp: 0.92, atk: 1.08, def: 0.9, speed: 1, stamina: 1.05 },
    aimSupported: true,
    skills: {
      elemental: {
        id: 'e_onmyoji', name: 'Hỏa Cầu · Quỷ Tẫn', tag: 'Nguyên tố · Hỏa', element: 'Hỏa', color: 0xff7a3a,
        desc: 'Phóng một hỏa cầu lớn, nổ tung khi trúng đích.',
        dmgMul: 2.1, dur: 0.9, hitAt: 0.5, range: 0, arc: 0, anim: 'e_cast',
        stamina: 26, knockback: 5, moveImpulse: 0,
        projectileFan: { count: 1, speed: 18, spread: 0, fire: true }, cooldown: 6,
      },
      ultimate: {
        id: 'q_onmyoji', name: 'Tu La Hỏa Vực', tag: 'Nộ · Hỏa', element: 'Hỏa', color: 0xffd257,
        desc: 'Triệu hồi mười hai hoả cầu toả ra tứ phía, thiêu rụi chiến trường.',
        dmgMul: 1.35, dur: 1.7, hitAt: 0.55, range: 0, arc: 0, anim: 'e_cast',
        stamina: 44, knockback: 5, moveImpulse: 0,
        projectileFan: { count: 12, speed: 16, spread: 6.283, fire: true }, cooldown: 20,
      },
    },
  },
  {
    id: 'tetsu', name: 'Tetsu', title: 'Thương Vệ Sơn Hà', kanji: '山', element: 'Thổ',
    color: 0xe0c27a, css: '#e0c27a', portrait: 'T',
    desc: 'Chiến binh phòng thủ. Cú đập địa chấn và đại xoáy thương nghiền nát đội hình địch.',
    colors: { cloth: 0x33405a, skin: 0xc09a78, hair: 0x100c08, accent: 0x9a7a2a, plate: 0x4a5668 },
    armor: { model: { tint: 0x33405a, parts: ['plates', 'pauldrons', 'sash'] } },
    helmet: { model: { style: 'kabuto' } }, weapon: greatsword, topknot: true,
    mods: { hp: 1.28, atk: 0.92, def: 1.45, speed: 0.92, stamina: 1.2 },
    skills: {
      elemental: {
        id: 'e_tetsu', name: 'Địa Chấn · Sơn Băng', tag: 'Nguyên tố · Thổ', element: 'Thổ', color: 0xe0c27a,
        desc: 'Đập vũ khí xuống đất, làm choáng và đánh văng mọi kẻ địch quanh mình.',
        dmgMul: 1.7, dur: 1.15, hitAt: 0.55, range: 4.6, arc: 6.283, anim: 'e_slam',
        stamina: 30, knockback: 9, moveImpulse: 1, aoe: true, cooldown: 8,
      },
      ultimate: {
        id: 'q_tetsu', name: 'Sơn Hà Chuyển', tag: 'Nộ · Thổ', element: 'Thổ', color: 0xffe0a0,
        desc: 'Ba vòng xoáy thương liên tiếp, mỗi vòng đánh văng toàn bộ kẻ địch.',
        dmgMul: 2.0, dur: 1.9, hitAt: [0.3, 0.62, 0.95], range: 5.0, arc: 6.283, anim: 'skill_whirl',
        stamina: 46, knockback: 8, moveImpulse: 0, aoe: true, cooldown: 22,
      },
    },
  },
];

export function characterAppearance(c) {
  return {
    colors: c.colors,
    weaponModel: c.weapon,
    armorModel: c.armor,
    helmetModel: c.helmet,
    topknot: c.topknot,
  };
}
