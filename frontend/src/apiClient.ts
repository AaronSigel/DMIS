import { z } from "zod";
import type { DocumentPage, DocumentView } from "./entities/document";
import type { CalendarEvent, CalendarEventUpsertPayload } from "./entities/calendar";
import type {
  MailAccount,
  MailMessageDetail,
  MailMessageSearch,
  MailMessageSummary,
} from "./entities/mail";
import type { AuditRecord } from "./entities/audit";
import {
  AssistantThreadDetailViewSchema,
  AssistantThreadViewSchema,
  MentionDocumentListSchema,
} from "./shared/api/schemas/assistant";
import {
  DocumentMetaSchema,
  DocumentPageSchema,
  DocumentViewSchema,
} from "./shared/api/schemas/document";
import { ActionViewSchema, type ActionView } from "./shared/api/schemas/action";
import { CalendarEventListSchema, CalendarEventSchema } from "./shared/api/schemas/calendar";
import {
  MailMessageDetailSchema,
  MailMessageListSchema,
  MailAccountSchema,
  MailMessageSearchSchema,
} from "./shared/api/schemas/mail";
import { AuditRecordListSchema } from "./shared/api/schemas/audit";

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "/api";

const TOKEN_KEY = "dmis_token";
let refreshInFlight: Promise<string | null> | null = null;

type RefreshPayload = {
  token: string;
};

export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) ?? "";
}

/** Сохраняет access-токен в памяти браузера (localStorage). Refresh — только HttpOnly cookie. */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function readErrorMessage(response: Response): Promise<string> {
  const ct = response.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    try {
      const payload = (await response.json()) as { message?: string; errorCode?: string };
      return payload.message ?? payload.errorCode ?? "Request failed";
    } catch {
      return "Request failed";
    }
  }
  const text = await response.text();
  return text.trim() || "Request failed";
}

type ApiErrorPayload = { message?: string; errorCode?: string };

export async function readApiError(response: Response): Promise<ApiErrorPayload> {
  const ct = response.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    const fallback = await response.text();
    return { message: fallback.trim() || "Request failed" };
  }
  try {
    return (await response.json()) as ApiErrorPayload;
  } catch {
    return { message: "Request failed" };
  }
}

/** Login and other unauthenticated JSON endpoints: no session reset on 401. */
export async function parsePublicJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
  const ct = response.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    throw new Error("Expected JSON response");
  }
  return response.json() as Promise<T>;
}

/** Authenticated requests: 401/403 clears session via callback before throwing. */
export async function parseAuthenticatedJson<T>(
  response: Response,
  onUnauthorized: () => void,
): Promise<T> {
  if (response.status === 401 || response.status === 403) {
    onUnauthorized();
    throw new Error("Unauthorized");
  }
  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
  const ct = response.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    throw new Error("Expected JSON response");
  }
  return response.json() as Promise<T>;
}

/** JSON уже проверен parseAuthenticatedJson; дополнительно валидирует контракт ответа. */
async function parseAuthenticatedSchema<T>(
  response: Response,
  schema: z.ZodType<T>,
  onUnauthorized: () => void,
): Promise<T> {
  const data = await parseAuthenticatedJson<unknown>(response, onUnauthorized);
  return schema.parse(data);
}

export async function parseAuthenticatedText(
  response: Response,
  onUnauthorized: () => void,
): Promise<string> {
  if (response.status === 401 || response.status === 403) {
    onUnauthorized();
    throw new Error("Unauthorized");
  }
  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
  return response.text();
}

