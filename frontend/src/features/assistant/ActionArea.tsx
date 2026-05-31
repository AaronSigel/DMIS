import { Link } from "react-router-dom";
import type { ActionView } from "../../shared/api/schemas/action";
import { ActionCard } from "../actions/ActionCard";
import { ClarificationForm, type ClarificationState } from "./ClarificationForm";

type ActionAreaProps = {
  actions: ActionView[];
  clarification: ClarificationState | null;
  clarificationValues: Record<string, string>;
  clarificationPending?: boolean;
  onSessionExpired: () => void;
  onTokenRefresh: (t: string) => void;
  onActionStatusChange?: (actionId: string, status: ActionView["status"]) => void;
  onClarificationChange: (field: string, value: string) => void;
  onClarificationSubmit: () => void;
  onClarificationCancel: () => void;
};

export function ActionArea({
  actions,
  clarification,
  clarificationValues,
  clarificationPending = false,
  onSessionExpired,
  onTokenRefresh,
  onActionStatusChange,
  onClarificationChange,
  onClarificationSubmit,
  onClarificationCancel,
}: ActionAreaProps) {
  const visibleActions = actions.filter((action) => action.status !== "CANCELLED");
  if (!visibleActions.length && !clarification) return null;

  return (
    <div data-testid="assistant-action-area" className="mt-2 grid gap-2">
      {clarification && (
        <ClarificationForm
          clarification={clarification}
          values={clarificationValues}
          onChange={onClarificationChange}
          onSubmit={onClarificationSubmit}
          onCancel={onClarificationCancel}
          pending={clarificationPending}
          onSessionExpired={onSessionExpired}
          onTokenRefresh={onTokenRefresh}
        />
      )}
      {visibleActions.map((action) => (
        <div key={action.id}>
          <ActionCard
            id={action.id}
            intent={action.intent}
            status={action.status}
            entities={action.entities}
            onSessionExpired={onSessionExpired}
            onTokenRefresh={onTokenRefresh}
            onStatusChange={(status) => onActionStatusChange?.(action.id, status)}
          />
          {action.status === "EXECUTED" && (
            <div
              data-testid="assistant-action-executed"
              className="mt-1.5 rounded-md border border-border bg-surface px-2 py-1.5 text-[11px] text-muted"
            >
              <span className="text-success">Выполнено.</span>{" "}
              {action.intent === "suggest_meeting_slots" && action.result ? (
                <span className="ml-1 whitespace-pre-line text-text">{action.result}</span>
              ) : (
                <Link
                  to="/audit"
                  data-testid="assistant-audit-link"
                  className="text-primary underline"
                  title="Откройте журнал и найдите запись action.execute"
                >
                  Журнал операций
                </Link>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
