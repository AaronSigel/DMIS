import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import {
  apiAddCalendarAttachment,
  apiAddCalendarParticipant,
  apiCreateCalendarEvent,
  apiCreateCalendarFromMail,
  apiDeleteCalendarEvent,
  apiListCalendarEvents,
  apiPostCalendarAgenda,
  apiPostCalendarAvailability,
  apiRemoveCalendarAttachment,
  apiRemoveCalendarParticipant,
  apiSearchUsers,
  apiUpdateCalendarEvent,
} from "../../apiClient";
import type {
  CalendarEvent,
  CalendarEventUpsertPayload,
  UserSummary,
} from "../../entities/calendar";
import { queryKeys } from "../../shared/api/queryClient";
import { mapApiErrorToMessage } from "../../shared/lib/mapApiErrorToMessage";
import { isoToLocalDateTimeInput, localDateTimeInputToIso } from "../../shared/lib/datetimeLocal";
import { PageHeader } from "../../shared/ui/PageHeader";
import { useToast } from "../../shared/ui/ToastProvider";

type CalendarPageProps = {
  token: string;
  onSessionExpired: () => void;
  onTokenRefresh: (token: string) => void;
};

type CalendarViewMode = "day" | "week" | "month";

const DAY_MS = 24 * 60 * 60 * 1000;
const START_HOUR = 8;
const END_HOUR = 20;
const HOUR_PX = 44;

function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDateInput(value: string): Date {
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function startOfDayLocal(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * DAY_MS);
}

function getWeekRangeMonday(baseDate: Date): { start: Date; endExclusive: Date } {
  const normalized = startOfDayLocal(baseDate);
  const day = normalized.getDay();
  const offsetToMonday = day === 0 ? -6 : 1 - day;
  const start = addDays(normalized, offsetToMonday);
  const endExclusive = addDays(start, 7);
  return { start, endExclusive };
}

