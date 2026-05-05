import { type CSSProperties, type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  apiBaseUrl,
  clearTokens,
  fetchWithAuth,
  getToken,
  parseAuthenticatedJson,
  parsePublicJson,
  readApiError,
  setTokens,
} from "./apiClient";
import type { DocumentPage, DocumentView } from "./types/document";
import type { AnswerWithSourcesResponse } from "./types/search";

// ─── types ───────────────────────────────────────────────────────────────────

type User = { id: string; fullName: string; email: string; roles?: string[] };
type AiAction = { id: string; intent: string; status: "DRAFT" | "CONFIRMED" | "EXECUTED" };

function isAdmin(u: User | null) {
  return u?.roles?.includes("ADMIN") ?? false;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "только что";
  if (mins < 60) return `${mins} мин назад`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h} ч назад`;
  const d = Math.floor(h / 24);
  if (d === 1) return "вчера";
  if (d < 7) return `${d} дн назад`;
  return `${Math.floor(d / 7)} нед назад`;
}

function docIcon(doc: DocumentView): string {
  const t = doc.title.toLowerCase();
  if (t.includes("transcript") || doc.type?.toLowerCase() === "transcript") return "🎤";
  if (doc.tags?.includes("restricted")) return "🔒";
  return "📄";
}

function docAcl(doc: DocumentView): string {
  if (doc.tags?.includes("public")) return "публичный";
  if (doc.tags?.includes("restricted")) return "ограниченный";
  return "команда";
}

function sectionTitle(s: string): string {
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

function mapApiErrorToMessage(message: string): string {
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

// ─── design tokens ────────────────────────────────────────────────────────────

const C = {
  bg: "#f5f0eb",
  sidebar: "#ede8e2",
  border: "#d8cfc6",
  orange: "#c85a2a",
  text: "#2c2519",
  muted: "#8a7f72",
  white: "#fff",
  green: "#3d9e6b",
  yellow: "#c9a720",
  grey: "#7a7570",
  red: "#c62828",
};

// ─── shared atoms ────────────────────────────────────────────────────────────

function Avatar({ name, size = 26 }: { name: string; size?: number }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "50%",
        background: C.orange,
        color: C.white,
        fontSize: size * 0.38,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {initials(name)}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const labelMap: Record<string, string> = {
    final: "финальный",
    indexed: "проиндексирован",
    review: "на проверке",
    pending: "в ожидании",
    failed: "ошибка",
    draft: "черновик",
  };
  const map: Record<string, CSSProperties> = {
    final: { background: C.green, color: C.white, border: "none" },
    indexed: { background: C.grey, color: C.white, border: "none" },
    review: { background: "transparent", color: C.yellow, border: `1px solid ${C.yellow}` },
    pending: { background: "transparent", color: C.muted, border: `1px solid ${C.muted}` },
    failed: { background: "#fee2e2", color: C.red, border: "none" },
    draft: { background: "transparent", color: C.text, border: `1px solid ${C.text}` },
  };
  const pill = map[s] ?? { background: "transparent", color: C.text, border: `1px solid ${C.border}` };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 500,
        whiteSpace: "nowrap",
        ...pill,
      }}
    >
      {labelMap[s] ?? s}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 10,
        color: C.muted,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        margin: "10px 10px 2px",
        padding: 0,
      }}
    >
      {children}
    </p>
  );
}

const smallBtn: CSSProperties = {
  padding: "4px 12px",
  borderRadius: 6,
  border: `1px solid ${C.border}`,
  background: C.white,
  color: C.text,
  cursor: "pointer",
  fontSize: 12,
  fontFamily: "inherit",
};

// ─── LoginPage ────────────────────────────────────────────────────────────────

function LoginPage({ onLogin }: { onLogin: (t: string, rt: string, u: User) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function mapLoginError(status?: number, message?: string): string {
    if (status === 401) return "Неверный email или пароль.";
    if (status === 400) return "Проверьте корректность email и пароля.";
    if (status === 403) return "Доступ запрещен для этого аккаунта.";
    if (message?.includes("Failed to fetch")) {
      return "Сервер недоступен. Проверьте настройки API/CORS и запуск backend.";
    }
    return message || "Не удалось выполнить вход.";
  }

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const apiError = await readApiError(res);
        throw new Error(mapLoginError(res.status, apiError.message ?? apiError.errorCode));
      }
      const p = await parsePublicJson<{ token: string; refreshToken: string; user: User }>(res);
      onLogin(p.token, p.refreshToken, p.user);
    } catch (err) {
      setError(mapLoginError(undefined, err instanceof Error ? err.message : "Ошибка входа"));
    } finally {
      setSubmitting(false);
    }
  }

  const field: CSSProperties = {
    padding: "9px 12px",
    borderRadius: 8,
    border: `1px solid ${C.border}`,
    fontSize: 14,
    fontFamily: "inherit",
    background: C.bg,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          background: C.white,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          padding: "40px 48px",
          width: 340,
        }}
      >
        <h1 style={{ color: C.orange, margin: "0 0 4px", fontFamily: "monospace", fontSize: 28 }}>DMIS</h1>
        <p style={{ color: C.muted, margin: "0 0 24px", fontSize: 14 }}>
          Система документооборота и интеллектуального поиска
        </p>
        <p style={{ color: C.muted, margin: "0 0 14px", fontSize: 12 }}>
          API: <code>{apiBaseUrl}</code>
        </p>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Электронная почта"
            required
            autoComplete="username"
            style={field}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            required
            autoComplete="current-password"
            style={field}
          />
          {error && <p style={{ color: "crimson", fontSize: 13, margin: 0 }}>{error}</p>}
          <button
            type="submit"
            disabled={!email || !password || submitting}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              fontFamily: "inherit",
              fontWeight: 600,
              background: C.orange,
              color: C.white,
              marginTop: 4,
            }}
          >
            {submitting ? "Входим..." : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

type SidebarProps = {
  user: User;
  docCount: number;
  width: number;
  query: string;
  onQueryChange: (q: string) => void;
  onQuerySubmit: () => void;
  onNewDoc: () => void;
  section: string;
  onSection: (s: string) => void;
  onLogout: () => void;
  mobile?: boolean;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
};

function Sidebar({
  user,
  docCount,
  width,
  query,
  onQueryChange,
  onQuerySubmit,
  onNewDoc,
  section,
  onSection,
  onLogout,
  mobile = false,
  mobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  function NavItem({
    label,
    count,
    k,
    icon,
  }: {
    label: string;
    count?: number;
    k: string;
    icon: string;
  }) {
    const active = section === k;
    return (
      <button
        onClick={() => {
          onSection(k);
          onCloseMobile?.();
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "5px 10px",
          borderRadius: 6,
          border: "none",
          background: active ? `${C.orange}20` : "transparent",
          color: active ? C.orange : C.text,
          cursor: "pointer",
          fontSize: 13,
          fontFamily: "inherit",
          textAlign: "left",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontSize: 12, opacity: 0.7 }}>{icon}</span>
          {label}
        </span>
        {count !== undefined && (
          <span style={{ color: C.muted, fontSize: 12 }}>{count}</span>
        )}
      </button>
    );
  }

  return (
    <aside
      style={{
        width,
        height: "100vh",
        background: C.sidebar,
        borderRight: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        padding: "14px 10px",
        gap: 2,
        flexShrink: 0,
        overflowY: "auto",
        position: mobile ? "fixed" : "relative",
        left: mobile ? 0 : undefined,
        top: mobile ? 0 : undefined,
        zIndex: mobile ? 30 : undefined,
        transform: mobile ? (mobileOpen ? "translateX(0)" : "translateX(-105%)") : undefined,
        transition: mobile ? "transform 150ms ease-out" : undefined,
      }}
    >
      {/* Logo + user avatar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 4px 10px",
          flexShrink: 0,
        }}
      >
        <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 20, color: C.orange }}>
          DMIS
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontSize: 10,
              background: "#fee2e2",
              color: C.red,
              borderRadius: 12,
              padding: "2px 6px",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            ● audit on
          </span>
          {mobile && (
            <button onClick={onCloseMobile} style={{ ...smallBtn, padding: "4px 8px" }}>
              Закрыть
            </button>
          )}
          <button
            onClick={onLogout}
            title="Выйти"
            style={{ border: "none", background: "transparent", cursor: "pointer", padding: 0 }}
          >
            <Avatar name={user.fullName} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 6, flexShrink: 0 }}>
        <span
          style={{
            position: "absolute",
            left: 9,
            top: "50%",
            transform: "translateY(-50%)",
            color: C.muted,
            fontSize: 14,
            pointerEvents: "none",
          }}
        >
          ⌕
        </span>
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onQuerySubmit()}
          placeholder="Спросите, найдите, или ⌘K…"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "7px 10px 7px 26px",
            borderRadius: 7,
            border: `1px solid ${C.border}`,
            fontSize: 13,
            fontFamily: "inherit",
            background: C.bg,
            outline: "none",
          }}
        />
      </div>

      {/* New */}
      <button
        onClick={onNewDoc}
        style={{
          padding: "8px 16px",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          fontSize: 14,
          fontFamily: "inherit",
          fontWeight: 600,
          background: C.orange,
          color: C.white,
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 6,
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        + Новый
      </button>

      <SectionLabel>рабочее пространство</SectionLabel>
      <NavItem label="Дашборд" k="dashboard" icon="◈" />
      <NavItem label="Документы" count={docCount} k="documents" icon="📄" />

      <SectionLabel>сервисы</SectionLabel>
      <NavItem label="Почта" k="mail" icon="✉" />
      <NavItem label="Календарь" k="calendar" icon="📅" />

      <SectionLabel>контроль</SectionLabel>
      {isAdmin(user) && <NavItem label="Журнал аудита" k="audit" icon="○" />}
      <NavItem label="Настройки" k="settings" icon="☰" />
      {isAdmin(user) && <NavItem label="ACL (скоро)" k="acl" icon="🔒" />}
    </aside>
  );
}

// ─── AiPanel ──────────────────────────────────────────────────────────────────

const SUGGESTIONS = [
  "суммируй 3 последних контракта",
  'найди документы с упоминанием "продление Acme"',
];

type AiPanelProps = {
  token: string;
  width: number;
  query: string;
  onQueryChange: (q: string) => void;
  onSessionExpired: () => void;
  onTokenRefresh: (t: string) => void;
};

function AiPanel({ token, width, query, onQueryChange, onSessionExpired, onTokenRefresh }: AiPanelProps) {
  type ThreadView = {
    id: string;
    title: string;
    ideologyProfileId: string;
    knowledgeSourceIds: string[];
  };
  type MentionDoc = { id: string; title: string };
  type ThreadDetail = {
    thread: ThreadView;
    messages: { id: string; role: string; content: string; documentIds: string[] }[];
    linkedDocumentIds: string[];
  };
  const [panelQuery, setPanelQuery] = useState("");
  const [threads, setThreads] = useState<ThreadView[]>([]);
  const [activeThreadId, setActiveThreadId] = useState("");
  const [threadDetail, setThreadDetail] = useState<ThreadDetail | null>(null);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [mentionCandidates, setMentionCandidates] = useState<MentionDoc[]>([]);
  const [manualDocId, setManualDocId] = useState("");
  const [ideologyProfileId, setIdeologyProfileId] = useState("balanced");
  const [knowledgeSourceIds, setKnowledgeSourceIds] = useState<string[]>(["documents"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const effective = panelQuery || query;

  const loadThreadDetail = useCallback(async (threadId: string) => {
    const res = await fetchWithAuth(`${apiBaseUrl}/assistant/threads/${threadId}`, { method: "GET" }, onTokenRefresh);
    const detail = await parseAuthenticatedJson<unknown>(res, onSessionExpired);
    if (!detail || typeof detail !== "object" || !("thread" in detail)) {
      setThreadDetail(null);
      setSelectedDocumentIds([]);
      return;
    }
    const typed = detail as ThreadDetail;
    setThreadDetail(typed);
    setSelectedDocumentIds(typed.linkedDocumentIds ?? []);
    setIdeologyProfileId(typed.thread.ideologyProfileId ?? "balanced");
    setKnowledgeSourceIds(typed.thread.knowledgeSourceIds?.length ? typed.thread.knowledgeSourceIds : ["documents"]);
  }, [onSessionExpired, onTokenRefresh]);

  const loadThreads = useCallback(async () => {
    const res = await fetchWithAuth(`${apiBaseUrl}/assistant/threads`, { method: "GET" }, onTokenRefresh);
    const data = await parseAuthenticatedJson<unknown>(res, onSessionExpired);
    const normalized = Array.isArray(data) ? (data as ThreadView[]) : [];
    setThreads(normalized);
    const nextId = activeThreadId || normalized[0]?.id;
    if (nextId) {
      setActiveThreadId(nextId);
      await loadThreadDetail(nextId);
    }
  }, [activeThreadId, loadThreadDetail, onSessionExpired, onTokenRefresh]);

  useEffect(() => {
    if (!token) return;
    void loadThreads().catch((e) => setError(e instanceof Error ? mapApiErrorToMessage(e.message) : "Не удалось загрузить диалоги"));
  }, [loadThreads, token]);

  async function createThread() {
    const res = await fetchWithAuth(
      `${apiBaseUrl}/assistant/threads`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: "Новый диалог" }) },
      onTokenRefresh,
    );
    const created = await parseAuthenticatedJson<ThreadView>(res, onSessionExpired);
    setThreads((prev) => [created, ...prev]);
    setActiveThreadId(created.id);
    await loadThreadDetail(created.id);
  }

  async function sendRag(question: string) {
    if (!question.trim() || !activeThreadId || !token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetchWithAuth(
        `${apiBaseUrl}/assistant/threads/${activeThreadId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question,
            documentIds: selectedDocumentIds,
            knowledgeSourceIds,
            ideologyProfileId,
          }),
        },
        onTokenRefresh,
      );
      await parseAuthenticatedJson<unknown>(res, onSessionExpired);
      await loadThreadDetail(activeThreadId);
      await loadThreads();
    } catch (e) {
      setError(e instanceof Error ? mapApiErrorToMessage(e.message) : "Не удалось получить ответ ассистента");
    } finally {
      setLoading(false);
    }
  }

  async function searchMentions(q: string) {
    const mentionIndex = q.lastIndexOf("@");
    if (mentionIndex < 0) {
      setMentionCandidates([]);
      return;
    }
    const term = q.slice(mentionIndex + 1).trim();
    const res = await fetchWithAuth(
      `${apiBaseUrl}/assistant/documents/mentions?q=${encodeURIComponent(term)}&limit=6`,
      { method: "GET" },
      onTokenRefresh,
    );
    setMentionCandidates(await parseAuthenticatedJson<MentionDoc[]>(res, onSessionExpired));
  }

  async function linkDocument(documentId: string) {
    if (!activeThreadId) return;
    const res = await fetchWithAuth(
      `${apiBaseUrl}/assistant/threads/${activeThreadId}/documents`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ documentId }) },
      onTokenRefresh,
    );
    await parseAuthenticatedJson<unknown>(res, onSessionExpired);
    await loadThreadDetail(activeThreadId);
    setManualDocId("");
    setMentionCandidates([]);
  }

  async function uploadAttachment(file: File) {
    if (!activeThreadId) return;
    const form = new FormData();
    form.append("file", file);
    const res = await fetchWithAuth(`${apiBaseUrl}/assistant/threads/${activeThreadId}/uploads`, { method: "POST", body: form }, onTokenRefresh);
    await parseAuthenticatedJson<unknown>(res, onSessionExpired);
    await loadThreadDetail(activeThreadId);
  }

  async function savePreferences() {
    const res = await fetchWithAuth(
      `${apiBaseUrl}/assistant/preferences`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideologyProfileId, knowledgeSourceIds }),
      },
      onTokenRefresh,
    );
    await parseAuthenticatedJson<unknown>(res, onSessionExpired);
  }

  return (
    <aside
      style={{
        width,
        height: "100vh",
        background: C.bg,
        borderLeft: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 16px 12px",
          borderBottom: `1px solid ${C.border}`,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>ассистент</span>
          <span
            style={{
              fontSize: 11,
              background: "#edddd4",
              color: C.orange,
              borderRadius: 12,
              padding: "2px 8px",
              fontWeight: 500,
            }}
          >
            с источниками
          </span>
        </div>
      </div>

      {/* Threads */}
      <div style={{ padding: "12px 16px 8px", flexShrink: 0, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <p style={{ margin: 0, fontSize: 11, color: C.muted, fontWeight: 700, textTransform: "uppercase" }}>диалоги</p>
          <button style={smallBtn} onClick={() => void createThread()}>+ чат</button>
        </div>
        <div style={{ display: "grid", gap: 6, maxHeight: 120, overflowY: "auto" }}>
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => {
                setActiveThreadId(thread.id);
                void loadThreadDetail(thread.id);
              }}
              style={{ ...smallBtn, textAlign: "left", background: activeThreadId === thread.id ? "#edddd4" : C.white }}
            >
              {thread.title}
            </button>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      <div style={{ padding: "12px 16px 8px", flexShrink: 0 }}>
        <p
          style={{
            fontSize: 10,
            color: C.muted,
            margin: "0 0 8px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
          }}
        >
          подсказки
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setPanelQuery(s);
                onQueryChange(s);
                void sendRag(s);
              }}
              style={{
                padding: "9px 12px",
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                background: C.white,
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "inherit",
                color: C.text,
                textAlign: "left",
                lineHeight: 1.4,
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Assistant results */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px" }}>
        {loading && (
          <p style={{ color: C.muted, fontSize: 13 }}>Думаю…</p>
        )}
        {error && (
          <p style={{ color: "crimson", fontSize: 13, margin: "0 0 8px" }}>{error}</p>
        )}
        {threadDetail && (
          <div>
            <p style={{ margin: "0 0 8px", fontSize: 11, color: C.muted }}>
              Профиль: {ideologyProfileId} · Источники: {knowledgeSourceIds.join(", ")}
            </p>
            <div style={{ display: "grid", gap: 8 }}>
              {threadDetail.messages.map((m) => (
                <div key={m.id} style={{ border: `1px solid ${C.border}`, borderRadius: 8, background: C.white, padding: "8px 10px" }}>
                  <p style={{ margin: "0 0 4px", fontSize: 11, color: C.muted }}>{m.role === "USER" ? "Вы" : "Ассистент"}</p>
                  <p style={{ margin: 0, fontSize: 13, color: C.text, lineHeight: 1.5 }}>{m.content}</p>
                </div>
              ))}
            </div>
            {selectedDocumentIds.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <p style={{ margin: "0 0 4px", fontSize: 11, color: C.muted }}>Контекст документов</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {selectedDocumentIds.map((id) => (
                    <button key={id} style={{ ...smallBtn, padding: "2px 8px", fontSize: 11 }} onClick={() => setSelectedDocumentIds((prev) => prev.filter((docId) => docId !== id))}>
                      {id} ×
                    </button>
                  ))}
                </div>
              </div>
            )}
            <details style={{ marginTop: 8 }}>
              <summary style={{ cursor: "pointer", fontSize: 11, color: C.muted }}>Управление контекстом</summary>
              <div style={{ marginTop: 6, display: "grid", gap: 6 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    value={manualDocId}
                    onChange={(e) => setManualDocId(e.target.value)}
                    placeholder="ID документа вручную"
                    style={{ flex: 1, padding: "6px 8px", borderRadius: 6, border: `1px solid ${C.border}` }}
                  />
                  <button style={smallBtn} onClick={() => void linkDocument(manualDocId)}>Привязать</button>
                </div>
                <label style={{ ...smallBtn, display: "inline-block", textAlign: "center", cursor: "pointer" }}>
                  Загрузить файл в чат
                  <input type="file" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && void uploadAttachment(e.target.files[0])} />
                </label>
                <div style={{ display: "flex", gap: 6 }}>
                  <select value={ideologyProfileId} onChange={(e) => setIdeologyProfileId(e.target.value)} style={{ flex: 1, padding: "6px 8px", borderRadius: 6, border: `1px solid ${C.border}` }}>
                    <option value="balanced">balanced</option>
                    <option value="strict">strict</option>
                    <option value="creative">creative</option>
                  </select>
                  <button style={smallBtn} onClick={() => void savePreferences()}>Сохранить</button>
                </div>
              </div>
            </details>
            {!!mentionCandidates.length && (
              <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
                {mentionCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    style={{
                      border: `1px solid ${C.border}`,
                      borderRadius: 6,
                      background: C.white,
                      padding: "6px 8px",
                      cursor: "pointer",
                    }}
                    onClick={() => void linkDocument(candidate.id)}
                  >
                    @{candidate.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Input */}
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <input
            value={effective}
            onChange={(e) => {
              setPanelQuery(e.target.value);
              onQueryChange(e.target.value);
              void searchMentions(e.target.value);
            }}
            onKeyDown={(e) => e.key === "Enter" && void sendRag(effective)}
            placeholder="Спросите по вашим документам…"
            style={{
              flex: 1,
              padding: "8px 10px",
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              fontSize: 13,
              fontFamily: "inherit",
              background: C.bg,
              outline: "none",
            }}
          />
          <button
            onClick={() => void sendRag(effective)}
            disabled={!effective.trim() || loading || !token || !activeThreadId}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "none",
              background: C.orange,
              color: C.white,
              cursor: "pointer",
              fontSize: 16,
              opacity: !effective.trim() || loading ? 0.5 : 1,
            }}
          >
            ↑
          </button>
        </div>
        <p style={{ fontSize: 10, color: C.muted, margin: "6px 0 0", textAlign: "center" }}>
          AI-ассистент · RAG + действия через сервер
        </p>
      </div>
    </aside>
  );
}

// ─── TopBarBtn / DictateBtn ───────────────────────────────────────────────────

function TopBarBtn({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 14px",
        borderRadius: 20,
        border: `1px solid ${C.border}`,
        background: "transparent",
        cursor: "pointer",
        fontSize: 13,
        fontFamily: "inherit",
        color: C.text,
      }}
    >
      {children}
    </button>
  );
}

function DictateBtn({
  token,
  onSessionExpired,
  onTokenRefresh,
  onTranscript,
}: {
  token: string;
  onSessionExpired: () => void;
  onTokenRefresh: (t: string) => void;
  onTranscript: (text: string) => void;
}) {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");
  const mrRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  async function toggle() {
    if (recording) {
      mrRef.current?.stop();
      setRecording(false);
      return;
    }
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunks.current = [];
      mr.ondataavailable = (e) => chunks.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        const form = new FormData();
        form.append("audio", blob, "recording.webm");
        form.append("language", "ru");
        try {
          const res = await fetchWithAuth(
            `${apiBaseUrl}/stt/audio`,
            { method: "POST", body: form },
            onTokenRefresh,
          );
          const payload = await parseAuthenticatedJson<{ text: string }>(res, onSessionExpired);
          onTranscript(payload.text);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Ошибка распознавания речи");
        }
      };
      mr.start();
      mrRef.current = mr;
      setRecording(true);
    } catch {
      setError("Доступ к микрофону отклонен");
    }
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => void toggle()}
        style={{
          padding: "5px 14px",
          borderRadius: 20,
          border: `1px solid ${C.border}`,
          background: recording ? "#fee2e2" : "transparent",
          cursor: "pointer",
          fontSize: 13,
          fontFamily: "inherit",
          color: recording ? C.red : C.text,
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        🎤 {recording ? "стоп" : "диктовка"}
      </button>
      {error && (
        <span
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            fontSize: 11,
            color: "crimson",
            whiteSpace: "nowrap",
            marginTop: 2,
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}

// ─── DocTable ─────────────────────────────────────────────────────────────────

type DocTableProps = {
  token: string;
  user: User;
  onSessionExpired: () => void;
  onTokenRefresh: (t: string) => void;
  section: string;
  uploadTrigger: number;
  onQueryChange: (q: string) => void;
};

function DocTable({
  token,
  user,
  onSessionExpired,
  onTokenRefresh,
  section,
  uploadTrigger,
  onQueryChange,
}: DocTableProps) {
  const [docPage, setDocPage] = useState<DocumentPage | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterActive, setFilterActive] = useState(false);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const loadDocs = useCallback(
    async (p = 0) => {
      if (!token) return;
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ page: String(p), size: "20" });
      if (section === "pinned") params.set("tag", "pinned");
      if (section === "transcripts") params.set("tag", "transcript");
      if (section === "contracts") params.set("tag", "contract");
      if (section === "memos") params.set("tag", "memo");
      if (section === "reports") params.set("tag", "report");
      try {
        const res = await fetchWithAuth(
          `${apiBaseUrl}/documents?${params}`,
          {},
          onTokenRefresh,
        );
        const payload = await parseAuthenticatedJson<DocumentPage>(res, onSessionExpired);
        setDocPage(payload);
      } catch (e) {
        if (e instanceof Error && e.message !== "Unauthorized") setError(mapApiErrorToMessage(e.message));
      } finally {
        setLoading(false);
      }
    },
    [token, section, onSessionExpired, onTokenRefresh],
  );

  useEffect(() => {
    setPage(0);
    void loadDocs(0);
  }, [loadDocs]);

  useEffect(() => {
    if (uploadTrigger > 0) fileRef.current?.click();
  }, [uploadTrigger]);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    e.target.value = "";
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetchWithAuth(
        `${apiBaseUrl}/documents`,
        { method: "POST", body: form },
        onTokenRefresh,
      );
      await parseAuthenticatedJson<unknown>(res, onSessionExpired);
      await loadDocs(0);
    } catch (e) {
      setError(e instanceof Error ? mapApiErrorToMessage(e.message) : "Не удалось загрузить файл");
    }
  }

  const docs = docPage?.content ?? [];
  const cols = "1fr 140px 100px 110px 32px";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px 14px",
          borderBottom: `1px solid ${C.border}`,
          flexShrink: 0,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.text }}>
          {sectionTitle(section)}
        </h2>
        <div style={{ display: "flex", gap: 8 }}>
          <TopBarBtn onClick={() => setFilterActive((v) => !v)}>{filterActive ? "Фильтр: вкл" : "Фильтр"}</TopBarBtn>
          <TopBarBtn onClick={() => setSortOrder((v) => (v === "newest" ? "oldest" : "newest"))}>
            {sortOrder === "newest" ? "Сортировка: новые" : "Сортировка: старые"}
          </TopBarBtn>
          <DictateBtn
            token={token}
            onSessionExpired={onSessionExpired}
            onTokenRefresh={onTokenRefresh}
            onTranscript={(text) => onQueryChange(text)}
          />
        </div>
      </div>

      {/* Table area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 16px" }}>
        <input ref={fileRef} type="file" style={{ display: "none" }} onChange={handleFileSelect} />
        {error && (
          <p style={{ color: "crimson", fontSize: 13, padding: "8px 0" }}>{error}</p>
        )}
        <p style={{ color: C.muted, fontSize: 12, margin: "8px 0 6px" }}>
          {filterActive
            ? "Показаны документы с активным фильтром (демо-режим)."
            : "Фильтр выключен. Показаны все документы текущего раздела."}
        </p>

        {/* Column headers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: cols,
            gap: 0,
            position: "sticky",
            top: 0,
            background: C.bg,
            zIndex: 1,
          }}
        >
          {["название", "владелец / ACL", "обновлено", "статус", ""].map((h) => (
            <div
              key={h}
              style={{
                padding: "10px 0",
                fontSize: 11,
                color: C.muted,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              {h}
            </div>
          ))}
        </div>

        {loading && !docs.length && (
          <p style={{ color: C.muted, fontSize: 13, padding: "16px 0" }}>Загрузка документов…</p>
        )}
        {!loading && !docs.length && (
          <div style={{ color: C.muted, fontSize: 13, padding: "16px 0", display: "grid", gap: 8 }}>
            <p style={{ margin: 0 }}>Документы пока не найдены.</p>
            <p style={{ margin: 0 }}>Нажмите «+ Новый», чтобы загрузить первый документ в систему.</p>
          </div>
        )}

        {docs.map((doc, i) => (
          <DocRow
            key={doc.id}
            doc={doc}
            cols={cols}
            last={i === docs.length - 1}
            onClick={() => navigate(`/documents/${doc.id}`)}
          />
        ))}

        {docPage && docPage.totalPages > 1 && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 16 }}>
            <button
              disabled={page <= 0}
              onClick={() => {
                const p = page - 1;
                setPage(p);
                void loadDocs(p);
              }}
              style={smallBtn}
            >
              ← Назад
            </button>
            <span style={{ fontSize: 13, color: C.muted }}>
              {page + 1} / {docPage.totalPages}
            </span>
            <button
              disabled={page >= docPage.totalPages - 1}
              onClick={() => {
                const p = page + 1;
                setPage(p);
                void loadDocs(p);
              }}
              style={smallBtn}
            >
              Далее →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function DocRow({
  doc,
  cols,
  last,
  onClick,
}: {
  doc: DocumentView;
  cols: string;
  last: boolean;
  onClick: () => void;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: cols,
        alignItems: "center",
        borderBottom: last ? "none" : `1px dashed ${C.border}`,
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      {/* Name */}
      <div
        style={{
          padding: "11px 0",
          display: "flex",
          alignItems: "center",
          gap: 8,
          overflow: "hidden",
        }}
      >
        <span style={{ fontSize: 14, flexShrink: 0 }}>{docIcon(doc)}</span>
        <span
          style={{
            fontSize: 14,
            color: C.text,
            fontWeight: 500,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {doc.title}
        </span>
      </div>

      {/* Owner / ACL */}
      <div style={{ padding: "11px 0", display: "flex", alignItems: "center", gap: 6 }}>
        <Avatar name={doc.ownerId.slice(0, 8)} size={22} />
        <span style={{ fontSize: 12, color: C.muted }}>{docAcl(doc)}</span>
      </div>

      {/* Updated */}
      <div style={{ padding: "11px 0", fontSize: 12, color: C.muted }}>
        {doc.updatedAt ? timeAgo(doc.updatedAt) : "—"}
      </div>

      {/* Status */}
      <div style={{ padding: "11px 0" }}>
        <StatusBadge status={doc.status} />
      </div>

      {/* Menu */}
      <div style={{ padding: "11px 0", textAlign: "center" }}>
        <span style={{ fontSize: 16, color: C.muted }}>⋯</span>
      </div>
    </div>
  );
}

