import express from "express";

const app = express();
app.use(express.raw({ type: "*/*", limit: "25mb" }));

const backendBase = process.env.BACKEND_BASE_URL ?? "http://localhost:8080/api";

async function backend(path, req, options = {}) {
  const headers = {
    ...(options.headers ?? {})
  };
  if (req.headers.authorization) {
    headers.authorization = req.headers.authorization;
  }
  if (req.headers["content-type"]) {
    headers["content-type"] = req.headers["content-type"];
  }
  const response = await fetch(`${backendBase}${path}`, {
    ...options,
    headers
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Backend call failed: ${response.status} ${text}`);
  }
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return { ok: true };
}

function parseJsonBody(req) {
  if (!req.body || req.body.length === 0) {
    return {};
  }
  try {
    return JSON.parse(req.body.toString("utf-8"));
  } catch {
    return {};
  }
}

app.get("/resources/health", (_req, res) => {
  res.json({ status: "ok", module: "mcp-facade" });
});

app.post("/tools/search_documents", async (req, res) => {
  try {
    const body = parseJsonBody(req);
    const data = await backend("/search", req, {
      method: "POST",
      body: JSON.stringify({ query: body.query ?? "" }),
      headers: { "content-type": "application/json" }
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post("/tools/get_document_card", async (req, res) => {
  try {
    const body = parseJsonBody(req);
    const data = await backend(`/documents/${body.documentId}`, req, { method: "GET" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post("/tools/draft_action", async (req, res) => {
  try {
    const body = parseJsonBody(req);
    const data = await backend("/actions/draft", req, {
      method: "POST",
      body: JSON.stringify({
        intent: body.intent ?? "",
        entities: body.entities ?? {}
      }),
      headers: { "content-type": "application/json" }
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post("/tools/confirm_action", async (req, res) => {
  try {
    const body = parseJsonBody(req);
    const data = await backend(`/actions/${body.actionId}/confirm`, req, { method: "POST" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.all("/api/*path", async (req, res) => {
  try {
    const path = "/" + req.params.path;
    const hasBody = !["GET", "HEAD"].includes(req.method);
    const data = await backend(path, req, {
      method: req.method,
      body: hasBody ? req.body : undefined
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

const port = Number(process.env.PORT ?? 8090);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`DMIS MCP facade listening on :${port}`);
});
