// engine/src/effects/shader-compiler.ts — Biên soạn và áp dụng GLSL/WGSL shaders tùy chỉnh
import * as THREE from 'three';

export interface ShaderMaterialOptions {
  name?: string;
  transparent?: boolean;
  blending?: 'normal' | 'additive';
  depthWrite?: boolean;
  cache?: boolean;
}

const validationCache = new Map<string, string[]>();
const materialCache = new Map<string, THREE.ShaderMaterial>();

export function shaderProgramKey(vert: string, frag: string): string {
  const hash = (s: string): string => {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(16);
  };
  return `${hash(vert)}-${hash(frag)}`;
}

export function validateGlsl(src: string): string[] {
  const errors: string[] = [];
  let depth = 0;
  for (const ch of src) {
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    if (depth < 0) break;
  }
  if (depth !== 0) errors.push(`Ngoặc {} lệch (depth=${depth})`);
  if (!/void\s+main\s*\(/.test(src)) errors.push("Thiếu 'void main('");
  const versionIdx = src.indexOf('#version');
  if (versionIdx >= 0 && src.slice(versionIdx).includes('\n\n')) {
    errors.push('#version phải nằm ở dòng đầu file');
  }
  return errors;
}

export function createShaderMaterial(
  vert: string,
  frag: string,
  uniforms: Record<string, THREE.IUniform> = {},
  opts: ShaderMaterialOptions = {},
): THREE.ShaderMaterial {
  const key = shaderProgramKey(vert, frag);
  if (opts.cache && materialCache.has(key)) return materialCache.get(key) as THREE.ShaderMaterial;

  let errors = validationCache.get(key);
  if (!errors) {
    errors = [...validateGlsl(vert), ...validateGlsl(frag).map((e) => `[frag] ${e}`)];
    validationCache.set(key, errors);
  }
  if (errors.length > 0) {
    console.error(`[shader-compiler] GLSL "${opts.name ?? key}" có vấn đề:\n- ${errors.join('\n- ')}`);
  }

  const material = new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    uniforms: THREE.UniformsUtils.clone(uniforms),
    transparent: opts.transparent ?? false,
    depthWrite: opts.depthWrite ?? true,
    blending: opts.blending === 'additive' ? THREE.AdditiveBlending : THREE.NormalBlending,
    name: opts.name ?? `shader_${key}`,
  });
  if (opts.cache) materialCache.set(key, material);
  return material;
}

export function clearShaderCache(): void {
  validationCache.clear();
  materialCache.clear();
}
