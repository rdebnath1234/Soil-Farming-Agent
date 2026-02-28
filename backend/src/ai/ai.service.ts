import { Inject, Injectable } from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import OpenAI from 'openai';
import { FIRESTORE } from '../firebase/firebase.constants';
import {
  CreateKnowledgeDocsDto,
  KnowledgeDocItemDto,
} from './dto/create-knowledge-doc.dto';
import { AskAiDto } from './dto/ask-ai.dto';
import { KnowledgeDoc } from './types/knowledge-doc.type';

@Injectable()
export class AiService {
  private readonly openai?: OpenAI;
  private readonly embeddingModel =
    process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
  private readonly chatModel = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini';

  constructor(@Inject(FIRESTORE) private readonly firestore: Firestore) {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
  }

  async ingestKnowledge(docsDto: CreateKnowledgeDocsDto, actorEmail: string) {
    const results: KnowledgeDoc[] = [];

    for (const item of docsDto.documents) {
      const saved = await this.upsertDocument(item, actorEmail);
      results.push(saved);
    }

    return {
      count: results.length,
      documents: results,
      embeddingEnabled: Boolean(this.openai),
    };
  }

  async listKnowledge(limit = 100) {
    const snapshot = await this.firestore
      .collection('knowledgeDocs')
      .orderBy('updatedAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => doc.data() as KnowledgeDoc);
  }

  async askQuestion(askDto: AskAiDto) {
    const topK = askDto.topK || 4;
    const targetLanguage = askDto.answerLanguage || 'bn';

    const documents = await this.fetchCandidates(200);
    const ranked = await this.rankDocuments(askDto.question, documents, topK);

    if (ranked.length === 0) {
      return {
        answer:
          targetLanguage === 'bn'
            ? 'এই প্রশ্নের জন্য এখনও পর্যাপ্ত জ্ঞানভান্ডার পাওয়া যায়নি। আগে Bengali knowledge docs যোগ করুন।'
            : 'No relevant knowledge found yet. Please ingest Bengali knowledge docs first.',
        references: [],
      };
    }

    const answer = this.openai
      ? await this.generateWithLlm(askDto.question, targetLanguage, ranked)
      : this.generateFallbackAnswer(askDto.question, targetLanguage, ranked);

    return {
      answer,
      references: ranked.map((d) => ({
        id: d._id,
        title: d.title,
        source: d.source || '',
      })),
    };
  }

  private async upsertDocument(item: KnowledgeDocItemDto, actorEmail: string) {
    const now = new Date().toISOString();
    const docRef = item.id
      ? this.firestore.collection('knowledgeDocs').doc(item.id)
      : this.firestore.collection('knowledgeDocs').doc();

    const embedding = this.openai
      ? await this.createEmbedding(`${item.title}\n${item.content}`)
      : undefined;

    const existing = await docRef.get();

    const doc: KnowledgeDoc = {
      _id: docRef.id,
      title: item.title.trim(),
      content: item.content.trim(),
      source: item.source?.trim() || `uploaded-by:${actorEmail}`,
      language: item.language || 'bn',
      tags: item.tags || [],
      ...(embedding ? { embedding } : {}),
      createdAt: existing.exists ? (existing.data()?.createdAt as string) : now,
      updatedAt: now,
    };

    await docRef.set(doc, { merge: true });
    return doc;
  }

  private async fetchCandidates(limit: number): Promise<KnowledgeDoc[]> {
    const snapshot = await this.firestore
      .collection('knowledgeDocs')
      .orderBy('updatedAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => doc.data() as KnowledgeDoc);
  }

  private async rankDocuments(
    question: string,
    docs: KnowledgeDoc[],
    topK: number,
  ): Promise<KnowledgeDoc[]> {
    if (!docs.length) {
      return [];
    }

    if (this.openai) {
      const questionEmbedding = await this.createEmbedding(question);

      const scored = docs
        .filter((doc) => doc.embedding && doc.embedding.length)
        .map((doc) => ({
          doc,
          score: this.cosineSimilarity(questionEmbedding, doc.embedding!),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .map((x) => x.doc);

      if (scored.length) {
        return scored;
      }
    }

    const tokens = question
      .toLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .filter(Boolean);

    return docs
      .map((doc) => {
        const hay =
          `${doc.title} ${doc.content} ${(doc.tags || []).join(' ')}`.toLowerCase();
        const score = tokens.reduce(
          (acc, token) => acc + (hay.includes(token) ? 1 : 0),
          0,
        );

        return { doc, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map((x) => x.doc);
  }

  private async createEmbedding(text: string): Promise<number[]> {
    if (!this.openai) {
      return [];
    }

    const response = await this.openai.embeddings.create({
      model: this.embeddingModel,
      input: text,
    });

    return response.data[0].embedding;
  }

  private cosineSimilarity(a: number[], b: number[]) {
    const n = Math.min(a.length, b.length);
    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < n; i += 1) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (!normA || !normB) {
      return 0;
    }

    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private async generateWithLlm(
    question: string,
    language: 'bn' | 'en',
    docs: KnowledgeDoc[],
  ) {
    const context = docs
      .map(
        (doc, idx) =>
          `[${idx + 1}] ${doc.title}\nSource: ${doc.source || 'N/A'}\n${doc.content}`,
      )
      .join('\n\n');

    const response = await this.openai!.chat.completions.create({
      model: this.chatModel,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content:
            language === 'bn'
              ? 'তুমি একটি Bengali agriculture assistant। শুধুমাত্র দেওয়া context অনুযায়ী উত্তর দাও। context-এ না থাকলে স্পষ্টভাবে জানাও।'
              : 'You are an agriculture assistant. Answer only from the provided context and explicitly mention when context is insufficient.',
        },
        {
          role: 'user',
          content:
            (language === 'bn' ? 'প্রশ্ন: ' : 'Question: ') +
            question +
            '\n\nContext:\n' +
            context,
        },
      ],
    });

    return response.choices[0]?.message?.content?.trim() || '';
  }

  private generateFallbackAnswer(
    question: string,
    language: 'bn' | 'en',
    docs: KnowledgeDoc[],
  ) {
    const intro =
      language === 'bn'
        ? `আপনার প্রশ্ন "${question}" অনুযায়ী জ্ঞানভান্ডার থেকে প্রাসঙ্গিক তথ্য:`
        : `Relevant knowledge found for your question "${question}":`;

    const points = docs
      .map((doc, idx) => {
        const snippet = doc.content.slice(0, 220).trim();
        return language === 'bn'
          ? `${idx + 1}. ${doc.title}: ${snippet}`
          : `${idx + 1}. ${doc.title}: ${snippet}`;
      })
      .join('\n');

    const outro =
      language === 'bn'
        ? '\n\nনোট: আরও natural উত্তর পেতে OPENAI_API_KEY সেট করুন।'
        : '\n\nNote: set OPENAI_API_KEY for higher-quality generated responses.';

    return `${intro}\n${points}${outro}`;
  }
}
