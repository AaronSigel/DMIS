import { useEffect, useRef, useState } from "react";
import { useAssistantActions } from "./hooks/useAssistantActions";
import { useAssistantSubmit } from "./hooks/useAssistantSubmit";
import { useDictation } from "./hooks/useDictation";
import { useDocumentAttachments } from "./hooks/useDocumentAttachments";
import { useThreadManagement } from "./hooks/useThreadManagement";
import { useUiStore } from "../../shared/store/uiStore";
import { useToast } from "../../shared/ui/ToastProvider";
import { mapApiErrorToMessage } from "../../shared/lib/mapApiErrorToMessage";
import { localizeProfile } from "../../shared/lib/localizeDomain";
import { ActionArea } from "./ActionArea";
import { buildClarificationPrompt } from "./ClarificationForm";
import { AssistantHeader } from "./AssistantHeader";
import { AssistantInput } from "./AssistantInput";
import { AssistantThreadsDialog } from "./AssistantThreadsDialog";
import { ConfirmDialog } from "../../shared/ui/ConfirmDialog";
import { ContextCard } from "./ContextCard";
import { ConversationArea } from "./ConversationArea";
import { LinkedDocumentsBlock } from "./LinkedDocumentsBlock";
import { PromptSuggestions } from "./PromptSuggestions";
import { useAssistantPanelContext } from "./useAssistantPanelContext";
import { CitationSidebar } from "./CitationSidebar";
import type { Citation } from "../../entities/search";

type AssistantPanelProps = {
  token: string;
  width: number;
  height?: number | string;
  onSessionExpired: () => void;
  onTokenRefresh: (t: string) => void;
  onClose?: () => void;
};

