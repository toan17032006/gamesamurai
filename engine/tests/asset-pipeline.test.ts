// engine/tests/asset-pipeline.test.ts — Kiểm chứng pipeline bóc tách / tạo / phân tích tài sản.
//
// Bọc theo trục:
//   1. glTF/GLB: xuất → bóc tách khép kín (headless, không cần DOM).
//   2. Collada (.dae): bóc tách bằng parser tự viết (không cần DOMParser).
//   3. base64: mã hoá / giải mã khớp nhau.
//   4. MTL: xuất → parse khép kín.
//   5. Phụ thuộc ngoài: OBJ → MTL → texture.
//   6. Trường bắt buộc của ParsedAsset.
//   7. Phân tích / tính toán / ngân sách / LOD.
//   8. Thiết kế tài sản.
//   9. Loại bỏ return có sẵn, không phù hợp.
import { describe, it, expect } from 'vitest';
import * as THREE from 'three';

import { AssetParser } from '../src/asset-parser/index.js';
import { FORMAT_REGISTRY } from '../src/asset-parser/format-registry.js';
import { parseGltf, isGlb } from '../src/asset-parser/gltf-parser.js';
import { parseCollada } from '../src/asset-parser/collada-parser.js';
import { parseXml, findChild, findChildren } from '../src/asset-parser/xml-lite.js';
import { encodeBase64, decodeBase64 } from '../src/asset-parser/base64.js';
import { parseMtl } from '../src/asset-parser/obj-parser.js';
import {
  analyzeAsset,
  analyzeScene,
  suggestLods,
  estimateTextureBytes,
  countTrianglesInGeometry,
  DEFAULT_BUDGETS,
  formatBytes,
} from '../src/asset-parser/asset-analyzer.js';
import { AssetExporter } from '../src/procedural/asset-exporter.js';
import { AssetFactory } from '../src/procedural/asset-factory.js';
import { designAsset } from '../src/procedural/asset-designer.js';
import { RealisticHumanPlayer } from '../src/player/realistic-human-player.js';
import { SpatialUISystem } from '../src/spatial-ui/index.js';

// ---------------------------------------------------------------------------
// Mẫu
// ---------------------------------------------------------------------------

function makeTriangleMesh(name = 'Tri'): THREE.Mesh {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 1, 0], 3),
  );
  geometry.setAttribute(
    'normal',
    new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 0, 0, 1], 3),
  );
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1], 2));
  geometry.setIndex([0, 1, 2]);
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x3366ff }));
  mesh.name = name;
  return mesh;
}

const MINIMAL_DAE = `<?xml version="1.0" encoding="utf-8"?>
<COLLADA xmlns="http://www.collada.org/2005/11/COLLADASchema" version="1.4.1">
  <library_geometries>
    <geometry id="tri-geo" name="Tri">
      <mesh>
        <source id="tri-pos">
          <float_array id="tri-pos-array" count="9">0 0 0 1 0 0 0 1 0</float_array>
          <technique_common>
            <accessor source="#tri-pos-array" count="3" stride="3">
              <param name="X" type="float"/>
              <param name="Y" type="float"/>
              <param name="Z" type="float"/>
            </accessor>
          </technique_common>
        </source>
        <vertices id="tri-vertices">
          <input semantic="POSITION" source="#tri-pos"/>
        </vertices>
        <triangles count="1" material="red-mat">
          <input semantic="VERTEX" source="#tri-vertices" offset="0"/>
          <p>0 1 2</p>
        </triangles>
      </mesh>
    </geometry>
  </library_geometries>
  <library_effects>
    <effect id="red-effect">
      <profile_COMMON>
        <technique sid="common">
          <phong>
            <diffuse><color>0.9 0.1 0.1 1</color></diffuse>
          </phong>
        </technique>
      </profile_COMMON>
    </effect>
  </library_effects>
  <library_materials>
    <material id="red-mat" name="RedMat">
      <instance_effect url="#red-effect"/>
    </material>
  </library_materials>
  <library_visual_scenes>
    <visual_scene id="scene">
      <node id="node-tri" name="TriNode">
        <matrix>1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 1</matrix>
        <instance_geometry url="#tri-geo">
          <bind_material>
            <technique_common>
              <instance_material symbol="red-mat" target="#red-mat"/>
            </technique_common>
          </bind_material>
        </instance_geometry>
      </node>
    </visual_scene>
  </library_visual_scenes>
  <scene><instance_visual_scene url="#scene"/></scene>
</COLLADA>`;

