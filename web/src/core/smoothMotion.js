// smoothMotion: trọng lực + vị trí + render mượt cho game.
// Thuần JS, KHÔNG phụ thuộc three.js nên test được bằng node.
// Vấn đề nó giải quyết:
//  - Trước đây Character.applyPhysics dùng dt biến thiên trực tiếp
//    (Ticker clamp tối đa 0.05s). Khi FPS tụt, một frame dài làm vật
//    rơi quá sâu / xuyên đất, khi FPS cao thì chuyển động giật cục.
//  - Giải pháp: chia dt thành các bước nhỏ tối đa 1/120s (substep),
//    tích phân bán ẩn (semi-implicit Euler: cập nhật vận tốc trước,
//    rồi mới cập nhật vị trí), giới hạn vận tốc rơi, và nội suy vị
//    trí render giữa 2 khung vật lý để màn hình 120/144Hz vẫn mượt.
//
// Body dùng chung dạng: { pos: {x,y,z}, vel: {x,y,z}, grounded: bool,
//   prevPos: {x,y,z} | null }
// pos/vel có thể là THREE.Vector3 hoặc object {x,y,z} thuần.

export const GRAVITY = -18;          // khớp hằng số cũ trong character.js
export const TERMINAL_VELOCITY = -50; // chặn rơi tự do: tránh xuyên đất khi lag
export const MAX_SUBSTEP = 1 / 120;   // bước vật lý tối đa ~8.33ms
export const FIXED_DT = 1 / 60;       // bước cố định cho FixedStepper

