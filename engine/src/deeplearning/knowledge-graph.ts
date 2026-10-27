/**
 * @file knowledge-graph.ts
 * @module @aetheria/engine/deeplearning/knowledge-graph
 * @description Đồ thị tri thức có suy luận bắc cầu và embedding TransE huấn
 * luyện bằng SGD âm bản. Dùng cho bộ não tự học: quan sát sự kiện → thêm bộ ba
 * → suy ra quan hệ mới → dự đoán liên kết còn thiếu.
 */

import { DeepRandom } from './random.js';
import { cosineSimilarity } from './tensor.js';

/** Một bộ ba tri thức. */
export interface KnowledgeTriple {
  subject: string;
  relation: string;
  object: string;
  confidence: number;
  source: string;
  timestamp: number;
}

/** Bộ lọc truy vấn. */
export interface TripleQuery {
  subject?: string;
  relation?: string;
  object?: string;
  minConfidence?: number;
}

/** Ảnh chụp đồ thị. */
export interface KnowledgeGraphSnapshot {
  triples: KnowledgeTriple[];
}

/** Đồ thị tri thức có chỉ mục theo chủ thể, quan hệ và khách thể. */
export class KnowledgeGraph {
  public readonly entities = new Set<string>();
  public readonly relations = new Set<string>();
  private readonly triples: KnowledgeTriple[] = [];
  private readonly bySubject = new Map<string, KnowledgeTriple[]>();

  /** Thêm thực thể. */
  public addEntity(entity: string): this {
    if (entity.trim().length > 0) this.entities.add(entity);
    return this;
  }

  /** Thêm quan hệ. */
  public addRelation(relation: string): this {
    if (relation.trim().length > 0) this.relations.add(relation);
    return this;
  }

  /** Thêm một bộ ba; trùng lặp sẽ tăng độ tin cậy thay vì nhân bản. */
  public addTriple(
    subject: string,
    relation: string,
    object: string,
    confidence = 1,
    source = 'observation',
  ): KnowledgeTriple {
    this.addEntity(subject).addEntity(object).addRelation(relation);
    const existing = this.triples.find(
      (triple) => triple.subject === subject && triple.relation === relation && triple.object === object,
    );
    const value = Math.max(0, Math.min(1, confidence));
    if (existing) {
      existing.confidence = Math.max(existing.confidence, value);
      existing.timestamp = Date.now();
      return existing;
    }
    const triple: KnowledgeTriple = {
      subject,
      relation,
      object,
      confidence: value,
      source,
      timestamp: Date.now(),
    };
    this.triples.push(triple);
    const list = this.bySubject.get(subject) ?? [];
    list.push(triple);
    this.bySubject.set(subject, list);
    return triple;
  }

  /** Truy vấn bộ ba theo bộ lọc. */
  public query(query: TripleQuery = {}): KnowledgeTriple[] {
    const min = query.minConfidence ?? 0;
    return this.triples.filter(
      (triple) =>
        (query.subject === undefined || triple.subject === query.subject) &&
        (query.relation === undefined || triple.relation === query.relation) &&
        (query.object === undefined || triple.object === query.object) &&
        triple.confidence >= min,
    );
  }

  /** Mọi bộ ba. */
  public all(): KnowledgeTriple[] {
    return [...this.triples];
  }

  /** Số bộ ba. */
  public get size(): number {
    return this.triples.length;
  }

  /** Hàng xóm của một thực thể. */
  public neighbors(entity: string, relation?: string): KnowledgeTriple[] {
    return this.query({ subject: entity, relation });
  }

