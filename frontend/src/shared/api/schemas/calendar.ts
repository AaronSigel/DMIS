import { z } from "zod";

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
});

/** Список событий календаря (`GET /calendar/events`). */
export const CalendarEventListSchema = z.array(CalendarEventSchema);

export type CalendarEventParsed = z.infer<typeof CalendarEventSchema>;