// ---------------------------------------------------------------------------
// 1. glTF / GLB
// ---------------------------------------------------------------------------

describe('glTF/GLB — xuất và bóc tách khép kín', () => {
  it('GLB do Engine xuất được bóc tách lại đúng hình học', async () => {
    const group = new THREE.Group();
    group.name = 'Root';
    group.add(makeTriangleMesh());

    const glb = AssetExporter.exportToGlb(group, { name: 'RoundTrip' });
    expect(isGlb(glb)).toBe(true);

    const parser = new AssetParser();
    const asset = await parser.parseBytes('model.glb', glb);

    expect(asset.format).toBe('glb');
    expect(asset.kind).toBe('scene');
    expect(asset.geometryStats.triangles).toBe(1);
    expect(asset.geometryStats.meshes).toBe(1);
    expect(asset.warnings).toEqual([]);
  });

  it('.gltf do Engine xuất có buffer nhúng và bóc tách được', async () => {
    const group = new THREE.Group();
    group.name = 'Root';
    group.add(makeTriangleMesh());

    const doc = AssetExporter.exportToGltf(group, { name: 'RoundTrip' });
    // Buffer phải có `uri` — không có thì mọi trình đọc glTF đều không đọc được.
    expect(doc.buffers).toBeDefined();
    expect(doc.buffers[0].uri).toMatch(/^data:application\/octet-stream;base64,/);
    expect(doc.buffers[0].byteLength).toBeGreaterThan(0);
    // Không được sót lại buffer nhị phân thô trong JSON.
    expect(doc._binBuffer).toBeUndefined();

    const parser = new AssetParser();
    const asset = await parser.parseBytes('model.gltf', new TextEncoder().encode(JSON.stringify(doc)));
    expect(asset.format).toBe('gltf');
    expect(asset.geometryStats.triangles).toBe(1);
  });

  it('xuất trực tiếp từ một mesh (root là mesh) không bị bỏ trống', async () => {
    // Trước đây traverse bỏ qua `child === root` nên tệp xuất ra rỗng.
    const glb = AssetExporter.exportToGlb(makeTriangleMesh(), { name: 'Solo' });
    const parser = new AssetParser();
    const asset = await parser.parseBytes('solo.glb', glb);
    expect(asset.geometryStats.triangles).toBe(1);
    expect(asset.geometryStats.vertices).toBe(3);
  });

  it('giữ nguyên thứ bực cây node khi xuất', async () => {
    const root = new THREE.Group();
    root.name = 'Root';
    const child = new THREE.Group();
    child.name = 'Child';
    child.add(makeTriangleMesh('Leaf'));
    root.add(child);

    const glb = AssetExporter.exportToGlb(root, { name: 'Hierarchy' });
    const parser = new AssetParser();
    const asset = await parser.parseBytes('hierarchy.glb', glb);

    let found = false;
    asset.scene.traverse((node) => {
      if (node.name === 'Child') found = true;
    });
    expect(found).toBe(true);
  });

  it('vật liệu và màu được giữ qua vòng xuất → bóc tách', async () => {
    const group = new THREE.Group();
    group.name = 'Root';
    const mesh = makeTriangleMesh();
    (mesh.material as THREE.MeshStandardMaterial).color.setRGB(0.25, 0.5, 0.75);
    group.add(mesh);

    const glb = AssetExporter.exportToGlb(group, { name: 'Mat' });
    const result = await parseGltf(glb);
    expect(result.materials).toBeDefined();

    const first = Object.values(result.materials)[0] as THREE.MeshStandardMaterial;
    expect(first).toBeDefined();
    expect(first.color.r).toBeCloseTo(0.25, 3);
    expect(first.color.b).toBeCloseTo(0.75, 3);
  });

  it('ghi buffer ngoài (.bin) vào dependencies', async () => {
    const doc = {
      asset: { version: '2.0' },
      scene: 0,
      scenes: [{ nodes: [] }],
      nodes: [],
      buffers: [{ uri: 'model.bin', byteLength: 4 }],
    };
    const result = await parseGltf(new TextEncoder().encode(JSON.stringify(doc)));
    expect(result.dependencies).toContain('model.bin');
    expect(result.warnings.join(' ')).toMatch(/buffer ngoài/i);
  });

  it('báo lỗi rõ ràng khi JSON glTF hỏng', async () => {
    await expect(parseGltf(new TextEncoder().encode('{ broken'))).rejects.toThrow(/JSON/i);
  });
});