/**
 * Fetch with automatic token refresh on 401.
 * Reads token from localStorage, retries once after refreshing if 401 is received.
 * Calls onNewToken when a new token is issued so callers can update React state.
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
  onNewToken?: (token: string) => void,
): Promise<Response> {
  const authOptions = withAuthHeader(options, getToken());
  const response = await fetch(url, authOptions);

  // Backend security может вернуть 403 (а не 401), когда access token просрочен/невалиден.
  // Для стабильного UX пробуем refresh и retry на обоих кодах.
  if (response.status !== 401 && response.status !== 403) {
    return response;
  }

  if (!refreshInFlight) {
    refreshInFlight = runTokenRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  const refreshedToken = await refreshInFlight;
  if (!refreshedToken) {
    return response;
  }

  setToken(refreshedToken);
  onNewToken?.(refreshedToken);

  return fetch(url, withAuthHeader(options, refreshedToken));
}

async function runTokenRefresh(): Promise<string | null> {
  const refreshResponse = await fetch(`${apiBaseUrl}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  if (!refreshResponse.ok) {
    clearTokens();
    return null;
  }
  const payload = await parsePublicJson<RefreshPayload>(refreshResponse);
  return payload.token;
}

function withAuthHeader(options: RequestInit, token: string): RequestInit {
  const baseHeaders = options.headers ? (options.headers as Record<string, string>) : {};
  const headers: Record<string, string> = { ...baseHeaders };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return {
    ...options,
    credentials: options.credentials ?? "include",
    headers,
  };
}

export type AssistantThreadView = {
  id: string;
  title: string;
  ideologyProfileId: string;
  knowledgeSourceIds: string[];
};
export type AssistantThreadMessageView = {
  id: string;
  role: string;
  content: string;
  documentIds: string[];
};
export type AssistantThreadDetailView = {
  thread: AssistantThreadView;
  messages: AssistantThreadMessageView[];
  linkedDocumentIds: string[];
};

export async function apiListAssistantThreads(
  onUnauthorized: () => void,
  onNewToken?: (token: string) => void,
): Promise<AssistantThreadView[]> {
  const response = await fetchWithAuth(
    `${apiBaseUrl}/assistant/threads`,
    { method: "GET" },
    onNewToken,
  );
  return parseAuthenticatedSchema(response, z.array(AssistantThreadViewSchema), onUnauthorized);
}

export async function apiMentionDocuments(
  query: string,
  onUnauthorized: () => void,
  onNewToken?: (token: string) => void,
): Promise<{ id: string; title: string }[]> {
  const response = await fetchWithAuth(
    `${apiBaseUrl}/assistant/documents/mentions?q=${encodeURIComponent(query)}&limit=8`,
    { method: "GET" },
    onNewToken,
  );
  return parseAuthenticatedSchema(response, MentionDocumentListSchema, onUnauthorized);
}

export async function apiGetAssistantThreadDetail(
  threadId: string,
  onUnauthorized: () => void,
  onNewToken?: (token: string) => void,
): Promise<AssistantThreadDetailView> {
  const response = await fetchWithAuth(
    `${apiBaseUrl}/assistant/threads/${threadId}`,
    { method: "GET" },
    onNewToken,
  );
  return parseAuthenticatedSchema(response, AssistantThreadDetailViewSchema, onUnauthorized);
}

export async function apiCreateAssistantThread(
  title: string,
  onUnauthorized: () => void,
  onNewToken?: (token: string) => void,
): Promise<AssistantThreadView> {
  const response = await fetchWithAuth(
    `${apiBaseUrl}/assistant/threads`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    },
    onNewToken,
  );
  return parseAuthenticatedSchema(response, AssistantThreadViewSchema, onUnauthorized);
}

export async function apiDeleteAssistantThread(
  threadId: string,
  onUnauthorized: () => void,
  onNewToken?: (token: string) => void,
): Promise<void> {
  const response = await fetchWithAuth(
    `${apiBaseUrl}/assistant/threads/${threadId}`,
    { method: "DELETE" },
    onNewToken,
  );
  if (response.status === 401 || response.status === 403) {
    onUnauthorized();
    throw new Error("Unauthorized");
  }
  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
}

export async function apiSendAssistantMessage(
  threadId: string,
  payload: {
    question: string;
    documentIds: string[];
    knowledgeSourceIds: string[];
    ideologyProfileId: string;
  },
  onUnauthorized: () => void,
  onNewToken?: (token: string) => void,
): Promise<void> {
  const response = await fetchWithAuth(
    `${apiBaseUrl}/assistant/threads/${threadId}/messages`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    onNewToken,
  );
  await parseAuthenticatedJson<unknown>(response, onUnauthorized);
}

/**
 * Ошибка парсинга intent/entities для action-flow ассистента.
 * Используется для безопасного fallback в обычный RAG-ответ.
 */
export class AssistantActionParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssistantActionParseError";
  }
}

/**
 * Пытается распознать пользовательскую команду как AI-действие.
 * Для 400/422 возвращает специализированную ошибку, чтобы UI мог
 * перейти в fallback-сценарий RAG без показа ошибки пользователю.
 */
