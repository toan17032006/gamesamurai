/**
 * @file vietnamese-generation.ts
 * @module @aetheria/engine/training/vietnamese-generation
 * @description Sinh câu tiếng Việt QUY MÔ HÀNG TRĂM TRIỆU với ngữ nghĩa KHÔNG
 * lẫn lộn: vốn từ phân loại ngữ nghĩa (mỗi danh từ có category, mỗi động từ
 * khai báo category tương thích), câu sinh theo index (streaming — không cần
 * lưu cả corpus), **ràng buộc động từ–bổ ngữ** chặn câu vô nghĩa, và cổng
 * `checkSemanticCoherence` đối chiếu ngược. Capacity combinatorial ≥ 100 triệu
 * câu duy nhất — train hàng tỉ mẫu bằng streaming không ăn bớt quy trình.
 */

import { DeepRandom, clampRange } from '../deeplearning/random.js';
import { tokenizeVietnamese } from './vietnamese-language.js';

// ===========================================================================
// Vốn từ ngữ nghĩa — danh từ có category, động từ khai báo tương thích
// ===========================================================================

/** Danh từ phân loại. */
export interface SemanticNoun {
  text: string;
  category: string;
}

/** Động từ với category bổ ngữ tương thích. */
export interface SemanticVerb {
  text: string;
  /** Danh từ category nào ghép được — ngoài danh sách là câu VÔ NGHĨA. */
  compatibleCategories: readonly string[];
}

/** Danh từ bổ ngữ theo category. */
export const SEMANTIC_OBJECTS: Readonly<Record<string, readonly string[]>> = Object.freeze({
  ruong: ['mảnh ruộng', 'cánh đồng', 'bờ ruộng', 'thửa đất', 'luống lúa', 'cây lúa non', 'bông lúa chín', 'mùa gặt', 'mầm lúa non', 'tưới tiêu ruộng'],
  nha: ['ngôi nhà mái tranh', 'mái ngói', 'cái cửa gỗ', 'hàng rào tre', 'chiếc cầu nhỏ', 'bức tường đá', 'mái che sân', 'bậc thang đá'],
  vat: ['chiếc bát', 'cái nồi đất', 'chiếc chổi', 'cái bàn gỗ', 'chiếc đèn dầu', 'quả bí', 'chiếc rổ', 'cái thúng', 'chiếc ghế mây', 'chiếc chạn bát'],
  dong_vat: ['con trâu', 'đàn gà', 'con chó nhỏ', 'đàn vịt', 'con ngựa', 'chú mèo', 'đàn lợn', 'con bò cái'],
  nuoc: ['dòng sông', 'chiếc giếng', 'bờ ao', 'con kênh', 'giếng nước mặn', 'thác nước', 'khúc sông hiền', 'bể sâu'],
  rung: ['cây cổ thụ', 'khu rừng già', 'bó củi khô', 'tán lá xanh', 'gốc đa ngàn tuổi', 'lùm tre làng', 'cánh rừng thông', 'chồi non'],
  duong: ['con đường làng', 'lối mòn', 'quãng đường xa', 'cây cầu bắc ngang', 'con dốc', 'vệt xe bò', 'mặt đường đất', 'bến đò'],
  thuyen: ['chiếc thuyền gỗ', 'bè tre', 'cánh buồm', 'mái chèo', 'lưới đánh cá', 'căn bến', 'chiếc xuồng', 'mỏ neo'],
  lua: ['bó củi lửa', 'bếp lửa', 'ngọn nến', 'lò rèn', 'đống rơm khô', 'ngọn đuốc', 'bàn ủi than', 'củ than hồng'],
  an: ['mâm cơm', 'bữa sáng', 'nồi canh rau', 'đĩa rau muống', 'giỏ trái cây', 'bánh chưng', 'xôi ngô', 'chén rượu cần', 'mâm quả cưới', 'đĩa trái cây'],
  ao_quan: ['chiếc áo dài', 'cái khăn rằn', 'đôi guốc mộc', 'cái nón lá', 'chiếc váy lụa', 'bộ đồ công sở', 'chiếc mũ nón', 'đôi dép cao su'],
  nhiếp: ['buổi chụp hình', 'khoảnh khắc', 'khung cảnh', 'bức tranh', 'đoạn phim', 'bản nhạc', 'khúc ca', 'bức ảnh'],
});

