// Panels: nhân vật, túi đồ, nhiệm vụ, bản đồ, sổ tay, đội hình, nhiều người chơi, vòng nhanh.
import { ALL_ITEMS, itemDef, RARITY, CURRENCY } from '../data/items.js';
import { SKILL_TREE } from '../data/skills.js';
import { RECIPES } from '../data/recipes.js';
import { PARTY } from '../data/characters.js';
import { esc } from '../core/utils.js';
import { factionColor } from '../systems/factions.js';
import { WorldMap } from './worldMap.js';
import { Quickwheel } from './components/quickwheel.js';
import { actionsByGroup } from '../data/keys.js';

const TABS = [
  { id: 'character', label: 'Nhân vật', key: 'C' },
  { id: 'inventory', label: 'Túi đồ', key: 'B' },
  { id: 'quests', label: 'Nhiệm vụ', key: 'J' },
  { id: 'map', label: 'Bản đồ', key: 'M' },
  { id: 'handbook', label: 'Sổ tay', key: 'F1' },
  { id: 'formation', label: 'Đội hình', key: 'L' },
  { id: 'multiplayer', label: 'Nhiều người', key: 'F2' },
  { id: 'quickwheel', label: 'Vòng nhanh', key: 'Tab' },
];

const STAT_NAMES = { damage: 'Công', defense: 'Thủ', speed: 'Tốc', stamina: 'Khí', combo: 'Combo', range: 'Tầm', crit: 'Chí mạng%', staminaRegen: 'Hồi khí', attackPct: '%Công' };
const ATTR_NAMES = { str: 'Lực', agi: 'Mẫn', vit: 'Thể', end: 'Nội' };

export class Panels {
  constructor(game) {
    this.game = game;
    this.open = null;
    this.root = document.createElement('div');
    this.root.className = 'panels';
    this.root.style.display = 'none';
    this.root.innerHTML = `
      <div class="panel-modal">
        <div class="panel-tabs" id="panel-tabs"></div>
        <div class="panel-body" id="panel-body"></div>
        <button class="panel-close" id="panel-close">✕ <span>Esc</span></button>
      </div>`;
    document.getElementById('ui').appendChild(this.root);
    this.root.querySelector('#panel-close').addEventListener('click', () => this.closeAll());
    this.quickwheel = new Quickwheel(this);
    this.renderTabs();
  }

