import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";

import { useAssistantSubmit } from "./useAssistantSubmit";
import type { AssistantStreamPayload, AssistantSubmitResult } from "../../../apiClient";

const mocks = vi.hoisted(() => ({
  apiSubmitAssistantRequest:
    vi.fn<(threadId: string, text: string) => Promise<AssistantSubmitResult>>(),
  startStream: vi.fn(),
  showStaticResponse: vi.fn(),
  clearStreamText: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  setAssistantQuery: vi.fn(),
}));

vi.mock("../../../apiClient", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../../apiClient")>();
  return {
    ...actual,
    apiSubmitAssistantRequest: mocks.apiSubmitAssistantRequest,
  };
});

vi.mock("../../../shared/sse/useAssistantStream", () => ({
  useAssistantStream: () => ({
    isStreaming: false,
    streamText: "",
    streamSources: [],
    streamContextDiagnostic: null,
    streamError: null,
    streamPipeline: null,
    startStream: mocks.startStream,
    stopStream: vi.fn(),
    resetStream: vi.fn(),
    clearStreamText: mocks.clearStreamText,
    showStaticResponse: mocks.showStaticResponse,
  }),
}));

vi.mock("../../../shared/ui/ToastProvider", () => ({
  useToast: () => ({
    success: mocks.toastSuccess,
    error: mocks.toastError,
  }),
}));

vi.mock("../../../shared/store/uiStore", () => ({
  useUiStore: (selector: (state: { setAssistantQuery: (value: string) => void }) => unknown) =>
    selector({ setAssistantQuery: mocks.setAssistantQuery }),
}));

function setup() {
  const queryClient = new QueryClient();
  const appendActionToThread = vi.fn();
  const setClarificationByThread = vi.fn();
  const setClarificationValuesByThread = vi.fn();
  const setInputValue = vi.fn();
  const inputValueRef = { current: "" };
  const ensureThreadId = vi.fn().mockResolvedValue("thread-1");
  const clearMentionCandidates = vi.fn();
  const setMentionTerm = vi.fn();
  const clearUserMentionCandidates = vi.fn();
  const setUserMentionTerm = vi.fn();
  const onSessionExpired = vi.fn();
  const onTokenRefresh = vi.fn();

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const hook = renderHook(
    () =>
      useAssistantSubmit({
        token: "token",
        onSessionExpired,
        onTokenRefresh,
        inputValue: "",
        setInputValue,
        inputValueRef,
        activeThreadId: "thread-1",
        ensureThreadId,
        threadDetail: undefined,
        selectedDocumentIds: ["doc-1"],
        clearMentionCandidates,
        setMentionTerm,
        clearUserMentionCandidates,
        setUserMentionTerm,
        appendActionToThread,
        setClarificationByThread,
        setClarificationValuesByThread,
        createPending: false,
        deletePending: false,
        linkPending: false,
        uploadPending: false,
      }),
    { wrapper },
  );

  return {
    hook,
    appendActionToThread,
    setClarificationByThread,
    setClarificationValuesByThread,
    setInputValue,
    clearMentionCandidates,
    setMentionTerm,
    clearUserMentionCandidates,
    setUserMentionTerm,
    ensureThreadId,
    queryClient,
  };
}

describe("useAssistantSubmit.sendAssistantInput routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets clarification state and does not show draft toast for NEEDS_CLARIFICATION", async () => {
    const { hook, setClarificationByThread, setClarificationValuesByThread } = setup();

    mocks.apiSubmitAssistantRequest.mockResolvedValueOnce({
      route: "clarification",
      responseType: "NEEDS_CLARIFICATION",
      clarificationIntent: "create_action",
      missingFields: ["assignee"],
      partialEntities: { title: "Task" },
    });

    await hook.result.current.sendAssistantInput("please create action");

    expect(setClarificationByThread).toHaveBeenCalledTimes(1);
    expect(setClarificationValuesByThread).toHaveBeenCalledTimes(1);
    expect(mocks.toastSuccess).not.toHaveBeenCalledWith("Черновик действия создан.");
    expect(mocks.showStaticResponse).not.toHaveBeenCalled();
    expect(mocks.startStream).not.toHaveBeenCalled();
  });

  it("appends action and shows success toast when result.action is returned", async () => {
    const { hook, appendActionToThread } = setup();

    mocks.apiSubmitAssistantRequest.mockResolvedValueOnce({
      route: "action",
      action: { id: "action-1" } as never,
    });

    await hook.result.current.sendAssistantInput("create a follow-up");

    expect(appendActionToThread).toHaveBeenCalledWith(
      "thread-1",
      expect.objectContaining({ id: "action-1" }),
    );
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Черновик действия создан.");
    expect(mocks.showStaticResponse).not.toHaveBeenCalled();
  });

  it("uses static response path for diagnostic without streamPayload", async () => {
    const { hook } = setup();

    mocks.apiSubmitAssistantRequest.mockResolvedValueOnce({
      route: "diagnostic",
      diagnosticCode: "NO_CONTEXT",
      message: "Нет доступного контекста",
      streamPayload: null,
    });

    await hook.result.current.sendAssistantInput("question");

    expect(mocks.showStaticResponse).toHaveBeenCalledWith("Нет доступного контекста", "NO_CONTEXT");
    expect(mocks.startStream).not.toHaveBeenCalled();
  });

  it("uses streaming path when streamPayload is returned", async () => {
    const { hook } = setup();

    const payload: AssistantStreamPayload = {
      question: "payload question",
      threadId: "thread-1",
      documentIds: ["doc-9"],
      knowledgeSourceIds: ["documents"],
      ideologyProfileId: "balanced",
    };

    mocks.apiSubmitAssistantRequest.mockResolvedValueOnce({
      route: "stream",
      streamPayload: payload,
    });

    await hook.result.current.sendAssistantInput("question");

    await waitFor(() => {
      expect(mocks.startStream).toHaveBeenCalledTimes(1);
    });
    expect(mocks.startStream).toHaveBeenCalledWith(
      expect.objectContaining({
        payload,
        onDone: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
  });
});
