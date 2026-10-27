/**
 * @file types.ts
 * @module @aetheria/engine/ui-procedural/types
 * @description Hợp đồng kiểu cho hệ render UI tự sinh: widget tree được sinh
 * trực tiếp từ dữ liệu mô phỏng (không dùng tệp layout có sẵn), sau đó được
 * layout tính toạ độ và render sang ASCII/HTML.
 */

/** Loại widget được generator tự sinh. */
export type WidgetKind =
  | 'root'
  | 'panel'
  | 'row'
  | 'column'
  | 'label'
  | 'bar'
  | 'stat'
  | 'badge'
  | 'list'
  | 'feed'
  | 'grid'
  | 'graph';

/** Biến thể màu ngữ nghĩa — theme quyết định màu cụ thể. */
export type WidgetVariant = 'primary' | 'success' | 'warning' | 'danger' | 'muted' | 'accent';

/** Style token của widget (tất cả tuỳ chọn — theme điền phần thiếu). */
export interface WidgetStyle {
  background?: string;
  foreground?: string;
  accent?: string;
  padding?: number;
  gap?: number;
  fontSize?: number;
  bold?: boolean;
  /** Trọng số chiếm chỗ trong layout row (mặc định 1). */
  flex?: number;
  /** Chiều cao tối thiểu tính bằng đơn vị dòng layout. */
  minHeight?: number;
}

/** Một nút widget trong cây UI tự sinh. */
export interface WidgetNode {
  id: string;
  kind: WidgetKind;
  label?: string;
  /** Giá trị chuẩn hoá `[0, 1]` (bar/stat/graph). */
  value?: number;
  /** Chuỗi hiển thị giá trị (mặc định sinh từ value). */
  valueText?: string;
  variant?: WidgetVariant;
  children: WidgetNode[];
  style: WidgetStyle;
}

/** Hộp giới hạn 2D cho layout. */
export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Widget sau khi đã tính toạ độ tuyệt đối. */
export interface LayoutNode {
  widget: WidgetNode;
  bounds: Bounds;
  children: LayoutNode[];
}

/** Dữ liệu một thực thể cho UI tự sinh. */
export interface UIEntityData {
  id: string;
  name: string;
  ageYears: number;
  stage: string;
  /** Sức khoẻ `[0, 100]`. */
  health: number;
  /** Hạnh phúc `[0, 100]`. */
  happiness: number;
  /** Nhu cầu Maslow hiện hành: id → mức `[0, 100]` (càng thấp càng cấp bách). */
  needs?: Record<string, number>;
  /** Cảm xúc trội hiện tại. */
  emotion?: string;
  /** Nghiệp chủng / nghề nghiệp. */
  archetypeName?: string;
  /** Mô tả ngoại hình (từ appearance engine). */
  appearanceSummary?: string;
}

/** Dữ liệu thế giới để generator tự dựng HUD. */
export interface UIWorldData {
  year: number;
  civilizationName: string;
  population: number;
  /** Hạnh phúc trung bình `[0, 100]`. */
  averageHappiness: number;
  /** Sức khoẻ trung bình `[0, 100]`. */
  averageHealth: number;
  /** Tâm lòng chung `[-1, 1]`. */
  mood: number;
  timeOfDay?: 'dawn' | 'day' | 'dusk' | 'night';
  entities: UIEntityData[];
  events: ReadonlyArray<{ year: number; text: string }>;
}