// ─── DocumentCardPage ─────────────────────────────────────────────────────────

type DocCardProps = {
  token: string;
  onSessionExpired: () => void;
  onTokenRefresh: (t: string) => void;
};

function DocumentCardPage({ token, onSessionExpired, onTokenRefresh }: DocCardProps) {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<DocumentView | null>(null);
  const [loading, setLoading] = useState(false);
  const [versionFile, setVersionFile] = useState<File | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [fullText, setFullText] = useState<string | null>(null);
  const [fullTextLoading, setFullTextLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function loadCard() {
    if (!documentId || !token) return;
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${apiBaseUrl}/documents/${documentId}`, {}, onTokenRefresh);
      const payload = await parseAuthenticatedJson<DocumentView>(res, onSessionExpired);
      setDoc(payload);
      setTagInput(payload.tags.join(", "));
      setFullText(null);
    } catch (e) {
      if (e instanceof Error && e.message !== "Unauthorized") setMsg(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function addVersion() {
    if (!documentId || !token || !versionFile) return;
    const form = new FormData();
    form.append("file", versionFile);
    const res = await fetchWithAuth(`${apiBaseUrl}/documents/${documentId}/versions`, {
      method: "POST",
      body: form,
    }, onTokenRefresh);
    const payload = await parseAuthenticatedJson<DocumentView>(res, onSessionExpired);
    setDoc(payload);
    setTagInput(payload.tags.join(", "));
    setVersionFile(null);
    setMsg("Версия загружена.");
  }

  async function saveTags() {
    if (!documentId || !token) return;
    const tags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const res = await fetchWithAuth(`${apiBaseUrl}/documents/${documentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags }),
    }, onTokenRefresh);
    const payload = await parseAuthenticatedJson<DocumentView>(res, onSessionExpired);
    setDoc(payload);
    setTagInput(payload.tags.join(", "));
    setMsg("Теги обновлены.");
  }

  async function loadFullText() {
    if (!documentId || !token) return;
    setFullTextLoading(true);
    try {
      const res = await fetchWithAuth(`${apiBaseUrl}/documents/${documentId}/extracted-text`, {}, onTokenRefresh);
      if (res.status === 401 || res.status === 403) {
        onSessionExpired();
        return;
      }
      if (!res.ok) throw new Error(await res.text());
      setFullText(await res.text());
    } catch (e) {
      setMsg(String(e));
    } finally {
      setFullTextLoading(false);
    }
  }

  useEffect(() => {
    void loadCard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId, token]);

  if (loading && !doc) return <p style={{ padding: 24, color: C.muted }}>Загрузка…</p>;
  if (!doc)
    return (
      <div style={{ padding: 24 }}>
        <p style={{ color: C.muted }}>Документ не загружен.</p>
        <button style={smallBtn} onClick={() => void loadCard()}>
          Повторить
        </button>
      </div>
    );

  const latest = doc.versions.find((v) => v.latest) ?? doc.versions[doc.versions.length - 1];
  const ct = latest?.contentType ?? "";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "16px 24px 14px",
          borderBottom: `1px solid ${C.border}`,
          gap: 12,
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{ ...smallBtn, fontSize: 18, padding: "2px 10px" }}
        >
          ←
        </button>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text, flex: 1 }}>
          {doc.title}
        </h2>
        <StatusBadge status={doc.status} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
        {msg && <p style={{ color: C.muted, fontSize: 13, margin: "0 0 12px" }}>{msg}</p>}

        {/* Meta cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
          <MetaCard label="Владелец" value={doc.ownerId} />
          <MetaCard label="Тип" value={doc.type || "—"} />
          <MetaCard label="Хранилище" value={doc.storageRef || "—"} />
        </div>

        {/* Tags */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="теги через запятую"
            style={{
              flex: 1,
              maxWidth: 480,
              padding: "7px 10px",
              borderRadius: 7,
              border: `1px solid ${C.border}`,
              fontSize: 13,
              fontFamily: "inherit",
              background: C.bg,
              outline: "none",
            }}
          />
          <button
            onClick={() => void saveTags()}
            style={{ ...smallBtn, background: C.orange, color: C.white, border: "none" }}
          >
            Сохранить теги
          </button>
        </div>

        {/* Preview */}
        <Section label="Предпросмотр">
          <DocumentPreview
            documentId={doc.id}
            contentType={ct}
            onSessionExpired={onSessionExpired}
            onTokenRefresh={onTokenRefresh}
          />
        </Section>

        {/* Extracted text */}
        <Section
          label={`Извлеченный текст (${doc.extractedTextLength} символов${doc.extractedTextTruncated ? ", усечено" : ""})`}
        >
          <pre
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              background: "#f7f5f2",
              padding: 10,
              borderRadius: 8,
              maxHeight: 180,
              overflow: "auto",
              fontSize: 12,
              margin: 0,
            }}
          >
            {doc.extractedTextTruncated
              ? `${doc.extractedTextPreview}…`
              : doc.extractedTextPreview}
          </pre>
          <button
            style={{ ...smallBtn, marginTop: 8 }}
            onClick={() => void loadFullText()}
            disabled={fullTextLoading}
          >
            {fullTextLoading ? "Загрузка…" : "Загрузить полный текст"}
          </button>
          {fullText !== null && (
            <pre
              style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                background: "#f0f8f4",
                padding: 10,
                borderRadius: 8,
                maxHeight: 320,
                overflow: "auto",
                fontSize: 12,
                marginTop: 8,
              }}
            >
              {fullText}
            </pre>
          )}
        </Section>

        {/* Versions */}
        <Section label="Версии">
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 }}>
            {doc.versions.map((v) => (
              <div
                key={v.versionId}
                style={{
                  display: "flex",
                  gap: 12,
                  fontSize: 13,
                  padding: "6px 10px",
                  background: v.latest ? "#e8f5ed" : C.bg,
                  borderRadius: 6,
                  alignItems: "center",
                }}
              >
                <span style={{ fontFamily: "monospace", fontSize: 11, color: C.muted }}>
                  {v.versionId.slice(0, 8)}…
                </span>
                <span style={{ flex: 1 }}>{v.fileName}</span>
                <span style={{ color: C.muted }}>{v.contentType}</span>
                <span style={{ color: C.muted }}>{(v.sizeBytes / 1024).toFixed(1)} KB</span>
                {v.latest && <span style={{ color: C.green, fontSize: 11 }}>● текущая</span>}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="file"
              onChange={(e) => setVersionFile(e.target.files?.[0] ?? null)}
              style={{ fontSize: 13 }}
            />
            <button
              onClick={() => void addVersion()}
              disabled={!versionFile}
              style={{ ...smallBtn, background: C.orange, color: C.white, border: "none" }}
            >
              Добавить версию
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p
        style={{
          fontSize: 11,
          color: C.muted,
          margin: "0 0 8px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: C.bg,
        borderRadius: 8,
        padding: "10px 12px",
        border: `1px solid ${C.border}`,
      }}
    >
      <p
        style={{
          fontSize: 10,
          color: C.muted,
          margin: "0 0 2px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 13,
          color: C.text,
          margin: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </p>
    </div>
  );
}

// ─── DocumentPreview ──────────────────────────────────────────────────────────

function DocumentPreview({
  documentId,
  contentType,
  onSessionExpired,
  onTokenRefresh,
}: {
  documentId: string;
  contentType: string;
  onSessionExpired: () => void;
  onTokenRefresh: (t: string) => void;
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let revoked = false;
    let url: string | null = null;
    setError("");
    setBlobUrl(null);
    setTextContent(null);
    const isPdf = contentType.includes("pdf");
    const isText = contentType.includes("text/plain");
    if (!isPdf && !isText) return;

    async function run() {
      try {
        const res = await fetchWithAuth(
          `${apiBaseUrl}/documents/${documentId}/binary?disposition=inline`,
          {},
          onTokenRefresh,
        );
        if (res.status === 401 || res.status === 403) {
          onSessionExpired();
          return;
        }
        if (!res.ok) {
          setError(await res.text());
          return;
        }
        const blob = await res.blob();
        if (revoked) return;
        if (isText) {
          const text = await blob.text();
          if (!revoked) setTextContent(text);
        } else {
          url = URL.createObjectURL(blob);
          if (!revoked) setBlobUrl(url);
        }
      } catch (e) {
        if (!revoked) setError(String(e));
      }
    }
    void run();
    return () => {
      revoked = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [documentId, contentType, onSessionExpired, onTokenRefresh]);

  if (!contentType) return <p style={{ color: C.muted, fontSize: 13 }}>Нет метаданных версии.</p>;
  if (!contentType.includes("pdf") && !contentType.includes("text/plain"))
    return (
      <p style={{ color: C.muted, fontSize: 13 }}>
        Предпросмотр доступен для PDF и обычного текста. Тип текущего файла: {contentType}.
      </p>
    );
  if (error) return <p style={{ color: "crimson", fontSize: 13 }}>{error}</p>;
  if (contentType.includes("text/plain") && textContent !== null)
    return (
      <pre
        style={{
          whiteSpace: "pre-wrap",
          border: `1px solid ${C.border}`,
          padding: 10,
          borderRadius: 8,
          maxHeight: 360,
          overflow: "auto",
          fontSize: 12,
          background: C.bg,
        }}
      >
        {textContent}
      </pre>
    );
  if (contentType.includes("pdf") && blobUrl)
    return (
      <iframe
        title="Предпросмотр документа"
        src={blobUrl}
        style={{ width: "100%", height: 420, border: `1px solid ${C.border}`, borderRadius: 8 }}
      />
    );
  return <p style={{ color: C.muted, fontSize: 13 }}>Загрузка предпросмотра…</p>;
}

function Card({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <div
      style={{
        background: C.white,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: 14,
      }}
    >
      <p style={{ margin: "0 0 8px", fontSize: 12, color: C.muted }}>{title}</p>
      <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: C.text }}>{value}</p>
      {subtitle && <p style={{ margin: "8px 0 0", fontSize: 12, color: C.muted }}>{subtitle}</p>}
    </div>
  );
}

function DashboardPage({
  token,
  onSessionExpired,
  onTokenRefresh,
}: {
  token: string;
  onSessionExpired: () => void;
  onTokenRefresh: (t: string) => void;
}) {
  const [docCount, setDocCount] = useState<number>(0);
  const [actionCount, setActionCount] = useState<number>(0);
  const [executedCount, setExecutedCount] = useState<number>(0);
  const [auditCount, setAuditCount] = useState<number>(0);
  const [systemHealth, setSystemHealth] = useState("unknown");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadMetrics() {
      setError("");
      try {
        const [docsRes, actionsRes, auditRes, healthRes] = await Promise.all([
          fetchWithAuth(`${apiBaseUrl}/documents?page=0&size=1`, {}, onTokenRefresh),
          fetchWithAuth(`${apiBaseUrl}/actions`, {}, onTokenRefresh),
          fetchWithAuth(`${apiBaseUrl}/audit`, {}, onTokenRefresh),
          fetch(`${apiBaseUrl}/health`),
        ]);

        const docs = await parseAuthenticatedJson<DocumentPage>(docsRes, onSessionExpired);
        if (!cancelled) {
          setDocCount(docs.totalElements);
        }

        if (actionsRes.ok) {
          const actions = await parseAuthenticatedJson<AiAction[]>(actionsRes, onSessionExpired);
          if (!cancelled) {
            setActionCount(actions.length);
            setExecutedCount(actions.filter((a) => a.status === "EXECUTED").length);
          }
        }

        if (auditRes.ok) {
          const audits = await parseAuthenticatedJson<unknown[]>(auditRes, onSessionExpired);
          if (!cancelled) {
            setAuditCount(audits.length);
          }
        } else if (!cancelled) {
          setAuditCount(0);
        }

        if (!cancelled) {
          setSystemHealth(healthRes.ok ? "ok" : "degraded");
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? mapApiErrorToMessage(e.message) : "Не удалось загрузить метрики");
          setSystemHealth("degraded");
        }
      }
    }

    void loadMetrics();
    return () => {
      cancelled = true;
    };

  }, [onSessionExpired, onTokenRefresh, token]);

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ margin: "0 0 14px", color: C.text }}>Дашборд</h2>
      {error && <p style={{ color: "crimson", margin: "0 0 12px" }}>{error}</p>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, marginBottom: 10 }}>
        <Card title="Документы" value={String(docCount)} subtitle="Всего документов в системе" />
        <Card title="AI-действия" value={String(actionCount)} subtitle={`Выполнено: ${executedCount}`} />
        <Card title="Аудит-события" value={String(auditCount)} subtitle="Записи журнала аудита (доступные текущей роли)" />
        <Card title="Состояние системы" value={systemHealth === "ok" ? "OK" : "DEGRADED"} subtitle={`API: ${apiBaseUrl}`} />
      </div>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14 }}>
        <p style={{ margin: "0 0 8px", color: C.text, fontSize: 13, fontWeight: 600 }}>Операционный срез</p>
        <p style={{ margin: "0 0 6px", color: C.muted, fontSize: 12 }}>
          Исполнение AI-действий: {actionCount === 0 ? "данные отсутствуют" : `${executedCount} из ${actionCount} в статусе EXECUTED`}.
        </p>
        <p style={{ margin: 0, color: C.muted, fontSize: 12 }}>
          Аудит: {auditCount > 0 ? "журнал доступен и пополняется" : "нет доступных записей или ограничен доступ по роли"}.
        </p>
      </div>
    </div>
  );
}