/** Động từ + category bổ ngữ tương thích. */
export const SEMANTIC_VERBS: ReadonlyArray<SemanticVerb> = Object.freeze([
  { text: 'cày', compatibleCategories: ['ruong'] },
  { text: 'gieo', compatibleCategories: ['ruong'] },
  { text: 'gặt', compatibleCategories: ['ruong'] },
  { text: 'trồng', compatibleCategories: ['ruong', 'rung'] },
  { text: 'tưới', compatibleCategories: ['ruong', 'rung'] },
  { text: 'xây', compatibleCategories: ['nha'] },
  { text: 'vá', compatibleCategories: ['nha', 'thuyen'] },
  { text: 'lợp', compatibleCategories: ['nha'] },
  { text: 'rửa', compatibleCategories: ['vat', 'an'] },
  { text: 'sửa', compatibleCategories: ['vat', 'nha', 'thuyen'] },
  { text: 'mang', compatibleCategories: ['vat', 'ao_quan'] },
  { text: 'giặt', compatibleCategories: ['ao_quan'] },
  { text: 'khoác', compatibleCategories: ['ao_quan'] },
  { text: 'chăn', compatibleCategories: ['dong_vat'] },
  { text: 'cho', compatibleCategories: ['dong_vat', 'an'] },
  { text: 'dẫn', compatibleCategories: ['dong_vat'] },
  { text: 'bẫy', compatibleCategories: ['dong_vat'] },
  { text: 'khai thông', compatibleCategories: ['nuoc'] },
  { text: 'trông chừng', compatibleCategories: ['nuoc', 'dong_vat'] },
  { text: 'khoan sâu', compatibleCategories: ['nuoc'] },
  { text: 'chặt', compatibleCategories: ['rung'] },
  { text: 'trèo lên', compatibleCategories: ['rung'] },
  { text: 'giấu dưới', compatibleCategories: ['rung'] },
  { text: 'rải đá phủ', compatibleCategories: ['duong'] },
  { text: 'quét', compatibleCategories: ['duong'] },
  { text: 'bắc ngang', compatibleCategories: ['duong'] },
  { text: 'chèo', compatibleCategories: ['thuyen'] },
  { text: 'neo', compatibleCategories: ['thuyen'] },
  { text: 'thả lưới trên', compatibleCategories: ['thuyen', 'nuoc'] },
  { text: 'thắp', compatibleCategories: ['lua'] },
  { text: 'nén than', compatibleCategories: ['lua'] },
  { text: 'dọn', compatibleCategories: ['lua', 'nha'] },
  { text: 'bày biện', compatibleCategories: ['an'] },
  { text: 'nêm nếm', compatibleCategories: ['an'] },
  { text: 'đặt lên bàn', compatibleCategories: ['an', 'vat'] },
  { text: 'lên đồ', compatibleCategories: ['ao_quan'] },
  { text: 'chụp', compatibleCategories: ['nhiếp'] },
  { text: 'vẽ', compatibleCategories: ['nhiếp'] },
  { text: 'thu âm', compatibleCategories: ['nhiếp'] },
]);

/** Chủ ngữ. */
export const SEMANTIC_SUBJECTS: readonly string[] = Object.freeze([
  'người nông dân cần mẫn', 'anh thợ rèn tài hoa', 'bà lão chợ quê', 'đứa trẻ chăn trâu', 'người lái đò lặng lẽ',
  'cô thợ dệt khéo tay', 'lão ngư dân lấm lem', 'chú bé mục đồng', 'bà mẹ trẻ đảm đang', 'người lính trẻ nghị lực',
  'vị trưởng làng uy nghi', 'cô giáo làng hiền hậu', 'người thợ gốm tỉ mỉ', 'thương nhân phương xa', 'cô tiên nhỏ xinh xắn',
  'người gác đền nghiêm trang', 'anh thợ mộc giỏi', 'bà cụ bốn phương', 'chàng trai khoẻ mạnh', 'cô gái bán hoa tươi',
  'vị lương y già', 'người đánh cá đêm', 'đội thanh niên xung kích', 'cô đầu xưa kiều diễm', 'ông đồ dạy chữ',
  'anh hướng đạo sinh nhiệt tình', 'người giữ đền trung thành', 'cô bán bánh ngọt', 'chú bé đốt than', 'ông thầy pháp bí ẩn',
  'người làm vườn tật nguyền', 'anh sửa xe cần mẫn', 'cô y tế thôn xóm', 'ông chủ quán nước mát', 'bà mục đồng thứ hai',
  'anh kéo xe bò khỏe khoắn', 'người chụp ảnh phong cảnh', 'cô nuôi ong lấy mật', 'vị trùm sò đất', 'người gánh hàng rong',
]);


