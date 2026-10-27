/**
 * @file civilization-templates.ts
 * @module @aetheria/engine/law/civilization-templates
 * @description Các bộ mặt của xã hội phong kiến qua các nền văn minh: Đông Á
 * (thiên tử/bá quan), Tây Âu trung cổ (feudal chư hầu), Hồi giáo caliphate,
 * Ấn Độ đế chế, Mesoamerica, châu Phi vương quốc, thảo nguyên du mục và cả
 * **vũ trụ** (đế chế liên sao). Mỗi template đổi tên tước, chức quan, nguồn
 * chính danh, phong cách luật và khẩu hiệu sắc lệnh — `applyTemplate` áo lên
 * một FeudalState là thành một nền văn minh riêng.
 */

import { DeepRandom, clamp01, hashSeed } from '../deeplearning/random.js';
import type { FeudalRank, FeudalState } from './governance.js';

/** Nguồn chính danh của ngôi báu. */
export type LegitimacySource =
  | 'mandate_of_heaven'
  | 'divine_right'
  | 'bloodline'
  | 'election'
  | 'strength'
  | 'consensus'
  | 'machine_decree';

/** Phong cách luật của văn minh. */
export type LawStyle = 'confucian_rites' | 'feudal_custom' | 'sharia_courts' | 'dharma_shastra' | 'codex_law' | 'oral_tradition' | 'machine_directive';

/** Template một bộ mặt xã hội. */
export interface SocietyTemplate {
  id: string;
  name: string;
  culture: 'east_asian' | 'western_medieval' | 'islamic' | 'indian' | 'mesoamerican' | 'african' | 'steppe' | 'cosmic';
  era: 'ancient' | 'classical' | 'medieval' | 'early_modern' | 'far_future';
  /** Tên hiển thị từng cấp tước. */
  rankTitles: Record<FeudalRank, string>;
  /** Tên chức quan tiêu biểu. */
  officeTitles: { chancellor: string; judge: string; general: string; censor: string; scribe: string; priest: string };
  legitimacySource: LegitimacySource;
  lawStyle: LawStyle;
  /** Tôn giáo/niền tin nền. */
  stateFaithFlavor: string;
  /** Hệ số cưỡng chế nền `[0, 1]`. */
  baseCoercion: number;
  /** Khẩu hiệu sắc lệnh đặc trưng. */
  decreeFlavor: string;
  /** Văn phong đặt tên quốc gia/người. */
  nameSeeds: { states: readonly string[]; sovereignPrefix: string };
  description: string;
}

