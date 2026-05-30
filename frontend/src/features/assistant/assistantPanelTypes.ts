/** Клиентские состояния AI-панели (§6 спецификации). */
export type AssistantPanelState =
  | "IDLE"
  | "THINKING"
  | "ANSWER_READY"
  | "SOURCES_READY"
  | "ACTION_DRAFT_READY"
  | "NEEDS_CLARIFICATION"
  | "NEEDS_CONFIRMATION"
  | "EXECUTING"
  | "EXECUTED"
  | "FAILED"
  | "NO_ACCESS"
  | "EMPTY_CONTEXT"
  | "FALLBACK";

export type MentionDoc = { id: string; title: string };