/** Nơi chốn. */
export const SEMANTIC_PLACES: readonly string[] = Object.freeze([
  'trên cánh đồng làng', 'bên bờ sông hiền', 'dưới gốc đa cổ thụ', 'trong khu vườn nhà', 'ngoài bến nước vắng',
  'trên triền đê quanh co', 'dưới bóng tre làng', 'giữa cánh đồng lúa vàng', 'bên bờ ao yên tĩnh', 'trên lưng đồi cỏ xanh',
  'trong khu rừng già', 'ngay trước sân nhà', 'dưới cơn mưa phùn', 'trong nắng sớm mai', 'bên hiên nhà lá',
  'trên con đường làng', 'sau lưng ngôi chùa cổ', 'bên cạnh bến đò vắng', 'giữa vườn cây ăn trái', 'dưới chân núi mù sương',
]);

/** Thời gian. */
export const SEMANTIC_TIMES: readonly string[] = Object.freeze([
  'vào buổi bình minh', 'giữa trưa nắng gắt', 'vào chiều muộn', 'trong đêm trăng rằm', 'đúng mùa gặt bội thu',
  'trong mùa mưa bão', 'ngày lễ hội làng', 'vào giờ sớm mai', 'đầu mùa xuân mới', 'khi gió se lạnh về',
  'giữa nights hè', 'một buổi sáng sương', 'trong hoàng hôn đỏ', 'khoảnh khắc giao thừa', 'buổi sớm mưa dầm',
].map((t) => t.replace('nights', 'đêm')));

/** Vị câu cuối — nhân capacity (20 vị → capacity ≥ 100 triệu câu duy nhất). */
export const SEMANTIC_FINALS: readonly string[] = Object.freeze([
  '.', ' mỗi ngày.', ' đều đặn.', ' không ngừng nghỉ.', ' bằng tất cả tình yêu.',
  ' bằng đôi tay chai sạn.', ' từ lúc tờ mờ sáng.', ' cho tới khi mặt trời lặn.',
  ' mà không một tiếng than.', ' cùng tiếng cười giòn tan.', ' trong niềm vui lặng lẽ.',
  ' với tất cả sự tận tụy.', ' như một nghi thức thiêng liêng.', ' theo nhịp sống quê hương.',
  ' mà quê hương nào cũng có.', ' đúng như lời ông cha dạy.', ' để rồi trưởng thành hơn.',
  ' suốt bao năm tháng.', ' bằng cách riêng của mình.', ' cho mai sau khỏi hối hận.',
]);

/** Kết quả sinh một câu ngữ nghĩa. */
export interface GeneratedSentence {
  text: string;
  subject: string;
  verb: string;
  object: string;
  place: string;
  time: string;
  /** Câu có tuân thủ ràng buộc verb–object tương thích không. */
  semanticallyCoherent: boolean;
}

/** Tổng capacity: subjects × Σ(verb×objects tương thích) × places × times × finals. */
export function corpusCapacity(): number {
  let verbObjectCombos = 0;
  for (const verb of SEMANTIC_VERBS) {
    for (const category of verb.compatibleCategories) {
      verbObjectCombos += SEMANTIC_OBJECTS[category]?.length ?? 0;
    }
  }
  return SEMANTIC_SUBJECTS.length * verbObjectCombos * SEMANTIC_PLACES.length * SEMANTIC_TIMES.length * SEMANTIC_FINALS.length;
}

/** Chuyển index → tổ hợp (mixed-radix) — streaming không cần lưu corpus. */
function decomposeIndex(index: number, sizes: readonly number[]): number[] {
  const out: number[] = [];
  let remaining = Math.max(0, Math.floor(index));
  for (let i = sizes.length - 1; i >= 0; i--) {
    out.unshift(remaining % sizes[i]);
    remaining = Math.floor(remaining / sizes[i]);
  }
  return out;
}

