export type AuditRecord = {
  id: string;
  at: string;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: string;
  status?: "SUCCESS" | "ERROR" | "PENDING" | "CANCELLED" | null;
  metadata?: Record<string, unknown> | null;
};
