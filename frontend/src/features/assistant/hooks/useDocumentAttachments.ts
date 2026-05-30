import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  apiMentionDocuments,
  apiLinkAssistantThreadDocument,
  apiUnlinkAssistantThreadDocument,
  apiUploadAssistantThreadAttachment,
  apiGetDocumentTitle,
  apiGetAssistantDocumentStatuses,
} from "../../../apiClient";
import { queryKeys } from "../../../shared/api/queryClient";
import { useUiStore } from "../../../shared/store/uiStore";
import { useToast } from "../../../shared/ui/ToastProvider";
import { mapApiErrorToMessage } from "../../../shared/lib/mapApiErrorToMessage";
import type { AssistantDocumentStatusView } from "../../../shared/api/schemas/assistant";
import type { MentionDoc } from "../assistantPanelTypes";

const STATUS_POLL_INTERVAL_MS = 1500;
const STATUS_POLL_MAX_MS = 60_000;

type UseDocumentAttachmentsArgs = {
  token: string;
  onSessionExpired: () => void;
  onTokenRefresh?: (token: string) => void;
  activeThreadId: string;
  ensureThreadId: () => Promise<string>;
  threadDetail: { linkedDocumentIds?: string[] } | undefined;
  inputValueRef: React.MutableRefObject<string>;
  setInputValue: (v: string) => void;
  setAssistantQuery: (v: string) => void;
};

export type UseDocumentAttachmentsReturn = {
  selectedDocumentIds: string[];
  setSelectedDocumentIds: React.Dispatch<React.SetStateAction<string[]>>;
  documentTitles: Record<string, string>;
  setDocumentTitles: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  documentStatuses: Record<string, AssistantDocumentStatusView>;
  mentionCandidates: MentionDoc[];
  mentionTerm: string;
  setMentionTerm: (term: string) => void;
  mentionActiveIndex: number;
  setMentionActiveIndex: (i: number) => void;
  clearMentionCandidates: () => void;
  uploadRef: React.RefObject<HTMLInputElement>;
  linkDocument: (documentId: string) => Promise<void>;
  unlinkDocument: (documentId: string) => void;
  attachMention: (candidate: MentionDoc) => Promise<void>;
  uploadAttachment: (file: File) => Promise<void>;
  uploadPending: boolean;
  linkPending: boolean;
};

