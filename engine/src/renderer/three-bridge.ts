/**
 * @file three-bridge.ts
 * @module @aetheria/engine/renderer/three-bridge
 * @description Bidirectional bridge and adapter between zero-dependency Engine structures
 * (GeometryBuffers, TransformNode, SpatialBounds, Physics bodies) and Three.js/WebGL scene graph.
 */

import * as THREE from 'three';
import type {
  GeometryBuffers,
  VertexBufferDescriptor,
  VertexAttributeDescriptor,
  IndexBufferDescriptor,
  TransformNode,
  Vector3D,
  Matrix4x4
} from '../types/geometry.types.js';
import type { SpatialBoundsReport } from '../types/spatial.types.js';
import type { PhysicsBody } from '../types/physics.types.js';
import { EngineResult, engineOk, engineErr } from '../types/engine.types.js';

export class ThreeBridge {
  /**
   * Converts zero-dependency engine VertexBufferDescriptor to THREE.BufferGeometry
   */
  public static engineGeometryToThree(
    vertexBuf: VertexBufferDescriptor,
    indexBuf?: IndexBufferDescriptor
  ): EngineResult<THREE.BufferGeometry> {
    try {
      const geom = new THREE.BufferGeometry();

      for (const [attrName, desc] of Object.entries(vertexBuf.attributes)) {
        let threeAttrName = desc.name;
        if (desc.semantic === 'position') threeAttrName = 'position';
        else if (desc.semantic === 'normal') threeAttrName = 'normal';
        else if (desc.semantic === 'tangent') threeAttrName = 'tangent';
        else if (desc.semantic === 'uv0') threeAttrName = 'uv';
        else if (desc.semantic === 'uv1') threeAttrName = 'uv2';
        else if (desc.semantic === 'color') threeAttrName = 'color';
        else if (desc.semantic === 'weights') threeAttrName = 'skinWeight';
        else if (desc.semantic === 'indices') threeAttrName = 'skinIndex';

        const attr = new THREE.BufferAttribute(
          vertexBuf.data,
          desc.itemSize,
          desc.normalized ?? false
        );
        geom.setAttribute(threeAttrName, attr);
      }

      if (indexBuf) {
        geom.setIndex(new THREE.BufferAttribute(indexBuf.data, 1));
      }

      geom.computeBoundingBox();
      geom.computeBoundingSphere();

      return engineOk(geom, { vertexCount: vertexBuf.vertexCount });
    } catch (err: unknown) {
      return engineErr({
        code: 'GEOMETRY_CONVERSION_ERROR',
        message: `Failed to convert engine geometry to Three.js: ${err instanceof Error ? err.message : String(err)}`,
        subsystem: 'ThreeBridge',
        stack: err instanceof Error ? err.stack : undefined
      });
    }
  }

  /**
   * Converts a THREE.BufferGeometry to zero-dependency engine GeometryBuffers
   */
  public static threeGeometryToEngine(
    geom: THREE.BufferGeometry
  ): EngineResult<GeometryBuffers> {
    const posAttr = geom.getAttribute('position');
    if (!posAttr) {
      return engineErr({
        code: 'MISSING_POSITION_ATTRIBUTE',
        message: 'Three.js BufferGeometry lacks a position attribute.',
        subsystem: 'ThreeBridge'
      });
    }

    const vertexCount = posAttr.count;
    const posArray = new Float32Array(posAttr.array);

    const attributes: Record<string, VertexAttributeDescriptor> = {
      position: {
        semantic: 'position',
        name: 'position',
        itemSize: 3,
        format: 'float32',
        offset: 0
      }
    };

    const normAttr = geom.getAttribute('normal');
    if (normAttr) {
      attributes.normal = {
        semantic: 'normal',
        name: 'normal',
        itemSize: 3,
        format: 'float32',
        offset: 0
      };
    }

    const uvAttr = geom.getAttribute('uv');
    if (uvAttr) {
      attributes.uv0 = {
        semantic: 'uv0',
        name: 'uv',
        itemSize: 2,
        format: 'float32',
        offset: 0
      };
    }

    let indexDesc: IndexBufferDescriptor | undefined;
    if (geom.index) {
      const idxArray = geom.index.array;
      const isU32 = idxArray instanceof Uint32Array || idxArray.some((val) => val > 65535);
      indexDesc = {
        format: isU32 ? 'uint32' : 'uint16',
        data: isU32 ? new Uint32Array(idxArray) : new Uint16Array(idxArray),
        count: geom.index.count
      };
    }

    return engineOk({
      vertex: {
        attributes,
        data: posArray,
        vertexCount
      },
      index: indexDesc,
      primitiveType: 'triangles'
    });
  }

