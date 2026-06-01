import { QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useSession } from "./features/auth/useSession";
import { LoginPage } from "./pages/LoginPage";
import { queryClient } from "./shared/api/queryClient";
import { ToastProvider } from "./shared/ui/ToastProvider";

/**
 * Целевая структура каталогов `frontend/src` (см. README → "Frontend layout"):
 *
 *   pages/                 — экраны верхнего уровня (Login, Workspace, Dashboard,
 *                            DocumentCard, Settings, Static).
 *   features/              — бизнес-логика и UI отдельных фич:
 *     auth/                — useSession и связанные хуки/сервисы.
 *     assistant/           — AI-панель, цитаты.
 *     documents/           — таблица документов и операции над ними.
 *     actions/             — карточки AI-действий и подтверждение.
 *   shared/                — переиспользуемая инфраструктура:
 *     api/                 — apiClient-обёртки, queryClient, схемы.
 *     ui/                  — UI-примитивы (Avatar, StatusBadge, Toast и т. п.).
 *     sse/                 — SSE-хуки.
 *     store/               — Zustand-сторы.
 *   entities/              — типы доменных моделей (DocumentView, Citation и т. п.).
 *
 * App.tsx сознательно оставлен тонким: только провайдеры и переключение
 * Login ↔ Workspace на основе состояния `useSession`.
 */

const WorkspacePage = lazy(() =>
  import("./pages/WorkspacePage").then((module) => ({ default: module.WorkspacePage })),
);

export function App() {
  const session = useSession();
  const isAuthenticated = !!session.token && !!session.user;

  useEffect(() => {
    const { pathname, search, hash } = window.location;
    if (!isAuthenticated && pathname !== "/login") {
      window.history.replaceState(null, "", `/login${search}${hash}`);
      return;
    }
    if (isAuthenticated && pathname === "/login") {
      window.history.replaceState(null, "", `/${search}${hash}`);
    }
  }, [isAuthenticated]);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        {!isAuthenticated ? (
          <LoginPage onLogin={session.login} />
        ) : (
          <Suspense fallback={<div className="p-4 text-sm text-muted">Загрузка интерфейса…</div>}>
            <Routes>
              <Route
                path="*"
                element={
                  <WorkspacePage
                    user={session.user}
                    token={session.token}
                    onSessionExpired={session.logout}
                    onTokenRefresh={session.refreshToken}
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
