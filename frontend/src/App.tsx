import { FormEvent, useMemo, useState } from "react";

type User = { id: string; fullName: string; email: string };
type DocumentItem = { id: string; title: string };
type SearchHit = { documentId: string; title: string; score: number };
type AiAction = { id: string; intent: string; status: "DRAFT" | "CONFIRMED" | "EXECUTED" };

const apiUrl = "http://localhost:8090/api";

export function App() {
  const [token, setToken] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [query, setQuery] = useState("");
  const [searchHits, setSearchHits] = useState<SearchHit[]>([]);
  const [ragAnswer, setRagAnswer] = useState("");
  const [intent, setIntent] = useState("send_mail");
  const [action, setAction] = useState<AiAction | null>(null);
  const [status, setStatus] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const authHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }),
    [token]
  );

  async function asJson(response: Response) {
    const payload = await response.json();
    if (response.status === 401 || response.status === 403) {
      setToken("");
      setUser(null);
      setStatus("Session expired. Please login again.");
      throw new Error("Unauthorized");
    }
    if (!response.ok) {
      throw new Error(payload.error ?? "Request failed");
    }
    return payload;
  }

  async function login(e: FormEvent) {
    e.preventDefault();
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@dmis.local", password: "demo" })
    });
    const payload = await asJson(response);
    setToken(payload.token);
    setUser(payload.user);
    setStatus("Logged in as admin.");
  }

  async function loadDocuments() {
    const response = await fetch(`${apiUrl}/documents`, { headers: authHeaders });
    const payload = await asJson(response);
    setDocuments(payload);
    setStatus(`Loaded ${payload.length} documents.`);
  }

  async function uploadDocument() {
    if (!uploadFile) return;
    const form = new FormData();
    form.append("file", uploadFile);
    const response = await fetch(`${apiUrl}/documents`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form
    });
    await asJson(response);
    setUploadFile(null);
    await loadDocuments();
    setStatus("Document uploaded.");
  }

  async function runSearch() {
    const response = await fetch(`${apiUrl}/search`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ query })
    });
    const payload = await asJson(response);
    setSearchHits(payload.hits ?? []);
  }

  async function runRag() {
    const response = await fetch(`${apiUrl}/rag/answer`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ question: query })
    });
    const payload = await asJson(response);
    setRagAnswer(payload.answer ?? "");
  }

  async function draftAction() {
    const response = await fetch(`${apiUrl}/actions/draft`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        intent,
        entities: { target: "demo@example.com", subject: "MVP draft" }
      })
    });
    const payload = await asJson(response);
    setAction(payload);
  }

  async function confirmAction() {
    if (!action) return;
    const response = await fetch(`${apiUrl}/actions/${action.id}/confirm`, {
      method: "POST",
      headers: authHeaders
    });
    setAction(await asJson(response));
  }

  async function executeAction() {
    if (!action) return;
    const response = await fetch(`${apiUrl}/actions/${action.id}/execute`, {
      method: "POST",
      headers: authHeaders
    });
    setAction(await asJson(response));
  }

  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      <h1>DMIS MVP Workspace</h1>
      {!token ? (
        <form onSubmit={login}>
          <button type="submit">Login as demo admin</button>
        </form>
      ) : (
        <p>
          Signed in: <b>{user?.fullName}</b> ({user?.email})
        </p>
      )}
      <p>{status}</p>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        <article style={{ border: "1px solid #ddd", padding: 12 }}>
          <h2>Documents</h2>
          <input type="file" onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)} />
          <button onClick={uploadDocument} disabled={!token || !uploadFile}>
            Upload
          </button>
          <button onClick={loadDocuments} disabled={!token}>
            Refresh
          </button>
          <ul>
            {documents.map((doc) => (
              <li key={doc.id}>{doc.title}</li>
            ))}
          </ul>
        </article>

        <article style={{ border: "1px solid #ddd", padding: 12 }}>
          <h2>Search + RAG</h2>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter query"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={runSearch} disabled={!token || !query}>
              Search
            </button>
            <button onClick={runRag} disabled={!token || !query}>
              RAG answer
            </button>
          </div>
          <ul>
            {searchHits.map((hit) => (
              <li key={hit.documentId}>
                {hit.title} ({hit.score.toFixed(2)})
              </li>
            ))}
          </ul>
          <p>{ragAnswer}</p>
        </article>

        <article style={{ border: "1px solid #ddd", padding: 12 }}>
          <h2>AI Controlled Action</h2>
          <input
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            placeholder="Action intent"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={draftAction} disabled={!token}>
              Draft
            </button>
            <button onClick={confirmAction} disabled={!action || action.status !== "DRAFT"}>
              Confirm
            </button>
            <button onClick={executeAction} disabled={!action || action.status !== "CONFIRMED"}>
              Execute
            </button>
          </div>
          <p>Current action: {action ? `${action.id} (${action.status})` : "none"}</p>
        </article>
      </section>
    </main>
  );
}
