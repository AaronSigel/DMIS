import { z } from "zod";

/** Часть входящего письма (вложение). */
export const MailAttachmentPartSchema = z.object({
  partId: z.string(),
  fileName: z.string(),
  contentType: z.string(),
  sizeBytes: z.number(),
});

/** Краткое представление письма в списке (соответствует backend `MailMessageSummaryView`). */
export const MailMessageSummarySchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  subject: z.string(),
  preview: z.string(),
  sentAtIso: z.string(),
  hasAttachments: z.boolean().optional().default(false),
  draft: z.boolean().optional().default(false),
});

/** Полное представление письма для экрана детализации (соответствует backend `MailMessageDetailView`). */
export const MailMessageDetailSchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  subject: z.string(),
  body: z.string(),
  sentAtIso: z.string(),
  attachments: z.array(MailAttachmentPartSchema).optional().default([]),
});

/** Список писем (`GET /mail/messages`). */
export const MailMessageListSchema = z.array(MailMessageSummarySchema);

/** Результат поиска писем (`POST /mail/messages/search`). */
export const MailMessageSearchSchema = z.object({
  query: z.string(),
  messages: z.array(MailMessageSummarySchema),
});

/** Статус подключения IMAP (backend `MailAccountView`). */
export const MailAccountSchema = z.object({
  connected: z.boolean(),
  imapHost: z.string(),
  imapPort: z.number(),
  imapUsername: z.string(),
});

export const MailDraftSchema = z.object({
  id: z.string(),
  to: z.string(),
  subject: z.string(),
  body: z.string(),
  createdBy: z.string(),
});

export const MailThreadSummarySchema = z.object({
  summary: z.string(),
  provider: z.string(),
  model: z.string(),
});

export type MailAttachmentPartParsed = z.infer<typeof MailAttachmentPartSchema>;
export type MailMessageSummaryParsed = z.infer<typeof MailMessageSummarySchema>;
export type MailMessageDetailParsed = z.infer<typeof MailMessageDetailSchema>;
export type MailMessageSearchParsed = z.infer<typeof MailMessageSearchSchema>;
export type MailAccountParsed = z.infer<typeof MailAccountSchema>;
export type MailDraftParsed = z.infer<typeof MailDraftSchema>;
export type MailThreadSummaryParsed = z.infer<typeof MailThreadSummarySchema>;
