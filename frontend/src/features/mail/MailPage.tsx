import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { apiGetMailMessage, apiListMailMessages, apiSearchMailMessages } from "../../apiClient";
import { queryKeys } from "../../shared/api/queryClient";
import { useUiStore } from "../../shared/store/uiStore";
import { mapApiErrorToMessage } from "../../shared/lib/mapApiErrorToMessage";
import { timeAgo } from "../../shared/lib/timeAgo";
import type { MailMessageSummary } from "../../entities/mail";

type MailPageProps = {
  token: string;
  onSessionExpired: () => void;
  onTokenRefresh: (token: string) => void;
};

const SEARCH_LIMIT = 50;
const SEARCH_DEBOUNCE_MS = 300;

function formatErrorMessage(err: unknown, fallback: string): string {
  if (err == null) return "";
  if (!(err instanceof Error)) return fallback;
  if (err.message === "Unauthorized") return "";
  return mapApiErrorToMessage(err.message) || fallback;
}

/**
 * Префилл текста для AI-ассистента: реальная отправка письма произойдет через
 * existing flow `intent → entities → ACL → draft → confirmation → execution → audit`.
 * Тело письма обрезаем, чтобы не раздувать контекст и не упереться в лимиты модели.
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
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const openAiWithQuery = useUiStore((state) => state.openAiWithQuery);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedQuery(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  const listQuery = useQuery({
    queryKey: queryKeys.mail.list,
    queryFn: () => apiListMailMessages(onSessionExpired, onTokenRefresh),
    enabled: !!token && !debouncedQuery,
  });

  const searchQuery = useQuery({
    queryKey: queryKeys.mail.search(debouncedQuery),
    queryFn: () =>
      apiSearchMailMessages(
        { query: debouncedQuery, limit: SEARCH_LIMIT },
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

  // Снимаем выделение, если выбранное письмо больше не в текущем наборе (например, после поиска).
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

  function handleReplyWithAi() {
    if (!detail) return;
    openAiWithQuery(buildReplyPrefill(detail));
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 p-4 md:flex-row">
      <section
        aria-label="Список писем"
        className="flex w-full min-h-0 flex-col gap-2 rounded-lg border border-border bg-white p-3 md:w-[360px] md:shrink-0"
      >
        <header className="flex items-center justify-between gap-2">
          <h2 className="m-0 text-base font-semibold text-text">Почта</h2>
          {!listLoading && (
            <span className="text-xs text-muted">
              {isSearching ? `Найдено: ${messages.length}` : `Писем: ${messages.length}`}
            </span>
          )}
        </header>
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Поиск по письмам…"
          aria-label="Поиск писем"
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-[13px] outline-none"
        />
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
                        <span className="truncate font-medium">{message.from}</span>
                        <span className="shrink-0 text-[11px] text-muted">
                          {timeAgo(message.sentAtIso)}
                        </span>
                      </span>
                      <span className="line-clamp-1 w-full break-words text-[13px] text-text">
                        {message.subject}
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
            <div className="flex-1 overflow-y-auto whitespace-pre-wrap break-words rounded-md border border-border bg-surface px-3 py-2 text-[13px] text-text">
              {detail.body || "(пустое тело письма)"}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleReplyWithAi}
                aria-label="Ответить на письмо через AI-ассистента"
                className="rounded-md border-0 bg-primary px-3 py-2 text-xs font-semibold text-white"
              >
                Ответить через AI
              </button>
            </div>
          </article>
        )}
      </section>
    </div>
  );
}
