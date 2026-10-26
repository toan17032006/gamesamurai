// engine/tests/asset-formats.test.ts — Kiểm chứng bóc tách & xuất tài sản đa định dạng
import { describe, it, expect } from 'vitest';
import * as THREE from 'three';

import {
  formatOf,
  kindOf,
  capabilitiesOf,
  isSupportedFormat,
  supportedFormats,
  supportedExtensions,
  FORMAT_REGISTRY,
} from '../src/asset-parser/format-registry.js';
import { parseStl, detectStlEncoding } from '../src/asset-parser/stl-parser.js';
import { parsePly } from '../src/asset-parser/ply-parser.js';
import { parseThreeDs } from '../src/asset-parser/3ds-parser.js';
import { parseUsd } from '../src/asset-parser/usd-parser.js';
import { parseBvh } from '../src/asset-parser/bvh-parser.js';
import { parseVmd } from '../src/asset-parser/vmd-parser.js';
import { parseImage, detectImageFormat, readImageInfo } from '../src/asset-parser/image-parser.js';
import { parseEngineData } from '../src/asset-parser/engine-data-parser.js';
import { AssetParser } from '../src/asset-parser/index.js';
import { AssetExporter } from '../src/procedural/asset-exporter.js';
import { AssetFactory } from '../src/procedural/asset-factory.js';

/** Tạo một mesh tứ diện đơn giản để dùng làm mẫu. */
function sampleMesh(): THREE.Mesh {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1], 3),
  );
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1], 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 0.5, 0.5], 2));
  geometry.setIndex([0, 1, 2, 0, 2, 3]);
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x3366ff }));
  mesh.name = 'SampleMesh';
  return mesh;
}

describe('format-registry — định dạng tài sản', () => {
  it('nhận diện đủ các định dạng được yêu cầu', () => {
    const expected: Array<[string, string]> = [
      ['model.glb', 'glb'],
      ['model.gltf', 'gltf'],
      ['model.fbx', 'fbx'],
      ['model.obj', 'obj'],
      ['model.dae', 'dae'],
      ['model.3ds', '3ds'],
      ['model.stl', 'stl'],
      ['model.ply', 'ply'],
      ['scene.usd', 'usd'],
      ['scene.usda', 'usda'],
      ['scene.usdc', 'usdc'],
      ['scene.abc', 'abc'],
      ['mat.mtl', 'mtl'],
      ['tex.png', 'png'],
      ['tex.jpg', 'jpg'],
      ['tex.jpeg', 'jpeg'],
      ['tex.webp', 'webp'],
      ['tex.tga', 'tga'],
      ['tex.exr', 'exr'],
      ['tex.hdr', 'hdr'],
      ['motion.bvh', 'bvh'],
      ['motion.vmd', 'vmd'],
    ];
    for (const [path, expectedFormat] of expected) {
      expect(formatOf(path), path).toBe(expectedFormat);
    }
  });

  it('phân biệt các định dạng riêng của Engine qua nội dung JSON', () => {
    expect(formatOf('a.json', '{"kind":"aetheria.forge.design"}')).toBe('forge-design');
    expect(formatOf('a.json', '{"kind":"aetheria.bot.spec"}')).toBe('bot-spec');
    expect(formatOf('a.json', '{"version":1,"generatedAt":"x","entries":[]}')).toBe('asset-manifest');
    expect(formatOf('a.json', '{"name":"sidecar"}')).toBe('asset-sidecar');
  });

  it('định dạng chưa biết trả về custom', () => {
    expect(formatOf('file.xyz')).toBe('custom');
    expect(isSupportedFormat('custom')).toBe(false);
  });

  it('phân loại nhóm và năng lực đúng cho từng định dạng', () => {
    expect(kindOf('stl')).toBe('geometry');
    expect(kindOf('gltf')).toBe('scene');
    expect(kindOf('mtl')).toBe('material');
    expect(kindOf('png')).toBe('texture');
    expect(kindOf('bvh')).toBe('motion');
    expect(kindOf('forge-design')).toBe('data');

    expect(capabilitiesOf('stl').geometry).toBe(true);
    expect(capabilitiesOf('stl').animation).toBe(false);
    expect(capabilitiesOf('gltf').animation).toBe(true);
    expect(capabilitiesOf('gltf').skeleton).toBe(true);
    expect(capabilitiesOf('bvh').motion).toBe(true);
    expect(capabilitiesOf('hdr').textures).toBe(true);
  });

  it('mọi định dạng trong registry đều hợp lệ và không trùng lặp', () => {
    const formats = supportedFormats();
    expect(new Set(formats).size).toBe(formats.length);
    for (const spec of FORMAT_REGISTRY) {
      expect(spec.extensions.length).toBeGreaterThan(0);
      expect(spec.kind).toBeTruthy();
    }
    // Các phần mở rộng chính phải có mặt trong danh sách hỗ trợ
    for (const ext of ['glb', 'gltf', 'fbx', 'obj', 'dae', '3ds', 'stl', 'ply', 'usd', 'usda', 'usdc', 'abc', 'mtl', 'png', 'jpg', 'jpeg', 'webp', 'tga', 'exr', 'hdr', 'bvh', 'vmd']) {
      expect(supportedExtensions()).toContain(ext);
    }
  });
});

