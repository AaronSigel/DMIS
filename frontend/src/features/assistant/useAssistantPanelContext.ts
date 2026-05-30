import { useMemo } from "react";
import type { AssistantDocumentStatusView } from "../../shared/api/schemas/assistant";
import type { ActionView } from "../../shared/api/schemas/action";
import { useUiStore } from "../../shared/store/uiStore";
import type { AssistantPanelState } from "./assistantPanelTypes";
import { getPromptSuggestions, moduleLabel } from "./promptCatalog";

type UseAssistantPanelContextArgs = {
  messageCount: number;
  isStreaming: boolean;
  streamError: string | null;
  streamText: string;
  streamSourcesCount: number;
  blocksUserSend: boolean;
  selectedDocumentIds: string[];
  documentStatuses: Record<string, AssistantDocumentStatusView>;
  documentTitles: Record<string, string>;
  localActions: ActionView[];
};

export function useAssistantPanelContext({
  messageCount,
  isStreaming,
  streamError,
  streamText,
  streamSourcesCount,
  blocksUserSend,
  selectedDocumentIds,
  documentStatuses,
  documentTitles,
  localActions,
}: UseAssistantPanelContextArgs) {
  const assistantContext = useUiStore((state) => state.assistantContext);

  const hasWorkspaceDocument = assistantContext.object?.type === "DOCUMENT";
  const workspaceDocumentTitle =
    assistantContext.object?.type === "DOCUMENT"
      ? assistantContext.object.title?.trim() ||
        documentTitles[assistantContext.object.id] ||
        assistantContext.object.id
      : null;

  const primaryDocumentId = useMemo(() => {
    if (assistantContext.object?.type === "DOCUMENT") {
      return assistantContext.object.id;
    }
    if (selectedDocumentIds.length === 1) {
      return selectedDocumentIds[0];
    }
    return null;
  }, [assistantContext.object, selectedDocumentIds]);

  const primaryDocumentStatus = primaryDocumentId ? documentStatuses[primaryDocumentId] : undefined;

  const objectLabel = useMemo(() => {
    if (assistantContext.module === "mail" || assistantContext.module === "calendar") {
      return null;
    }
    if (workspaceDocumentTitle) {
      return workspaceDocumentTitle;
    }
    if (selectedDocumentIds.length === 1) {
      const id = selectedDocumentIds[0]!;
      return documentTitles[id] ?? id;
    }
    if (selectedDocumentIds.length > 1) {
      return `${selectedDocumentIds.length} документов в контексте`;
    }
    if (assistantContext.module === "documents") {
      return "Документ не выбран";
    }
    return null;
  }, [assistantContext.module, documentTitles, selectedDocumentIds, workspaceDocumentTitle]);

  const suggestions = useMemo(
    () =>
      getPromptSuggestions(
        assistantContext.module,
        hasWorkspaceDocument,
        selectedDocumentIds.length > 0,
      ),
    [assistantContext.module, hasWorkspaceDocument, selectedDocumentIds.length],
  );

  const panelState: AssistantPanelState = useMemo(() => {
    if (streamError) return "FAILED";
    if (isStreaming || (blocksUserSend && !localActions.some((a) => a.status === "EXECUTED"))) {
      return "THINKING";
    }
    const draftActions = localActions.filter((a) => a.status === "DRAFT");
    if (draftActions.length > 0) return "NEEDS_CONFIRMATION";
    if (localActions.some((a) => a.status === "CONFIRMED")) return "EXECUTING";
    if (localActions.some((a) => a.status === "EXECUTED")) return "EXECUTED";
    if (streamSourcesCount > 0 && streamText) return "SOURCES_READY";
    if (streamText || messageCount > 0) return "ANSWER_READY";
    if (
      assistantContext.module === "documents" &&
      !hasWorkspaceDocument &&
      selectedDocumentIds.length === 0
    ) {
      return "EMPTY_CONTEXT";
    }
    return "IDLE";
  }, [
    assistantContext.module,
    blocksUserSend,
    hasWorkspaceDocument,
    isStreaming,
    localActions,
    messageCount,
    selectedDocumentIds.length,
    streamError,
    streamSourcesCount,
    streamText,
  ]);

  const isIdle =
    panelState === "IDLE" ||
    panelState === "EMPTY_CONTEXT" ||
    (messageCount === 0 && !streamText && localActions.length === 0 && !isStreaming);

  const inputPlaceholder = useMemo(() => {
    if (assistantContext.module === "documents" && workspaceDocumentTitle) {
      return `Спросите по документу «${workspaceDocumentTitle.slice(0, 40)}»…`;
    }
    if (assistantContext.module === "documents") {
      return "Поиск и вопросы по документам…";
    }
    if (assistantContext.module === "workspace") {
      return "Найдите документ или задайте вопрос…";
    }
    return "Спросите ассистента…";
  }, [assistantContext.module, workspaceDocumentTitle]);

  return {
    assistantContext,
    moduleTitle: moduleLabel(assistantContext.module),
    objectLabel,
    primaryDocumentId,
    primaryDocumentStatus,
    suggestions,
    panelState,
    isIdle,
    inputPlaceholder,
    showMailCalendarStub:
      assistantContext.module === "mail" || assistantContext.module === "calendar",
  };
}
