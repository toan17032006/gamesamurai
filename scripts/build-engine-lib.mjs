// Build engine @aetheria/engine (TS, ./engine/src) -> JS ESM có thể import được
// cả bởi esbuild (bundle game) lẫn Node test runner (không strip-type .js->.ts).
// three để external để game và engine dùng chung 1 instance three.
import * as esbuild from 'esbuild';
await esbuild.build({
  entryPoints: ['scripts/engine-entry.js'],
  bundle: true,
  format: 'esm',
  platform: 'neutral',
  target: ['es2020'],
  external: ['three', 'three/*'],
  outfile: 'web/src/assets/engine-lib.js',
  logLevel: 'info',
});
console.log('[engine-lib] done -> web/src/assets/engine-lib.js');
