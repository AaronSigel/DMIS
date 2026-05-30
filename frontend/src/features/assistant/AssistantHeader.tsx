type AssistantHeaderProps = {
  moduleTitle: string;
  onOpenThreads: () => void;
  onClose?: () => void;
  onNewThread: () => void;
};

export function AssistantHeader({
  moduleTitle,
  onOpenThreads,
  onClose,
  onNewThread,
}: AssistantHeaderProps) {
  return (
    <div
      data-testid="assistant-header"
      className="flex shrink-0 items-center justify-between border-b border-border px-4 pb-3 pt-[14px]"
    >
      <div className="min-w-0 flex-1">
        <span className="text-base font-semibold text-text">Ассистент</span>
        <p className="mb-0 mt-0.5 truncate text-[11px] text-muted">Контекст: {moduleTitle}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          data-testid="assistant-new-thread-button"
          className="rounded-md border border-border bg-white px-[10px] py-1.5 text-xs text-text"
          onClick={onNewThread}
        >
          Новый
        </button>
        {onClose && (
          <button
            type="button"
            className="rounded-md border border-border bg-white px-[10px] py-1.5 text-xs text-text"
            onClick={onClose}
          >
            Закрыть
          </button>
        )}
        <button
          type="button"
          className="rounded-md border border-border bg-white px-[10px] py-1.5 text-xs text-text"
          onClick={onOpenThreads}
        >
          Диалоги
        </button>
      </div>
    </div>
  );
}
