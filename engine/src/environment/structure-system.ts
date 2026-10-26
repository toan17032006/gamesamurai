/**
 * @file structure-system.ts
 * @module @aetheria/engine/environment/structure-system
 * @description Structural integrity, wall breaching, pillar destruction, and building collapse.
 */

import type { BuildingStructureState } from '../types/environment.types.js';
import type { Vec3 } from '../types/transform.types.js';

export interface StructureSection {
  id: string;
  name: string;
  isLoadBearing: boolean;
  health: number;
  maxHealth: number;
  isBroken: boolean;
}

export interface DamageStructureResult {
  structureId: string;
  sectionId: string;
  sectionBroken: boolean;
  overallIntegrity: number;
  isCollapsed: boolean;
  rubbleSpawned: boolean;
}

export class StructureSystem {
  private structures = new Map<string, BuildingStructureState>();
  private sections = new Map<string, Map<string, StructureSection>>();

  /**
   * Register a building or architectural structure.
   */
  public registerStructure(
    id: string,
    name: string,
    position: Vec3,
    sectionsList: Array<{ id: string; name: string; isLoadBearing?: boolean; maxHealth?: number }>
  ): BuildingStructureState {
    const sectionMap = new Map<string, StructureSection>();
    for (const s of sectionsList) {
      const maxHealth = s.maxHealth ?? 100;
      sectionMap.set(s.id, {
        id: s.id,
        name: s.name,
        isLoadBearing: s.isLoadBearing ?? false,
        health: maxHealth,
        maxHealth,
        isBroken: false,
      });
    }

    this.sections.set(id, sectionMap);

    const structure: BuildingStructureState = {
      id,
      name,
      position: { ...position },
      integrity: 100,
      isCollapsed: false,
      sectionsBroken: [],
      rubbleSpawned: false,
    };

    this.structures.set(id, structure);
    return structure;
  }

  /**
   * Apply damage to a specific section of a structure.
   */
  public damageSection(structureId: string, sectionId: string, damage: number): DamageStructureResult {
    const struct = this.structures.get(structureId);
    if (!struct) {
      throw new Error(`Structure ${structureId} not found.`);
    }

    const sectionMap = this.sections.get(structureId);
    const section = sectionMap?.get(sectionId);
    if (!section) {
      throw new Error(`Section ${sectionId} not found in structure ${structureId}.`);
    }

    let newlyBroken = false;
    if (!section.isBroken) {
      section.health = Math.max(0, section.health - damage);
      if (section.health <= 0) {
        section.isBroken = true;
        newlyBroken = true;
        if (!struct.sectionsBroken.includes(sectionId)) {
          struct.sectionsBroken.push(sectionId);
        }
      }
    }

    // Recalculate integrity
    this.recalculateIntegrity(structureId);

    return {
      structureId,
      sectionId,
      sectionBroken: section.isBroken,
      overallIntegrity: struct.integrity,
      isCollapsed: struct.isCollapsed,
      rubbleSpawned: struct.rubbleSpawned,
    };
  }

  private recalculateIntegrity(structureId: string): void {
    const struct = this.structures.get(structureId);
    const sectionMap = this.sections.get(structureId);
    if (!struct || !sectionMap) return;

    let totalWeight = 0;
    let currentHealthWeight = 0;
    let brokenLoadBearingCount = 0;
    let totalLoadBearingCount = 0;

    for (const s of sectionMap.values()) {
      const weight = s.isLoadBearing ? 3 : 1;
      totalWeight += weight;
      currentHealthWeight += (s.health / s.maxHealth) * weight;

      if (s.isLoadBearing) {
        totalLoadBearingCount++;
        if (s.isBroken) brokenLoadBearingCount++;
      }
    }

    const rawIntegrity = totalWeight > 0 ? (currentHealthWeight / totalWeight) * 100 : 0;
    struct.integrity = Math.max(0, Math.min(100, Math.round(rawIntegrity)));

    // Collapse condition: > 50% load bearing sections destroyed, or overall integrity < 20%
    const criticalLoadLoss = totalLoadBearingCount > 0 && (brokenLoadBearingCount / totalLoadBearingCount) >= 0.5;
    if ((criticalLoadLoss || struct.integrity < 20) && !struct.isCollapsed) {
      struct.isCollapsed = true;
      struct.rubbleSpawned = true;
    }
  }

  public getStructure(id: string): BuildingStructureState | undefined {
    return this.structures.get(id);
  }

  public getSections(id: string): StructureSection[] {
    const map = this.sections.get(id);
    return map ? Array.from(map.values()) : [];
  }

  public clear(): void {
    this.structures.clear();
    this.sections.clear();
  }
}
