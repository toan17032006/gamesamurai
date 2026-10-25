// HUD: thanh máu/khí, đội 4 người, kỹ năng E/Q, vật phẩm Z, ngắm, thị giác nguyên tố.
import * as THREE from 'three';
import { esc } from '../core/utils.js';
import { CURRENCY, itemDef } from '../data/items.js';
import { PARTY } from '../data/characters.js';

const PREDICT = {
  samurai_ally: '#7ac8ff', villager: '#9ae08a', bandit: '#ff9a7a', ashura: '#ff6a3a',
  oni: '#c08aff', undead: '#b8c8d8', wildlife: '#e0c27a', shadow: '#8a9ad8',
};

export class HUD {
  constructor(game) {
    this.game = game;
    this.root = document.createElement('div');
    this.root.className = 'hud';
    this.root.style.display = 'none';
    this.root.innerHTML = `
      <div class="hud-tl">
        <div class="level-chip" id="hud-level">Chương</div>
        <div class="objectives" id="hud-objectives"></div>
      </div>
      <div class="hud-tr">
        <div class="char-chip">
          <span id="hud-clevel">Cấp 1/25</span>
          <span id="hud-coins">${CURRENCY.icon} 0</span>
        </div>
        <div class="weather-chip" id="hud-weather" style="display:none"></div>
        <div class="xpbar"><div class="xpfill" id="hud-xp"></div></div>
        <div class="buffs" id="hud-buffs"></div>
      </div>
      <div class="boss-bar" id="hud-boss" style="display:none">
        <div class="boss-name" id="hud-bossname"></div>
        <div class="boss-hp"><div class="boss-hpfill" id="hud-bosshp"></div></div>
        <div class="boss-pips" id="hud-bosspips"></div>
      </div>
      <div class="hud-bl">
        <div class="party-bar" id="hud-party"></div>
        <div class="vitals">
          <div class="level-badge" id="hud-levelbadge">1</div>
          <div class="bars">
            <div class="bar hpbar"><div class="hpfill" id="hud-hp"></div><span class="bartext" id="hud-hptext"></span></div>
            <div class="bar stabar"><div class="stafill" id="hud-sta"></div></div>
          </div>
        </div>
        <div class="ability-bar">
          <div class="ability" id="hud-skill" title="Kỹ năng nguyên tố (E)">
            <span class="ability-key">E</span>
            <span class="ability-glyph" id="hud-skillglyph">P</span>
            <span class="ability-name" id="hud-skillname">—</span>
            <div class="ability-cd" id="hud-skillcd"></div>
            <span class="ability-cdtext" id="hud-skillcdtext"></span>
          </div>
          <div class="ability ult" id="hud-ult" title="Kỹ năng nộ (Q)">
            <span class="ability-key">Q</span>
            <span class="ability-glyph" id="hud-ultglyph">B</span>
            <span class="ability-name" id="hud-ultname">—</span>
            <div class="ability-cd" id="hud-ultcd"></div>
            <span class="ability-cdtext" id="hud-ultcdtext"></span>
          </div>
          <div class="ability item" id="hud-item" title="Vật phẩm nhanh (Z)">
            <span class="ability-key">Z</span>
            <span class="ability-glyph">✚</span>
            <span class="ability-name" id="hud-itemname">Vật phẩm</span>
            <b class="item-count" id="hud-itemcount">0</b>
          </div>
        </div>
        <div class="hint-row">
          <span><b>R</b> ngắm</span><span><b>Chuột giữa</b> thị giác</span><span><b>T</b> thiền</span><span><b>F</b> tương tác</span>
        </div>
      </div>
      <div class="hud-bc">
        <div class="prompt" id="hud-prompt"></div>
        <div class="chat-hint" id="hud-chathint">Enter để chat</div>
      </div>
      <div class="hud-br"><span id="hud-fps"></span></div>
      <div class="aim-reticle" id="hud-reticle"><i></i><i></i><i></i><i></i><b></b></div>
      <div class="vision-banner" id="hud-visionbanner">THỊ GIÁC NGUYÊN TỐ</div>
      <div class="vision-markers" id="hud-markers"></div>
      <div class="meditate-badge" id="hud-meditate">THIỀN ĐỊNH</div>
      <div class="hp-vignette" id="hud-vignette"></div>
    `;
    document.getElementById('ui').appendChild(this.root);
    this.dirty = true;
    this.boss = null;
    this._prompt = '';
    this._fpsT = 0;
    this._markT = 0;
    this._partyT = 0;
    this.vision = false;
    this._v = new THREE.Vector3();
    this.refreshParty();
  }

  show() { this.root.style.display = 'block'; this.dirty = true; }
  hide() { this.root.style.display = 'none'; }

  setLevel(def, waveTotal) {
    this.root.querySelector('#hud-level').textContent = `Chương ${def.id.slice(1)} · ${def.name}${waveTotal ? ` · ${waveTotal} đợt` : ''}`;
  }

  setObjectives(list) {
    this.root.querySelector('#hud-objectives').innerHTML = list.map((o) =>
      `<div class="obj ${o.done ? 'done' : ''}">${o.done ? '☑' : '☐'} ${esc(o.text.replace(/\(0\/\d+\)/, ''))} ${o.count > 1 ? `<b>${o.cur}/${o.count}</b>` : ''}</div>`).join('');
  }

