export function truncateId(id: string): string {
  if (!id) return "";
  const stripped = id.replace(/-/g, "");
  if (stripped.length <= 8) return id;
  return "…" + stripped.slice(-8);
}
