export type AuditRecord = {
  id: string;
  at: string;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: string;
};