  setBoss(boss) {
    this.boss = boss;
    const bar = this.root.querySelector('#hud-boss');
    if (!boss) { bar.style.display = 'none'; return; }
    bar.style.display = 'block';
    this.root.querySelector('#hud-bossname').textContent = boss.name;
    const phases = (boss.bossDef && boss.bossDef.phases) || [];
    const pips = this.root.querySelector('#hud-bosspips');
    pips.innerHTML = phases.slice(1).map((_, i) => `<span class="pip${i + 1 <= (boss.phaseIdx || 0) ? ' lit' : ''}"></span>`).join('');
    pips.style.display = phases.length > 1 ? 'flex' : 'none';
  }

  setPrompt(text) {
    if (text !== this._prompt) {
      this._prompt = text;
      const p = this.root.querySelector('#hud-prompt');
      p.textContent = text;
      p.style.display = text ? 'block' : 'none';
    }
  }

  setWeather(name, supernatural = false) {
    const el = this.root.querySelector('#hud-weather');
    el.style.display = 'block';
    el.textContent = name;
    this._weatherName = name;
    el.classList.toggle('supernatural', !!supernatural);
  }

  setVision(on) {
    this.vision = !!on;
    this.root.classList.toggle('vision', this.vision);
    document.body.classList.toggle('vision-on', this.vision);
    const m = this.root.querySelector('#hud-markers');
    m.style.display = this.vision ? 'block' : 'none';
    if (!this.vision) m.innerHTML = '';
  }

  refreshParty() {
    const host = this.root.querySelector('#hud-party');
    if (!host) return;
    const active = this.game.player?.characterIndex ?? 0;
    host.innerHTML = PARTY.map((c, i) => `
      <button class="party-card ${i === active ? 'active' : ''}" data-char="${i}" style="--pc:${c.css}" title="${esc(c.name)} — ${esc(c.title)}">
        <span class="party-key">${i + 1}</span>
        <span class="party-portrait">${c.portrait}</span>
        <span class="party-name">${esc(c.name)}</span>
        <span class="party-el">${esc(c.element)}</span>
      </button>`).join('');
    host.querySelectorAll('[data-char]').forEach((b) => b.addEventListener('click', (e) => {
      e.stopPropagation();
      this.game.switchCharacter(Number(b.dataset.char));
    }));
  }

  flashHp() {
    const v = this.root.querySelector('#hud-vignette');
    v.classList.remove('flash');
    void v.offsetWidth;
    v.classList.add('flash');
  }

  _skillState(key, def, player) {
    if (!def) return;
    const cdEl = this.root.querySelector(`#hud-${key}cd`);
    const txtEl = this.root.querySelector(`#hud-${key}cdtext`);
    const nameEl = this.root.querySelector(`#hud-${key}name`);
    const glyphEl = this.root.querySelector(`#hud-${key}glyph`);
    if (nameEl && nameEl.textContent !== def.name) nameEl.textContent = def.name;
    if (glyphEl && glyphEl.textContent !== (def.element ? def.element[0] : '•')) glyphEl.textContent = def.element ? def.element[0] : '•';
    const cd = player.skillCd[def.id] || 0;
    const pct = cd > 0 ? Math.min(1, cd / def.cooldown) : 0;
    cdEl.style.height = `${pct * 100}%`;
    txtEl.textContent = cd > 0.05 ? cd.toFixed(1) : '';
  }

  _visionMarkers(dt) {
    if (!this.vision) return;
    this._markT -= dt;
    if (this._markT > 0) return;
    this._markT = 0.09;
    const g = this.game, cam = g.engine.camera;
    const targets = [...g.npcs, ...(g.creatures || [])].filter((n) => !n.combat?.dead && !n.disposed);
    let html = '';
    for (const n of targets) {
      const dx = n.pos.x - g.player.pos.x, dz = n.pos.z - g.player.pos.z;
      const d = Math.hypot(dx, dz);
      if (d > 48) continue;
      this._v.set(n.pos.x, n.pos.y + (n.isBoss ? 1.7 : 1.25), n.pos.z).project(cam);
      if (this._v.z > 1 || Math.abs(this._v.x) > 1.15 || Math.abs(this._v.y) > 1.15) continue;
      const x = (this._v.x * 0.5 + 0.5) * 100, y = (-this._v.y * 0.5 + 0.5) * 100;
      const col = n.faction === 'player' ? '#8ad8ff' : (PREDICT[n.faction] || '#ffb057');
      const hostile = n.faction !== 'samurai_ally' && n.faction !== 'villager';
      html += `<div class="vision-marker ${hostile ? 'hostile' : 'friendly'}" style="left:${x.toFixed(2)}%;top:${y.toFixed(2)}%;--mc:${col}">
        <span class="vm-dot"></span><span class="vm-name">${esc(n.name || '?')}</span><span class="vm-dist">${Math.round(d)}m</span></div>`;
    }
    const box = this.root.querySelector('#hud-markers');
    if (box.dataset.html !== html) { box.innerHTML = html; box.dataset.html = html; }
  }

