/** Локализованный заголовок раздела/коллекции по техническому ключу. */
export function sectionTitle(s: string): string {
  const map: Record<string, string> = {
    dashboard: "Дашборд",
    documents: "Документы",
    mail: "Почта",
    calendar: "Календарь",
    audit: "Журнал аудита",
    settings: "Настройки",
    all_docs: "Документы",
    recent: "Недавние",
    pinned: "Закрепленные",
    shared: "Доступные мне",
    contracts: "Контракты",
    memos: "Заметки",
    reports: "Отчеты",
    transcripts: "Транскрипты",
    acl: "ACL",
  };
  return map[s] ?? s;
}
