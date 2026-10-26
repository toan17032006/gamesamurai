// engine/src/render/raw-backend.ts — RawWebGL2Backend: Renderer WebGL2 THUẦN TỰ VIẾT (không Three.js)
import type {
  BackendCapabilities,
  CameraData,
  MeshData,
  PointsData,
  RenderBackend,
  RenderSceneData,
} from '../types/renderer.types';

export const RAW_VERTEX_SHADER = `#version 300 es
layout(location=0) in vec3 aPosition;
layout(location=1) in vec3 aNormal;
layout(location=2) in vec2 aUv;
layout(location=3) in vec4 iCol0;
layout(location=4) in vec4 iCol1;
layout(location=5) in vec4 iCol2;
layout(location=6) in vec4 iCol3;
uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;
uniform int uInstanced;
out vec3 vNormal;
out vec2 vUv;
void main() {
  mat4 model = uInstanced == 1 ? mat4(iCol0, iCol1, iCol2, iCol3) : uModel;
  vec4 world = model * vec4(aPosition, 1.0);
  gl_Position = uProjection * uView * world;
  vNormal = mat3(model) * aNormal;
  vUv = aUv;
}`;

export function buildFragmentShader(textured: boolean): string {
  const texPart = textured
    ? `  if (uUseTexture == 1) base *= texture(uTexture, vUv).rgb;`
    : `  // no texture path`;
  return `#version 300 es
precision highp float;
in vec3 vNormal;
in vec2 vUv;
uniform vec3 uBaseColor;
uniform float uRoughness;
uniform float uMetalness;
uniform vec3 uLightDir;
uniform vec3 uLightColor;
uniform vec3 uAmbient;
uniform int uUseTexture;
uniform sampler2D uTexture;
out vec4 fragColor;
void main() {
  vec3 base = uBaseColor;
${texPart}
  vec3 n = normalize(vNormal);
  float lambert = max(dot(n, -uLightDir), 0.0);
  fragColor = vec4(base * (uAmbient + uLightColor * lambert), 1.0);
}`;
}

export const RAW_POINT_VERTEX_SHADER = `#version 300 es
layout(location=0) in vec3 aPosition;
uniform mat4 uProjection;
uniform mat4 uView;
uniform float uPointSize;
void main() {
  gl_Position = uProjection * uView * vec4(aPosition, 1.0);
  gl_PointSize = uPointSize;
}`;

