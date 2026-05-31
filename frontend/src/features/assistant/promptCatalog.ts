import type { AssistantWorkspaceModule } from "../../shared/store/uiStore";

export type PromptSuggestion = {
  id: string;
  label: string;
  prompt: string;
  /** Показывать только при открытом документе в контексте workspace. */
  requiresDocument?: boolean;
  /** Информационная подсказка без отправки (например, нет API). */
  disabled?: boolean;
  disabledHint?: string;
};

const DOCUMENT_PROMPTS: PromptSuggestion[] = [
  { id: "about", label: "О чём документ?", prompt: "О чём этот документ?", requiresDocument: true },
  {
    id: "summary",
    label: "Краткая сводка",
    prompt: "Сделай краткую сводку этого файла",
    requiresDocument: true,
  },
  {
    id: "dates",
    label: "Найди сроки",
    prompt: "Найди сроки и суммы в документе",
    requiresDocument: true,
  },
  {
    id: "risks",
    label: "Найди риски",
    prompt: "Найди риски в документе",
    requiresDocument: true,
  },
  {
    id: "email",
    label: "Подготовь письмо",
    prompt: "Подготовь письмо по документу @analyst",
    requiresDocument: true,
  },
  {
    id: "meeting",
    label: "Создай встречу",
    prompt: "Создай встречу по согласованию документа завтра в 15:00",
    requiresDocument: true,
  },
  {
    id: "forward",
    label: "Перешли документ",
    prompt: "Перешли документ аналитику",
    requiresDocument: true,
  },
];

const WORKSPACE_PROMPTS: PromptSuggestion[] = [
  { id: "find-doc", label: "Найди документ", prompt: "Найди документ по проекту" },
  {
    id: "weekly",
    label: "Что изменилось?",
    prompt: "Что изменилось за неделю?",
    disabled: true,
    disabledHint: "Сводка изменений появится в следующей версии (требуется серверная поддержка).",
  },
];

const DOCUMENTS_LIST_PROMPTS: PromptSuggestion[] = [
  { id: "find-doc", label: "Найди документ", prompt: "Найди документ" },
  {
    id: "about-list",
    label: "Поиск по документам",
    prompt: "Найди документы по ключевым словам",
  },
];

export function getPromptSuggestions(
  module: AssistantWorkspaceModule,
  hasWorkspaceDocument: boolean,
  hasLinkedDocuments: boolean,
): PromptSuggestion[] {
  if (module === "mail" || module === "calendar") {
    return [];
  }
  if (module === "workspace") {
    return WORKSPACE_PROMPTS;
  }
  if (module === "documents") {
    const hasDoc = hasWorkspaceDocument || hasLinkedDocuments;
    if (hasDoc) {
      return DOCUMENT_PROMPTS;
    }
    return DOCUMENTS_LIST_PROMPTS;
  }
  return [];
}

export function moduleLabel(module: AssistantWorkspaceModule): string {
  switch (module) {
    case "documents":
      return "Документы";
    case "mail":
      return "Почта";
    case "calendar":
      return "Календарь";
    default:
      return "Рабочее пространство";
  }
}
