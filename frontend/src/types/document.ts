export type DocumentVersion = {
  versionId: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  storageRef: string;
  createdAt: string;
  indexStatus?: string;
  indexedChunkCount?: number;
  indexedAt?: string | null;
  latest?: boolean;
};

export type DocumentView = {
  id: string;
  title: string;
  ownerId: string;
  description: string;
  tags: string[];
  source: string;
  category: string;
  status: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  versionCount: number;
  totalSizeBytes: number;
  lastVersionAt: string;
  versions: DocumentVersion[];
  storageRef: string;
  extractedTextPreview: string;
  extractedTextLength: number;
  extractedTextTruncated: boolean;
};

export type DocumentPage = {
  content: DocumentView[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
};

export type UserSummary = {
  id: string;
  email: string;
  fullName: string;
};
