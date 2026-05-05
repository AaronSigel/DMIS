/** Mirrors backend SearchDtos (JSON field names). */

export type SearchHitView = {
  documentId: string;
  documentTitle: string;
  documentVersion: string;
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
  documentVersion: string;
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
