import { type FormEvent, useState } from "react";
import { apiBaseUrl, parsePublicJson, readApiError } from "../apiClient";

type User = { id: string; fullName: string; email: string; roles?: string[] };

type LoginPageProps = {
  onLogin: (t: string, u: User) => void;
};

function mapLoginError(status?: number, message?: string): string {
  if (status === 401) return "Неверный email или пароль.";
  if (status === 400) return "Проверьте корректность email и пароля.";
  if (status === 403) return "Доступ запрещен для этого аккаунта.";
  if (message?.includes("Failed to fetch")) {
    return "Сервер недоступен. Проверьте настройки API/CORS и запуск backend.";
  }
  return message || "Не удалось выполнить вход.";
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const healthRes = await fetch(`${apiBaseUrl}/health`);
      if (!healthRes.ok) {
        setError("Сервер backend недоступен. Проверьте, что API отвечает на /health.");
        return;
      }
      const res = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const apiError = await readApiError(res);
        throw new Error(mapLoginError(res.status, apiError.message ?? apiError.errorCode));
      }
      const p = await parsePublicJson<{ token: string; user: User }>(res);
      onLogin(p.token, p.user);
    } catch (err) {
      setError(mapLoginError(undefined, err instanceof Error ? err.message : "Ошибка входа"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <div className="w-[340px] rounded-[14px] border border-border bg-white px-12 py-10">
        <h1 className="mb-1 mt-0 font-mono text-[28px] text-primary">DMIS</h1>
        <p className="mb-6 mt-0 text-sm text-muted">
          Система документооборота и интеллектуального поиска
        </p>
        <p className="mb-[14px] mt-0 text-xs text-muted">
          API: <code>{apiBaseUrl}</code>
        </p>
        <form onSubmit={submit} className="flex flex-col gap-2.5">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Электронная почта"
            required
            autoComplete="username"
            className="w-full rounded-lg border border-border bg-surface px-3 py-[9px] text-sm outline-none"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-border bg-surface px-3 py-[9px] text-sm outline-none"
          />
          {error && <p className="m-0 text-[13px] text-danger">{error}</p>}
          <button
            type="submit"
            disabled={!email || !password || submitting}
            className="mt-1 rounded-lg border-0 bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Входим..." : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
}
