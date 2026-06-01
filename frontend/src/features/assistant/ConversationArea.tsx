import type { Citation } from "../../entities/search";
import type { AssistantThreadMessageView } from "../../shared/api/schemas/assistant";
import { CitationChip } from "./CitationChip";
import { contextDiagnosticMessage } from "./assistantDocumentStatus";
import { renderMessageMarkdown } from "./renderMessageMarkdown";

type ConversationAreaProps = {
  messages: AssistantThreadMessageView[];
  isStreaming: boolean;
  streamText: string;
  streamError: string | null;
  streamContextDiagnostic: string | null;
  streamSources: Citation[];
  isIdle: boolean;
  thinking: boolean;
  ideologyProfileLabel: string;
  onRetry?: () => void;
  onCitationClick?: (citation: Citation) => void;
};

export function ConversationArea({
  messages,
  isStreaming,
  streamText,
  streamError,
  streamContextDiagnostic,
  streamSources,
  isIdle,
  thinking,
  ideologyProfileLabel,
  onRetry,
  onCitationClick,
}: ConversationAreaProps) {
  const hasAnyAssistantOutput = messages.length > 0 || isStreaming || !!streamText;
  return (
    <div data-testid="assistant-conversation-area">
      {!isIdle && (
        <p className="mb-2 mt-0 text-[11px] text-muted">Профиль: {ideologyProfileLabel}</p>
      )}
      {isIdle && (
        <p className="mb-2 mt-0 text-[12px] text-muted">
          Что можно сделать здесь и сейчас? Выберите быстрое действие или задайте вопрос.
        </p>
      )}
      {thinking && <p className="text-[13px] text-muted">Думаю…</p>}
      {!isIdle && !thinking && !hasAnyAssistantOutput && (
        <p className="mb-2 mt-0 text-[13px] text-muted">
          Ответ пока не получен. Попробуйте переформулировать запрос или повторить отправку.
        </p>
      )}
      <div className="grid gap-2">
        {messages.map((m) => (
          <div
            key={m.id}
            data-testid={m.role === "ASSISTANT" ? "assistant-answer" : undefined}
            className="min-w-0 rounded-lg border border-border bg-white px-[10px] py-2"
          >
            <p className="mb-1 mt-0 text-[11px] text-muted">
              {m.role === "USER" ? "Вы" : "Ассистент"}
            </p>
            <div className="min-w-0 break-words">
              {m.role === "ASSISTANT" ? renderMessageMarkdown(m.content) : m.content}
            </div>
          </div>
        ))}
        {(isStreaming || streamText) && (
          <div
            data-testid="assistant-answer"
            data-assistant-streaming={isStreaming ? "true" : "false"}
            className="min-w-0 rounded-lg border border-border bg-white px-[10px] py-2"
          >
            <p className="mb-1 mt-0 text-[11px] text-muted">Ассистент</p>
            <div className="min-w-0 break-words">{renderMessageMarkdown(streamText || "…")}</div>
          </div>
        )}
      </div>
      {contextDiagnosticMessage(streamContextDiagnostic) && (
        <p data-testid="assistant-context-status" className="mt-2 text-[12px] text-warning">
          {contextDiagnosticMessage(streamContextDiagnostic)}
        </p>
      )}
      {streamError && (
        <div className="mt-2 flex items-center gap-2">
          <p data-testid="assistant-error" className="m-0 text-[12px] text-danger">
            {streamError}
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded border border-primary/40 bg-white px-2 py-0.5 text-[11px] text-primary hover:bg-primary/5"
            >
              Повторить
            </button>
          )}
        </div>
      )}
      {streamSources.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {streamSources.map((citation) => (
            <CitationChip
              key={`${citation.chunkId}-${citation.index}`}
              citation={citation}
              onClick={onCitationClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
