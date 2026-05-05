export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "/api";

const TOKEN_KEY = "dmis_token";
const REFRESH_TOKEN_KEY = "dmis_refresh_token";

export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) ?? "";
}

export function getRefreshToken(): string {
  return localStorage.getItem(REFRESH_TOKEN_KEY) ?? "";
}

export function setTokens(token: string, refreshToken: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
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
export async function parseAuthenticatedJson<T>(response: Response, onUnauthorized: () => void): Promise<T> {
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

/**
 * Fetch with automatic token refresh on 401.
 * Reads token from localStorage, retries once after refreshing if 401 is received.
 * Calls onNewToken when a new token is issued so callers can update React state.
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
  onNewToken?: (token: string) => void
): Promise<Response> {
  const authOptions = withAuthHeader(options, getToken());
  const response = await fetch(url, authOptions);

  if (response.status !== 401) {
    return response;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return response;
  }

  const refreshResponse = await fetch(`${apiBaseUrl}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken })
  });

  if (!refreshResponse.ok) {
    clearTokens();
    return response;
  }
  const refreshPayload = (await parsePublicJson<{
    token: string;
    refreshToken: string;
  }>(refreshResponse));
  setTokens(refreshPayload.token, refreshPayload.refreshToken);
  onNewToken?.(refreshPayload.token);

  return fetch(url, withAuthHeader(options, refreshPayload.token));
}

function withAuthHeader(options: RequestInit, token: string): RequestInit {
  const baseHeaders = options.headers ? (options.headers as Record<string, string>) : {};
  const headers: Record<string, string> = { ...baseHeaders };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return {
    ...options,
    headers
  };
}

export type AssistantThreadView = {
  id: string;
  title: string;
  ideologyProfileId: string;
  knowledgeSourceIds: string[];
};

export async function apiListAssistantThreads(onUnauthorized: () => void, onNewToken?: (token: string) => void): Promise<AssistantThreadView[]> {
  const response = await fetchWithAuth(`${apiBaseUrl}/assistant/threads`, { method: "GET" }, onNewToken);
  return parseAuthenticatedJson<AssistantThreadView[]>(response, onUnauthorized);
}

export async function apiMentionDocuments(query: string, onUnauthorized: () => void, onNewToken?: (token: string) => void): Promise<{ id: string; title: string }[]> {
  const response = await fetchWithAuth(
    `${apiBaseUrl}/assistant/documents/mentions?q=${encodeURIComponent(query)}&limit=8`,
    { method: "GET" },
    onNewToken
  );
  return parseAuthenticatedJson<{ id: string; title: string }[]>(response, onUnauthorized);
}
