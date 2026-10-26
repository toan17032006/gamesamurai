/**
 * @file subsystem-activity.test.ts
 * @module @aetheria/engine/tests
 * @description Verifies per-instance subsystem activity tracking and that no
 * generated TypeScript method is left with an empty `void`/`any` body.
 */

import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  activityFor,
  getSubsystemActivity,
  recordSubsystemAction,
  resetSubsystemActivity,
} from '../src/core/subsystem-activity.js';
import { AmphibianSubsystem } from '../src/animal/subsystems/amphibian-subsystem.js';

function listTypeScriptFiles(directory: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(directory)) {
    if (entry === 'node_modules' || entry === '.git') continue;
    const fullPath = join(directory, entry);
    if (statSync(fullPath).isDirectory()) {
      files.push(...listTypeScriptFiles(fullPath));
    } else if (entry.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

describe('Subsystem activity tracking', () => {
  it('records actions per instance without sharing counters', () => {
    const first = new AmphibianSubsystem();
    const second = new AmphibianSubsystem();

    first.updateAmphibianSpine();
    first.crouchBeforeJump();

    const firstActivity = getSubsystemActivity(first);
    expect(firstActivity).toBeDefined();
    expect(firstActivity!.calls).toBe(2);
    expect(firstActivity!.lastAction).toBe('crouchBeforeJump');
    expect(firstActivity!.actions.updateAmphibianSpine).toBe(1);
    expect(firstActivity!.actions.crouchBeforeJump).toBe(1);

    expect(getSubsystemActivity(second)).toBeUndefined();
    second.updateAmphibianSpine();
    expect(getSubsystemActivity(second)!.calls).toBe(1);
    expect(getSubsystemActivity(first)!.calls).toBe(2);

    expect(activityFor(first, 'AmphibianSubsystem').getActionCount('updateAmphibianSpine')).toBe(1);
    recordSubsystemAction(first, 'customStep', 'AmphibianSubsystem');
    expect(getSubsystemActivity(first)!.actions.customStep).toBe(1);

    expect(resetSubsystemActivity(first)).toBe(true);
    expect(getSubsystemActivity(first)!.calls).toBe(0);
    expect(getSubsystemActivity(first)!.lastAction).toBe('idle');
    expect(resetSubsystemActivity(first)).toBe(true);
    expect(resetSubsystemActivity({})).toBe(false);
  });

  it('contains no empty void/any method bodies', () => {
    const root = process.cwd();
    const files = listTypeScriptFiles(root);
    const empty: string[] = [];
    const pattern = /\)\s*:\s*(?:void|any)\s*\{\s*\}\s*$/;

    for (const file of files) {
      const lines = readFileSync(file, 'utf8').split(/\r?\n/);
      for (let index = 0; index < lines.length; index++) {
        if (pattern.test(lines[index])) {
          empty.push(`${file}:${index + 1}`);
        }
      }
    }

    expect(empty).toEqual([]);
    expect(files.length).toBeGreaterThan(200);
  });
});