/** Bộ sưu tập template các nền văn minh. */
export const CIVILIZATION_TEMPLATES: readonly SocietyTemplate[] = Object.freeze([
  {
    id: 'civ_east_asian',
    name: 'Đế quốc Thiên Triều',
    culture: 'east_asian',
    era: 'medieval',
    rankTitles: { emperor: 'Hoàng Đế', king: 'Vương', duke: 'Công', count: 'Hầu', baron: 'Bá', knight: 'Kỵ Đô Úy', commoner: 'Thứ Dân' },
    officeTitles: { chancellor: 'Tể Tướng', judge: 'Đại Lý Tự Khanh', general: 'Đại Tướng Quân', censor: 'Ngự Sử Đại Phu', scribe: 'Hàn Lâm Sĩ', priest: 'Tế Tửu' },
    legitimacySource: 'mandate_of_heaven',
    lawStyle: 'confucian_rites',
    stateFaithFlavor: 'thiên mệnh — vua mất đức thì trời thu mệnh',
    baseCoercion: 0.45,
    decreeFlavor: 'Thiên tử chiếu viết: ',
    nameSeeds: { states: ['Đại Hạ', 'Đại Việt', 'Đại Minh', 'Đại Thanh'], sovereignPrefix: 'Hoàng Đế' },
    description: 'quản lý bằng lễ nghĩa và khoa cử, quan lại học hành mới cầm quyền',
  },
  {
    id: 'civ_western_medieval',
    name: 'Vương Quốc Phong Kiến Tây Âu',
    culture: 'western_medieval',
    era: 'medieval',
    rankTitles: { emperor: 'Holy Emperor', king: 'King', duke: 'Duke', count: 'Count', baron: 'Baron', knight: 'Knight', commoner: 'Serf' },
    officeTitles: { chancellor: 'Lord Chancellor', judge: 'Royal Magistrate', general: 'Marshal', censor: 'Inquisitor', scribe: 'Court Scribe', priest: 'Archbishop' },
    legitimacySource: 'divine_right',
    lawStyle: 'feudal_custom',
    stateFaithFlavor: 'quyền vua do thánh thần ban — giáo hoàng đùa với vương miện',
    baseCoercion: 0.5,
    decreeFlavor: 'By the grace of the divine: ',
    nameSeeds: { states: ['Valoria', 'Roderick', 'Ashenmark', 'Brytonia'], sovereignPrefix: 'King' },
    description: 'chư hầu đằng đằng sát khí, giới giáo sĩ và quý tộc chia quyền với vua',
  },
  {
    id: 'civ_islamic_caliphate',
    name: 'Caliphate',
    culture: 'islamic',
    era: 'classical',
    rankTitles: { emperor: 'Caliph', king: 'Sultan', duke: 'Emir', count: 'Wali', baron: 'Sheikh', knight: 'Mamluk Captain', commoner: 'Ummah' },
    officeTitles: { chancellor: 'Vizier', judge: 'Qadi', general: 'Amir al-Umara', censor: 'Muhtasib', scribe: 'Katib', priest: 'Grand Imam' },
    legitimacySource: 'divine_right',
    lawStyle: 'sharia_courts',
    stateFaithFlavor: 'pháp luật và tôn giáo là một — toà qadi xét mọi việc',
    baseCoercion: 0.42,
    decreeFlavor: 'Nhân danh Đấng Rao Giả: ',
    nameSeeds: { states: ['Đại Caliphate Rashid', 'Sultanate Al-Zahir', 'Emirate Qasim'], sovereignPrefix: 'Caliph' },
    description: 'thương mại vươn xa, học viện giữ tri thức cổ đại, qadi xét xử bằng giáo luật',
  },
  {
    id: 'civ_indian',
    name: 'Đế Chế Dharmic',
    culture: 'indian',
    era: 'ancient',
    rankTitles: { emperor: 'Maharajadhiraja', king: 'Raja', duke: 'Maharaja', count: 'Rao', baron: 'Zamindar', knight: 'Sardar', commoner: 'Praja' },
    officeTitles: { chancellor: 'Mantri', judge: 'Dharmadhikari', general: 'Senapati', censor: 'Dharma Censor', scribe: 'Lekhaka', priest: 'Purohita' },
    legitimacySource: 'bloodline',
    lawStyle: 'dharma_shastra',
    stateFaithFlavor: 'dharma trói tầng lớp — mỗi người sinh ra có phận sự riêng',
    baseCoercion: 0.4,
    decreeFlavor: 'Theo trật tự vũ trụ dharma: ',
    nameSeeds: { states: ['Magadha Mới', 'Chola Đại Đế', 'Vijayanagara'], sovereignPrefix: 'Maharaja' },
    description: 'tầng lớp sinh ra đã định, kinh tế gia súc và gia vị giàu có',
  },
  {
    id: 'civ_mesoamerican',
    name: 'Liên Minh Thành Bang Pyramide',
    culture: 'mesoamerican',
    era: 'classical',
    rankTitles: { emperor: 'Huey Tlatoani', king: 'Tlatoani', duke: 'Pilli Lord', count: 'Teuctli', baron: 'Calpullec', knight: 'Eagle Knight', commoner: 'Macehualtin' },
    officeTitles: { chancellor: 'Cihuacoatl', judge: 'Tlamacazqui Judge', general: 'Tlacochcalcatl', censor: 'Ritual Censor', scribe: 'Codex Painter', priest: 'High Priest of the Sun' },
    legitimacySource: 'divine_right',
    lawStyle: 'codex_law',
    stateFaithFlavor: 'mặt trời cần được nuôi bằng nghi lễ — năm losing có thể thành của lễ',
    baseCoercion: 0.6,
    decreeFlavor: 'Dưới ánh mặt trời thần thánh: ',
    nameSeeds: { states: ['Tenochitlan', 'Tetzcoco', 'Tlacopan'], sovereignPrefix: 'Tlatoani' },
    description: 'thành bang cạnh tranh, kim tự tháp leo lên trời, lịch chính xác kinh ngạc',
  },
  {
    id: 'civ_african',
    name: 'Vương Quốc Sông Vàng',
    culture: 'african',
    era: 'medieval',
    rankTitles: { emperor: 'Mansa', king: 'Oba', duke: 'Noble Elder', count: 'District Chief', baron: 'Village Head', knight: 'Horse Warrior', commoner: 'Kinsman' },
    officeTitles: { chancellor: 'Burujuba', judge: 'Griot Judge', general: 'War Chief', censor: 'Ancestor Censor', scribe: 'Sand Diviner', priest: 'Ancestor Priest' },
    legitimacySource: 'consensus',
    lawStyle: 'oral_tradition',
    stateFaithFlavor: 'tổ tiên nghe qua miệng griot — luật sống trong thơ và truyện',
    baseCoercion: 0.3,
    decreeFlavor: 'Lời tổ tiên phán qua miệng griot: ',
    nameSeeds: { states: ['Mansa Gold', 'Oba Lộng Lẫy', 'Timbuktu Hưng Thịnh'], sovereignPrefix: 'Mansa' },
    description: 'vàng và muối làm giàu, luật lưu truyền bằng khẩu truyền, hội đồng trưởng làng',
  },
  {
    id: 'civ_steppe',
    name: 'Hãn Quốc Thảo Nguyên',
    culture: 'steppe',
    era: 'medieval',
    rankTitles: { emperor: 'Đại Hãn', king: 'Hãn', duke: 'Vạn Hộ Trưởng', count: 'Thiên Hộ Trưởng', baron: 'Bách Hộ Trưởng', knight: 'Cung Thủ Nặng', commoner: 'Mục Dân' },
    officeTitles: { chancellor: 'Tể Tướng Khăn Đen', judge: 'Yassa Thẩm Quan', general: 'Tumen Commander', censor: 'Sắc Lệnh Truy Sát', scribe: 'Bút Ký', priest: 'Pháp Sư Tengri' },
    legitimacySource: 'strength',
    lawStyle: 'oral_tradition',
    stateFaithFlavor: 'trời xanh Tengri chọn kẻ mạnh nhất — Yassa của Đại Hãn là luật sắt',
    baseCoercion: 0.7,
    decreeFlavor: 'Lệnh Yassa của Đại Hãn: ',
    nameSeeds: { states: ['Hãn Quốc Bão Tố', 'Kim Trướng', 'Nguyên Mộng'], sovereignPrefix: 'Đại Hãn' },
    description: 'mã tốc chiến thuật, quân đội tổ chức theo đơn vị thập phân, luật nghiệt ngã nhưng hiệu quả',
  },
  {
    id: 'civ_cosmic',
    name: 'Đế Chế Liên Sao',
    culture: 'cosmic',
    era: 'far_future',
    rankTitles: { emperor: 'Star Sovereign', king: 'System Archon', duke: 'Orbit Duke', count: 'Planet Count', baron: 'Habitat Baron', knight: 'Void Knight', commoner: 'Registry Citizen' },
    officeTitles: { chancellor: 'Prime Executor', judge: 'Algorithm Magistrate', general: 'Fleet Marshal', censor: 'Information Warden', scribe: 'Data Archivist', priest: 'Singularity Oracle' },
    legitimacySource: 'machine_decree',
    lawStyle: 'machine_directive',
    stateFaithFlavor: 'thuật toán tối thượng — công lý là một hàm tối ưu chạy không nghỉ',
    baseCoercion: 0.65,
    decreeFlavor: 'DIRECTIVE-77 phát sóng toàn quỹ đạo: ',
    nameSeeds: { states: ['Liên Bang Orion', 'Khối Hành Tinh Kepler', 'Tập Đoàn Helios'], sovereignPrefix: 'Sovereign' },
    description: 'hàng nghìn hành tinh, công lý bởi thuật toán, phản loạn bằng cách hack chính directive',
  },
]);