function clampNum(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

/** Lưu vị trí hiện tại làm vị trí render của khung trước. */
export function snapshotPosition(body) {
  if (!body.prevPos) body.prevPos = { x: body.pos.x, y: body.pos.y, z: body.pos.z };
  else { body.prevPos.x = body.pos.x; body.prevPos.y = body.pos.y; body.prevPos.z = body.pos.z; }
  return body.prevPos;
}

/**
 * Tính trọng lực: vel.y += gravity * dt, kẹp ở vận tốc rơi tối đa.
 * Trả về vel.y mới. Không chạm vào pos — tách riêng để test được.
 */
export function applyGravity(body, dt, { gravity = GRAVITY, terminalVelocity = TERMINAL_VELOCITY } = {}) {
  if (dt <= 0) return body.vel.y;
  body.vel.y = Math.max(terminalVelocity, body.vel.y + gravity * dt);
  return body.vel.y;
}

/**
 * Tính vị trí sau 1 bước dt, có va chạm mặt đất / vật cản / biên.
 * Thứ tự giữ nguyên logic cũ: dọc trước (dùng groundY đã lấy trước
 * bước), rồi ngang, rồi collideCircle + kẹp biên.
 * Trả về { landed: bool, impact: number } — impact là vel.y ngay
 * trước khi chạm đất (âm = rơi xuống), để caller phát hiệu ứng
 * đáp đất chỉ khi impact đủ lớn.
 */
export function integratePosition(body, dt, { groundY = 0, collide = null, radius = 0.45, boundLimit = null } = {}) {
  if (dt <= 0) return { landed: false, impact: 0 };
  const wasGrounded = body.grounded;
  // Đứng yên trên đất: dính sát mặt đất trước khi tính trọng lực.
  if (wasGrounded && body.pos.y <= groundY + 0.02) body.pos.y = groundY;

  const impact = body.vel.y;
  body.pos.y += body.vel.y * dt;
  let landed = false;
  if (body.pos.y <= groundY) {
    landed = !wasGrounded;
    body.pos.y = groundY;
    body.vel.y = 0;
    body.grounded = true;
  } else {
    body.grounded = false;
  }

  body.pos.x += body.vel.x * dt;
  body.pos.z += body.vel.z * dt;
  if (collide) collide(body.pos, radius);
  if (Number.isFinite(boundLimit)) {
    body.pos.x = clampNum(body.pos.x, -boundLimit, boundLimit);
    body.pos.z = clampNum(body.pos.z, -boundLimit, boundLimit);
  }
  return { landed, impact };
}

/**
 * Một bước vật lý đầy đủ: trọng lực + vị trí.
 * Trả về kết quả của integratePosition.
 */
export function stepBody(body, dt, opts = {}) {
  applyGravity(body, dt, opts);
  return integratePosition(body, dt, opts);
}

/**
 * Chia frame dt dài thành nhiều bước nhỏ (tối đa MAX_SUBSTEP) và
 * chạy stepBody cho từng bước. groundY/collide/boundLimit được lấy
 * lại mỗi bước qua getWorld(pos) để không xuyên địa hình dốc.
 * Trả về { landed, impact } gộp: landed = có đáp đất trong frame,
 * impact = vận tốc rơi mạnh nhất lúc đáp.
 */
export function stepWithSubsteps(body, dt, getWorld, { maxSubstep = MAX_SUBSTEP } = {}) {
  if (dt <= 0) return { landed: false, impact: 0 };
  snapshotPosition(body);
  const steps = Math.max(1, Math.ceil(dt / maxSubstep));
  const h = dt / steps;
  let landed = false, impact = 0;
  for (let i = 0; i < steps; i++) {
    const w = getWorld ? getWorld(body.pos) : {};
    const r = stepBody(body, h, w);
    if (r.landed) { landed = true; impact = Math.min(impact, r.impact); }
  }
  return { landed, impact };
}

/**
 * Nội suy vị trí render: prev -> curr theo alpha [0,1].
 * Dùng khi vật lý chạy bước cố định nhưng màn hình vẽ ở tần số
 * khác: renderPos = prev + (curr - prev) * alpha, không giật.
 * out: object {x,y,z} nhận kết quả (tái sử dụng để tránh cấp phát
 * mới mỗi frame — quan trọng cho hiệu năng).
 */
export function interpolatePosition(prev, curr, alpha, out) {
  const a = clampNum(alpha, 0, 1);
  out.x = prev.x + (curr.x - prev.x) * a;
  out.y = prev.y + (curr.y - prev.y) * a;
  out.z = prev.z + (curr.z - prev.z) * a;
  return out;
}

/** Vị trí render mượt của body: nội suy từ prevPos tới pos. */
export function renderPosition(body, alpha, out) {
  const prev = body.prevPos || body.pos;
  return interpolatePosition(prev, body.pos, alpha, out);
}

/**
 * FixedStepper: tích lũy thời gian frame và chạy vật lý theo bước
 * cố định FIXED_DT, trả về alpha để render nội suy.
 * Dùng cho vòng lặp muốn vật lý xác định 100% (cùng input, cùng
 * kết quả dù FPS thay đổi), khác với stepWithSubsteps chỉ chia nhỏ
 * dt biến thiên. Tối đa 5 bước/frame để tránh "spiral of death"
 * khi tab bị ẩn lâu — thời gian dư bị bỏ qua có chủ đích.
 */
export class FixedStepper {
  constructor(stepFn, fixedDt = FIXED_DT) {
    if (typeof stepFn !== 'function') throw new Error('FixedStepper: cần stepFn(dt)');
    this.stepFn = stepFn;
    this.fixedDt = fixedDt;
    this.acc = 0;
    this.alpha = 1;
  }

  update(frameDt) {
    const dt = Math.min(Math.max(frameDt, 0), 0.25); // bỏ qua khoảng nghỉ quá dài
    this.acc += dt;
    let steps = 0;
    while (this.acc >= this.fixedDt && steps < 5) {
      this.stepFn(this.fixedDt);
      this.acc -= this.fixedDt;
      steps++;
    }
    if (steps === 5) this.acc = 0; // spiral-of-death guard
    this.alpha = this.acc / this.fixedDt;
    return this.alpha;
  }

  reset() { this.acc = 0; this.alpha = 1; }
}
