/**
 * @file behavior-tree.ts
 * @module @aetheria/engine/ai/behavior-tree
 * @description Behavior Tree framework supporting Selectors, Sequences, Inverters, and Blackboards.
 */

export type NodeStatus = 'SUCCESS' | 'FAILURE' | 'RUNNING';

export class Blackboard {
  private data = new Map<string, unknown>();

  public get<T>(key: string, defaultValue?: T): T {
    return (this.data.has(key) ? this.data.get(key) : defaultValue) as T;
  }

  public set<T>(key: string, value: T): void {
    this.data.set(key, value);
  }

  public has(key: string): boolean {
    return this.data.has(key);
  }

  public delete(key: string): boolean {
    return this.data.delete(key);
  }

  public clear(): void {
    this.data.clear();
  }
}

export abstract class BehaviorNode {
  public abstract tick(blackboard: Blackboard, deltaTime: number): NodeStatus;
}

export class SequenceNode extends BehaviorNode {
  private children: BehaviorNode[];

  constructor(children: BehaviorNode[] = []) {
    super();
    this.children = children;
  }

  public tick(blackboard: Blackboard, deltaTime: number): NodeStatus {
    for (const child of this.children) {
      const status = child.tick(blackboard, deltaTime);
      if (status !== 'SUCCESS') {
        return status;
      }
    }
    return 'SUCCESS';
  }
}

export class SelectorNode extends BehaviorNode {
  private children: BehaviorNode[];

  constructor(children: BehaviorNode[] = []) {
    super();
    this.children = children;
  }

  public tick(blackboard: Blackboard, deltaTime: number): NodeStatus {
    for (const child of this.children) {
      const status = child.tick(blackboard, deltaTime);
      if (status !== 'FAILURE') {
        return status;
      }
    }
    return 'FAILURE';
  }
}

export class InvertNode extends BehaviorNode {
  private child: BehaviorNode;

  constructor(child: BehaviorNode) {
    super();
    this.child = child;
  }

  public tick(blackboard: Blackboard, deltaTime: number): NodeStatus {
    const status = this.child.tick(blackboard, deltaTime);
    if (status === 'SUCCESS') return 'FAILURE';
    if (status === 'FAILURE') return 'SUCCESS';
    return 'RUNNING';
  }
}

export class ConditionNode extends BehaviorNode {
  private predicate: (blackboard: Blackboard) => boolean;

  constructor(predicate: (blackboard: Blackboard) => boolean) {
    super();
    this.predicate = predicate;
  }

  public tick(blackboard: Blackboard): NodeStatus {
    return this.predicate(blackboard) ? 'SUCCESS' : 'FAILURE';
  }
}

export class ActionNode extends BehaviorNode {
  private action: (blackboard: Blackboard, deltaTime: number) => NodeStatus;

  constructor(action: (blackboard: Blackboard, deltaTime: number) => NodeStatus) {
    super();
    this.action = action;
  }

  public tick(blackboard: Blackboard, deltaTime: number): NodeStatus {
    return this.action(blackboard, deltaTime);
  }
}
