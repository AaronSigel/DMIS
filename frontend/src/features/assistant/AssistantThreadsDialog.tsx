import { useEffect, useRef } from "react";
import { smallBtnClass } from "../../shared/ui/smallBtnClass";

type ThreadItem = { id: string; title: string };

type AssistantThreadsDialogProps = {
  open: boolean;
  width: number;
  threads: ThreadItem[];
  activeThreadId: string;
  deletePending: boolean;
  onClose: () => void;
  onCreate: () => void;
  onSelect: (threadId: string) => void;
  onDelete: (threadId: string, title: string) => void;
};

export function AssistantThreadsDialog({
  open,
  width,
  threads,
  activeThreadId,
  deletePending,
  onClose,
  onCreate,
  onSelect,
  onDelete,
}: AssistantThreadsDialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;

    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Диалоги ассистента"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="absolute inset-0 z-[5] flex justify-end bg-overlay"
    >
      <div
        className="box-border flex h-full flex-col gap-2.5 border-l border-border bg-white p-[14px]"
        style={{ width: Math.min(360, width) }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="m-0 text-sm font-bold text-text">Диалоги</p>
          <button type="button" ref={closeButtonRef} className={smallBtnClass} onClick={onClose}>
            Закрыть
          </button>
        </div>
        <button
          type="button"
          data-testid="assistant-thread-create-button"
          className="rounded-md border-0 bg-primary px-3 py-1 text-xs text-white"
          onClick={onCreate}
        >
          + Новый диалог
        </button>
        <div className="grid gap-1.5 overflow-y-auto" role="listbox" aria-label="Список диалогов">
          {threads.map((thread) => (
            <div
              key={thread.id}
              role="option"
              aria-selected={activeThreadId === thread.id}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs ${
                activeThreadId === thread.id
                  ? "border border-primary bg-primary-soft text-text"
                  : "border border-border bg-white text-text"
              }`}
            >
              <button
                type="button"
                className="min-w-0 flex-1 rounded-md px-1 py-1 text-left text-xs"
                onClick={() => onSelect(thread.id)}
              >
                <span className="block truncate" title={thread.title}>
                  {thread.title}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onDelete(thread.id, thread.title)}
                className="rounded-md border border-border bg-white px-2 py-1 text-[11px] text-muted hover:text-danger disabled:opacity-50"
                aria-label={`Удалить диалог: ${thread.title}`}
                disabled={deletePending}
              >
                Удалить
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