  frame(dt) {
    if (this.root.style.display === 'none') return;
    const g = this.game;
    const p = g.player;
    if (!p) return;
    const hpPct = Math.max(0, p.hp / p.maxHp);
    this.root.querySelector('#hud-hp').style.width = `${hpPct * 100}%`;
    this.root.querySelector('#hud-hptext').textContent = `${Math.max(0, Math.ceil(p.hp))} / ${p.maxHp}`;
    this.root.querySelector('#hud-sta').style.width = `${Math.max(0, p.stamina / p.maxStamina) * 100}%`;
    const xp = g.progression.xpProgress();
    this.root.querySelector('#hud-xp').style.width = `${Math.min(100, (xp.cur / xp.need) * 100)}%`;
    this._skillState('skill', p.character?.skills?.elemental, p);
    this._skillState('ult', p.character?.skills?.ultimate, p);
    // Z item count
    let itemCount = 0, itemName = '';
    for (const e of g.inventory.entries()) {
      if (itemDef(e.id).type === 'consumable') {
        itemCount += e.qty;
        if (!itemName) itemName = itemDef(e.id).name;
      }
    }
    const ic = this.root.querySelector('#hud-itemcount');
    if (ic.textContent !== String(itemCount)) ic.textContent = String(itemCount);
    const inm = this.root.querySelector('#hud-itemname');
    const itemLabel = itemName || 'Vật phẩm';
    if (inm.textContent !== itemLabel) inm.textContent = itemLabel;
    // chips
    const coins = `${CURRENCY.icon} ${g.inventory.coins}`;
    const cEl = this.root.querySelector('#hud-coins');
    if (cEl.textContent !== coins) cEl.textContent = coins;
    const lv = `Cấp ${g.progression.level}/25`;
    const lEl = this.root.querySelector('#hud-clevel');
    if (lEl.textContent !== lv) lEl.textContent = lv;
    // waypoint (thế giới vô cực)
    const wpEl = this.root.querySelector('#hud-weather');
    if (g.mode === 'infinite' && g.infinite?.waypoint && this._weatherName) {
      const wp = g.infinite.waypoint;
      const d = Math.hypot(wp.x - p.pos.x, wp.z - p.pos.z);
      const txt = `${this._weatherName} · 🚩 ${Math.round(d)}m`;
      if (wpEl.textContent !== txt) wpEl.textContent = txt;
    }
    const badge = this.root.querySelector('#hud-levelbadge');
    const bn = String(g.progression.level);
    if (badge.textContent !== bn) badge.textContent = bn;
    // buffs
    const buffs = p.buffs.filter((b) => b.stat !== 'nextHitPct' || b.until > g.time).map((b) => {
      const names = { attackPct: 'Công+', defensePct: 'Thủ+', noStagger: 'Bất hoại', lowHpAttack: 'Trống chiến' };
      const s = Math.ceil(b.until - g.time);
      return `<span class="buff">${names[b.stat] || b.stat} ${s}s</span>`;
    }).join('');
    const bEl = this.root.querySelector('#hud-buffs');
    if (bEl.innerHTML !== buffs) bEl.innerHTML = buffs;
    // aim / meditate
    this.root.querySelector('#hud-reticle').classList.toggle('on', !!p.aimMode);
    this.root.querySelector('#hud-meditate').classList.toggle('on', !!p.meditating);
    this.root.querySelector('#hud-chathint').style.opacity = p.moving ? '0' : '0.7';
    // party highlight
    this._partyT -= dt;
    if (this._partyT <= 0) {
      this._partyT = 0.5;
      this.root.querySelectorAll('.party-card').forEach((el, i) => el.classList.toggle('active', i === (p.characterIndex ?? 0)));
    }
    // boss bar
    if (this.boss) {
      if (this.boss.combat.dead || this.boss.disposed) this.setBoss(null);
      else {
        this.root.querySelector('#hud-bosshp').style.width = `${Math.max(0, (this.boss.hp / this.boss.maxHp)) * 100}%`;
        const pips = this.root.querySelector('#hud-bosspips');
        if (pips.style.display !== 'none' && pips.children.length) {
          const lit = this.boss.phaseIdx || 0;
          [...pips.children].forEach((el, i) => el.classList.toggle('lit', i + 1 <= lit));
        }
      }
    }
    this._visionMarkers(dt);
    // fps
    this._fpsT += dt;
    if (this._fpsT > 0.5) {
      this._fpsT = 0;
      const qNames = { cinematic: '4K', ultra: 'Ultra', high: 'Cao', medium: 'TB', low: 'Thấp' };
      const st = g.engine.stats;
      const rs = g.engine.options.resolutionScale === 'auto' ? `auto ${Math.round(st.renderScale * 100)}%` : `${Math.round(st.renderScale * 100)}%`;
      this.root.querySelector('#hud-fps').textContent = `${st.fps} FPS · ${st.frameMs.toFixed(1)}ms · ${qNames[g.engine.quality] || ''} · ${rs} · ${st.drawCalls} DC`;
    }
  }
}
