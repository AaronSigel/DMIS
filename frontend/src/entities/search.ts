/** Mirrors backend SearchDtos (JSON field names). */

export type SearchHitView = {
  documentId: string;
  documentTitle: string;
  chunkId: string;
  chunkText: string;
  score: number;
};

export type SearchOnlyResponse = {
  query: string;
  status: string;
  hits: SearchHitView[];
  pipeline: unknown;
};

export type RagSourceView = {
  documentId: string;
  documentTitle: string;
  chunkId: string;
  chunkText: string;
  score: number;
};

export type AnswerWithSourcesResponse = {
  query: string;
  status: string;
  answer: string;
  sources: RagSourceView[];
  pipeline: unknown;
};

export type RagRequest = {
  question: string;
  threadId?: string;
  documentIds?: string[];
  knowledgeSourceIds?: string[];
  ideologyProfileId?: string;
};

/**
 * Цитата источника в ответе ассистента: соответствует backend `RagSourceView`,
 * дополненная порядковым номером (1-based), который LLM использует в тексте ответа: [1], [2], ...
 */
export type Citation = {
  index: number;
  documentId: string;
  documentTitle: string;
  chunkId: string;
  chunkText: string;
  score: number;
};
