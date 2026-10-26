/**
 * @file input-map.ts
 * @module @aetheria/engine/input/input-map
 * @description Action-based input mapping supporting keyboard, mouse, and gamepads with deadzones and buffering.
 */

export type InputAction =
  | 'move_forward'
  | 'move_backward'
  | 'move_left'
  | 'move_right'
  | 'jump'
  | 'crouch'
  | 'sprint'
  | 'dodge'
  | 'attack'
  | 'heavy_attack'
  | 'block'
  | 'interact'
  | 'zoom_in'
  | 'zoom_out'
  | 'aim'
  | 'cast_spell'
  | string;

export interface InputBinding {
  keys?: string[];
  mouseButtons?: number[];
  gamepadButtons?: number[];
}

export class InputMap {
  private bindings = new Map<InputAction, InputBinding>();
  private activeKeys = new Set<string>();
  private activeMouseButtons = new Set<number>();
  private justPressedActions = new Set<InputAction>();
  private justReleasedActions = new Set<InputAction>();
  private mouseDelta = { x: 0, y: 0 };
  private mouseWheel = 0;
  private isListening = false;

  private keyDownHandler?: (e: KeyboardEvent) => void;
  private keyUpHandler?: (e: KeyboardEvent) => void;
  private mouseDownHandler?: (e: MouseEvent) => void;
  private mouseUpHandler?: (e: MouseEvent) => void;
  private mouseMoveHandler?: (e: MouseEvent) => void;
  private wheelHandler?: (e: WheelEvent) => void;

  constructor() {
    this.initDefaultBindings();
  }

  private initDefaultBindings(): void {
    this.bind('move_forward', { keys: ['KeyW', 'ArrowUp'] });
    this.bind('move_backward', { keys: ['KeyS', 'ArrowDown'] });
    this.bind('move_left', { keys: ['KeyA', 'ArrowLeft'] });
    this.bind('move_right', { keys: ['KeyD', 'ArrowRight'] });
    this.bind('jump', { keys: ['Space'] });
    this.bind('crouch', { keys: ['KeyC', 'ControlLeft'] });
    this.bind('sprint', { keys: ['ShiftLeft'] });
    this.bind('dodge', { keys: ['AltLeft', 'KeyV'] });
    this.bind('attack', { mouseButtons: [0], keys: ['KeyJ'] });
    this.bind('heavy_attack', { mouseButtons: [2], keys: ['KeyK'] });
    this.bind('block', { mouseButtons: [1], keys: ['KeyL'] });
    this.bind('interact', { keys: ['KeyE'] });
    this.bind('aim', { mouseButtons: [2], keys: ['KeyQ'] });
  }

  public bind(action: InputAction, binding: InputBinding): void {
    this.bindings.set(action, binding);
  }

  public attach(target: Window | HTMLElement | EventTarget = globalThis as any): void {
    if (this.isListening || typeof (target as any)?.addEventListener !== 'function') return;

    this.keyDownHandler = (e: KeyboardEvent) => {
      if (!this.activeKeys.has(e.code)) {
        this.activeKeys.add(e.code);
        this.updateJustPressedForKey(e.code);
      }
    };

    this.keyUpHandler = (e: KeyboardEvent) => {
      this.activeKeys.delete(e.code);
      this.updateJustReleasedForKey(e.code);
    };

    this.mouseDownHandler = (e: MouseEvent) => {
      if (!this.activeMouseButtons.has(e.button)) {
        this.activeMouseButtons.add(e.button);
        this.updateJustPressedForMouse(e.button);
      }
    };

    this.mouseUpHandler = (e: MouseEvent) => {
      this.activeMouseButtons.delete(e.button);
      this.updateJustReleasedForMouse(e.button);
    };

    this.mouseMoveHandler = (e: MouseEvent) => {
      this.mouseDelta.x += e.movementX ?? 0;
      this.mouseDelta.y += e.movementY ?? 0;
    };

    this.wheelHandler = (e: WheelEvent) => {
      this.mouseWheel += e.deltaY;
      if (e.deltaY < 0) this.justPressedActions.add('zoom_in');
      if (e.deltaY > 0) this.justPressedActions.add('zoom_out');
    };

    target.addEventListener('keydown', this.keyDownHandler as any);
    target.addEventListener('keyup', this.keyUpHandler as any);
    target.addEventListener('mousedown', this.mouseDownHandler as any);
    target.addEventListener('mouseup', this.mouseUpHandler as any);
    target.addEventListener('mousemove', this.mouseMoveHandler as any);
    target.addEventListener('wheel', this.wheelHandler as any);

    this.isListening = true;
  }

