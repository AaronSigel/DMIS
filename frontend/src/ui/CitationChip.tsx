import type { Citation } from "../types/search";

type CitationChipProps = {
  citation: Citation;
  onClick?: (citation: Citation) => void;
};

/** Максимальная длина превью текста чанка в title-подсказке. */
const TITLE_PREVIEW_LIMIT = 160;

function buildTitle(citation: Citation): string {
  const snippet = citation.chunkText.trim();
  if (!snippet) return citation.documentTitle;
  const truncated =
    snippet.length > TITLE_PREVIEW_LIMIT ? `${snippet.slice(0, TITLE_PREVIEW_LIMIT)}…` : snippet;
  return `${citation.documentTitle} — ${truncated}`;
}

/**
 * Чип с порядковым номером источника `[N]` в ответе ассистента.
 * Кликабелен и связан с данными источника через колбэк onClick.
 */
export function CitationChip({ citation, onClick }: CitationChipProps) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(citation)}
      title={buildTitle(citation)}
      aria-label={`Источник ${citation.index}: ${citation.documentTitle}`}
      className="inline-flex items-center rounded-md border border-border bg-primary-soft px-1.5 py-[2px] text-[11px] font-medium text-primary hover:bg-primary hover:text-white"
    >
      [{citation.index}]
    </button>
  );
}
