/**
 * Доменные типы календарного модуля.
 *
 * Соответствуют backend DTO `IntegrationDtos.CalendarEventView`
 * и используются в `features/calendar/*` и API-клиенте.
 */
export type CalendarEvent = {
  id: string;
  title: string;
  attendees: string[];
  startIso: string;
  endIso: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type CalendarEventUpsertPayload = {
  title: string;
  attendees: string[];
  startIso: string;
  endIso: string;
};
