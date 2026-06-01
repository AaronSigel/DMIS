import { useState, useRef, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  apiListAssistantThreads,
  apiGetAssistantThreadDetail,
  apiCreateAssistantThread,
  apiDeleteAssistantThread,
  apiBaseUrl,
  fetchWithAuth,
  parseAuthenticatedJson,
} from "../../../apiClient";
import { queryKeys } from "../../../shared/api/queryClient";
import { useToast } from "../../../shared/ui/ToastProvider";
import { mapApiErrorToMessage } from "../../../shared/lib/mapApiErrorToMessage";
import type { z } from "zod";
import {
  AssistantThreadViewSchema,
  AssistantThreadDetailViewSchema,
} from "../../../shared/api/schemas/assistant";

type AssistantThreadView = z.infer<typeof AssistantThreadViewSchema>;
type AssistantThreadDetailView = z.infer<typeof AssistantThreadDetailViewSchema>;

type UseThreadManagementArgs = {
  token: string;
  onSessionExpired: () => void;
  onTokenRefresh?: (token: string) => void;
};

export type UseThreadManagementReturn = {
  threads: AssistantThreadView[];
  threadDetail: AssistantThreadDetailView | undefined;
  activeThreadId: string;
  setActiveThreadId: (id: string) => void;
  selectThread: (id: string) => void;
  ensureThreadId: () => Promise<string>;
  createThread: () => Promise<string>;
  deleteThread: (id: string, title: string) => void;
  handleDeleteThreadConfirmed: () => Promise<void>;
  threadsOpen: boolean;
  setThreadsOpen: (open: boolean) => void;
  deleteThreadDialog: { open: boolean; threadId: string; threadTitle: string };
  setDeleteThreadDialog: React.Dispatch<
    React.SetStateAction<{ open: boolean; threadId: string; threadTitle: string }>
  >;
  deletePending: boolean;
  createPending: boolean;
  threadsQueryError: Error | null;
  refetchThreadDetail: () => void;
};

export function useThreadManagement({
  token,
  onSessionExpired,
  onTokenRefresh,
}: UseThreadManagementArgs): UseThreadManagementReturn {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [activeThreadId, setActiveThreadId] = useState("");
  const [threadsOpen, setThreadsOpen] = useState(false);
  const [deleteThreadDialog, setDeleteThreadDialog] = useState<{
    open: boolean;
    threadId: string;
    threadTitle: string;
  }>({ open: false, threadId: "", threadTitle: "" });

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

  const threads = useMemo(() => threadsQuery.data ?? [], [threadsQuery.data]);

  useEffect(() => {
    if (!threads.length || activeThreadId) return;
    setActiveThreadId(threads[0]?.id ?? "");
  }, [threads, activeThreadId]);

  const createThreadMutation = useMutation({
    mutationFn: () => apiCreateAssistantThread("Новый диалог", onSessionExpired, onTokenRefresh),
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.assistant.threads });
      setActiveThreadId(created.id);
    },
  });

  const deleteThreadMutation = useMutation({
    mutationFn: async (threadId: string) => {
      await apiDeleteAssistantThread(threadId, onSessionExpired, onTokenRefresh);
    },
    onSuccess: async (_data, deletedThreadId) => {
      const nextThreads = threads.filter((thread) => thread.id !== deletedThreadId);
      if (activeThreadId === deletedThreadId) {
        setActiveThreadId(nextThreads[0]?.id ?? "");
      }
      await queryClient.invalidateQueries({ queryKey: queryKeys.assistant.threads });
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

  useEffect(() => {
    const detail = threadDetailQuery.data;
    if (!detail) return;
    const threadId = detail.thread.id;
    const threadTitle = (detail.thread.title ?? "").trim();
    if (threadTitle && threadTitle !== "Новый диалог") return;
    if (titleGenerationAttemptedRef.current.has(threadId)) return;
    const hasUserMessage = detail.messages.some(
      (message) => message.role === "USER" && !!message.content.trim(),
    );
    const hasAssistantMessage = detail.messages.some(
      (message) => message.role === "ASSISTANT" && !!message.content.trim(),
    );
    if (!hasUserMessage || !hasAssistantMessage) return;
    titleGenerationAttemptedRef.current.add(threadId);
    generateThreadTitleMutation.mutate(threadId, { onError: () => {} });
  }, [generateThreadTitleMutation, threadDetailQuery.data]);

  async function createThread() {
    const created = await createThreadMutation.mutateAsync();
    toast.info("Создан новый диалог.");
    return created.id;
  }

  function deleteThread(threadId: string, threadTitle: string) {
    setDeleteThreadDialog({ open: true, threadId, threadTitle });
  }

  async function handleDeleteThreadConfirmed() {
    const { threadId } = deleteThreadDialog;
    setDeleteThreadDialog((prev) => ({ ...prev, open: false }));
    try {
      await deleteThreadMutation.mutateAsync(threadId);
      toast.success("Диалог удален.");
    } catch (e) {
      toast.error(
        e instanceof Error ? mapApiErrorToMessage(e.message) : "Не удалось удалить диалог",
      );
    }
  }

  async function ensureThreadId(): Promise<string> {
    if (activeThreadId) return activeThreadId;
    return createThread();
  }

  function selectThread(threadId: string) {
    setActiveThreadId(threadId);
    void queryClient.invalidateQueries({
      queryKey: queryKeys.assistant.threadDetail(threadId),
    });
  }

  return {
    threads,
    threadDetail: threadDetailQuery.data,
    activeThreadId,
    setActiveThreadId,
    selectThread,
    ensureThreadId,
    createThread,
    deleteThread,
    handleDeleteThreadConfirmed,
    threadsOpen,
    setThreadsOpen,
    deleteThreadDialog,
    setDeleteThreadDialog,
    deletePending: deleteThreadMutation.isPending,
    createPending: createThreadMutation.isPending,
    threadsQueryError: threadsQuery.error instanceof Error ? threadsQuery.error : null,
    refetchThreadDetail: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.assistant.threadDetail(activeThreadId),
      });
    },
  };
}