export async function apiParseAssistantAction(
  text: string,
  onUnauthorized: () => void,
  onNewToken?: (token: string) => void,
): Promise<ActionView> {
  const response = await fetchWithAuth(
    `${apiBaseUrl}/assistant/actions/parse`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    },
    onNewToken,
  );
  if (response.status === 401 || response.status === 403) {
    onUnauthorized();
    throw new Error("Unauthorized");
  }
  if (response.status === 400 || response.status === 422) {
    throw new AssistantActionParseError(await readErrorMessage(response));
  }
  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
  const payload = await parseAuthenticatedJson<unknown>(response, onUnauthorized);
  return ActionViewSchema.parse(payload);
}

export type AssistantStreamPayload = {
  question: string;
  threadId?: string;
  documentIds: string[];
  knowledgeSourceIds: string[];
  ideologyProfileId: string;
};

export type AssistantStreamDoneEvent = {
  done?: boolean;
  answer?: string;
  status?: string;
  /** Массив источников из backend `RagSourceView` (см. SSE done-payload). Нормализуется выше по стеку. */
  sources?: unknown;
  /** Метрики пайплайна (retrieval/rerank/llm) — пробрасываем как есть. */
  pipeline?: unknown;
};

type AssistantStreamDeltaEvent = {
  delta?: string;
};

type AssistantStreamCallbacks = {
  onDelta: (delta: string) => void;
  onDone?: (event: AssistantStreamDoneEvent) => void;
  onError?: (error: Error) => void;
};

