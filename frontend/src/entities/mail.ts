/**
 * Доменные типы почтового модуля.
 *
 * Соответствуют backend DTO `IntegrationDtos.MailMessage*View` (см. task-56)
 * и используются в `features/mail/*` и API-клиенте.
 */

export type MailMessageSummary = {
  id: string;
  from: string;
  to: string;
  subject: string;
  preview: string;
  sentAtIso: string;
};

export type MailMessageDetail = {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  sentAtIso: string;
};

export type MailMessageSearch = {
  query: string;
  messages: MailMessageSummary[];
};

export type MailAccount = {
  connected: boolean;
  imapHost: string;
  imapPort: number;
  imapUsername: string;
};
