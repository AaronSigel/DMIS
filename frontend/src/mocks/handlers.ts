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

type CalendarEventMock = {
  id: string;
  title: string;
  attendees: string[];
  startIso: string;
  endIso: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

let calendarEvents: CalendarEventMock[] = [
  {
    id: "event-1",
    title: "Планерка проекта",
    attendees: ["alice@dmis.local", "admin@dmis.local"],
    startIso: "2026-05-01T09:00:00Z",
    endIso: "2026-05-01T10:00:00Z",
    createdBy: "u-admin",
    createdAt: "2026-05-01T08:00:00Z",
    updatedAt: "2026-05-01T08:00:00Z",
  },
];

type AiActionMock = {
  id: string;
  intent: string;
  entities: Record<string, unknown>;
  actorId: string;
  status: "DRAFT" | "CONFIRMED" | "EXECUTED";
  confirmedBy: string | null;
};

let aiActions: AiActionMock[] = [];

let mailAccount = {
  connected: true,
  imapHost: "imap.dmis.local",
  imapPort: 993,
  imapUsername: "admin@dmis.local",
};

export const handlers = [
  http.get("*/health", () => HttpResponse.text("ok")),

  http.post("*/auth/login", async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { email?: string };
    const user = buildUserByEmail(body.email ?? "admin@dmis.local");
    aiActions = [];
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

  http.get("*/assistant/threads", () =>
    HttpResponse.json([
      {
        id: "thread-1",
        title: "Demo thread",
        ideologyProfileId: "balanced",
        knowledgeSourceIds: ["documents"],
      },
    ]),
  ),
  http.get("*/assistant/threads/:threadId", () =>
    HttpResponse.json({
      thread: {
        id: "thread-1",
        title: "Demo thread",
        ideologyProfileId: "balanced",
        knowledgeSourceIds: ["documents"],
      },
      messages: [
        {
          id: "msg-ai-1",
          role: "ASSISTANT",
          content: "Краткий ответ AI для подготовки письма.",
          documentIds: [],
        },
      ],
      linkedDocumentIds: [],
    }),
  ),
  http.post("*/assistant/actions/parse", async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { text?: string };
    const text = String(body.text ?? "").toLowerCase();
    if (text.includes("событ") || text.includes("встреч")) {
      const created: AiActionMock = {
        id: `act-${Math.random().toString(36).slice(2, 9)}`,
        intent: "create_calendar_event",
        entities: {
          type: "create_calendar_event",
          title: "Обсуждение схемотехники",
          attendees: ["analyst@dmis.local"],
          startIso: "2026-05-09T12:00:00Z",
          endIso: "2026-05-09T13:00:00Z",
        },
        actorId: "u-admin",
        status: "DRAFT",
        confirmedBy: null,
      };
      aiActions = [...aiActions, created];
      return HttpResponse.json(created);
    }
    return HttpResponse.json({ message: "Unsupported intent: none" }, { status: 400 });
  }),
  http.post(
    "*/rag/answer-with-sources/stream",
    () =>
      new HttpResponse('data: {"delta":"RAG ответ"}\n\n', {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      }),
  ),
  http.get("*/actions", () => HttpResponse.json(aiActions)),
  http.post("*/actions/draft", async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      intent?: string;
      entities?: Record<string, unknown>;
    };
    const created: AiActionMock = {
      id: `act-${Math.random().toString(36).slice(2, 9)}`,
      intent: body.intent ?? "send_email",
      entities: body.entities ?? {},
      actorId: "u-admin",
      status: "DRAFT",
      confirmedBy: null,
    };
    aiActions = [...aiActions, created];
    return HttpResponse.json(created);
  }),
  http.post("*/actions/:actionId/confirm", ({ params }) => {
    const action = aiActions.find((item) => item.id === params.actionId);
    if (!action) return HttpResponse.json({ message: "Action not found" }, { status: 404 });
    const confirmed: AiActionMock = { ...action, status: "CONFIRMED", confirmedBy: "u-admin" };
    aiActions = aiActions.map((item) => (item.id === action.id ? confirmed : item));
    return HttpResponse.json(confirmed);
  }),
  http.post("*/actions/:actionId/execute", ({ params }) => {
    const action = aiActions.find((item) => item.id === params.actionId);
    if (!action) return HttpResponse.json({ message: "Action not found" }, { status: 404 });
    const executed: AiActionMock = { ...action, status: "EXECUTED" };
    aiActions = aiActions.map((item) => (item.id === action.id ? executed : item));
    return HttpResponse.json(executed);
  }),
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

  http.get("*/mail/messages", () =>
    HttpResponse.json([
      {
        id: "mail-1",
        from: "alice@dmis.local",
        to: "admin@dmis.local",
        subject: "Hello from Alice",
        preview: "Привет, нужно обсудить контракт",
        sentAtIso: "2026-05-01T10:00:00Z",
      },
    ]),
  ),

  http.get("*/mail/account", () => HttpResponse.json(mailAccount)),
  http.put("*/mail/account", async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as Partial<typeof mailAccount> & {
      password?: string;
    };
    mailAccount = {
      connected: true,
      imapHost: String(body.imapHost ?? mailAccount.imapHost),
      imapPort: Number(body.imapPort ?? mailAccount.imapPort),
      imapUsername: String(body.imapUsername ?? mailAccount.imapUsername),
    };
    return HttpResponse.json(mailAccount);
  }),
  http.delete("*/mail/account", () => {
    mailAccount = { ...mailAccount, connected: false };
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("*/mail/messages/:messageId", ({ params }) => {
    if (params.messageId === "mail-1") {
      return HttpResponse.json({
        id: "mail-1",
        from: "alice@dmis.local",
        to: "admin@dmis.local",
        subject: "Hello from Alice",
        body: "Привет!\nНужно обсудить контракт на следующей неделе.",
        sentAtIso: "2026-05-01T10:00:00Z",
      });
    }
    return HttpResponse.json({ message: "Mail not found" }, { status: 404 });
  }),

  http.post("*/mail/messages/search", async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { query?: string };
    return HttpResponse.json({
      query: body.query ?? "",
      messages: [],
    });
  }),

  http.get("*/calendar/events", () => HttpResponse.json(calendarEvents)),

  http.post("*/calendar/events", async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      title?: string;
      attendees?: string[];
      startIso?: string;
      endIso?: string;
    };
    const nowIso = new Date().toISOString();
    const created: CalendarEventMock = {
      id: `event-${Math.random().toString(36).slice(2, 9)}`,
      title: body.title ?? "",
      attendees: body.attendees ?? [],
      startIso: body.startIso ?? nowIso,
      endIso: body.endIso ?? nowIso,
      createdBy: "u-admin",
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    calendarEvents = [...calendarEvents, created];
    return HttpResponse.json(created, { status: 200 });
  }),

  http.put("*/calendar/events/:eventId", async ({ params, request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      title?: string;
      attendees?: string[];
      startIso?: string;
      endIso?: string;
    };
    const index = calendarEvents.findIndex((event) => event.id === params.eventId);
    if (index < 0) {
      return HttpResponse.json({ message: "Event not found" }, { status: 404 });
    }
    const previous = calendarEvents[index];
    if (!previous) {
      return HttpResponse.json({ message: "Event not found" }, { status: 404 });
    }
    const updated: CalendarEventMock = {
      ...previous,
      title: body.title ?? previous.title,
      attendees: body.attendees ?? previous.attendees,
      startIso: body.startIso ?? previous.startIso,
      endIso: body.endIso ?? previous.endIso,
      updatedAt: new Date().toISOString(),
    };
    calendarEvents = calendarEvents.map((event) => (event.id === params.eventId ? updated : event));
    return HttpResponse.json(updated);
  }),

  http.delete("*/calendar/events/:eventId", ({ params }) => {
    const exists = calendarEvents.some((event) => event.id === params.eventId);
    if (!exists) {
      return HttpResponse.json({ message: "Event not found" }, { status: 404 });
    }
    calendarEvents = calendarEvents.filter((event) => event.id !== params.eventId);
    return new HttpResponse(null, { status: 204 });
  }),
];
