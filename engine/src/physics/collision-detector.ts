// engine/src/physics/collision-detector.ts — Kiểm tra va chạm hình học (Raycast, Bounding Box, Sphere, Capsule)
import * as THREE from 'three';
import type { CollisionShape, HitResult, PhysicsBody } from '../types/physics.types';
import type { Vec3 } from '../types/transform.types';

function toV3(v: Vec3): THREE.Vector3 {
  return new THREE.Vector3(v.x, v.y, v.z);
}

export interface CollisionResult extends HitResult {
  depth: number;
}

export interface SphereRef {
  center: THREE.Vector3;
  radius: number;
}

export interface BoxRef {
  center: THREE.Vector3;
  half: THREE.Vector3;
}

export interface CapsuleRef {
  center: THREE.Vector3;
  radius: number;
  height: number;
}

export function capsuleSegment(c: CapsuleRef): { a: THREE.Vector3; b: THREE.Vector3 } {
  const halfCyl = Math.max(0, c.height / 2 - c.radius);
  return {
    a: new THREE.Vector3(c.center.x, c.center.y - halfCyl, c.center.z),
    b: new THREE.Vector3(c.center.x, c.center.y + halfCyl, c.center.z),
  };
}

function closestPointOnSegment(p: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3, out: THREE.Vector3): THREE.Vector3 {
  const ab = b.clone().sub(a);
  const len2 = ab.lengthSq();
  if (len2 < 1e-12) return out.copy(a);
  const t = Math.max(0, Math.min(1, p.clone().sub(a).dot(ab) / len2));
  return out.copy(a).addScaledVector(ab, t);
}

export function sphereSphere(a: SphereRef, b: SphereRef): CollisionResult {
  const delta = b.center.clone().sub(a.center);
  const dist = delta.length();
  const sum = a.radius + b.radius;
  if (dist >= sum) return { hit: false, depth: sum - dist };
  const normal = dist > 1e-9 ? delta.divideScalar(dist) : new THREE.Vector3(0, 1, 0);
  return {
    hit: true,
    depth: sum - dist,
    normal,
    point: a.center.clone().addScaledVector(normal, a.radius),
    distance: dist,
  };
}

export function sphereBox(s: SphereRef, b: BoxRef): CollisionResult {
  const min = b.center.clone().sub(b.half);
  const max = b.center.clone().add(b.half);
  const closest = new THREE.Vector3(
    Math.max(min.x, Math.min(s.center.x, max.x)),
    Math.max(min.y, Math.min(s.center.y, max.y)),
    Math.max(min.z, Math.min(s.center.z, max.z)),
  );
  const delta = s.center.clone().sub(closest);
  const dist = delta.length();
  if (dist >= s.radius) return { hit: false, depth: s.radius - dist };

  if (dist < 1e-9) {
    const pen = new THREE.Vector3(
      s.radius + b.half.x - Math.abs(s.center.x - b.center.x),
      s.radius + b.half.y - Math.abs(s.center.y - b.center.y),
      s.radius + b.half.z - Math.abs(s.center.z - b.center.z),
    );
    let axis: 'x' | 'y' | 'z' = 'y';
    if (pen.x <= pen.y && pen.x <= pen.z) axis = 'x';
    else if (pen.z <= pen.y) axis = 'z';
    const sign = Math.sign(s.center[axis] - b.center[axis]) || 1;
    const normal = new THREE.Vector3(axis === 'x' ? sign : 0, axis === 'y' ? sign : 0, axis === 'z' ? sign : 0);
    return { hit: true, depth: pen[axis], normal, point: closest, distance: 0 };
  }
  const normal = delta.divideScalar(dist);
  return { hit: true, depth: s.radius - dist, normal, point: closest, distance: dist };
}

export function sphereCapsule(s: SphereRef, c: CapsuleRef): CollisionResult {
  const seg = capsuleSegment(c);
  const closest = new THREE.Vector3();
  closestPointOnSegment(s.center, seg.a, seg.b, closest);
  return sphereSphere(s, { center: closest, radius: c.radius });
}

export function boxBox(a: BoxRef, b: BoxRef): CollisionResult {
  const d = b.center.clone().sub(a.center);
  const overlap = a.half.clone().add(b.half).sub(new THREE.Vector3(Math.abs(d.x), Math.abs(d.y), Math.abs(d.z)));
  if (overlap.x <= 0 || overlap.y <= 0 || overlap.z <= 0) {
    return { hit: false, depth: Math.min(overlap.x, overlap.y, overlap.z) };
  }
  let axis: 'x' | 'y' | 'z' = 'y';
  if (overlap.x <= overlap.y && overlap.x <= overlap.z) axis = 'x';
  else if (overlap.z <= overlap.y) axis = 'z';
  const sign = Math.sign(d[axis]) || 1;
  const normal = new THREE.Vector3(axis === 'x' ? sign : 0, axis === 'y' ? sign : 0, axis === 'z' ? sign : 0);
  return {
    hit: true,
    depth: overlap[axis],
    normal,
    point: a.center.clone().addScaledVector(normal, a.half[axis]),
    distance: 0,
  };
}

