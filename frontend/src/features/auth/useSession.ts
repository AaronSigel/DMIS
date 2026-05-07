import { useCallback, useEffect, useState } from "react";
import {
  apiBaseUrl,
  clearTokens,
  fetchWithAuth,
  getToken,
  parseAuthenticatedJson,
  setToken as persistAccessToken,
} from "../../apiClient";

/** Базовый профиль пользователя, получаемый из `/auth/me`. */
export type SessionUser = {
  id: string;
  fullName: string;
  email: string;
  roles?: string[];
};

/**
 * Состояние и API auth-фичи: хранит access-токен и профиль текущего пользователя,
 * подгружает `/auth/me` при наличии токена и предоставляет обработчики
 * `login` / `logout` / `refreshToken` для UI-слоя.
 *
 * Логика инкапсулирована здесь, чтобы `App.tsx` оставался тонкой обёрткой
 * над провайдерами и роутингом.
 */
export function useSession() {
  const [token, setTokenState] = useState<string>(() => getToken());
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    if (import.meta.env.DEV) {
      // Диагностика конфигурации API в dev-режиме.
      console.info("[DMIS] API base URL:", apiBaseUrl);
    }
  }, []);

  const login = useCallback((nextToken: string, nextUser: SessionUser) => {
    persistAccessToken(nextToken);
    setTokenState(nextToken);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setTokenState("");
    setUser(null);
  }, []);

  const refreshToken = useCallback((nextToken: string) => {
    setTokenState(nextToken);
  }, []);

  useEffect(() => {
    if (!token || user) return;
    const controller = new AbortController();
    fetchWithAuth(`${apiBaseUrl}/auth/me`, { signal: controller.signal }, refreshToken)
      .then((res) => parseAuthenticatedJson<SessionUser>(res, logout))
      .then((u) => setUser(u))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        logout();
      });
    return () => {
      controller.abort();
    };
    // logout/refreshToken стабильны (useCallback без зависимостей), эффект завязан только на token.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return { token, user, login, logout, refreshToken } as const;
}