export const RAW_POINT_FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform vec3 uColor;
out vec4 fragColor;
void main() {
  fragColor = vec4(uColor, 1.0);
}`;

export function mat4Identity(out = new Float32Array(16)): Float32Array {
  out.fill(0);
  out[0] = out[5] = out[10] = out[15] = 1;
  return out;
}

export function mat4Multiply(a: Float32Array, b: Float32Array, out = new Float32Array(16)): Float32Array {
  const r = out === a || out === b ? new Float32Array(16) : out;
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) sum += a[k * 4 + row] * b[col * 4 + k];
      r[col * 4 + row] = sum;
    }
  }
  if (r !== out) out.set(r);
  return out;
}

export function mat4Perspective(fovy: number, aspect: number, near: number, far: number, out = new Float32Array(16)): Float32Array {
  const f = 1 / Math.tan(fovy / 2);
  const nf = 1 / (near - far);
  out.fill(0);
  out[0] = f / aspect;
  out[5] = f;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[14] = 2 * far * near * nf;
  return out;
}

export function mat4LookAt(
  eye: [number, number, number],
  center: [number, number, number],
  up: [number, number, number],
  out = new Float32Array(16),
): Float32Array {
  let zx = eye[0] - center[0];
  let zy = eye[1] - center[1];
  let zz = eye[2] - center[2];
  let len = Math.hypot(zx, zy, zz) || 1;
  zx /= len;
  zy /= len;
  zz /= len;
  let xx = up[1] * zz - up[2] * zy;
  let xy = up[2] * zx - up[0] * zz;
  let xz = up[0] * zy - up[1] * zx;
  len = Math.hypot(xx, xy, xz);
  if (len < 1e-8) {
    xx = 1;
    xy = 0;
    xz = 0;
  } else {
    xx /= len;
    xy /= len;
    xz /= len;
  }
  const yx = zy * xz - zz * xy;
  const yy = zz * xx - zx * xz;
  const yz = zx * xy - zy * xx;
  out[0] = xx;
  out[1] = yx;
  out[2] = zx;
  out[3] = 0;
  out[4] = xy;
  out[5] = yy;
  out[6] = zy;
  out[7] = 0;
  out[8] = xz;
  out[9] = yz;
  out[10] = zz;
  out[11] = 0;
  out[12] = -(xx * eye[0] + xy * eye[1] + xz * eye[2]);
  out[13] = -(yx * eye[0] + yy * eye[1] + yz * eye[2]);
  out[14] = -(zx * eye[0] + zy * eye[1] + zz * eye[2]);
  out[15] = 1;
  return out;
}

interface MeshGL {
  vao: WebGLVertexArrayObject;
  indexBuffer: WebGLBuffer | null;
  indexCount: number;
  vertexCount: number;
  indexed: boolean;
  instanceBuffer: WebGLBuffer;
  instanceCapacity: number;
  instanceCount: number;
  geoFingerprint: string;
}

interface PointsGL {
  vao: WebGLVertexArrayObject;
  buffer: WebGLBuffer;
  capacity: number;
}

export class RawWebGL2Backend implements RenderBackend {
  readonly name = 'raw';

  private gl: WebGL2RenderingContext | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private program: WebGLProgram | null = null;
  private pointProgram: WebGLProgram | null = null;
  private meshes = new Map<string, MeshGL>();
  private points: PointsGL | null = null;
  private textures = new Map<string, { tex: WebGLTexture; ready: boolean }>();
  private broken = false;
  private disposed = false;
  private uniforms: Record<string, WebGLUniformLocation | null> = {};
  private pointUniforms: Record<string, WebGLUniformLocation | null> = {};

  init(canvas: HTMLCanvasElement): void {
    if (this.gl) return;
    this.canvas = canvas;
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false });
    if (!gl) throw new Error('RawWebGL2Backend: WebGL2 không khả dụng trên canvas này');
    this.gl = gl;
    this.program = this.compileProgram(RAW_VERTEX_SHADER, buildFragmentShader(true));
    this.pointProgram = this.compileProgram(RAW_POINT_VERTEX_SHADER, RAW_POINT_FRAGMENT_SHADER);
    if (!this.program || !this.pointProgram) {
      this.broken = true;
      return;
    }
    for (const name of ['uProjection', 'uView', 'uModel', 'uInstanced', 'uBaseColor', 'uRoughness', 'uMetalness', 'uLightDir', 'uLightColor', 'uAmbient', 'uUseTexture', 'uTexture']) {
      this.uniforms[name] = gl.getUniformLocation(this.program, name);
    }
    for (const name of ['uProjection', 'uView', 'uPointSize', 'uColor']) {
      this.pointUniforms[name] = gl.getUniformLocation(this.pointProgram, name);
    }
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
  }

  capabilities(): BackendCapabilities {
    return {
      shadows: false,
      postFx: false,
      maxLights: 1,
      instancing: true,
      webgpuSupported: false,
      computeShaders: false,
    };
  }

  resize(width: number, height: number, pixelRatio: number): void {
    const gl = this.gl;
    if (!gl || !this.canvas) return;
    this.canvas.width = Math.max(1, Math.floor(width * pixelRatio));
    this.canvas.height = Math.max(1, Math.floor(height * pixelRatio));
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  render(scene: RenderSceneData, _dt: number): void {
    const gl = this.gl;
    if (!gl || this.disposed) return;
    if (this.broken) {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.clearColor(1, 0, 1, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      return;
    }
    const w = gl.drawingBufferWidth;
    const h = gl.drawingBufferHeight;
    gl.viewport(0, 0, w, h);
    const a = scene.lights.ambient;
    gl.clearColor(((a.color >> 16) & 0xff) / 255 * a.intensity, ((a.color >> 8) & 0xff) / 255 * a.intensity, (a.color & 0xff) / 255 * a.intensity, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(this.program);
    const u = this.uniforms;
    if (u.uProjection) gl.uniformMatrix4fv(u.uProjection, false, scene.camera.projection);
    if (u.uView) gl.uniformMatrix4fv(u.uView, false, scene.camera.view);
    const d = scene.lights.directional;
    if (u.uLightDir) gl.uniform3f(u.uLightDir, d.direction[0], d.direction[1], d.direction[2]);
    if (u.uLightColor) {
      gl.uniform3f(u.uLightColor, ((d.color >> 16) & 0xff) / 255 * d.intensity, ((d.color >> 8) & 0xff) / 255 * d.intensity, (d.color & 0xff) / 255 * d.intensity);
    }
    if (u.uAmbient) {
      gl.uniform3f(u.uAmbient, ((a.color >> 16) & 0xff) / 255 * a.intensity, ((a.color >> 8) & 0xff) / 255 * a.intensity, (a.color & 0xff) / 255 * a.intensity);
    }

    const modelMatrix = mat4Identity();
    for (const mesh of scene.meshes) {
      const mgl = this.syncMeshGL(mesh);
      if (!mgl) continue;
      gl.bindVertexArray(mgl.vao);
      const instanced = (mesh.instanceCount ?? 0) > 0 && !!mesh.instanceTransforms;
      if (u.uInstanced) gl.uniform1i(u.uInstanced, instanced ? 1 : 0);
      if (instanced) {
        this.uploadInstances(mgl, mesh.instanceTransforms as Float32Array, mesh.instanceCount as number);
      } else if (u.uModel) {
        modelMatrix.set(mesh.transform);
        gl.uniformMatrix4fv(u.uModel, false, modelMatrix);
      }
      if (u.uBaseColor) gl.uniform3f(u.uBaseColor, ((mesh.material.color >> 16) & 0xff) / 255, ((mesh.material.color >> 8) & 0xff) / 255, (mesh.material.color & 0xff) / 255);
      if (u.uRoughness) gl.uniform1f(u.uRoughness, mesh.material.roughness);
      if (u.uMetalness) gl.uniform1f(u.uMetalness, mesh.material.metalness);
      if (u.uUseTexture) gl.uniform1i(u.uUseTexture, this.bindTexture(mesh.material.textureUri) ? 1 : 0);

      if (instanced) {
        if (mgl.indexed) gl.drawElementsInstanced(gl.TRIANGLES, mgl.indexCount, gl.UNSIGNED_INT, 0, mgl.instanceCount);
        else gl.drawArraysInstanced(gl.TRIANGLES, 0, mgl.vertexCount, mgl.instanceCount);
      } else {
        if (mgl.indexed) gl.drawElements(gl.TRIANGLES, mgl.indexCount, gl.UNSIGNED_INT, 0);
        else gl.drawArrays(gl.TRIANGLES, 0, mgl.vertexCount);
      }
    }
    gl.bindVertexArray(null);

    if (scene.points && scene.points.count > 0) this.renderPoints(scene.points, scene.camera);
  }

  dispose(): void {
    const gl = this.gl;
    this.disposed = true;
    if (!gl) return;
    for (const m of this.meshes.values()) {
      gl.deleteVertexArray(m.vao);
      if (m.indexBuffer) gl.deleteBuffer(m.indexBuffer);
      gl.deleteBuffer(m.instanceBuffer);
    }
    this.meshes.clear();
    if (this.points) {
      gl.deleteVertexArray(this.points.vao);
      gl.deleteBuffer(this.points.buffer);
      this.points = null;
    }
    for (const t of this.textures.values()) gl.deleteTexture(t.tex);
    this.textures.clear();
    if (this.program) gl.deleteProgram(this.program);
    if (this.pointProgram) gl.deleteProgram(this.pointProgram);
    this.program = null;
    this.pointProgram = null;
    this.gl = null;
  }

  private compileProgram(vertexSrc: string, fragmentSrc: string): WebGLProgram | null {
    const gl = this.gl;
    if (!gl) return null;
    const compile = (type: number, src: string): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('[RawWebGL2Backend] shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };
    const vs = compile(gl.VERTEX_SHADER, vertexSrc);
    const fs = compile(gl.FRAGMENT_SHADER, fragmentSrc);
    if (!vs || !fs) return null;
    const program = gl.createProgram();
    if (!program) return null;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('[RawWebGL2Backend] program link error:', gl.getProgramInfoLog(program));
      return null;
    }
    return program;
  }

  private syncMeshGL(mesh: MeshData): MeshGL | null {
    const gl = this.gl;
    if (!gl) return null;
    const fp = `${mesh.geometry.positions.length}_${mesh.geometry.normals.length}_${mesh.geometry.uvs?.length ?? 0}_${mesh.geometry.indices?.length ?? 0}_${mesh.geometry.positions[0] ?? 0}_${mesh.geometry.positions[mesh.geometry.positions.length - 1] ?? 0}`;
    const existing = this.meshes.get(mesh.id);
    if (existing && existing.geoFingerprint === fp) return existing;

    if (existing) {
      gl.deleteVertexArray(existing.vao);
      if (existing.indexBuffer) gl.deleteBuffer(existing.indexBuffer);
    }

    const vao = gl.createVertexArray();
    if (!vao) return null;
    gl.bindVertexArray(vao);

    const upload = (loc: number, data: Float32Array, size: number): void => {
      const buf = gl.createBuffer();
      if (!buf) return;
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    };
    upload(0, mesh.geometry.positions, 3);
    upload(1, mesh.geometry.normals, 3);
    upload(2, mesh.geometry.uvs ?? new Float32Array(0), 2);

    let indexBuffer: WebGLBuffer | null = null;
    let indexCount = 0;
    const drawCount = mesh.geometry.indices
      ? (indexCount = mesh.geometry.indices.length)
      : mesh.geometry.positions.length / 3;

    if (mesh.geometry.indices) {
      indexBuffer = gl.createBuffer();
      if (indexBuffer) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.geometry.indices, gl.STATIC_DRAW);
      }
    }

    const instanceBuffer = gl.createBuffer() as WebGLBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 16 * 4 * Math.max(1, mesh.instanceCount ?? 1), gl.DYNAMIC_DRAW);
    for (let i = 0; i < 4; i++) {
      const loc = 3 + i;
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 64, i * 16);
      gl.vertexAttribDivisor(loc, 1);
    }

    gl.bindVertexArray(null);
    const mgl: MeshGL = {
      vao,
      indexBuffer,
      indexCount,
      vertexCount: indexCount > 0 ? indexCount : drawCount,
      indexed: !!mesh.geometry.indices && !!indexBuffer,
      instanceBuffer,
      instanceCapacity: Math.max(1, mesh.instanceCount ?? 1),
      instanceCount: 0,
      geoFingerprint: fp,
    };
    this.meshes.set(mesh.id, mgl);
    return mgl;
  }

  private uploadInstances(mgl: MeshGL, transforms: Float32Array, count: number): void {
    const gl = this.gl;
    if (!gl) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, mgl.instanceBuffer);
    const needed = count * 16;
    if (count > mgl.instanceCapacity) {
      mgl.instanceCapacity = Math.ceil(count * 1.5);
      gl.bufferData(gl.ARRAY_BUFFER, mgl.instanceCapacity * 64, gl.DYNAMIC_DRAW);
    }
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, transforms.subarray(0, needed));
    mgl.instanceCount = count;
  }

  private bindTexture(uri: string | undefined): boolean {
    const gl = this.gl;
    if (!gl || !uri) return false;
    let entry = this.textures.get(uri);
    if (!entry) {
      const tex = gl.createTexture();
      if (!tex) return false;
      const created: { tex: WebGLTexture; ready: boolean } = { tex, ready: false };
      this.textures.set(uri, created);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 255, 255]));
      const img = new Image();
      img.onload = () => {
        const g = this.gl;
        if (!g) return;
        g.bindTexture(g.TEXTURE_2D, tex);
        g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, img);
        g.generateMipmap(g.TEXTURE_2D);
        created.ready = true;
      };
      img.src = uri;
      return false;
    }
    if (!entry.ready) return false;
    gl.bindTexture(gl.TEXTURE_2D, entry.tex);
    return true;
  }

  private renderPoints(points: PointsData, camera: CameraData): void {
    const gl = this.gl;
    if (!gl || !this.pointProgram || this.broken) return;
    if (!this.points || this.points.capacity < points.count) {
      if (this.points) {
        gl.deleteVertexArray(this.points.vao);
        gl.deleteBuffer(this.points.buffer);
      }
      const vao = gl.createVertexArray();
      const buf = gl.createBuffer();
      if (!vao || !buf) return;
      const capacity = Math.ceil(points.count * 1.5);
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, capacity * 12, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
      gl.bindVertexArray(null);
      this.points = { vao, buffer: buf, capacity };
    }
    gl.useProgram(this.pointProgram);
    const pu = this.pointUniforms;
    if (pu.uProjection) gl.uniformMatrix4fv(pu.uProjection, false, camera.projection);
    if (pu.uView) gl.uniformMatrix4fv(pu.uView, false, camera.view);
    if (pu.uPointSize) gl.uniform1f(pu.uPointSize, points.size ?? 2);
    if (pu.uColor) gl.uniform3f(pu.uColor, 1, 1, 1);
    gl.bindVertexArray(this.points.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.points.buffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, points.positions.subarray(0, points.count * 3));
    gl.drawArrays(gl.POINTS, 0, points.count);
    gl.bindVertexArray(null);
  }
}