/** Tìm (verb, object) hợp lệ theo sub-index — chỉ duyệt các cặp TƯƠNG THÍCH. */
function verbObjectPair(pairIndex: number): { verb: SemanticVerb; object: string } {
  const totalCombos: number[] = [];
  let cumulative = 0;
  for (const verb of SEMANTIC_VERBS) {
    let count = 0;
    for (const category of verb.compatibleCategories) count += SEMANTIC_OBJECTS[category]?.length ?? 0;
    totalCombos.push(count);
    cumulative += count;
  }
  const wrapped = pairIndex % cumulative;
  let running = wrapped;
  for (let v = 0; v < SEMANTIC_VERBS.length; v++) {
    if (running < totalCombos[v]) {
      const verb = SEMANTIC_VERBS[v];
      let local = running;
      for (const category of verb.compatibleCategories) {
        const objects = SEMANTIC_OBJECTS[category] ?? [];
        if (local < objects.length) return { verb, object: objects[local] };
        local -= objects.length;
      }
    }
    running -= totalCombos[v];
  }
  return { verb: SEMANTIC_VERBS[0], object: SEMANTIC_OBJECTS.ruong[0] };
}

/**
 * Sinh câu NGỮ NGHĨA tại index — mixed-radix decomposition đảm bảo mỗi index
 * một câu DUY NHẤT, verb–object luôn tương thích (không lẫn lộn ngữ nghĩa).
 */
export function semanticSentenceAt(index: number): GeneratedSentence {
  const verbObjectCombos = SEMANTIC_VERBS.reduce((sum, verb) => {
    let count = 0;
    for (const category of verb.compatibleCategories) count += SEMANTIC_OBJECTS[category]?.length ?? 0;
    return sum + count;
  }, 0);
  const sizes = [SEMANTIC_SUBJECTS.length, verbObjectCombos, SEMANTIC_PLACES.length, SEMANTIC_TIMES.length, SEMANTIC_FINALS.length];
  const [subjectIndex, pairIndex, placeIndex, timeIndex, finalIndex] = decomposeIndex(index, sizes);
  const { verb, object } = verbObjectPair(pairIndex);
  const subject = SEMANTIC_SUBJECTS[subjectIndex % SEMANTIC_SUBJECTS.length];
  const place = SEMANTIC_PLACES[placeIndex % SEMANTIC_PLACES.length];
  const time = SEMANTIC_TIMES[timeIndex % SEMANTIC_TIMES.length];
  const final = SEMANTIC_FINALS[finalIndex % SEMANTIC_FINALS.length];
  return {
    text: `Ở ${place} ${time}, ${subject} ${verb.text} ${object}${final}`,
    subject,
    verb: verb.text,
    object,
    place,
    time,
    semanticallyCoherent: true,
  };
}

/** Kiểm tra ngữ nghĩa: chỉ xét BỔ NGỮ SAU động từ (place/subject không bị oan). */
export function checkSemanticCoherence(sentence: string): { coherent: boolean; violations: string[] } {
  const tokens = tokenizeVietnamese(sentence);
  const violations: string[] = [];
  // Động từ CHÍNH = verb xuất hiện ở VỊ TRÍ SAU CÙNG trong câu (chủ ngữ có thể
  // chứa động từ như 'đứa trẻ chăn trâu' — không được nhầm).
  let verb: SemanticVerb | null = null;
  let verbPosition = -1;
  for (const candidate of SEMANTIC_VERBS) {
    const position = sentence.lastIndexOf(candidate.text);
    if (position > verbPosition) {
      verbPosition = position;
      verb = candidate;
    }
  }
  if (!verb || verbPosition < 0) return { coherent: true, violations: [] };
  // Bổ ngữ = phần câu SAU động từ chính.
  const afterVerb = verbPosition >= 0 ? sentence.slice(verbPosition + verb.text.length) : sentence;
  const objects: Array<{ text: string; category: string }> = [];
  for (const [category, list] of Object.entries(SEMANTIC_OBJECTS)) {
    for (const text of list) {
      if (afterVerb.includes(text)) objects.push({ text, category });
    }
  }
  if (objects.length === 0) return { coherent: true, violations: [] };
  const coherentObject = objects.find((o) => verb.compatibleCategories.includes(o.category));
  if (!coherentObject) {
    violations.push(`động từ "${verb.text}" không tương thích bổ ngữ "${objects.map((o) => o.text).join(', ')}"`);
    return { coherent: false, violations };
  }
  return { coherent: true, violations: [] };
}
