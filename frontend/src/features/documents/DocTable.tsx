import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import {
  apiDeleteDocument,
  apiGetDocumentDownloadUrl,
  apiListDocuments,
  apiSearchDocuments,
  apiUploadDocumentWithProgress,
  apiUpdateDocument,
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
export function UploadPipeline({ status: _status }: { status: string }) {
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

function sortToApiParams(sort: SortOption): { sortBy: string; order: string } {
  switch (sort) {
    case "date_asc":
      return { sortBy: "updatedAt", order: "asc" };
    case "name_asc":
      return { sortBy: "name", order: "asc" };
    case "name_desc":
      return { sortBy: "name", order: "desc" };
    case "date_desc":
    default:
      return { sortBy: "updatedAt", order: "desc" };
  }
}

const TYPE_TO_CONTENT_TYPE: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  txt: "text/plain",
};

/** Тег API для фильтрации списка по «разделу» сайдбара. */
function tagForSection(section: string): string | undefined {
  if (section === "pinned") return "pinned";
  if (section === "transcripts") return "transcript";
  if (section === "contracts") return "contract";
  if (section === "memos") return "memo";
  if (section === "reports") return "report";
  return undefined;
}

function parseTagsInput(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  );
}

function formatQueryOrMutationError(err: unknown): string {
  if (!(err instanceof Error)) return "";
  if (err.message === "Unauthorized") return "";
  return mapApiErrorToMessage(err.message);
}

type SortOption = "date_desc" | "date_asc" | "name_asc" | "name_desc";

function normalizeSort(raw: string | undefined): SortOption {
  if (raw === "oldest") return "date_asc";
  if (raw === "newest") return "date_desc";
  if (raw === "date_asc" || raw === "date_desc" || raw === "name_asc" || raw === "name_desc")
    return raw;
  return "date_desc";
}

