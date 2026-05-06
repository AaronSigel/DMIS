import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import {
  apiBaseUrl,
  apiCreateAssistantThread,
  apiGetDocumentTitle,
  apiGetAssistantThreadDetail,
  apiLinkAssistantThreadDocument,
  apiListAssistantThreads,
  apiMentionDocuments,
  apiUploadAssistantThreadAttachment,
  fetchWithAuth,
  parseAuthenticatedJson,
} from "../apiClient";
import { queryKeys } from "../shared/api/queryClient";
import { ActionListSchema } from "../shared/api/schemas/action";
import { useAssistantStream } from "../shared/sse/useAssistantStream";
import { useUiStore } from "../shared/store/uiStore";
import { useToast } from "../shared/ui/ToastProvider";
import type { Citation } from "../types/search";
import { ActionCard } from "./ActionCard";
import { mapApiErrorToMessage, smallBtnClass } from "./appShared";
import { CitationChip } from "./CitationChip";
import { CitationSidebar } from "./CitationSidebar";

type AiPanelProps = {
  token: string;
  width: number;
  height?: number | string;
  onSessionExpired: () => void;
  onTokenRefresh: (t: string) => void;
  onClose?: () => void;
};

const SUGGESTIONS = [
  "суммируй 3 последних контракта",
  'найди документы с упоминанием "продление Acme"',
];

function renderMessageMarkdown(content: string) {
  const hasRawHtmlTag = /<\/?[a-z][\s\S]*>/i.test(content);
  const safeContent = hasRawHtmlTag ? DOMPurify.sanitize(content) : content;

  return (
    <div className="m-0 break-words text-[13px] leading-[1.5] text-text">
      <ReactMarkdown
        rehypePlugins={hasRawHtmlTag ? [rehypeRaw] : undefined}
        components={{
          p: ({ children }) => <p className="mb-2 mt-0 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="my-2 list-disc pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="my-2 list-decimal pl-5">{children}</ol>,
          li: ({ children }) => <li className="my-0.5">{children}</li>,
          code: ({ children }) => (
            <code className="rounded bg-surface px-1 py-0.5 text-[12px]">{children}</code>
          ),
          pre: ({ children }) => <pre className="my-2 overflow-x-auto">{children}</pre>,
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              {children}
            </a>
          ),
        }}
      >
        {safeContent}
      </ReactMarkdown>
    </div>
  );
}

