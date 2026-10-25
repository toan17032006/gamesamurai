// Keyboard + mouse input: bindable actions, mouse buttons, tap/hold, Alt cursor.
import { ACTIONS } from '../data/keys.js';

const MOUSE_CODES = { 0: 'Mouse0', 1: 'Mouse1', 2: 'Mouse2' };
const PREVENT = new Set(['Tab', 'Space', 'F1', 'F2', 'Enter', 'AltLeft', 'AltRight', 'ControlLeft']);

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.binds = {}; // action -> code
    for (const [action, def] of Object.entries(ACTIONS)) this.binds[action] = def.default;
    this.codeToAction = {};
    this._rebuildMap();

    this.held = new Set();
    this.pressed = new Set();   // edge (key down / mouse down)
    this.taps = new Set();      // quick press+release this frame (Shift tap = dodge)
    this._downAt = new Map();   // action -> timestamp
    this.mouseDX = 0; this.mouseDY = 0;
    this.wheel = 0;
    this.pointerLocked = false;
    this.enabled = true;
    this.altCursor = false;
    this.chatMode = false;      // chat đang mở: nhường toàn bộ phím cho ô nhập
    this.onEscape = null;
    this.onPanelKey = null;     // (action, event) for UI hotkeys
    this._relockOnAlt = false;
    this._mouseArmed = false;   // first click only grabs the pointer

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') { if (this.onEscape) this.onEscape(); return; }
      if (e.repeat) return;
      if (e.code === 'AltLeft' || e.code === 'AltRight') {
        e.preventDefault();
        if (!this.enabled) return;
        this._relockOnAlt = this.pointerLocked;
        this.altCursor = true;
        this.releasePointer();
        return;
      }
      if (!this.enabled) {
        if (this.chatMode) return;
        // panel hotkeys still need to reach the game while input is suspended
        const a = this.codeToAction[e.code];
        if (a && this.onPanelKey) { e.preventDefault(); this.onPanelKey(a, e); }
        return;
      }
      if (PREVENT.has(e.code) || (e.ctrlKey && /^Key[WASD]$/.test(e.code))) e.preventDefault();
      const action = this.codeToAction[e.code];
      if (!action) return;
      if (!this.held.has(action)) { this.pressed.add(action); this._downAt.set(action, performance.now()); }
      this.held.add(action);
      if (this.onPanelKey) this.onPanelKey(action, e);
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'AltLeft' || e.code === 'AltRight') {
        this.altCursor = false;
        if (this._relockOnAlt && this.enabled) this.requestPointer();
        this._relockOnAlt = false;
        return;
      }
      const action = this.codeToAction[e.code];
      if (!action) return;
      this.held.delete(action);
      const down = this._downAt.get(action) || 0;
      this._downAt.delete(action);
      if (performance.now() - down < 210) this.taps.add(action);
    });
    window.addEventListener('blur', () => {
      this.held.clear();
      this.taps.clear();
      this.altCursor = false;
    });

    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 1) e.preventDefault();
      if (!this.enabled || this.altCursor) return;
      if (!this.pointerLocked) {
        this.requestPointer();
        // browsers may refuse pointer lock (headless): first left click only arms combat
        if (e.button === 0 && !this._mouseArmed) { this._mouseArmed = true; return; }
      }
      this._mouseAction(e.button, true);
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 1) e.preventDefault();
      const code = MOUSE_CODES[e.button];
      const action = code && this.codeToAction[code];
      if (!action) return;
      this.held.delete(action);
      const down = this._downAt.get(action) || 0;
      this._downAt.delete(action);
      if (performance.now() - down < 210) this.taps.add(action);
    });
    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === canvas;
    });
    document.addEventListener('mousemove', (e) => {
      if (!this.pointerLocked || !this.enabled) return;
      this.mouseDX += e.movementX || 0;
      this.mouseDY += e.movementY || 0;
    });
    document.addEventListener('wheel', (e) => {
      if (!this.enabled) return;
      this.wheel += Math.sign(e.deltaY);
    }, { passive: true });
    document.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  _mouseAction(button, down) {
    const code = MOUSE_CODES[button];
    const action = code && this.codeToAction[code];
    if (!action) return;
    if (down) {
      if (!this.held.has(action)) { this.pressed.add(action); this._downAt.set(action, performance.now()); }
      this.held.add(action);
    }
  }

  _rebuildMap() {
    this.codeToAction = {};
    for (const [action, code] of Object.entries(this.binds)) this.codeToAction[code] = action;
  }

  rebind(action, code) {
    if (!ACTIONS[action] || !code) return false;
    this.binds[action] = code;
    this._rebuildMap();
    return true;
  }

  isDown(action) { return this.enabled && this.held.has(action); }
  wasPressed(action) { return this.enabled && this.pressed.has(action); }
  wasTapped(action) { return this.enabled && this.taps.has(action); }

  moveAxis() {
    const x = (this.isDown('right') ? 1 : 0) - (this.isDown('left') ? 1 : 0);
    const z = (this.isDown('forward') ? 1 : 0) - (this.isDown('back') ? 1 : 0);
    const len = Math.hypot(x, z);
    return len > 0 ? { x: x / len, z: z / len, len: 1 } : { x: 0, z: 0, len: 0 };
  }

  consumeMouse() {
    const d = { dx: this.mouseDX, dy: this.mouseDY, wheel: this.wheel };
    this.mouseDX = 0; this.mouseDY = 0; this.wheel = 0;
    return d;
  }

  endFrame() { this.pressed.clear(); this.taps.clear(); }

  releasePointer() {
    // drop pending deltas immediately: pointerlockchange arrives a frame later,
    // and a mouse move in that window would otherwise spin the camera behind a panel
    this.pointerLocked = false;
    this.mouseDX = 0; this.mouseDY = 0;
    if (document.pointerLockElement) document.exitPointerLock();
  }
  requestPointer() {
    if (document.pointerLockElement) return;
    try { const p = this.canvas.requestPointerLock(); if (p?.catch) p.catch(() => {}); } catch { /* not allowed without gesture */ }
  }
}
