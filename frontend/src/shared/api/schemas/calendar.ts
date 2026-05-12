import { z } from "zod";

export const CalendarParticipantSchema = z.object({
  userId: z.string().nullable(),
  email: z.string(),
  displayName: z.string(),
  status: z.string(),
});

export const CalendarAttachmentSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  documentTitle: z.string(),
  role: z.string(),
});

/** Представление события календаря (соответствует backend `CalendarEventView`). */
export const CalendarEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  attendees: z.array(z.string()),
  startIso: z.string(),
  endIso: z.string(),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  description: z.string(),
  creationSource: z.string(),
  sourceMailMessageId: z.string().nullable(),
  participants: z.array(CalendarParticipantSchema),
  attachments: z.array(CalendarAttachmentSchema),
});

/** Список событий календаря (`GET /calendar/events`). */
export const CalendarEventListSchema = z.array(CalendarEventSchema);

export const AvailabilityResponseSchema = z.object({
  slots: z.array(
    z.object({
      startIso: z.string(),
      endIso: z.string(),
    }),
  ),
});

export const UserSummaryListSchema = z.array(
  z.object({
    id: z.string(),
    email: z.string(),
    fullName: z.string(),
  }),
);

export type CalendarEventParsed = z.infer<typeof CalendarEventSchema>;