// ---------------------------------------------------------------------------
// 2. Collada
// ---------------------------------------------------------------------------

describe('Collada (.dae) — bóc tách không cần DOM', () => {
  it('đọc được mesh, node và vật liệu từ .dae tối giảu', () => {
    const result = parseCollada(new TextEncoder().encode(MINIMAL_DAE), { name: 'Dae' });

    expect(result.meshCount).toBe(1);
    expect(result.triangleCount).toBe(1);
    expect(result.nodeCount).toBeGreaterThan(0);

    let mesh: THREE.Mesh | null = null;
    result.scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) mesh = child as THREE.Mesh;
    });
    expect(mesh).not.toBeNull();
    expect(mesh!.geometry.getAttribute('position').count).toBe(3);
    expect(mesh!.geometry.getIndex()!.count).toBe(3);

    // Vật liệu từ `library_materials` + `library_effects`.
    expect(result.materials['red-mat']).toBeDefined();
    const material = result.materials['red-mat'] as THREE.MeshStandardMaterial;
    expect(material.color.r).toBeCloseTo(0.9, 3);
    expect(mesh!.material).toBe(material);
  });

  it('đi qua AssetParser.parseBytes', async () => {
    const parser = new AssetParser();
    const asset = await parser.parseBytes('model.dae', new TextEncoder().encode(MINIMAL_DAE));
    expect(asset.format).toBe('dae');
    expect(asset.kind).toBe('scene');
    expect(asset.geometryStats.triangles).toBe(1);
  });

  it('báo lỗi khi không phải tệp COLLADA', () => {
    expect(() => parseCollada(new TextEncoder().encode('<html></html>'))).toThrow(/COLLADA/i);
  });
});

// ---------------------------------------------------------------------------
// 3. XML
// ---------------------------------------------------------------------------

describe('xml-lite — đọc XML không cần DOM', () => {
  it('đọc phần tử, thuộc tính và nội dung', () => {
    const root = parseXml('<a x="1"><b>hello</b><c/></a>');
    const a = findChild(root, 'a');
    expect(a).toBeDefined();
    expect(a!.attrs.x).toBe('1');
    expect(findChild(a!, 'b')!.text).toBe('hello');
    expect(findChildren(a!, 'c')).toHaveLength(1);
  });

  it('giải mã entity và bỏ qua chú thích', () => {
    const root = parseXml('<a><!-- ghi chú --><b>1 &amp; 2</b></a>');
    const a = findChild(root, 'a');
    expect(findChild(a!, 'b')!.text).toBe('1 & 2');
  });

  it('giữ nội dung CDATA nguyên văn', () => {
    const root = parseXml('<a><b><![CDATA[<raw>]]></b></a>');
    const a = findChild(root, 'a');
    expect(findChild(a!, 'b')!.text).toBe('<raw>');
  });
});

// ---------------------------------------------------------------------------
// 4. base64
// ---------------------------------------------------------------------------

describe('base64 — mã hoá / giải mã', () => {
  it('khớp với giá trị chuẩn', () => {
    expect(encodeBase64(new TextEncoder().encode('Man'))).toBe('TWFu');
    expect(encodeBase64(new TextEncoder().encode('Ma'))).toBe('TWE=');
    expect(encodeBase64(new TextEncoder().encode('M'))).toBe('TQ==');
  });

  it('giải mã khớp byte gốc ở mọi độ dài', () => {
    for (let length = 0; length < 64; length++) {
      const bytes = new Uint8Array(length);
      for (let i = 0; i < length; i++) bytes[i] = (i * 37 + 11) % 256;
      const decoded = decodeBase64(encodeBase64(bytes));
      expect(Array.from(decoded)).toEqual(Array.from(bytes));
    }
  });
});

// ---------------------------------------------------------------------------
// 5. MTL
// ---------------------------------------------------------------------------