export async function apiStreamAssistantAnswer(
  payload: AssistantStreamPayload,
  onUnauthorized: () => void,
  callbacks: AssistantStreamCallbacks,
  signal?: AbortSignal,
  onNewToken?: (token: string) => void,
): Promise<void> {
  let response: Response;
  try {
    response = await fetchWithAuth(
      `${apiBaseUrl}/rag/answer-with-sources/stream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify(payload),
        signal,
      },
      onNewToken,
    );
  } catch (error) {
    const err = error instanceof Error ? error : new Error("SSE request failed");
    callbacks.onError?.(err);
    throw err;
  }

  if (response.status === 401 || response.status === 403) {
    onUnauthorized();
    const err = new Error("Unauthorized");
    callbacks.onError?.(err);
    throw err;
  }
  if (!response.ok) {
    const err = new Error(await readErrorMessage(response));
    callbacks.onError?.(err);
    throw err;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    const err = new Error("SSE stream is unavailable");
    callbacks.onError?.(err);
    throw err;
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let doneEventSent = false;

  const processLine = (line: string): void => {
    if (!line.startsWith("data:")) return;
    const raw = line.slice("data:".length).trim();
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as AssistantStreamDeltaEvent & AssistantStreamDoneEvent;
      if (typeof parsed.delta === "string" && parsed.delta.length > 0) {
        callbacks.onDelta(parsed.delta);
      }
      if (parsed.done) {
        doneEventSent = true;
        callbacks.onDone?.(parsed);
      }
    } catch {
      // Игнорируем невалидные чанки: поток best-effort.
    }
  };

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let newlineIndex = buffer.indexOf("\n");
      while (newlineIndex >= 0) {
        const line = buffer.slice(0, newlineIndex).trimEnd();
        processLine(line);
        buffer = buffer.slice(newlineIndex + 1);
        newlineIndex = buffer.indexOf("\n");
      }
    }

    if (buffer.trim().length > 0) {
      processLine(buffer.trim());
    }

    if (!doneEventSent) {
      callbacks.onDone?.({ done: true });
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error("SSE stream read failed");
    callbacks.onError?.(err);
    throw err;
  } finally {
    reader.releaseLock();
  }
}

export async function apiLinkAssistantThreadDocument(
  threadId: string,
  documentId: string,
  onUnauthorized: () => void,
  onNewToken?: (token: string) => void,
): Promise<void> {
  const response = await fetchWithAuth(
    `${apiBaseUrl}/assistant/threads/${threadId}/documents`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId }),
    },
    onNewToken,
  );
  await parseAuthenticatedJson<unknown>(response, onUnauthorized);
}

export async function apiUploadAssistantThreadAttachment(
  threadId: string,
  file: File,
  onUnauthorized: () => void,
  onNewToken?: (token: string) => void,
): Promise<void> {
  const form = new FormData();
  form.append("file", file);
  const response = await fetchWithAuth(
    `${apiBaseUrl}/assistant/threads/${threadId}/uploads`,
    { method: "POST", body: form },
    onNewToken,
  );
  await parseAuthenticatedJson<unknown>(response, onUnauthorized);
}

export async function apiGetDocumentTitle(
  documentId: string,
  onUnauthorized: () => void,
  onNewToken?: (token: string) => void,
): Promise<{ id: string; title: string }> {
  const response = await fetchWithAuth(
    `${apiBaseUrl}/documents/${documentId}`,
    { method: "GET" },
    onNewToken,
  );
  const payload = await parseAuthenticatedSchema(response, DocumentMetaSchema, onUnauthorized);
  return { id: payload.id, title: payload.title };
}

/** Параметры постраничного списка документов (опционально по тегу раздела). */
export type ApiListDocumentsParams = {
  page: number;
  size: number;
  tag?: string;
};

export async function apiListDocuments(
  params: ApiListDocumentsParams,
  onUnauthorized: () => void,
  onNewToken?: (token: string) => void,
): Promise<DocumentPage> {
  const search = new URLSearchParams({
    page: String(params.page),
    size: String(params.size),
  });
  if (params.tag) search.set("tag", params.tag);
  const response = await fetchWithAuth(
    `${apiBaseUrl}/documents?${search}`,
    { method: "GET" },
    onNewToken,
  );
  return parseAuthenticatedSchema(response, DocumentPageSchema, onUnauthorized);
}

export async function apiUploadDocument(
  file: File,
  onUnauthorized: () => void,
  onNewToken?: (token: string) => void,
): Promise<DocumentView> {
  const form = new FormData();
  form.append("file", file);
  const response = await fetchWithAuth(
    `${apiBaseUrl}/documents`,
    { method: "POST", body: form },
    onNewToken,
  );
  return parseAuthenticatedSchema(response, DocumentViewSchema, onUnauthorized);
}

export type UploadDocumentProgress = {
  loaded: number;
  total: number;
  percent: number;
};

export async function apiUploadDocumentWithProgress(
  file: File,
  onUnauthorized: () => void,
  onNewToken?: (token: string) => void,
  onProgress?: (progress: UploadDocumentProgress) => void,
): Promise<DocumentView> {
  const currentToken = getToken();
  const refreshedToken = await new Promise<string | null>((resolve) => {
    const request = new XMLHttpRequest();
    request.open("POST", `${apiBaseUrl}/auth/refresh`);
    request.withCredentials = true;

    request.onreadystatechange = () => {
      if (request.readyState !== XMLHttpRequest.DONE) return;
      if (request.status < 200 || request.status >= 300) {
        resolve(null);
        return;
      }
      try {
        const payload = JSON.parse(request.responseText) as RefreshPayload;
        resolve(payload.token ?? null);
      } catch {
        resolve(null);
      }
    };
    request.onerror = () => resolve(null);
    request.send();
  });

  const effectiveToken = refreshedToken ?? currentToken;
  if (refreshedToken) {
    setToken(refreshedToken);
    onNewToken?.(refreshedToken);
  }

  return new Promise<DocumentView>((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);

    const request = new XMLHttpRequest();
    request.open("POST", `${apiBaseUrl}/documents`);
    request.withCredentials = true;
    if (effectiveToken) {
      request.setRequestHeader("Authorization", `Bearer ${effectiveToken}`);
    }

    request.upload.onprogress = (event) => {
      const total = event.total || file.size || 0;
      const loaded = event.loaded;
      const percent = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0;
      onProgress?.({ loaded, total, percent });
    };

    request.onreadystatechange = () => {
      if (request.readyState !== XMLHttpRequest.DONE) return;
      if (request.status === 401 || request.status === 403) {
        onUnauthorized();
        reject(new Error("Unauthorized"));
        return;
      }
      if (request.status < 200 || request.status >= 300) {
        let message = "Request failed";
        try {
          const payload = JSON.parse(request.responseText) as ApiErrorPayload;
          message = payload.message ?? payload.errorCode ?? message;
        } catch {
          message = request.responseText?.trim() || message;
        }
        reject(new Error(message));
        return;
      }
      try {
        const payload = DocumentViewSchema.parse(JSON.parse(request.responseText));
        resolve(payload);
      } catch {
        reject(new Error("Invalid upload response"));
      }
    };

    request.onerror = () => reject(new Error("Request failed"));
    request.send(form);
  });
}

/** Поля PATCH документа (без расширения контракта backend). */
export type DocumentPatch = { title?: string; tags?: string[] };

/** Загружает текущие теги документа для отображения diff в карточке действия. */
export async function apiGetDocumentTags(
  documentId: string,
  onUnauthorized: () => void = () => {},
  onNewToken?: (token: string) => void,
): Promise<string[]> {
  const response = await fetchWithAuth(
    `${apiBaseUrl}/documents/${documentId}`,
    { method: "GET" },
    onNewToken,
  );
  const payload = await parseAuthenticatedSchema(response, DocumentViewSchema, onUnauthorized);
  return payload.tags;
}

/** Подтверждает draft-действие ассистента (intent -> confirm). */
export async function apiConfirmAction(
  actionId: string,
  onUnauthorized: () => void = () => {},
  onNewToken?: (token: string) => void,
) {
  const response = await fetchWithAuth(
    `${apiBaseUrl}/actions/${actionId}/confirm`,
    { method: "POST" },
    onNewToken,
  );
  return parseAuthenticatedSchema(response, ActionViewSchema, onUnauthorized);
}

export type ActionDraftPayload = {
  intent: string;
  entities: Record<string, unknown>;
};

/** Создает draft-действие, которое дальше проходит confirm/execute flow. */
export async function apiCreateActionDraft(
  payload: ActionDraftPayload,
  onUnauthorized: () => void = () => {},
  onNewToken?: (token: string) => void,
): Promise<ActionView> {
  const response = await fetchWithAuth(
    `${apiBaseUrl}/actions/draft`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    onNewToken,
  );
  return parseAuthenticatedSchema(response, ActionViewSchema, onUnauthorized);
}

/** Выполняет уже подтвержденное AI-действие. */
export async function apiExecuteAction(
  actionId: string,
  onUnauthorized: () => void = () => {},
  onNewToken?: (token: string) => void,
): Promise<ActionView> {
  const response = await fetchWithAuth(
    `${apiBaseUrl}/actions/${actionId}/execute`,
    { method: "POST" },
    onNewToken,
  );
  return parseAuthenticatedSchema(response, ActionViewSchema, onUnauthorized);
}

export async function apiUpdateDocument(
  id: string,
  patch: DocumentPatch,
  onUnauthorized: () => void,
  onNewToken?: (token: string) => void,
): Promise<DocumentView> {
  const response = await fetchWithAuth(
    `${apiBaseUrl}/documents/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    },
    onNewToken,
  );
  return parseAuthenticatedSchema(response, DocumentViewSchema, onUnauthorized);
}