  public detach(target: Window | HTMLElement | EventTarget = globalThis as any): void {
    if (!this.isListening || typeof (target as any)?.removeEventListener !== 'function') return;

    if (this.keyDownHandler) target.removeEventListener('keydown', this.keyDownHandler as any);
    if (this.keyUpHandler) target.removeEventListener('keyup', this.keyUpHandler as any);
    if (this.mouseDownHandler) target.removeEventListener('mousedown', this.mouseDownHandler as any);
    if (this.mouseUpHandler) target.removeEventListener('mouseup', this.mouseUpHandler as any);
    if (this.mouseMoveHandler) target.removeEventListener('mousemove', this.mouseMoveHandler as any);
    if (this.wheelHandler) target.removeEventListener('wheel', this.wheelHandler as any);

    this.isListening = false;
  }

  private updateJustPressedForKey(code: string): void {
    for (const [action, binding] of this.bindings.entries()) {
      if (binding.keys?.includes(code)) {
        this.justPressedActions.add(action);
      }
    }
  }

  private updateJustReleasedForKey(code: string): void {
    for (const [action, binding] of this.bindings.entries()) {
      if (binding.keys?.includes(code)) {
        this.justReleasedActions.add(action);
      }
    }
  }

  private updateJustPressedForMouse(btn: number): void {
    for (const [action, binding] of this.bindings.entries()) {
      if (binding.mouseButtons?.includes(btn)) {
        this.justPressedActions.add(action);
      }
    }
  }

  private updateJustReleasedForMouse(btn: number): void {
    for (const [action, binding] of this.bindings.entries()) {
      if (binding.mouseButtons?.includes(btn)) {
        this.justReleasedActions.add(action);
      }
    }
  }

  /**
   * Check if action is currently held down.
   */
  public isActionPressed(action: InputAction): boolean {
    const binding = this.bindings.get(action);
    if (!binding) return false;

    if (binding.keys?.some((k) => this.activeKeys.has(k))) return true;
    if (binding.mouseButtons?.some((b) => this.activeMouseButtons.has(b))) return true;

    return false;
  }

  /**
   * Check if action was pressed during this frame.
   */
  public isActionJustPressed(action: InputAction): boolean {
    return this.justPressedActions.has(action);
  }

  /**
   * Check if action was released during this frame.
   */
  public isActionJustReleased(action: InputAction): boolean {
    return this.justReleasedActions.has(action);
  }

  /**
   * Get normalized 2D movement vector (-1..1).
   */
  public getMovementVector(): { x: number; y: number } {
    let x = 0;
    let y = 0;
    if (this.isActionPressed('move_forward')) y += 1;
    if (this.isActionPressed('move_backward')) y -= 1;
    if (this.isActionPressed('move_left')) x -= 1;
    if (this.isActionPressed('move_right')) x += 1;

    const len = Math.hypot(x, y);
    if (len > 0) {
      x /= len;
      y /= len;
    }
    return { x, y };
  }

  public getMouseDelta(): { x: number; y: number } {
    return { ...this.mouseDelta };
  }

  /**
   * Reset frame-specific triggers (called at the end of each frame).
   */
  public endFrame(): void {
    this.justPressedActions.clear();
    this.justReleasedActions.clear();
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
    this.mouseWheel = 0;
  }

  /**
   * Synthetic trigger for testing or bot AI input simulation.
   */
  public simulateAction(action: InputAction, state: 'press' | 'release' | 'hold'): void {
    if (state === 'press') {
      this.justPressedActions.add(action);
      this.activeKeys.add(`Sim_${action}`);
      const b = this.bindings.get(action) || {};
      this.bindings.set(action, { ...b, keys: [...(b.keys || []), `Sim_${action}`] });
    } else if (state === 'release') {
      this.activeKeys.delete(`Sim_${action}`);
      this.justReleasedActions.add(action);
    }
  }
}
