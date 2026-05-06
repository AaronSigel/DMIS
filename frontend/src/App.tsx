import { QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import {
  apiBaseUrl,
  clearTokens,
  fetchWithAuth,
  getToken,
  parseAuthenticatedJson,
  setToken as persistAccessToken,
} from "./apiClient";
import { LoginPage } from "./pages/LoginPage";
import { queryClient } from "./shared/api/queryClient";
import { ToastProvider } from "./shared/ui/ToastProvider";

type User = { id: string; fullName: string; email: string; roles?: string[] };
const WorkspacePage = lazy(() =>
  import("./pages/WorkspacePage").then((module) => ({ default: module.WorkspacePage })),
);

export function App() {
  const [token, setToken] = useState<string>(() => getToken());
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (import.meta.env.DEV) {
      // Диагностика конфигурации API в dev-режиме.
      console.info("[DMIS] API base URL:", apiBaseUrl);
    }
  }, []);

  const handleLogin = useCallback((t: string, u: User) => {
    persistAccessToken(t);
    setToken(t);
    setUser(u);
  }, []);

  const handleSessionExpired = useCallback(() => {
    clearTokens();
    setToken("");
    setUser(null);
  }, []);

  const handleTokenRefresh = useCallback((newToken: string) => {
    setToken(newToken);
  }, []);

  useEffect(() => {
    if (!token || user) return;
    const controller = new AbortController();
    fetchWithAuth(`${apiBaseUrl}/auth/me`, { signal: controller.signal }, handleTokenRefresh)
      .then((res) => parseAuthenticatedJson<User>(res, handleSessionExpired))
      .then((u) => setUser(u))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        handleSessionExpired();
      });
    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        {!token || !user ? (
          <LoginPage onLogin={handleLogin} />
        ) : (
          <Suspense fallback={<div className="p-4 text-sm text-muted">Загрузка интерфейса…</div>}>
            <Routes>
              <Route
                path="*"
                element={
                  <WorkspacePage
                    user={user}
                    token={token}
                    onSessionExpired={handleSessionExpired}
                    onTokenRefresh={handleTokenRefresh}
                  />
                }
              />
            </Routes>
          </Suspense>
        )}
      </ToastProvider>
    </QueryClientProvider>
  );
}
