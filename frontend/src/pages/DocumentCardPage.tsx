import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  apiBaseUrl,
  apiDeleteDocument,
  apiUpdateDocument,
  fetchWithAuth,
  parseAuthenticatedJson,
  parseAuthenticatedText,
  readApiError,
} from "../apiClient";
import { queryKeys } from "../shared/api/queryClient";
import { useUiStore } from "../shared/store/uiStore";
import { ConfirmDialog } from "../shared/ui/ConfirmDialog";
import { useToast } from "../shared/ui/ToastProvider";
import type { DocumentView } from "../types/document";
import { RenameDocumentModal, StatusBadge, mapApiErrorToMessage } from "../ui/appShared";

type DocumentCardPageProps = {
  token: string;
  onSessionExpired: () => void;
  onTokenRefresh: (t: string) => void;
};

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="mb-2 mt-0 text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
        {label}
      </p>
      {children}
    </div>
  );
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2.5">
      <p className="mb-0.5 mt-0 text-[10px] font-bold uppercase tracking-[0.06em] text-muted">
        {label}
      </p>
      <p className="m-0 truncate text-[13px] text-text">{value}</p>
    </div>
  );
}

function DocumentPreview({
  documentId,
  contentType,
  onSessionExpired,
  onTokenRefresh,
}: {
  documentId: string;
  contentType: string;
  onSessionExpired: () => void;
  onTokenRefresh: (t: string) => void;
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let revoked = false;
    let url: string | null = null;
    setError("");
    setBlobUrl(null);
    setTextContent(null);
    const isPdf = contentType.includes("pdf");
    const isText = contentType.includes("text/plain");
    if (!isPdf && !isText) return;

    async function run() {
      try {
        const res = await fetchWithAuth(
          `${apiBaseUrl}/documents/${documentId}/binary?disposition=inline`,
          {},
          onTokenRefresh,
        );
        if (res.status === 401 || res.status === 403) {
          onSessionExpired();
          return;
        }
        if (!res.ok) {
          setError(await res.text());
          return;
        }
        const blob = await res.blob();
        if (revoked) return;
        if (isText) {
          const text = await blob.text();
          if (!revoked) setTextContent(text);
        } else {
          url = URL.createObjectURL(blob);
          if (!revoked) setBlobUrl(url);
        }
      } catch (e) {
        if (!revoked) setError(String(e));
      }
    }
    void run();
    return () => {
      revoked = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [documentId, contentType, onSessionExpired, onTokenRefresh]);

  if (!contentType) return <p className="text-[13px] text-muted">Нет метаданных файла.</p>;
  if (!contentType.includes("pdf") && !contentType.includes("text/plain"))
    return (
      <p className="text-[13px] text-muted">
        Предпросмотр доступен для PDF и обычного текста. Тип текущего файла: {contentType}.
      </p>
    );
  if (error) return <p className="text-[13px] text-danger">{error}</p>;
  if (contentType.includes("text/plain") && textContent !== null)
    return (
      <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-surface p-2.5 text-xs">
        {textContent}
      </pre>
    );
  if (contentType.includes("pdf") && blobUrl)
    return (
      <iframe
        title="Предпросмотр документа"
        src={blobUrl}
        className="h-[420px] w-full rounded-lg border border-border"
      />
    );
  return <p className="text-[13px] text-muted">Загрузка предпросмотра…</p>;
}

export function DocumentCardPage({
  token,
  onSessionExpired,
  onTokenRefresh,
}: DocumentCardPageProps) {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tagInput, setTagInput] = useState("");
  const [fullText, setFullText] = useState<string | null>(null);
  const [fullTextLoading, setFullTextLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const openAiWithQuery = useUiStore((state) => state.openAiWithQuery);
  const toast = useToast();

  const docQuery = useQuery({
    queryKey: queryKeys.documents.card(documentId),
    enabled: !!documentId && !!token,
    queryFn: async () => {
      const res = await fetchWithAuth(`${apiBaseUrl}/documents/${documentId}`, {}, onTokenRefresh);
      return parseAuthenticatedJson<DocumentView>(res, onSessionExpired);
    },
  });
  const doc = docQuery.data ?? null;

  const updateDocumentMutation = useMutation({
    mutationFn: (patch: { title?: string; tags?: string[] }) => {
      if (!documentId) throw new Error("Document id is missing");
      return apiUpdateDocument(documentId, patch, onSessionExpired, onTokenRefresh);
    },
    onSuccess: async (payload) => {
      queryClient.setQueryData(queryKeys.documents.card(documentId), payload);
      setTagInput(payload.tags.join(", "));
      setFullText(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
    },
  });

  async function saveTags() {
    if (!documentId || !token) return;
    const tags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    try {
      await updateDocumentMutation.mutateAsync({ tags });
      toast.success("Теги обновлены.");
    } catch (e) {
      toast.error(
        e instanceof Error ? mapApiErrorToMessage(e.message) : "Не удалось обновить теги",
      );
    }
  }

  async function loadFullText() {
    if (!documentId || !token) return;
    setFullTextLoading(true);
    try {
      const res = await fetchWithAuth(
        `${apiBaseUrl}/documents/${documentId}/extracted-text`,
        {},
        onTokenRefresh,
      );
      setFullText(await parseAuthenticatedText(res, onSessionExpired));
    } catch (e) {
      if (e instanceof Error && e.message !== "Unauthorized") {
        toast.error(mapApiErrorToMessage(e.message));
      }
    } finally {
      setFullTextLoading(false);
    }
  }

  const deleteDocumentMutation = useMutation({
    mutationFn: () => {
      if (!documentId) throw new Error("Document id is missing");
      return apiDeleteDocument(documentId, onSessionExpired, onTokenRefresh);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
      toast.success("Документ удален.");
      navigate("/documents");
    },
  });

  async function confirmDeleteDocument() {
    if (!documentId || !token) return;
    try {
      await deleteDocumentMutation.mutateAsync();
      setDeleteDialogOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? mapApiErrorToMessage(e.message) : "Не удалось удалить");
    }
  }

  async function downloadCurrentBinary(fileName: string) {
    if (!documentId || !token) return;
    try {
      const res = await fetchWithAuth(
        `${apiBaseUrl}/documents/${documentId}/binary?disposition=attachment`,
        {},
        onTokenRefresh,
      );
      if (res.status === 401 || res.status === 403) {
        onSessionExpired();
        return;
      }
      if (!res.ok) {
        const err = await readApiError(res);
        toast.error(mapApiErrorToMessage(err.message ?? err.errorCode ?? ""));
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.rel = "noopener";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(e instanceof Error ? mapApiErrorToMessage(e.message) : "Не удалось скачать");
    }
  }

  useEffect(() => {
    if (!doc) return;
    setTagInput(doc.tags.join(", "));
    setFullText(null);
  }, [doc]);

  if (docQuery.isPending && !doc) return <p className="p-6 text-muted">Загрузка…</p>;
  if (!doc)
    return (
      <div className="p-6">
        <p className="text-muted">Документ не загружен.</p>
        <button
          className="rounded-md border border-border bg-white px-3 py-1 text-xs text-text"
          onClick={() => void docQuery.refetch()}
        >
          Повторить
        </button>
      </div>
    );

  const ct = doc.contentType ?? "";
  const isPlainText = ct.includes("text/plain");

  function askInAi() {
    if (!doc) return;
    const base = (doc.fileName || doc.title || "").trim();
    const tokenHead = base.split(".")[0] ?? "";
    const token = tokenHead.trim().replace(/\s+/g, "_").slice(0, 32);
    const q = token ? `@${token} суммируй документ в 5 пунктах` : "Суммируй документ в 5 пунктах";
    openAiWithQuery(q);
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center gap-3 border-b border-border px-6 pb-[14px] pt-4">
        <button
          onClick={() => navigate(-1)}
          className="rounded-md border border-border bg-white px-[10px] py-[2px] text-[18px] text-text"
        >
          ←
        </button>
        <h2 className="m-0 min-w-0 flex-1 text-[18px] font-bold text-text">{doc.title}</h2>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={askInAi}
            className="rounded-md border border-border bg-white px-3 py-1 text-xs text-text"
            title="Открыть ассистента и вставить вопрос"
          >
            Спросить AI
          </button>
          <button
            type="button"
            onClick={() => setRenameOpen(true)}
            className="rounded-md border border-border bg-white px-3 py-1 text-xs text-text"
          >
            Переименовать
          </button>
          <button
            type="button"
            onClick={() => setDeleteDialogOpen(true)}
            className="rounded-md border border-danger/40 bg-white px-3 py-1 text-xs text-danger"
          >
            Удалить
          </button>
          <StatusBadge status={doc.status} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="mb-4 grid grid-cols-[minmax(240px,1fr)] gap-2.5">
          <MetaCard label="Владелец" value={doc.ownerId} />
        </div>

        <div className="mb-4 flex items-center gap-2">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="теги через запятую"
            className="max-w-[480px] flex-1 rounded-[7px] border border-border bg-surface px-[10px] py-[7px] text-[13px] outline-none"
          />
          <button
            onClick={() => void saveTags()}
            className="rounded-md border-0 bg-primary px-3 py-1 text-xs text-white"
          >
            Сохранить теги
          </button>
        </div>

        <Section label="Предпросмотр">
          <DocumentPreview
            documentId={doc.id}
            contentType={ct}
            onSessionExpired={onSessionExpired}
            onTokenRefresh={onTokenRefresh}
          />
        </Section>

        {(!isPlainText || doc.extractedTextTruncated) && (
          <Section
            label={`Извлеченный текст (${doc.extractedTextLength} символов${doc.extractedTextTruncated ? ", усечено" : ""})`}
          >
            <pre
              className={`m-0 overflow-auto whitespace-pre-wrap break-words rounded-lg p-2.5 text-xs ${
                fullText ? "max-h-[360px] bg-success-soft" : "max-h-[180px] bg-surface-muted"
              }`}
            >
              {fullText
                ? fullText
                : doc.extractedTextTruncated
                  ? `${doc.extractedTextPreview}…`
                  : doc.extractedTextPreview}
            </pre>
            {!fullText && (
              <button
                className="mt-2 rounded-md border border-border bg-white px-3 py-1 text-xs text-text"
                onClick={() => void loadFullText()}
                disabled={fullTextLoading}
              >
                {fullTextLoading ? "Загрузка…" : "Загрузить полный текст"}
              </button>
            )}
          </Section>
        )}

        <Section label="Файл документа">
          <div className="flex items-center gap-2.5 rounded-lg border border-border bg-white px-3 py-2 text-[13px]">
            <span className="min-w-0 flex-1 truncate font-medium text-text">{doc.fileName}</span>
            <span className="shrink-0 text-[11px] text-muted">{doc.contentType}</span>
            <span className="shrink-0 text-[11px] text-muted">
              {(doc.totalSizeBytes / 1024).toFixed(1)} KB
            </span>
            <button
              type="button"
              title="Скачать"
              onClick={() => void downloadCurrentBinary(doc.fileName)}
              className="shrink-0 rounded-md border border-border bg-white px-2 py-[2px] text-xs text-text"
            >
              ⬇
            </button>
          </div>
        </Section>
      </div>

      <RenameDocumentModal
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        initialTitle={doc.title}
        onSave={async (title) => {
          if (!documentId || !token) return;
          await updateDocumentMutation.mutateAsync({ title });
          toast.success("Документ переименован.");
        }}
      />
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteDocument}
        title="Удалить документ безвозвратно?"
        description="Это действие нельзя отменить."
        confirmText="Удалить"
        cancelText="Отмена"
        pending={deleteDocumentMutation.isPending}
      />
    </div>
  );
}