  renderTabs() {
    const tabs = this.root.querySelector('#panel-tabs');
    tabs.innerHTML = `
      <div class="panel-brand"><span class="brand-kanji">S</span><small>Đạo Của Kẻ Vô Danh</small></div>
      ${TABS.map((t) => `<button data-tab="${t.id}"><span class="tab-label">${t.label}</span><i>${t.key}</i></button>`).join('')}
      <div class="panel-tabs-foot">Tab / Esc đóng</div>`;
    tabs.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => this.show(b.dataset.tab)));
  }

  isOpen() { return !!this.open; }

  toggle(id) {
    if (this.open === id) this.closeAll();
    else this.show(id);
  }

  show(id) {
    if (this.game.state !== 'playing' && this.game.state !== 'paused') return;
    this.open = id;
    this.root.style.display = 'flex';
    this.game.input.enabled = false;
    this.game.input.releasePointer();
    this.game.audio.sfx('ui');
    this.render();
  }

  closeAll() {
    if (!this.open) return;
    this.open = null;
    this.root.style.display = 'none';
    if (this.game.state === 'playing') {
      this.game.input.enabled = true;
      this.game.input.requestPointer();
    }
  }

  render() {
    const body = this.root.querySelector('#panel-body');
    this.root.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('active', b.dataset.tab === this.open));
    if (this.open === 'character') this.renderCharacter(body);
    if (this.open === 'inventory') this.renderInventory(body);
    if (this.open === 'skills') this.renderSkills(body);
    if (this.open === 'crafting') this.renderCrafting(body);
    if (this.open === 'quests') this.renderQuests(body);
    if (this.open === 'map') this.renderMap(body);
    if (this.open === 'handbook') this.renderHandbook(body);
    if (this.open === 'formation') this.renderFormation(body);
    if (this.open === 'multiplayer') this.renderMultiplayer(body);
    if (this.open === 'quickwheel') this.quickwheel.render(body);
    if (this.open === 'shop') this.renderShop(body);
  }

  openShop() { this.show('shop'); }

  rarityColor(r) { return RARITY[r]?.color || '#fff'; }

  itemRow(id, plus, qty, actions = '') {
    const def = itemDef(id);
    const equipped = Object.values(this.game.inventory.equipped).includes(id);
    const statLine = def.stats ? Object.entries(def.stats).map(([k, v]) => `${STAT_NAMES[k] || k} ${v}`).join(' · ') : '';
    return `<div class="item-row" style="border-color:${this.rarityColor(def.rarity)}">
      <span class="item-icon">${def.icon}</span>
      <span class="item-info">
        <b style="color:${this.rarityColor(def.rarity)}">${esc(def.name)}${plus ? ` <span class="plus">+${plus}</span>` : ''}</b>
        <span class="dim">${esc(def.desc || '')}</span>
        ${statLine ? `<span class="statline">${esc(statLine)}</span>` : ''}
      </span>
      <span class="item-qty">${qty > 1 ? `x${qty}` : ''}${equipped ? ' <i class="equipped">đang mang</i>' : ''}</span>
      <span class="item-actions">${actions}</span>
    </div>`;
  }

  modLabel(mods) {
    const out = [];
    if (mods.hp !== 1) out.push(`Máu ${mods.hp > 1 ? '+' : ''}${Math.round((mods.hp - 1) * 100)}%`);
    if (mods.atk !== 1) out.push(`Công ${mods.atk > 1 ? '+' : ''}${Math.round((mods.atk - 1) * 100)}%`);
    if (mods.def !== 1) out.push(`Thủ ${mods.def > 1 ? '+' : ''}${Math.round((mods.def - 1) * 100)}%`);
    if (mods.speed !== 1) out.push(`Tốc ${mods.speed > 1 ? '+' : ''}${Math.round((mods.speed - 1) * 100)}%`);
    if (mods.stamina !== 1) out.push(`Khí ${mods.stamina > 1 ? '+' : ''}${Math.round((mods.stamina - 1) * 100)}%`);
    return out.join(' · ');
  }

  renderCharacter(body) {
    const g = this.game;
    const p = g.player;
    const active = p.characterIndex ?? 0;
    const c = p.character || PARTY[active];
    const prog = g.progression;
    const st = g.inventory.equippedStats();
    const crit = (5 + prog.attrs.agi * 0.5 + st.weapon.crit + st.crit).toFixed(0);
    const playing = g.state === 'playing';
    const skillCard = (key, s) => s ? `
      <div class="char-skill" style="--sc:${s.color ? '#' + s.color.toString(16).padStart(6, '0') : c.css}">
        <span class="cs-key">${key}</span>
        <div class="cs-main">
          <b>${esc(s.name)}</b>
          <span class="dim">${esc(s.tag || '')} · ${s.cooldown}s hồi · ${s.stamina} khí</span>
          <p>${esc(s.desc || '')}</p>
        </div>
      </div>` : '';
    const eqRow = (slot, label) => {
      const id = g.inventory.equipped[slot];
      const def = id ? itemDef(id) : null;
      const plus = id ? g.inventory.plusOf(id) : 0;
      return `<div class="char-eq"><span>${label}</span><b style="color:${def ? this.rarityColor(def.rarity) : '#6f6b60'}">${def ? esc(def.name) + (plus ? ` +${plus}` : '') : '— trống —'}</b></div>`;
    };
    body.innerHTML = `
      <div class="char-layout">
        <div class="char-hero" style="--cc:${c.css}">
          <div class="char-hero-bg">${c.name[0]}</div>
          <div class="char-portrait">${c.portrait}</div>
          <h2>${esc(c.name)}</h2>
          <p class="char-sub">${esc(c.title)}</p>
          <div class="char-element">${esc(c.element)}</div>
          <p class="char-desc">${esc(c.desc || '')}</p>
          <div class="char-mods">${esc(this.modLabel(c.mods || {}))}</div>
          <div class="char-hp"><span style="width:${Math.max(0, (p.hp / p.maxHp) * 100)}%"></span><i>${Math.ceil(p.hp)} / ${p.maxHp}</i></div>
          <button class="char-switch" data-switch="${active}" ${playing ? '' : 'disabled'}>${playing ? 'Đang điều khiển' : 'Đang tạm dừng'}</button>
        </div>
        <div class="char-main">
          <div class="char-sec">
            <h3>Chỉ số hiện tại</h3>
            <div class="char-stats">
              <div><span>Công kích</span><b>${p.effAttack().toFixed(0)}</b></div>
              <div><span>Phòng thủ</span><b>${p.effDefense()}</b></div>
              <div><span>Khí lực</span><b>${Math.ceil(p.stamina)} / ${p.maxStamina}</b></div>
              <div><span>Chí mạng</span><b>${crit}%</b></div>
            </div>
            <div class="attr-row">${['str', 'agi', 'vit', 'end'].map((a) => `
              <button data-attr="${a}" ${prog.pointsAttr <= 0 ? 'disabled' : ''}>${ATTR_NAMES[a]} ${prog.attrs[a]} +</button>`).join('')}
              <span class="dim points">${prog.pointsAttr} điểm thuộc tính</span>
            </div>
          </div>
          <div class="char-sec">
            <h3>Kỹ năng</h3>
            ${skillCard('E', c.skills?.elemental)}
            ${skillCard('Q', c.skills?.ultimate)}
            <div class="char-links">
              <button data-goto="skills">Cây kỹ năng <i>${prog.pointsSkill} điểm</i></button>
              <button data-goto="inventory">Trang bị &amp; túi đồ</button>
              <button data-goto="crafting">Chế tạo</button>
            </div>
          </div>
          <div class="char-sec">
            <h3>Trang bị</h3>
            <div class="char-eq-list">
              ${eqRow('weapon', 'Vũ khí')}${eqRow('armor', 'Giáp')}${eqRow('helmet', 'Mũ')}${eqRow('accessory', 'Phụ kiện')}
            </div>
          </div>
        </div>
      </div>
      <h3 class="aspect-title">Bốn Phương Diện</h3>
      <div class="aspect-strip">
        ${PARTY.map((a, i) => `
          <button class="aspect-card ${i === active ? 'active' : ''}" data-aspect="${i}" style="--cc:${a.css}" ${playing ? '' : 'disabled'}>
            <span class="ac-key">${i + 1}</span>
            <span class="ac-portrait">${a.portrait}</span>
            <span class="ac-name">${esc(a.name)}</span>
            <span class="ac-title">${esc(a.title)}</span>
            <span class="ac-el">${esc(a.element)}</span>
          </button>`).join('')}
      </div>`;
    body.querySelectorAll('[data-goto]').forEach((b) => b.addEventListener('click', () => this.show(b.dataset.goto)));
    body.querySelectorAll('[data-aspect]').forEach((b) => b.addEventListener('click', () => {
      if (g.switchCharacter(Number(b.dataset.aspect))) this.render();
    }));
    body.querySelectorAll('[data-attr]').forEach((b) => b.addEventListener('click', () => {
      g.progression.spendAttr(b.dataset.attr); this.render();
    }));
  }

  renderInventory(body) {
    const inv = this.game.inventory;
    const eq = inv.equipped;
    const entries = inv.entries().sort((a, b) => (itemDef(a.id).type + a.id).localeCompare(itemDef(b.id).type + b.id));
    body.innerHTML = `
      <div class="inv-layout">
        <div class="equip-col">
          <h3>Trang bị <span class="dim">· ${esc(this.game.player.character?.name || '')}</span></h3>
          ${['weapon', 'armor', 'helmet', 'accessory'].map((slot) => {
            const id = eq[slot];
            const def = id ? itemDef(id) : null;
            const plus = id ? inv.plusOf(id) : 0;
            const canUpgrade = id && (def.type === 'weapon' || def.type === 'armor' || def.type === 'helmet');
            return `<div class="equip-slot">
              <span class="dim">${{ weapon: 'Vũ khí', armor: 'Giáp', helmet: 'Đầu', accessory: 'Phụ kiện' }[slot]}</span>
              <b style="color:${def ? this.rarityColor(def.rarity) : '#666'}">${def ? esc(def.name) + (plus ? ` +${plus}` : '') : '— trống —'}</b>
              ${id && slot !== 'weapon' ? `<button data-uneq="${slot}">Tháo</button>` : ''}
              ${canUpgrade ? `<button data-upg="${id}">Nâng cấp</button>` : ''}
            </div>`;
          }).join('')}
          <div class="stat-summary" id="stat-summary"></div>
        </div>
        <div class="bag-col">
          <h3>Túi đồ <span class="dim">(${CURRENCY.icon} ${inv.coins})</span></h3>
          <div class="bag-list">
            ${entries.length ? entries.map((e) => {
              const def = itemDef(e.id);
              let actions = '';
              if (def.type === 'weapon' || def.type === 'armor' || def.type === 'helmet' || def.type === 'accessory') actions += `<button data-eq="${e.id}">Mang</button>`;
              if (def.type === 'consumable') actions += `<button data-use="${e.id}">Dùng</button>`;
              return this.itemRow(e.id, e.plus, e.qty, actions);
            }).join('') : '<p class="dim">Túi trống.</p>'}
          </div>
        </div>
      </div>`;
    const p = this.game.player;
    const st = inv.equippedStats();
    body.querySelector('#stat-summary').innerHTML = `
      <h3>Chỉ số</h3>
      <ul>
        <li>Máu: <b>${Math.ceil(p.hp)}/${p.maxHp}</b></li>
        <li>Công kích: <b>${p.effAttack().toFixed(0)}</b> (vũ khí ${st.weapon.damage}${st.weaponPlus ? '+' + st.weaponPlus : ''})</li>
        <li>Phòng thủ: <b>${p.effDefense()}</b></li>
        <li>Khí lực: <b>${Math.ceil(p.stamina)}/${p.maxStamina}</b></li>
        <li>Chí mạng: <b>${(5 + this.game.progression.attrs.agi * 0.5 + st.weapon.crit + st.crit).toFixed(0)}%</b></li>
        <li>Điểm: <b>${this.game.progression.pointsAttr}</b> thuộc tính, <b>${this.game.progression.pointsSkill}</b> kỹ năng</li>
      </ul>
      <div class="attr-row">${['str', 'agi', 'vit', 'end'].map((a) => `
        <button data-attr="${a}" ${this.game.progression.pointsAttr <= 0 ? 'disabled' : ''}>${ATTR_NAMES[a]} ${this.game.progression.attrs[a]} +</button>`).join('')}</div>`;
    body.querySelectorAll('[data-eq]').forEach((b) => b.addEventListener('click', () => { inv.equip(b.dataset.eq); this.render(); }));
    body.querySelectorAll('[data-use]').forEach((b) => b.addEventListener('click', () => { inv.useConsumable(b.dataset.use); this.render(); }));
    body.querySelectorAll('[data-uneq]').forEach((b) => b.addEventListener('click', () => { inv.unequip(b.dataset.uneq); this.render(); }));
    body.querySelectorAll('[data-upg]').forEach((b) => b.addEventListener('click', () => { this.game.crafting.upgrade(b.dataset.upg); this.render(); }));
    body.querySelectorAll('[data-attr]').forEach((b) => b.addEventListener('click', () => { this.game.progression.spendAttr(b.dataset.attr); this.render(); }));
  }

  backBar(label = 'Nhân vật') {
    return `<div class="panel-crumb"><button data-back>← ${label}</button></div>`;
  }

  renderSkills(body) {
    const prog = this.game.progression;
    body.innerHTML = `
      <div class="skill-layout">
        ${this.backBar()}
        <p>Điểm kỹ năng: <b>${prog.pointsSkill}</b> · Kỹ năng chủ động đang gán: <b>${prog.activeSkill()?.name || '—'}</b></p>
        <div class="skill-tree">
        ${Object.entries(SKILL_TREE).map(([branchId, branch]) => `
          <div class="skill-branch" style="--branch-color:${branch.color}">
            <h4>${esc(branch.name)}</h4>
            ${branch.nodes.map((n) => {
              const learned = prog.learned.includes(n.id);
              const can = prog.canLearn(n.id).ok;
              return `<div class="skill-node ${learned ? 'learned' : ''} ${can ? 'can-learn' : ''}" data-skill="${n.id}">
                <b>${esc(n.name)}</b> <span class="dim">T${n.tier} · ${n.cost}đ</span>
                <span class="dim">${esc(n.desc || (n.active && n.active.desc) || '')}</span>
                ${learned ? (n.active && prog.equippedActive === n.id ? '<i class="equipped">đang gán</i>' : n.active ? `<button data-equipactive="${n.id}">Gán</button>` : '') : `<button data-learn="${n.id}" ${can ? '' : 'disabled'}>Học</button>`}
              </div>`;
            }).join('')}
          </div>`).join('')}
        </div>
      </div>`;
    body.querySelectorAll('[data-back]').forEach((b) => b.addEventListener('click', () => this.show('character')));
    body.querySelectorAll('[data-learn]').forEach((b) => b.addEventListener('click', () => { prog.learn(b.dataset.learn); this.render(); }));
    body.querySelectorAll('[data-equipactive]').forEach((b) => b.addEventListener('click', () => { prog.equippedActive = b.dataset.equipactive; this.render(); }));
  }

  renderCrafting(body) {
    const craft = this.game.crafting;
    body.innerHTML = `
      <div class="craft-layout">
        ${this.backBar()}
        <h3>Công thức chế tạo</h3>
        <div class="recipe-list">
        ${RECIPES.map((r) => {
          const chk = craft.canCraft(r);
          const costStr = [(r.coins ? `${CURRENCY.icon}${r.coins}` : ''), ...(r.cost || []).map((c) => `${itemDef(c.id).icon}${itemDef(c.id).name} x${c.qty}`)].join(', ');
          return `<div class="recipe-row ${chk.ok ? '' : 'disabled'}">
            <span class="item-icon">${itemDef(r.out.id).icon}</span>
            <span class="item-info"><b>${esc(itemDef(r.out.id).name)} x${r.out.qty}</b><span class="dim">${esc(costStr)}</span></span>
            <button data-craft="${r.id}" ${chk.ok ? '' : 'disabled'}>Chế tạo</button>
          </div>`;
        }).join('')}
        </div>
        <p class="dim">Nâng cấp +1..+3 trong Túi đồ → "Nâng cấp".</p>
      </div>`;
    body.querySelectorAll('[data-back]').forEach((b) => b.addEventListener('click', () => this.show('character')));
    body.querySelectorAll('[data-craft]').forEach((b) => b.addEventListener('click', () => { craft.craft(b.dataset.craft); this.render(); }));
  }

  renderQuests(body) {
    const qs = this.game.quests;
    const active = qs.activeList();
    const done = qs.completedList();
    body.innerHTML = `
      <div class="quest-layout">
        ${this.backBar('Đóng')}
        <h3>Đang thực hiện (${active.length})</h3>
        ${active.length ? active.map((st) => `
          <div class="quest-card">
            <b>${esc(st.quest.name)}</b> <i class="qtype ${st.quest.type}">${st.quest.type === 'main' ? 'Chính' : 'Phụ'}</i>
            <p class="dim">${esc(st.quest.desc)}</p>
            <ul>${st.quest.objectives.map((o) => `<li class="${(st.obj.get(o.id) || 0) >= o.count ? 'done' : ''}">${esc(o.text)} ${st.obj.get(o.id) || 0}/${o.count}</li>`).join('')}</ul>
          </div>`).join('') : '<p class="dim">Không có nhiệm vụ nào đang mở.</p>'}
        <h3>Đã hoàn thành (${done.length})</h3>
        ${done.length ? `<ul class="done-list">${done.map((q) => `<li>✔ ${esc(q.name)}</li>`).join('')}</ul>` : '<p class="dim">Chưa hoàn thành nhiệm vụ nào.</p>'}
      </div>`;
    body.querySelectorAll('[data-back]').forEach((b) => b.addEventListener('click', () => this.closeAll()));
  }

  renderHandbook(body) {
    const groups = actionsByGroup();
    body.innerHTML = `
      <div class="handbook-layout">
        <h2>Sổ Tay Nhà Mạo Hiểm</h2>
        <p class="dim">Bảng điều khiển, cơ chế chiến đấu và mẹo sinh tồn.</p>
        <div class="handbook-grid">
          ${[...groups.entries()].map(([group, list]) => `
            <div class="hb-card">
              <h3>${esc(group)}</h3>
              ${list.map((a) => `<div class="hb-row"><kbd>${esc(a.key)}</kbd><span>${esc(a.label)}</span></div>`).join('')}
            </div>`).join('')}
          <div class="hb-card wide">
            <h3>Cơ chế</h3>
            <div class="hb-tip"><b>Parry:</b> giữ chuột phải đúng lúc đòn địch chạm người → kẻ địch mất thăng bằng.</div>
            <div class="hb-tip"><b>Né:</b> gõ nhanh Shift (không giữ) để lăn né; giữ Shift để chạy nhanh.</div>
            <div class="hb-tip"><b>Ngắm:</b> R đưa camera qua vai và khoá mục tiêu gần nhất; Hayate &amp; Genkai bắn xa.</div>
            <div class="hb-tip"><b>Thị giác nguyên tố:</b> giữ chuột giữa để soi kẻ địch xuyên vật thể.</div>
            <div class="hb-tip"><b>Thiền:</b> T khi đứng yên để hồi máu và khí lực, nhưng dễ bị đánh.</div>
            <div class="hb-tip"><b>Đổi nhân vật:</b> 1–4 giữ nguyên tỉ lệ máu; mỗi người có bộ kỹ năng E/Q riêng.</div>
            <div class="hb-tip"><b>Vật phẩm nhanh:</b> Z tự chọn thuốc phù hợp với tình trạng hiện tại.</div>
          </div>
        </div>
      </div>`;
  }

  renderFormation(body) {
    const g = this.game;
    const active = g.player?.characterIndex ?? 0;
    const roles = {
      kensei: 'Tiên phong · cận chiến cân bằng',
      hayate: 'Hậu tuyến · bắn tỉa tầm xa',
      onmyoji: 'Pháp thuật · sát thương diện rộng',
      tetsu: 'Khiên chắn · phòng thủ và khống chế',
    };
    body.innerHTML = `
      <div class="formation-layout">
        <h2>Đội Hình</h2>
        <p class="dim">Bốn phương diện cùng chia sẻ sinh lực. Người dẫn đầu nhận đòn trực diện; đổi người khi cần bộ kỹ năng khác.</p>
        <div class="formation-track">
          ${PARTY.map((c, i) => `
            <button class="formation-slot ${i === active ? 'active' : ''}" data-aspect="${i}" style="--cc:${c.css}" ${g.state === 'playing' ? '' : 'disabled'}>
              <span class="fs-order">${i + 1}</span>
              <span class="fs-portrait">${c.portrait}</span>
              <b>${esc(c.name)}</b>
              <span class="dim">${esc(roles[c.id] || c.title)}</span>
              <span class="fs-el">${esc(c.element)}</span>
              ${i === active ? '<i class="fs-active">ĐANG DẪN ĐẦU</i>' : ''}
            </button>`).join('<span class="fs-link">›</span>')}
        </div>
        <div class="formation-note">
          <b>Mẹo đội hình:</b> Tetsu mở màn để giữ tuyến, Hayate đứng sau bắn tỉa, Genkai tung Q khi địch tụ lại, Kensei lao vào kết liễu.
        </div>
      </div>`;
    body.querySelectorAll('[data-aspect]').forEach((b) => b.addEventListener('click', () => {
      if (g.switchCharacter(Number(b.dataset.aspect))) this.render();
    }));
  }

  renderMultiplayer(body) {
    const g = this.game;
    const active = g.player?.characterIndex ?? 0;
    body.innerHTML = `
      <div class="mp-layout">
        <div class="mp-head">
          <h2>Menu Nhiều Người Chơi</h2>
          <span class="mp-badge">CỤC BỘ</span>
        </div>
        <p class="dim">Bản này chưa có máy chủ trực tuyến. Đội bốn nhân vật được điều khiển luân phiên ngay trong một phiên (hotseat).</p>
        <div class="mp-party">
          ${PARTY.map((c, i) => `
            <div class="mp-row ${i === active ? 'active' : ''}" style="--cc:${c.css}">
              <span class="mp-portrait">${c.portrait}</span>
              <span class="mp-name"><b>${esc(c.name)}</b><span class="dim">${esc(c.title)} · ${esc(c.element)}</span></span>
              <button data-aspect="${i}" ${g.state === 'playing' ? '' : 'disabled'}>${i === active ? 'Đang chơi' : 'Chuyển'}</button>
            </div>`).join('')}
        </div>
        <div class="mp-tip">
          <b>Chơi chung màn hình:</b> mỗi người giữ một phím 1–4 khi đến lượt; máu và khí lực dùng chung nên hãy phối hợp.
        </div>
      </div>`;
    body.querySelectorAll('[data-aspect]').forEach((b) => b.addEventListener('click', () => {
      if (g.switchCharacter(Number(b.dataset.aspect))) this.render();
    }));
  }

  renderMap(body) {
    const g = this.game;
    if (g.mode === 'infinite' && g.infinite) {
      if (!this.worldMap) this.worldMap = new WorldMap(g);
      body.innerHTML = `
        <div class="map-layout">
          <h3>Bản Đồ Thế Giới Vô Cực</h3>
          <canvas id="world-map-canvas" width="640" height="470" class="world-map"></canvas>
          <p class="dim">Ô màu = đã khám phá · ☠ n = mức nguy hiểm · ☑ viền xanh = vùng an toàn · 🚩 điểm hẹn</p>
        </div>`;
      this.worldMap.attach(body.querySelector('#world-map-canvas'));
      this.worldMap.draw();
      return;
    }
    const def = g.world.def;
    if (!def) { body.innerHTML = '<p class="dim">Chưa vào khu vực nào.</p>'; return; }
    body.innerHTML = `
      <div class="map-layout">
        <h3>${esc(def.name)}</h3>
        <canvas id="map-canvas" width="640" height="480"></canvas>
        <p class="dim">🟪 bạn · 🔴 địch · 🟡 đài hồi sinh · 🟢 tài nguyên · 🟦 mục tiêu · 🟧 cổng mục tiêu</p>
      </div>`;
    const cv = body.querySelector('#map-canvas');
    const ctx = cv.getContext('2d');
    const S = def.size;
    const toCv = (x, z) => [((x + S / 2) / S) * cv.width, ((z + S / 2) / S) * cv.height];
    ctx.fillStyle = '#14161a';
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.strokeStyle = '#3a3f46';
    ctx.strokeRect(2, 2, cv.width - 4, cv.height - 4);
    ctx.strokeStyle = '#4a4436';
    ctx.beginPath();
    const [rx1, rz1] = toCv(0, S / 2), [rx2, rz2] = toCv(0, -S / 2);
    ctx.moveTo(rx1, rz1); ctx.lineTo(rx2, rz2); ctx.stroke();
    for (const it of g.world.interactables) {
      const [cx, cz] = toCv(it.x, it.z);
      const colors = { shrine: '#ffd257', resource: '#7ae0a0', goal: '#7ae0ff', chest: '#c8a050', merchant: '#e0a0c0', pickup: '#b0e0ff', gate: '#ffb057' };
      ctx.fillStyle = colors[it.type] || '#888';
      if (it.used && it.type !== 'shrine') continue;
      ctx.beginPath(); ctx.arc(cx, cz, it.type === 'goal' || it.type === 'shrine' ? 7 : 4, 0, 7); ctx.fill();
    }
    for (const n of g.npcs) {
      if (n.combat.dead) continue;
      const [cx, cz] = toCv(n.pos.x, n.pos.z);
      ctx.fillStyle = n.faction === 'samurai_ally' ? '#7ac8ff' : n.faction === 'villager' ? '#9ae08a' : factionColor(n.faction);
      ctx.beginPath(); ctx.arc(cx, cz, n.isBoss ? 8 : 5, 0, 7); ctx.fill();
      if (n.isBoss) { ctx.strokeStyle = '#fff'; ctx.stroke(); }
    }
    for (const c of g.creatures || []) {
      if (c.combat.dead) continue;
      const [cx, cz] = toCv(c.pos.x, c.pos.z);
      ctx.fillStyle = '#b8a878';
      ctx.beginPath(); ctx.arc(cx, cz, 3.5, 0, 7); ctx.fill();
    }
    const [px, pz] = toCv(g.player.pos.x, g.player.pos.z);
    ctx.fillStyle = '#c8a0ff';
    ctx.beginPath(); ctx.arc(px, pz, 6, 0, 7); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.stroke();
  }

  renderShop(body) {
    const g = this.game;
    const inv = g.inventory;
    const stock = [
      { id: 'bandage', price: 12 }, { id: 'healing_draught', price: 35 }, { id: 'focus_tonic', price: 26 },
      { id: 'war_bell', price: 65 }, { id: 'herb', price: 8 }, { id: 'iron_ore', price: 15 }, { id: 'silk', price: 22 },
      { id: 'iron_katana', price: 140 }, { id: 'ronin_garb', price: 160 },
    ];
    body.innerHTML = `
      <div class="shop-layout">
        <h3>Thương nhân lưu động <span class="dim">(${CURRENCY.icon} ${inv.coins})</span></h3>
        <div class="bag-list">
        ${stock.map((s) => {
          const def = itemDef(s.id);
          return `<div class="item-row" style="border-color:${this.rarityColor(def.rarity)}">
            <span class="item-icon">${def.icon}</span>
            <span class="item-info"><b>${esc(def.name)}</b><span class="dim">${esc(def.desc || '')}</span></span>
            <span class="item-qty">${CURRENCY.icon} ${s.price}</span>
            <span class="item-actions"><button data-buy="${s.id}" data-price="${s.price}" ${inv.coins >= s.price ? '' : 'disabled'}>Mua</button></span>
          </div>`;
        }).join('')}
        </div>
      </div>`;
    body.querySelectorAll('[data-buy]').forEach((b) => b.addEventListener('click', () => {
      const price = parseInt(b.dataset.price, 10);
      if (inv.spendCoins(price)) { inv.addItem(b.dataset.buy, 1); g.audio.sfx('coin'); g.ui.notify('item', `Mua ${itemDef(b.dataset.buy).name}`); }
      this.render();
    }));
  }
}
