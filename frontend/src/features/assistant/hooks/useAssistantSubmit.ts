import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiSubmitAssistantRequest, type AssistantStreamPayload } from "../../../apiClient";
import { queryKeys } from "../../../shared/api/queryClient";
import { useAssistantStream } from "../../../shared/sse/useAssistantStream";
import { useUiStore } from "../../../shared/store/uiStore";
import { useToast } from "../../../shared/ui/ToastProvider";
import { mapApiErrorToMessage } from "../../../shared/lib/mapApiErrorToMessage";
import { contextDiagnosticMessage } from "../assistantDocumentStatus";
import type { ActionView } from "../../../shared/api/schemas/action";
import type { ClarificationState } from "../ClarificationForm";

// Непустой sentinel отличает активный пустой алиас от сброшенного состояния.
const EMPTY_ALIAS_TERM = " ";

type AssistantThreadDetailLike =
  | {
      thread: {
        ideologyProfileId?: string | null;
        knowledgeSourceIds?: string[] | null;
      };
      messages: Array<{ role: string; content: string }>;
    }
  | undefined;

type UseAssistantSubmitArgs = {
  token: string;
  onSessionExpired: () => void;
  onTokenRefresh?: (token: string) => void;
  inputValue: string;
  setInputValue: (v: string) => void;
  inputValueRef: React.MutableRefObject<string>;
  activeThreadId: string;
  ensureThreadId: () => Promise<string>;
  threadDetail: AssistantThreadDetailLike;
  selectedDocumentIds: string[];
  clearMentionCandidates: () => void;
  setMentionTerm: (term: string | null) => void;
  clearUserMentionCandidates: () => void;
  setUserMentionTerm: (term: string | null) => void;
  appendActionToThread: (threadId: string, action: ActionView) => void;
  setClarificationByThread: React.Dispatch<
    React.SetStateAction<Record<string, ClarificationState | null>>
  >;
  setClarificationValuesByThread: React.Dispatch<
    React.SetStateAction<Record<string, Record<string, string>>>
  >;
  createPending: boolean;
  deletePending: boolean;
  linkPending: boolean;
  uploadPending: boolean;
};

export type UseAssistantSubmitReturn = {
  ideologyProfileId: string;
  setIdeologyProfileId: (id: string) => void;
  knowledgeSourceIds: string[];
  setKnowledgeSourceIds: (ids: string[]) => void;
  assistantStream: ReturnType<typeof useAssistantStream>;
  blocksUserSend: boolean;
  messageCount: number;
  sendRag: (
    question: string,
    existingThreadId?: string,
    payloadOverride?: AssistantStreamPayload,
  ) => Promise<void>;
  sendAssistantInput: (question: string) => Promise<void>;
  handleInputChange: (value: string) => void;
  handleSubmit: () => void;
  handleSuggestion: (prompt: string) => void;
  lastSubmitRef: React.MutableRefObject<(() => void) | null>;
};