describe('MTL — xuất và parse khép kín', () => {
  it('exportToMtl tạo tệp đọc lại được bằng parseMtl', () => {
    const group = new THREE.Group();
    group.name = 'Root';
    const mesh = makeTriangleMesh();
    (mesh.material as THREE.MeshStandardMaterial).color.setRGB(0.2, 0.4, 0.6);
    group.add(mesh);

    const mtl = AssetExporter.exportToMtl(group, { name: 'Mats' });
    expect(mtl).toContain('newmtl');

    const parsed = parseMtl(mtl);
    expect(parsed.size).toBeGreaterThan(0);
    const first = [...parsed.values()][0];
    expect(first.color!.r).toBeCloseTo(0.2, 3);
    expect(first.color!.b).toBeCloseTo(0.6, 3);
  });

  it('AssetFactory xuất được định dạng mtl', () => {
    const created = AssetFactory.create({
      name: 'Simple',
      parts: [{ shape: 'box', size: [1, 1, 1] }],
    });
    const result = AssetFactory.export(created.root, 'mtl', 'Simple');
    expect(result.format).toBe('mtl');
    expect(result.extension).toBe('mtl');
    expect(result.text).toContain('newmtl');
    expect(AssetFactory.exportableFormats()).toContain('mtl');
  });
});

// ---------------------------------------------------------------------------
// 6. Phụ thuộc ngoài
// ---------------------------------------------------------------------------

describe('Phụ thuộc ngoài — OBJ → MTL → texture', () => {
  it('ghi texture mà MTL trỏ tới vào dependencies', () => {
    const mtlText = [
      'newmtl Red',
      'Kd 1.000 0.000 0.000',
      'map_Kd textures/red.png',
      'map_Bump textures/red_n.png',
    ].join('\n');

    const parsed = parseMtl(mtlText);
    expect(parsed.get('Red')!.mapUri).toBe('textures/red.png');
    expect(parsed.get('Red')!.bumpMapUri).toBe('textures/red_n.png');
  });

  it('gltf với texture ngoài ghi URI vào dependencies', async () => {
    const doc = {
      asset: { version: '2.0' },
      scene: 0,
      scenes: [{ nodes: [] }],
      nodes: [],
      images: [{ uri: 'textures/albedo.png' }],
      textures: [{ source: 0 }],
      materials: [
        {
          name: 'M',
          pbrMetallicRoughness: { baseColorTexture: { index: 0 } },
        },
      ],
    };
    const result = await parseGltf(new TextEncoder().encode(JSON.stringify(doc)));
    expect(result.dependencies).toContain('textures/albedo.png');
  });
});

// ---------------------------------------------------------------------------
// 7. Trường bắt buộc
// ---------------------------------------------------------------------------

describe('ParsedAsset — trường bắt buộc luôn có mặt', () => {
  it('điền đủ model/category/materials/rawBuffers/sizeBytes', async () => {
    const parser = new AssetParser();
    const bytes = AssetExporter.exportToStl(makeTriangleMesh(), { encoding: 'binary' });
    const asset = await parser.parseBytes('model.stl', bytes);

    expect(asset.model).toBeDefined();
    expect(asset.category).toBeDefined();
    expect(asset.materials).toBeDefined();
    expect(Object.keys(asset.materials).length).toBeGreaterThan(0);
    expect(asset.rawBuffers).toBeDefined();
    expect(Object.keys(asset.rawBuffers).length).toBeGreaterThan(0);
    expect(asset.sizeBytes).toBe(bytes.byteLength);

    // Dữ liệu đỉnh thô phải khớp với hình học.
    const buffers = Object.values(asset.rawBuffers);
    expect(buffers[0].positions.length).toBe(3 * 3);
  });

  it('tài sản không có mesh vẫn có bộ nhớ rỗng chứ không phải undefined', async () => {
    const parser = new AssetParser();
    const png = new Uint8Array(33);
    png.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
    const view = new DataView(png.buffer);
    view.setUint32(16, 12, false);
    view.setUint32(20, 8, false);
    png[24] = 8;
    png[25] = 6;

    const asset = await parser.parseBytes('tex.png', png);
    expect(asset.rawBuffers).toEqual({});
    expect(asset.materials).toBeDefined();
    expect(asset.model).toBe(asset.scene);
    expect(asset.sizeBytes).toBe(33);
  });
});