function intersectsRange(event: CalendarEvent, rangeStart: Date, rangeEndExclusive: Date): boolean {
  const eventStart = new Date(event.startIso).getTime();
  const eventEnd = new Date(event.endIso).getTime();
  if (Number.isNaN(eventStart) || Number.isNaN(eventEnd)) return false;
  return eventEnd > rangeStart.getTime() && eventStart < rangeEndExclusive.getTime();
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

function eventStyleBounds(
  startIso: string,
  endIso: string,
  dayStart: Date,
): { top: number; height: number } | null {
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  const day0 = startOfDayLocal(dayStart);
  const day1 = addDays(day0, 1);
  const day0Ms = day0.getTime();
  const day1Ms = day1.getTime();
  if (start.getTime() >= day1Ms || end.getTime() <= day0Ms) return null;
  const clipStart = Math.max(start.getTime(), day0Ms);
  const clipEnd = Math.min(end.getTime(), day1Ms);
  const startMin = (clipStart - day0Ms) / (60 * 1000);
  const endMin = (clipEnd - day0Ms) / (60 * 1000);
  const windowMin = (END_HOUR - START_HOUR) * 60;
  const relStart = Math.max(0, startMin - START_HOUR * 60);
  const relEnd = Math.min(windowMin, endMin - START_HOUR * 60);
  if (relEnd <= relStart) return null;
  const top = (relStart / windowMin) * ((END_HOUR - START_HOUR) * HOUR_PX);
  const height = Math.max(
    ((relEnd - relStart) / windowMin) * ((END_HOUR - START_HOUR) * HOUR_PX),
    10,
  );
  return { top, height };
}

function eventIntersectsDay(event: CalendarEvent, day: Date): boolean {
  const day0 = startOfDayLocal(day);
  const day1 = addDays(day0, 1);
  return intersectsRange(event, day0, day1);
}

type EventFormState = {
  title: string;
  attendees: string;
  description: string;
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
    startIso: localDateTimeInputToIso(state.startLocal),
    endIso: localDateTimeInputToIso(state.endLocal),
    description: state.description.trim(),
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
  const toast = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<CalendarViewMode>("week");
  const [selectedDate, setSelectedDate] = useState(toDateInputValue(new Date()));
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formError, setFormError] = useState("");
  const [composeOpen, setComposeOpen] = useState(true);
  const [participantQuery, setParticipantQuery] = useState("");
  const [participantHits, setParticipantHits] = useState<UserSummary[]>([]);
  const [availabilityHint, setAvailabilityHint] = useState("");
  const [attachDocId, setAttachDocId] = useState("");
  const [attachRole, setAttachRole] = useState("AGENDA");

  const [form, setForm] = useState<EventFormState>({
    title: "",
    attendees: "",
    description: "",
    startLocal: "",
    endLocal: "",
  });

  const selectedDateObject = useMemo(() => parseDateInput(selectedDate), [selectedDate]);

  const listRange = useMemo((): { from: string; to: string } => {
    if (viewMode === "day") {
      const s = startOfDayLocal(selectedDateObject);
      const e = addDays(s, 1);
      return { from: s.toISOString(), to: e.toISOString() };
    }
    if (viewMode === "week") {
      const { start, endExclusive } = getWeekRangeMonday(selectedDateObject);
      return { from: startOfDayLocal(start).toISOString(), to: endExclusive.toISOString() };
    }
    const y = selectedDateObject.getFullYear();
    const m = selectedDateObject.getMonth();
    const first = new Date(y, m, 1);
    const nextMonth = new Date(y, m + 1, 1);
    return { from: startOfDayLocal(first).toISOString(), to: nextMonth.toISOString() };
  }, [selectedDateObject, viewMode]);

  const eventsQuery = useQuery({
    queryKey: queryKeys.calendar.list(listRange),
    queryFn: () => apiListCalendarEvents(listRange, onSessionExpired, onTokenRefresh),
    enabled: !!token,
  });

  const sortedEvents = useMemo(() => {
    return [...(eventsQuery.data ?? [])].sort(
      (a, b) => new Date(a.startIso).getTime() - new Date(b.startIso).getTime(),
    );
  }, [eventsQuery.data]);

  const visibleEvents = useMemo(() => {
    const s = new Date(listRange.from);
    const e = new Date(listRange.to);
    return sortedEvents.filter((ev) => intersectsRange(ev, s, e));
  }, [sortedEvents, listRange]);

  const detailEvent = useMemo(
    () =>
      visibleEvents.find((x) => x.id === selectedEventId) ??
      sortedEvents.find((x) => x.id === selectedEventId),
    [selectedEventId, sortedEvents, visibleEvents],
  );

  const invalidateList = async () => {
    await queryClient.invalidateQueries({ queryKey: ["calendar"] });
  };

  const mailMessageId = searchParams.get("mailMessageId");

  useEffect(() => {
    const mailbox = searchParams.get("mailbox") ?? "";
    if (!mailMessageId || !token) return;
    let cancelled = false;
    (async () => {
      try {
        const ev = await apiCreateCalendarFromMail(
          { mailbox, messageId: mailMessageId },
          onSessionExpired,
          onTokenRefresh,
        );
        if (!cancelled) {
          toast.success(`Событие создано из письма: ${ev.title}`);
          setSelectedEventId(ev.id);
          await invalidateList();
          const next = new URLSearchParams(searchParams);
          next.delete("mailMessageId");
          next.delete("mailbox");
          setSearchParams(next, { replace: true });
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(mapApiErrorToMessage(err instanceof Error ? err.message : ""));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- однократный импорт из почты
  }, [mailMessageId, token]);

  useEffect(() => {
    const q = participantQuery.trim();
    if (q.length < 2) {
      setParticipantHits([]);
      return;
    }
    const t = window.setTimeout(() => {
      apiSearchUsers(q, onSessionExpired, onTokenRefresh)
        .then(setParticipantHits)
        .catch(() => setParticipantHits([]));
    }, 250);
    return () => window.clearTimeout(t);
  }, [participantQuery, onSessionExpired, onTokenRefresh]);

  const createMutation = useMutation({
    mutationFn: (payload: CalendarEventUpsertPayload) =>
      apiCreateCalendarEvent(payload, onSessionExpired, onTokenRefresh),
    onSuccess: async (created) => {
      await invalidateList();
      setComposeOpen(false);
      openDetail(created);
      setFormError("");
    },
    onError: (error) => {
      setFormError(
        error instanceof Error ? mapApiErrorToMessage(error.message) : "Ошибка создания.",
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CalendarEventUpsertPayload }) =>
      apiUpdateCalendarEvent(id, payload, onSessionExpired, onTokenRefresh),
    onSuccess: async () => {
      await invalidateList();
      setEditMode(false);
      setFormError("");
    },
    onError: (error) => {
      setFormError(
        error instanceof Error ? mapApiErrorToMessage(error.message) : "Ошибка сохранения.",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDeleteCalendarEvent(id, onSessionExpired, onTokenRefresh),
    onSuccess: async () => {
      await invalidateList();
      setSelectedEventId(null);
    },
  });

  const agendaMutation = useMutation({
    mutationFn: (eventId: string) =>
      apiPostCalendarAgenda(eventId, undefined, onSessionExpired, onTokenRefresh),
    onSuccess: async () => {
      await invalidateList();
      toast.success("Повестка подготовлена");
    },
  });

  const addParticipantMutation = useMutation({
    mutationFn: ({ eventId, userId }: { eventId: string; userId: string }) =>
      apiAddCalendarParticipant(eventId, userId, onSessionExpired, onTokenRefresh),
    onSuccess: async () => {
      await invalidateList();
      setParticipantQuery("");
      setParticipantHits([]);
    },
  });

  const removeParticipantMutation = useMutation({
    mutationFn: ({ eventId, userId }: { eventId: string; userId: string }) =>
      apiRemoveCalendarParticipant(eventId, userId, onSessionExpired, onTokenRefresh),
    onSuccess: invalidateList,
  });

  const attachMutation = useMutation({
    mutationFn: ({
      eventId,
      documentId,
      role,
    }: {
      eventId: string;
      documentId: string;
      role: string;
    }) => apiAddCalendarAttachment(eventId, { documentId, role }, onSessionExpired, onTokenRefresh),
    onSuccess: async () => {
      await invalidateList();
      setAttachDocId("");
    },
  });

  const detachMutation = useMutation({
    mutationFn: ({ eventId, attachmentId }: { eventId: string; attachmentId: string }) =>
      apiRemoveCalendarAttachment(eventId, attachmentId, onSessionExpired, onTokenRefresh),
    onSuccess: invalidateList,
  });

  function openDetail(ev: CalendarEvent) {
    setSelectedEventId(ev.id);
    setEditMode(false);
    setForm({
      title: ev.title,
      attendees: ev.attendees.join(", "),
      description: ev.description ?? "",
      startLocal: isoToLocalDateTimeInput(ev.startIso),
      endLocal: isoToLocalDateTimeInput(ev.endIso),
    });
    setFormError("");
  }

  function handleSubmitCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const payload = toPayload(form);
    const validationError = validatePayload(payload);
    if (validationError) {
      setFormError(validationError);
      return;
    }
    createMutation.mutate(payload);
  }

  function handleSubmitEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedEventId) return;
    setFormError("");
    const payload = toPayload(form);
    const validationError = validatePayload(payload);
    if (validationError) {
      setFormError(validationError);
      return;
    }
    updateMutation.mutate({ id: selectedEventId, payload });
  }

  function handleDelete(id: string) {
    const confirmed = window.confirm("Удалить событие?");
    if (!confirmed) return;
    deleteMutation.mutate(id);
  }

  function navigatePeriod(delta: number) {
    const base = parseDateInput(selectedDate);
    if (viewMode === "day") {
      setSelectedDate(toDateInputValue(addDays(base, delta)));
    } else if (viewMode === "week") {
      setSelectedDate(toDateInputValue(addDays(base, delta * 7)));
    } else {
      const next = new Date(base.getFullYear(), base.getMonth() + delta, 1);
      setSelectedDate(toDateInputValue(next));
    }
  }

  const gridDays = useMemo(() => {
    if (viewMode === "day") return [startOfDayLocal(selectedDateObject)];
    if (viewMode === "week") {
      const { start } = getWeekRangeMonday(selectedDateObject);
      return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }
    return [];
  }, [selectedDateObject, viewMode]);

  const hours = useMemo(() => {
    const h: number[] = [];
    for (let i = START_HOUR; i < END_HOUR; i++) h.push(i);
    return h;
  }, []);

  const listError =
    eventsQuery.error instanceof Error ? mapApiErrorToMessage(eventsQuery.error.message) : "";

  const todayStart = startOfDayLocal(new Date()).getTime();

  async function handleFindSlots() {
    if (!detailEvent) return;
    setAvailabilityHint("");
    try {
      const emails = detailEvent.attendees;
      const res = await apiPostCalendarAvailability(
        {
          attendeeEmails: emails,
          fromIso: detailEvent.startIso,
          toIso: new Date(new Date(detailEvent.endIso).getTime() + 7 * DAY_MS).toISOString(),
          slotMinutes: 30,
        },
        onSessionExpired,
        onTokenRefresh,
      );
      setAvailabilityHint(
        res.slots
          .map((s) => `${formatDateTime(s.startIso)} — ${formatDateTime(s.endIso)}`)
          .join("\n"),
      );
    } catch (e) {
      setAvailabilityHint(e instanceof Error ? mapApiErrorToMessage(e.message) : "Ошибка");
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader title="Календарь" />
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-4 lg:flex-row">
        {/* Левая колонка: мини-навигация + создание */}
        <section className="flex w-full min-h-0 flex-col gap-3 rounded-lg border border-border bg-white p-3 lg:w-[300px] lg:shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigatePeriod(-1)}
              className="rounded-md border border-border bg-surface px-2 py-1 text-xs text-text"
              aria-label="Назад"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => navigatePeriod(1)}
              className="rounded-md border border-border bg-surface px-2 py-1 text-xs text-text"
              aria-label="Вперёд"
            >
              →
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              aria-label="Дата просмотра календаря"
              className="rounded-md border border-border bg-surface px-2 py-1.5 text-[12px] text-text outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {(["day", "week", "month"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setViewMode(m)}
                className={`rounded-md px-2 py-1 text-[11px] ${
                  viewMode === m ? "bg-primary text-white" : "bg-surface text-text"
                }`}
              >
                {m === "day" ? "День" : m === "week" ? "Неделя" : "Месяц"}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setComposeOpen((v) => !v)}
            className="text-left text-[12px] text-muted underline"
          >
            {composeOpen ? "Скрыть форму создания" : "Новое событие"}
          </button>

          {composeOpen && (
            <form className="grid gap-2 border-t border-border pt-2" onSubmit={handleSubmitCreate}>
              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Название"
                aria-label="Название события"
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-[13px] outline-none"
              />
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Описание"
                rows={2}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-[13px] outline-none"
              />
              <input
                value={form.attendees}
                onChange={(e) => setForm((p) => ({ ...p, attendees: e.target.value }))}
                placeholder="Участники (email через запятую)"
                aria-label="Участники события"
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-[13px] outline-none"
              />
              <label className="grid gap-1 text-xs text-muted">
                Начало
                <input
                  type="datetime-local"
                  value={form.startLocal}
                  onChange={(e) => setForm((p) => ({ ...p, startLocal: e.target.value }))}
                  aria-label="Начало события"
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-[13px] outline-none"
                />
              </label>
              <label className="grid gap-1 text-xs text-muted">
                Окончание
                <input
                  type="datetime-local"
                  value={form.endLocal}
                  onChange={(e) => setForm((p) => ({ ...p, endLocal: e.target.value }))}
                  aria-label="Окончание события"
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-[13px] outline-none"
                />
              </label>
              {formError && <p className="m-0 text-[12px] text-danger">{formError}</p>}
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="rounded-md border-0 bg-primary px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
              >
                Создать
              </button>
            </form>
          )}
        </section>

        {/* Центр: сетка или месячный список */}
        <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-white p-3">
          <header className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[12px] text-muted">
              Источник данных: локальный календарь DMIS
              {listRange
                ? ` · период ${new Date(listRange.from).toLocaleDateString("ru-RU")} — ${new Date(listRange.to).toLocaleDateString("ru-RU")}`
                : ""}
            </span>
          </header>

          {eventsQuery.isPending && <p className="m-0 text-[13px] text-muted">Загрузка…</p>}
          {!eventsQuery.isPending && listError && (
            <p className="m-0 text-[13px] text-danger">{listError}</p>
          )}

          {!eventsQuery.isPending && !listError && viewMode === "month" && (
            <ul className="m-0 max-h-[480px] list-none overflow-y-auto p-0">
              {visibleEvents.map((ev) => (
                <li key={ev.id}>
                  <button
                    type="button"
                    onClick={() => openDetail(ev)}
                    className="mb-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-left text-[13px]"
                  >
                    <span className="font-semibold">{ev.title}</span>
                    <span className="block text-[12px] text-muted">
                      {formatDateTime(ev.startIso)} — {formatDateTime(ev.endIso)}
                    </span>
                  </button>
                </li>
              ))}
              {visibleEvents.length === 0 && (
                <p className="m-0 text-[13px] text-muted">Нет событий в этом месяце.</p>
              )}
            </ul>
          )}

          {!eventsQuery.isPending && !listError && (viewMode === "day" || viewMode === "week") && (
            <div className="flex min-h-0 flex-1 overflow-auto">
              <div className="w-10 shrink-0 pt-6 text-[10px] text-muted">
                {hours.map((h) => (
                  <div
                    key={h}
                    style={{ height: HOUR_PX }}
                    className="border-t border-border/40 pr-1 text-right"
                  >
                    {String(h).padStart(2, "0")}:00
                  </div>
                ))}
              </div>
              <div
                className="grid flex-1 gap-0"
                style={{
                  gridTemplateColumns: `repeat(${gridDays.length}, minmax(0, 1fr))`,
                  minHeight: (END_HOUR - START_HOUR) * HOUR_PX,
                }}
              >
                {gridDays.map((day) => {
                  const isToday = startOfDayLocal(day).getTime() === todayStart;
                  const dayEvents = visibleEvents.filter((ev) => eventIntersectsDay(ev, day));
                  return (
                    <div
                      key={day.toISOString()}
                      className={`relative border-l border-border ${isToday ? "bg-primary-soft/30" : ""}`}
                    >
                      <div className="sticky top-0 z-10 border-b border-border bg-white px-1 py-1 text-center text-[11px] font-medium">
                        {day.toLocaleDateString("ru-RU", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </div>
                      <div
                        className="relative"
                        style={{ height: (END_HOUR - START_HOUR) * HOUR_PX }}
                      >
                        {hours.map((h) => (
                          <div
                            key={h}
                            style={{ height: HOUR_PX }}
                            className="border-b border-border/30"
                          />
                        ))}
                        {dayEvents.map((ev) => {
                          const bounds = eventStyleBounds(ev.startIso, ev.endIso, day);
                          if (!bounds) return null;
                          const active = ev.id === selectedEventId;
                          return (
                            <button
                              key={ev.id}
                              type="button"
                              onClick={() => openDetail(ev)}
                              style={{ top: bounds.top, height: bounds.height }}
                              className={`absolute left-0.5 right-0.5 overflow-hidden rounded border px-1 py-0.5 text-left text-[10px] leading-tight ${
                                active ? "border-primary bg-primary-soft" : "border-border bg-white"
                              }`}
                            >
                              <span className="block truncate font-semibold">{ev.title}</span>
                              <span className="block text-[9px] text-muted">
                                {formatDateTime(ev.startIso)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Правая панель: детали */}
        <section className="flex w-full min-h-0 flex-col gap-2 rounded-lg border border-border bg-white p-3 lg:w-[340px] lg:shrink-0">
          {!detailEvent && (
            <p className="m-0 text-[13px] text-muted">Выберите событие в сетке или списке.</p>
          )}
          {detailEvent && !editMode && (
            <div className="flex min-h-0 flex-col gap-2 overflow-y-auto">
              <h3 className="m-0 text-[15px] font-semibold">{detailEvent.title}</h3>
              <p className="m-0 text-[12px] text-muted">
                {formatDateTime(detailEvent.startIso)} — {formatDateTime(detailEvent.endIso)}
              </p>
              <p className="m-0 text-[11px] text-muted">
                Источник: {detailEvent.creationSource}
                {detailEvent.sourceMailMessageId
                  ? ` · письмо ${detailEvent.sourceMailMessageId}`
                  : ""}
              </p>
              {detailEvent.description && (
                <p className="m-0 whitespace-pre-wrap text-[13px] text-text">
                  {detailEvent.description}
                </p>
              )}
              <div>
                <p className="m-0 mb-1 text-[11px] font-medium text-muted">Участники</p>
                <ul className="m-0 list-none space-y-1 p-0">
                  {detailEvent.participants.map((p) => (
                    <li
                      key={`${p.email}-${p.userId ?? "ext"}`}
                      className="flex items-center justify-between gap-2 text-[12px]"
                    >
                      <span>
                        {p.displayName} ({p.email}) — {p.status}
                      </span>
                      {p.userId && (
                        <button
                          type="button"
                          className="text-[11px] text-danger"
                          onClick={() =>
                            removeParticipantMutation.mutate({
                              eventId: detailEvent.id,
                              userId: p.userId!,
                            })
                          }
                        >
                          ✕
                        </button>
                      )}
                    </li>
                  ))}
                  {detailEvent.participants.length === 0 && (
                    <li className="text-[12px] text-muted">
                      {detailEvent.attendees.join(", ") || "—"}
                    </li>
                  )}
                </ul>
              </div>
              <div>
                <p className="m-0 mb-1 text-[11px] font-medium text-muted">Документы</p>
                <ul className="m-0 list-none space-y-1 p-0">
                  {detailEvent.attachments.map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-2 text-[12px]">
                      <span>
                        {a.documentTitle} ({a.role})
                      </span>
                      <button
                        type="button"
                        className="text-[11px] text-danger"
                        onClick={() =>
                          detachMutation.mutate({ eventId: detailEvent.id, attachmentId: a.id })
                        }
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                  {detailEvent.attachments.length === 0 && (
                    <li className="text-[12px] text-muted">Нет вложений</li>
                  )}
                </ul>
              </div>

              <div className="grid gap-1 border-t border-border pt-2">
                <label className="text-[11px] text-muted">Добавить участника (поиск)</label>
                <input
                  value={participantQuery}
                  onChange={(e) => setParticipantQuery(e.target.value)}
                  placeholder="мин. 2 символа"
                  className="rounded-md border border-border px-2 py-1 text-[12px]"
                />
                {participantHits.length > 0 && (
                  <div className="max-h-28 overflow-y-auto rounded border border-border bg-surface">
                    {participantHits.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        className="block w-full px-2 py-1 text-left text-[12px] hover:bg-primary-soft"
                        onClick={() =>
                          addParticipantMutation.mutate({ eventId: detailEvent.id, userId: u.id })
                        }
                      >
                        {u.fullName} ({u.email})
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 border-t border-border pt-2">
                <input
                  value={attachDocId}
                  onChange={(e) => setAttachDocId(e.target.value)}
                  placeholder="ID документа"
                  className="min-w-0 flex-1 rounded-md border border-border px-2 py-1 text-[12px]"
                />
                <select
                  value={attachRole}
                  onChange={(e) => setAttachRole(e.target.value)}
                  className="rounded-md border border-border px-2 py-1 text-[12px]"
                >
                  <option value="AGENDA">Повестка</option>
                  <option value="MATERIALS">Материалы</option>
                  <option value="CONTRACT">Договор</option>
                  <option value="REPORT">Отчёт</option>
                </select>
                <button
                  type="button"
                  disabled={!attachDocId.trim()}
                  onClick={() =>
                    attachMutation.mutate({
                      eventId: detailEvent.id,
                      documentId: attachDocId.trim(),
                      role: attachRole,
                    })
                  }
                  className="rounded-md bg-primary px-2 py-1 text-[11px] text-white disabled:opacity-50"
                >
                  Прикрепить
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setComposeOpen(false);
                    setEditMode(true);
                  }}
                  className="rounded-md border border-border px-3 py-1.5 text-[12px]"
                >
                  Изменить / перенести
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(detailEvent.id)}
                  className="rounded-md border border-danger/40 px-3 py-1.5 text-[12px] text-danger"
                >
                  Удалить
                </button>
                <button
                  type="button"
                  disabled={agendaMutation.isPending}
                  onClick={() => agendaMutation.mutate(detailEvent.id)}
                  className="rounded-md border border-border px-3 py-1.5 text-[12px]"
                >
                  AI: повестка
                </button>
                <button
                  type="button"
                  onClick={handleFindSlots}
                  className="rounded-md border border-border px-3 py-1.5 text-[12px]"
                >
                  Свободные слоты
                </button>
              </div>
              {availabilityHint && (
                <pre className="mt-1 whitespace-pre-wrap rounded bg-surface p-2 text-[11px] text-text">
                  {availabilityHint}
                </pre>
              )}
            </div>
          )}

          {detailEvent && editMode && (
            <form className="grid gap-2" onSubmit={handleSubmitEdit}>
              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                aria-label="Название события"
                className="rounded-md border border-border px-3 py-2 text-[13px]"
              />
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={3}
                className="rounded-md border border-border px-3 py-2 text-[13px]"
              />
              <input
                value={form.attendees}
                onChange={(e) => setForm((p) => ({ ...p, attendees: e.target.value }))}
                placeholder="Участники"
                aria-label="Участники события"
                className="rounded-md border border-border px-3 py-2 text-[13px]"
              />
              <input
                type="datetime-local"
                value={form.startLocal}
                onChange={(e) => setForm((p) => ({ ...p, startLocal: e.target.value }))}
                aria-label="Начало события"
              />
              <input
                type="datetime-local"
                value={form.endLocal}
                onChange={(e) => setForm((p) => ({ ...p, endLocal: e.target.value }))}
                aria-label="Окончание события"
              />
              {formError && <p className="m-0 text-[12px] text-danger">{formError}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="rounded-md bg-primary px-3 py-2 text-xs text-white"
                >
                  Сохранить
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="rounded-md border border-border px-3 py-2 text-xs"
                >
                  Отмена
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
