/**
 * @file extension-registry.ts
 * @module @aetheria/engine/asset-parser/extension-registry
 * @description Pluggable extension parser registry for engine custom extensions and user-defined formats.
 */

import type { AssetParserPlugin, UniversalAssetFormat } from '../types/format.types.js';
import { EngineResult, engineOk, engineErr } from '../types/engine.types.js';

export class ExtensionRegistry {
  private plugins = new Map<string, AssetParserPlugin>();
  private extensionMap = new Map<string, string>(); // ext -> plugin id

  constructor() {
    this.registerDefaultExtensions();
  }

  public register(plugin: AssetParserPlugin): EngineResult<boolean> {
    if (this.plugins.has(plugin.id)) {
      return engineErr({
        code: 'PLUGIN_ALREADY_EXISTS',
        message: `Plugin with ID "${plugin.id}" is already registered.`,
        subsystem: 'ExtensionRegistry'
      });
    }

    this.plugins.set(plugin.id, plugin);
    for (const ext of plugin.extensions) {
      const cleanExt = ext.toLowerCase().replace(/^\./, '');
      this.extensionMap.set(cleanExt, plugin.id);
    }

    return engineOk(true, { pluginId: plugin.id });
  }

  public unregister(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;

    for (const ext of plugin.extensions) {
      const cleanExt = ext.toLowerCase().replace(/^\./, '');
      if (this.extensionMap.get(cleanExt) === pluginId) {
        this.extensionMap.delete(cleanExt);
      }
    }

    return this.plugins.delete(pluginId);
  }

  public get(idOrFormatOrExt: string): AssetParserPlugin | undefined {
    const clean = idOrFormatOrExt.toLowerCase().replace(/^\./, '');
    if (this.plugins.has(idOrFormatOrExt)) {
      return this.plugins.get(idOrFormatOrExt);
    }
    const mappedId = this.extensionMap.get(clean);
    if (mappedId) {
      return this.plugins.get(mappedId);
    }
    for (const plugin of this.plugins.values()) {
      if (plugin.format.toLowerCase() === clean) {
        return plugin;
      }
    }
    return undefined;
  }

  public has(idOrFormatOrExt: string): boolean {
    return this.get(idOrFormatOrExt) !== undefined;
  }

  public getByMagicBytes(header: Uint8Array): AssetParserPlugin | undefined {
    for (const plugin of this.plugins.values()) {
      if (plugin.magicBytes && plugin.magicBytes.length > 0) {
        let match = true;
        for (let i = 0; i < plugin.magicBytes.length; i++) {
          if (header[i] !== plugin.magicBytes[i]) {
            match = false;
            break;
          }
        }
        if (match) return plugin;
      }
    }
    return undefined;
  }

  public getAll(): AssetParserPlugin[] {
    return Array.from(this.plugins.values());
  }

  public clear(): void {
    this.plugins.clear();
    this.extensionMap.clear();
    this.registerDefaultExtensions();
  }

  private registerDefaultExtensions(): void {
    // 1. Forge Design (.forge / .forge.json)
    this.register({
      id: 'ext_forge_design',
      name: 'Procedural Forge Design Specification',
      format: 'forge-design',
      extensions: ['forge', 'forge.json'],
      mimeTypes: ['application/vnd.aetheria.forge+json'],
      canParse: (header, ext) => ext.includes('forge'),
      parse: (input) => {
        const text = typeof input === 'string' ? input : new TextDecoder().decode(input as ArrayBuffer);
        return JSON.parse(text);
      }
    });

    // 2. Bot Specification (.bot / .bot.json)
    this.register({
      id: 'ext_bot_spec',
      name: 'NPC Bot AI Archetype Specification',
      format: 'bot-spec',
      extensions: ['bot', 'bot.json'],
      mimeTypes: ['application/vnd.aetheria.bot+json'],
      canParse: (header, ext) => ext.includes('bot'),
      parse: (input) => {
        const text = typeof input === 'string' ? input : new TextDecoder().decode(input as ArrayBuffer);
        return JSON.parse(text);
      }
    });

    // 3. Asset Manifest (.manifest / .manifest.json)
    this.register({
      id: 'ext_asset_manifest',
      name: 'Aetheria Asset Manifest Metadata',
      format: 'asset-manifest',
      extensions: ['manifest', 'manifest.json'],
      mimeTypes: ['application/vnd.aetheria.manifest+json'],
      canParse: (header, ext) => ext.includes('manifest'),
      parse: (input) => {
        const text = typeof input === 'string' ? input : new TextDecoder().decode(input as ArrayBuffer);
        return JSON.parse(text);
      }
    });

    // 4. Asset Sidecar (.sidecar / .sidecar.json)
    this.register({
      id: 'ext_asset_sidecar',
      name: 'Asset Spatial Sidecar Data',
      format: 'asset-sidecar',
      extensions: ['sidecar', 'sidecar.json'],
      mimeTypes: ['application/vnd.aetheria.sidecar+json'],
      canParse: (header, ext) => ext.includes('sidecar'),
      parse: (input) => {
        const text = typeof input === 'string' ? input : new TextDecoder().decode(input as ArrayBuffer);
        return JSON.parse(text);
      }
    });
  }
}

let defaultExtensionRegistry: ExtensionRegistry | null = null;

export function getExtensionRegistry(): ExtensionRegistry {
  if (!defaultExtensionRegistry) {
    defaultExtensionRegistry = new ExtensionRegistry();
  }
  return defaultExtensionRegistry;
}
