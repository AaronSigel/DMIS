import type { AssistantDocumentStatusView } from "../../shared/api/schemas/assistant";

export function documentStatusLabel(status: AssistantDocumentStatusView | undefined): string {
  if (!status) return "Документ не привязан";
  if (status.extractedTextLength === 0) return "Текст не извлечён";
  if (status.status === "PENDING") return "Индексируется";
  if (status.status === "FAILED") return "Ошибка индексации";
  if (status.status === "INDEXED" && status.indexedChunkCount > 0) return "Готов";
  return status.status;
}

export function contextDiagnosticMessage(code: string | null | undefined): string | null {
  if (!code || code === "OK") return null;
  switch (code) {
    case "INDEX_PENDING":
      return "Документ ещё индексируется. Summary будет доступно после завершения обработки.";
    case "INDEX_FAILED":
      return "Документ не был проиндексирован.";
    case "NO_DOCUMENT_SELECTED":
      return "Выберите документ или дождитесь привязки загруженного файла.";
    case "TEXT_NOT_EXTRACTED":
      return "Текст документа не извлечён.";
    case "NO_CHUNKS":
      return "Файл пустой или не содержит значимого текста для обработки.";
    default:
      return code;
  }
}