export function AiPanel({
  token,
  width,
  height = "100vh",
  onSessionExpired,
  onTokenRefresh,
  onClose,
}: AiPanelProps) {
  type ThreadView = {
    id: string;
    title: string;
    ideologyProfileId: string;
    knowledgeSourceIds: string[];
  };
  type MentionDoc = { id: string; title: string };
  const assistantQuery = useUiStore((state) => state.assistantQuery);
  const setAssistantQuery = useUiStore((state) => state.setAssistantQuery);
  const [inputValue, setInputValue] = useState(assistantQuery);
  const queryClient = useQueryClient();
  const [activeThreadId, setActiveThreadId] = useState("");
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [mentionCandidates, setMentionCandidates] = useState<MentionDoc[]>([]);
  const [mentionTerm, setMentionTerm] = useState("");
  const [documentTitles, setDocumentTitles] = useState<Record<string, string>>({});
  const [mentionActiveIndex, setMentionActiveIndex] = useState(-1);
  const [threadsOpen, setThreadsOpen] = useState(false);
  const [ideologyProfileId, setIdeologyProfileId] = useState("balanced");
  const [knowledgeSourceIds, setKnowledgeSourceIds] = useState<string[]>(["documents"]);
  const [recording, setRecording] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [awaitingPersistedAssistantMessage, setAwaitingPersistedAssistantMessage] = useState(false);
  const toast = useToast();
  const uploadRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaChunksRef = useRef<Blob[]>([]);
  const inputValueRef = useRef(inputValue);
  const titleGenerationAttemptedRef = useRef<Set<string>>(new Set());

  const threadsQuery = useQuery({
    queryKey: queryKeys.assistant.threads,
    queryFn: () => apiListAssistantThreads(onSessionExpired, onTokenRefresh),
    enabled: !!token,
  });

  const threadDetailQuery = useQuery({
    queryKey: queryKeys.assistant.threadDetail(activeThreadId),
    queryFn: () => apiGetAssistantThreadDetail(activeThreadId, onSessionExpired, onTokenRefresh),
    enabled: !!token && !!activeThreadId,
  });

  const mentionDocumentsQuery = useQuery({
    queryKey: ["assistant-mention-documents", mentionTerm],
    queryFn: () => apiMentionDocuments(mentionTerm, onSessionExpired, onTokenRefresh),
    enabled: !!token && mentionTerm.length > 0,
  });

  const actionsQuery = useQuery({
    queryKey: ["assistant-actions"],
    queryFn: async () => {
      const response = await fetchWithAuth(
        `${apiBaseUrl}/actions`,
        { method: "GET" },
        onTokenRefresh,
      );
      const payload = await parseAuthenticatedJson<unknown>(response, onSessionExpired);
      return ActionListSchema.parse(payload);
    },
    enabled: !!token,
  });

  const hydrateDocumentTitles = useCallback(
    async (documentIds: string[]) => {
      if (!documentIds.length) return;
      const missingIds = documentIds.filter((id) => !documentTitles[id]);
      if (!missingIds.length) return;

      const resolved = await Promise.all(
        missingIds.map((id) => apiGetDocumentTitle(id, onSessionExpired, onTokenRefresh)),
      );

      setDocumentTitles((prev) => {
        const next = { ...prev };
        for (const item of resolved) {
          next[item.id] = item.title;
        }
        return next;
      });
    },
    [documentTitles, onSessionExpired, onTokenRefresh],
  );

  useEffect(() => {
    const threads = threadsQuery.data ?? [];
    if (!threads.length || activeThreadId) return;
    setActiveThreadId(threads[0]?.id ?? "");
  }, [threadsQuery.data, activeThreadId]);

  useEffect(() => {
    if (!threadDetailQuery.data) return;
    setSelectedDocumentIds(threadDetailQuery.data.linkedDocumentIds ?? []);
    setIdeologyProfileId(threadDetailQuery.data.thread.ideologyProfileId ?? "balanced");
    setKnowledgeSourceIds(
      threadDetailQuery.data.thread.knowledgeSourceIds?.length
        ? threadDetailQuery.data.thread.knowledgeSourceIds
        : ["documents"],
    );
  }, [threadDetailQuery.data]);

  useEffect(() => {
    void hydrateDocumentTitles(selectedDocumentIds).catch(() => {});
  }, [hydrateDocumentTitles, selectedDocumentIds]);

  useEffect(() => {
    setInputValue(assistantQuery);
  }, [assistantQuery]);

  useEffect(() => {
    inputValueRef.current = inputValue;
  }, [inputValue]);

  useEffect(() => {
    if (!mentionTerm) {
      setMentionCandidates([]);
      setMentionActiveIndex(-1);
      return;
    }
    if (mentionDocumentsQuery.isError) {
      setMentionCandidates([]);
      setMentionActiveIndex(-1);
      return;
    }
    const candidates = mentionDocumentsQuery.data ?? [];
    setMentionCandidates(candidates);
    setDocumentTitles((prev) => {
      const next = { ...prev };
      for (const candidate of candidates) {
        next[candidate.id] = candidate.title;
      }
      return next;
    });
    setMentionActiveIndex(candidates.length ? 0 : -1);
  }, [mentionDocumentsQuery.data, mentionDocumentsQuery.isError, mentionTerm]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (threadsOpen) {
        e.preventDefault();
        e.stopPropagation();
        setThreadsOpen(false);
        return;
      }
      if (selectedCitation) {
        e.preventDefault();
        e.stopPropagation();
        setSelectedCitation(null);
        return;
      }
      if (onClose) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose, selectedCitation, threadsOpen]);

  const createThreadMutation = useMutation({
    mutationFn: () => apiCreateAssistantThread("Новый диалог", onSessionExpired, onTokenRefresh),
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.assistant.threads });
      setActiveThreadId(created.id);
    },
  });

  const linkDocumentMutation = useMutation({
    mutationFn: async ({ threadId, documentId }: { threadId: string; documentId: string }) => {
      await apiLinkAssistantThreadDocument(threadId, documentId, onSessionExpired, onTokenRefresh);
    },
    onSuccess: async (_data, vars) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.assistant.threadDetail(vars.threadId),
      });
    },
  });

  const uploadAttachmentMutation = useMutation({
    mutationFn: async ({ threadId, file }: { threadId: string; file: File }) => {
      await apiUploadAssistantThreadAttachment(threadId, file, onSessionExpired, onTokenRefresh);
    },
    onSuccess: async (_data, vars) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.assistant.threadDetail(vars.threadId),
      });
    },
  });

  const generateThreadTitleMutation = useMutation({
    mutationFn: async (threadId: string) => {
      const response = await fetchWithAuth(
        `${apiBaseUrl}/assistant/threads/${threadId}/title`,
        { method: "POST" },
        onTokenRefresh,
      );
      await parseAuthenticatedJson<unknown>(response, onSessionExpired);
    },
    onSuccess: async (_data, threadId) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.assistant.threads });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.assistant.threadDetail(threadId),
      });
    },
  });

  const assistantStream = useAssistantStream({
    onUnauthorized: onSessionExpired,
    onTokenRefresh,
  });

  useEffect(() => {
    if (!awaitingPersistedAssistantMessage || !threadDetailQuery.data) return;
    const messages = threadDetailQuery.data.messages;
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "ASSISTANT" || !lastMessage.content.trim()) return;
    // Снимаем превью только после появления сохраненного ответа, чтобы текст не "исчезал".
    assistantStream.clearStreamText();
    setAwaitingPersistedAssistantMessage(false);
  }, [assistantStream, awaitingPersistedAssistantMessage, threadDetailQuery.data]);

  useEffect(() => {
    const detail = threadDetailQuery.data;
    if (!detail) return;
    const threadId = detail.thread.id;
    const threadTitle = (detail.thread.title ?? "").trim();
    const isDefaultTitle = !threadTitle || threadTitle === "Новый диалог";
    if (!isDefaultTitle) return;
    if (titleGenerationAttemptedRef.current.has(threadId)) return;
    const hasUserMessage = detail.messages.some(
      (message) => message.role === "USER" && !!message.content.trim(),
    );
    const hasAssistantMessage = detail.messages.some(
      (message) => message.role === "ASSISTANT" && !!message.content.trim(),
    );
    if (!hasUserMessage || !hasAssistantMessage) return;
    titleGenerationAttemptedRef.current.add(threadId);
    generateThreadTitleMutation.mutate(threadId, {
      onError: () => {
        // Ошибка автогенерации не должна мешать основному сценарию диалога.
      },
    });
  }, [generateThreadTitleMutation, threadDetailQuery.data]);

  const isAssistantBusy =
    createThreadMutation.isPending ||
    assistantStream.isStreaming ||
    linkDocumentMutation.isPending ||
    uploadAttachmentMutation.isPending ||
    generateThreadTitleMutation.isPending;

  async function createThread() {
    const created = await createThreadMutation.mutateAsync();
    toast.info("Создан новый диалог.");
    return created.id;
  }

  async function ensureThreadId(): Promise<string> {
    if (activeThreadId) {
      return activeThreadId;
    }
    return createThread();
  }

  async function sendRag(question: string) {
    if (!question.trim() || !token) return;
    try {
      const threadId = await ensureThreadId();
      await assistantStream.startStream({
        payload: {
          question,
          threadId,
          documentIds: selectedDocumentIds,
          knowledgeSourceIds,
          ideologyProfileId,
        },
        onDone: async () => {
          await queryClient.invalidateQueries({
            queryKey: queryKeys.assistant.threadDetail(threadId),
          });
          await queryClient.invalidateQueries({ queryKey: queryKeys.assistant.threads });
          setAwaitingPersistedAssistantMessage(true);
        },
        onError: (error) => {
          toast.error(mapApiErrorToMessage(error.message));
        },
      });
      setInputValue("");
      setAssistantQuery("");
      setMentionCandidates([]);
      setMentionActiveIndex(-1);
      setMentionTerm("");
    } catch (e) {
      toast.error(
        e instanceof Error
          ? mapApiErrorToMessage(e.message)
          : "Не удалось получить ответ ассистента",
      );
    }
  }

  function handleInputChange(nextValue: string) {
    setInputValue(nextValue);
    setAssistantQuery(nextValue);
    const mentionIndex = nextValue.lastIndexOf("@");
    if (mentionIndex < 0) {
      setMentionTerm("");
      return;
    }
    const tokenPart = nextValue.slice(mentionIndex + 1);
    if (tokenPart.includes(" ")) {
      setMentionTerm("");
      return;
    }
    setMentionTerm(tokenPart.trim());
  }

  function handleSubmit() {
    if (!inputValue.trim() || isAssistantBusy || !token) return;
    void sendRag(inputValue);
  }

  function handleStopAssistant() {
    assistantStream.stopStream();
  }

  function handleCitationClick(citation: Citation) {
    setSelectedCitation(citation);
  }

  async function attachMention(candidate: MentionDoc) {
    await linkDocument(candidate.id);
    const mentionIndex = inputValue.lastIndexOf("@");
    if (mentionIndex >= 0) {
      const next = `${inputValue.slice(0, mentionIndex)}@${candidate.title} `;
      handleInputChange(next);
      setMentionCandidates([]);
      setMentionActiveIndex(-1);
    }
  }

  async function linkDocument(documentId: string) {
    if (!documentId.trim()) return;
    try {
      const threadId = await ensureThreadId();
      await linkDocumentMutation.mutateAsync({ threadId, documentId });
      setMentionCandidates([]);
      setMentionActiveIndex(-1);
      setMentionTerm("");
      toast.info("Документ добавлен в контекст.");
    } catch (e) {
      toast.error(
        e instanceof Error ? mapApiErrorToMessage(e.message) : "Не удалось добавить документ",
      );
    }
  }

  async function uploadAttachment(file: File) {
    try {
      const threadId = await ensureThreadId();
      await uploadAttachmentMutation.mutateAsync({ threadId, file });
      toast.success("Файл прикреплен.");
    } catch (e) {
      toast.error(
        e instanceof Error ? mapApiErrorToMessage(e.message) : "Не удалось прикрепить файл",
      );
    }
  }

  async function startOrStopDictation() {
    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        mediaChunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audio = new Blob(mediaChunksRef.current, { type: "audio/webm" });
        const form = new FormData();
        form.append("audio", audio, "recording.webm");
        form.append("language", "ru");
        try {
          const response = await fetchWithAuth(
            `${apiBaseUrl}/stt/audio`,
            { method: "POST", body: form },
            onTokenRefresh,
          );
          const payload = await parseAuthenticatedJson<{ text: string }>(
            response,
            onSessionExpired,
          );
          const nextValue = [inputValueRef.current, payload.text].filter(Boolean).join(" ").trim();
          handleInputChange(nextValue);
        } catch (e) {
          toast.error(
            e instanceof Error ? mapApiErrorToMessage(e.message) : "Ошибка распознавания речи",
          );
        }
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch {
      toast.error(
        "Доступ к микрофону отклонён. Разрешите запись в настройках браузера для этого сайта и повторите.",
      );
    }
  }

  const threadDetail = threadDetailQuery.data;
  const threads = threadsQuery.data ?? [];
  const draftActions = (actionsQuery.data ?? []).filter((action) => action.status === "DRAFT");

  return (
    <aside
      className="relative flex shrink-0 flex-col border-l border-border bg-surface"
      style={{ width, height }}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 pb-3 pt-[14px]">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-text">Ассистент</span>
          <span className="rounded-xl bg-primarySoft px-2 py-[2px] text-[11px] font-medium text-primary">
            с источниками
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              type="button"
              className="rounded-md border border-border bg-white px-[10px] py-1.5 text-xs text-text"
              onClick={onClose}
            >
              Закрыть
            </button>
          )}
          <button
            className="rounded-md border border-border bg-white px-[10px] py-1.5 text-xs text-text"
            onClick={() => setThreadsOpen(true)}
          >
            Диалоги
          </button>
        </div>
      </div>
      <div className="shrink-0 px-4 pb-2 pt-2.5">
        <p className="mb-2 mt-0 text-[10px] font-bold uppercase tracking-[0.07em] text-muted">
          подсказки
        </p>
        <div className="flex flex-col gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => {
                handleInputChange(s);
              }}
              className="rounded-lg border border-border bg-white px-3 py-[9px] text-left text-[13px] leading-[1.4] text-text"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {isAssistantBusy && <p className="text-[13px] text-muted">Думаю…</p>}
        {threadsQuery.isError && (
          <p className="mb-2 mt-0 text-[13px] text-danger">
            {mapApiErrorToMessage(
              threadsQuery.error instanceof Error
                ? threadsQuery.error.message
                : "Не удалось загрузить диалоги",
            )}
          </p>
        )}
        {actionsQuery.isError && (
          <p className="mb-2 mt-0 text-[13px] text-danger">
            {mapApiErrorToMessage(
              actionsQuery.error instanceof Error
                ? actionsQuery.error.message
                : "Не удалось загрузить черновики действий",
            )}
          </p>
        )}
        {!!draftActions.length && (
          <div className="mb-2">
            <p className="mb-2 mt-0 text-[11px] text-muted">
              Черновики действий (требуют подтверждения)
            </p>
            <div className="grid gap-2">
              {draftActions.map((action) => (
                <ActionCard
                  key={action.id}
                  id={action.id}
                  intent={action.intent}
                  status={action.status}
                  entities={action.entities}
                  onSessionExpired={onSessionExpired}
                  onTokenRefresh={onTokenRefresh}
                />
              ))}
            </div>
          </div>
        )}
        {threadDetail && (
          <div>
            <p className="mb-2 mt-0 text-[11px] text-muted">
              Профиль: {ideologyProfileId} · Источники: {knowledgeSourceIds.join(", ")}
            </p>
            <div className="grid gap-2">
              {threadDetail.messages.map((m, idx) => {
                const isLastAssistant =
                  idx === threadDetail.messages.length - 1 && m.role === "ASSISTANT";
                return (
                  <div
                    key={m.id}
                    className="rounded-lg border border-border bg-white px-[10px] py-2"
                  >
                    <p className="mb-1 mt-0 text-[11px] text-muted">
                      {m.role === "USER" ? "Вы" : "Ассистент"}
                    </p>
                    {renderMessageMarkdown(m.content)}
                    {isLastAssistant && assistantStream.streamSources.length > 0 && (
                      <div
                        className="mt-1.5 flex flex-wrap items-center gap-1"
                        aria-label="Источники последнего ответа ассистента"
                      >
                        <span className="mr-1 text-[10px] uppercase tracking-[0.06em] text-muted">
                          Источники
                        </span>
                        {assistantStream.streamSources.map((citation) => (
                          <CitationChip
                            key={citation.chunkId}
                            citation={citation}
                            onClick={handleCitationClick}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {(assistantStream.isStreaming || assistantStream.streamText) && (
                <div className="rounded-lg border border-border bg-white px-[10px] py-2">
                  <p className="mb-1 mt-0 text-[11px] text-muted">Ассистент</p>
                  {renderMessageMarkdown(assistantStream.streamText || "…")}
                </div>
              )}
            </div>
            {selectedDocumentIds.length > 0 && (
              <div className="mt-2">
                <p className="mb-1 mt-0 text-[11px] text-muted">
                  Контекст RAG (выбранные документы для ответа)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDocumentIds.map((id) => (
                    <button
                      key={id}
                      type="button"
                      title="Убрать документ из контекста ответа"
                      aria-label={`Убрать из контекста: ${documentTitles[id] ?? id}`}
                      className="rounded-md border border-border bg-white px-2 py-[2px] text-[11px] text-text"
                      onClick={() =>
                        setSelectedDocumentIds((prev) => prev.filter((docId) => docId !== id))
                      }
                    >
                      {documentTitles[id] ?? id} ×
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="shrink-0 border-t border-border px-4 py-3">
        {!!mentionCandidates.length && (
          <div className="mb-2 grid gap-1 rounded-[10px] border border-border bg-white p-1.5">
            {mentionCandidates.map((candidate) => (
              <button
                key={candidate.id}
                onClick={() => void attachMention(candidate)}
                className={`rounded-md border-none px-2 py-1.5 text-left text-xs text-text ${
                  mentionCandidates[mentionActiveIndex]?.id === candidate.id
                    ? "bg-primarySoft"
                    : "bg-transparent"
                }`}
              >
                <span className="mr-1.5 text-primary">@</span>
                {candidate.title}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-1.5">
          <input
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (mentionCandidates.length) {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setMentionActiveIndex((prev) => (prev + 1) % mentionCandidates.length);
                  return;
                }
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setMentionActiveIndex((prev) =>
                    prev <= 0 ? mentionCandidates.length - 1 : prev - 1,
                  );
                  return;
                }
                if (e.key === "Enter") {
                  e.preventDefault();
                  const candidate = mentionCandidates[mentionActiveIndex] ?? mentionCandidates[0];
                  if (candidate) {
                    void attachMention(candidate);
                  }
                  return;
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  setMentionCandidates([]);
                  setMentionActiveIndex(-1);
                  return;
                }
              }
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Спросите по вашим документам…"
            className="flex-1 rounded-lg border border-border bg-surface px-[10px] py-2 text-[13px] outline-none"
          />
          <button
            type="button"
            onClick={() => void startOrStopDictation()}
            aria-label={
              recording
                ? "Остановить запись голоса и распознать текст"
                : "Голосовой ввод: записать речь и вставить текст в поле"
            }
            className={`rounded-lg border border-border px-[10px] py-2 text-sm ${
              recording ? "bg-dangerSoft text-danger" : "bg-white text-text"
            }`}
            title={
              recording
                ? "Остановить запись и отправить аудио на распознавание"
                : "Диктовка: записать с микрофона и вставить текст (нужен доступ к микрофону)"
            }
          >
            🎤
          </button>
          <button
            type="button"
            onClick={() => uploadRef.current?.click()}
            aria-label="Прикрепить файл к текущему диалогу ассистента"
            className="rounded-lg border border-border bg-white px-[10px] py-2 text-sm text-text"
            title="Прикрепить файл к диалогу (загрузка во вложения текущего чата)"
          >
            ＋
          </button>
          <input
            ref={uploadRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              void uploadAttachment(file);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={handleStopAssistant}
            disabled={!assistantStream.isStreaming}
            aria-label="Остановить потоковый ответ ассистента"
            className="rounded-lg border border-border bg-white px-[10px] py-2 text-xs text-text disabled:opacity-50"
            title="Остановить генерацию текущего ответа"
          >
            Stop
          </button>
          <button
            onClick={handleSubmit}
            disabled={!inputValue.trim() || isAssistantBusy || !token}
            aria-label="Отправить вопрос ассистенту"
            className="rounded-lg border-0 bg-primary px-3 py-2 text-base text-white disabled:opacity-50"
          >
            ↑
          </button>
        </div>
        <p className="mb-0 mt-1.5 text-center text-[10px] text-muted">
          AI-ассистент · RAG + действия через сервер
        </p>
      </div>
      {threadsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Диалоги ассистента"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setThreadsOpen(false);
          }}
          className="absolute inset-0 z-[5] flex justify-end bg-overlay"
        >
          <div
            className="box-border flex h-full flex-col gap-2.5 border-l border-border bg-white p-[14px]"
            style={{ width: Math.min(360, width) }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <p className="m-0 text-sm font-bold text-text">Диалоги</p>
              <button type="button" className={smallBtnClass} onClick={() => setThreadsOpen(false)}>
                Закрыть
              </button>
            </div>
            <button
              type="button"
              className="rounded-md border-0 bg-primary px-3 py-1 text-xs text-white"
              onClick={() => void createThread()}
            >
              + Новый чат
            </button>
            <div
              className="grid gap-1.5 overflow-y-auto"
              role="listbox"
              aria-label="Список диалогов"
            >
              {threads.map((thread) => (
                <button
                  key={thread.id}
                  type="button"
                  role="option"
                  aria-selected={activeThreadId === thread.id}
                  onClick={() => {
                    setActiveThreadId(thread.id);
                    setThreadsOpen(false);
                    void queryClient.invalidateQueries({
                      queryKey: queryKeys.assistant.threadDetail(thread.id),
                    });
                  }}
                  className={`rounded-md px-3 py-2.5 text-left text-xs ${
                    activeThreadId === thread.id
                      ? "border border-primary bg-primarySoft text-text"
                      : "border border-border bg-white text-text"
                  }`}
                >
                  {thread.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <CitationSidebar
        citation={selectedCitation}
        open={!!selectedCitation}
        onClose={() => setSelectedCitation(null)}
      />
    </aside>
  );
}