export async function apiDeleteDocument(
  id: string,
  onUnauthorized: () => void,
  onNewToken?: (token: string) => void,
): Promise<void> {
  const response = await fetchWithAuth(
    `${apiBaseUrl}/documents/${id}`,
    { method: "DELETE" },
    onNewToken,
  );
  if (response.status === 401 || response.status === 403) {
    onUnauthorized();
    throw new Error("Unauthorized");
  }
  if (!response.ok) {
    const err = await readApiError(response);
    throw new Error(err.message ?? err.errorCode ?? "Request failed");
  }
}

/** Список событий календаря (`GET /calendar/events`). */
export async function apiListCalendarEvents(
  onUnauthorized: () => void,
  onNewToken?: (token: string) => void,
): Promise<CalendarEvent[]> {
  const response = await fetchWithAuth(
    `${apiBaseUrl}/calendar/events`,
    { method: "GET" },
    onNewToken,
  );
  return parseAuthenticatedSchema(response, CalendarEventListSchema, onUnauthorized);
}

/** Список аудита (`GET /audit`). */
export async function apiListAudit(
  onUnauthorized: () => void,
  onNewToken?: (token: string) => void,
): Promise<AuditRecord[]> {
  const response = await fetchWithAuth(`${apiBaseUrl}/audit`, { method: "GET" }, onNewToken);
  return parseAuthenticatedSchema(response, AuditRecordListSchema, onUnauthorized);
}

/** Создание события календаря (`POST /calendar/events`). */
export async function apiCreateCalendarEvent(
  payload: CalendarEventUpsertPayload,
  onUnauthorized: () => void,
  onNewToken?: (token: string) => void,
): Promise<CalendarEvent> {
  const response = await fetchWithAuth(
    `${apiBaseUrl}/calendar/events`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    onNewToken,
  );
  return parseAuthenticatedSchema(response, CalendarEventSchema, onUnauthorized);
}