describe('STL — bóc tách & xuất', () => {
  it('đọc binary STL và trả về hình học đúng', () => {
    const bytes = AssetExporter.exportToStl(sampleMesh(), { encoding: 'binary' });
    expect(detectStlEncoding(bytes)).toBe('binary');

    const result = parseStl(bytes);
    expect(result.encoding).toBe('binary');
    expect(result.triangleCount).toBe(2);
    expect(result.geometry.getAttribute('position').count).toBe(4);
    expect(result.geometry.getAttribute('normal')).toBeDefined();
    expect(result.geometry.getIndex()).not.toBeNull();
  });

  it('đọc ASCII STL', () => {
    const bytes = AssetExporter.exportToStl(sampleMesh(), { encoding: 'ascii' });
    expect(detectStlEncoding(bytes)).toBe('ascii');

    const result = parseStl(bytes);
    expect(result.encoding).toBe('ascii');
    expect(result.triangleCount).toBe(2);
  });

  it('báo lỗi rõ ràng khi tệp bị cắt cụt', () => {
    const bytes = AssetExporter.exportToStl(sampleMesh(), { encoding: 'binary' });
    expect(() => parseStl(bytes.subarray(0, 90))).toThrow(/cắt cụt|thiếu/i);
  });
});

describe('PLY — bóc tách & xuất', () => {
  it('đọc PLY binary little-endian', () => {
    const bytes = AssetExporter.exportToPly(sampleMesh(), { encoding: 'binary' });
    const result = parsePly(bytes);
    expect(result.format).toBe('binary_little_endian');
    expect(result.vertexCount).toBe(4);
    expect(result.faceCount).toBe(2);
    expect(result.geometry.getAttribute('position').count).toBe(4);
    expect(result.geometry.getAttribute('uv')).toBeDefined();
  });

  it('đọc PLY ASCII', () => {
    const bytes = AssetExporter.exportToPly(sampleMesh(), { encoding: 'ascii' });
    const result = parsePly(bytes);
    expect(result.format).toBe('ascii');
    expect(result.vertexCount).toBe(4);
    expect(result.faceCount).toBe(2);
  });

  it('giữ nguyên tọa độ qua vòng xuất → bóc tách', () => {
    const bytes = AssetExporter.exportToPly(sampleMesh(), { encoding: 'binary' });
    const result = parsePly(bytes);
    const positions = result.geometry.getAttribute('position');
    expect(positions.getX(1)).toBeCloseTo(1, 5);
    expect(positions.getY(2)).toBeCloseTo(1, 5);
    expect(positions.getZ(3)).toBeCloseTo(1, 5);
  });
});

describe('USD — bóc tách ASCII', () => {
  it('đọc prim Mesh với points và faceVertexIndices', () => {
    const usda = AssetExporter.exportToUsda(sampleMesh(), { name: 'Root' });
    expect(usda).toContain('#usda 1.0');
    expect(usda).toContain('def Mesh');

    const result = parseUsd(new TextEncoder().encode(usda));
    expect(result.meshCount).toBe(1);
    expect(result.primCount).toBeGreaterThan(0);

    let mesh: THREE.Mesh | null = null;
    result.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) mesh = child;
    });
    expect(mesh).not.toBeNull();
    expect(mesh!.geometry.getAttribute('position').count).toBe(4);
    expect(mesh!.geometry.getIndex()!.count).toBe(6);
  });

  it('báo lỗi khi không phải tệp USD', () => {
    expect(() => parseUsd(new TextEncoder().encode('not usd at all'))).toThrow(/USD/i);
  });
});

