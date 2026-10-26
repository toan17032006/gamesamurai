/**
 * @file network-entities.ts
 * @module @aetheria/engine/objects/network-entities
 * @description Network replication, client-side prediction, delta synchronization, and snapshot buffers.
 */

import { Transform3D } from './entities.js';

export type SyncStrategy = 'reliable' | 'unreliable' | 'delta_compressed';

export interface ReplicationPayload<TPayload = any> {
  packetId: number;
  timestamp: number;
  entityId: string;
  payload: TPayload;
}

export interface SnapshotEntry<TState = any> {
  timestamp: number;
  state: TState;
  position: [number, number, number];
}

/**
 * Generic Network-replicated entity with state serialization and interpolation.
 */
export class NetworkEntity<TSync extends Record<string, any> = Record<string, any>> {
  public readonly networkId: string;
  public ownerConnectionId?: string;
  public isLocalAuthority = false;
  public syncStrategy: SyncStrategy = 'delta_compressed';
  public transform: Transform3D;
  private _state: TSync;

  constructor(
    networkId: string,
    initialState?: TSync,
    isLocalAuthority = false,
    ownerConnectionId?: string
  ) {
    this.networkId = networkId;
    this._state = (initialState ?? {}) as TSync;
    this.isLocalAuthority = isLocalAuthority;
    this.ownerConnectionId = ownerConnectionId;
    this.transform = {
      position: [0, 0, 0],
      rotation: [0, 0, 0, 1],
      scale: [1, 1, 1],
    };
  }

  public packState(): ReplicationPayload<TSync> {
    return {
      packetId: Math.floor(Math.random() * 1000000),
      timestamp: Date.now(),
      entityId: this.networkId,
      payload: { ...this._state },
    };
  }

  public unpackState(payload: ReplicationPayload<TSync>): void {
    if (this.isLocalAuthority) return; // Do not overwrite local authority
    this._state = { ...payload.payload };
  }

  public interpolateTransform(targetPos: [number, number, number], factor = 0.2): void {
    this.transform.position[0] += (targetPos[0] - this.transform.position[0]) * factor;
    this.transform.position[1] += (targetPos[1] - this.transform.position[1]) * factor;
    this.transform.position[2] += (targetPos[2] - this.transform.position[2]) * factor;
  }

  public getState(): TSync {
    return this._state;
  }

  public setState(newState: Partial<TSync>): void {
    this._state = { ...this._state, ...newState };
  }
}

/**
 * Snapshot Buffer for network jitter smoothing and lag compensation.
 */
export class SnapshotBuffer<TState = any> {
  private _buffer: SnapshotEntry<TState>[] = [];
  public maxBufferSize: number;

  constructor(maxBufferSize = 30) {
    this.maxBufferSize = maxBufferSize;
  }

  public pushSnapshot(entry: SnapshotEntry<TState>): void {
    this._buffer.push(entry);
    this._buffer.sort((a, b) => a.timestamp - b.timestamp);
    if (this._buffer.length > this.maxBufferSize) {
      this._buffer.shift();
    }
  }

  public getInterpolatedPosition(renderTime: number): [number, number, number] | null {
    if (this._buffer.length === 0) return null;
    if (this._buffer.length === 1) return this._buffer[0].position;

    // Find two bounding snapshots
    for (let i = 0; i < this._buffer.length - 1; i++) {
      const s0 = this._buffer[i];
      const s1 = this._buffer[i + 1];

      if (renderTime >= s0.timestamp && renderTime <= s1.timestamp) {
        const span = s1.timestamp - s0.timestamp;
        const alpha = span > 0 ? (renderTime - s0.timestamp) / span : 0;

        return [
          s0.position[0] + (s1.position[0] - s0.position[0]) * alpha,
          s0.position[1] + (s1.position[1] - s0.position[1]) * alpha,
          s0.position[2] + (s1.position[2] - s0.position[2]) * alpha,
        ];
      }
    }

    // Default to newest
    return this._buffer[this._buffer.length - 1].position;
  }

  public clear(): void {
    this._buffer = [];
  }
}
