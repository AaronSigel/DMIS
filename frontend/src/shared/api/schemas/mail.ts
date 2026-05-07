import { z } from "zod";

/** Краткое представление письма в списке (соответствует backend `MailMessageSummaryView`). */
export const MailMessageSummarySchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  subject: z.string(),
  preview: z.string(),
  sentAtIso: z.string(),
});

/** Полное представление письма для экрана детализации (соответствует backend `MailMessageDetailView`). */
export const MailMessageDetailSchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  subject: z.string(),
  body: z.string(),
  sentAtIso: z.string(),
});

/** Список писем (`GET /mail/messages`). */
export const MailMessageListSchema = z.array(MailMessageSummarySchema);

/** Результат поиска писем (`POST /mail/messages/search`). */
export const MailMessageSearchSchema = z.object({
  query: z.string(),
  messages: z.array(MailMessageSummarySchema),
});

export type MailMessageSummaryParsed = z.infer<typeof MailMessageSummarySchema>;
export type MailMessageDetailParsed = z.infer<typeof MailMessageDetailSchema>;
export type MailMessageSearchParsed = z.infer<typeof MailMessageSearchSchema>;
