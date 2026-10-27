/**
 * @file quests-dialogue.ts
 * @module @aetheria/engine/objects/quests-dialogue
 * @description Quests, objective trackers, branching dialogue trees, and faction reputations.
 */

export type QuestStatus = 'unaccepted' | 'active' | 'completed' | 'failed' | 'abandoned';

export type ObjectiveType =
  | 'kill'
  | 'gather'
  | 'deliver'
  | 'talk'
  | 'explore'
  | 'survive'
  | 'craft';

export type FactionStanding =
  | 'hated'
  | 'hostile'
  | 'unfriendly'
  | 'neutral'
  | 'friendly'
  | 'honored'
  | 'revered'
  | 'exalted';

export interface QuestObjective<TTarget = unknown> {
  id: string;
  description: string;
  type: ObjectiveType;
  target: TTarget;
  currentAmount: number;
  requiredAmount: number;
}

export interface QuestReward<TReward = unknown> {
  exp?: number;
  gold?: number;
  items?: TReward[];
  reputationFaction?: string;
  reputationPoints?: number;
}

export interface DialogueChoice<TAction = unknown> {
  text: string;
  nextNodeId?: string;
  action?: TAction;
  requiredCondition?: (player: unknown) => boolean;
}

export interface DialogueNode<TChoice = DialogueChoice> {
  id: string;
  speaker: string;
  text: string;
  choices: TChoice[];
}

/**
 * Generic Quest tracker with multiple objectives and reward distribution.
 */
export class Quest<TStep extends QuestObjective = QuestObjective, TReward = QuestReward> {
  public readonly id: string;
  public title: string;
  public description: string;
  public status: QuestStatus = 'unaccepted';
  public objectives: TStep[] = [];
  public rewards: TReward[] = [];

  constructor(
    id: string,
    title: string,
    description: string,
    objectives: TStep[] = [],
    rewards: TReward[] = []
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.objectives = objectives;
    this.rewards = rewards;
  }

  public start(): boolean {
    if (this.status === 'unaccepted') {
      this.status = 'active';
      return true;
    }
    return false;
  }

  public progressObjective(objectiveId: string, amount = 1): boolean {
    if (this.status !== 'active') return false;

    const obj = this.objectives.find((o) => o.id === objectiveId);
    if (!obj) return false;

    obj.currentAmount = Math.min(obj.requiredAmount, obj.currentAmount + amount);

    if (this.isComplete()) {
      this.status = 'completed';
    }
    return true;
  }

  public isComplete(): boolean {
    return this.objectives.every((o) => o.currentAmount >= o.requiredAmount);
  }

  public complete(): TReward[] {
    if (this.status === 'completed' || this.isComplete()) {
      this.status = 'completed';
      return this.rewards;
    }
    return [];
  }

  public fail(): void {
    this.status = 'failed';
  }

  public abandon(): void {
    this.status = 'abandoned';
    for (const obj of this.objectives) {
      obj.currentAmount = 0;
    }
  }
}

/**
 * Quest Log containing the player's active and completed quest lists.
 */
export class QuestLog {
  private _quests: Map<string, Quest> = new Map();

  public addQuest(quest: Quest): boolean {
    if (this._quests.has(quest.id)) return false;
    this._quests.set(quest.id, quest);
    quest.start();
    return true;
  }

  public getQuest(id: string): Quest | undefined {
    return this._quests.get(id);
  }

  public getActiveQuests(): Quest[] {
    return Array.from(this._quests.values()).filter((q) => q.status === 'active');
  }

  public getCompletedQuests(): Quest[] {
    return Array.from(this._quests.values()).filter((q) => q.status === 'completed');
  }

  public isQuestCompleted(id: string): boolean {
    return this._quests.get(id)?.status === 'completed';
  }
}

/**
 * Branching NPC Dialogue Tree.
 */
export class DialogueTree<TChoice extends DialogueChoice = DialogueChoice> {
  private _nodes: Map<string, DialogueNode<TChoice>> = new Map();
  private _currentNode: DialogueNode<TChoice> | null = null;

  public addNode(node: DialogueNode<TChoice>): void {
    this._nodes.set(node.id, node);
  }

  public startDialogue(startNodeId: string): DialogueNode<TChoice> | null {
    const node = this._nodes.get(startNodeId);
    if (node) {
      this._currentNode = node;
      return node;
    }
    return null;
  }

  public chooseOption(choiceIndex: number, player?: unknown): DialogueNode<TChoice> | null {
    if (!this._currentNode) return null;

    const choices = this._currentNode.choices;
    if (choiceIndex < 0 || choiceIndex >= choices.length) return null;

    const choice = choices[choiceIndex];
    if (choice.requiredCondition && player && !choice.requiredCondition(player)) {
      return null; // Condition not met
    }

    if (choice.nextNodeId) {
      this._currentNode = this._nodes.get(choice.nextNodeId) ?? null;
      return this._currentNode;
    }

    // End dialogue
    this._currentNode = null;
    return null;
  }

  public getCurrentNode(): DialogueNode<TChoice> | null {
    return this._currentNode;
  }

  public endDialogue(): void {
    this._currentNode = null;
  }
}

/**
 * Faction Standing & Reputation system.
 */
export class FactionReputation<TFaction extends string = string> {
  private _reputation: Map<TFaction, number> = new Map();

  public addReputation(faction: TFaction, points: number): void {
    const curr = this._reputation.get(faction) ?? 0;
    this._reputation.set(faction, curr + points);
  }

  public getReputation(faction: TFaction): number {
    return this._reputation.get(faction) ?? 0;
  }

  public getStanding(faction: TFaction): FactionStanding {
    const rep = this.getReputation(faction);
    if (rep <= -36000) return 'hated';
    if (rep <= -6000) return 'hostile';
    if (rep <= -3000) return 'unfriendly';
    if (rep < 3000) return 'neutral';
    if (rep < 9000) return 'friendly';
    if (rep < 21000) return 'honored';
    if (rep < 42000) return 'revered';
    return 'exalted';
  }
}