export function AssistantPanel({
  token,
  width,
  height = "100vh",
  onSessionExpired,
  onTokenRefresh,
  onClose,
}: AssistantPanelProps) {
  const assistantQuery = useUiStore((state) => state.assistantQuery);
  const setAssistantQuery = useUiStore((state) => state.setAssistantQuery);
  const [inputValue, setInputValue] = useState(assistantQuery);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const inputValueRef = useRef(inputValue);

  const threadMgmt = useThreadManagement({ token, onSessionExpired, onTokenRefresh });
  const { activeThreadId, ensureThreadId } = threadMgmt;

  const docs = useDocumentAttachments({
    token,
    onSessionExpired,
    onTokenRefresh,
    activeThreadId,
    ensureThreadId,
    threadDetail: threadMgmt.threadDetail,
    inputValueRef,
    setInputValue,
    setAssistantQuery,
  });

  const actions = useAssistantActions({ token, onSessionExpired, onTokenRefresh, activeThreadId });

  const submit = useAssistantSubmit({
    token,
    onSessionExpired,
    onTokenRefresh,
    inputValue,
    setInputValue,
    inputValueRef,
    activeThreadId,
    ensureThreadId,
    threadDetail: threadMgmt.threadDetail,
    selectedDocumentIds: docs.selectedDocumentIds,
    clearMentionCandidates: docs.clearMentionCandidates,
    setMentionTerm: docs.setMentionTerm,
    appendActionToThread: actions.appendActionToThread,
    setClarificationByThread: actions.setClarificationByThread,
    setClarificationValuesByThread: actions.setClarificationValuesByThread,
    createPending: threadMgmt.createPending,
    deletePending: threadMgmt.deletePending,
    linkPending: docs.linkPending,
    uploadPending: docs.uploadPending,
  });

  const dictation = useDictation({
    inputValueRef,
    onInputChange: submit.handleInputChange,
    onSessionExpired,
    onTokenRefresh,
  });

  useEffect(() => {
    setInputValue(assistantQuery);
  }, [assistantQuery]);

  useEffect(() => {
    inputValueRef.current = inputValue;
  }, [inputValue]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (threadMgmt.threadsOpen) {
        e.preventDefault();
        e.stopPropagation();
        threadMgmt.setThreadsOpen(false);
        return;
      }
      if (onClose) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose, threadMgmt.threadsOpen, threadMgmt.setThreadsOpen]);

  const panelCtx = useAssistantPanelContext({
    messageCount: submit.messageCount,
    isStreaming: submit.assistantStream.isStreaming,
    streamError: submit.assistantStream.streamError,
    streamText: submit.assistantStream.streamText,
    streamSourcesCount: submit.assistantStream.streamSources.length,
    blocksUserSend: submit.blocksUserSend,
    selectedDocumentIds: docs.selectedDocumentIds,
    documentStatuses: docs.documentStatuses,
    documentTitles: docs.documentTitles,
    localActions: actions.localActions,
  });

  const showConversation =
    !panelCtx.isIdle ||
    submit.messageCount > 0 ||
    !!submit.assistantStream.streamText ||
    actions.localActions.length > 0 ||
    !!actions.clarification;

  return (
    <aside
      data-testid="assistant-panel"
      data-assistant-panel-state={panelCtx.panelState}
      className="relative flex shrink-0 flex-col border-l border-border bg-surface"
      style={{ width, height }}
    >
      <AssistantHeader
        moduleTitle={panelCtx.moduleTitle}
        onOpenThreads={() => threadMgmt.setThreadsOpen(true)}
        onClose={onClose}
        onNewThread={() => void threadMgmt.createThread()}
      />
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <ContextCard
          assistantContext={panelCtx.assistantContext}
          moduleTitle={panelCtx.moduleTitle}
          objectLabel={panelCtx.objectLabel}
          showMailCalendarStub={panelCtx.showMailCalendarStub}
          primaryDocumentStatus={panelCtx.primaryDocumentStatus}
          linkedDocumentCount={docs.selectedDocumentIds.length}
        />
        {!panelCtx.showMailCalendarStub && !submit.blocksUserSend && (
          <PromptSuggestions
            suggestions={panelCtx.suggestions}
            onSelect={submit.handleSuggestion}
            onDisabledClick={(hint) => toast.info(hint)}
          />
        )}
        {threadMgmt.threadsQueryError && (
          <p className="mb-2 mt-0 text-[13px] text-danger">
            {mapApiErrorToMessage(threadMgmt.threadsQueryError.message)}
          </p>
        )}
        {threadMgmt.threadDetail && showConversation && (
          <>
            <ConversationArea
              messages={threadMgmt.threadDetail.messages}
              isStreaming={submit.assistantStream.isStreaming}
              streamText={submit.assistantStream.streamText}
              streamError={submit.assistantStream.streamError}
              streamContextDiagnostic={submit.assistantStream.streamContextDiagnostic}
              streamSources={submit.assistantStream.streamSources}
              isIdle={panelCtx.isIdle}
              thinking={submit.blocksUserSend}
              ideologyProfileLabel={localizeProfile(submit.ideologyProfileId)}
              onRetry={
                submit.assistantStream.streamError && !submit.blocksUserSend
                  ? () => submit.lastSubmitRef.current?.()
                  : undefined
              }
              onCitationClick={setSelectedCitation}
            />
            <ActionArea
              actions={actions.localActions}
              clarification={actions.clarification}
              clarificationValues={actions.clarificationValues}
              clarificationPending={actions.clarificationPending}
              onSessionExpired={onSessionExpired}
              onTokenRefresh={onTokenRefresh}
              onActionStatusChange={(actionId, status) => {
                if (activeThreadId) actions.updateActionStatus(activeThreadId, actionId, status);
              }}
              onClarificationChange={(field, value) => {
                if (!activeThreadId) return;
                actions.setClarificationValuesByThread((prev) => ({
                  ...prev,
                  [activeThreadId]: { ...(prev[activeThreadId] ?? {}), [field]: value },
                }));
              }}
              onClarificationSubmit={() => {
                if (!actions.clarification || !activeThreadId) return;
                const prompt = buildClarificationPrompt(
                  actions.clarification.originalText,
                  actions.clarification.missingFields,
                  actions.clarificationValues,
                );
                actions.setClarificationPending(true);
                void submit
                  .sendAssistantInput(prompt)
                  .catch((e) => {
                    toast.error(
                      e instanceof Error
                        ? mapApiErrorToMessage(e.message)
                        : "Не удалось отправить уточнение",
                    );
                  })
                  .finally(() => actions.setClarificationPending(false));
              }}
              onClarificationCancel={() => {
                if (!activeThreadId) return;
                actions.setClarificationByThread((prev) => ({ ...prev, [activeThreadId]: null }));
                actions.setClarificationValuesByThread((prev) => ({
                  ...prev,
                  [activeThreadId]: {},
                }));
              }}
            />
            <LinkedDocumentsBlock
              documentIds={docs.selectedDocumentIds}
              documentTitles={docs.documentTitles}
              documentStatuses={docs.documentStatuses}
              onSummary={() => void submit.sendRag("Сделай краткое summary этого файла")}
              onRemove={(id) => docs.unlinkDocument(id)}
            />
          </>
        )}
      </div>
      <AssistantInput
        inputValue={inputValue}
        placeholder={panelCtx.inputPlaceholder}
        recording={dictation.recording}
        liveTranscript={dictation.liveTranscript}
        mentionCandidates={docs.mentionCandidates}
        mentionActiveIndex={docs.mentionActiveIndex}
        blocksUserSend={submit.blocksUserSend}
        isStreaming={submit.assistantStream.isStreaming}
        token={!!token}
        uploadRef={docs.uploadRef}
        onInputChange={submit.handleInputChange}
        onSubmit={submit.handleSubmit}
        onStopStream={() => submit.assistantStream.stopStream()}
        onDictation={() => void dictation.startOrStopDictation()}
        onAttachClick={() => docs.uploadRef.current?.click()}
        onFileSelected={(file) => void docs.uploadAttachment(file)}
        onAttachMention={(c) => void docs.attachMention(c)}
        onMentionActiveIndexChange={docs.setMentionActiveIndex}
        onClearMentionCandidates={docs.clearMentionCandidates}
      />
      <AssistantThreadsDialog
        open={threadMgmt.threadsOpen}
        width={width}
        threads={threadMgmt.threads}
        activeThreadId={activeThreadId}
        deletePending={threadMgmt.deletePending}
        onClose={() => threadMgmt.setThreadsOpen(false)}
        onCreate={() => void threadMgmt.createThread()}
        onSelect={(threadId) => {
          threadMgmt.selectThread(threadId);
          threadMgmt.setThreadsOpen(false);
        }}
        onDelete={(threadId, title) => void threadMgmt.deleteThread(threadId, title)}
      />
      <ConfirmDialog
        open={threadMgmt.deleteThreadDialog.open}
        onOpenChange={(nextOpen) =>
          threadMgmt.setDeleteThreadDialog((prev) => ({ ...prev, open: nextOpen }))
        }
        onConfirm={threadMgmt.handleDeleteThreadConfirmed}
        title={`Удалить диалог «${threadMgmt.deleteThreadDialog.threadTitle}»?`}
        description="Это действие необратимо. Все сообщения будут удалены."
        confirmText="Удалить"
        pending={threadMgmt.deletePending}
      />
      <CitationSidebar
        citation={selectedCitation}
        open={selectedCitation !== null}
        onClose={() => setSelectedCitation(null)}
      />
    </aside>
  );
}