function RagPage({
  token,
  onSessionExpired,
  onTokenRefresh,
}: {
  token: string;
  onSessionExpired: () => void;
  onTokenRefresh: (t: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnswerWithSourcesResponse | null>(null);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [lastQuestion, setLastQuestion] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  async function runRag() {
    const trimmed = query.trim();
    if (!trimmed) {
      setValidationError("Введите вопрос перед отправкой.");
      return;
    }
    setLoading(true);
    setError("");
    setValidationError("");
    try {
      const res = await fetchWithAuth(
        `${apiBaseUrl}/rag/answer-with-sources`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: trimmed }),
        },
        onTokenRefresh,
      );
      setResult(await parseAuthenticatedJson<AnswerWithSourcesResponse>(res, onSessionExpired));
      setLastQuestion(trimmed);
      setHistory((prev) => [trimmed, ...prev.filter((item) => item !== trimmed)].slice(0, 3));
    } catch (e) {
      setError(e instanceof Error ? mapApiErrorToMessage(e.message) : "Ошибка RAG");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
      <h2 style={{ margin: 0, color: C.text }}>RAG-ассистент</h2>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (validationError && e.target.value.trim()) {
              setValidationError("");
            }
          }}
          placeholder="Задайте вопрос по документам…"
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 8,
            border: `1px solid ${C.border}`,
            background: C.white,
            fontFamily: "inherit",
          }}
        />
        <button
          onClick={() => void runRag()}
          disabled={loading || !query.trim()}
          style={{ ...smallBtn, background: C.orange, color: C.white, border: "none", opacity: loading || !query.trim() ? 0.6 : 1 }}
        >
          {loading ? "..." : "Спросить"}
        </button>
      </div>
      {validationError && <p style={{ color: "crimson", margin: 0 }}>{validationError}</p>}
      {error && <p style={{ color: "crimson", margin: 0 }}>{error}</p>}
      {lastQuestion && (
        <p style={{ margin: 0, color: C.muted, fontSize: 12 }}>
          Последний вопрос: <strong style={{ color: C.text }}>{lastQuestion}</strong>
        </p>
      )}
      {!!history.length && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {history.map((item) => (
            <button
              key={item}
              onClick={() => setQuery(item)}
              style={{ ...smallBtn, padding: "2px 10px", fontSize: 11 }}
            >
              {item}
            </button>
          ))}
        </div>
      )}
      {result && (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14 }}>
          <p style={{ margin: "0 0 10px", color: C.text, lineHeight: 1.6 }}>{result.answer}</p>
          <p style={{ margin: 0, color: C.muted, fontSize: 12 }}>
            Источники: {result.sources.map((s) => s.documentTitle).join(", ") || "—"}
          </p>
        </div>
      )}
    </div>
  );
}