describe('3DS — bóc tách', () => {
  it('đọc được chunk 3DS tối thiểu do Engine tự dựng', () => {
    // Dựng một tệp 3DS tối giản: MAIN3DS → OBJECT → OBJECT_INFO + TRIMESH.
    const chunks: number[] = [];
    const encoder = new TextEncoder();

    const vertexChunk = new Uint8Array(3 * 12);
    const view = new DataView(vertexChunk.buffer);
    const verts = [0, 0, 0, 1, 0, 0, 0, 1, 0];
    for (let i = 0; i < 3; i++) {
      view.setFloat32(i * 12, verts[i * 3], true);
      view.setFloat32(i * 12 + 4, verts[i * 3 + 1], true);
      view.setFloat32(i * 12 + 8, verts[i * 3 + 2], true);
    }

    const faceChunk = new Uint8Array(8);
    const faceView = new DataView(faceChunk.buffer);
    faceView.setUint16(0, 0, true);
    faceView.setUint16(2, 1, true);
    faceView.setUint16(4, 2, true);
    faceView.setUint16(6, 0, true);

    const nameBytes = encoder.encode('Tri' + String.fromCharCode(0));
    const infoChunk = new Uint8Array(nameBytes.length + 2 + 8);
    infoChunk.set(nameBytes, 0);
    const infoView = new DataView(infoChunk.buffer);
    infoView.setUint32(nameBytes.length + 2, 3, true); // số đỉnh
    infoView.setUint32(nameBytes.length + 6, 1, true); // số mặt

    const trimeshBody = concat([
      chunk(0x4100, vertexChunk),
      chunk(0x4101, faceChunk),
    ]);
    const objectBody = concat([chunk(0x4000, infoChunk), chunk(0x4001, trimeshBody)]);

    const file = concat([chunk(0x4d4d, chunk(0x4000, objectBody))]);

    const result = parseThreeDs(file);
    expect(result.objectCount).toBe(1);
    expect(result.triangleCount).toBe(1);
    expect(result.scene.children.length).toBe(1);
    expect(result.scene.children[0].name).toBe('Tri');

    function chunk(id: number, body: Uint8Array): Uint8Array {
      const out = new Uint8Array(6 + body.length);
      const v = new DataView(out.buffer);
      v.setUint16(0, id, true);
      v.setUint32(2, body.length, true);
      out.set(body, 6);
      return out;
    }
    function concat(parts: Uint8Array[]): Uint8Array {
      const total = parts.reduce((s, p) => s + p.length, 0);
      const out = new Uint8Array(total);
      let offset = 0;
      for (const p of parts) {
        out.set(p, offset);
        offset += p.length;
      }
      return out;
    }
  });

  it('báo lỗi khi magic không đúng', () => {
    expect(() => parseThreeDs(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]))).toThrow(/3DS/i);
  });
});

