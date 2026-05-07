import { useEffect, useState } from "react";
import { smallBtnClass } from "../../shared/ui/smallBtnClass";
import { mapApiErrorToMessage } from "../../shared/lib/mapApiErrorToMessage";

/** Модальное окно переименования документа (только display title). */
export function RenameDocumentModal({
  open,
  onClose,
  initialTitle,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initialTitle: string;
  onSave: (title: string) => Promise<void>;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(initialTitle);
      setErr("");
      setBusy(false);
    }
  }, [open, initialTitle]);

  if (!open) return null;

  async function submit() {
    const t = title.trim();
    if (!t) {
      setErr("Заполните имя документа.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      await onSave(t);
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? mapApiErrorToMessage(e.message) : "Не удалось сохранить");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/35 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-[420px] rounded-xl border border-border bg-white px-5 py-[18px] shadow-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <p className="mb-[14px] mt-0 text-[15px] font-bold text-text">Переименовать</p>
        <label className="mb-1 block text-[11px] font-semibold text-muted">Имя документа</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-2.5 box-border w-full rounded-[7px] border border-border bg-surface px-[10px] py-2 text-[13px] outline-none"
        />
        {err && <p className="mb-2 mt-0 text-xs text-danger">{err}</p>}
        <div className="mt-1.5 flex justify-end gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => !busy && onClose()}
            className={smallBtnClass}
          >
            Отмена
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void submit()}
            className="rounded-md border-0 bg-primary px-3 py-1 text-xs text-white"
          >
            {busy ? "Сохранение…" : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
}
