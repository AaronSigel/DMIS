import { z } from "zod";

/** Ответ GET/PATCH/POST для одного документа (соответствует backend DocumentView). */
export const DocumentViewSchema = z.object({
  id: z.string(),
  title: z.string(),
  ownerId: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  source: z.string(),
  category: z.string(),
  status: z.string(),
  type: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  totalSizeBytes: z.number(),
  fileName: z.string(),
  contentType: z.string(),
  storageRef: z.string(),
  indexedChunkCount: z.number(),
  indexedAt: z.string().nullable(),
  extractedTextPreview: z.string(),
  extractedTextLength: z.number(),
  extractedTextTruncated: z.boolean(),
});

/** Страница списка документов (соответствует backend PageResponse<DocumentView>). */
export const DocumentPageSchema = z.object({
  content: z.array(DocumentViewSchema),
  totalElements: z.number(),
  totalPages: z.number(),
  page: z.number(),
  size: z.number(),
});

/** Минимум полей для заголовка документа (полный GET возвращает DocumentView). */
export const DocumentMetaSchema = z.object({
  id: z.string(),
  title: z.string(),
});

export type DocumentViewParsed = z.infer<typeof DocumentViewSchema>;
export type DocumentPageParsed = z.infer<typeof DocumentPageSchema>;
