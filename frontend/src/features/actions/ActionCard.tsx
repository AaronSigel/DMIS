import { useEffect, useMemo, useState } from "react";
import {
  apiCancelAction,
  apiConfirmAction,
  apiGetDocumentTags,
  apiGetDocumentTitle,
} from "../../apiClient";
import { useToast } from "../../shared/ui/ToastProvider";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { ConfirmDialog } from "../../shared/ui/ConfirmDialog";
import { localizeIntent } from "../../shared/lib/localizeDomain";
import { formatDateTime } from "../../shared/lib/formatDate";
import type {
  ActionCardEntities,
  ActionStatus,
  CreateCalendarEventEntities,
  PrepareMeetingAgendaEntities,
  RescheduleCalendarEventEntities,
  SendEmailEntities,
  SuggestMeetingSlotsEntities,
  UpdateDocumentTagsEntities,
} from "../../shared/api/schemas/action";

type UnknownEntities = Record<string, unknown>;

type ActionCardProps = {
  id: string;
  intent: string;
  status: ActionStatus;
  entities: ActionCardEntities;
  onSessionExpired?: () => void;
  onTokenRefresh?: (token: string) => void;
  onStatusChange?: (status: ActionStatus) => void;
};

function renderValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  const str = String(value);
  // Uses local timezone (not UTC) so times display correctly for the user's region
  if (/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T/.test(str)) return formatDateTime(str);
  return str;
}

function fieldTestId(label: string): string | undefined {
  switch (label) {
    case "Кому":
      return "action-recipient";
    case "Тема":
      return "action-subject";
    case "Текст":
      return "action-body";
    default:
      return undefined;
  }
}

function renderKnownIntentFields(
  intent: string,
  entities: ActionCardEntities,
  documentTitle?: string,
) {
  if (intent === "send_email") {
    const email = entities as SendEmailEntities & { attachmentDocumentIds?: string[] };
    const fields = [
      { label: "Кому", value: email.to },
      { label: "Тема", value: email.subject },
      { label: "Текст", value: email.body },
    ];
    const attachments = email.attachmentDocumentIds ?? [];
    if (attachments.length > 0) {
      fields.push({ label: "Вложения", value: attachments.join(", ") });
    }
    return fields;
  }

  if (intent === "create_calendar_event") {
    const event = entities as CreateCalendarEventEntities;
    return [
      { label: "Событие", value: event.title },
      { label: "Участники", value: event.attendees },
      { label: "Начало", value: event.startIso },
      { label: "Окончание", value: event.endIso },
    ];
  }

  if (intent === "update_document_tags") {
    const tags = entities as UpdateDocumentTagsEntities;
    return [
      { label: "Документ", value: documentTitle || tags.documentId },
      { label: "Теги", value: tags.tags },
    ];
  }

  if (intent === "reschedule_calendar_event") {
    const r = entities as RescheduleCalendarEventEntities;
    return [
      { label: "Событие (id)", value: r.eventId },
      { label: "Название", value: r.title },
      { label: "Начало", value: r.startIso },
      { label: "Окончание", value: r.endIso },
    ];
  }

  if (intent === "prepare_meeting_agenda") {
    const a = entities as PrepareMeetingAgendaEntities;
    return [
      { label: "Событие (id)", value: a.eventId },
      { label: "Доп. документы", value: a.extraDocumentIds },
    ];
  }

  if (intent === "suggest_meeting_slots") {
    const s = entities as SuggestMeetingSlotsEntities;
    return [
      { label: "Участники", value: s.attendeeEmails },
      { label: "Окно с", value: s.fromIso },
      { label: "Окно по", value: s.toIso },
      { label: "Длина слота (мин)", value: s.slotMinutes },
    ];
  }

  return Object.entries(entities as UnknownEntities).map(([key, value]) => ({
    label: key,
    value,
  }));
}

