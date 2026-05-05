import { type CSSProperties, type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import {
  apiBaseUrl,
  clearTokens,
  fetchWithAuth,
  getToken,
  parseAuthenticatedJson,
  parsePublicJson,
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
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "yesterday";
  if (d < 7) return `${d}d`;
  return `${Math.floor(d / 7)}w ago`;
}

function docIcon(doc: DocumentView): string {
  const t = doc.title.toLowerCase();
  if (t.includes("transcript") || doc.type?.toLowerCase() === "transcript") return "🎤";
  if (doc.tags?.includes("restricted")) return "🔒";
  return "📄";
}

function docAcl(doc: DocumentView): string {
  if (doc.tags?.includes("public")) return "public";
  if (doc.tags?.includes("restricted")) return "restricted";
  return "team";
}

function sectionTitle(s: string): string {
  const map: Record<string, string> = {
    all_docs: "Recent",
    recent: "Recent",
    pinned: "Pinned",
    shared: "Shared with me",
    contracts: "Contracts",
    memos: "Memos",
    reports: "Reports",
    transcripts: "Transcripts",
    audit: "Audit log",
    acl: "ACL",
  };
  return map[s] ?? s;
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
      {s}
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

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const p = await parsePublicJson<{ token: string; refreshToken: string; user: User }>(res);
      onLogin(p.token, p.refreshToken, p.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
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
          Document Management &amp; Intelligence System
        </p>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            autoComplete="username"
            style={field}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            autoComplete="current-password"
            style={field}
          />
          {error && <p style={{ color: "crimson", fontSize: 13, margin: 0 }}>{error}</p>}
          <button
            type="submit"
            disabled={!email || !password}
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
            Sign in
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
  query: string;
  onQueryChange: (q: string) => void;
  onQuerySubmit: () => void;
  onNewDoc: () => void;
  section: string;
  onSection: (s: string) => void;
  onLogout: () => void;
};

function Sidebar({
  user,
  docCount,
  query,
  onQueryChange,
  onQuerySubmit,
  onNewDoc,
  section,
  onSection,
  onLogout,
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
        onClick={() => onSection(k)}
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
        width: 220,
        height: "100vh",
        background: C.sidebar,
        borderRight: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        padding: "14px 10px",
        gap: 2,
        flexShrink: 0,
        overflowY: "auto",
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
          <button
            onClick={onLogout}
            title="Sign out"
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
          placeholder="ask, search, or ⌘K…"
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
        + New
      </button>

      <SectionLabel>library</SectionLabel>
      <NavItem label="All docs" count={docCount} k="all_docs" icon="📄" />
      <NavItem label="Recent" k="recent" icon="🕐" />
      <NavItem label="Pinned" k="pinned" icon="★" />
      <NavItem label="Shared with me" k="shared" icon="👤" />

      <SectionLabel>spaces</SectionLabel>
      <NavItem label="Contracts" k="contracts" icon="📁" />
      <NavItem label="Memos" k="memos" icon="📁" />
      <NavItem label="Reports" k="reports" icon="📁" />
      <NavItem label="Transcripts" k="transcripts" icon="🎤" />

      <SectionLabel>control</SectionLabel>
      <NavItem label="Audit log" k="audit" icon="○" />
      {isAdmin(user) && <NavItem label="ACL" k="acl" icon="🔒" />}
    </aside>
  );
}

// ─── AiPanel ──────────────────────────────────────────────────────────────────

const SUGGESTIONS = [
  "summarize 3 newest contracts",
  'find docs mentioning "Acme renewal"',
];

type AiPanelProps = {
  token: string;
  query: string;
  onQueryChange: (q: string) => void;
  onSessionExpired: () => void;
  onTokenRefresh: (t: string) => void;
};

function AiPanel({ token, query, onQueryChange, onSessionExpired, onTokenRefresh }: AiPanelProps) {
  const [panelQuery, setPanelQuery] = useState("");
  const [ragResult, setRagResult] = useState<AnswerWithSourcesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<AiAction | null>(null);
  const [actionError, setActionError] = useState("");
  const [actionIntent, setActionIntent] = useState("send_email");
  const [actionOpen, setActionOpen] = useState(false);

  async function runRag(q: string) {
    if (!q.trim() || !token) return;
    setLoading(true);
    setRagResult(null);
    try {
      const res = await fetchWithAuth(
        `${apiBaseUrl}/rag/answer-with-sources`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q }),
        },
        onTokenRefresh,
      );
      setRagResult(await parseAuthenticatedJson<AnswerWithSourcesResponse>(res, onSessionExpired));
    } finally {
      setLoading(false);
    }
  }

  async function draftAction() {
    setActionError("");
    try {
      const res = await fetchWithAuth(
        `${apiBaseUrl}/actions/draft`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ intent: actionIntent, entities: {} }),
        },
        onTokenRefresh,
      );
      setAction(await parseAuthenticatedJson<AiAction>(res, onSessionExpired));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed");
    }
  }

  async function confirmAction() {
    if (!action) return;
    const res = await fetchWithAuth(
      `${apiBaseUrl}/actions/${action.id}/confirm`,
      { method: "POST" },
      onTokenRefresh,
    );
    setAction(await parseAuthenticatedJson<AiAction>(res, onSessionExpired));
  }

  async function executeAction() {
    if (!action) return;
    const res = await fetchWithAuth(
      `${apiBaseUrl}/actions/${action.id}/execute`,
      { method: "POST" },
      onTokenRefresh,
    );
    setAction(await parseAuthenticatedJson<AiAction>(res, onSessionExpired));
  }

  const effective = panelQuery || query;

  return (
    <aside
      style={{
        width: 288,
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
          <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>assistant</span>
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
            grounded
          </span>
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
          suggested
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setPanelQuery(s);
                onQueryChange(s);
                void runRag(s);
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

      {/* RAG results */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px" }}>
        {loading && (
          <p style={{ color: C.muted, fontSize: 13 }}>Thinking…</p>
        )}
        {ragResult && (
          <div>
            <p style={{ fontSize: 13, color: C.text, lineHeight: 1.6, margin: "0 0 8px" }}>
              {ragResult.answer}
            </p>
            {ragResult.sources.length > 0 && (
              <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>
                Sources:{" "}
                {ragResult.sources
                  .slice(0, 3)
                  .map((s) => s.documentTitle)
                  .join(", ")}
              </p>
            )}
          </div>
        )}

        {/* Action flow */}
        <div style={{ marginTop: 12 }}>
          <button
            onClick={() => setActionOpen((v) => !v)}
            style={{
              ...smallBtn,
              fontSize: 11,
              color: C.muted,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {actionOpen ? "▾" : "▸"} AI Action
          </button>

          {actionOpen && (
            <div
              style={{
                marginTop: 8,
                padding: 10,
                background: C.white,
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {!action ? (
                <>
                  <input
                    value={actionIntent}
                    onChange={(e) => setActionIntent(e.target.value)}
                    placeholder="intent (e.g. send_email)"
                    style={{
                      padding: "6px 8px",
                      borderRadius: 6,
                      border: `1px solid ${C.border}`,
                      fontSize: 12,
                      fontFamily: "inherit",
                      background: C.bg,
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={() => void draftAction()}
                    style={{ ...smallBtn, background: C.orange, color: C.white, border: "none" }}
                  >
                    Draft action
                  </button>
                </>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>
                      {action.intent}
                    </span>
                    <StatusBadge status={action.status} />
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {action.status === "DRAFT" && (
                      <button
                        onClick={() => void confirmAction()}
                        style={{ ...smallBtn }}
                      >
                        Confirm
                      </button>
                    )}
                    {action.status === "CONFIRMED" && (
                      <button
                        onClick={() => void executeAction()}
                        style={{
                          ...smallBtn,
                          background: C.green,
                          color: C.white,
                          border: "none",
                        }}
                      >
                        Execute
                      </button>
                    )}
                    {action.status === "EXECUTED" && (
                      <span style={{ fontSize: 12, color: C.green }}>✓ Executed</span>
                    )}
                    <button
                      onClick={() => setAction(null)}
                      style={{ ...smallBtn, color: C.muted }}
                    >
                      Reset
                    </button>
                  </div>
                </>
              )}
              {actionError && (
                <p style={{ color: "crimson", fontSize: 12, margin: 0 }}>{actionError}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <input
            value={effective}
            onChange={(e) => {
              setPanelQuery(e.target.value);
              onQueryChange(e.target.value);
            }}
            onKeyDown={(e) => e.key === "Enter" && void runRag(effective)}
            placeholder="ask about your docs…"
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
            onClick={() => void runRag(effective)}
            disabled={!effective.trim() || loading || !token}
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
          RAG · embeddings :8001 · ai :8002
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
          setError(e instanceof Error ? e.message : "STT error");
        }
      };
      mr.start();
      mrRef.current = mr;
      setRecording(true);
    } catch {
      setError("Mic access denied");
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
        🎤 {recording ? "stop" : "dictate"}
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
        if (e instanceof Error && e.message !== "Unauthorized") setError(e.message);
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
      setError(e instanceof Error ? e.message : "Upload failed");
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
          <TopBarBtn>filter</TopBarBtn>
          <TopBarBtn>sort</TopBarBtn>
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
          {["name", "owner / ACL", "updated", "status", ""].map((h) => (
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
          <p style={{ color: C.muted, fontSize: 13, padding: "16px 0" }}>Loading…</p>
        )}
        {!loading && !docs.length && (
          <p style={{ color: C.muted, fontSize: 13, padding: "16px 0" }}>No documents found.</p>
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
              ← Prev
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
              Next →
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

  const authH = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  async function loadCard() {
    if (!documentId || !token) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/documents/${documentId}`, { headers: authH });
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
    const res = await fetch(`${apiBaseUrl}/documents/${documentId}/versions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const payload = await parseAuthenticatedJson<DocumentView>(res, onSessionExpired);
    setDoc(payload);
    setTagInput(payload.tags.join(", "));
    setVersionFile(null);
    setMsg("Version uploaded.");
  }

  async function saveTags() {
    if (!documentId || !token) return;
    const tags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const res = await fetch(`${apiBaseUrl}/documents/${documentId}`, {
      method: "PATCH",
      headers: authH,
      body: JSON.stringify({ tags }),
    });
    const payload = await parseAuthenticatedJson<DocumentView>(res, onSessionExpired);
    setDoc(payload);
    setTagInput(payload.tags.join(", "));
    setMsg("Tags updated.");
  }

  async function loadFullText() {
    if (!documentId || !token) return;
    setFullTextLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/documents/${documentId}/extracted-text`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  if (loading && !doc) return <p style={{ padding: 24, color: C.muted }}>Loading…</p>;
  if (!doc)
    return (
      <div style={{ padding: 24 }}>
        <p style={{ color: C.muted }}>Document not loaded.</p>
        <button style={smallBtn} onClick={() => void loadCard()}>
          Retry
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
          <MetaCard label="Owner" value={doc.ownerId} />
          <MetaCard label="Type" value={doc.type || "—"} />
          <MetaCard label="Storage" value={doc.storageRef || "—"} />
        </div>

        {/* Tags */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="tags, comma-separated"
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
            Save tags
          </button>
        </div>

        {/* Preview */}
        <Section label="Preview">
          <DocumentPreview token={token} documentId={doc.id} contentType={ct} />
        </Section>

        {/* Extracted text */}
        <Section
          label={`Extracted text (${doc.extractedTextLength} chars${doc.extractedTextTruncated ? ", truncated" : ""})`}
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
            {fullTextLoading ? "Loading…" : "Load full text"}
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
        <Section label="Versions">
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
                {v.latest && <span style={{ color: C.green, fontSize: 11 }}>● latest</span>}
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
              Add version
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
  token,
  documentId,
  contentType,
}: {
  token: string;
  documentId: string;
  contentType: string;
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
        const res = await fetch(
          `${apiBaseUrl}/documents/${documentId}/binary?disposition=inline`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (res.status === 401 || res.status === 403) {
          setError("Unauthorized");
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
  }, [token, documentId, contentType]);

  if (!contentType) return <p style={{ color: C.muted, fontSize: 13 }}>No version metadata.</p>;
  if (!contentType.includes("pdf") && !contentType.includes("text/plain"))
    return (
      <p style={{ color: C.muted, fontSize: 13 }}>
        Preview available for PDF and plain text. This file is {contentType}.
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
        title="Document preview"
        src={blobUrl}
        style={{ width: "100%", height: 420, border: `1px solid ${C.border}`, borderRadius: 8 }}
      />
    );
  return <p style={{ color: C.muted, fontSize: 13 }}>Loading preview…</p>;
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
  const [section, setSection] = useState("all_docs");
  const [query, setQuery] = useState("");
  const [docCount, setDocCount] = useState(0);
  const [uploadTrigger, setUploadTrigger] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    fetchWithAuth(`${apiBaseUrl}/documents?page=0&size=1`, {}, onTokenRefresh)
      .then((res) => parseAuthenticatedJson<DocumentPage>(res, onSessionExpired))
      .then((p) => setDocCount(p.totalElements))
      .catch(() => {});
  }, [token, onSessionExpired, onTokenRefresh]);

  function handleSection(s: string) {
    setSection(s);
    navigate("/");
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
        query={query}
        onQueryChange={setQuery}
        onQuerySubmit={() => {}}
        onNewDoc={() => setUploadTrigger((n) => n + 1)}
        section={section}
        onSection={handleSection}
        onLogout={onSessionExpired}
      />

      {/* Center column */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Routes>
          <Route
            path="/"
            element={
              <DocTable
                token={token}
                user={user}
                onSessionExpired={onSessionExpired}
                onTokenRefresh={onTokenRefresh}
                section={section}
                uploadTrigger={uploadTrigger}
                onQueryChange={setQuery}
              />
            }
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <AiPanel
        token={token}
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
    <WorkspacePage
      user={user}
      token={token}
      onSessionExpired={handleSessionExpired}
      onTokenRefresh={handleTokenRefresh}
    />
  );
}
