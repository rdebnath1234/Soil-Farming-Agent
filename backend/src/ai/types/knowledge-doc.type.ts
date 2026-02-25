export interface KnowledgeDoc {
  _id: string;
  title: string;
  content: string;
  source?: string;
  language: 'bn' | 'en';
  tags?: string[];
  embedding?: number[];
  createdAt: string;
  updatedAt: string;
}