// ---------------------------------------------------------------------------
// 8. Phân tích / tính toán
// ---------------------------------------------------------------------------

describe('asset-analyzer — phân tích, tính toán, kiểm định', () => {
  it('đo đúng số tam giác / đỉnh / draw call', async () => {
    const parser = new AssetParser();
    const bytes = AssetExporter.exportToStl(makeTriangleMesh(), { encoding: 'binary' });
    const asset = await parser.parseBytes('model.stl', bytes);

    const report = analyzeAsset(asset);
    expect(report.triangles).toBe(1);
    expect(report.vertices).toBe(3);
    expect(report.meshes).toBe(1);
    expect(report.drawCalls).toBe(1);
    expect(report.format).toBe('stl');
    expect(report.totalBytes).toBe(report.textureBytes + report.vertexBytes);
  });

  it('phát hiện vượt ngân sách tam giác', async () => {
    const parser = new AssetParser();
    // Mesh 2 tam giác — vượt ngân sách 1 tam giác.
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0], 3),
    );
    geometry.setIndex([0, 1, 2, 1, 3, 2]);
    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
    mesh.name = 'Two';

    const bytes = AssetExporter.exportToStl(mesh, { encoding: 'binary' });
    const asset = await parser.parseBytes('model.stl', bytes);
    expect(asset.geometryStats.triangles).toBe(2);

    const report = analyzeAsset(asset, {
      budget: { ...DEFAULT_BUDGETS.misc, maxTriangles: 1 },
    });
    expect(report.withinBudget).toBe(false);
    expect(report.issues.some((i) => i.code === 'over-triangle-budget')).toBe(true);
    expect(report.score).toBeLessThan(100);
  });

  it('gợi ý LOD khi vượt ngân sách', () => {
    const suggestions = suggestLods(100_000, { ...DEFAULT_BUDGETS.misc, maxTriangles: 1_000 });
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0].targetTriangles).toBeLessThan(100_000);
    expect(suggestions[0].reduction).toBeGreaterThan(0);
  });

  it('không gợi ý LOD khi tài sản nhỏ', () => {
    expect(suggestLods(100, DEFAULT_BUDGETS.misc)).toEqual([]);
  });

  it('ước lượng bộ nhớ texture từ kích thước ảnh', () => {
    const texture = new THREE.Texture();
    texture.image = { width: 64, height: 32 } as never;
    expect(estimateTextureBytes(texture)).toBe(64 * 32 * 4);
  });

  it('phân tích scene thô (tài sản sinh thủ tục)', () => {
    const group = new THREE.Group();
    group.name = 'Generated';
    group.add(makeTriangleMesh());
    const report = analyzeScene(group, 'prop');
    expect(report.triangles).toBe(1);
    expect(report.format).toBe('procedural');
    expect(report.category).toBe('prop');
  });

  it('đếm tam giác theo geometry', () => {
    const mesh = makeTriangleMesh();
    expect(countTrianglesInGeometry(mesh.geometry)).toBe(1);
  });

  it('định dạng byte dễ đọc', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1024 * 1024)).toBe('1 MB');
  });
});

// ---------------------------------------------------------------------------
// 9. Thiết kế tài sản
// ---------------------------------------------------------------------------

describe('asset-designer — thiết kế và kiểm định tài sản', () => {
  it('dựng tài sản theo đặc tả và cân đúng kích thước', () => {
    const result = designAsset({
      name: 'Sword',
      category: 'weapon',
      parts: [{ name: 'Blade', shape: 'box', size: [0.1, 2, 0.02] }],
      targetSize: [0.1, 2, 0.02],
    });

    expect(result.root.name).toBe('Sword');
    expect(result.report.meshes).toBe(1);
    expect(result.report.triangles).toBeGreaterThan(0);

    // Kích thước sau khi cân phải khớp yêu cầu.
    const box = new THREE.Box3().setFromObject(result.root);
    const size = box.getSize(new THREE.Vector3());
    expect(size.y).toBeCloseTo(2, 3);
    expect(size.x).toBeCloseTo(0.1, 3);
  });

  it('báo điều chỉnh cụ thể khi vượt ngân sách', () => {
    const result = designAsset({
      name: 'Heavy',
      category: 'prop',
      parts: [{ name: 'Ball', shape: 'sphere', size: [40, 40, 40] }],
      budget: { ...DEFAULT_BUDGETS.prop, maxTriangles: 10 },
    });

    expect(result.valid).toBe(false);
    expect(result.adjustments.length).toBeGreaterThan(0);
    expect(result.adjustments.join(' ')).toMatch(/tam giác|LOD/i);
  });

  it('tài sản nhỏ đạt ngân sách thì không có điều chỉnh', () => {
    const result = designAsset({
      name: 'Tiny',
      category: 'prop',
      parts: [{ name: 'Cube', shape: 'box', size: [0.2, 0.2, 0.2] }],
    });
    expect(result.valid).toBe(true);
    expect(result.adjustments).toEqual([]);
  });
});