export function useAssistantSubmit({
  token,
  onSessionExpired,
  onTokenRefresh,
  inputValue,
  setInputValue,
  inputValueRef,
  activeThreadId,
  ensureThreadId,
  threadDetail,
  selectedDocumentIds,
  clearMentionCandidates,
  setMentionTerm,
  clearUserMentionCandidates,
  setUserMentionTerm,
  appendActionToThread,
  setClarificationByThread,
  setClarificationValuesByThread,
  createPending,
  deletePending,
  linkPending,
  uploadPending,
}: UseAssistantSubmitArgs): UseAssistantSubmitReturn {
  const queryClient = useQueryClient();
  const toast = useToast();
  const setAssistantQuery = useUiStore((state) => state.setAssistantQuery);

  const [ideologyProfileId, setIdeologyProfileId] = useState("balanced");
  const [knowledgeSourceIds, setKnowledgeSourceIds] = useState<string[]>(["documents"]);
  const [awaitingPersistedAssistantMessage, setAwaitingPersistedAssistantMessage] = useState(false);

  const lastTextRef = useRef<string>("");
  const lastSubmitRef = useRef<(() => void) | null>(null);

  const assistantStream = useAssistantStream({
    onUnauthorized: onSessionExpired,
    onTokenRefresh,
  });

  useEffect(() => {
    if (!threadDetail) return;
    setIdeologyProfileId(threadDetail.thread.ideologyProfileId ?? "balanced");
    setKnowledgeSourceIds(
      threadDetail.thread.knowledgeSourceIds?.length
        ? threadDetail.thread.knowledgeSourceIds
        : ["documents"],
    );
  }, [threadDetail]);

  useEffect(() => {
    if (!awaitingPersistedAssistantMessage || !threadDetail) return;
    const messages = threadDetail.messages;
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "ASSISTANT" || !lastMessage.content.trim()) return;
    assistantStream.clearStreamText();
    setAwaitingPersistedAssistantMessage(false);
  }, [assistantStream, awaitingPersistedAssistantMessage, threadDetail]);

  const messageCount = threadDetail?.messages.length ?? 0;

  const blocksUserSend =
    createPending || deletePending || assistantStream.isStreaming || linkPending || uploadPending;

  async function sendRag(
    question: string,
    existingThreadId?: string,
    payloadOverride?: AssistantStreamPayload,
  ) {
    if (!question.trim() && !payloadOverride) return;
    try {
      const threadId = existingThreadId ?? payloadOverride?.threadId ?? (await ensureThreadId());
      const payload: AssistantStreamPayload = payloadOverride ?? {
        question,
        threadId,
        documentIds: selectedDocumentIds,
        knowledgeSourceIds,
        ideologyProfileId,
      };
      await assistantStream.startStream({
        payload,
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
      clearMentionCandidates();
      setMentionTerm(null);
      clearUserMentionCandidates();
      setUserMentionTerm(null);
    } catch (e) {
      toast.error(
        e instanceof Error
          ? mapApiErrorToMessage(e.message)
          : "Не удалось получить ответ ассистента",
      );
    }
  }

  async function sendAssistantInput(question: string) {
    if (!question.trim() || !token) return;
    lastTextRef.current = question;
    lastSubmitRef.current = () => {
      void sendAssistantInput(lastTextRef.current);
    };
    const threadId = await ensureThreadId();
    const result = await apiSubmitAssistantRequest(
      threadId,
      question,
      selectedDocumentIds,
      knowledgeSourceIds,
      ideologyProfileId,
      onSessionExpired,
      onTokenRefresh,
    );

    if (result.responseType === "NEEDS_CLARIFICATION" && result.missingFields?.length) {
      setClarificationByThread((prev) => ({
        ...prev,
        [threadId]: {
          intent: result.clarificationIntent ?? "unknown",
          missingFields: result.missingFields ?? [],
          partialEntities: result.partialEntities ?? {},
          originalText: question,
        },
      }));
      setClarificationValuesByThread((prev) => ({ ...prev, [threadId]: {} }));
      setInputValue("");
      setAssistantQuery("");
      clearMentionCandidates();
      setMentionTerm(null);
      clearUserMentionCandidates();
      setUserMentionTerm(null);
      return;
    }

    if (result.action) {
      setClarificationByThread((prev) => ({ ...prev, [threadId]: null }));
      appendActionToThread(threadId, result.action);
      await queryClient.invalidateQueries({ queryKey: queryKeys.actions.byThread(threadId) });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.assistant.threadDetail(threadId),
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.assistant.threads });
      setInputValue("");
      setAssistantQuery("");
      clearMentionCandidates();
      setMentionTerm(null);
      clearUserMentionCandidates();
      setUserMentionTerm(null);
      toast.success("Черновик действия создан.");
      return;
    }

    if (result.diagnosticCode && result.diagnosticCode !== "OK" && !result.streamPayload) {
      assistantStream.showStaticResponse(
        result.message ?? contextDiagnosticMessage(result.diagnosticCode) ?? result.diagnosticCode,
        result.diagnosticCode,
      );
      setInputValue("");
      setAssistantQuery("");
      clearMentionCandidates();
      setMentionTerm(null);
      clearUserMentionCandidates();
      setUserMentionTerm(null);
      return;
    }

    if (result.streamPayload) {
      await sendRag(question, threadId, result.streamPayload);
      return;
    }
    await sendRag(question, threadId);
  }

  function handleInputChange(nextValue: string) {
    setInputValue(nextValue);
    setAssistantQuery(nextValue);
    const mentionIndex = nextValue.lastIndexOf("@");
    const userMentionIndex = nextValue.lastIndexOf("#");
    const activeMentionIndex = Math.max(mentionIndex, userMentionIndex);
    if (activeMentionIndex < 0) {
      setMentionTerm(null);
      setUserMentionTerm(null);
      clearMentionCandidates();
      clearUserMentionCandidates();
      return;
    }
    const tokenPart = nextValue.slice(activeMentionIndex + 1);
    if (tokenPart.includes(" ")) {
      setMentionTerm(null);
      setUserMentionTerm(null);
      clearMentionCandidates();
      clearUserMentionCandidates();
      return;
    }
    if (activeMentionIndex === userMentionIndex) {
      setMentionTerm(null);
      clearMentionCandidates();
      setUserMentionTerm(tokenPart.trim() || EMPTY_ALIAS_TERM);
      return;
    }
    setMentionTerm(tokenPart.trim() || EMPTY_ALIAS_TERM);
    clearUserMentionCandidates();
    setUserMentionTerm(null);
  }

  function handleSubmit() {
    if (!inputValue.trim() || blocksUserSend || !token) return;
    void sendAssistantInput(inputValue).catch((e) => {
      toast.error(
        e instanceof Error
          ? mapApiErrorToMessage(e.message)
          : "Не удалось обработать запрос ассистента",
      );
    });
  }

  function handleSuggestion(prompt: string) {
    if (blocksUserSend || !token) return;
    void sendAssistantInput(prompt).catch((e) => {
      toast.error(
        e instanceof Error
          ? mapApiErrorToMessage(e.message)
          : "Не удалось обработать запрос ассистента",
      );
    });
  }

  return {
    ideologyProfileId,
    setIdeologyProfileId,
    knowledgeSourceIds,
    setKnowledgeSourceIds,
    assistantStream,
    blocksUserSend,
    messageCount,
    sendRag,
    sendAssistantInput,
    handleInputChange,
    handleSubmit,
    handleSuggestion,
    lastSubmitRef,
  };
}
