// engine/tests/objects-parameter-semantics.test.ts
//
// Kiểm chứng trục "loại bỏ return có sẵn" cho `src/objects`.
//
// Trước đợt này 4 method bỏ qua tham số bắt buộc:
//   NPC.interact(interactor)             → distance luôn = 2.5 (hằng)
//   Skill.execute(caster, target)        → target bị bỏ qua
//   PassiveAbility.trigger(event, ctx)   → context bị bỏ qua
//   WorldObject.update(dt)               → dt bị bỏ qua
import { describe, it, expect } from 'vitest';
import { NPC, Player } from '../src/objects/entities.js';
import { Skill, PassiveAbility } from '../src/objects/skills.js';
import { WorldObject } from '../src/objects/world-objects.js';

describe('NPC.interact — khoảng cách tính từ vị trí thật', () => {
  it('distance bằng khoảng cách giữa NPC và người chơi', () => {
    const npc = new NPC('npc_1', 'Thorin', 'Blacksmith');
    const player = new Player('p1', 'Hero');
    npc.setPosition(0, 0, 0);
    player.setPosition(3, 0, 4);

    const prompt = npc.interact(player);
    expect(prompt.distance).toBeCloseTo(5, 6);
  });

  it('hai người chơi ở hai vị trí khác nhau cho distance khác nhau', () => {
    const npc = new NPC('npc_1', 'Thorin', 'Blacksmith');
    npc.setPosition(0, 0, 0);

    const near = new Player('p1', 'Near');
    near.setPosition(1, 0, 0);
    const far = new Player('p2', 'Far');
    far.setPosition(10, 0, 0);

    expect(npc.interact(near).distance).toBeCloseTo(1, 6);
    expect(npc.interact(far).distance).toBeCloseTo(10, 6);
  });

  it('không có người tương tác thì không mở hội thoại', () => {
    const npc = new NPC('npc_1', 'Thorin', 'Blacksmith');
    npc.interact(undefined as any);
    expect(npc.state.isTalking).toBe(false);
  });
});

describe('Skill.execute — mục tiêu được ghi nhận', () => {
  it('ghi lại caster và target của lần thi triển', () => {
    const skill = new Skill({ id: 'fireball', name: 'Fireball' });
    const caster = { mana: { consume: () => {} } };
    const target = { id: 'enemy' };

    skill.execute(caster, target);

    expect(skill.lastCaster).toBe(caster);
    expect(skill.lastTarget).toBe(target);
    expect(skill.lastExecutedAt).toBe(1);
  });

  it('mục tiêu khác nhau cho kết quả khác nhau', () => {
    const skill = new Skill({ id: 'fireball', name: 'Fireball' });
    skill.execute(undefined, { id: 'a' });
    skill.execute(undefined, { id: 'b' });

    expect(skill.lastTarget).toEqual({ id: 'b' });
    expect(skill.lastExecutedAt).toBe(2);
  });
});

describe('PassiveAbility.trigger — ngữ cảnh được truyền vào hiệu ứng', () => {
  it('gọi hàm hiệu ứng với ngữ cảnh', () => {
    const passive = new PassiveAbility<string, number>('p1', 'Boost', 'on_hit', ((ctx: any) =>
      ctx?.amount ?? 0) as any);

    const result = passive.trigger('on_hit', { amount: 7 });

    expect(result).toBe(7);
    expect(passive.lastTriggerContext).toEqual({ amount: 7 });
    expect(passive.triggerCount).toBe(1);
  });

  it('sự kiện không khớp thì không kích hoạt', () => {
    const passive = new PassiveAbility<string, number>('p1', 'Boost', 'on_hit', 3);
    expect(passive.trigger('on_death', { amount: 1 })).toBeNull();
    expect(passive.triggerCount).toBe(0);
  });
});

describe('WorldObject.update — thời gian sống được tích luỹ', () => {
  it('elapsedTime tăng theo dt', () => {
    const obj = new WorldObject<{ hp: number }>('obj_1', 'Rock', { hp: 10 });
    obj.update(0.5);
    obj.update(0.25);
    expect(obj.elapsedTime).toBeCloseTo(0.75, 6);
  });

  it('dt không hợp lệ thì không làm sai lệch', () => {
    const obj = new WorldObject<{ hp: number }>('obj_1', 'Rock', { hp: 10 });
    obj.update(Number.NaN);
    obj.update(-5);
    expect(obj.elapsedTime).toBe(0);
  });
});
