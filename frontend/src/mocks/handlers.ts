import { http, HttpResponse } from "msw";

const usersByEmail = {
  "admin@example.com": {
    id: "u-admin",
    fullName: "System Admin",
    email: "admin@example.com",
    roles: ["ADMIN"],
  },
  "analyst@example.com": {
    id: "u-analyst",
    fullName: "Data Analyst",
    email: "analyst@example.com",
    roles: ["USER"],
  },
  "user@example.com": {
    id: "u-user",
    fullName: "Demo User",
    email: "user@example.com",
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
  return usersByEmail[email as keyof typeof usersByEmail] ?? usersByEmail["admin@example.com"];
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
  description: string;
  creationSource: string;
  sourceMailMessageId: string | null;
  participants: {
    userId: string | null;
    email: string;
    displayName: string;
    status: string;
  }[];
  attachments: {
    id: string;
    documentId: string;
    documentTitle: string;
    role: string;
  }[];
};

let calendarEvents: CalendarEventMock[] = [
  {
    id: "event-1",
    title: "Планерка проекта",
    attendees: ["alice@example.com", "admin@example.com"],
    startIso: "2026-05-01T09:00:00Z",
    endIso: "2026-05-01T10:00:00Z",
    createdBy: "u-admin",
    createdAt: "2026-05-01T08:00:00Z",
    updatedAt: "2026-05-01T08:00:00Z",
    description: "",
    creationSource: "UI",
    sourceMailMessageId: null,
    participants: [],
    attachments: [],
  },
];

const agendaSeparator = "--- Повестка ---";

function replaceGeneratedAgenda(description: string, agendaText: string): string {
  const agendaStart = description.indexOf(agendaSeparator);
  const baseDescription =
    agendaStart < 0 ? description.trim() : description.slice(0, agendaStart).trim();
  if (!agendaText.trim()) return baseDescription;
  if (!baseDescription) return `${agendaSeparator}\n${agendaText.trim()}`;
  return `${baseDescription}\n\n${agendaSeparator}\n${agendaText.trim()}`;
}

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
  imapHost: "imap.example.com",
  imapPort: 993,
  imapUsername: "admin@example.com",
};

