import { z } from "zod";

/** Поля треда, используемые UI (остальные поля backend отбрасываются). */
export const AssistantThreadViewSchema = z.object({
  id: z.string(),
  title: z.string(),
  ideologyProfileId: z.string(),
  knowledgeSourceIds: z.array(z.string()),
});

export const AssistantThreadMessageViewSchema = z.object({
  id: z.string(),
  role: z.string(),
  content: z.string(),
  documentIds: z.array(z.string()),
});

export const AssistantThreadDetailViewSchema = z.object({
  thread: AssistantThreadViewSchema,
  messages: z.array(AssistantThreadMessageViewSchema),
  linkedDocumentIds: z.array(z.string()),
});

/** Упоминание документа в поиске (backend может добавлять поля — игнорируем). */
export const MentionDocumentSchema = z.object({
  id: z.string(),
  title: z.string(),
});

export const MentionDocumentListSchema = z.array(MentionDocumentSchema);
