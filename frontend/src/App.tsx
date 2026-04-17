import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";

type User = { id: string; fullName: string; email: string };
type DocumentItem = { id: string; title: string };
type DocumentVersion = {
  versionId: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  storageRef: string;
  createdAt: string;
};
type DocumentDetail = {
  id: string;
  title: string;
  ownerId: string;
  versions: DocumentVersion[];
  storageRef: string;
  extractedText: string;
};
type SearchHit = { documentId: string; title: string; score: number };
type AiAction = { id: string; intent: string; status: "DRAFT" | "CONFIRMED" | "EXECUTED" };

const apiUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8090/api";

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
  const navigate = useNavigate();

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
      <nav style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <Link to="/">Home</Link>
        <Link to="/documents">Documents</Link>
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
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
          }
        />
        <Route
          path="/documents"
          element={
            <DocumentsPage
              token={token}
              documents={documents}
              uploadFile={uploadFile}
              setUploadFile={setUploadFile}
              onUpload={uploadDocument}
              onRefresh={loadDocuments}
              onOpenCard={(id) => navigate(`/documents/${id}`)}
            />
          }
        />
        <Route
          path="/documents/:documentId"
          element={<DocumentCardPage token={token} authHeaders={authHeaders} setStatus={setStatus} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
}

type DocumentsPageProps = {
  token: string;
  documents: DocumentItem[];
  uploadFile: File | null;
  setUploadFile: (file: File | null) => void;
  onUpload: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onOpenCard: (id: string) => void;
};

function DocumentsPage({
  token,
  documents,
  uploadFile,
  setUploadFile,
  onUpload,
  onRefresh,
  onOpenCard
}: DocumentsPageProps) {
  return (
    <article style={{ border: "1px solid #ddd", padding: 12 }}>
      <h2>Documents</h2>
      <input type="file" onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)} />
      <button onClick={onUpload} disabled={!token || !uploadFile}>
        Upload
      </button>
      <button onClick={onRefresh} disabled={!token}>
        Refresh
      </button>
      <ul>
        {documents.map((doc) => (
          <li key={doc.id}>
            <button onClick={() => onOpenCard(doc.id)}>{doc.title}</button>
          </li>
        ))}
      </ul>
    </article>
  );
}

type DocumentCardPageProps = {
  token: string;
  authHeaders: { "Content-Type": string; Authorization: string };
  setStatus: (status: string) => void;
};

function DocumentCardPage({ token, authHeaders, setStatus }: DocumentCardPageProps) {
  const { documentId } = useParams();
  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [versionFile, setVersionFile] = useState<File | null>(null);

  async function asJson(response: Response) {
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error ?? "Request failed");
    }
    return payload;
  }

  async function loadCard() {
    if (!documentId || !token) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/documents/${documentId}`, { headers: authHeaders });
      const payload = await asJson(response);
      setDocument(payload);
      setStatus(`Loaded card for ${payload.title}.`);
    } catch (error) {
      setStatus(String(error));
    } finally {
      setLoading(false);
    }
  }

  async function addVersion() {
    if (!documentId || !token || !versionFile) {
      return;
    }
    const form = new FormData();
    form.append("file", versionFile);
    try {
      const response = await fetch(`${apiUrl}/documents/${documentId}/versions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });
      const payload = await asJson(response);
      setDocument(payload);
      setVersionFile(null);
      setStatus("Version uploaded.");
    } catch (error) {
      setStatus(String(error));
    }
  }

  useEffect(() => {
    void loadCard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId, token]);

  if (!token) {
    return <p>Please login first.</p>;
  }
  if (!documentId) {
    return <p>Document id is missing.</p>;
  }
  if (loading && !document) {
    return <p>Loading...</p>;
  }
  if (!document) {
    return (
      <section>
        <p>Document not loaded.</p>
        <button onClick={loadCard}>Retry</button>
      </section>
    );
  }

  return (
    <section style={{ border: "1px solid #ddd", padding: 12 }}>
      <h2>{document.title}</h2>
      <p>
        <b>Document ID:</b> {document.id}
      </p>
      <p>
        <b>Owner:</b> {document.ownerId}
      </p>
      <p>
        <b>Current storage:</b> {document.storageRef}
      </p>
      <h3>Versions</h3>
      <ul>
        {document.versions.map((version) => (
          <li key={version.versionId}>
            {version.versionId} - {version.fileName} ({version.contentType}, {version.sizeBytes} bytes)
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 12 }}>
        <input type="file" onChange={(e) => setVersionFile(e.target.files?.[0] ?? null)} />
        <button onClick={addVersion} disabled={!versionFile}>
          Add version
        </button>
      </div>
    </section>
  );
}
