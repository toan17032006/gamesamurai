/**
 * @file types.ts
 * @module @aetheria/engine/worldview/types
 * @description Hợp đồng kiểu cho hệ render thế giới tự sinh: mọi hình khối,
 * màu sắc và toạ độ đều TỰ TÍNH từ trạng thái thế giới (tăng trưởng, tiến độ
 * xây dựng, thời gian, gió…) — không dùng tệp asset/template có sẵn.
 */

/** Điểm 2D trong toạ độ thế giới. */
export interface Vec2 {
  x: number;
  y: number;
}

/** Style render của một node. */
export interface RenderStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  /** Bo góc cho rect (SVG rx). */
  cornerRadius?: number;
}

/** Các hình cơ bản — mọi thứ trong scene ghép từ những hình này. */
export type Shape =
  | { kind: 'circle'; center: Vec2; radius: number }
  | { kind: 'ellipse'; center: Vec2; rx: number; ry: number; rotationDeg?: number }
  | { kind: 'rect'; topLeft: Vec2; width: number; height: number }
  | { kind: 'polygon'; points: Vec2[] }
  | { kind: 'path'; points: Vec2[]; closed: boolean; smooth?: boolean }
  | { kind: 'line'; from: Vec2; to: Vec2 };

/** Một node trong cây scene — có lớp z để sắp thứ tự vẽ. */
export interface SceneNode {
  id: string;
  /** Loại đối tượng (tree, house, agent, water, terrain…). */
  kind: string;
  /** Lớp vẽ: nhỏ vẽ trước (nền), lớn vẽ sau (trên cùng). */
  z: number;
  /** Toạ độ gốc trong thế giới — dùng cho sắp sâu theo y và culling. */
  origin: Vec2;
  shapes: Shape[];
  style: RenderStyle;
  label?: string;
}

/** Camera nhìn vào thế giới. */
export interface Camera {
  /** Góc trên-trái của khung nhìn (toạ độ thế giới). */
  x: number;
  y: number;
  /** Kích thước khung nhìn (đơn vị thế giới). */
  width: number;
  height: number;
}

/** Trạng thái thời tiết toàn cục ảnh hưởng mọi node. */
export interface WeatherState {
  /** Gió `[-1, 1]` — âm tây, dương đông. */
  windStrength: number;
  /** Mưa `[0, 1]`. */
  rainIntensity: number;
  /** Giờ trong ngày `[0, 24)`. */
  timeOfDay: number;
}

/** Trạng thái một cái cây — lớn lên từng ngày qua `growth`. */
export interface TreeState {
  id: string;
  x: number;
  y: number;
  species: 'oak' | 'pine' | 'palm';
  /** Tăng trưởng `[0, 1]` — 0 là mầm, 1 là cây lớn tối đa. */
  growth: number;
  /** Đã bị chặt → chỉ còn gốc cây. */
  chopped: boolean;
}

/** Trạng thái ngôi nhà — xây dở qua `progress`. */
export interface HouseState {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Tiến độ xây `[0, 1]`: nền → tường → mái → cửa sổ ống khói. */
  progress: number;
  roofColor: string;
  wallColor: string;
}

/** Trạng thái render một agent. */
export interface AgentRenderState {
  id: string;
  x: number;
  y: number;
  kind: 'player' | 'npc' | 'animal' | 'monster';
  /** Chiều cao cm (đã qua appearance engine) — quy ra đơn vị thế giới. */
  heightCm: number;
  /** Độ tròn vóc dáng `[0, 1]`. */
  bodyRoundness: number;
  /** Hướng nhìn: 1 = phải, -1 = trái. */
  facing: 1 | -1;
  /** Hành động đang làm — quyết định tư thế và đạo cụ trên tay. */
  action:
    | 'idle'
    | 'walk'
    | 'chop'
    | 'build'
    | 'farm'
    | 'sew'
    | 'dig'
    | 'carry'
    | 'herd'
    | 'hunt'
    | 'gather'
    | 'fight'
    | 'execute'
    | 'cry'
    | 'laugh'
    | 'cheer'
    | 'tremble'
    | 'bow'
    | 'point'
    | 'celebrate';
  /** Vật đang cầm/khuân (màu). */
  propColor?: string;
  /** Màu thân chính. */
  bodyColor: string;
}

