import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import {
  apiBaseUrl,
  apiDeleteDocument,
  apiGetDocumentDownloadUrl,
  apiListDocuments,
  apiSearchDocuments,
  apiUploadDocumentWithProgress,
  apiUpdateDocument,
  fetchWithAuth,
  readApiError,
} from "../../apiClient";
import { queryKeys } from "../../shared/api/queryClient";
import { useUiStore } from "../../shared/store/uiStore";
import { ConfirmDialog } from "../../shared/ui/ConfirmDialog";
import { useToast } from "../../shared/ui/ToastProvider";
import { Avatar } from "../../shared/ui/Avatar";
import { PageHeader } from "../../shared/ui/PageHeader";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { TopBarBtn } from "../../shared/ui/TopBarBtn";
import { smallBtnClass } from "../../shared/ui/smallBtnClass";
import { mapApiErrorToMessage } from "../../shared/lib/mapApiErrorToMessage";
import { sectionTitle } from "../../shared/lib/sectionTitle";
import { timeAgo } from "../../shared/lib/timeAgo";
import { RenameDocumentModal } from "./documentUi";
import type { DocumentView } from "../../entities/document";
import type { SearchHitView } from "../../entities/search";

type UserLite = {
  id: string;
  fullName: string;
  email: string;
  nickname?: string | null;
  roles?: string[];
};

type DocTableProps = {
  token: string;
  user: UserLite;
  onSessionExpired: () => void;
  onTokenRefresh: (t: string) => void;
  section: string;
  uploadTrigger: number;
  searchQuery?: string;
};

function docIcon(doc: DocumentView): string {
  const t = doc.title.toLowerCase();
  if (t.includes("transcript") || doc.type?.toLowerCase() === "transcript") return "🎤";
  if (doc.tags?.includes("restricted")) return "🔒";
  return "📄";
}

function docAcl(doc: DocumentView): string {
  if (doc.tags?.includes("public")) return "публичный";
  if (doc.tags?.includes("restricted")) return "ограниченный";
  return "команда";
}

type UploadItem = {
  id: string;
  name: string;
  progress: number;
  status: "queued" | "uploading" | "done" | "error";
  error?: string;
};

type SearchResultGroup = {
  documentId: string;
  documentTitle: string;
  bestScore: number;
  hits: SearchHitView[];
};

function groupSearchHits(hits: SearchHitView[]): SearchResultGroup[] {
  const byDocument = new Map<string, SearchResultGroup>();
  for (const hit of hits) {
    const current = byDocument.get(hit.documentId);
    if (!current) {
      byDocument.set(hit.documentId, {
        documentId: hit.documentId,
        documentTitle: hit.documentTitle,
        bestScore: hit.score,
        hits: [hit],
      });
      continue;
    }
    current.hits.push(hit);
    current.bestScore = Math.max(current.bestScore, hit.score);
  }
  return [...byDocument.values()].sort((a, b) => b.bestScore - a.bestScore);
}

function HighlightedSearchText({ text, query }: { text: string; query: string }) {
  const needle = query.trim();
  if (!needle) return <>{text}</>;

  const lowerText = text.toLowerCase();
  const lowerNeedle = needle.toLowerCase();
  const parts: ReactNode[] = [];
  let cursor = 0;
  let matchIndex = lowerText.indexOf(lowerNeedle);

  while (matchIndex >= 0) {
    if (matchIndex > cursor) {
      parts.push(text.slice(cursor, matchIndex));
    }
    const matchEnd = matchIndex + needle.length;
    parts.push(
      <mark key={`${matchIndex}-${matchEnd}`} className="rounded bg-[#fff3bf] px-0.5 text-text">
        {text.slice(matchIndex, matchEnd)}
      </mark>,
    );
    cursor = matchEnd;
    matchIndex = lowerText.indexOf(lowerNeedle, cursor);
  }

  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return <>{parts}</>;
}

