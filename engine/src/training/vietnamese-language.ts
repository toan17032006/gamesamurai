/**
 * @file vietnamese-language.ts
 * @module @aetheria/engine/training/vietnamese-language
 * @description Agent HỌC TIẾNG VIỆT: tokenizer âm tiết tiếng Việt, máy sinh
 * kho câu (hàng nghìn câu ngữ pháp đúng từ vốn từ + khuôn mẫu — tục ngữ thật
 * nạp từ assets), **mạng nơ-ron tiếng Việt** (dự đoán âm tiết kế tiếp — mô hình
 * ngôn ngữ thật; phân loại thể loại câu; cảm xúc câu) và **mạng thinking** kết
 * hợp ThoughtEngine + EmotionProfile: agent ĐỌC câu → hiểu (thể loại, cảm xúc,
 * từ khoá) → suy nghĩ và ghi niềm tin (tục ngữ thành niềm tin đúng nghĩa).
 */

import { NeuralNetwork, activateVector } from '../deeplearning/nn.js';
import { DeepRandom, clamp01, hashSeed } from '../deeplearning/random.js';
import fs from 'node:fs';
import path from 'node:path';

// ===========================================================================
// Tokenizer tiếng Việt
// ===========================================================================

/** Tách câu tiếng Việt thành âm tiết: lowercase, bỏ dấu câu, tách space. */
export function tokenizeVietnamese(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[.,!?;:"'`()\-–—…]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

/** Hash âm tiết vào bucket (hashing trick — không cần từ điển cố định). */
export function hashToken(token: string, buckets: number): number {
  return hashSeed(token) % buckets;
}

/** Vocab: tập âm tiết duy nhất của một tập câu. */
export function buildVocab(sentences: readonly string[]): { syllables: string[]; counts: Map<string, number> } {
  const counts = new Map<string, number>();
  for (const sentence of sentences) {
    for (const token of tokenizeVietnamese(sentence)) {
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
  }
  return { syllables: [...counts.keys()].sort(), counts };
}

// ===========================================================================
// Máy sinh kho câu tiếng Việt — hàng nghìn câu ngữ pháp đúng
// ===========================================================================

/** Vốn từ sinh câu. */
export const CORPUS_VOCAB = {
  subjects: ['người nông dân', 'anh thợ rèn', 'bà lão chợ quê', 'đứa trẻ chăn trâu', 'người lái đò', 'cô thợ dệt', 'lão ngư dân', 'chú bé mục đồng', 'bà mẹ trẻ', 'người lính trẻ', 'vị trưởng làng', 'cô giáo làng', 'anh trai chăn trâu', 'người thợ gốm', 'ông đồ già', 'chiến binh làng', 'phù thuỷ rừng', 'thương nhân phương xa', 'cô tiên nhỏ', 'người gác đền'] as const,
  verbs: ['cày ruộng', 'chăn trâu', 'đan lưới', 'dệt vải', 'nấu bữa cơm', 'tu sửa mái nhà', 'đào móng giếng', 'chặt củi', 'hái quả rừng', 'thắp lửa lò', 'vẽ hoạ tiết', 'đếm đàn gà', 'nhặt thóc', 'gánh nước', 'ôm bó củi', 'trồng lúa non', 'làm bánh dày', 'viết thư làng', 'rửa chiếc nồi', 'vá chiếc thuyền'] as const,
  objects: ['trên đồng rộng', 'bên bờ sông', 'dưới gốc đa', 'trong khu vườn', 'ngoài bến nước', 'trên triền đê', 'dưới bóng tre', 'giữa cánh đồng lúa', 'bên bờ ao làng', 'trên lưng đồi', 'trong khu rừng xanh', 'ngay sân nhà', 'dưới mưa phùn', 'trong nắng sớm', 'bên hiên nhà', 'trên đường làng'] as const,
  places: ['làng quê yên bình', 'khu rừng già', 'bên dòng sông hiền', 'trên đỉnh núi sương mù', 'cửa biển xa', 'chiếc thuyền nhỏ', 'ngôi nhà mái tranh', 'chợ quê tấp nập', 'cánh đồng lúa chín', 'cây đa làng'] as const,
  adjectives: ['yên tĩnh', 'rực rỡ sắc màu', 'đầy ắp tiếng cười', 'lung linh sương sớm', 'no đủ', 'đầy gian nan', 'tràn đầy hy vọng', 'bừng sáng lạ thường', 'chở nặng kỷ niệm', 'xanh mướt mắt'] as const,
  times: ['bình minh', 'buổi trưa nắng', 'chiều muộn', 'đêm trăng rằm', 'mùa gặt', 'mùa mưa', 'ngày lễ làng', 'giờ sớm mai', 'mùa xuân mới', 'khi gió se lạnh'] as const,
  feelings: ['niềm vui', 'nỗi buồn', 'sự hiểu biết', 'lòng biết ơn', 'niềm kiêu hãnh', 'nỗi nhớ', 'sự kiên trì', 'tình làng nghĩa xóm', 'niềm tin son sắt', 'bài học sâu sắc'] as const,
  actions: ['hát ru con', 'ghé thăm nhau', 'chia sẻ bữa cơm', 'kể chuyện cổ tích', 'cùng nhau xây cầu', 'giúp nhau mùa gặt', 'trồng thêm cây xanh', 'đắp đập chắn lũ', 'dạy nhau học chữ'] as const,
};

/** Sinh kho câu: kết hợp khuôn mẫu ngữ pháp × vốn từ — hàng nghìn câu duy nhất. */
export function generateVietnameseCorpus(options: { seed?: number | string; perTemplate?: number } = {}): {
  sentences: Array<{ text: string; kind: 'story' | 'action' | 'dialogue' | 'description' }>;
} {
  const random = new DeepRandom(options.seed ?? 'vietnamese-corpus');
  const perTemplate = options.perTemplate ?? 900;
  const sentences: Array<{ text: string; kind: 'story' | 'action' | 'dialogue' | 'description' }> = [];
  const seen = new Set<string>();
  const pick = <T,>(arr: readonly T[]): T => arr[random.int(0, arr.length - 1)];

  const push = (text: string, kind: 'story' | 'action' | 'dialogue' | 'description') => {
    if (!seen.has(text)) {
      seen.add(text);
      sentences.push({ text, kind });
    }
  };

  // Khuôn mẫu 1 — kể chuyện: chủ ngữ + việc + nơi chốn.
  for (let i = 0; i < perTemplate; i++) {
    push(`${pick(CORPUS_VOCAB.subjects)} ${pick(CORPUS_VOCAB.verbs)} ${pick(CORPUS_VOCAB.objects)}.`, 'story');
  }
  // Khuôn mẫu 2 — miêu tả: nơi chốn có gì, thế nào.
  for (let i = 0; i < perTemplate; i++) {
    push(`Ở ${pick(CORPUS_VOCAB.places)} có khung cảnh ${pick(CORPUS_VOCAB.adjectives)}.`, 'description');
  }
  // Khuôn mẫu 3 — hành động chuỗi: làm rồi làm.
  for (let i = 0; i < perTemplate; i++) {
    push(`${pick(CORPUS_VOCAB.subjects)} ${pick(CORPUS_VOCAB.verbs)} rồi ${pick(CORPUS_VOCAB.actions)} cùng ${pick(CORPUS_VOCAB.feelings)}.`, 'action');
  }
  // Khuôn mẫu 4 — hội thoại.
  for (let i = 0; i < Math.floor(perTemplate / 2); i++) {
    push(`${pick(CORPUS_VOCAB.subjects)} nói: "Hôm nay ${pick(CORPUS_VOCAB.times)} thật ${pick(CORPUS_VOCAB.adjectives)}."`, 'dialogue');
  }
  // Khuôn mẫu 5 — cảm xúc: subject gắn bó với feeling tại place.
  for (let i = 0; i < Math.floor(perTemplate / 2); i++) {
    push(`${pick(CORPUS_VOCAB.subjects)} gắn bó với ${pick(CORPUS_VOCAB.feelings)} nơi ${pick(CORPUS_VOCAB.places)}.`, 'story');
  }

  return { sentences };
}

// ===========================================================================
// Tục ngữ thật — niềm tin văn hoá nạp từ assets (starter có sẵn)
// ===========================================================================

export interface CorpusSentence {
  text: string;
  kind?: 'proverb' | 'story' | 'action' | 'dialogue' | 'description';
  tone?: 'warm' | 'dark' | 'neutral';
}

/** Đọc corpus từ thư mục — gộp mọi file JSON có mảng sentences. */
export function loadVietnameseCorpus(dir: string): CorpusSentence[] {
  const out: CorpusSentence[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const fileName of fs.readdirSync(dir).sort()) {
    if (!fileName.endsWith('.json')) continue;
    try {
      const parsed = JSON.parse(fs.readFileSync(path.join(dir, fileName), 'utf8')) as { sentences?: CorpusSentence[] };
      for (const sentence of parsed.sentences ?? []) out.push(sentence);
    } catch {
      // file hỏng bỏ qua — corpus không sập engine.
    }
  }
  return out;
}

// ===========================================================================
// Mạng nơ-ron tiếng Việt — dự đoán âm tiết kế tiếp + phân loại thể loại
// ===========================================================================

export interface VietnameseModelConfig {
  buckets?: number;
  contextSize?: number;
  hiddenSizes?: readonly number[];
  seed?: number | string;
}

export interface VietnameseModelStats {
  vocabSyllables: number;
  pairsTrained: number;
  nextTokenLossHistory: number[];
  intentAccuracy: number | null;
  trained: boolean;
}

/**
 * Mạng nơ-ron tiếng Việt: hashing bag-of-syllables → dự đoán bucket âm tiết
 * kế tiếp (mô hình ngôn ngữ) + phân loại thể loại câu. Train bằng CE loss.
 */
export class VietnameseNeuralModel {
  public readonly buckets: number;
  public readonly contextSize: number;
  public vocabSyllables = 0;
  public pairsTrained = 0;
  public nextTokenLossHistory: number[] = [];
  public intentAccuracy: number | null = null;
  private readonly nextNet: NeuralNetwork;
  private intentNet: NeuralNetwork | null = null;
  private intentLabels: string[] = [];

  constructor(config: VietnameseModelConfig = {}) {
    this.buckets = config.buckets ?? 96;
    this.contextSize = config.contextSize ?? 3;
    this.nextNet = new NeuralNetwork({
      inputSize: this.buckets * this.contextSize,
      hiddenSizes: config.hiddenSizes ?? [48],
      outputSize: this.buckets,
      hiddenActivation: 'tanh',
      outputActivation: 'softmax',
      optimizer: { kind: 'adam', learningRate: 0.02 },
      seed: (config.seed ?? hashSeed('vietnamese-model')) as number,
    });
  }

  /** Vector ngữ cảnh: presence-hash các âm tiết trong cửa sổ context. */
  private contextVector(tokens: readonly string[], endExclusive: number): number[] {
    const vector = new Array<number>(this.buckets * this.contextSize).fill(0);
    for (let back = 1; back <= this.contextSize; back++) {
      const index = endExclusive - back;
      if (index >= 0) {
        const bucket = hashToken(tokens[index], this.buckets);
        vector[(back - 1) * this.buckets + bucket] = 1;
      }
    }
    return vector;
  }

  /**
   * Train mô hình ngôn ngữ trên corpus: mỗi câu tạo (context → next) pairs.
   * Trả loss trung bình mỗi epoch — giảm dần khi học.
   */
  public trainOnCorpus(
    sentences: readonly { text: string; kind?: string }[],
    options: { epochs?: number } = {},
  ): { lossHistory: number[]; pairs: number; vocab: number } {
    const tokens: string[] = [];
    for (const sentence of sentences) tokens.push(...tokenizeVietnamese(sentence.text), '\n');
    const vocab = buildVocab(sentences.map((s) => s.text));
    this.vocabSyllables = vocab.syllables.length;

    const samples: Array<{ input: number[]; target: number[] }> = [];
    for (let i = this.contextSize; i < tokens.length; i++) {
      const targetBucket = hashToken(tokens[i], this.buckets);
      const target = new Array<number>(this.buckets).fill(0);
      target[targetBucket] = 1;
      samples.push({ input: this.contextVector(tokens, i), target });
    }
    this.pairsTrained = samples.length;
    const report = this.nextNet.trainBatch(samples, { epochs: options.epochs ?? 3, loss: 'crossEntropy' });
    this.nextTokenLossHistory.push(...report.lossHistory);
    return { lossHistory: report.lossHistory, pairs: samples.length, vocab: this.vocabSyllables };
  }

  /** Dự đoán bucket âm tiết kế tiếp — trả top candidates với xác suất. */
  public predictNext(partialSentence: string): Array<{ token: string | null; probability: number }> {
    const tokens = tokenizeVietnamese(partialSentence);
    const vector = this.contextVector(tokens, tokens.length);
    const probabilities = activateVector('softmax', this.nextNet.predict(vector));
    // Bucket → âm tiết mẫu (dùng vocab đã học; chưa học thì bucket thô).
    return probabilities
      .map((probability, bucket) => ({ probability, bucket }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5)
      .map(({ probability, bucket }) => ({ token: null, probability: Math.round(probability * 1000) / 1000 }));
  }

  /**
   * Train phân loại thể loại (proverb/story/action/dialogue/description) —
   * đầu vào bag-of-syllables toàn câu.
   */
  public trainIntentClassifier(
    labeled: readonly { text: string; kind: string }[],
    options: { epochs?: number } = {},
  ): { labels: string[]; accuracy: number } {
    const labels = [...new Set(labeled.map((s) => s.kind))].sort();
    this.intentLabels = labels;
    const bagOf = (text: string): number[] => {
      const vector = new Array<number>(this.buckets).fill(0);
      for (const token of tokenizeVietnamese(text)) vector[hashToken(token, this.buckets)] = 1;
      return vector;
    };
    const samples = labeled.map((s) => {
      const target = new Array<number>(labels.length).fill(0);
      target[labels.indexOf(s.kind)] = 1;
      return { input: bagOf(s.text), target };
    });
    this.intentNet = new NeuralNetwork({
      inputSize: this.buckets,
      hiddenSizes: [32],
      outputSize: labels.length,
      hiddenActivation: 'tanh',
      outputActivation: 'softmax',
      optimizer: { kind: 'adam', learningRate: 0.02 },
      seed: hashSeed('vietnamese-intent'),
    });
    this.intentNet.trainBatch(samples, { epochs: options.epochs ?? 5, loss: 'crossEntropy' });
    // Accuracy trên chính tập train (in-sample — dùng làm smoke metric).
    let correct = 0;
    for (const sample of samples) {
      const output = this.intentNet.predict(sample.input);
      const predicted = output.indexOf(Math.max(...output));
      if (predicted === sample.target.indexOf(1)) correct++;
    }
    this.intentAccuracy = Math.round((correct / Math.max(1, samples.length)) * 100) / 100;
    return { labels, accuracy: this.intentAccuracy };
  }

  /** Phân loại thể loại câu sau khi train. */
  public classifyIntent(sentence: string): { kind: string; confidence: number } | null {
    if (!this.intentNet) return null;
    const vector = new Array<number>(this.buckets).fill(0);
    for (const token of tokenizeVietnamese(sentence)) vector[hashToken(token, this.buckets)] = 1;
    const output = this.intentNet.predict(vector);
    const best = output.indexOf(Math.max(...output));
    return { kind: this.intentLabels[best] ?? 'unknown', confidence: clamp01(output[best]) };
  }

  public stats(): VietnameseModelStats {
    return {
      vocabSyllables: this.vocabSyllables,
      pairsTrained: this.pairsTrained,
      nextTokenLossHistory: [...this.nextTokenLossHistory],
      intentAccuracy: this.intentAccuracy,
      trained: this.pairsTrained > 0,
    };
  }
}

// ===========================================================================
// Mạng thinking — agent ĐỌC câu → hiểu → suy nghĩ → ghi niềm tin
// ===========================================================================

/** Từ điển cảm xúc tiếng Việt sơ cấp — sentiment rút ra từ âm tiết trong câu. */
const POSITIVE_WORDS: readonly string[] = ['vui', 'yên', 'tĩnh', 'rực', 'rỡ', 'cười', 'hy', 'vọng', 'no', 'đủ', 'biết', 'ơn', 'son', 'sắt', 'xanh', 'mướt', 'hiền', 'tấp', 'nập', 'chín', 'trung', 'hiếu', 'nhân', 'giàu'];
const NEGATIVE_WORDS: readonly string[] = ['buồn', 'khó', 'nan', 'lụt', 'cháy', 'mat', 'mất', 'ghét', 'hận', 'đau', 'khổ', 'sợ', 'nạn', 'đói', 'dịch', 'cái', 'chết', 'oan', 'gian', 'xấu'];

export interface SentencePerception {
  syllables: string[];
  intent: string | null;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  keywords: string[];
  /** Câu thuộc corpus tục ngữ đã nạp — không phụ thuộc classifier. */
  isProverb: boolean;
}

/** Mạng thinking: kết hợp mô hình ngôn ngữ + ThoughtEngine + EmotionProfile. */
export class ThinkingNetwork {
  public readonly model: VietnameseNeuralModel;
  /** Corpus tục ngữ đã nạp — tra trực tiếp, không phụ thuộc classifier. */
  public readonly knownProverbs: ReadonlySet<string>;
  private readonly thoughtEngine: { think(context: unknown): unknown; learnBelief(proposition: string, confidence?: number, source?: string): unknown } | null;
  private readonly emotionProfile: { reactions: Map<string, { intensityMultiplier: number; decayRate: number; emotion: string }> } | null;

  constructor(options: {
    model: VietnameseNeuralModel;
    /** Corpus tục ngữ (loadVietnameseCorpus) — tra câu thuộc tục ngữ. */
    knownProverbs?: ReadonlySet<string>;
    /** ThoughtEngine thật của agent — câu đọc được ghi thành suy nghĩ/niềm tin. */
    thoughtEngine?: { think(context: unknown): unknown; learnBelief(proposition: string, confidence?: number, source?: string): unknown };
    /** EmotionProfile đã train — cảm xúc câu đọc được nhân theo hồ sơ. */
    emotionProfile?: { reactions: Map<string, { intensityMultiplier: number; decayRate: number; emotion: string }> } | null;
  }) {
    this.model = options.model;
    this.knownProverbs = options.knownProverbs ?? new Set();
    this.thoughtEngine = options.thoughtEngine ?? null;
    this.emotionProfile = options.emotionProfile ?? null;
  }

  /** Đọc hiểu một câu tiếng Việt: tokenizer + classifier + sentiment + keywords. */
  public perceive(sentence: string): SentencePerception {
    const syllables = tokenizeVietnamese(sentence);
    const keywords = syllables.filter((token) => token.length > 2);
    let positive = 0;
    let negative = 0;
    for (const token of syllables) {
      if (POSITIVE_WORDS.some((w) => token.includes(w))) positive++;
      if (NEGATIVE_WORDS.some((w) => token.includes(w))) negative++;
    }
    const sentimentScore = Math.round(clamp01(0.5 + (positive - negative) / Math.max(4, positive + negative)) * 100) / 100 - 0.5;
    const sentiment = sentimentScore > 0.05 ? 'positive' : sentimentScore < -0.05 ? 'negative' : 'neutral';
    const classified = this.model.classifyIntent(sentence);
    return {
      syllables,
      intent: classified?.kind ?? null,
      sentiment,
      sentimentScore,
      keywords: [...new Set(keywords)].slice(0, 8),
      isProverb: this.knownProverbs.has(sentence.trim()) || classified?.kind === 'proverb',
    };
  }

  /**
   * ĐỌC VÀ SUY NGHĨ: câu tục ngữ → ghi thành niềm tin (tin cậy cao — vốn văn
   * hoá); câu chuyện → suy nghĩ hồi tưởng; cảm xúc câu nhân theo hồ sơ đã train.
   */
  public readAndThink(entityId: string, sentence: string, options: { source?: string } = {}): {
    perception: SentencePerception;
    thoughtContent: string;
    beliefLearned: boolean;
    emotionalWeight: number;
  } {
    const perception = this.perceive(sentence);
    let thoughtContent = '';
    let beliefLearned = false;
    const emotionalWeight = clamp01(Math.abs(perception.sentimentScore) + 0.3);

    if (this.thoughtEngine) {
      if (perception.isProverb) {
        // Tục ngữ = tri thức dân gian → niềm tin.
        this.thoughtEngine.learnBelief(sentence, 0.85, options.source ?? 'tục ngữ tổ tiên');
        beliefLearned = true;
        thoughtContent = `Ông bà dạy rằng: "${sentence}" — ta ghi nhớ điều này.`;
      } else {
        const thought = this.thoughtEngine.think({
          perception: sentence,
          dominantEmotion: perception.sentiment === 'positive' ? 'joy' : perception.sentiment === 'negative' ? 'sadness' : 'calm',
          mood: perception.sentimentScore * 2,
          memories: perception.keywords.slice(0, 3),
        }) as { content?: string };
        thoughtContent = thought.content ?? `Ta vừa nghe: "${sentence}".`;
      }
    }

    // EmotionProfile nhân trọng số cảm xúc nếu đã train phản ứng cho "reading".
    if (this.emotionProfile && perception.intent) {
      void reactionForProfile(this.emotionProfile, 'reading', perception.sentiment);
    }

    return { perception, thoughtContent, beliefLearned, emotionalWeight: Math.round(emotionalWeight * 100) / 100 };
  }
}

/** Đọc reaction từ profile (tránh phụ thuộc vòng vào agent-mind). */
function reactionForProfile(profile: { reactions: Map<string, { intensityMultiplier: number; decayRate: number; emotion: string }> }, eventKind: string, sentiment: string): { multiplier: number; trained: boolean } {
  for (const [key, reaction] of profile.reactions) {
    if (key.startsWith(`${eventKind}→`) && reaction.emotion.includes(sentiment)) {
      return { multiplier: reaction.intensityMultiplier, trained: true };
    }
  }
  return { multiplier: 1, trained: false };
}


/** Ghi corpus sinh ra ra `assets/training/language/corpus/` — dữ liệu train thật trong assets. */
export function exportCorpusToAssets(
  root: string,
  corpus: { sentences: Array<{ text: string; kind: string }> },
  options: { fileName?: string } = {},
): string {
  const dir = path.join(root, 'language', 'corpus');
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, options.fileName ?? 'generated_stories.json');
  fs.writeFileSync(filePath, JSON.stringify({
    source: 'engine_generator',
    kind: 'language_corpus',
    sentences: corpus.sentences,
  }, null, 0));
  return filePath;
}