function ActionsPage({
  token,
  onSessionExpired,
  onTokenRefresh,
}: {
  token: string;
  onSessionExpired: () => void;
  onTokenRefresh: (t: string) => void;
}) {
  const [intent, setIntent] = useState("send_email");
  const [action, setAction] = useState<AiAction | null>(null);
  const [error, setError] = useState("");
  const [loadingDraft, setLoadingDraft] = useState(false);
  const navigate = useNavigate();

  async function draft() {
    setError("");
    const normalizedIntent = intent.trim();
    if (!normalizedIntent) {
      setError("Укажите intent для черновика.");
      return;
    }
    setLoadingDraft(true);
    try {
      const res = await fetchWithAuth(
        `${apiBaseUrl}/actions/draft`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ intent: normalizedIntent, entities: {} }),
        },
        onTokenRefresh,
      );
      setAction(await parseAuthenticatedJson<AiAction>(res, onSessionExpired));
    } catch (e) {
      setError(e instanceof Error ? mapApiErrorToMessage(e.message) : "Не удалось создать черновик");
    } finally {
      setLoadingDraft(false);
    }
  }

  const stage = !action ? 1 : action.status === "DRAFT" ? 2 : action.status === "CONFIRMED" ? 3 : 4;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ margin: "0 0 14px", color: C.text }}>AI-действия</h2>
      <p style={{ margin: "0 0 12px", color: C.muted, fontSize: 13 }}>
        Шаг {stage}/4: создание черновика → подтверждение → выполнение.
      </p>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <input
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          placeholder="intent (например, send_email)"
          style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}`, width: 280 }}
        />
        <button
          onClick={() => void draft()}
          disabled={loadingDraft || !intent.trim()}
          style={{ ...smallBtn, background: C.orange, color: C.white, border: "none", opacity: loadingDraft || !intent.trim() ? 0.6 : 1 }}
        >
          {loadingDraft ? "..." : "Создать черновик"}
        </button>
      </div>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {!intent.trim() && <p style={{ margin: "0 0 12px", color: C.muted }}>Заполните intent, чтобы разблокировать создание черновика.</p>}
      {action && (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14 }}>
          <p style={{ margin: "0 0 8px", color: C.text }}>
            Действие: <strong>{action.intent}</strong> ({action.status})
          </p>
          <p style={{ margin: "0 0 8px", color: C.muted, fontSize: 12 }}>
            {action.status === "DRAFT" && "Сначала подтвердите действие, затем станет доступно выполнение."}
            {action.status === "CONFIRMED" && "Действие подтверждено. Теперь можно запускать выполнение."}
            {action.status === "EXECUTED" && "Действие уже выполнено. Можно создать новый черновик."}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => navigate(`/confirmation?actionId=${action.id}`)}
              disabled={action.status !== "DRAFT"}
              style={smallBtn}
            >
              Шаг подтверждения
            </button>
            <button
              onClick={() => navigate(`/execution?actionId=${action.id}`)}
              disabled={action.status === "DRAFT"}
              style={smallBtn}
            >
              Шаг выполнения
            </button>
          </div>
        </div>
      )}
      {!token && <p style={{ color: C.muted }}>Требуется авторизация.</p>}
    </div>
  );
}

function StaticPage({
  title,
  description,
  hint,
  actionLabel,
}: {
  title: string;
  description: string;
  hint?: string;
  actionLabel?: string;
}) {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ margin: "0 0 10px", color: C.text }}>{title}</h2>
      <p style={{ margin: 0, color: C.muted, lineHeight: 1.6 }}>{description}</p>
      <div style={{ marginTop: 14, maxWidth: 560, border: `1px dashed ${C.border}`, borderRadius: 10, padding: 14, background: C.white }}>
        <p style={{ margin: 0, color: C.text, fontSize: 13 }}>
          {hint ?? "Раздел находится в процессе внедрения. Данные появятся после настройки backend-коннекторов."}
        </p>
        {actionLabel && (
          <button style={{ ...smallBtn, marginTop: 10 }}>{actionLabel}</button>
        )}
      </div>
    </div>
  );
}

function SettingsPage({ user }: { user: User }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [emailDigest, setEmailDigest] = useState(true);

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ margin: "0 0 10px", color: C.text }}>Настройки</h2>
      <p style={{ margin: "0 0 14px", color: C.muted }}>
        Пользователь: {user.fullName} ({user.email})
      </p>

      <div
        style={{
          maxWidth: 640,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          background: C.white,
          padding: 14,
          display: "grid",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div>
            <p style={{ margin: 0, color: C.text, fontSize: 14, fontWeight: 600 }}>Тема интерфейса</p>
            <p style={{ margin: "4px 0 0", color: C.muted, fontSize: 12 }}>
              Переключение между светлой и тёмной темой (демо-настройка).
            </p>
          </div>
          <button
            onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
            style={smallBtn}
          >
            {theme === "light" ? "Светлая" : "Тёмная"}
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div>
            <p style={{ margin: 0, color: C.text, fontSize: 14, fontWeight: 600 }}>Email-дайджест</p>
            <p style={{ margin: "4px 0 0", color: C.muted, fontSize: 12 }}>
              Ежедневная сводка по документам и активности.
            </p>
          </div>
          <button onClick={() => setEmailDigest((prev) => !prev)} style={smallBtn}>
            {emailDigest ? "Включен" : "Выключен"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmationPage({
  onSessionExpired,
  onTokenRefresh,
}: {
  onSessionExpired: () => void;
  onTokenRefresh: (t: string) => void;
}) {
  const [search] = useState(() => new URLSearchParams(window.location.search));
  const actionId = search.get("actionId");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function confirm() {
    if (!actionId) return;
    setLoading(true);
    setError("");
    setStatus("");
    try {
      const res = await fetchWithAuth(`${apiBaseUrl}/actions/${actionId}/confirm`, { method: "POST" }, onTokenRefresh);
      const payload = await parseAuthenticatedJson<AiAction>(res, onSessionExpired);
      setStatus(payload.status);
    } catch (e) {
      setError(e instanceof Error ? mapApiErrorToMessage(e.message) : "Не удалось подтвердить действие");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: C.bg }}>
      <div style={{ width: 420, background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
        <h2 style={{ margin: "0 0 8px", color: C.text }}>Подтверждение</h2>
        <p style={{ margin: "0 0 12px", color: C.muted }}>ID действия: {actionId ?? "—"}</p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => void confirm()} disabled={!actionId || loading} style={smallBtn}>
            {loading ? "..." : "Подтвердить действие"}
          </button>
          <button onClick={() => navigate("/actions")} style={smallBtn}>
            Назад
          </button>
        </div>
        {status && <p style={{ margin: "10px 0 0", color: C.green }}>Статус: {status}</p>}
        {error && <p style={{ margin: "10px 0 0", color: "crimson" }}>{error}</p>}
      </div>
    </div>
  );
}

function ExecutionResultPage({
  onSessionExpired,
  onTokenRefresh,
}: {
  onSessionExpired: () => void;
  onTokenRefresh: (t: string) => void;
}) {
  const [search] = useState(() => new URLSearchParams(window.location.search));
  const actionId = search.get("actionId");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function execute() {
    if (!actionId) return;
    setLoading(true);
    setError("");
    setStatus("");
    try {
      const res = await fetchWithAuth(`${apiBaseUrl}/actions/${actionId}/execute`, { method: "POST" }, onTokenRefresh);
      const payload = await parseAuthenticatedJson<AiAction>(res, onSessionExpired);
      setStatus(payload.status);
    } catch (e) {
      setError(e instanceof Error ? mapApiErrorToMessage(e.message) : "Не удалось выполнить действие");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: C.bg }}>
      <div style={{ width: 420, background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
        <h2 style={{ margin: "0 0 8px", color: C.text }}>Результат выполнения</h2>
        <p style={{ margin: "0 0 12px", color: C.muted }}>ID действия: {actionId ?? "—"}</p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => void execute()} disabled={!actionId || loading} style={smallBtn}>
            {loading ? "..." : "Выполнить действие"}
          </button>
          <button onClick={() => navigate("/actions")} style={smallBtn}>
            Назад
          </button>
        </div>
        {status && <p style={{ margin: "10px 0 0", color: C.green }}>Статус: {status}</p>}
        {error && <p style={{ margin: "10px 0 0", color: "crimson" }}>{error}</p>}
      </div>
    </div>
  );
}

// ─── WorkspacePage ────────────────────────────────────────────────────────────

function WorkspacePage({
  user,
  token,
  onSessionExpired,
  onTokenRefresh,
}: {
  user: User;
  token: string;
  onSessionExpired: () => void;
  onTokenRefresh: (t: string) => void;
}) {
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [docCount, setDocCount] = useState(0);
  const [uploadTrigger, setUploadTrigger] = useState(0);
  const [sidebarWidth, setSidebarWidth] = useState(220);
  const [aiPanelWidth, setAiPanelWidth] = useState(288);
  const [isNarrow, setIsNarrow] = useState(() => window.innerWidth < 980);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const section = location.pathname.split("/")[1] || "dashboard";

  useEffect(() => {
    const onResize = () => setIsNarrow(window.innerWidth < 980);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!isNarrow) {
      setMobileSidebarOpen(false);
    }
  }, [isNarrow]);

  useEffect(() => {
    if (isNarrow) return;

    let dragMode: "sidebar" | "ai" | null = null;

    const onMouseMove = (event: MouseEvent) => {
      if (!dragMode) return;
      if (dragMode === "sidebar") {
        const nextWidth = Math.min(Math.max(event.clientX, 180), 420);
        setSidebarWidth(nextWidth);
        return;
      }
      const nextWidth = Math.min(Math.max(window.innerWidth - event.clientX, 240), 560);
      setAiPanelWidth(nextWidth);
    };

    const onMouseUp = () => {
      dragMode = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    const onStartResize = (evt: Event) => {
      const customEvent = evt as CustomEvent<"sidebar" | "ai">;
      dragMode = customEvent.detail;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("dmis:resize:start", onStartResize as EventListener);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("dmis:resize:start", onStartResize as EventListener);
    };
  }, [isNarrow]);

  useEffect(() => {
    if (!token) return;
    fetchWithAuth(`${apiBaseUrl}/documents?page=0&size=1`, {}, onTokenRefresh)
      .then((res) => parseAuthenticatedJson<DocumentPage>(res, onSessionExpired))
      .then((p) => setDocCount(p.totalElements))
      .catch(() => {});
  }, [token, onSessionExpired, onTokenRefresh]);

  function handleSection(s: string) {
    const map: Record<string, string> = {
      dashboard: "/dashboard",
      documents: "/documents",
      mail: "/mail",
      calendar: "/calendar",
      audit: "/audit",
      settings: "/settings",
      acl: "/settings",
    };
    navigate(map[s] ?? "/dashboard");
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        fontFamily: "'Inter', system-ui, sans-serif",
        background: C.bg,
        color: C.text,
      }}
    >
      <Sidebar
        user={user}
        docCount={docCount}
        width={isNarrow ? 220 : sidebarWidth}
        query={query}
        onQueryChange={setQuery}
        onQuerySubmit={() => {}}
        onNewDoc={() => setUploadTrigger((n) => n + 1)}
        section={section}
        onSection={handleSection}
        onLogout={onSessionExpired}
        mobile={isNarrow}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />
      {isNarrow && mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.2)",
            zIndex: 25,
          }}
        />
      )}
      {isNarrow && !mobileSidebarOpen && (
        <button
          onClick={() => setMobileSidebarOpen(true)}
          style={{
            position: "fixed",
            top: 10,
            left: 10,
            zIndex: 20,
            ...smallBtn,
            background: C.white,
          }}
        >
          Меню
        </button>
      )}

      {/* Center column */}
      {!isNarrow && (
        <div
          onMouseDown={() => window.dispatchEvent(new CustomEvent("dmis:resize:start", { detail: "sidebar" }))}
          style={{
            width: 6,
            cursor: "col-resize",
            background: "transparent",
            borderRight: `1px solid ${C.border}`,
            borderLeft: `1px solid ${C.border}`,
            flexShrink: 0,
          }}
          title="Изменить ширину левой панели"
        />
      )}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", marginLeft: isNarrow ? 0 : undefined }}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <DashboardPage
                token={token}
                onSessionExpired={onSessionExpired}
                onTokenRefresh={onTokenRefresh}
              />
            }
          />
          <Route
            path="/documents"
            element={
              <DocTable
                token={token}
                user={user}
                onSessionExpired={onSessionExpired}
                onTokenRefresh={onTokenRefresh}
                section="documents"
                uploadTrigger={uploadTrigger}
                onQueryChange={setQuery}
              />
            }
          />
          <Route
            path="/mail"
            element={
              <StaticPage
                title="Почта"
                description="Почтовый модуль находится в активной разработке."
                hint="Здесь будет полноценный интерфейс писем, черновиков и папок."
                actionLabel="Открыть входящие"
              />
            }
          />
          <Route
            path="/calendar"
            element={
              <StaticPage
                title="Календарь"
                description="Календарный модуль находится в активной разработке."
                hint="Здесь будет полноценный интерфейс встреч, расписания и занятости."
                actionLabel="Открыть календарь"
              />
            }
          />
          <Route
            path="/audit"
            element={
              isAdmin(user) ? (
                <StaticPage
                  title="Журнал аудита"
                  description="Аудит действий и операций доступен в backend."
                  hint="После включения потока аудита в backend здесь появится лента операций и фильтры."
                  actionLabel="Запросить выгрузку аудита"
                />
              ) : (
                <Navigate to="/settings" replace />
              )
            }
          />
          <Route
            path="/settings"
            element={<SettingsPage user={user} />}
          />
          <Route
            path="/documents/:documentId"
            element={
              <DocumentCardPage
                token={token}
                onSessionExpired={onSessionExpired}
                onTokenRefresh={onTokenRefresh}
              />
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
      {!isNarrow && (
        <div
          onMouseDown={() => window.dispatchEvent(new CustomEvent("dmis:resize:start", { detail: "ai" }))}
          style={{
            width: 6,
            cursor: "col-resize",
            background: "transparent",
            borderRight: `1px solid ${C.border}`,
            borderLeft: `1px solid ${C.border}`,
            flexShrink: 0,
          }}
          title="Изменить ширину AI-панели"
        />
      )}
      <AiPanel
        token={token}
        width={isNarrow ? 288 : aiPanelWidth}
        query={query}
        onQueryChange={setQuery}
        onSessionExpired={onSessionExpired}
        onTokenRefresh={onTokenRefresh}
      />
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export function App() {
  const [token, setToken] = useState<string>(() => getToken());
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (import.meta.env.DEV) {
      // Диагностика конфигурации API в dev-режиме.
      console.info("[DMIS] API base URL:", apiBaseUrl);
    }
  }, []);

  const handleLogin = useCallback((t: string, rt: string, u: User) => {
    setTokens(t, rt);
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

  // Restore user on page reload when token exists
  useEffect(() => {
    if (!token || user) return;
    fetchWithAuth(`${apiBaseUrl}/auth/me`, {}, handleTokenRefresh)
      .then((res) => parseAuthenticatedJson<User>(res, handleSessionExpired))
      .then((u) => setUser(u))
      .catch(() => handleSessionExpired());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!token || !user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Routes>
      <Route
        path="/confirmation"
        element={
          <ConfirmationPage
            onSessionExpired={handleSessionExpired}
            onTokenRefresh={handleTokenRefresh}
          />
        }
      />
      <Route
        path="/execution"
        element={
          <ExecutionResultPage
            onSessionExpired={handleSessionExpired}
            onTokenRefresh={handleTokenRefresh}
          />
        }
      />
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
  );
}