// @visibleForTesting
export function UploadPipeline({ status }: { status: string }) {
  const STAGES = [
    { key: "uploaded", label: "Загружен" },
    { key: "extracting", label: "Извлекается текст" },
    { key: "indexing", label: "Индексируется" },
    { key: "indexed", label: "Проиндексирован" },
  ] as const;

  // currentIdx: which step is currently active (0-based)
  // For client-side upload status "done": step 0 (Загружен) is current, rest pending
  // Future: map backend statuses here when API provides them
  const currentIdx = 0; // upload "done" always means step 0 is reached

  return (
    <div
      role="status"
      aria-label={`Статус загрузки: ${STAGES[currentIdx]?.label ?? ""}`}
      className="flex flex-wrap items-center gap-1 text-[11px]"
    >
      {STAGES.map((stage, idx) => {
        const isCurrent = idx === currentIdx;
        const isPast = idx < currentIdx;
        const isPending = idx > currentIdx;
        return (
          <span key={stage.key} className="flex items-center gap-1">
            {idx > 0 && (
              <span className="text-muted" aria-hidden="true">
                →
              </span>
            )}
            <span
              data-step-current={isCurrent ? true : undefined}
              className={
                isCurrent
                  ? "rounded bg-primary/10 px-1.5 py-0.5 font-medium text-primary"
                  : isPast
                    ? "text-text"
                    : "text-muted"
              }
            >
              {isPast && (
                <span aria-hidden="true" className="mr-0.5">
                  ✓
                </span>
              )}
              {stage.label}
            </span>
          </span>
        );
      })}
    </div>
  );
}

/** Тег API для фильтрации списка по «разделу» сайдбара. */
function tagForSection(section: string): string | undefined {
  if (section === "pinned") return "pinned";
  if (section === "transcripts") return "transcript";
  if (section === "contracts") return "contract";
  if (section === "memos") return "memo";
  if (section === "reports") return "report";
  return undefined;
}

function formatQueryOrMutationError(err: unknown): string {
  if (!(err instanceof Error)) return "";
  if (err.message === "Unauthorized") return "";
  return mapApiErrorToMessage(err.message);
}

const docTableQuerySchema = z.object({
  archive: z.preprocess((value) => {
    if (value === "1" || value === "true") return true;
    if (value === "0" || value === "false") return false;
    return undefined;
  }, z.boolean().optional()),
  sort: z.enum(["newest", "oldest"]).optional(),
  page: z.preprocess((value) => {
    if (typeof value !== "string") return undefined;
    if (value.trim() === "") return undefined;
    const num = Number(value);
    if (!Number.isFinite(num)) return undefined;
    return num;
  }, z.number().int().min(0).optional()),
});

function parseDocTableQuery(search: string): {
  archiveActive: boolean;
  sortOrder: "newest" | "oldest";
  page: number;
} {
  const params = new URLSearchParams(search);
  const parsed = docTableQuerySchema.safeParse({
    archive: params.get("archive") ?? undefined,
    sort: params.get("sort") ?? undefined,
    page: params.get("page") ?? undefined,
  });
  if (!parsed.success) {
    return { archiveActive: false, sortOrder: "newest", page: 0 };
  }
  return {
    archiveActive: parsed.data.archive ?? false,
    sortOrder: parsed.data.sort ?? "newest",
    page: parsed.data.page ?? 0,
  };
}