describe('BVH — bóc tách & xuất', () => {
  it('đọc cây khung và tạo AnimationClip', () => {
    const bvh = AssetExporter.exportToBvh(sampleMesh(), { name: 'Rig' });
    expect(bvh).toContain('HIERARCHY');
    expect(bvh).toContain('MOTION');

    const result = parseBvh(new TextEncoder().encode(bvh));
    expect(result.bones.length).toBeGreaterThan(0);
    expect(result.frames.length).toBe(1);
    expect(result.clip).toBeDefined();
    expect(result.clip!.tracks.length).toBeGreaterThan(0);
  });

  it('đọc cây không phẳng với nhiều khớp', () => {
    const bvh = [
      'HIERARCHY',
      'ROOT Root',
      '{',
      '  OFFSET 0.00 0.00 0.00',
      '  CHANNELS 6 Xposition Yposition Zposition Xrotation Zrotation Yrotation',
      '  JOINT Hips',
      '  {',
      '    OFFSET 0.00 10.00 0.00',
      '    CHANNELS 6 Xposition Yposition Zposition Xrotation Zrotation Yrotation',
      '    JOINT Spine',
      '    {',
      '      OFFSET 0.00 20.00 0.00',
      '      CHANNELS 3 Xrotation Yrotation Zrotation',
      '      End Site',
      '      {',
      '        OFFSET 0.00 30.00 0.00',
      '      }',
      '    }',
      '  }',
      '}',
      'MOTION',
      'Frames: 2',
      'Frame Time: 0.033333',
      '0.0 0.0 0.0 0.0 0.0 0.0 0.0 10.0 0.0 0.0 0.0 0.0 0.0 20.0 0.0 0.0 0.0 0.0',
      '1.0 1.0 1.0 1.0 1.0 1.0 1.0 10.0 0.0 0.0 0.0 0.0 1.0 20.0 0.0 0.0 0.0 0.0',
    ].join('\n');

    const result = parseBvh(new TextEncoder().encode(bvh));
    const names = result.bones.map((b) => b.name);
    expect(names).toContain('Root');
    expect(names).toContain('Hips');
    expect(names).toContain('Spine');
    // End Site không phải bone
    expect(names).not.toContain('EndSite');
    expect(result.frames.length).toBe(2);
    expect(result.bones.find((b) => b.name === 'Spine')?.parent).toBe('Hips');
  });
});

describe('VMD — bóc tách', () => {
  it('đọc header, model name và bone', () => {
    const signature = new TextEncoder().encode('Vocaloid Motion Data 0002');
    const modelName = new TextEncoder().encode('Model');
    const total = 30 + 20 + 4 + 15 + 12 + 16 + 64;
    const bytes = new Uint8Array(total);
    bytes.set(signature, 0);
    bytes.set(modelName, 30);
    const view = new DataView(bytes.buffer);
    view.setUint32(50, 1, true); // 1 bone
    const boneName = new TextEncoder().encode('センター');
    bytes.set(boneName, 54);
    view.setFloat32(69, 1.5, true);
    view.setFloat32(73, 2.5, true);
    view.setFloat32(77, 3.5, true);

    const result = parseVmd(bytes);
    expect(result.name).toBe('Model');
    expect(result.bones.length).toBe(1);
    expect(result.bones[0].offset.x).toBeCloseTo(1.5, 5);
    expect(result.bones[0].offset.y).toBeCloseTo(2.5, 5);
    expect(result.bones[0].offset.z).toBeCloseTo(3.5, 5);
    expect(result.frameCount).toBe(1);
  });

  it('báo lỗi khi chữ ký sai', () => {
    expect(() => parseVmd(new Uint8Array(40))).toThrow(/VMD/i);
  });
});

describe('Ảnh — đọc header', () => {
  it('nhận diện PNG và đọc kích thước', () => {
    const png = new Uint8Array(33);
    png.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
    const view = new DataView(png.buffer);
    view.setUint32(16, 64, false);
    view.setUint32(20, 32, false);
    png[24] = 8; // bit depth
    png[25] = 6; // RGBA

    expect(detectImageFormat(png)).toBe('png');
    const info = readImageInfo(png, 'png');
    expect(info!.width).toBe(64);
    expect(info!.height).toBe(32);
    expect(info!.channels).toBe(4);
    expect(info!.hasAlpha).toBe(true);
  });

  it('nhận diện JPEG và đọc kích thước', () => {
    // SOI + APP0 (segment 16 byte) + SOF0
    const jpeg = new Uint8Array(34);
    jpeg.set([0xff, 0xd8], 0); // SOI
    jpeg.set([0xff, 0xe0], 2); // APP0
    jpeg[4] = 0;
    jpeg[5] = 16; // độ dài segment (gồm 2 byte độ dài)
    jpeg.set([0xff, 0xc0], 20); // SOF0
    jpeg[22] = 0;
    jpeg[23] = 17; // độ dài segment
    jpeg[24] = 8; // precision
    const view = new DataView(jpeg.buffer);
    view.setUint16(25, 480, false); // height
    view.setUint16(27, 640, false); // width
    jpeg[29] = 3; // số kênh

    expect(detectImageFormat(jpeg)).toBe('jpg');
    const info = readImageInfo(jpeg, 'jpg');
    expect(info!.width).toBe(640);
    expect(info!.height).toBe(480);
    expect(info!.channels).toBe(3);
  });

  it('nhận diện Radiance HDR', () => {
    const hdr = new TextEncoder().encode('#?RADIANCE\nFORMAT=32-bit_rle_rgbe\n\n-Y 4 +X 8\n');
    expect(detectImageFormat(hdr)).toBe('hdr');
    const info = readImageInfo(hdr, 'hdr');
    expect(info!.width).toBe(8);
    expect(info!.height).toBe(4);
    expect(info!.colorSpace).toBe('linear');
  });

  it('parseImage trả về thông tin kích thước', () => {
    const png = new Uint8Array(33);
    png.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
    const view = new DataView(png.buffer);
    view.setUint32(16, 16, false);
    view.setUint32(20, 16, false);
    png[24] = 8;
    png[25] = 2;

    const result = parseImage(png, 'png');
    expect(result.info.width).toBe(16);
    expect(result.info.height).toBe(16);
  });
});