export function ActionCard({
  id,
  intent,
  status,
  entities,
  onSessionExpired,
  onTokenRefresh,
  onStatusChange,
}: ActionCardProps) {
  const toast = useToast();
  const [localStatus, setLocalStatus] = useState(status);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPending, setConfirmPending] = useState(false);
  const [cancelPending, setCancelPending] = useState(false);
  const [actionError, setActionError] = useState("");
  const [currentTags, setCurrentTags] = useState<string[] | null>(null);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [tagsError, setTagsError] = useState("");
  const [documentTitle, setDocumentTitle] = useState<string>("");

  useEffect(() => {
    setLocalStatus(status);
  }, [status]);

  useEffect(() => {
    onStatusChange?.(localStatus);
  }, [localStatus, onStatusChange]);

  const updateTagsEntities =
    intent === "update_document_tags" ? (entities as UpdateDocumentTagsEntities) : null;
  const documentId = updateTagsEntities?.documentId?.trim() ?? "";
  const draftTags = useMemo(
    () => [...new Set((updateTagsEntities?.tags ?? []).map((tag) => tag.trim()).filter(Boolean))],
    [updateTagsEntities?.tags],
  );

  useEffect(() => {
    if (intent !== "update_document_tags" || !documentId) return;
    setTagsLoading(true);
    setTagsError("");
    void apiGetDocumentTags(documentId, onSessionExpired ?? (() => {}), onTokenRefresh)
      .then((tags) => setCurrentTags(tags))
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : "Не удалось загрузить текущие теги";
        setTagsError(message);
      })
      .finally(() => setTagsLoading(false));
  }, [documentId, intent, onSessionExpired, onTokenRefresh]);

  useEffect(() => {
    if (intent !== "update_document_tags" || !documentId) return;
    void apiGetDocumentTitle(documentId, onSessionExpired ?? (() => {}), onTokenRefresh)
      .then((result) => setDocumentTitle(result.title))
      .catch(() => setDocumentTitle(""));
  }, [documentId, intent, onSessionExpired, onTokenRefresh]);

  const tagDiff = useMemo(() => {
    if (!currentTags) return null;
    const current = [...new Set(currentTags.map((tag) => tag.trim()).filter(Boolean))];
    const currentSet = new Set(current);
    const draftSet = new Set(draftTags);

    const added = draftTags.filter((tag) => !currentSet.has(tag));
    const removed = current.filter((tag) => !draftSet.has(tag));
    const unchanged = draftTags.filter((tag) => currentSet.has(tag));

    return { added, removed, unchanged };
  }, [currentTags, draftTags]);

  async function handleConfirmAction() {
    setConfirmPending(true);
    setActionError("");
    try {
      const confirmed = await apiConfirmAction(id, onSessionExpired ?? (() => {}), onTokenRefresh);
      setLocalStatus(confirmed.status);
      setConfirmOpen(false);
      toast.success(
        confirmed.status === "EXECUTED" ? "Действие выполнено." : "Действие подтверждено.",
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не удалось подтвердить действие";
      setActionError(message);
      toast.error(message);
    } finally {
      setConfirmPending(false);
    }
  }

  async function handleCancelAction() {
    setCancelPending(true);
    setActionError("");
    try {
      const cancelled = await apiCancelAction(id, onSessionExpired ?? (() => {}), onTokenRefresh);
      setLocalStatus(cancelled.status);
      toast.info("Черновик действия отменен.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не удалось отменить действие";
      setActionError(message);
      toast.error(message);
    } finally {
      setCancelPending(false);
    }
  }

  const fields = renderKnownIntentFields(intent, entities, documentTitle);

  return (
    <div
      data-testid="action-draft-card"
      data-action-id={id}
      className="rounded-lg border border-border bg-white px-[10px] py-2"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="m-0 text-[11px] text-muted">Действие: {localizeIntent(intent)}</p>
        <span data-testid="action-status">
          <StatusBadge status={localStatus} />
        </span>
      </div>
      <div className="grid gap-1.5">
        {fields.map((field) => (
          <div
            key={`${id}-${field.label}`}
            data-testid={
              field.label === "Вложения" ? "action-attachment" : fieldTestId(field.label)
            }
            className="rounded-md bg-surface px-2 py-1.5"
          >
            <p className="m-0 text-[10px] uppercase tracking-[0.06em] text-muted">{field.label}</p>
            <p className="m-0 break-words text-[12px] text-text">{renderValue(field.value)}</p>
          </div>
        ))}
        {intent === "update_document_tags" && (
          <div className="rounded-md border border-border bg-white px-2 py-1.5">
            <p className="m-0 text-[10px] uppercase tracking-[0.06em] text-muted">
              Изменение тегов
            </p>
            {tagsLoading && <p className="m-0 text-[12px] text-muted">Загрузка текущих тегов…</p>}
            {!tagsLoading && tagsError && (
              <p className="m-0 text-[12px] text-danger">{tagsError}</p>
            )}
            {!tagsLoading && !tagsError && tagDiff && (
              <div className="grid gap-1">
                <p className="m-0 text-[12px] text-text">Добавить: {renderValue(tagDiff.added)}</p>
                <p className="m-0 text-[12px] text-text">Удалить: {renderValue(tagDiff.removed)}</p>
                <p className="m-0 text-[12px] text-text">
                  Оставить: {renderValue(tagDiff.unchanged)}
                </p>
              </div>
            )}
          </div>
        )}
        {actionError && <p className="m-0 text-[12px] text-danger">{actionError}</p>}
      </div>
      {localStatus === "DRAFT" && (
        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            data-testid="action-cancel-button"
            onClick={() => void handleCancelAction()}
            disabled={cancelPending || confirmPending}
            className="rounded-md border border-border bg-white px-3 py-1.5 text-xs text-text disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelPending ? "Отмена…" : "Отменить"}
          </button>
          <button
            type="button"
            data-testid="action-confirm-button"
            onClick={() => setConfirmOpen(true)}
            disabled={cancelPending}
            className="rounded-md border border-primary/40 bg-primary px-3 py-1.5 text-xs text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Подтвердить
          </button>
        </div>
      )}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleConfirmAction}
        title="Подтвердить действие"
        description="После подтверждения действие перейдет в статус «подтверждено»."
        confirmText="Подтвердить"
        cancelText="Отмена"
        pending={confirmPending}
      />
    </div>
  );
}
