/**
 * Маппит технические сообщения ошибок API/fetch в дружелюбные русскоязычные строки.
 * Если шаблон неизвестен — возвращает исходное сообщение или generic-фоллбек.
 */
export function mapApiErrorToMessage(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("failed to fetch")) {
    return "Сервис временно недоступен. Проверьте соединение и повторите попытку.";
  }
  if (normalized.includes("expected json response")) {
    return "Сервис вернул неожиданный ответ. Повторите попытку позже.";
  }
  if (normalized.includes("unauthorized")) {
    return "Сессия истекла. Войдите снова.";
  }
  return message || "Произошла ошибка. Попробуйте еще раз.";
}
