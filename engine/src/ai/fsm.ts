/**
 * @file fsm.ts
 * @module @aetheria/engine/ai/fsm
 * @description Hierarchical Finite State Machine with entry/exit lifecycle and guarded transitions.
 */

export interface StateConfig<TContext> {
  onEnter?: (context: TContext, fromState: string) => void;
  onUpdate?: (context: TContext, deltaTime: number) => void;
  onExit?: (context: TContext, toState: string) => void;
}

export interface TransitionRule<TContext> {
  from: string | string[];
  to: string;
  condition: (context: TContext) => boolean;
}

export class StateMachine<TContext> {
  private states = new Map<string, StateConfig<TContext>>();
  private transitions: TransitionRule<TContext>[] = [];
  private currentStateName: string = '';
  private context: TContext;
  private timeInState = 0;

  constructor(initialState: string, context: TContext) {
    this.currentStateName = initialState;
    this.context = context;
  }

  public registerState(name: string, config: StateConfig<TContext>): this {
    this.states.set(name, config);
    return this;
  }

  public addTransition(
    from: string | string[],
    to: string,
    condition: (context: TContext) => boolean
  ): this {
    this.transitions.push({ from, to, condition });
    return this;
  }

  public getCurrentState(): string {
    return this.currentStateName;
  }

  public getTimeInState(): number {
    return this.timeInState;
  }

  public setState(nextState: string): void {
    if (this.currentStateName === nextState) return;

    const currentConfig = this.states.get(this.currentStateName);
    if (currentConfig?.onExit) {
      currentConfig.onExit(this.context, nextState);
    }

    const previousState = this.currentStateName;
    this.currentStateName = nextState;
    this.timeInState = 0;

    const nextConfig = this.states.get(nextState);
    if (nextConfig?.onEnter) {
      nextConfig.onEnter(this.context, previousState);
    }
  }

  public update(deltaTime: number): void {
    this.timeInState += deltaTime;

    // Check transitions
    for (const rule of this.transitions) {
      const matchesFrom = Array.isArray(rule.from)
        ? rule.from.includes(this.currentStateName)
        : rule.from === this.currentStateName || rule.from === '*';

      if (matchesFrom && rule.condition(this.context)) {
        this.setState(rule.to);
        break;
      }
    }

    // Update active state
    const currentConfig = this.states.get(this.currentStateName);
    if (currentConfig?.onUpdate) {
      currentConfig.onUpdate(this.context, deltaTime);
    }
  }
}
