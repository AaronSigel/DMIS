import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  apiCreateMailDraft,
  apiDownloadMailAttachment,
  apiForwardDraft,
  apiGetMailMessage,
  apiListMailMessages,
  apiMailThreadSummary,
  apiReplyDraft,
  apiSaveMailAttachmentToDocuments,
  apiSearchMailMessages,
  apiSendMailDraft,
  apiUpdateMailDraft,
  type ApiMailFolder,
} from "../../apiClient";
import { queryKeys } from "../../shared/api/queryClient";
import { useUiStore } from "../../shared/store/uiStore";
import { mapApiErrorToMessage } from "../../shared/lib/mapApiErrorToMessage";
import { timeAgo } from "../../shared/lib/timeAgo";
import { PageHeader } from "../../shared/ui/PageHeader";
import type { MailMessageSummary } from "../../entities/mail";

type MailPageProps = {
  token: string;
  onSessionExpired: () => void;
  onTokenRefresh: (token: string) => void;
};

const SEARCH_LIMIT = 50;
const SEARCH_DEBOUNCE_MS = 300;

const FOLDER_ITEMS: { id: ApiMailFolder; label: string }[] = [
  { id: "INBOX", label: "Входящие" },
  { id: "SENT", label: "Отправленные" },
  { id: "DRAFT", label: "Черновики" },
  { id: "ARCHIVE", label: "Архив" },
  { id: "ATTACHMENTS", label: "Вложения" },
];

function formatErrorMessage(err: unknown, fallback: string): string {
  if (err == null) return "";
  if (!(err instanceof Error)) return fallback;
  if (err.message === "Unauthorized") return "";
  return mapApiErrorToMessage(err.message) || fallback;
}

/** Невидимые символы и «;» вместо «,» — частая причина 553 SMTP при видимом корректном адресе. */
function normalizeMailRecipientInput(raw: string): string {
  return raw
    .trim()
    .replace(/\u00a0/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\r|\n/g, "")
    .replace(/;/g, ",")
    .trim();
}

/**
 * Префилл для AI-ассистента: отправка через intent → actions.
 */
function buildReplyPrefill(detail: { from: string; subject: string; body: string }): string {
  const trimmedBody = detail.body.trim();
  const limitedBody = trimmedBody.length > 1500 ? `${trimmedBody.slice(0, 1500)}…` : trimmedBody;
  return [
    `Ответь на письмо от ${detail.from}, тема "${detail.subject}".`,
    `Содержание письма:\n${limitedBody}`,
    "Сформируй вежливый, лаконичный ответ.",
  ].join("\n\n");
}

