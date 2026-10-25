// Wildlife archetypes: hành vi, chỉ số, loot săn bắn. Dùng bởi entities/creature.js.
export const WILDLIFE = {
  bird: { id: 'bird', kind: 'bird', name: 'Chim rừng', hp: 6, attack: 0, defense: 0, speed: 8.5, poise: 1, xp: 3, coins: 0,
    scale: 0.62, flyAlt: [3.5, 9], flee: 7,
    colors: { body: 0x8a5a3a, belly: 0xc8a878, wing: 0x6a4228 },
    drops: [{ id: 'meat', chance: 0.45, qty: 1 }] },

  fish: { id: 'fish', kind: 'fish', name: 'Cá suối', hp: 8, attack: 0, defense: 0, speed: 5.2, poise: 1, xp: 4, coins: 0,
    scale: 0.8, flee: 3.4,
    colors: { body: 0x6a8aa0, belly: 0xa8c4d0, fin: 0x4a6a80 },
    drops: [{ id: 'meat', chance: 0.7, qty: 1 }] },

  deer: { id: 'deer', kind: 'quad', name: 'Hươu sao', hp: 26, attack: 0, defense: 2, speed: 7.0, poise: 6, xp: 10, coins: 3,
    scale: 0.92, flee: 9, graze: true, horns: true,
    colors: { body: 0x9a6a42, belly: 0xc8a878, dark: 0x6a452a },
    drops: [{ id: 'meat', chance: 1, qty: 2 }, { id: 'leather', chance: 0.6, qty: 1 }] },

  boar: { id: 'boar', kind: 'quad', name: 'Lợn rừng', hp: 52, attack: 13, defense: 4, speed: 5.8, poise: 22, xp: 20, coins: 5,
    scale: 0.86, flee: 0, aggroRange: 5.5, tusks: true, retreatAt: 0.25,
    colors: { body: 0x4a3a2e, belly: 0x5a4636, dark: 0x2e241c },
    drops: [{ id: 'meat', chance: 1, qty: 3 }, { id: 'leather', chance: 0.5, qty: 1 }] },

  wolf: { id: 'wolf', kind: 'quad', name: 'Sói rừng', hp: 44, attack: 15, defense: 3, speed: 6.7, poise: 12, xp: 28, coins: 7,
    scale: 0.8, flee: 0, aggroRange: 11, pack: true, retreatAt: 0.2, howl: true,
    colors: { body: 0x5a5a62, belly: 0x8a8a90, dark: 0x3a3a40 },
    drops: [{ id: 'meat', chance: 0.8, qty: 1 }, { id: 'leather', chance: 1, qty: 2 }] },
};

// cấu hình sinh vật theo nhóm môi trường (dùng cho Infinite World + region thiếu config)
export const BIOME_WILDLIFE = {
  green:   { bird: 4, fish: 0, deer: 3, boar: 1, wolf: 0 },
  water:   { bird: 3, fish: 8, deer: 1, boar: 0, wolf: 0 },
  forest:  { bird: 5, fish: 0, deer: 3, boar: 2, wolf: 3 },
  harsh:   { bird: 1, fish: 0, deer: 0, boar: 0, wolf: 2 },
  dead:    { bird: 0, fish: 0, deer: 0, boar: 0, wolf: 0 },
};
