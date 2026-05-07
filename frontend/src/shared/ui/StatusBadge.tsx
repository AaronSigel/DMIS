/**
 * Универсальный бейдж статуса. Известные статусы (final/indexed/review/pending/failed/draft)
 * получают локализованную подпись и цветовую схему; неизвестные показываются как есть.
 */
export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const labelMap: Record<string, string> = {
    final: "финальный",
    indexed: "проиндексирован",
    review: "на проверке",
    pending: "в ожидании",
    failed: "ошибка",
    draft: "черновик",
  };
  const map: Record<string, string> = {
    final: "border-none bg-success text-white",
    indexed: "border-none bg-muted text-white",
    review: "border border-warning bg-transparent text-warning",
    pending: "border border-muted bg-transparent text-muted",
    failed: "border-none bg-danger-soft text-danger",
    draft: "border border-text bg-transparent text-text",
  };
  const pill = map[s] ?? "border border-border bg-transparent text-text";
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-[20px] px-[10px] py-[2px] text-xs font-medium ${pill}`}
    >
      {labelMap[s] ?? s}
    </span>
  );
}
