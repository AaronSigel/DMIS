import { z } from "zod";

export const SendEmailEntitiesSchema = z.object({
  type: z.literal("send_email").optional(),
  to: z.string().optional(),
  subject: z.string().optional(),
  body: z.string().optional(),
});

export const CreateCalendarEventEntitiesSchema = z.object({
  type: z.literal("create_calendar_event").optional(),
  title: z.string().optional(),
  attendees: z.array(z.string()).optional(),
  startIso: z.string().optional(),
  endIso: z.string().optional(),
});

export const UpdateDocumentTagsEntitiesSchema = z.object({
  type: z.literal("update_document_tags").optional(),
  documentId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const UnknownActionEntitiesSchema = z.record(z.string(), z.unknown());

export const ActionEntitiesSchema = z.union([
  SendEmailEntitiesSchema,
  CreateCalendarEventEntitiesSchema,
  UpdateDocumentTagsEntitiesSchema,
  UnknownActionEntitiesSchema,
]);

export const ActionStatusSchema = z.enum(["DRAFT", "CONFIRMED", "EXECUTED"]);

/** DTO действия ассистента (соответствует backend AiActionView). */
export const ActionViewSchema = z.object({
  id: z.string(),
  intent: z.string(),
  entities: ActionEntitiesSchema,
  actorId: z.string(),
  status: ActionStatusSchema,
  confirmedBy: z.string().nullable(),
});

export const ActionListSchema = z.array(ActionViewSchema);

export type SendEmailEntities = z.infer<typeof SendEmailEntitiesSchema>;
export type CreateCalendarEventEntities = z.infer<typeof CreateCalendarEventEntitiesSchema>;
export type UpdateDocumentTagsEntities = z.infer<typeof UpdateDocumentTagsEntitiesSchema>;
export type ActionCardEntities = z.infer<typeof ActionEntitiesSchema>;
export type ActionStatus = z.infer<typeof ActionStatusSchema>;
export type ActionView = z.infer<typeof ActionViewSchema>;
