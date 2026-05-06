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
  totalSizeBytes: number;
  fileName: string;
  contentType: string;
  storageRef: string;
  indexedChunkCount: number;
  indexedAt: string | null;
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
