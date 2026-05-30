import type { AssistantDocumentStatusView } from "../../shared/api/schemas/assistant";
import type { AssistantContextSnapshot } from "../../shared/store/uiStore";
import { documentStatusLabel } from "./assistantDocumentStatus";

type ContextCardProps = {
  assistantContext: AssistantContextSnapshot;
  moduleTitle: string;
  objectLabel: string | null;
  showMailCalendarStub: boolean;
  primaryDocumentStatus: AssistantDocumentStatusView | undefined;
  linkedDocumentCount: number;
};

export function ContextCard({
  assistantContext,
  moduleTitle,
  objectLabel,
  showMailCalendarStub,
  primaryDocumentStatus,
  linkedDocumentCount,
}: ContextCardProps) {
  return (
    <div
      data-testid="assistant-context-card"
      className="mb-3 rounded-lg border border-border bg-white px-3 py-2.5"
    >
      <p className="mb-1 mt-0 text-[10px] font-semibold uppercase tracking-wide text-muted">
        Текущий контекст
      </p>
      <p className="mb-0 mt-0 text-[13px] font-medium text-text">{moduleTitle}</p>

      {showMailCalendarStub ? (
        <p className="mb-0 mt-2 text-[12px] leading-snug text-muted">
          Контекстная панель для почты и календаря — в следующей версии.
        </p>
      ) : (
        <>
          {objectLabel && (
            <p className="mb-0 mt-1 text-[12px] text-text" data-testid="assistant-context-object">
              {assistantContext.object?.type === "DOCUMENT"
                ? `Выбран документ: ${objectLabel}`
                : objectLabel}
            </p>
          )}
          {primaryDocumentStatus && (
            <p
              className="mb-0 mt-1.5 text-[11px] text-muted"
              data-testid="assistant-context-status-summary"
            >
              Статус: {documentStatusLabel(primaryDocumentStatus)}
              {primaryDocumentStatus.indexedChunkCount > 0
                ? ` · чанков: ${primaryDocumentStatus.indexedChunkCount}`
                : ""}
            </p>
          )}
          {linkedDocumentCount > 1 && (
            <p className="mb-0 mt-1 text-[11px] text-muted">
              В диалоге: {linkedDocumentCount} документов
            </p>
          )}
        </>
      )}
    </div>
  );
}
