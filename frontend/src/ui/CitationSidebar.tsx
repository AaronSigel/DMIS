import type { Citation } from "../types/search";
import { smallBtnClass } from "./appShared";

type CitationSidebarProps = {
  citation: Citation | null;
  open: boolean;
  onClose: () => void;
};

/**
 * Упрощенный preview источника: показывает метаданные и подсвеченный текст чанка.
 * Без подключения PDF/viewer, чтобы уложиться в MVP задачи.
 */
export function CitationSidebar({ citation, open, onClose }: CitationSidebarProps) {
  if (!open || !citation) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Превью источника"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="absolute inset-0 z-[6] flex justify-end bg-overlay"
    >
      <div
        className="box-border flex h-full w-full max-w-[440px] flex-col gap-3 border-l border-border bg-white p-4"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="m-0 text-sm font-bold text-text">Источник [{citation.index}]</p>
            <p className="m-0 text-xs text-muted">{citation.documentTitle}</p>
          </div>
          <button type="button" className={smallBtnClass} onClick={onClose}>
            Закрыть
          </button>
        </div>

        <div className="rounded-lg border border-border bg-surface px-3 py-2">
          <p className="m-0 text-[11px] uppercase tracking-[0.06em] text-muted">Метаданные</p>
          <p className="mb-0 mt-1 text-xs text-text">Документ: {citation.documentId}</p>
          <p className="mb-0 mt-1 text-xs text-text">Чанк: {citation.chunkId}</p>
          <p className="mb-0 mt-1 text-xs text-text">Скор: {citation.score.toFixed(3)}</p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-primary bg-primary-soft p-3">
          <p className="mb-1 mt-0 text-[11px] uppercase tracking-[0.06em] text-primary">
            Подсвеченный фрагмент
          </p>
          <p className="m-0 whitespace-pre-wrap break-words text-[13px] leading-[1.55] text-text">
            {citation.chunkText || "Текст фрагмента отсутствует."}
          </p>
        </div>
      </div>
    </div>
  );
}
