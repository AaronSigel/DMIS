import { http, HttpResponse } from "msw";

const usersByEmail = {
  "admin@dmis.local": {
    id: "u-admin",
    fullName: "System Admin",
    email: "admin@dmis.local",
    roles: ["ADMIN"],
  },
  "user@dmis.local": {
    id: "u-user",
    fullName: "Demo User",
    email: "user@dmis.local",
    roles: ["USER"],
  },
} as const;

const defaultDocument = {
  id: "doc-1",
  title: "Policy Doc",
  ownerId: "u-admin",
  description: "",
  tags: [],
  source: "upload",
  category: "general",
  status: "INDEXED",
  type: "text/plain",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  totalSizeBytes: 128,
  fileName: "policy.txt",
  contentType: "text/plain",
  storageRef: "minio://bucket/path",
  indexedChunkCount: 1,
  indexedAt: "2026-01-01T00:00:00Z",
  extractedTextPreview: "test content",
  extractedTextLength: 12,
  extractedTextTruncated: false,
} as const;

function buildUserByEmail(email: string) {
  return usersByEmail[email as keyof typeof usersByEmail] ?? usersByEmail["admin@dmis.local"];
}

function buildDocumentPage(page: number, size: number) {
  if (size === 1 || size === 20) {
    return {
      content: [defaultDocument],
      totalElements: 1,
      totalPages: 1,
      page,
      size,
    };
  }
  return {
    content: [],
    totalElements: 0,
    totalPages: 1,
    page,
    size,
  };
}

export const handlers = [
  http.get("*/health", () => HttpResponse.text("ok")),

  http.post("*/auth/login", async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { email?: string };
    const user = buildUserByEmail(body.email ?? "admin@dmis.local");
    return HttpResponse.json({
      token: "token-1",
      user,
    });
  }),

  http.post("*/auth/refresh", () =>
    HttpResponse.json({
      token: "token-1",
    }),
  ),

  http.get("*/assistant/threads", () => HttpResponse.json([])),
  http.get("*/actions", () => HttpResponse.json([])),
  http.get("*/audit", () => HttpResponse.json([])),

  http.get("*/documents", ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? "0");
    const size = Number(url.searchParams.get("size") ?? "20");
    return HttpResponse.json(buildDocumentPage(page, size));
  }),

  http.get("*/documents/:documentId/extracted-text", () => HttpResponse.text("policy content")),
  http.get(
    "*/documents/:documentId/binary",
    () =>
      new HttpResponse("policy binary", {
        status: 200,
        headers: { "Content-Type": "application/octet-stream" },
      }),
  ),

  http.get("*/documents/:documentId", ({ params }) => {
    if (params.documentId === "doc-1") {
      return HttpResponse.json(defaultDocument);
    }
    return HttpResponse.json(
      {
        message: "Document not found",
      },
      { status: 404 },
    );
  }),
];