export function useDocumentAttachments({
  token,
  onSessionExpired,
  onTokenRefresh,
  activeThreadId,
  ensureThreadId,
  threadDetail,
  inputValueRef,
  setInputValue,
  setAssistantQuery,
}: UseDocumentAttachmentsArgs): UseDocumentAttachmentsReturn {
  const queryClient = useQueryClient();
  const toast = useToast();
  const consumePendingLinkedDocuments = useUiStore((state) => state.consumePendingLinkedDocuments);
  const assistantContext = useUiStore((state) => state.assistantContext);

  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [documentStatuses, setDocumentStatuses] = useState<
    Record<string, AssistantDocumentStatusView>
  >({});
  const [mentionCandidates, setMentionCandidates] = useState<MentionDoc[]>([]);
  const [mentionTerm, setMentionTerm] = useState("");
  const [documentTitles, setDocumentTitles] = useState<Record<string, string>>({});
  const [mentionActiveIndex, setMentionActiveIndex] = useState(-1);

  const uploadRef = useRef<HTMLInputElement>(null);
  const workspaceDocLinkedRef = useRef<string | null>(null);

  const mentionDocumentsQuery = useQuery({
    queryKey: ["assistant-mention-documents", mentionTerm],
    queryFn: () => apiMentionDocuments(mentionTerm, onSessionExpired, onTokenRefresh),
    enabled: !!token && mentionTerm.length > 0,
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
    if (!threadDetail) return;
    setSelectedDocumentIds(threadDetail.linkedDocumentIds ?? []);
  }, [threadDetail]);

  useEffect(() => {
    const pending = consumePendingLinkedDocuments();
    if (pending.length) {
      setSelectedDocumentIds((prev) => [...new Set([...prev, ...pending])]);
    }
  }, [consumePendingLinkedDocuments]);

  useEffect(() => {
    const docObject = assistantContext.object;
    if (docObject?.type !== "DOCUMENT") {
      workspaceDocLinkedRef.current = null;
      return;
    }
    if (selectedDocumentIds.includes(docObject.id)) {
      workspaceDocLinkedRef.current = docObject.id;
      return;
    }
    if (workspaceDocLinkedRef.current === docObject.id) return;
    workspaceDocLinkedRef.current = docObject.id;
    setSelectedDocumentIds((prev) => [...new Set([...prev, docObject.id])]);
    if (docObject.title) {
      setDocumentTitles((prev) => ({ ...prev, [docObject.id]: docObject.title! }));
    }
    if (activeThreadId && token) {
      void apiLinkAssistantThreadDocument(
        activeThreadId,
        docObject.id,
        onSessionExpired,
        onTokenRefresh,
      ).then(() => {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.assistant.threadDetail(activeThreadId),
        });
      });
    }
  }, [
    activeThreadId,
    assistantContext.object,
    onSessionExpired,
    onTokenRefresh,
    queryClient,
    selectedDocumentIds,
    token,
  ]);

  useEffect(() => {
    if (!selectedDocumentIds.length || !token) return;
    let cancelled = false;
    let elapsedMs = 0;
    const refreshStatuses = async (): Promise<AssistantDocumentStatusView[]> => {
      try {
        const statuses = await apiGetAssistantDocumentStatuses(
          selectedDocumentIds,
          onSessionExpired,
          onTokenRefresh,
        );
        if (cancelled) return statuses;
        setDocumentStatuses((prev) => {
          const next = { ...prev };
          for (const status of statuses) {
            next[status.documentId] = status;
          }
          return next;
        });
        return statuses;
      } catch {
        return [];
      }
    };
    void refreshStatuses();
    const timer = window.setInterval(() => {
      elapsedMs += STATUS_POLL_INTERVAL_MS;
      void refreshStatuses().then((statuses) => {
        if (cancelled) return;
        if (elapsedMs >= STATUS_POLL_MAX_MS) {
          window.clearInterval(timer);
          return;
        }
        const allTerminal = selectedDocumentIds.every((id) => {
          const status = statuses.find((item) => item.documentId === id);
          return status?.status === "INDEXED" || status?.status === "FAILED";
        });
        if (allTerminal) window.clearInterval(timer);
      });
    }, STATUS_POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [onSessionExpired, onTokenRefresh, selectedDocumentIds, token]);

  useEffect(() => {
    void hydrateDocumentTitles(selectedDocumentIds).catch(() => {});
  }, [hydrateDocumentTitles, selectedDocumentIds]);

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

  const unlinkDocumentMutation = useMutation({
    mutationFn: async ({ threadId, documentId }: { threadId: string; documentId: string }) => {
      await apiUnlinkAssistantThreadDocument(
        threadId,
        documentId,
        onSessionExpired,
        onTokenRefresh,
      );
    },
    onSuccess: async (_data, vars) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.assistant.threadDetail(vars.threadId),
      });
    },
  });

  const uploadAttachmentMutation = useMutation({
    mutationFn: async ({ threadId, file }: { threadId: string; file: File }) =>
      apiUploadAssistantThreadAttachment(threadId, file, onSessionExpired, onTokenRefresh),
    onSuccess: async (uploaded, vars) => {
      setSelectedDocumentIds((prev) => [...new Set([...prev, uploaded.id])]);
      setDocumentTitles((prev) => ({ ...prev, [uploaded.id]: uploaded.title }));
      await queryClient.invalidateQueries({
        queryKey: queryKeys.assistant.threadDetail(vars.threadId),
      });
    },
  });

  async function linkDocument(documentId: string) {
    if (!documentId.trim()) return;
    try {
      const threadId = await ensureThreadId();
      setSelectedDocumentIds((prev) => [...new Set([...prev, documentId])]);
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

  function unlinkDocument(documentId: string) {
    setSelectedDocumentIds((prev) => prev.filter((id) => id !== documentId));
    if (activeThreadId) {
      void unlinkDocumentMutation.mutateAsync({ threadId: activeThreadId, documentId });
    }
  }

  async function attachMention(candidate: MentionDoc) {
    await linkDocument(candidate.id);
    const currentInput = inputValueRef.current;
    const mentionIndex = currentInput.lastIndexOf("@");
    if (mentionIndex >= 0) {
      const newValue = `${currentInput.slice(0, mentionIndex)}@${candidate.title} `;
      setInputValue(newValue);
      setAssistantQuery(newValue);
      setMentionCandidates([]);
      setMentionActiveIndex(-1);
      setMentionTerm("");
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

  return {
    selectedDocumentIds,
    setSelectedDocumentIds,
    documentTitles,
    setDocumentTitles,
    documentStatuses,
    mentionCandidates,
    mentionTerm,
    setMentionTerm,
    mentionActiveIndex,
    setMentionActiveIndex,
    clearMentionCandidates: () => {
      setMentionCandidates([]);
      setMentionActiveIndex(-1);
    },
    uploadRef,
    linkDocument,
    unlinkDocument,
    attachMention,
    uploadAttachment,
    uploadPending: uploadAttachmentMutation.isPending,
    linkPending: linkDocumentMutation.isPending,
  };
}