export function capsuleCapsule(a: CapsuleRef, b: CapsuleRef): CollisionResult {
  const segA = capsuleSegment(a);
  const segB = capsuleSegment(b);
  const midA = segA.a.clone().add(segA.b).multiplyScalar(0.5);
  const closestB = new THREE.Vector3();
  closestPointOnSegment(midA, segB.a, segB.b, closestB);
  const closestA = new THREE.Vector3();
  closestPointOnSegment(closestB, segA.a, segA.b, closestA);
  closestPointOnSegment(closestA, segB.a, segB.b, closestB);
  return sphereSphere({ center: closestA, radius: a.radius }, { center: closestB, radius: b.radius });
}

export function shapeCenter(bodyPos: Vec3, shape: CollisionShape): THREE.Vector3 {
  const off = 'center' in shape && shape.center ? shape.center : { x: 0, y: 0, z: 0 };
  return new THREE.Vector3(bodyPos.x + off.x, bodyPos.y + off.y, bodyPos.z + off.z);
}

export function collideBodies(a: PhysicsBody, b: PhysicsBody): CollisionResult | null {
  const ca = shapeCenter(a.position, a.shape);
  const cb = shapeCenter(b.position, b.shape);

  if (a.shape.kind === 'sphere' && b.shape.kind === 'sphere') {
    return sphereSphere({ center: ca, radius: a.shape.radius }, { center: cb, radius: b.shape.radius });
  }
  if (a.shape.kind === 'sphere' && b.shape.kind === 'box') {
    return sphereBox({ center: ca, radius: a.shape.radius }, { center: cb, half: toV3(b.shape.half) });
  }
  if (a.shape.kind === 'box' && b.shape.kind === 'sphere') {
    const r = sphereBox({ center: cb, radius: b.shape.radius }, { center: ca, half: toV3(a.shape.half) });
    if (r.hit && r.normal) r.normal = { x: -r.normal.x, y: -r.normal.y, z: -r.normal.z };
    return r;
  }
  if (a.shape.kind === 'box' && b.shape.kind === 'box') {
    return boxBox({ center: ca, half: toV3(a.shape.half) }, { center: cb, half: toV3(b.shape.half) });
  }
  if (a.shape.kind === 'sphere' && b.shape.kind === 'capsule') {
    return sphereCapsule({ center: ca, radius: a.shape.radius }, { center: cb, radius: b.shape.radius, height: b.shape.height });
  }
  if (a.shape.kind === 'capsule' && b.shape.kind === 'sphere') {
    const r = sphereCapsule({ center: cb, radius: b.shape.radius }, { center: ca, radius: a.shape.radius, height: a.shape.height });
    if (r.hit && r.normal) r.normal = { x: -r.normal.x, y: -r.normal.y, z: -r.normal.z };
    return r;
  }
  if (a.shape.kind === 'capsule' && b.shape.kind === 'capsule') {
    return capsuleCapsule(
      { center: ca, radius: a.shape.radius, height: a.shape.height },
      { center: cb, radius: b.shape.radius, height: b.shape.height },
    );
  }
  return null;
}

export function raySphere(origin: THREE.Vector3, dir: THREE.Vector3, sphere: SphereRef, maxDist: number): HitResult {
  const m = origin.clone().sub(sphere.center);
  const b = m.dot(dir);
  const c = m.dot(m) - sphere.radius * sphere.radius;
  if (c > 0 && b > 0) return { hit: false };
  const discr = b * b - c;
  if (discr < 0) return { hit: false };
  let t = -b - Math.sqrt(discr);
  if (t < 0) t = 0;
  if (t > maxDist) return { hit: false };
  const pt = origin.clone().addScaledVector(dir, t);
  const normal = pt.clone().sub(sphere.center).normalize();
  return { hit: true, distance: t, point: pt, normal };
}

export function rayBox(origin: THREE.Vector3, dir: THREE.Vector3, box: BoxRef, maxDist: number): HitResult {
  const min = box.center.clone().sub(box.half);
  const max = box.center.clone().add(box.half);
  const b = new THREE.Box3(min, max);
  const ray = new THREE.Ray(origin, dir);
  const target = new THREE.Vector3();
  const hit = ray.intersectBox(b, target);
  if (!hit) return { hit: false };
  const dist = origin.distanceTo(target);
  if (dist > maxDist) return { hit: false };
  const normal = new THREE.Vector3();
  const dMin = Math.abs(target.x - min.x);
  const dMax = Math.abs(target.x - max.x);
  let best = dMin;
  normal.set(-1, 0, 0);
  if (dMax < best) { best = dMax; normal.set(1, 0, 0); }
  if (Math.abs(target.y - min.y) < best) { best = Math.abs(target.y - min.y); normal.set(0, -1, 0); }
  if (Math.abs(target.y - max.y) < best) { best = Math.abs(target.y - max.y); normal.set(0, 1, 0); }
  if (Math.abs(target.z - min.z) < best) { best = Math.abs(target.z - min.z); normal.set(0, 0, -1); }
  if (Math.abs(target.z - max.z) < best) { normal.set(0, 0, 1); }
  return { hit: true, distance: dist, point: target, normal };
}

export function rayCapsule(origin: THREE.Vector3, dir: THREE.Vector3, cap: CapsuleRef, maxDist: number): HitResult {
  const seg = capsuleSegment(cap);
  const p = new THREE.Vector3();
  closestPointOnSegment(origin, seg.a, seg.b, p);
  return raySphere(origin, dir, { center: p, radius: cap.radius }, maxDist);
}