export function DocTable({
  token,
  user,
  onSessionExpired,
  onTokenRefresh,
  section,
  uploadTrigger,
  searchQuery,
}: DocTableProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const initialQueryState = parseDocTableQuery(location.search);
  const [page, setPage] = useState(initialQueryState.page);
  const [renameDoc, setRenameDoc] = useState<DocumentView | null>(null);
  const [archiveActive, setArchiveActive] = useState(initialQueryState.archiveActive);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">(initialQueryState.sortOrder);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkTagsInput, setBulkTagsInput] = useState("");
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [dropActive, setDropActive] = useState(false);
  const [documentSearchInput, setDocumentSearchInput] = useState("");
  const [documentSearchQuery, setDocumentSearchQuery] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  useEffect(() => {
    setPage(0);
  }, [section]);

  useEffect(() => {
    const nextState = parseDocTableQuery(location.search);
    setArchiveActive((prev) => (prev === nextState.archiveActive ? prev : nextState.archiveActive));
    setSortOrder((prev) => (prev === nextState.sortOrder ? prev : nextState.sortOrder));
    setPage((prev) => (prev === nextState.page ? prev : nextState.page));
  }, [location.search]);

  useEffect(() => {
    const nextParams = new URLSearchParams(location.search);
    if (archiveActive) {
      nextParams.set("archive", "1");
    } else {
      nextParams.delete("archive");
    }
    if (sortOrder === "oldest") {
      nextParams.set("sort", "oldest");
    } else {
      nextParams.delete("sort");
    }
    if (page > 0) {
      nextParams.set("page", String(page));
    } else {
      nextParams.delete("page");
    }

    const current = location.search.startsWith("?") ? location.search.slice(1) : location.search;
    const next = nextParams.toString();
    if (current === next) return;
    navigate({ pathname: location.pathname, search: next ? `?${next}` : "" }, { replace: true });
  }, [archiveActive, sortOrder, page, location.pathname, location.search, navigate]);

  const docQuery = useQuery({
    queryKey: queryKeys.documents.list({ section, page, size: 20, archive: archiveActive }),
    queryFn: () =>
      apiListDocuments(
        { page, size: 20, tag: archiveActive ? "archive" : tagForSection(section) },
        onSessionExpired,
        onTokenRefresh,
      ),
    enabled: !!token,
    placeholderData: keepPreviousData,
  });

  const searchQueryText = documentSearchQuery.trim();
  const documentSearch = useQuery({
    queryKey: queryKeys.documents.search(searchQueryText),
    queryFn: () => apiSearchDocuments(searchQueryText, onSessionExpired, onTokenRefresh),
    enabled: !!token && searchQueryText.length > 0,
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      apiUpdateDocument(id, { title }, onSessionExpired, onTokenRefresh),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
      setRenameDoc(null);
      toast.success("Документ переименован.");
    },
    onError: (e) => {
      toast.error(formatQueryOrMutationError(e) || "Не удалось переименовать документ");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDeleteDocument(id, onSessionExpired, onTokenRefresh),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
    },
    onError: (e) => {
      toast.error(formatQueryOrMutationError(e) || "Не удалось удалить документ");
    },
  });

  useEffect(() => {
    if (uploadTrigger > 0) fileRef.current?.click();
  }, [uploadTrigger]);

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = "";
    if (!files.length || !token) return;
    void uploadFiles(files);
  }

  const error = formatQueryOrMutationError(docQuery.error);

  const loading = docQuery.isFetching && !docQuery.data?.content?.length;
  const docPage = docQuery.data ?? null;
  const rawDocs = docPage?.content ?? [];
  const q = (searchQuery ?? "").trim().toLowerCase();
  const filteredBySearch = q ? rawDocs.filter((d) => d.title.toLowerCase().includes(q)) : rawDocs;
  const filtered = filteredBySearch;
  const docs = [...filtered].sort((a, b) => {
    const at = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const bt = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return sortOrder === "newest" ? bt - at : at - bt;
  });
  const isAdminUser = user.roles?.includes("ADMIN") ?? false;
  const cols = "32px 1fr 140px 100px 132px 44px";
  const allVisibleSelected = docs.length > 0 && docs.every((doc) => selectedIds.includes(doc.id));
  const selectedCount = selectedIds.length;
  const uploadsInProgress = uploadItems.some(
    (item) => item.status === "queued" || item.status === "uploading",
  );
  const searchHits = useMemo(() => documentSearch.data?.hits ?? [], [documentSearch.data?.hits]);
  const groupedSearchHits = useMemo(() => groupSearchHits(searchHits), [searchHits]);
  const searchError = formatQueryOrMutationError(documentSearch.error);

  useEffect(() => {
    const visibleIds = new Set(docs.map((doc) => doc.id));
    setSelectedIds((prev) => {
      const next = prev.filter((id) => visibleIds.has(id));
      if (next.length === prev.length && next.every((id, idx) => id === prev[idx])) {
        return prev;
      }
      return next;
    });
  }, [docs]);

  function setUploadProgress(uploadId: string, progress: number) {
    setUploadItems((prev) =>
      prev.map((item) =>
        item.id === uploadId ? { ...item, progress, status: "uploading" } : item,
      ),
    );
  }

  async function uploadFiles(files: File[]) {
    const created: UploadItem[] = files.map((file, idx) => ({
      id: `${Date.now()}-${idx}-${file.name}`,
      name: file.name,
      progress: 0,
      status: "queued",
    }));
    setUploadItems((prev) => [...created, ...prev].slice(0, 12));

    let successCount = 0;
    for (const [idx, item] of created.entries()) {
      const file = files[idx];
      if (!file) continue;
      try {
        await apiUploadDocumentWithProgress(
          file,
          onSessionExpired,
          onTokenRefresh,
          ({ percent }) => {
            setUploadProgress(item.id, percent);
          },
        );
        successCount += 1;
        setUploadItems((prev) =>
          prev.map((u) =>
            u.id === item.id ? { ...u, progress: 100, status: "done", error: undefined } : u,
          ),
        );
      } catch (e) {
        setUploadItems((prev) =>
          prev.map((u) =>
            u.id === item.id
              ? {
                  ...u,
                  status: "error",
                  error: formatQueryOrMutationError(e) || "Ошибка загрузки",
                }
              : u,
          ),
        );
      }
    }

    if (successCount > 0) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
      setPage(0);
      toast.success(
        successCount === 1 ? "Документ загружен." : `Загружено документов: ${successCount}.`,
      );
    }
    if (successCount < files.length) {
      toast.error("Часть файлов не удалось загрузить.");
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  }

  function toggleSelectAllVisible() {
    if (allVisibleSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(docs.map((doc) => doc.id));
  }

  function submitDocumentSearch() {
    const next = documentSearchInput.trim();
    setDocumentSearchQuery(next);
  }

  function clearDocumentSearch() {
    setDocumentSearchInput("");
    setDocumentSearchQuery("");
  }

  function parseBulkTags(input: string): string[] {
    return [
      ...new Set(
        input
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      ),
    ];
  }

  async function applyBulkTagsReplace() {
    const tags = parseBulkTags(bulkTagsInput);
    if (!selectedIds.length) return;
    setBulkBusy(true);
    const results = await Promise.allSettled(
      selectedIds.map((id) => apiUpdateDocument(id, { tags }, onSessionExpired, onTokenRefresh)),
    );
    const success = results.filter((r) => r.status === "fulfilled").length;
    await queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
    setBulkBusy(false);
    setSelectedIds([]);
    if (success > 0) {
      toast.success(
        success === 1 ? "Теги обновлены." : `Теги обновлены для ${success} документов.`,
      );
    }
    if (success < results.length) {
      toast.error("Не удалось обновить теги для части документов.");
    }
  }

  async function confirmBulkDelete() {
    if (!selectedIds.length) return;
    setBulkBusy(true);
    const results = await Promise.allSettled(
      selectedIds.map((id) => apiDeleteDocument(id, onSessionExpired, onTokenRefresh)),
    );
    const success = results.filter((r) => r.status === "fulfilled").length;
    await queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
    setBulkBusy(false);
    setBulkDeleteDialogOpen(false);
    setSelectedIds([]);
    if (success > 0) {
      toast.success(success === 1 ? "Документ удален." : `Удалено документов: ${success}.`);
    }
    if (success < results.length) {
      toast.error("Не удалось удалить часть документов.");
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <PageHeader
        title={sectionTitle(section)}
        actions={
          <>
            <TopBarBtn
              onClick={() => {
                setArchiveActive((v) => !v);
                setPage(0);
              }}
              title={
                archiveActive
                  ? "Показывается только архив (документы с тегом archive)"
                  : "Показать только архив (документы с тегом archive)"
              }
            >
              {archiveActive ? "Архив: вкл" : "Архив"}
            </TopBarBtn>
            <TopBarBtn onClick={() => setSortOrder((v) => (v === "newest" ? "oldest" : "newest"))}>
              {sortOrder === "newest" ? "Сортировка: новые" : "Сортировка: старые"}
            </TopBarBtn>
            <TopBarBtn
              onClick={() => fileRef.current?.click()}
              title="Загрузить документ в систему"
            >
              Загрузить
            </TopBarBtn>
          </>
        }
      />

      <div className="flex-1 overflow-y-auto px-6 pb-4">
        <input ref={fileRef} type="file" className="hidden" multiple onChange={handleFileSelect} />
        {error && <p className="py-2 text-[13px] text-danger">{error}</p>}
        <div
          className={`mt-3 rounded-lg border border-dashed px-3 py-2 text-xs ${
            dropActive ? "border-primary bg-primary/5 text-text" : "border-border text-muted"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDropActive(true);
          }}
          onDragLeave={() => setDropActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDropActive(false);
            if (!token) return;
            const files = Array.from(e.dataTransfer.files ?? []);
            if (!files.length) return;
            void uploadFiles(files);
          }}
        >
          Перетащите файлы сюда для загрузки или нажмите «Загрузить».
        </div>

        {!!uploadItems.length && (
          <div className="mt-2 rounded-lg border border-border p-2">
            <p className="m-0 mb-1 text-[11px] font-semibold uppercase text-muted">
              Загрузка файлов
            </p>
            {uploadItems.map((item) => (
              <div key={item.id} className="mb-1">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="truncate text-text">{item.name}</span>
                  {item.status === "error" && <span className="text-danger">{item.error}</span>}
                  {(item.status === "queued" || item.status === "uploading") && (
                    <span className="text-muted">{item.progress}%</span>
                  )}
                </div>
                {item.status === "done" && <UploadPipeline status={item.status} />}
                {(item.status === "queued" || item.status === "uploading") && (
                  <div className="h-1.5 rounded bg-zinc-100">
                    <div
                      className="h-1.5 rounded bg-primary"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 rounded-lg border border-border bg-white p-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="m-0 text-sm font-semibold text-text">Поиск по документам</p>
              <p className="m-0 text-[12px] text-muted">
                Ищет по содержимому проиндексированных файлов и показывает найденные фрагменты.
              </p>
            </div>
            {searchQueryText && (
              <span className="rounded-full bg-primary/15 px-2 py-1 text-[11px] text-text">
                {documentSearch.isFetching
                  ? "поиск..."
                  : `найдено фрагментов: ${searchHits.length}`}
              </span>
            )}
          </div>
          <form
            className="flex flex-wrap gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              submitDocumentSearch();
            }}
          >
            <input
              value={documentSearchInput}
              onChange={(event) => setDocumentSearchInput(event.target.value)}
              placeholder="Введите фразу из документа, тему или ключевые слова..."
              aria-label="Поиск по содержимому документов"
              className="min-w-[260px] flex-1 rounded-md border border-border bg-surface px-3 py-2 text-[13px] text-text outline-none"
            />
            <button
              type="submit"
              disabled={!documentSearchInput.trim() || documentSearch.isFetching}
              className={`${smallBtnClass} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              Найти
            </button>
            <button
              type="button"
              onClick={clearDocumentSearch}
              disabled={!documentSearchInput && !searchQueryText}
              className={`${smallBtnClass} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              Сбросить
            </button>
          </form>

          {searchError && <p className="m-0 mt-2 text-[13px] text-danger">{searchError}</p>}
          {searchQueryText &&
            !documentSearch.isFetching &&
            !searchError &&
            !groupedSearchHits.length && (
              <p className="m-0 mt-2 text-[13px] text-muted">По содержимому ничего не найдено.</p>
            )}
          {!!groupedSearchHits.length && (
            <div className="mt-3 grid gap-2">
              {groupedSearchHits.map((result) => (
                <article
                  key={result.documentId}
                  className="grid gap-2 rounded-md border border-border bg-surface px-3 py-2 text-[13px] text-text"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-semibold">{result.documentTitle}</span>
                    <span className="text-[12px] text-muted">
                      Лучшее совпадение: {result.bestScore.toFixed(4)} · фрагментов:{" "}
                      {result.hits.length}
                    </span>
                  </div>
                  <div className="grid gap-1.5">
                    {result.hits.map((hit, idx) => (
                      <button
                        key={hit.chunkId}
                        type="button"
                        onClick={() =>
                          navigate(
                            `/documents/${hit.documentId}?chunk=${encodeURIComponent(
                              hit.chunkId,
                            )}&q=${encodeURIComponent(searchQueryText)}`,
                            {
                              state: {
                                searchHit: {
                                  chunkId: hit.chunkId,
                                  chunkText: hit.chunkText,
                                  query: searchQueryText,
                                },
                              },
                            },
                          )
                        }
                        className="grid w-full gap-1 rounded-md border border-border bg-white px-2.5 py-2 text-left hover:border-primary"
                      >
                        <span className="text-[11px] text-muted">
                          Фрагмент {idx + 1} · совпадение {hit.score.toFixed(4)}
                        </span>
                        <span className="line-clamp-3 text-[12px] text-text">
                          <HighlightedSearchText text={hit.chunkText} query={searchQueryText} />
                        </span>
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="mt-3 rounded-lg border border-border p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted">Выбрано: {selectedCount}</span>
            <input
              value={bulkTagsInput}
              onChange={(e) => setBulkTagsInput(e.target.value)}
              className="min-w-[220px] rounded-md border border-border px-2 py-1 text-xs"
              placeholder="Теги через запятую (замена)"
              aria-label="Теги для массовой замены"
            />
            <button
              type="button"
              onClick={() => void applyBulkTagsReplace()}
              title="Заменить теги у выбранных документов"
              disabled={!selectedCount || bulkBusy}
              className={`${smallBtnClass} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              Применить теги
            </button>
            <button
              type="button"
              onClick={() => setBulkDeleteDialogOpen(true)}
              title="Удалить выбранные документы"
              disabled={!selectedCount || bulkBusy}
              className={`${smallBtnClass} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              Удалить выбранные
            </button>
            {uploadsInProgress && <span className="text-xs text-muted">Идет загрузка…</span>}
          </div>
        </div>

        <p className="mb-1.5 mt-2 text-xs text-muted">
          {q
            ? `Поиск по названию: «${searchQuery?.trim() ?? ""}». Учитываются только документы на текущей странице списка (${docs.length} из ${rawDocs.length} на странице).`
            : "Показаны все документы текущей страницы раздела."}
        </p>

        <div className="mb-2 flex flex-wrap gap-1.5" aria-label="Активные фильтры списка">
          {q ? (
            <span className="rounded-full bg-primary/15 px-2 py-1 text-[11px] text-text">
              Поиск: «{searchQuery?.trim()}»
            </span>
          ) : (
            <span className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] text-muted">
              Поиск не задан
            </span>
          )}
          <span className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] text-text">
            Все статусы
          </span>
          <span
            className={`rounded-full px-2 py-1 text-[11px] ${archiveActive ? "bg-primary/15 text-text" : "bg-zinc-100 text-muted"}`}
          >
            {archiveActive ? "Только архив" : "Без архива"}
          </span>
          <span className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] text-muted">
            Сортировка: {sortOrder === "newest" ? "новые сверху" : "старые сверху"}
          </span>
        </div>

        <div
          className="sticky top-0 z-[1] grid gap-0 bg-surface"
          style={{ gridTemplateColumns: cols }}
        >
          <div className="border-b border-border py-[10px]">
            <input
              type="checkbox"
              aria-label="Выбрать все документы на странице"
              checked={allVisibleSelected}
              onChange={toggleSelectAllVisible}
            />
          </div>
          {["название", "владелец / доступ", "обновлено", "статус", ""].map((h) => (
            <div
              key={h}
              className="border-b border-border py-[10px] text-[11px] font-semibold uppercase tracking-[0.06em] text-muted"
            >
              {h}
            </div>
          ))}
        </div>

        {loading && !docs.length && (
          <p className="py-4 text-[13px] text-muted">Загрузка документов…</p>
        )}
        {!loading && !docs.length && (
          <div className="grid gap-2 py-4 text-[13px] text-muted">
            <p className="m-0">{q ? "Поиск не дал результатов." : "Документы пока не найдены."}</p>
            <p className="m-0">
              Нажмите «Загрузить» или «+ Новый», чтобы добавить документ в систему.
            </p>
          </div>
        )}

        <div data-testid="document-list">
          {docs.map((doc, i) => (
            <DocRow
              key={doc.id}
              doc={doc}
              cols={cols}
              last={i === docs.length - 1}
              selected={selectedIds.includes(doc.id)}
              token={token}
              isAdmin={isAdminUser}
              onSessionExpired={onSessionExpired}
              onTokenRefresh={onTokenRefresh}
              onToggleSelect={() => toggleSelect(doc.id)}
              onRowNavigate={() => navigate(`/documents/${doc.id}`)}
              onOpenRename={setRenameDoc}
              onDeleteDocument={(id) => deleteMutation.mutateAsync(id)}
              onNavigateAudit={() => navigate("/audit")}
            />
          ))}
        </div>

        <RenameDocumentModal
          open={renameDoc !== null}
          onClose={() => setRenameDoc(null)}
          initialTitle={renameDoc?.title ?? ""}
          onSave={async (title) => {
            if (!renameDoc || !token) return;
            try {
              await renameMutation.mutateAsync({ id: renameDoc.id, title });
            } catch {
              /* сообщение в renameMutation.error */
            }
          }}
        />

        {docPage && docPage.totalPages > 1 && (
          <div className="mt-4 flex items-center gap-2">
            <button
              disabled={page <= 0}
              onClick={() => setPage((p) => p - 1)}
              className={smallBtnClass}
            >
              ← Назад
            </button>
            <span className="text-[13px] text-muted">
              {page + 1} / {docPage.totalPages}
            </span>
            <button
              disabled={page >= docPage.totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className={smallBtnClass}
            >
              Далее →
            </button>
          </div>
        )}
        <ConfirmDialog
          open={bulkDeleteDialogOpen}
          onOpenChange={setBulkDeleteDialogOpen}
          onConfirm={confirmBulkDelete}
          title="Удалить выбранные документы?"
          description={`Будет удалено документов: ${selectedCount}. Действие нельзя отменить.`}
          confirmText="Удалить"
          cancelText="Отмена"
        />
      </div>
    </div>
  );
}

function DocRow({
  doc,
  cols,
  last,
  selected,
  token,
  isAdmin,
  onToggleSelect,
  onRowNavigate,
  onSessionExpired,
  onTokenRefresh,
  onOpenRename,
  onDeleteDocument,
  onNavigateAudit,
}: {
  doc: DocumentView;
  cols: string;
  last: boolean;
  selected: boolean;
  token: string;
  isAdmin: boolean;
  onToggleSelect: () => void;
  onRowNavigate: () => void;
  onSessionExpired: () => void;
  onTokenRefresh: (t: string) => void;
  onOpenRename: (d: DocumentView) => void;
  onDeleteDocument: (id: string) => Promise<void>;
  onNavigateAudit: () => void;
}) {
  const openAiWithQuery = useUiStore((state) => state.openAiWithQuery);
  const toast = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [menuFocusIdx, setMenuFocusIdx] = useState(0);
  const menuWrapRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const menuItemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuWrapRef.current && !menuWrapRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    setMenuFocusIdx(0);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    menuItemRefs.current[menuFocusIdx]?.focus();
  }, [menuOpen, menuFocusIdx]);

  async function copyDocumentLink() {
    const url = `${window.location.origin}/documents/${doc.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Ссылка скопирована.");
    } catch {
      toast.error("Не удалось скопировать ссылку");
    }
    setMenuOpen(false);
  }

  async function downloadViaPresignedUrl() {
    setMenuOpen(false);
    try {
      const { url } = await apiGetDocumentDownloadUrl(doc.id, onSessionExpired, onTokenRefresh);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.fileName || doc.title || "document";
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      toast.error(e instanceof Error ? mapApiErrorToMessage(e.message) : "Не удалось скачать");
    }
  }

  function askAssistant() {
    const base = (doc.fileName || doc.title || "").trim();
    const mentionHead = base.split(".")[0] ?? "";
    const mention = mentionHead.trim().replace(/\s+/g, "_").slice(0, 32);
    const q = mention
      ? `@${mention} суммируй документ в 5 пунктах`
      : "Суммируй документ в 5 пунктах";
    openAiWithQuery(q);
    setMenuOpen(false);
  }

  function openAuditEntry() {
    setMenuOpen(false);
    if (isAdmin) {
      onNavigateAudit();
      return;
    }
    toast.info(
      "Журнал аудита по документу: в MVP доступен только администраторам (раздел «Журнал аудита»).",
    );
  }

  async function confirmDelete() {
    setMenuOpen(false);
    try {
      await onDeleteDocument(doc.id);
      setDeleteDialogOpen(false);
      toast.success("Документ удален.");
    } catch (e) {
      // Ошибка уже обработана в deleteMutation.onError; оставляем fallback на нетипичные кейсы.
      if (!(e instanceof Error)) {
        toast.error("Не удалось удалить");
      }
    }
  }

  const menuId = `doc-row-menu-${doc.id}`;
  const btnId = `doc-row-menu-btn-${doc.id}`;

  const menuActions: {
    id: string;
    label: string;
    danger?: boolean;
    action: () => void | Promise<void>;
  }[] = [
    {
      id: "open",
      label: "Открыть",
      action: () => {
        setMenuOpen(false);
        onRowNavigate();
      },
    },
    { id: "copy", label: "Копировать ссылку", action: () => void copyDocumentLink() },
    { id: "dl", label: "Скачать файл", action: () => void downloadViaPresignedUrl() },
    {
      id: "ai",
      label: "Спросить ассистента…",
      action: () => {
        askAssistant();
      },
    },
    {
      id: "audit",
      label: isAdmin ? "Журнал аудита…" : "Аудит (недоступно)",
      action: () => {
        openAuditEntry();
      },
    },
    {
      id: "ren",
      label: "Переименовать…",
      action: () => {
        setMenuOpen(false);
        onOpenRename(doc);
      },
    },
    {
      id: "del",
      label: "Удалить…",
      danger: true,
      action: () => {
        setMenuOpen(false);
        setDeleteDialogOpen(true);
      },
    },
  ];

  return (
    <div
      role="row"
      data-testid="document-row"
      tabIndex={0}
      aria-label={`Документ: ${doc.title}. Enter — открыть карточку; Shift+F10 или контекстное меню — действия.`}
      className="grid cursor-pointer items-center outline-none"
      style={{
        gridTemplateColumns: cols,
        borderBottom: last ? "none" : "1px dashed var(--color-border)",
      }}
      onClick={() => {
        if (menuOpen) return;
        onRowNavigate();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setMenuOpen(true);
      }}
      onKeyDown={(e) => {
        if (menuOpen) {
          if (e.key === "Escape") {
            e.preventDefault();
            setMenuOpen(false);
            menuBtnRef.current?.focus();
          }
          return;
        }
        if ((e.shiftKey && e.key === "F10") || e.key === "ContextMenu") {
          e.preventDefault();
          setMenuOpen(true);
          return;
        }
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onRowNavigate();
        }
      }}
    >
      <div className="py-[11px]" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={selected}
          aria-label={`Выбрать документ ${doc.title}`}
          onChange={onToggleSelect}
        />
      </div>
      <div className="flex items-center gap-2 overflow-hidden py-[11px]">
        <span className="shrink-0 text-sm">{docIcon(doc)}</span>
        <span data-testid="document-title" className="truncate text-sm font-medium text-text">
          {doc.title}
        </span>
      </div>

      <div className="flex items-center gap-1.5 py-[11px]">
        <Avatar name={doc.ownerId.slice(0, 8)} size={22} />
        <span className="text-xs text-muted">{docAcl(doc)}</span>
      </div>

      <div className="py-[11px] text-xs text-muted">
        {doc.updatedAt ? timeAgo(doc.updatedAt) : "—"}
      </div>

      <div className="pr-2 py-[11px]" data-testid="document-index-status">
        <StatusBadge status={doc.status} />
      </div>

      <div
        ref={menuWrapRef}
        className="relative py-[11px] text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={menuBtnRef}
          id={btnId}
          type="button"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-controls={menuOpen ? menuId : undefined}
          aria-label="Действия с документом"
          title="Действия с документом"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((o) => !o);
          }}
          className="rounded-md border-none bg-transparent px-2 py-1 text-lg leading-none text-muted"
        >
          ⋯
        </button>
        {menuOpen && (
          <div
            id={menuId}
            role="menu"
            aria-labelledby={btnId}
            onKeyDown={(e) => {
              const len = menuActions.length;
              if (len === 0) return;
              if (e.key === "ArrowDown") {
                e.preventDefault();
                e.stopPropagation();
                setMenuFocusIdx((i) => (i + 1) % len);
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                e.stopPropagation();
                setMenuFocusIdx((i) => (i - 1 + len) % len);
              } else if (e.key === "Home") {
                e.preventDefault();
                setMenuFocusIdx(0);
              } else if (e.key === "End") {
                e.preventDefault();
                setMenuFocusIdx(len - 1);
              }
            }}
            className="absolute right-0 top-full z-20 mt-0.5 min-w-[220px] rounded-lg border border-border bg-white px-0 py-1 text-left shadow-menu"
          >
            {menuActions.map((item, idx) => (
              <button
                key={item.id}
                ref={(el) => {
                  menuItemRefs.current[idx] = el;
                }}
                type="button"
                role="menuitem"
                tabIndex={menuFocusIdx === idx ? 0 : -1}
                aria-label={item.label}
                onMouseEnter={() => setMenuFocusIdx(idx)}
                onClick={(e) => {
                  e.stopPropagation();
                  void item.action();
                }}
                className={`block w-full border-none px-[14px] py-2 text-left text-[13px] ${
                  menuFocusIdx === idx ? "bg-primary/10" : "bg-transparent"
                } ${item.danger ? "text-danger" : "text-text"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Удалить документ безвозвратно?"
        description="Это действие нельзя отменить."
        confirmText="Удалить"
        cancelText="Отмена"
      />
    </div>
  );
}