describe('Định dạng riêng của Engine', () => {
  it('bóc tách ForgeDesignSpec', () => {
    const spec = {
      kind: 'aetheria.forge.design',
      name: 'Rồn kiếm',
      parts: [{ type: 'blade', length: 1.2 }],
    };
    const result = parseEngineData(JSON.stringify(spec), 'forge-design');
    expect(result.warnings).toHaveLength(0);
    expect((result.data as { name: string }).name).toBe('Rồn kiếm');
  });

  it('báo cảnh báo khi ForgeDesignSpec thiếu trường bắt buộc', () => {
    const result = parseEngineData(JSON.stringify({ kind: 'aetheria.forge.design' }), 'forge-design');
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.join(' ')).toMatch(/name|parts/i);
  });

  it('bóc tách manifest và kiểm tra entry', () => {
    const manifest = {
      version: 1,
      generatedAt: '2026-10-26T00:00:00Z',
      entries: [{ id: 'a.glb', path: '/assets/a.glb', format: 'glb' }],
    };
    const result = parseEngineData(JSON.stringify(manifest), 'asset-manifest');
    expect(result.warnings).toHaveLength(0);
  });

  it('báo cảnh báo khi manifest có entry thiếu trường', () => {
    const manifest = { version: 1, entries: [{ path: '/a.glb' }] };
    const result = parseEngineData(JSON.stringify(manifest), 'asset-manifest');
    expect(result.warnings.join(' ')).toMatch(/entries|id\/path/i);
  });

  it('báo lỗi khi JSON không hợp lệ', () => {
    expect(() => parseEngineData('{ broken', 'asset-sidecar')).toThrow(/JSON/i);
  });
});

