/**
 * Доменные типы почтового модуля.
 *
 * Соответствуют backend DTO `IntegrationDtos.MailMessage*View`
 * и используются в `features/mail/*` и API-клиенте.
 */

export type MailAttachmentPart = {
  partId: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
};

export type MailMessageSummary = {
  id: string;
  from: string;
  to: string;
  subject: string;
  preview: string;
  sentAtIso: string;
  hasAttachments: boolean;
  draft: boolean;
};

export type MailMessageDetail = {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  sentAtIso: string;
  attachments: MailAttachmentPart[];
};

export type MailMessageSearch = {
  query: string;
  messages: MailMessageSummary[];
};

export type MailDraft = {
  id: string;
  to: string;
  subject: string;
  body: string;
  createdBy: string;
};

export type MailThreadSummary = {
  summary: string;
  provider: string;
  model: string;
};

export type MailAccount = {
  connected: boolean;
  imapHost: string;
  imapPort: number;
  imapUsername: string;
};