  /** Suy luận bắc cầu: A r B, B r C ⇒ A r C (giảm độ tin cậy theo bước). */
  public inferTransitive(
    relation: string,
    maxDepth = 2,
    confidenceDecay = 0.85,
  ): KnowledgeTriple[] {
    const inferred: KnowledgeTriple[] = [];
    const seen = new Set<string>();
    let frontier = this.query({ relation }).map((triple) => ({
      subject: triple.subject,
      object: triple.object,
      confidence: triple.confidence,
      depth: 1,
    }));

    while (frontier.length > 0) {
      const next: typeof frontier = [];
      for (const edge of frontier) {
        const outgoing = this.query({ subject: edge.object, relation });
        for (const link of outgoing) {
          const key = `${edge.subject}|${relation}|${link.object}`;
          if (seen.has(key) || edge.subject === link.object) continue;
          seen.add(key);
          const confidence = edge.confidence * link.confidence * confidenceDecay ** (edge.depth - 1);
          if (confidence < 0.05) continue;
          const triple = this.addTriple(edge.subject, relation, link.object, confidence, 'transitive');
          inferred.push(triple);
          if (edge.depth < maxDepth) {
            next.push({ subject: edge.subject, object: link.object, confidence, depth: edge.depth + 1 });
          }
        }
      }
      frontier = next;
    }
    return inferred;
  }

  /** Đường đi ngắn nhất giữa hai thực thể (BFS, không phân biệt quan hệ). */
  public findPath(from: string, to: string, maxDepth = 6): KnowledgeTriple[] {
    if (from === to) return [];
    const queue: Array<{ entity: string; path: KnowledgeTriple[] }> = [{ entity: from, path: [] }];
    const visited = new Set<string>([from]);

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) break;
      if (current.path.length >= maxDepth) continue;
      for (const triple of this.bySubject.get(current.entity) ?? []) {
        if (triple.object === to) return [...current.path, triple];
        if (!visited.has(triple.object)) {
          visited.add(triple.object);
          queue.push({ entity: triple.object, path: [...current.path, triple] });
        }
      }
    }
    return [];
  }

  /** Xoá bộ ba có độ tin cậy thấp (quên lãng). */
  public prune(minConfidence = 0.1): number {
    const kept = this.triples.filter((triple) => triple.confidence >= minConfidence);
    const removed = this.triples.length - kept.length;
    this.triples.length = 0;
    this.bySubject.clear();
    const copy = [...kept];
    for (const triple of copy) {
      this.triples.push(triple);
      const list = this.bySubject.get(triple.subject) ?? [];
      list.push(triple);
      this.bySubject.set(triple.subject, list);
    }
    return removed;
  }

  /** Ảnh chụp. */
  public snapshot(): KnowledgeGraphSnapshot {
    return { triples: this.triples.map((triple) => ({ ...triple })) };
  }

  /** Khôi phục. */
  public static fromSnapshot(snapshot: KnowledgeGraphSnapshot): KnowledgeGraph {
    const graph = new KnowledgeGraph();
    for (const triple of snapshot.triples) {
      graph.addTriple(triple.subject, triple.relation, triple.object, triple.confidence, triple.source);
    }
    return graph;
  }
}

/** Ảnh chụp embedding. */
export interface KnowledgeEmbeddingSnapshot {
  dimension: number;
  entities: Array<[string, number[]]>;
  relations: Array<[string, number[]]>;
}

/**
 * TransE: mỗi quan hệ là một phép dịch trong không gian vector.
 * Score cao = bộ ba hợp lý. Huấn luyện bằng margin ranking loss với âm bản.
 */
export class KnowledgeEmbedding {
  public readonly dimension: number;
  public readonly entityVectors = new Map<string, number[]>();
  public readonly relationVectors = new Map<string, number[]>();
  private readonly random: DeepRandom;

  constructor(dimension = 16, seed: number | string = 1) {
    if (dimension <= 0) throw new RangeError('Chiều embedding phải dương');
    this.dimension = Math.floor(dimension);
    this.random = new DeepRandom(seed);
  }

  private vector(seed: string): number[] {
    return Array.from({ length: this.dimension }, () => this.random.gaussian(0, 0.1));
  }

  /** Đảm bảo thực thể có vector. */
  public ensureEntity(entity: string): number[] {
    let vector = this.entityVectors.get(entity);
    if (!vector) {
      vector = this.vector(`entity:${entity}`);
      this.entityVectors.set(entity, vector);
    }
    return vector;
  }

  /** Đảm bảo quan hệ có vector. */
  public ensureRelation(relation: string): number[] {
    let vector = this.relationVectors.get(relation);
    if (!vector) {
      vector = this.vector(`relation:${relation}`);
      this.relationVectors.set(relation, vector);
    }
    return vector;
  }

