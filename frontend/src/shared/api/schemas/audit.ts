import { z } from "zod";

/** Запись аудита (соответствует backend `AuditView`). */
export const AuditRecordSchema = z.object({
  id: z.string(),
  at: z.string(),
  actorId: z.string(),
  action: z.string(),
  resourceType: z.string(),
  resourceId: z.string(),
  details: z.string(),
  status: z.enum(["SUCCESS", "ERROR", "PENDING", "CANCELLED"]).nullish(),
  metadata: z.record(z.unknown()).nullish(),
});

/** Список записей аудита (`GET /audit`). */
export const AuditRecordListSchema = z.array(AuditRecordSchema);

export type AuditRecordParsed = z.infer<typeof AuditRecordSchema>;