export const handlers = [
  http.get("*/health", () => HttpResponse.text("ok")),

  http.post("*/auth/login", async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { email?: string };
    const user = buildUserByEmail(body.email ?? "admin@example.com");
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
          attendees: ["analyst@example.com"],
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
        from: "alice@example.com",
        to: "admin@example.com",
        subject: "Hello from Alice",
        preview: "Привет, нужно обсудить контракт",
        sentAtIso: "2026-05-01T10:00:00Z",
        hasAttachments: false,
        draft: false,
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
        from: "alice@example.com",
        to: "admin@example.com",
        subject: "Hello from Alice",
        body: "Привет!\nНужно обсудить контракт на следующей неделе.",
        sentAtIso: "2026-05-01T10:00:00Z",
        attachments: [],
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

  http.get("*/users/search", ({ request }) => {
    const q = new URL(request.url).searchParams.get("q")?.trim().toLowerCase() ?? "";
    const pool = [
      { id: "u-admin", email: "admin@example.com", fullName: "System Admin" },
      { id: "u-analyst", email: "analyst@example.com", fullName: "Data Analyst" },
      { id: "u-user", email: "user@example.com", fullName: "Demo User" },
    ];
    const filtered =
      q.length < 2
        ? []
        : pool.filter(
            (u) => u.email.toLowerCase().includes(q) || u.fullName.toLowerCase().includes(q),
          );
    return HttpResponse.json(filtered);
  }),

  http.get("*/calendar/events", ({ request }) => {
    const url = new URL(request.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    let list = calendarEvents;
    if (from && to) {
      const fs = Date.parse(from);
      const te = Date.parse(to);
      list = calendarEvents.filter((ev) => {
        const s = Date.parse(ev.startIso);
        const e = Date.parse(ev.endIso);
        return e > fs && s < te;
      });
    }
    return HttpResponse.json(list);
  }),

  http.post("*/calendar/events", async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      title?: string;
      attendees?: string[];
      startIso?: string;
      endIso?: string;
      description?: string;
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
      description: body.description ?? "",
      creationSource: "UI",
      sourceMailMessageId: null,
      participants: [],
      attachments: [],
    };
    calendarEvents = [...calendarEvents, created];
    return HttpResponse.json(created, { status: 200 });
  }),

  http.post("*/calendar/events/from-mail", async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      mailbox?: string;
      messageId?: string;
    };
    const nowIso = new Date().toISOString();
    const start = new Date(Date.now() + 3600_000).toISOString();
    const end = new Date(Date.now() + 7200_000).toISOString();
    const created: CalendarEventMock = {
      id: `event-${Math.random().toString(36).slice(2, 9)}`,
      title: "Встреча по письму",
      attendees: ["admin@example.com"],
      startIso: start,
      endIso: end,
      createdBy: "u-admin",
      createdAt: nowIso,
      updatedAt: nowIso,
      description: "Создано из письма",
      creationSource: "MAIL",
      sourceMailMessageId: body.messageId ?? null,
      participants: [],
      attachments: [],
    };
    calendarEvents = [...calendarEvents, created];
    return HttpResponse.json(created);
  }),

  http.post("*/calendar/availability", () =>
    HttpResponse.json({
      slots: [
        { startIso: "2026-05-10T10:00:00Z", endIso: "2026-05-10T10:30:00Z" },
        { startIso: "2026-05-10T14:00:00Z", endIso: "2026-05-10T14:30:00Z" },
      ],
    }),
  ),

  http.post("*/calendar/events/:eventId/agenda", ({ params }) => {
    const index = calendarEvents.findIndex((e) => e.id === params.eventId);
    if (index < 0) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    const ev = calendarEvents[index];
    if (!ev) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    const updated: CalendarEventMock = {
      ...ev,
      description: replaceGeneratedAgenda(ev.description, "- Пункт 1\n- Пункт 2"),
      updatedAt: new Date().toISOString(),
    };
    calendarEvents = calendarEvents.map((e) => (e.id === params.eventId ? updated : e));
    return HttpResponse.json(updated);
  }),

  http.post("*/calendar/events/:eventId/participants", async ({ params, request }) => {
    const body = (await request.json().catch(() => ({}))) as { userId?: string };
    const index = calendarEvents.findIndex((e) => e.id === params.eventId);
    if (index < 0) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    const ev = calendarEvents[index];
    if (!ev) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    const uid = body.userId ?? "u-user";
    const email = uid === "u-admin" ? "admin@example.com" : "user@example.com";
    const name = uid === "u-admin" ? "System Admin" : "Demo User";
    const updated: CalendarEventMock = {
      ...ev,
      participants: [
        ...ev.participants,
        { userId: uid, email, displayName: name, status: "PENDING" },
      ],
      attendees: [...new Set([...ev.attendees, email])],
      updatedAt: new Date().toISOString(),
    };
    calendarEvents = calendarEvents.map((e) => (e.id === params.eventId ? updated : e));
    return HttpResponse.json(updated);
  }),

  http.delete("*/calendar/events/:eventId/participants/:userId", ({ params }) => {
    const index = calendarEvents.findIndex((e) => e.id === params.eventId);
    if (index < 0) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    const ev = calendarEvents[index];
    if (!ev) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    const updated: CalendarEventMock = {
      ...ev,
      participants: ev.participants.filter((p) => p.userId !== params.userId),
      updatedAt: new Date().toISOString(),
    };
    calendarEvents = calendarEvents.map((e) => (e.id === params.eventId ? updated : e));
    return HttpResponse.json(updated);
  }),

  http.post("*/calendar/events/:eventId/attachments", async ({ params, request }) => {
    const body = (await request.json().catch(() => ({}))) as { documentId?: string; role?: string };
    const index = calendarEvents.findIndex((e) => e.id === params.eventId);
    if (index < 0) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    const ev = calendarEvents[index];
    if (!ev) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    const att = {
      id: `att-${Math.random().toString(36).slice(2, 7)}`,
      documentId: body.documentId ?? "doc-1",
      documentTitle: "Policy Doc",
      role: body.role ?? "AGENDA",
    };
    const updated: CalendarEventMock = {
      ...ev,
      attachments: [...ev.attachments, att],
      updatedAt: new Date().toISOString(),
    };
    calendarEvents = calendarEvents.map((e) => (e.id === params.eventId ? updated : e));
    return HttpResponse.json(updated);
  }),

  http.delete("*/calendar/events/:eventId/attachments/:attachmentId", ({ params }) => {
    const index = calendarEvents.findIndex((e) => e.id === params.eventId);
    if (index < 0) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    const ev = calendarEvents[index];
    if (!ev) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    const updated: CalendarEventMock = {
      ...ev,
      attachments: ev.attachments.filter((a) => a.id !== params.attachmentId),
      updatedAt: new Date().toISOString(),
    };
    calendarEvents = calendarEvents.map((e) => (e.id === params.eventId ? updated : e));
    return HttpResponse.json(updated);
  }),

  http.put("*/calendar/events/:eventId", async ({ params, request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      title?: string;
      attendees?: string[];
      startIso?: string;
      endIso?: string;
      description?: string;
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
      description: body.description ?? previous.description,
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
