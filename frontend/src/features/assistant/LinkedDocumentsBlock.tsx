import type { AssistantDocumentStatusView } from "../../shared/api/schemas/assistant";
import { documentStatusLabel } from "./assistantDocumentStatus";

type LinkedDocumentsBlockProps = {
  documentIds: string[];
  documentTitles: Record<string, string>;
  documentStatuses: Record<string, AssistantDocumentStatusView>;
  onSummary: (documentId: string) => void;
  onRemove: (documentId: string) => void;
};

export function LinkedDocumentsBlock({
  documentIds,
  documentTitles,
  documentStatuses,
  onSummary,
  onRemove,
}: LinkedDocumentsBlockProps) {
  if (!documentIds.length) return null;

  return (
    <div className="mt-2" data-testid="assistant-linked-documents">
      <p className="mb-1 mt-0 text-[11px] text-muted">Документы в контексте</p>
      <div className="grid gap-1.5">
        {documentIds.map((id) => {
          const status = documentStatuses[id];
          return (
            <div
              key={id}
              data-testid="assistant-linked-document-item"
              className="rounded-md border border-border bg-white px-2 py-1.5 text-[11px] text-text"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate">{documentTitles[id] ?? id}</span>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    data-testid="assistant-document-summary-button"
                    title="Краткая сводка файла"
                    aria-label={`Сводка: ${documentTitles[id] ?? id}`}
                    className="rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] text-text"
                    onClick={() => onSummary(id)}
                  >
                    Сводка
                  </button>
                  <button
                    type="button"
                    title="Убрать документ из контекста ответа"
                    aria-label={`Убрать из контекста: ${documentTitles[id] ?? id}`}
                    className="shrink-0 border-none bg-transparent text-muted"
                    onClick={() => onRemove(id)}
                  >
                    ×
                  </button>
                </div>
              </div>
              <p
                data-testid="assistant-document-status"
                className="mb-0 mt-0.5 text-[10px] text-muted"
              >
                Статус: {documentStatusLabel(status)}
                {status ? ` · чанков: ${status.indexedChunkCount}` : ""}
                {status ? ` · текст: ${status.extractedTextLength} симв.` : ""}
                {status?.diagnosticMessage ? ` · ${status.diagnosticMessage}` : ""}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
