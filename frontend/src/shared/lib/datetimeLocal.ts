/**
 * Утилиты для <input type="datetime-local">: значение без TZ — это календарные
 * компоненты в локальном часовом поясе; нельзя полагаться на Date.parse строки.
 */

export function isoToLocalDateTimeInput(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

export function parseLocalDateTimeInput(value: string): Date | null {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/,
  );
  if (!match) return null;
  const [, y, m, d, hh, mm, ss = "0", ms = "0"] = match;
  const date = new Date(
    Number(y),
    Number(m) - 1,
    Number(d),
    Number(hh),
    Number(mm),
    Number(ss),
    Number(ms.padEnd(3, "0")),
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Пустая строка, если значение инпута некорректно. */
export function localDateTimeInputToIso(value: string): string {
  const date = parseLocalDateTimeInput(value);
  if (!date) return "";
  return date.toISOString();
}