  /** Khoảng cách L2 giữa `subject + relation` và `object`. */
  public distance(subject: string, relation: string, object: string): number {
    const head = this.ensureEntity(subject);
    const rel = this.ensureRelation(relation);
    const tail = this.ensureEntity(object);
    let sum = 0;
    for (let i = 0; i < this.dimension; i++) {
      const diff = head[i] + rel[i] - tail[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  }

  /** Điểm hợp lý trong `[0, 1]` (1 = rất hợp lý). */
  public score(subject: string, relation: string, object: string): number {
    return 1 / (1 + this.distance(subject, relation, object));
  }

  /** Huấn luyện TransE trên đồ thị. */
  public train(
    graph: KnowledgeGraph,
    options: { epochs?: number; learningRate?: number; margin?: number; negativeSamples?: number } = {},
  ): { epochs: number; initialLoss: number; finalLoss: number } {
    const triples = graph.all();
    if (triples.length === 0) return { epochs: 0, initialLoss: 0, finalLoss: 0 };
    const epochs = Math.max(1, Math.floor(options.epochs ?? 50));
    const learningRate = options.learningRate ?? 0.01;
    const margin = options.margin ?? 1;
    const negatives = Math.max(1, Math.floor(options.negativeSamples ?? 1));

    for (const triple of triples) {
      this.ensureEntity(triple.subject);
      this.ensureEntity(triple.object);
      this.ensureRelation(triple.relation);
    }

    let initialLoss = 0;
    let finalLoss = 0;
    for (let epoch = 0; epoch < epochs; epoch++) {
      let epochLoss = 0;
      for (const triple of triples) {
        const head = this.ensureEntity(triple.subject);
        const rel = this.ensureRelation(triple.relation);
        const tail = this.ensureEntity(triple.object);
        const positive = this.distance(triple.subject, triple.relation, triple.object);

        for (let n = 0; n < negatives; n++) {
          const corruptSubject = this.random.chance(0.5);
          const entities = [...graph.entities];
          const replacement = entities[this.random.int(0, Math.max(0, entities.length - 1))] ?? triple.object;
          const negativeSubject = corruptSubject ? replacement : triple.subject;
          const negativeObject = corruptSubject ? triple.object : replacement;
          if (negativeSubject === triple.subject && negativeObject === triple.object) continue;

          const negativeHead = this.ensureEntity(negativeSubject);
          const negativeTail = this.ensureEntity(negativeObject);
          let negativeDistance = 0;
          for (let i = 0; i < this.dimension; i++) {
            const diff = negativeHead[i] + rel[i] - negativeTail[i];
            negativeDistance += diff * diff;
          }
          negativeDistance = Math.sqrt(negativeDistance);

          const loss = Math.max(0, margin + positive - negativeDistance);
          epochLoss += loss;
          if (loss <= 0) continue;

          // Gradient của margin loss theo h + r - t.
          for (let i = 0; i < this.dimension; i++) {
            const posDiff = head[i] + rel[i] - tail[i];
            const negDiff = negativeHead[i] + rel[i] - negativeTail[i];
            const posGrad = posDiff / Math.max(positive, 1e-9);
            const negGrad = negDiff / Math.max(negativeDistance, 1e-9);
            head[i] -= learningRate * posGrad;
            rel[i] -= learningRate * (posGrad - negGrad);
            tail[i] += learningRate * posGrad;
            negativeHead[i] += learningRate * negGrad;
            negativeTail[i] -= learningRate * negGrad;
          }

          // Chuẩn hoá để tránh bùng nổ số.
          this.normalize(head);
          this.normalize(rel);
          this.normalize(tail);
        }
      }
      const average = epochLoss / (triples.length * negatives);
      if (epoch === 0) initialLoss = average;
      finalLoss = average;
    }
    return { epochs, initialLoss, finalLoss };
  }

  /** Dự đoán các object hợp lý nhất cho `subject + relation`. */
  public predictObjects(subject: string, relation: string, limit = 5): Array<{ entity: string; score: number }> {
    const result: Array<{ entity: string; score: number }> = [];
    for (const entity of this.entityVectors.keys()) {
      result.push({ entity, score: this.score(subject, relation, entity) });
    }
    return result.sort((a, b) => b.score - a.score).slice(0, Math.max(0, limit));
  }

  /** Các thực thể tương đồng nhất. */
  public similarEntities(entity: string, limit = 5): Array<{ entity: string; similarity: number }> {
    const source = this.ensureEntity(entity);
    const result: Array<{ entity: string; similarity: number }> = [];
    for (const [other, vector] of this.entityVectors) {
      if (other === entity) continue;
      result.push({ entity: other, similarity: cosineSimilarity(source, vector) });
    }
    return result.sort((a, b) => b.similarity - a.similarity).slice(0, Math.max(0, limit));
  }

  /** Ảnh chụp embedding. */
  public snapshot(): KnowledgeEmbeddingSnapshot {
    return {
      dimension: this.dimension,
      entities: [...this.entityVectors].map(([key, value]) => [key, [...value]]),
      relations: [...this.relationVectors].map(([key, value]) => [key, [...value]]),
    };
  }

  /** Khôi phục embedding. */
  public static fromSnapshot(snapshot: KnowledgeEmbeddingSnapshot, seed: number | string = 1): KnowledgeEmbedding {
    const embedding = new KnowledgeEmbedding(snapshot.dimension, seed);
    for (const [key, value] of snapshot.entities) embedding.entityVectors.set(key, [...value]);
    for (const [key, value] of snapshot.relations) embedding.relationVectors.set(key, [...value]);
    return embedding;
  }

  private normalize(vector: number[]): void {
    let norm = 0;
    for (const value of vector) norm += value * value;
    norm = Math.sqrt(norm);
    if (norm <= 1e-9) return;
    for (let i = 0; i < vector.length; i++) vector[i] /= norm;
  }
}

/**
 * Bộ học tri thức: kết hợp đồ thị + embedding, có suy luận, độ tin cậy và
 * quên lãng. Đây là lớp "knowledge" mà bộ não dùng để tự học khái niệm mới.
 */
export class KnowledgeLearner {
  public readonly graph = new KnowledgeGraph();
  public readonly embedding: KnowledgeEmbedding;
  public readonly curiosity: number;

  constructor(dimension = 16, seed: number | string = 1, curiosity = 0.5) {
    this.embedding = new KnowledgeEmbedding(dimension, seed);
    this.curiosity = Math.max(0, Math.min(1, curiosity));
  }

  /** Học một sự kiện; trả về độ mới (0..1) để tính phần thưởng tò mò. */
  public observe(
    subject: string,
    relation: string,
    object: string,
    confidence = 0.8,
    source = 'perception',
  ): { triple: KnowledgeTriple; novelty: number } {
    const existed = this.graph.query({ subject, relation, object }).length > 0;
    const triple = this.graph.addTriple(subject, relation, object, confidence, source);
    const novelty = existed ? 0 : Math.max(0.1, this.curiosity);
    return { triple, novelty };
  }

  /** Hỏi đồ thị; nếu không có trực tiếp thì suy luận bắc cầu. */
  public ask(subject: string, relation: string, object?: string): KnowledgeTriple[] {
    const direct = this.graph.query({ subject, relation, object });
    if (direct.length > 0 || object !== undefined) return direct;
    const inferred = this.graph.inferTransitive(relation, 2);
    return inferred.filter((triple) => triple.subject === subject);
  }

  /** Dự đoán khách thể còn thiếu bằng embedding. */
  public predict(subject: string, relation: string, limit = 3): Array<{ entity: string; score: number }> {
    return this.embedding.predictObjects(subject, relation, limit);
  }

  /** Huấn luyện embedding trên tri thức hiện có. */
  public consolidate(epochs = 20): { epochs: number; initialLoss: number; finalLoss: number } {
    return this.embedding.train(this.graph, { epochs });
  }

  /** Quên tri thức ít tin cậy. */
  public forget(minConfidence = 0.15): number {
    return this.graph.prune(minConfidence);
  }
}
