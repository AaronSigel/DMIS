import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import type { DocumentView } from "../types/document";

// Общие токены интерфейса и примитивы, вынесенные из App.tsx
// для поэтапной декомпозиции монолитного файла.
export const C = {
  bg: "var(--color-surface)",
  sidebar: "var(--color-surface-alt)",
  border: "var(--color-border)",
  orange: "var(--color-primary)",
  text: "var(--color-text)",
  muted: "var(--color-muted)",
  white: "var(--color-white)",
  green: "var(--color-success)",
  yellow: "var(--color-warning)",
  grey: "var(--color-muted)",
  red: "var(--color-danger)",
  redSoft: "var(--color-danger-soft)",
};

export const smallBtnClass = "rounded-md border border-border bg-white px-3 py-1 text-xs text-text";

export function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "только что";
  if (mins < 60) return `${mins} мин назад`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h} ч назад`;
  const d = Math.floor(h / 24);
  if (d === 1) return "вчера";
  if (d < 7) return `${d} дн назад`;
  return `${Math.floor(d / 7)} нед назад`;
}

export function docIcon(doc: DocumentView): string {
  const t = doc.title.toLowerCase();
  if (t.includes("transcript") || doc.type?.toLowerCase() === "transcript") return "🎤";
  if (doc.tags?.includes("restricted")) return "🔒";
  return "📄";
}

export function docAcl(doc: DocumentView): string {
  if (doc.tags?.includes("public")) return "публичный";
  if (doc.tags?.includes("restricted")) return "ограниченный";
  return "команда";
}

export function sectionTitle(s: string): string {
  const map: Record<string, string> = {
    dashboard: "Дашборд",
    documents: "Документы",
    mail: "Почта",
    calendar: "Календарь",
    audit: "Журнал аудита",
    settings: "Настройки",
    all_docs: "Документы",
    recent: "Недавние",
    pinned: "Закрепленные",
    shared: "Доступные мне",
    contracts: "Контракты",
    memos: "Заметки",
    reports: "Отчеты",
    transcripts: "Транскрипты",
    acl: "ACL",
  };
  return map[s] ?? s;
}

export function mapApiErrorToMessage(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("failed to fetch")) {
    return "Сервис временно недоступен. Проверьте соединение и повторите попытку.";
  }
  if (normalized.includes("expected json response")) {
    return "Сервис вернул неожиданный ответ. Повторите попытку позже.";
  }
  if (normalized.includes("unauthorized")) {
    return "Сессия истекла. Войдите снова.";
  }
  return message || "Произошла ошибка. Попробуйте еще раз.";
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({ name, size = 26 }: { name: string; size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-primary font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials(name)}
    </span>
  );
}

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

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-0.5 mt-[10px] px-[10px] text-[10px] font-bold uppercase tracking-[0.08em] text-muted">
      {children}
    </p>
  );
}

export function TopBarBtn({
  children,
  onClick,
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="rounded-[20px] border border-border bg-transparent px-[14px] py-[5px] text-[13px] text-text"
    >
      {children}
    </button>
  );
}

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