/** Обновление события календаря (`PUT /calendar/events/{id}`). */
export async function apiUpdateCalendarEvent(
  id: string,
  payload: CalendarEventUpsertPayload,
  onUnauthorized: () => void,
  onNewToken?: (token: string) => void,
): Promise<CalendarEvent> {
  const response = await fetchWithAuth(
    `${apiBaseUrl}/calendar/events/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    onNewToken,
  );
  return parseAuthenticatedSchema(response, CalendarEventSchema, onUnauthorized);
}

/** Удаление события календаря (`DELETE /calendar/events/{id}`). */
export async function apiDeleteCalendarEvent(
  id: string,
  onUnauthorized: () => void,
  onNewToken?: (token: string) => void,
): Promise<void> {
  const response = await fetchWithAuth(
    `${apiBaseUrl}/calendar/events/${encodeURIComponent(id)}`,
    { method: "DELETE" },
    onNewToken,
  );
  if (response.status === 401 || response.status === 403) {
    onUnauthorized();
    throw new Error("Unauthorized");
  }
  if (!response.ok) {
    const err = await readApiError(response);
    throw new Error(err.message ?? err.errorCode ?? "Request failed");
  }
}

/**
 * Список писем для текущего пользователя.
 *
 * Mailbox по умолчанию — email текущего пользователя (определяется на backend);
 * фронтенду не требуется передавать его явно.
 */
export async function apiListMailMessages(
  onUnauthorized: () => void,
  onNewToken?: (token: string) => void,
): Promise<MailMessageSummary[]> {
  const response = await fetchWithAuth(
    `${apiBaseUrl}/mail/messages`,
    { method: "GET" },
    onNewToken,
  );
  return parseAuthenticatedSchema(response, MailMessageListSchema, onUnauthorized);
}

/** Чтение письма по идентификатору. */
export async function apiGetMailMessage(
  id: string,
  onUnauthorized: () => void,
  onNewToken?: (token: string) => void,
): Promise<MailMessageDetail> {
  const response = await fetchWithAuth(
    `${apiBaseUrl}/mail/messages/${encodeURIComponent(id)}`,
    { method: "GET" },
    onNewToken,
  );
  return parseAuthenticatedSchema(response, MailMessageDetailSchema, onUnauthorized);
}

export type ApiSearchMailMessagesParams = {
  query: string;
  limit: number;
};

/** Поиск писем (`POST /mail/messages/search`). Mailbox опускаем — backend подставит email пользователя. */
export async function apiSearchMailMessages(
  params: ApiSearchMailMessagesParams,
  onUnauthorized: () => void,
  onNewToken?: (token: string) => void,
): Promise<MailMessageSearch> {
  const response = await fetchWithAuth(
    `${apiBaseUrl}/mail/messages/search`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: params.query, limit: params.limit }),
    },
    onNewToken,
  );
  return parseAuthenticatedSchema(response, MailMessageSearchSchema, onUnauthorized);
}

export async function apiGetMailAccount(
  onUnauthorized: () => void,
  onNewToken?: (token: string) => void,
): Promise<MailAccount> {
  const response = await fetchWithAuth(`${apiBaseUrl}/mail/account`, { method: "GET" }, onNewToken);
  return parseAuthenticatedSchema(response, MailAccountSchema, onUnauthorized);
}

export async function apiUpsertMailAccount(
  payload: {
    imapHost?: string;
    imapPort?: number;
    imapUsername?: string;
    password: string;
  },
  onUnauthorized: () => void,
  onNewToken?: (token: string) => void,
): Promise<MailAccount> {
  const response = await fetchWithAuth(
    `${apiBaseUrl}/mail/account`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    onNewToken,
  );
  return parseAuthenticatedSchema(response, MailAccountSchema, onUnauthorized);
}

export async function apiDeleteMailAccount(
  onUnauthorized: () => void,
  onNewToken?: (token: string) => void,
): Promise<void> {
  const response = await fetchWithAuth(
    `${apiBaseUrl}/mail/account`,
    { method: "DELETE" },
    onNewToken,
  );
  if (response.status === 401 || response.status === 403) {
    onUnauthorized();
    throw new Error("Unauthorized");
  }
  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
}
