/**
 * @file audio-bus.ts
 * @module @aetheria/engine/audio/audio-bus
 * @description Audio mixing bus supporting volume channels, 3D spatial attenuation, and web audio.
 */

import type { Vec3 } from '../types/transform.types.js';

export type AudioChannel = 'master' | 'bgm' | 'sfx' | 'ambient' | 'ui' | 'voice';

export interface SoundInstance {
  id: string;
  channel: AudioChannel;
  volume: number; // 0..1
  loop: boolean;
  position?: Vec3;
  isPlaying: boolean;
}

export class AudioBus {
  private channelVolumes: Record<AudioChannel, number> = {
    master: 1.0,
    bgm: 0.8,
    sfx: 1.0,
    ambient: 0.7,
    ui: 0.9,
    voice: 1.0,
  };

  private listenerPosition: Vec3 = { x: 0, y: 0, z: 0 };
  private sounds = new Map<string, SoundInstance>();
  private muted = false;

  public setChannelVolume(channel: AudioChannel, volume: number): void {
    this.channelVolumes[channel] = Math.max(0, Math.min(1, volume));
  }

  public getChannelVolume(channel: AudioChannel): number {
    return this.channelVolumes[channel];
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setListenerPosition(pos: Vec3): void {
    this.listenerPosition = { ...pos };
  }

  /**
   * Play a sound instance through a specified audio channel.
   */
  public play(
    id: string,
    channel: AudioChannel = 'sfx',
    options: { volume?: number; loop?: boolean; position?: Vec3 } = {}
  ): SoundInstance {
    const sound: SoundInstance = {
      id,
      channel,
      volume: options.volume ?? 1.0,
      loop: options.loop ?? false,
      position: options.position ? { ...options.position } : undefined,
      isPlaying: true,
    };
    this.sounds.set(id, sound);
    return sound;
  }

  public stop(id: string): void {
    const s = this.sounds.get(id);
    if (s) {
      s.isPlaying = false;
      this.sounds.delete(id);
    }
  }

  /**
   * Calculate final effective volume considering master, channel, and 3D distance attenuation.
   */
  public getEffectiveVolume(soundId: string, maxDistance: number = 30.0): number {
    if (this.muted) return 0;
    const sound = this.sounds.get(soundId);
    if (!sound || !sound.isPlaying) return 0;

    const master = this.channelVolumes.master;
    const channelVol = this.channelVolumes[sound.channel];
    let distanceFactor = 1.0;

    if (sound.position) {
      const dist = Math.hypot(
        sound.position.x - this.listenerPosition.x,
        sound.position.y - this.listenerPosition.y,
        sound.position.z - this.listenerPosition.z
      );
      if (dist >= maxDistance) return 0;
      distanceFactor = Math.max(0, 1.0 - dist / maxDistance);
    }

    return master * channelVol * sound.volume * distanceFactor;
  }

  public clear(): void {
    this.sounds.clear();
  }
}