describe('AssetParser — dispatch theo định dạng', () => {
  it('bóc tách STL và điền đủ field bắt buộc', async () => {
    const parser = new AssetParser();
    const bytes = AssetExporter.exportToStl(sampleMesh(), { encoding: 'binary' });
    const asset = await parser.parseBytes('model.stl', bytes);

    expect(asset.format).toBe('stl');
    expect(asset.kind).toBe('geometry');
    expect(asset.scene).toBeDefined();
    expect(asset.geometryStats.triangles).toBe(2);
    expect(asset.dependencies).toEqual([]);
    expect(Array.isArray(asset.warnings)).toBe(true);
    expect(asset.sizeBytes).toBe(bytes.byteLength);
  });

  it('bóc tách PLY và điền đủ field bắt buộc', async () => {
    const parser = new AssetParser();
    const bytes = AssetExporter.exportToPly(sampleMesh(), { encoding: 'binary' });
    const asset = await parser.parseBytes('model.ply', bytes);
    expect(asset.format).toBe('ply');
    expect(asset.kind).toBe('geometry');
    expect(asset.geometryStats.triangles).toBe(2);
  });

  it('bóc tách USD và điền đủ field bắt buộc', async () => {
    const parser = new AssetParser();
    const usda = AssetExporter.exportToUsda(sampleMesh(), { name: 'Root' });
    const asset = await parser.parseBytes('scene.usda', new TextEncoder().encode(usda));
    expect(asset.format).toBe('usda');
    expect(asset.kind).toBe('scene');
    expect(asset.geometryStats.triangles).toBe(2);
  });

  it('bóc tách ảnh và gắn thông tin kích thước', async () => {
    const parser = new AssetParser();
    const png = new Uint8Array(33);
    png.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
    const view = new DataView(png.buffer);
    view.setUint32(16, 12, false);
    view.setUint32(20, 8, false);
    png[24] = 8;
    png[25] = 6;

    const asset = await parser.parseBytes('tex.png', png);
    expect(asset.format).toBe('png');
    expect(asset.kind).toBe('texture');
    const info = asset.scene.userData.imageInfo as { width: number; height: number };
    expect(info.width).toBe(12);
    expect(info.height).toBe(8);
  });

  it('bóc tách dữ liệu Engine và trả về payload', async () => {
    const parser = new AssetParser();
    const json = JSON.stringify({ kind: 'aetheria.bot.spec', id: 'bot-1', stats: [{ hp: 10 }] });
    const asset = await parser.parseBytes('bot.json', new TextEncoder().encode(json));
    expect(asset.format).toBe('bot-spec');
    expect(asset.kind).toBe('data');
    expect((asset.data as { id: string }).id).toBe('bot-1');
  });

  it('bóc tách BVH và trả về motion', async () => {
    const parser = new AssetParser();
    const bvh = AssetExporter.exportToBvh(sampleMesh(), { name: 'Rig' });
    const asset = await parser.parseBytes('motion.bvh', new TextEncoder().encode(bvh));
    expect(asset.format).toBe('bvh');
    expect(asset.kind).toBe('motion');
    expect(asset.motion).toBeDefined();
    expect(asset.motion!.kind).toBe('bvh');
    expect(asset.animations.length).toBe(1);
  });
});

describe('AssetFactory — tạo & xuất tài sản', () => {
  it('tạo asset từ đặc tả part', () => {
    const created = AssetFactory.create({
      name: 'Rồn',
      parts: [
        { shape: 'box', size: [1, 2, 0.5], position: [0, 1, 0], color: 0x884422 },
        { shape: 'sphere', size: [0.6, 0.6, 0.6], position: [0, 2.3, 0] },
      ],
    });
    expect(created.meshCount).toBe(2);
    expect(created.triangleCount).toBeGreaterThan(0);
    expect(created.bounds.max.y).toBeGreaterThan(2);
  });

  it('xuất được ra nhiều định dạng và đọc lại được', () => {
    const spec = {
      name: 'Rồn',
      parts: [{ shape: 'box' as const, size: [1, 1, 1] as [number, number, number] }],
    };

    const glb = AssetFactory.createAndExport(spec, 'glb');
    expect(glb.bytes).toBeDefined();
    expect(glb.bytes!.length).toBeGreaterThan(20);
    // Magic GLB
    const magic = new DataView(glb.bytes!.buffer).getUint32(0, true);
    expect(magic).toBe(0x46546c67);

    const stl = AssetFactory.createAndExport(spec, 'stl');
    expect(stl.bytes).toBeDefined();
    expect(detectStlEncoding(stl.bytes!)).toBe('binary');

    const ply = AssetFactory.createAndExport(spec, 'ply');
    expect(ply.bytes).toBeDefined();
    expect(parsePly(ply.bytes!).vertexCount).toBeGreaterThan(0);

    const obj = AssetFactory.createAndExport(spec, 'obj');
    expect(obj.text).toContain('v ');
    expect(obj.mtl).toContain('newmtl');

    const usda = AssetFactory.createAndExport(spec, 'usda');
    expect(usda.text).toContain('#usda 1.0');

    const bvh = AssetFactory.createAndExport(spec, 'bvh');
    expect(bvh.text).toContain('HIERARCHY');
  });

  it('ánh xạ định dạng Engine sang định dạng xuất được', () => {
    expect(AssetFactory.exportFormatFor('glb')).toBe('glb');
    expect(AssetFactory.exportFormatFor('usda')).toBe('usda');
    expect(AssetFactory.exportFormatFor('png')).toBeNull();
  });
});
