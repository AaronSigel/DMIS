import { type FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  apiCreateCalendarEvent,
  apiDeleteCalendarEvent,
  apiListCalendarEvents,
  apiUpdateCalendarEvent,
} from "../../apiClient";
import type { CalendarEvent, CalendarEventUpsertPayload } from "../../entities/calendar";
import { queryKeys } from "../../shared/api/queryClient";
import { mapApiErrorToMessage } from "../../shared/lib/mapApiErrorToMessage";
import { isoToLocalDateTimeInput, localDateTimeInputToIso } from "../../shared/lib/datetimeLocal";

type CalendarPageProps = {
  token: string;
  onSessionExpired: () => void;
  onTokenRefresh: (token: string) => void;
};

type CalendarViewMode = "day" | "week";

const DAY_MS = 24 * 60 * 60 * 1000;

function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toIsoOrEmpty(value: string): string {
  return localDateTimeInputToIso(value);
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getWeekRange(baseDate: Date): { start: Date; endExclusive: Date } {
  const normalized = new Date(baseDate);
  normalized.setHours(0, 0, 0, 0);
  const day = normalized.getDay();
  const offsetToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(normalized.getTime() + offsetToMonday * DAY_MS);
  const endExclusive = new Date(start.getTime() + 7 * DAY_MS);
  return { start, endExclusive };
}

function intersectsRange(event: CalendarEvent, start: Date, endExclusive: Date): boolean {
  const eventStart = new Date(event.startIso).getTime();
  const eventEnd = new Date(event.endIso).getTime();
  if (Number.isNaN(eventStart) || Number.isNaN(eventEnd)) return false;
  return eventEnd > start.getTime() && eventStart < endExclusive.getTime();
}

type EventFormState = {
  title: string;
  attendees: string;
  startLocal: string;
  endLocal: string;
};

function toPayload(state: EventFormState): CalendarEventUpsertPayload {
  return {
    title: state.title.trim(),
    attendees: state.attendees
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    startIso: toIsoOrEmpty(state.startLocal),
    endIso: toIsoOrEmpty(state.endLocal),
  };
}

function validatePayload(payload: CalendarEventUpsertPayload): string {
  if (!payload.title) return "Укажите название события.";
  if (payload.attendees.length === 0) return "Укажите хотя бы одного участника.";
  if (!payload.startIso || !payload.endIso)
    return "Укажите корректные дату и время начала/окончания.";
  if (new Date(payload.endIso).getTime() <= new Date(payload.startIso).getTime()) {
    return "Окончание должно быть позже начала.";
  }
  return "";
}

export function CalendarPage({ token, onSessionExpired, onTokenRefresh }: CalendarPageProps) {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<CalendarViewMode>("week");
  const [selectedDate, setSelectedDate] = useState(toDateInputValue(new Date()));
  const [formError, setFormError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventFormState>({
    title: "",
    attendees: "",
    startLocal: "",
    endLocal: "",
  });

  const eventsQuery = useQuery({
    queryKey: queryKeys.calendar.list,
    queryFn: () => apiListCalendarEvents(onSessionExpired, onTokenRefresh),
    enabled: !!token,
  });

  const sortedEvents = useMemo(() => {
    return [...(eventsQuery.data ?? [])].sort((a, b) => {
      return new Date(a.startIso).getTime() - new Date(b.startIso).getTime();
    });
  }, [eventsQuery.data]);

  const selectedDateObject = useMemo(() => {
    const parsed = new Date(`${selectedDate}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }, [selectedDate]);

  const visibleEvents = useMemo(() => {
    if (viewMode === "day") {
      const start = new Date(selectedDateObject);
      start.setHours(0, 0, 0, 0);
      const endExclusive = new Date(start.getTime() + DAY_MS);
      return sortedEvents.filter((event) => intersectsRange(event, start, endExclusive));
    }
    const { start, endExclusive } = getWeekRange(selectedDateObject);
    return sortedEvents.filter((event) => intersectsRange(event, start, endExclusive));
  }, [selectedDateObject, sortedEvents, viewMode]);

  const listError =
    eventsQuery.error instanceof Error ? mapApiErrorToMessage(eventsQuery.error.message) : "";

  const invalidateList = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.calendar.list });
  };

  const createMutation = useMutation({
    mutationFn: (payload: CalendarEventUpsertPayload) =>
      apiCreateCalendarEvent(payload, onSessionExpired, onTokenRefresh),
    onSuccess: async () => {
      await invalidateList();
      setForm({ title: "", attendees: "", startLocal: "", endLocal: "" });
      setFormError("");
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? mapApiErrorToMessage(error.message)
          : "Не удалось создать событие.";
      setFormError(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CalendarEventUpsertPayload }) =>
      apiUpdateCalendarEvent(id, payload, onSessionExpired, onTokenRefresh),
    onSuccess: async () => {
      await invalidateList();
      setEditingId(null);
      setForm({ title: "", attendees: "", startLocal: "", endLocal: "" });
      setFormError("");
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? mapApiErrorToMessage(error.message)
          : "Не удалось обновить событие.";
      setFormError(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDeleteCalendarEvent(id, onSessionExpired, onTokenRefresh),
    onSuccess: invalidateList,
  });

  function startEditing(event: CalendarEvent) {
    setEditingId(event.id);
    setForm({
      title: event.title,
      attendees: event.attendees.join(", "),
      startLocal: isoToLocalDateTimeInput(event.startIso),
      endLocal: isoToLocalDateTimeInput(event.endIso),
    });
    setFormError("");
  }

  function cancelEditing() {
    setEditingId(null);
    setForm({ title: "", attendees: "", startLocal: "", endLocal: "" });
    setFormError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const payload = toPayload(form);
    const validationError = validatePayload(payload);
    if (validationError) {
      setFormError(validationError);
      return;
    }
    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
      return;
    }
    createMutation.mutate(payload);
  }

  function handleDelete(id: string) {
    const confirmed = window.confirm("Удалить событие? Это действие нельзя отменить.");
    if (!confirmed) return;
    deleteMutation.mutate(id);
  }

  const formPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 p-4 md:flex-row">
      <section className="flex w-full min-h-0 flex-col rounded-lg border border-border bg-white p-3 md:w-[390px] md:shrink-0">
        <h2 className="m-0 mb-3 text-base font-semibold text-text">Календарь</h2>
        <form className="grid gap-2" onSubmit={handleSubmit}>
          <input
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Название события"
            aria-label="Название события"
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-[13px] outline-none"
          />
          <input
            value={form.attendees}
            onChange={(e) => setForm((prev) => ({ ...prev, attendees: e.target.value }))}
            placeholder="Участники через запятую"
            aria-label="Участники события"
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-[13px] outline-none"
          />
          <label className="grid gap-1 text-xs text-muted">
            Начало
            <input
              type="datetime-local"
              value={form.startLocal}
              onChange={(e) => setForm((prev) => ({ ...prev, startLocal: e.target.value }))}
              aria-label="Начало события"
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-[13px] text-text outline-none"
            />
          </label>
          <label className="grid gap-1 text-xs text-muted">
            Окончание
            <input
              type="datetime-local"
              value={form.endLocal}
              onChange={(e) => setForm((prev) => ({ ...prev, endLocal: e.target.value }))}
              aria-label="Окончание события"
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-[13px] text-text outline-none"
            />
          </label>
          {formError && <p className="m-0 text-[12px] text-danger">{formError}</p>}
          <div className="mt-1 flex items-center gap-2">
            <button
              type="submit"
              disabled={formPending}
              className="rounded-md border-0 bg-primary px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              {editingId ? "Сохранить" : "Создать"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEditing}
                className="rounded-md border border-border bg-surface px-3 py-2 text-xs text-text"
              >
                Отмена
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="flex min-h-0 flex-1 flex-col rounded-lg border border-border bg-white p-3">
        <header className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode("day")}
              className={`rounded-md px-3 py-1.5 text-xs ${
                viewMode === "day" ? "bg-primary text-white" : "bg-surface text-text"
              }`}
            >
              День
            </button>
            <button
              type="button"
              onClick={() => setViewMode("week")}
              className={`rounded-md px-3 py-1.5 text-xs ${
                viewMode === "week" ? "bg-primary text-white" : "bg-surface text-text"
              }`}
            >
              Неделя
            </button>
          </div>
          <label className="flex items-center gap-2 text-xs text-muted">
            Базовая дата
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              aria-label="Дата просмотра календаря"
              className="rounded-md border border-border bg-surface px-2 py-1.5 text-[12px] text-text outline-none"
            />
          </label>
        </header>

        {eventsQuery.isPending && (
          <p className="m-0 text-[13px] text-muted">Загрузка событий календаря…</p>
        )}
        {!eventsQuery.isPending && listError && (
          <p className="m-0 text-[13px] text-danger">{listError}</p>
        )}
        {!eventsQuery.isPending && !listError && visibleEvents.length === 0 && (
          <p className="m-0 text-[13px] text-muted">События для выбранного периода не найдены.</p>
        )}
        {!eventsQuery.isPending && !listError && visibleEvents.length > 0 && (
          <ul
            className="m-0 flex list-none flex-col gap-2 overflow-y-auto p-0"
            aria-label="Список событий"
          >
            {visibleEvents.map((event) => (
              <li key={event.id} className="rounded-md border border-border bg-surface px-3 py-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="m-0 mb-1 text-[13px] font-semibold text-text">{event.title}</p>
                    <p className="m-0 text-[12px] text-muted">
                      {formatDateTime(event.startIso)} - {formatDateTime(event.endIso)}
                    </p>
                    <p className="m-0 mt-1 break-words text-[12px] text-muted">
                      Участники: {event.attendees.join(", ")}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => startEditing(event)}
                      className="rounded-md border border-border bg-white px-2 py-1 text-xs text-text"
                    >
                      Изменить
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(event.id)}
                      disabled={deleteMutation.isPending}
                      className="rounded-md border border-danger/40 bg-danger-soft px-2 py-1 text-xs text-danger disabled:opacity-60"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
