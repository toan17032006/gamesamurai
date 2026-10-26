/**
 * @file interactive-props.ts
 * @module @aetheria/engine/environment/interactive-props
 * @description Interactive environment props: levers, buttons, pressure plates, chests, doors, and traps.
 */

import type { InteractivePropState } from '../types/environment.types.js';
import type { Vec3 } from '../types/transform.types.js';

export interface PropLink {
  sourceId: string;
  targetId: string;
  triggerCondition: 'on' | 'off' | 'any';
  action: 'toggle' | 'open' | 'close' | 'activate' | 'damage';
}

export class InteractivePropsSystem {
  private props = new Map<string, InteractivePropState>();
  private links: PropLink[] = [];
  private listeners: Array<(prop: InteractivePropState) => void> = [];
  private timedResets = new Map<string, number>();

  /**
   * Register a new interactive prop.
   */
  public registerProp(
    id: string,
    type: InteractivePropState['type'],
    options: {
      isActivated?: boolean;
      stateValue?: number;
      isLocked?: boolean;
      durability?: number;
    } = {}
  ): InteractivePropState {
    const prop: InteractivePropState = {
      id,
      type,
      isActivated: options.isActivated ?? false,
      stateValue: options.stateValue ?? (options.isActivated ? 1 : 0),
      isLocked: options.isLocked ?? false,
      durability: options.durability ?? 100,
    };
    this.props.set(id, prop);
    return prop;
  }

  /**
   * Link an interactive prop to another (e.g. lever activates door).
   */
  public linkProps(sourceId: string, targetId: string, options: Partial<PropLink> = {}): void {
    this.links.push({
      sourceId,
      targetId,
      triggerCondition: options.triggerCondition ?? 'on',
      action: options.action ?? 'toggle',
    });
  }

  /**
   * Interact with a prop (player pressing 'E', stepping on plate, unlocking chest).
   */
  public interact(
    propId: string,
    options: { keyItem?: string; autoResetSeconds?: number } = {}
  ): { success: boolean; state: InteractivePropState; reason?: string } {
    const prop = this.props.get(propId);
    if (!prop) {
      throw new Error(`Interactive prop ${propId} not found.`);
    }

    if (prop.isLocked) {
      if (options.keyItem) {
        prop.isLocked = false;
      } else {
        return { success: false, state: prop, reason: 'Locked' };
      }
    }

    // Toggle or activate
    if (prop.type === 'button' || prop.type === 'pressure_plate') {
      prop.isActivated = true;
      prop.stateValue = 1.0;
      if (options.autoResetSeconds) {
        this.timedResets.set(propId, options.autoResetSeconds);
      }
    } else {
      prop.isActivated = !prop.isActivated;
      prop.stateValue = prop.isActivated ? 1.0 : 0.0;
    }

    // Notify listeners
    this.notify(prop);

    // Process links
    this.processLinks(prop);

    return { success: true, state: prop };
  }

  /**
   * Step off a pressure plate or release.
   */
  public release(propId: string): void {
    const prop = this.props.get(propId);
    if (!prop) return;

    if (prop.type === 'pressure_plate') {
      prop.isActivated = false;
      prop.stateValue = 0.0;
      this.notify(prop);
      this.processLinks(prop);
    }
  }

  public update(deltaTime: number): void {
    for (const [propId, remaining] of this.timedResets.entries()) {
      const nextRemaining = remaining - deltaTime;
      if (nextRemaining <= 0) {
        this.timedResets.delete(propId);
        const prop = this.props.get(propId);
        if (prop) {
          prop.isActivated = false;
          prop.stateValue = 0.0;
          this.notify(prop);
          this.processLinks(prop);
        }
      } else {
        this.timedResets.set(propId, nextRemaining);
      }
    }
  }

  private processLinks(sourceProp: InteractivePropState): void {
    for (const link of this.links) {
      if (link.sourceId === sourceProp.id) {
        const matchesCondition =
          link.triggerCondition === 'any' ||
          (link.triggerCondition === 'on' && sourceProp.isActivated) ||
          (link.triggerCondition === 'off' && !sourceProp.isActivated);

        if (matchesCondition) {
          const target = this.props.get(link.targetId);
          if (target) {
            if (link.action === 'toggle') {
              target.isActivated = !target.isActivated;
              target.stateValue = target.isActivated ? 1.0 : 0.0;
            } else if (link.action === 'open' || link.action === 'activate') {
              target.isActivated = true;
              target.stateValue = 1.0;
            } else if (link.action === 'close') {
              target.isActivated = false;
              target.stateValue = 0.0;
            }
            this.notify(target);
          }
        }
      }
    }
  }

  private notify(prop: InteractivePropState): void {
    for (const listener of this.listeners) {
      listener(prop);
    }
  }

  public onPropChanged(listener: (prop: InteractivePropState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const idx = this.listeners.indexOf(listener);
      if (idx !== -1) this.listeners.splice(idx, 1);
    };
  }

  public getProp(id: string): InteractivePropState | undefined {
    return this.props.get(id);
  }

  public getAllProps(): InteractivePropState[] {
    return Array.from(this.props.values());
  }

  public clear(): void {
    this.props.clear();
    this.links = [];
    this.timedResets.clear();
    this.listeners = [];
  }
}