/** Tìm template theo nhánh văn minh. */
export function templateForCulture(culture: SocietyTemplate['culture']): SocietyTemplate | undefined {
  return CIVILIZATION_TEMPLATES.find((template) => template.culture === culture);
}

/** Áo template lên quốc gia phong kiến: đổi tên tước, nguồn chính danh, cưỡng chế. */
export function applyTemplate(state: FeudalState, template: SocietyTemplate): FeudalState {
  state.rankTitles = { ...template.rankTitles };
  state.legitimacySource = template.legitimacySource;
  state.culture = template.culture;
  // Văn minh cưỡng chế mạnh (steppe/meso/cosmic) khởi điểm tay sắt hơn.
  state.coercionCapacity = clamp01(template.baseCoercion);
  // Chính danh khởi điểm theo nguồn: divine/mandate cao, strength cần chiến thắng mới bền.
  const legitimacyBase: Record<LegitimacySource, number> = {
    mandate_of_heaven: 0.85,
    divine_right: 0.8,
    bloodline: 0.7,
    election: 0.65,
    consensus: 0.6,
    strength: 0.5,
    machine_decree: 0.75,
  };
  state.legitimacy = clamp01(legitimacyBase[template.legitimacySource]);
  return state;
}

/** Tên tước hiển thị của một cấp trong quốc gia đã áp template. */
export function rankTitleOf(state: FeudalState, rank: FeudalRank): string {
  return state.rankTitles?.[rank] ?? rank;
}

/** Đặt tên quốc gia/người theo văn minh (tất định theo seed). */
export function generateSocietyName(template: SocietyTemplate, seed: number | string): { stateName: string; sovereignName: string } {
  const random = new DeepRandom(`${template.id}:${seed}`);
  const stateName = random.pick(template.nameSeeds.states) ?? template.name;
  const ordinal = random.int(1, 12);
  return {
    stateName,
    sovereignName: `${template.nameSeeds.sovereignPrefix} ${ordinal}`,
  };
}

/** Thành lập quốc gia theo văn minh — một call cho một nền văn minh hoàn chỉnh. */
export function foundCivilization(options: {
  state: FeudalState;
  culture: SocietyTemplate['culture'];
  seed?: number | string;
}): { state: FeudalState; template: SocietyTemplate; names: { stateName: string; sovereignName: string } } {
  const template = templateForCulture(options.culture) ?? CIVILIZATION_TEMPLATES[0];
  applyTemplate(options.state, template);
  const names = generateSocietyName(template, options.seed ?? hashSeed(options.state.id).toString(16));
  options.state.name = names.stateName;
  return { state: options.state, template, names };
}