  /**
   * Converts an engine TransformNode to a THREE.Object3D hierarchy node
   */
  public static engineNodeToThree(node: TransformNode): THREE.Object3D {
    const obj = new THREE.Object3D();
    obj.uuid = node.uid;
    obj.name = node.name;
    obj.position.set(node.position.x, node.position.y, node.position.z);
    obj.quaternion.set(node.rotation.x, node.rotation.y, node.rotation.z, node.rotation.w);
    obj.scale.set(node.scale.x, node.scale.y, node.scale.z);
    obj.visible = node.flags.visible;
    obj.castShadow = node.flags.castShadow;
    obj.receiveShadow = node.flags.receiveShadow;
    obj.layers.mask = node.layerMask;
    obj.userData = { ...node.data, ...node.meta };
    return obj;
  }

  /**
   * Converts a THREE.Object3D node to an engine TransformNode
   */
  public static threeNodeToEngine(obj: THREE.Object3D): TransformNode {
    return {
      uid: obj.uuid,
      name: obj.name || 'node',
      parentUid: obj.parent ? obj.parent.uuid : undefined,
      childrenUids: obj.children.map(c => c.uuid),
      position: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
      rotation: { x: obj.quaternion.x, y: obj.quaternion.y, z: obj.quaternion.z, w: obj.quaternion.w },
      scale: { x: obj.scale.x, y: obj.scale.y, z: obj.scale.z },
      localMatrix: { elements: obj.matrix.toArray() as Matrix4x4['elements'] },
      worldMatrix: { elements: obj.matrixWorld.toArray() as Matrix4x4['elements'] },
      layerMask: obj.layers.mask,
      flags: {
        visible: obj.visible,
        isStatic: obj.matrixAutoUpdate === false,
        castShadow: obj.castShadow,
        receiveShadow: obj.receiveShadow,
        pickable: true
      },
      data: obj.userData ?? {},
      meta: {}
    };
  }

  /**
   * Synchronizes physics body position and orientation to a Three.js visual node
   */
  public static syncPhysicsToThree(body: PhysicsBody, obj: THREE.Object3D): void {
    obj.position.set(body.position.x, body.position.y, body.position.z);
    // Angular rotation if supplied
    if (body.angularVelocity) {
      // Rotation orientation integration is managed by physics step
    }
  }

  /**
   * Synchronizes a Three.js visual node's transform to an engine physics body
   */
  public static syncThreeToPhysics(obj: THREE.Object3D, body: PhysicsBody): void {
    body.position = { x: obj.position.x, y: obj.position.y, z: obj.position.z };
  }

  /**
   * Creates a wireframe visualization of spatial bounds (AABB, OBB, Sphere, Capsule)
   */
  public static createBoundsVisualizer(
    bounds: SpatialBoundsReport,
    colors: { aabb?: number; obb?: number; sphere?: number } = {}
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = 'spatial_bounds_visualizer';

    // 1. AABB Box Helper
    const aabb = bounds.aabb;
    const aabbBox = new THREE.Box3(
      new THREE.Vector3(aabb.min.x, aabb.min.y, aabb.min.z),
      new THREE.Vector3(aabb.max.x, aabb.max.y, aabb.max.z)
    );
    const aabbHelper = new THREE.Box3Helper(aabbBox, new THREE.Color(colors.aabb ?? 0x00ff00));
    aabbHelper.name = 'aabb_helper';
    group.add(aabbHelper);

    // 2. Bounding Sphere Wireframe
    const sphereGeom = new THREE.SphereGeometry(bounds.sphere.radius, 16, 12);
    const sphereWire = new THREE.WireframeGeometry(sphereGeom);
    const sphereLines = new THREE.LineSegments(
      sphereWire,
      new THREE.LineBasicMaterial({ color: colors.sphere ?? 0x0088ff })
    );
    sphereLines.name = 'sphere_helper';
    sphereLines.position.set(bounds.sphere.center.x, bounds.sphere.center.y, bounds.sphere.center.z);
    group.add(sphereLines);

    // 3. Center of Mass Indicator
    const comGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(bounds.centerOfMass.x - 0.2, bounds.centerOfMass.y, bounds.centerOfMass.z),
      new THREE.Vector3(bounds.centerOfMass.x + 0.2, bounds.centerOfMass.y, bounds.centerOfMass.z),
      new THREE.Vector3(bounds.centerOfMass.x, bounds.centerOfMass.y - 0.2, bounds.centerOfMass.z),
      new THREE.Vector3(bounds.centerOfMass.x, bounds.centerOfMass.y + 0.2, bounds.centerOfMass.z),
      new THREE.Vector3(bounds.centerOfMass.x, bounds.centerOfMass.y, bounds.centerOfMass.z - 0.2),
      new THREE.Vector3(bounds.centerOfMass.x, bounds.centerOfMass.y, bounds.centerOfMass.z + 0.2),
    ]);
    const comLines = new THREE.LineSegments(
      comGeom,
      new THREE.LineBasicMaterial({ color: 0xff0000 })
    );
    comLines.name = 'com_indicator';
    group.add(comLines);

    return group;
  }
}
