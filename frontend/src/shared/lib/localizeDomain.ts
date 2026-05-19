const statusLabels: Record<string, string> = {
  final: "финальный",
  indexed: "проиндексирован",
  review: "на проверке",
  pending: "в ожидании",
  failed: "ошибка",
  draft: "черновик",
  confirmed: "подтверждено",
  executed: "выполнено",
  queued: "в очереди",
  uploading: "загрузка",
  done: "готово",
  error: "ошибка",
};

const intentLabels: Record<string, string> = {
  send_email: "отправка письма",
  create_calendar_event: "создание встречи",
  update_document_tags: "обновление тегов документа",
  reschedule_calendar_event: "перенос встречи",
  prepare_meeting_agenda: "подготовка повестки",
  suggest_meeting_slots: "подбор свободных слотов",
};

const auditActionLabels: Record<string, string> = {
  "action.draft": "черновик действия",
  "action.confirm": "подтверждение действия",
  "action.execute": "выполнение действия",
  "mail.draft.create": "черновик письма",
  "mail.send": "отправка письма",
  "assistant.message.send": "сообщение ассистенту",
  "document.download": "скачивание документа",
  "document.upload": "загрузка документа",
  "rag.answer.request": "запрос к поиску",
  "rag.answer.retrieval": "поиск фрагментов",
  "rag.answer.rerank": "ранжирование фрагментов",
  "rag.answer.llm": "генерация ответа",
  "rag.answer.response": "ответ ассистента",
  "rag.answer.stream.request": "потоковый запрос к поиску",
  "rag.answer.stream.retrieval": "потоковый поиск фрагментов",
  "rag.answer.stream.rerank": "потоковое ранжирование",
  "rag.answer.stream.llm": "потоковая генерация ответа",
  "rag.answer.stream.response": "потоковый ответ ассистента",
};

const resourceTypeLabels: Record<string, string> = {
  ai_action: "ИИ-действие",
  assistant_thread: "диалог ассистента",
  document: "документ",
  email: "письмо",
  rag: "поиск по документам",
  calendar_event: "событие календаря",
  user: "пользователь",
};

const detailsLabels: Record<string, string> = {
  "Draft created": "Черновик создан",
  "Action confirmed": "Действие подтверждено",
  "Action executed successfully": "Действие выполнено",
  "Mail draft prepared": "Черновик письма подготовлен",
  "Mail sent successfully": "Письмо отправлено",
  "Message sent": "Сообщение отправлено",
  "Downloaded latest": "Скачана актуальная версия",
};

const profileLabels: Record<string, string> = {
  balanced: "сбалансированный",
  strict: "строгий",
  creative: "свободный",
};

const sourceLabels: Record<string, string> = {
  UI: "интерфейс",
  MAIL: "почта",
  AI: "ассистент",
};

const participantStatusLabels: Record<string, string> = {
  PENDING: "ожидает ответа",
  ACCEPTED: "принято",
  DECLINED: "отклонено",
  TENTATIVE: "предварительно",
};

const attachmentRoleLabels: Record<string, string> = {
  AGENDA: "повестка",
  MATERIALS: "материалы",
  CONTRACT: "договор",
  REPORT: "отчёт",
};

export function localizeStatus(status: string): string {
  return statusLabels[status.toLowerCase()] ?? status;
}

export function localizeIntent(intent: string): string {
  return intentLabels[intent] ?? intent;
}

export function localizeAuditAction(action: string): string {
  return auditActionLabels[action] ?? action;
}

export function localizeResourceType(resourceType: string): string {
  return resourceTypeLabels[resourceType] ?? resourceType;
}

export function localizeAuditDetails(details: string): string {
  if (!details) return "";
  return detailsLabels[details] ?? details;
}

export function localizeProfile(profile: string): string {
  return profileLabels[profile] ?? profile;
}

export function localizeCreationSource(source: string): string {
  return sourceLabels[source] ?? source;
}

export function localizeParticipantStatus(status: string): string {
  return participantStatusLabels[status] ?? localizeStatus(status);
}

export function localizeAttachmentRole(role: string): string {
  return attachmentRoleLabels[role] ?? role;
}
