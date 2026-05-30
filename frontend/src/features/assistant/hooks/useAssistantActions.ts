import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiListActions } from "../../../apiClient";
import { queryKeys } from "../../../shared/api/queryClient";
import type { ActionView } from "../../../shared/api/schemas/action";
import type { ClarificationState } from "../ClarificationForm";

type UseAssistantActionsArgs = {
  token: string;
  onSessionExpired: () => void;
  onTokenRefresh?: (token: string) => void;
  activeThreadId: string;
};

export type UseAssistantActionsReturn = {
  localActions: ActionView[];
  clarification: ClarificationState | null;
  clarificationValues: Record<string, string>;
  clarificationPending: boolean;
  setClarificationPending: React.Dispatch<React.SetStateAction<boolean>>;
  localActionsByThread: Record<string, ActionView[]>;
  setLocalActionsByThread: React.Dispatch<React.SetStateAction<Record<string, ActionView[]>>>;
  clarificationByThread: Record<string, ClarificationState | null>;
  setClarificationByThread: React.Dispatch<
    React.SetStateAction<Record<string, ClarificationState | null>>
  >;
  clarificationValuesByThread: Record<string, Record<string, string>>;
  setClarificationValuesByThread: React.Dispatch<
    React.SetStateAction<Record<string, Record<string, string>>>
  >;
  appendActionToThread: (threadId: string, action: ActionView) => void;
  updateActionStatus: (threadId: string, actionId: string, status: ActionView["status"]) => void;
};

export function useAssistantActions({
  token,
  onSessionExpired,
  onTokenRefresh,
  activeThreadId,
}: UseAssistantActionsArgs): UseAssistantActionsReturn {
  const [localActionsByThread, setLocalActionsByThread] = useState<Record<string, ActionView[]>>(
    {},
  );
  const [clarificationByThread, setClarificationByThread] = useState<
    Record<string, ClarificationState | null>
  >({});
  const [clarificationValuesByThread, setClarificationValuesByThread] = useState<
    Record<string, Record<string, string>>
  >({});
  const [clarificationPending, setClarificationPending] = useState(false);

  const actionsQuery = useQuery({
    queryKey: queryKeys.actions.list,
    queryFn: () => apiListActions(onSessionExpired, onTokenRefresh),
    enabled: !!token,
    staleTime: 30_000,
  });

  useEffect(() => {
    const data = actionsQuery.data;
    if (!data || !activeThreadId) return;
    setLocalActionsByThread((prev) => {
      if (prev[activeThreadId]?.length) return prev;
      const serverActions = data.filter(
        (a) => a.status === "DRAFT" || a.status === "CONFIRMED" || a.status === "EXECUTED",
      );
      if (!serverActions.length) return prev;
      return { ...prev, [activeThreadId]: serverActions };
    });
  }, [actionsQuery.data, activeThreadId]);

  function appendActionToThread(threadId: string, action: ActionView) {
    setLocalActionsByThread((prev) => {
      const prevThreadActions = prev[threadId] ?? [];
      const deduped = prevThreadActions.filter((item) => item.id !== action.id);
      return { ...prev, [threadId]: [...deduped, action] };
    });
  }

  function updateActionStatus(threadId: string, actionId: string, status: ActionView["status"]) {
    setLocalActionsByThread((prev) => {
      const threadActions = prev[threadId] ?? [];
      return {
        ...prev,
        [threadId]: threadActions.map((a) => (a.id === actionId ? { ...a, status } : a)),
      };
    });
  }

  const localActions = activeThreadId ? (localActionsByThread[activeThreadId] ?? []) : [];
  const clarification = activeThreadId ? (clarificationByThread[activeThreadId] ?? null) : null;
  const clarificationValues = activeThreadId
    ? (clarificationValuesByThread[activeThreadId] ?? {})
    : {};

  return {
    localActions,
    clarification,
    clarificationValues,
    clarificationPending,
    setClarificationPending,
    localActionsByThread,
    setLocalActionsByThread,
    clarificationByThread,
    setClarificationByThread,
    clarificationValuesByThread,
    setClarificationValuesByThread,
    appendActionToThread,
    updateActionStatus,
  };
}