/** Một vùng nước. */
export interface WaterBodyState {
  id: string;
  x: number;
  y: number;
  width: number;
  depth: number;
  kind: 'pond' | 'lake' | 'river' | 'sea';
  /** Pha sóng hiện tại (thời gian). */
  wavePhase: number;
  /** Hướng chảy (river): 1 phải, -1 trái. */
  flowDirection?: 1 | -1;
}

/** Ruộng đồng — lúa theo giai đoạn. */
export interface RiceFieldState {
  id: string;
  x: number;
  y: number;
  width: number;
  rows: number;
  /** Giai đoạn lúa `[0, 1]` — 0 cấy, 1 chín vàng. */
  cropGrowth: number;
}

/** Núi lửa. */
export interface VolcanoState {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Hoạt động `[0, 1]`. */
  activity: number;
  /** Đang phun trào không. */
  erupting: boolean;
}

/** Một hang động — miệng và lòng hang tự sinh từ noise. */
export interface CaveState {
  id: string;
  x: number;
  y: number;
  /** Bề rộng miệng hang. */
  width: number;
  /** Chiều sâu (đậm của bóng trong hang). */
  depth: number;
  /** Seed noise — mỗi hang một hình dáng riêng. */
  seed: number;
}

/** Sự kiện tự nhiên/hệ thống đánh dấu lên scene. */
export interface WorldEventMark {
  kind:
    | 'tsunami'
    | 'eruption'
    | 'earthquake'
    | 'meteor'
    | 'harvest_festival'
    | 'random_event'
    | 'execution'
    | 'battle'
    | 'burial'
    | 'rebuilding';
  x: number;
  y: number;
  /** Cường độ `[0, 1]`. */
  intensity: number;
  /** Tiến trình sự kiện `[0, 1]` — sóng thần tiến dần vào bờ, lưỡi rìu hạ xuống. */
  t: number;
}

/**
 * Phế tích — dấu vết lịch sử của công trình bị đổ vỡ/chôn lấp, có thể được
 * xây lại trên chính nền cũ: tác động của agent/động vật đổi dòng lịch sử
 * và giao diện phản ánh từng lớp như đời sống thực tại.
 */
export interface RuinState {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Mức đổ vỡ `[0, 1]` — 0 nguyên vẹn, 1 hoàn toàn sụp đổ. */
  collapse: number;
  /** Mức bị chôn lấp `[0, 1]` — đất vùi lên theo thời gian. */
  buried: number;
  /** Đang được xây lại trên nền cũ không. */
  rebuilding: boolean;
  /** Màu tường gốc (phế tích giữ màu cũ phai dần). */
  originalWallColor: string;
}

/** Dữ liệu thế giới để assembler dựng scene. */
export interface WorldRenderState {
  terrainHeights: number[];
  trees: TreeState[];
  houses: HouseState[];
  agents: AgentRenderState[];
  waters: WaterBodyState[];
  riceFields: RiceFieldState[];
  volcanos: VolcanoState[];
  caves: CaveState[];
  /** Phế tích — đổ vỡ/chôn lấp/tái xây. */
  ruins: RuinState[];
  events: WorldEventMark[];
  weather: WeatherState;
  /** Thời gian thế giới (giây) — cho mọi animation tự tính. */
  worldTime: number;
}

/** Kết quả layout một node sau culling + sắp thứ tự. */
export interface SceneLayoutNode {
  node: SceneNode;
  /** Có nằm trong khung camera không. */
  visible: boolean;
}
