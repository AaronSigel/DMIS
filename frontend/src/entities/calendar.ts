/**
 * Доменные типы календарного модуля.
 *
 * Соответствуют backend DTO `IntegrationDtos.CalendarEventView`
 * и используются в `features/calendar/*` и API-клиенте.
 */
export type CalendarParticipant = {
  userId: string | null;
  email: string;
  displayName: string;
  status: string;
};

export type CalendarAttachment = {
  id: string;
  documentId: string;
  documentTitle: string;
  role: string;
};

export type CalendarEvent = {
  id: string;
  title: string;
  attendees: string[];
  startIso: string;
  endIso: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  creationSource: string;
  sourceMailMessageId: string | null;
  participants: CalendarParticipant[];
  attachments: CalendarAttachment[];
};

export type CalendarEventUpsertPayload = {
  title: string;
  attendees: string[];
  startIso: string;
  endIso: string;
  description?: string;
};

export type UserSummary = {
  id: string;
  email: string;
  fullName: string;
};

export type SuggestedSlot = {
  startIso: string;
  endIso: string;
};

export type AvailabilityResponse = {
  slots: SuggestedSlot[];
};