const docTableQuerySchema = z.object({
  archive: z.preprocess((value) => {
    if (value === "1" || value === "true") return true;
    if (value === "0" || value === "false") return false;
    return undefined;
  }, z.boolean().optional()),
  sort: z.string().optional(),
  type: z.string().optional(),
  ownerId: z.string().optional(),
  tag: z.string().optional(),
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
  sort: SortOption;
  page: number;
  typeFilter: string;
  ownerFilter: string;
  tagFilter: string;
} {
  const params = new URLSearchParams(search);
  const parsed = docTableQuerySchema.safeParse({
    archive: params.get("archive") ?? undefined,
    sort: params.get("sort") ?? undefined,
    type: params.get("type") ?? undefined,
    ownerId: params.get("ownerId") ?? undefined,
    tag: params.get("tag") ?? undefined,
    page: params.get("page") ?? undefined,
  });
  if (!parsed.success) {
    return {
      archiveActive: false,
      sort: "date_desc",
      page: 0,
      typeFilter: "all",
      ownerFilter: "all",
      tagFilter: "",
    };
  }
  return {
    archiveActive: parsed.data.archive ?? false,
    sort: normalizeSort(parsed.data.sort),
    page: parsed.data.page ?? 0,
    typeFilter: parsed.data.type ?? "all",
    ownerFilter: parsed.data.ownerId ?? "all",
    tagFilter: parsed.data.tag ?? "",
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
  const [sort, setSort] = useState<SortOption>(initialQueryState.sort);
  const [typeFilter, setTypeFilter] = useState<string>(initialQueryState.typeFilter);
  const [ownerFilter, setOwnerFilter] = useState<string>(initialQueryState.ownerFilter);
  const [tagFilter, setTagFilter] = useState<string>(initialQueryState.tagFilter);
  const [tagFilterInput, setTagFilterInput] = useState<string>(initialQueryState.tagFilter);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
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
    setSort((prev) => (prev === nextState.sort ? prev : nextState.sort));
    setTypeFilter((prev) => (prev === nextState.typeFilter ? prev : nextState.typeFilter));
    setOwnerFilter((prev) => (prev === nextState.ownerFilter ? prev : nextState.ownerFilter));
    setTagFilter((prev) => (prev === nextState.tagFilter ? prev : nextState.tagFilter));
    setTagFilterInput((prev) => (prev === nextState.tagFilter ? prev : nextState.tagFilter));
    setPage((prev) => (prev === nextState.page ? prev : nextState.page));
  }, [location.search]);

  useEffect(() => {
    const nextParams = new URLSearchParams(location.search);
    if (archiveActive) {
      nextParams.set("archive", "1");
    } else {
      nextParams.delete("archive");
    }
    if (sort !== "date_desc") {
      nextParams.set("sort", sort);
    } else {
      nextParams.delete("sort");
    }
    if (typeFilter !== "all") {
      nextParams.set("type", typeFilter);
    } else {
      nextParams.delete("type");
    }
    if (ownerFilter !== "all") {
      nextParams.set("ownerId", ownerFilter);
    } else {
      nextParams.delete("ownerId");
    }
    if (tagFilter) {
      nextParams.set("tag", tagFilter);
    } else {
      nextParams.delete("tag");
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
  }, [
    archiveActive,
    sort,
    typeFilter,
    ownerFilter,
    tagFilter,
    page,
    location.pathname,
    location.search,
    navigate,
  ]);

  const { sortBy, order } = sortToApiParams(sort);
  const docQuery = useQuery({
    queryKey: queryKeys.documents.list({
      section,
      page,
      size: 20,
      archive: archiveActive,
      sort,
      typeFilter,
      ownerFilter,
      tagFilter,
    }),
    queryFn: () =>
      apiListDocuments(
        {
          page,
          size: 20,
          tag: archiveActive ? "archive" : tagFilter || tagForSection(section),
          type: typeFilter !== "all" ? TYPE_TO_CONTENT_TYPE[typeFilter] : undefined,
          ownerId: ownerFilter !== "all" ? ownerFilter : undefined,
          sortBy,
          order,
        },
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setTagFilter(tagFilterInput);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [tagFilterInput]);

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = "";
    if (!files.length || !token) return;
    void uploadFiles(files);
  }

  const error = formatQueryOrMutationError(docQuery.error);

  const loading = docQuery.isFetching && !docQuery.data?.content?.length;
  const docPage = docQuery.data ?? null;
  const rawDocs = useMemo(() => docPage?.content ?? [], [docPage]);
  const availableStatuses = useMemo(
    () => Array.from(new Set(rawDocs.map((d) => d.status).filter(Boolean))).sort(),
    [rawDocs],
  );
  const availableOwners = useMemo(
    () => Array.from(new Set(rawDocs.map((d) => d.ownerId).filter(Boolean))).sort(),
    [rawDocs],
  );
  const q = (searchQuery ?? "").trim().toLowerCase();
  const filteredBySearch = q ? rawDocs.filter((d) => d.title.toLowerCase().includes(q)) : rawDocs;
  const filtered =
    statusFilter === "ALL"
      ? filteredBySearch
      : filteredBySearch.filter((d) => d.status === statusFilter);
  const docs = filtered;
  const isAdminUser = user.roles?.includes("ADMIN") ?? false;
  const cols = "32px minmax(220px,1fr) 140px 100px 132px 160px 44px";
  const tableMinWidth = "680px";
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

  async function applyBulkTagsReplace() {
    const tags = parseTagsInput(bulkTagsInput);
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
            <select
              aria-label="Сортировка"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as SortOption);
                setPage(0);
              }}
              className="rounded-md border border-border bg-surface px-2 py-1 text-xs"
            >
              <option value="date_desc">Новые сверху</option>
              <option value="date_asc">Старые сверху</option>
              <option value="name_asc">Имя А→Я</option>
              <option value="name_desc">Имя Я→А</option>
            </select>
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
                  <span className="min-w-0 truncate text-text" title={item.name}>
                    {item.name}
                  </span>
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
                    <span className="min-w-0 truncate font-semibold" title={result.documentTitle}>
                      {result.documentTitle}
                    </span>
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
            {statusFilter === "ALL" ? "Все статусы" : `Статус: ${statusFilter}`}
          </span>
          <span
            className={`rounded-full px-2 py-1 text-[11px] ${archiveActive ? "bg-primary/15 text-text" : "bg-zinc-100 text-muted"}`}
          >
            {archiveActive ? "Только архив" : "Без архива"}
          </span>
          <span className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] text-muted">
            Сортировка:{" "}
            {sort === "date_desc"
              ? "новые сверху"
              : sort === "date_asc"
                ? "старые сверху"
                : sort === "name_asc"
                  ? "имя А→Я"
                  : "имя Я→А"}
          </span>
        </div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <label htmlFor="document-status-filter" className="text-xs text-muted">
            Статус
          </label>
          <select
            id="document-status-filter"
            aria-label="Фильтр по статусу"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(0);
            }}
            className="rounded-md border border-border bg-surface px-2 py-1 text-xs text-text"
          >
            <option value="ALL">Все статусы</option>
            {availableStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          {/* Type filter */}
          <select
            aria-label="Тип файла"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(0);
            }}
            className="rounded-md border border-border bg-surface px-2 py-1 text-xs"
          >
            <option value="all">Все типы</option>
            <option value="pdf">PDF</option>
            <option value="docx">DOCX</option>
            <option value="txt">TXT</option>
          </select>

          {/* Owner filter */}
          {availableOwners.length > 1 && (
            <select
              aria-label="Владелец"
              value={ownerFilter}
              onChange={(e) => {
                setOwnerFilter(e.target.value);
                setPage(0);
              }}
              className="rounded-md border border-border bg-surface px-2 py-1 text-xs"
            >
              <option value="all">Все владельцы</option>
              {availableOwners.map((id) => (
                <option key={id} value={id}>
                  {id.slice(0, 8)}
                </option>
              ))}
            </select>
          )}

          {/* Tag filter */}
          <input
            type="text"
            aria-label="Фильтр по тегу"
            placeholder="Тег…"
            value={tagFilterInput}
            onChange={(e) => setTagFilterInput(e.target.value)}
            className="w-28 rounded-md border border-border bg-surface px-2 py-1 text-xs"
          />
        </div>

        <div className="overflow-x-auto">
          <div
            className="sticky top-0 z-[1] grid gap-0 bg-surface"
            style={{ gridTemplateColumns: cols, minWidth: tableMinWidth }}
          >
            <div className="border-b border-border py-[10px]">
              <input
                type="checkbox"
                aria-label="Выбрать все документы на странице"
                checked={allVisibleSelected}
                onChange={toggleSelectAllVisible}
              />
            </div>
            {["название", "владелец / доступ", "обновлено", "статус", "теги", ""].map((h) => (
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
              <p className="m-0">
                {q ? "Поиск не дал результатов." : "Документы пока не найдены."}
              </p>
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
                minWidth={tableMinWidth}
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
  minWidth,
  last,
  selected,
  token: _token,
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
  minWidth: string;
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
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [menuFocusIdx, setMenuFocusIdx] = useState(0);
  const [editingTags, setEditingTags] = useState(false);
  const [editingTagsValue, setEditingTagsValue] = useState("");
  const menuWrapRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const menuItemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const updateTagsMutation = useMutation({
    mutationFn: ({ id, tags }: { id: string; tags: string[] }) =>
      apiUpdateDocument(id, { tags }, onSessionExpired, onTokenRefresh),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
      setEditingTags(false);
    },
    onError: (e) => {
      toast.error(formatQueryOrMutationError(e) || "Не удалось сохранить теги");
    },
  });

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
        minWidth,
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
      <div className="flex min-w-0 items-center gap-2 overflow-hidden py-[11px]">
        <span className="shrink-0 text-sm">{docIcon(doc)}</span>
        <span
          data-testid="document-title"
          className="min-w-0 truncate text-sm font-medium text-text"
          title={doc.title}
        >
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

      <div className="px-3 py-[11px]" onClick={(e) => e.stopPropagation()}>
        {editingTags ? (
          <div className="flex items-center gap-1">
            <input
              autoFocus
              type="text"
              value={editingTagsValue}
              onChange={(e) => setEditingTagsValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.stopPropagation();
                  e.preventDefault();
                  if (updateTagsMutation.isPending) return;
                  updateTagsMutation.mutate({ id: doc.id, tags: parseTagsInput(editingTagsValue) });
                }
                if (e.key === "Escape") {
                  e.stopPropagation();
                  setEditingTags(false);
                }
              }}
              className="w-32 rounded border border-border bg-surface px-1.5 py-0.5 text-[11px] outline-none"
              placeholder="тег1, тег2"
            />
            <button
              type="button"
              aria-label="Сохранить теги"
              disabled={updateTagsMutation.isPending}
              onClick={() =>
                updateTagsMutation.mutate({ id: doc.id, tags: parseTagsInput(editingTagsValue) })
              }
              className="text-[11px] text-primary disabled:opacity-50"
            >
              ✓
            </button>
            <button
              type="button"
              aria-label="Отмена"
              onClick={() => setEditingTags(false)}
              className="text-[11px] text-muted"
            >
              ✗
            </button>
          </div>
        ) : (
          <div
            role="button"
            tabIndex={0}
            aria-label="Редактировать теги"
            className="flex cursor-pointer flex-wrap gap-1"
            onClick={() => {
              setEditingTags(true);
              setEditingTagsValue(doc.tags?.join(", ") ?? "");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setEditingTags(true);
                setEditingTagsValue(doc.tags?.join(", ") ?? "");
              }
            }}
          >
            {doc.tags && doc.tags.length > 0 ? (
              doc.tags.map((tag, i) => (
                <span
                  key={`${tag}-${i}`}
                  className="rounded-full bg-muted/20 px-1.5 py-0.5 text-[10px] text-muted"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-[11px] text-muted/50 hover:text-primary">+</span>
            )}
          </div>
        )}
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