describe('Định dạng — mọi định dạng đăng ký đều bóc tách được', () => {
  it('không định dạng nào rơi vào nhánh "không hỗ trợ"', async () => {
    const parser = new AssetParser();
    const dummy = new TextEncoder().encode('not a real asset file');

    for (const spec of FORMAT_REGISTRY) {
      if (spec.kind === 'data') continue; // định dạng Engine — cần nội dung riêng.
      const ext = spec.extensions[0];

      let error: Error | undefined;
      try {
        await parser.parseBytes(`sample.${ext}`, dummy);
      } catch (caught) {
        error = caught as Error;
      }

      // Có nhánh bóc tách riêng nên lỗi (nếu có) phải là lỗi định dạng cụ thể,
      // không phải "định dạng không hỗ trợ".
      expect(
        error?.message ?? '',
        `định dạng "${spec.format}" phải có nhánh bóc tách riêng`,
      ).not.toMatch(/định dạng không hỗ trợ/);
    }
  });

  it('mọi định dạng đăng ký đều là builtin hoặc có loader của three.js', () => {
    for (const spec of FORMAT_REGISTRY) {
      if (spec.kind === 'data') continue;
      expect(
        Boolean(spec.builtin || spec.threeLoader),
        `định dạng "${spec.format}" phải có builtin parser hoặc threeLoader`,
      ).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// 10. Return không phù hợp
// ---------------------------------------------------------------------------

describe('Loại bỏ return có sẵn, không phù hợp', () => {
  it('detectObstacles trả vật cản thật thay vì mảng rỗng', () => {
    const player = new RealisticHumanPlayer();
    player.obstacles.push({
      id: 'wall-1',
      name: 'Wall',
      type: 'wall',
      position: { x: 1, y: 0, z: 0 },
    });
    player.nearbyObjects.push({
      id: 'tree-1',
      name: 'Tree',
      type: 'tree',
      position: { x: 2, y: 0, z: 0 },
    });
    player.nearbyObjects.push({
      id: 'chest-1',
      name: 'Chest',
      type: 'chest',
      position: { x: 3, y: 0, z: 0 },
    });

    const obstacles = player.detectObstacles();
    const ids = obstacles.map((o) => o.id);
    expect(ids).toContain('wall-1');
    expect(ids).toContain('tree-1');
    // Vật tương tác thường không phải vật cản.
    expect(ids).not.toContain('chest-1');
  });

  it('loadPlayerModel chỉ trả true khi mô hình thật sự nạp xong', () => {
    const player = new RealisticHumanPlayer();
    expect(player.loadPlayerModel()).toBe(true);
    expect(player.meshCreated).toBe(true);
    expect(player.skeletonSetup).toBe(true);
    expect(player.rigSetup).toBe(true);
    expect(player.materialsInitialized).toBe(true);
    expect(player.texturesLoaded).toBe(true);
  });

  it('độ xuyên lấn / diện tích tiếp xúc trả "không xác định" thay vì 0', () => {
    const ui = new SpatialUISystem();
    const depth = ui.calculateObjectPenetrationDepth({ position: { x: 0, y: 0, z: 0 } }, {});
    expect(depth.resolved).toBe(false);
    expect(depth.valid).toBe(false);
    expect(Number.isNaN(depth.value)).toBe(true);

    const area = ui.calculateObjectContactArea({ position: { x: 0, y: 0, z: 0 } }, {});
    expect(area.resolved).toBe(false);
    expect(area.valid).toBe(false);
  });
});