export function MailPage({ token, onSessionExpired, onTokenRefresh }: MailPageProps) {
  const queryClient = useQueryClient();
  const [folder, setFolder] = useState<ApiMailFolder>("INBOX");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const openAiWithQuery = useUiStore((state) => state.openAiWithQuery);

  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [composeDraftId, setComposeDraftId] = useState<string | null>(null);

  const [confirmSendOpen, setConfirmSendOpen] = useState(false);

  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryText, setSummaryText] = useState<string | null>(null);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedQuery(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  const listQuery = useQuery({
    queryKey: queryKeys.mail.list(folder),
    queryFn: () => apiListMailMessages(folder, onSessionExpired, onTokenRefresh),
    enabled: !!token && !debouncedQuery,
  });

  const searchQuery = useQuery({
    queryKey: queryKeys.mail.search(debouncedQuery, folder),
    queryFn: () =>
      apiSearchMailMessages(
        { query: debouncedQuery, limit: SEARCH_LIMIT, folder },
        onSessionExpired,
        onTokenRefresh,
      ),
    enabled: !!token && !!debouncedQuery,
  });

  const detailQuery = useQuery({
    queryKey: selectedId ? queryKeys.mail.detail(selectedId) : ["mail", "detail", "none"],
    queryFn: () => apiGetMailMessage(selectedId ?? "", onSessionExpired, onTokenRefresh),
    enabled: !!token && !!selectedId,
  });

  const isSearching = !!debouncedQuery;
  const messages: MailMessageSummary[] = useMemo(() => {
    if (isSearching) return searchQuery.data?.messages ?? [];
    return listQuery.data ?? [];
  }, [isSearching, listQuery.data, searchQuery.data?.messages]);

  const selectedSummary = useMemo(
    () => messages.find((m) => m.id === selectedId) ?? null,
    [messages, selectedId],
  );

  useEffect(() => {
    if (!selectedId) return;
    if (!messages.some((message) => message.id === selectedId)) {
      setSelectedId(null);
    }
  }, [messages, selectedId]);

  const listError = isSearching
    ? formatErrorMessage(searchQuery.error, "Не удалось выполнить поиск")
    : formatErrorMessage(listQuery.error, "Не удалось загрузить письма");
  const listLoading = isSearching ? searchQuery.isPending : listQuery.isPending;

  const detailError = formatErrorMessage(detailQuery.error, "Не удалось загрузить письмо");
  const detail = detailQuery.data;

  const invalidateMail = () => {
    void queryClient.invalidateQueries({ queryKey: ["mail"] });
  };

  const replyMutation = useMutation({
    mutationFn: () => apiReplyDraft(selectedId ?? "", onSessionExpired, onTokenRefresh),
    onSuccess: (draft) => {
      invalidateMail();
      setFolder("DRAFT");
      setSelectedId(draft.id);
      setComposeDraftId(draft.id);
      setComposeTo(draft.to);
      setComposeSubject(draft.subject);
      setComposeBody(draft.body);
      setComposeOpen(true);
    },
  });

  const forwardMutation = useMutation({
    mutationFn: () => apiForwardDraft(selectedId ?? "", onSessionExpired, onTokenRefresh),
    onSuccess: (draft) => {
      invalidateMail();
      setFolder("DRAFT");
      setSelectedId(draft.id);
      setComposeDraftId(draft.id);
      setComposeTo(draft.to);
      setComposeSubject(draft.subject);
      setComposeBody(draft.body);
      setComposeOpen(true);
    },
  });

  const summaryMutation = useMutation({
    mutationFn: () => apiMailThreadSummary(selectedId ?? "", [], onSessionExpired, onTokenRefresh),
    onSuccess: (res) => {
      setSummaryText(res.summary);
      setSummaryOpen(true);
    },
  });

  const saveToDocsMutation = useMutation({
    mutationFn: ({ partId, fileName }: { partId: string; fileName: string }) =>
      apiSaveMailAttachmentToDocuments(
        selectedId ?? "",
        partId,
        fileName,
        onSessionExpired,
        onTokenRefresh,
      ),
  });

  function handleReplyWithAi() {
    if (!detail) return;
    openAiWithQuery(buildReplyPrefill(detail));
  }

  function openNewCompose() {
    setComposeDraftId(null);
    setComposeTo("");
    setComposeSubject("");
    setComposeBody("");
    setComposeOpen(true);
  }

  function openEditDraftFromDetail() {
    if (!detail || !selectedSummary?.draft) return;
    setComposeDraftId(detail.id);
    setComposeTo(detail.to);
    setComposeSubject(detail.subject);
    setComposeBody(detail.body);
    setComposeOpen(true);
  }

  async function handleSaveCompose() {
    const to = normalizeMailRecipientInput(composeTo);
    if (composeDraftId) {
      await apiUpdateMailDraft(
        composeDraftId,
        { to, subject: composeSubject, body: composeBody },
        onSessionExpired,
        onTokenRefresh,
      );
    } else {
      const created = await apiCreateMailDraft(
        { to, subject: composeSubject, body: composeBody },
        onSessionExpired,
        onTokenRefresh,
      );
      setComposeDraftId(created.id);
    }
    invalidateMail();
  }

  async function handleConfirmSend() {
    const to = normalizeMailRecipientInput(composeTo);
    let id = composeDraftId;
    if (!id) {
      const created = await apiCreateMailDraft(
        { to, subject: composeSubject, body: composeBody },
        onSessionExpired,
        onTokenRefresh,
      );
      id = created.id;
      setComposeDraftId(id);
    }
    await apiSendMailDraft(id, onSessionExpired, onTokenRefresh);
    setConfirmSendOpen(false);
    setComposeOpen(false);
    setComposeDraftId(null);
    invalidateMail();
    setFolder("SENT");
  }

  async function handleDownloadPart(partId: string, fileName: string) {
    const blob = await apiDownloadMailAttachment(
      selectedId ?? "",
      partId,
      onSessionExpired,
      onTokenRefresh,
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title="Почта"
        actions={
          !listLoading && (
            <span className="text-xs text-muted">
              {isSearching ? `Найдено: ${messages.length}` : `Писем: ${messages.length}`}
            </span>
          )
        }
      />
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-4 lg:flex-row">
        <nav
          aria-label="Папки"
          className="flex shrink-0 flex-row flex-wrap gap-1 lg:w-[148px] lg:flex-col"
        >
          {FOLDER_ITEMS.map((item) => {
            const active = folder === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setFolder(item.id);
                  setSelectedId(null);
                }}
                className={`rounded-md px-2 py-1.5 text-left text-[13px] ${
                  active ? "bg-primary-soft font-medium text-text" : "text-muted hover:bg-surface"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <section
          aria-label="Список писем"
          className="flex w-full min-h-0 flex-col gap-2 rounded-lg border border-border bg-white p-3 lg:w-[320px] lg:shrink-0 xl:w-[360px]"
        >
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={openNewCompose}
              className="rounded-md border-0 bg-primary px-3 py-2 text-left text-xs font-semibold text-white"
            >
              Написать
            </button>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Поиск по письмам…"
              aria-label="Поиск писем"
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-[13px] outline-none"
            />
          </div>
          <div className="flex-1 overflow-y-auto" role="list" aria-label="Письма">
            {listLoading && <p className="m-0 px-1 py-2 text-[13px] text-muted">Загрузка писем…</p>}
            {!listLoading && listError && (
              <p className="m-0 px-1 py-2 text-[13px] text-danger">{listError}</p>
            )}
            {!listLoading && !listError && messages.length === 0 && (
              <p className="m-0 px-1 py-2 text-[13px] text-muted">
                {isSearching ? "Письма не найдены." : "Папка пуста."}
              </p>
            )}
            {!listLoading && !listError && messages.length > 0 && (
              <ul className="m-0 flex list-none flex-col gap-1 p-0">
                {messages.map((message) => {
                  const active = message.id === selectedId;
                  return (
                    <li key={message.id} role="listitem">
                      <button
                        type="button"
                        onClick={() => setSelectedId(message.id)}
                        aria-pressed={active}
                        className={`flex w-full flex-col items-start gap-1 rounded-md border border-transparent px-2 py-2 text-left text-[13px] ${
                          active
                            ? "border-primary bg-primary-soft text-text"
                            : "bg-transparent text-text hover:bg-surface"
                        }`}
                      >
                        <span className="flex w-full items-center justify-between gap-2">
                          <span className="truncate font-medium">
                            {message.draft ? "Черновик → " : ""}
                            {message.from || "—"}
                          </span>
                          <span className="shrink-0 text-[11px] text-muted">
                            {timeAgo(message.sentAtIso)}
                          </span>
                        </span>
                        <span className="line-clamp-1 w-full break-words text-[13px] text-text">
                          {message.subject || "(без темы)"}
                          {message.hasAttachments ? " 📎" : ""}
                        </span>
                        <span className="line-clamp-2 w-full break-words text-[12px] text-muted">
                          {message.preview}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <section
          aria-label="Просмотр письма"
          className="flex min-h-0 flex-1 flex-col gap-2 rounded-lg border border-border bg-white p-4"
        >
          {!selectedId && (
            <p className="m-0 text-[13px] text-muted">
              Выберите письмо слева, чтобы открыть его содержимое.
            </p>
          )}
          {selectedId && detailQuery.isPending && (
            <p className="m-0 text-[13px] text-muted">Загрузка письма…</p>
          )}
          {selectedId && !detailQuery.isPending && detailError && (
            <p className="m-0 text-[13px] text-danger">{detailError}</p>
          )}
          {selectedId && !detailQuery.isPending && !detailError && detail && (
            <article className="flex h-full min-h-0 flex-col gap-3">
              <div className="flex flex-wrap gap-2 border-b border-border pb-2">
                {!selectedSummary?.draft && (
                  <>
                    <button
                      type="button"
                      disabled={replyMutation.isPending}
                      onClick={() => replyMutation.mutate()}
                      className="rounded-md border border-border bg-white px-2 py-1 text-[12px] font-medium text-text"
                    >
                      Ответить
                    </button>
                    <button
                      type="button"
                      onClick={handleReplyWithAi}
                      aria-label="Ответить на письмо через AI-ассистента"
                      className="rounded-md border border-border bg-white px-2 py-1 text-[12px] font-medium text-text"
                    >
                      Ответить через AI
                    </button>
                    <button
                      type="button"
                      disabled={forwardMutation.isPending}
                      onClick={() => forwardMutation.mutate()}
                      className="rounded-md border border-border bg-white px-2 py-1 text-[12px] font-medium text-text"
                    >
                      Переслать
                    </button>
                    <Link
                      to={`/calendar?mailMessageId=${encodeURIComponent(selectedId)}&mailbox=${encodeURIComponent(folder)}`}
                      className="inline-flex items-center rounded-md border border-border bg-white px-2 py-1 text-[12px] font-medium text-text no-underline hover:bg-surface"
                    >
                      Создать встречу
                    </Link>
                  </>
                )}
                {selectedSummary?.draft && (
                  <button
                    type="button"
                    onClick={openEditDraftFromDetail}
                    className="rounded-md border border-border bg-white px-2 py-1 text-[12px] font-medium text-text"
                  >
                    Редактировать черновик
                  </button>
                )}
                <button
                  type="button"
                  disabled={summaryMutation.isPending || !!selectedSummary?.draft}
                  onClick={() => summaryMutation.mutate()}
                  className="rounded-md border border-border bg-white px-2 py-1 text-[12px] font-medium text-text disabled:opacity-50"
                >
                  Кратко пересказать
                </button>
              </div>

              <header className="flex flex-col gap-1">
                <h3 className="m-0 text-lg font-semibold text-text">
                  {detail.subject || "(без темы)"}
                </h3>
                <p className="m-0 text-[12px] text-muted">
                  От: <span className="text-text">{detail.from}</span>
                </p>
                <p className="m-0 text-[12px] text-muted">
                  Кому: <span className="text-text">{detail.to}</span>
                </p>
                <p className="m-0 text-[11px] text-muted">{timeAgo(detail.sentAtIso)}</p>
              </header>

              {detail.attachments.length > 0 && (
                <div className="rounded-md border border-border bg-surface px-3 py-2">
                  <p className="m-0 mb-2 text-[12px] font-medium text-text">Вложения</p>
                  <ul className="m-0 flex list-none flex-col gap-2 p-0">
                    {detail.attachments.map((att) => (
                      <li
                        key={att.partId}
                        className="flex flex-wrap items-center gap-2 text-[12px]"
                      >
                        <span className="truncate text-text">{att.fileName}</span>
                        <button
                          type="button"
                          className="rounded border border-border px-2 py-0.5 text-[11px]"
                          onClick={() => void handleDownloadPart(att.partId, att.fileName)}
                        >
                          Скачать
                        </button>
                        <button
                          type="button"
                          disabled={saveToDocsMutation.isPending}
                          className="rounded border border-border px-2 py-0.5 text-[11px]"
                          onClick={() =>
                            saveToDocsMutation.mutate(
                              { partId: att.partId, fileName: att.fileName },
                              {
                                onSuccess: () => invalidateMail(),
                              },
                            )
                          }
                        >
                          В документы
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap break-words rounded-md border border-border bg-surface px-3 py-2 text-[13px] text-text">
                {detail.body || "(пустое тело письма)"}
              </div>
            </article>
          )}
        </section>
      </div>

      {composeOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="compose-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-white p-4 shadow-lg">
            <h2 id="compose-title" className="m-0 mb-3 text-lg font-semibold">
              Новое письмо
            </h2>
            <label className="mb-2 block text-[12px] text-muted">
              Кому
              <input
                value={composeTo}
                onChange={(e) => setComposeTo(e.target.value)}
                className="mt-1 w-full rounded-md border border-border px-2 py-1.5 text-[13px]"
                placeholder="email@example.com"
              />
            </label>
            <label className="mb-2 block text-[12px] text-muted">
              Тема
              <input
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                className="mt-1 w-full rounded-md border border-border px-2 py-1.5 text-[13px]"
              />
            </label>
            <label className="mb-3 block text-[12px] text-muted">
              Текст
              <textarea
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                rows={8}
                className="mt-1 w-full rounded-md border border-border px-2 py-1.5 text-[13px]"
              />
            </label>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="rounded-md border border-border px-3 py-1.5 text-[12px]"
                onClick={() => setComposeOpen(false)}
              >
                Отмена
              </button>
              <button
                type="button"
                className="rounded-md border border-border bg-surface px-3 py-1.5 text-[12px] font-medium"
                onClick={() => void handleSaveCompose()}
              >
                Сохранить черновик
              </button>
              <button
                type="button"
                className="rounded-md bg-primary px-3 py-1.5 text-[12px] font-semibold text-white"
                onClick={() => setConfirmSendOpen(true)}
              >
                Отправить…
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmSendOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="alertdialog"
        >
          <div className="w-full max-w-sm rounded-lg border border-border bg-white p-4 shadow-lg">
            <p className="m-0 mb-3 text-[13px] text-text">
              Отправить письмо? Это действие нельзя отменить.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded-md border border-border px-3 py-1.5 text-[12px]"
                onClick={() => setConfirmSendOpen(false)}
              >
                Нет
              </button>
              <button
                type="button"
                className="rounded-md bg-primary px-3 py-1.5 text-[12px] font-semibold text-white"
                onClick={() => void handleConfirmSend()}
              >
                Да, отправить
              </button>
            </div>
          </div>
        </div>
      )}

      {summaryOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-white p-4 shadow-lg">
            <h3 className="m-0 mb-2 text-base font-semibold">Краткий пересказ</h3>
            <div className="whitespace-pre-wrap text-[13px] text-text">{summaryText}</div>
            <button
              type="button"
              className="mt-3 rounded-md border border-border px-3 py-1.5 text-[12px]"
              onClick={() => setSummaryOpen(false)}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
