import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import { documentStatusLabel } from "./features/assistant/AiPanel";
import { queryClient } from "./shared/api/queryClient";
import { useUiStore } from "./shared/store/uiStore";
import { server } from "./test/setup";

describe("auth smoke", () => {
  afterEach(() => {
    cleanup();
    queryClient.clear();
    window.localStorage.clear();
    useUiStore.setState({
      desktopAiOpen: false,
      assistantQuery: "",
      assistantPrefillSeq: 0,
      pendingLinkedDocumentIds: [],
      pendingNewAssistantThread: false,
      assistantContext: { module: "workspace", object: null },
    });
  });

  function buildDocumentsPage() {
    return {
      content: [
        {
          id: "doc-1",
          title: "Policy Doc",
          ownerId: "u-admin",
          description: "Corporate policy",
          tags: ["policy"],
          source: "upload",
          category: "general",
          status: "READY",
          type: "TXT",
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
          totalSizeBytes: 128,
          fileName: "policy.txt",
          contentType: "text/plain",
          storageRef: "documents/doc-1",
          indexedChunkCount: 1,
          indexedAt: "2026-01-01T00:00:00Z",
          extractedTextPreview: "Policy preview",
          extractedTextLength: 12,
          extractedTextTruncated: false,
        },
      ],
      totalElements: 1,
      totalPages: 1,
      page: 0,
      size: 20,
    };
  }

  it("signs in and opens document card", async () => {
    render(
      <MemoryRouter
        initialEntries={["/documents"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>,
    );

    await userEvent.type(
      screen.getByPlaceholderText(/электронная почта/i),
      "sokolov-d-a@example.com",
    );
    await userEvent.type(screen.getByPlaceholderText(/пароль/i), "demo");
    await userEvent.click(screen.getByRole("button", { name: /войти/i }));

    await waitFor(() => expect(screen.getByText("Policy Doc")).toBeInTheDocument());
    const firstPolicyDoc = screen.getAllByText("Policy Doc")[0];
    if (!firstPolicyDoc) throw new Error("Не найден элемент документа Policy Doc");
    await userEvent.click(firstPolicyDoc);

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Policy Doc" })).toBeInTheDocument(),
    );
    expect(screen.getByText("policy.txt")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /спросить ассистента/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /создать встречу/i })).toBeInTheDocument();
    expect(window.localStorage.getItem("dmis_token")).toBe("token-1");
  });

  it("does not logout on 403 when refresh succeeds and retries protected request", async () => {
    let documentsCallCount = 0;
    let refreshCallCount = 0;
    const authHeaders: string[] = [];
    server.use(
      http.get("*/documents", ({ request }) => {
        documentsCallCount += 1;
        authHeaders.push(request.headers.get("authorization") ?? "");
        if (documentsCallCount === 1) {
          return HttpResponse.json({ message: "Expired token" }, { status: 403 });
        }
        return HttpResponse.json(buildDocumentsPage());
      }),
      http.post("*/auth/refresh", () => {
        refreshCallCount += 1;
        return HttpResponse.json({ token: "token-2" });
      }),
    );

    render(
      <MemoryRouter
        initialEntries={["/documents"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>,
    );

    await userEvent.type(
      screen.getByPlaceholderText(/электронная почта/i),
      "sokolov-d-a@example.com",
    );
    await userEvent.type(screen.getByPlaceholderText(/пароль/i), "demo");
    await userEvent.click(screen.getByRole("button", { name: /войти/i }));

    await waitFor(() => expect(screen.getByText("Policy Doc")).toBeInTheDocument());
    expect(screen.queryByTestId("login-email-input")).not.toBeInTheDocument();
    expect(window.localStorage.getItem("dmis_token")).toBe("token-2");
    expect(refreshCallCount).toBe(1);
    expect(documentsCallCount).toBeGreaterThanOrEqual(2);
    expect(authHeaders).toContain("Bearer token-1");
    expect(authHeaders).toContain("Bearer token-2");
  });

  it("logs out on unauthorized when refresh fails", async () => {
    server.use(
      http.get("*/documents", () =>
        HttpResponse.json({ message: "Expired token" }, { status: 403 }),
      ),
      http.post("*/auth/refresh", () =>
        HttpResponse.json({ message: "Refresh invalid" }, { status: 401 }),
      ),
    );

    render(
      <MemoryRouter
        initialEntries={["/documents"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>,
    );

    await userEvent.type(
      screen.getByPlaceholderText(/электронная почта/i),
      "sokolov-d-a@example.com",
    );
    await userEvent.type(screen.getByPlaceholderText(/пароль/i), "demo");
    await userEvent.click(screen.getByRole("button", { name: /войти/i }));

    await waitFor(() => expect(screen.getByRole("button", { name: /войти/i })).toBeInTheDocument());
    expect(screen.getByTestId("login-email-input")).toBeInTheDocument();
    expect(window.localStorage.getItem("dmis_token")).toBeNull();
  });

  it("creates action drafts from document and assistant hooks", async () => {
    render(
      <MemoryRouter
        initialEntries={["/documents/doc-1"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>,
    );

    await userEvent.type(
      screen.getByPlaceholderText(/электронная почта/i),
      "sokolov-d-a@example.com",
    );
    await userEvent.type(screen.getByPlaceholderText(/пароль/i), "demo");
    await userEvent.click(screen.getByRole("button", { name: /войти/i }));

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Policy Doc" })).toBeInTheDocument(),
    );
    await userEvent.click(screen.getByTitle("Создать встречу по этому документу"));
    await userEvent.type(
      screen.getByPlaceholderText(/адреса почты или @имена через запятую/i),
      "@analyst",
    );
    const submitMeetingButtons = screen.getAllByRole("button", { name: /^создать встречу$/i });
    await userEvent.click(submitMeetingButtons[submitMeetingButtons.length - 1]!);

    await waitFor(() => expect(screen.getByText(/встреча создана/i)).toBeInTheDocument());
    await userEvent.click(screen.getByTestId("assistant-open-button"));

    await waitFor(() =>
      expect(screen.getByText("Краткий ответ ИИ для подготовки письма.")).toBeInTheDocument(),
    );
    const assistantAside = screen
      .getAllByRole("complementary")
      .find((el) => within(el).queryByRole("button", { name: /диалоги/i }));
    expect(assistantAside).toBeTruthy();
    await userEvent.type(
      within(assistantAside as HTMLElement).getByTestId("assistant-message-input"),
      "Создай событие календаря на 9 мая 15:00 по обсуждению схемотехники",
    );
    await userEvent.click(
      within(assistantAside as HTMLElement).getByRole("button", {
        name: /отправить вопрос ассистенту/i,
      }),
    );
    await waitFor(() =>
      expect(
        within(assistantAside as HTMLElement).getByText(/Действие: создание встречи/i),
      ).toBeInTheDocument(),
    );
    await userEvent.click(
      within(assistantAside as HTMLElement).getByRole("button", { name: /^закрыть$/i }),
    );
  });

  it("does not create action draft for non-action assistant text", async () => {
    render(
      <MemoryRouter
        initialEntries={["/documents/doc-1"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>,
    );

    await userEvent.type(
      screen.getByPlaceholderText(/электронная почта/i),
      "sokolov-d-a@example.com",
    );
    await userEvent.type(screen.getByPlaceholderText(/пароль/i), "demo");
    await userEvent.click(screen.getByRole("button", { name: /войти/i }));

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Policy Doc" })).toBeInTheDocument(),
    );
    await userEvent.click(screen.getByTestId("assistant-open-button"));

    let assistantAside: HTMLElement | undefined;
    await waitFor(() => {
      assistantAside = screen
        .getAllByRole("complementary")
        .find((el) => within(el).queryByRole("button", { name: /диалоги/i }));
      expect(assistantAside).toBeTruthy();
    });

    await userEvent.type(
      within(assistantAside as HTMLElement).getByTestId("assistant-message-input"),
      "что есть по новому договору?",
    );
    await userEvent.click(
      within(assistantAside as HTMLElement).getByRole("button", {
        name: /отправить вопрос ассистенту/i,
      }),
    );

    await waitFor(() =>
      expect(
        within(assistantAside as HTMLElement).queryByText(/Действие: создание встречи/i),
      ).not.toBeInTheDocument(),
    );
  });

  it("uses new navigation layout and hides admin control for non-admin", async () => {
    render(
      <MemoryRouter
        initialEntries={["/dashboard"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>,
    );

    await userEvent.type(
      screen.getByPlaceholderText(/электронная почта/i),
      "petrova-a-s@example.com",
    );
    await userEvent.type(screen.getByPlaceholderText(/пароль/i), "demo");
    await userEvent.click(screen.getByRole("button", { name: /войти/i }));

    await waitFor(() =>
      expect(screen.getAllByRole("button", { name: /документы/i }).length).toBeGreaterThan(0),
    );
    expect(screen.queryByRole("button", { name: /^дашборд$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /RAG-ассистент/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Мои ИИ-действия/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Интеграции/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /календарь/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /журнал аудита/i })).not.toBeInTheDocument();

    // Settings and ACL nav items have been removed from navigation.
    expect(screen.queryByRole("button", { name: /настройки/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /права доступа/i })).not.toBeInTheDocument();
  });
});

describe("mail page", () => {
  afterEach(() => {
    cleanup();
    queryClient.clear();
    window.localStorage.clear();
    window.history.replaceState({}, "", "/");
    useUiStore.setState({
      desktopAiOpen: false,
      assistantQuery: "",
      assistantPrefillSeq: 0,
      pendingLinkedDocumentIds: [],
      pendingNewAssistantThread: false,
      assistantContext: { module: "workspace", object: null },
    });
  });

  it("renders inbox list, opens detail, exposes reply via assistant button", async () => {
    render(
      <MemoryRouter
        initialEntries={["/mail"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>,
    );

    await userEvent.type(
      screen.getByPlaceholderText(/электронная почта/i),
      "sokolov-d-a@example.com",
    );
    await userEvent.type(screen.getByPlaceholderText(/пароль/i), "demo");
    await userEvent.click(screen.getByRole("button", { name: /войти/i }));

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /^почта$/i })).toBeInTheDocument(),
    );
    expect(screen.queryByText(/Почта пока не готова к чтению/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/IMAP host/i)).not.toBeInTheDocument();

    const subject = await screen.findByText(/Hello from Alice/);
    await userEvent.click(subject);

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /Hello from Alice/ })).toBeInTheDocument(),
    );
    expect(screen.getByText(/Нужно обсудить контракт на следующей неделе\./)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /ответить на письмо через ИИ-ассистента/i }),
    ).toBeInTheDocument();
  });

  it("sends selected draft from the detail toolbar after confirmation", async () => {
    const sentDraftIds: string[] = [];
    server.use(
      http.get("*/mail/messages", ({ request }) => {
        const folder = new URL(request.url).searchParams.get("folder");
        if (folder !== "DRAFT") return HttpResponse.json([]);
        return HttpResponse.json([
          {
            id: "draft-1",
            from: "sokolov-d-a@example.com",
            to: "manager@example.com",
            subject: "Черновик отчёта",
            preview: "Нужно отправить статус.",
            sentAtIso: "2026-05-01T10:00:00Z",
            hasAttachments: false,
            draft: true,
          },
        ]);
      }),
      http.get("*/mail/messages/draft-1", () =>
        HttpResponse.json({
          id: "draft-1",
          from: "sokolov-d-a@example.com",
          to: "manager@example.com",
          subject: "Черновик отчёта",
          body: "Нужно отправить статус.",
          sentAtIso: "2026-05-01T10:00:00Z",
          attachments: [],
        }),
      ),
      http.post("*/mail/drafts/:draftId/send", ({ params }) => {
        sentDraftIds.push(String(params.draftId));
        return HttpResponse.json({
          id: String(params.draftId),
          to: "manager@example.com",
          subject: "Черновик отчёта",
          body: "Нужно отправить статус.",
          createdBy: "u-admin",
        });
      }),
    );

    render(
      <MemoryRouter
        initialEntries={["/mail"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>,
    );

    await userEvent.type(
      screen.getByPlaceholderText(/электронная почта/i),
      "sokolov-d-a@example.com",
    );
    await userEvent.type(screen.getByPlaceholderText(/пароль/i), "demo");
    await userEvent.click(screen.getByRole("button", { name: /войти/i }));

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /^почта$/i })).toBeInTheDocument(),
    );
    await userEvent.click(screen.getByRole("button", { name: /черновики/i }));
    await userEvent.click(await screen.findByText(/Черновик отчёта/));
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /Черновик отчёта/ })).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByRole("button", { name: /^отправить/i }));
    await userEvent.click(screen.getByRole("button", { name: /да, отправить/i }));

    await waitFor(() => expect(sentDraftIds).toEqual(["draft-1"]));
  });

  it("summarizes selected draft from the detail toolbar", async () => {
    const summarizedThreadIds: string[] = [];
    server.use(
      http.get("*/mail/messages", ({ request }) => {
        const folder = new URL(request.url).searchParams.get("folder");
        if (folder !== "DRAFT") return HttpResponse.json([]);
        return HttpResponse.json([
          {
            id: "draft-1",
            from: "sokolov-d-a@example.com",
            to: "manager@example.com",
            subject: "Черновик отчёта",
            preview: "Нужно отправить статус.",
            sentAtIso: "2026-05-01T10:00:00Z",
            hasAttachments: false,
            draft: true,
          },
        ]);
      }),
      http.get("*/mail/messages/draft-1", () =>
        HttpResponse.json({
          id: "draft-1",
          from: "sokolov-d-a@example.com",
          to: "manager@example.com",
          subject: "Черновик отчёта",
          body: "Нужно отправить статус.",
          sentAtIso: "2026-05-01T10:00:00Z",
          attachments: [],
        }),
      ),
      http.post("*/mail/threads/:threadId/summary", ({ params }) => {
        summarizedThreadIds.push(String(params.threadId));
        return HttpResponse.json({
          summary: "Черновик: нужно отправить статус менеджеру.",
          provider: "fake",
          model: "test",
        });
      }),
    );

    render(
      <MemoryRouter
        initialEntries={["/mail"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>,
    );

    await userEvent.type(
      screen.getByPlaceholderText(/электронная почта/i),
      "sokolov-d-a@example.com",
    );
    await userEvent.type(screen.getByPlaceholderText(/пароль/i), "demo");
    await userEvent.click(screen.getByRole("button", { name: /войти/i }));

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /^почта$/i })).toBeInTheDocument(),
    );
    await userEvent.click(screen.getByRole("button", { name: /черновики/i }));
    await userEvent.click(await screen.findByText(/Черновик отчёта/));
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /Черновик отчёта/ })).toBeInTheDocument(),
    );

    const summaryButton = screen.getByRole("button", { name: /кратко пересказать/i });
    expect(summaryButton).toBeEnabled();
    await userEvent.click(summaryButton);

    await waitFor(() => expect(summarizedThreadIds).toEqual(["draft-1"]));
    expect(
      await screen.findByText(/Черновик: нужно отправить статус менеджеру\./),
    ).toBeInTheDocument();
  });

  it("prefills assistant reply without submitting it", async () => {
    const originalFetch = globalThis.fetch;
    const createThreadRequests: string[] = [];
    const submitRequests: string[] = [];
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      const url = String(input instanceof Request ? input.url : input);
      const method = String(
        init?.method ?? (input instanceof Request ? input.method : "GET"),
      ).toUpperCase();

      if (url.includes("/assistant/threads") && method === "POST" && !url.includes("/submit")) {
        createThreadRequests.push(url);
        return Promise.resolve(
          new Response(
            JSON.stringify({
              id: "thread-prefill",
              title: "Новый диалог",
              ideologyProfileId: "balanced",
              knowledgeSourceIds: ["documents"],
            }),
            { headers: { "Content-Type": "application/json" } },
          ),
        );
      }

      if (url.includes("/assistant/threads/") && url.includes("/submit") && method === "POST") {
        submitRequests.push(url);
      }

      return originalFetch(input, init);
    });

    try {
      render(
        <MemoryRouter
          initialEntries={["/mail"]}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <App />
        </MemoryRouter>,
      );

      await userEvent.type(
        screen.getByPlaceholderText(/электронная почта/i),
        "sokolov-d-a@example.com",
      );
      await userEvent.type(screen.getByPlaceholderText(/пароль/i), "demo");
      await userEvent.click(screen.getByRole("button", { name: /войти/i }));

      await waitFor(() =>
        expect(screen.getByRole("heading", { name: /^почта$/i })).toBeInTheDocument(),
      );
      await userEvent.click(await screen.findByText(/Hello from Alice/));

      await waitFor(() =>
        expect(screen.getByRole("heading", { name: /Hello from Alice/ })).toBeInTheDocument(),
      );
      await userEvent.click(
        screen.getByRole("button", { name: /ответить на письмо через ИИ-ассистента/i }),
      );

      const panel = await screen.findByTestId("assistant-panel");
      const input = within(panel).getByTestId("assistant-message-input");
      await waitFor(() =>
        expect((input as HTMLTextAreaElement).value).toContain("Ответь на письмо от"),
      );
      expect(createThreadRequests).toHaveLength(1);
      expect(submitRequests).toHaveLength(0);
      expect(within(panel).queryByText(/^Вы$/)).not.toBeInTheDocument();
    } finally {
      fetchSpy.mockRestore();
    }
  });
});

describe("calendar page", () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  it("renders day/week, creates, edits and deletes calendar event", async () => {
    render(
      <MemoryRouter
        initialEntries={["/calendar"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>,
    );

    await userEvent.type(
      screen.getByPlaceholderText(/электронная почта/i),
      "sokolov-d-a@example.com",
    );
    await userEvent.type(screen.getByPlaceholderText(/пароль/i), "demo");
    await userEvent.click(screen.getByRole("button", { name: /войти/i }));

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /^календарь$/i })).toBeInTheDocument(),
    );

    // Open the create form (form is hidden by default after the UX fix)
    await userEvent.click(screen.getByRole("button", { name: /создать событие/i }));

    await userEvent.click(screen.getByRole("button", { name: /день/i }));
    await userEvent.click(screen.getByRole("button", { name: /неделя/i }));
    const dateInput = screen.getByLabelText(/дата просмотра календаря/i);
    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, "2026-05-01");

    await userEvent.type(screen.getByLabelText(/название события/i), "Синк команды");
    await userEvent.type(
      screen.getByLabelText(/участники события/i),
      "bob@example.com, carol@example.com",
    );
    await userEvent.type(screen.getByLabelText(/начало события/i), "2026-05-01T12:00");
    await userEvent.type(screen.getByLabelText(/окончание события/i), "2026-05-01T13:00");
    await userEvent.click(screen.getByRole("button", { name: /^создать$/i }));

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /Синк команды/i })).toBeInTheDocument(),
    );

    const editButtons = screen.getAllByRole("button", { name: /изменить/i });
    await userEvent.click(editButtons[0]!);
    const titleInput = screen.getByLabelText(/название события/i);
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "Синк команды (обновлено)");
    await userEvent.click(screen.getByRole("button", { name: /сохранить/i }));

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /Синк команды \(обновлено\)/i }),
      ).toBeInTheDocument(),
    );

    const deleteButtons = screen.getAllByRole("button", { name: /удалить/i });
    await userEvent.click(deleteButtons[0]!);
    await userEvent.click(screen.getByRole("button", { name: /подтвердить/i }));
    await waitFor(() => expect(screen.queryAllByText("Синк команды (обновлено)")).toHaveLength(0));
  });
});

describe("doc table url filters", () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  async function loginAsAdmin() {
    await userEvent.type(
      screen.getByPlaceholderText(/электронная почта/i),
      "sokolov-d-a@example.com",
    );
    await userEvent.type(screen.getByPlaceholderText(/пароль/i), "demo");
    await userEvent.click(screen.getByRole("button", { name: /войти/i }));
  }

  it("restores filter and sort state from query string", async () => {
    window.history.pushState({}, "", "/documents?sort=date_asc&page=2");

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );

    await loginAsAdmin();

    await waitFor(() =>
      expect(screen.getByRole("combobox", { name: /сортировка/i })).toHaveValue("date_asc"),
    );
    expect(screen.getByRole("button", { name: /^архив$/i })).toBeInTheDocument();

    const params = new URLSearchParams(window.location.search);
    expect(params.get("sort")).toBe("date_asc");
    expect(params.get("page")).toBe("2");
  });

  it("updates query string when sort and archive are toggled", async () => {
    window.history.pushState({}, "", "/documents");

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );

    await loginAsAdmin();
    await waitFor(() => expect(screen.getByText("Policy Doc")).toBeInTheDocument());

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: /сортировка/i }),
      "date_asc",
    );
    await userEvent.click(screen.getByRole("button", { name: /^архив$/i }));

    await waitFor(() => {
      const params = new URLSearchParams(window.location.search);
      expect(params.get("sort")).toBe("date_asc");
      expect(params.get("archive")).toBe("1");
      expect(params.get("page")).toBeNull();
    });

    await userEvent.click(screen.getByRole("button", { name: /архив: вкл/i }));
    await waitFor(() => {
      const params = new URLSearchParams(window.location.search);
      expect(params.get("archive")).toBeNull();
    });
  });
});

describe("assistant document context", () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    useUiStore.setState({
      desktopAiOpen: false,
      assistantQuery: "",
      assistantPrefillSeq: 0,
      pendingLinkedDocumentIds: [],
      pendingNewAssistantThread: false,
      assistantContext: { module: "workspace", object: null },
    });
  });

  async function loginAsAdmin() {
    await userEvent.type(
      screen.getByPlaceholderText(/электронная почта/i),
      "sokolov-d-a@example.com",
    );
    await userEvent.type(screen.getByPlaceholderText(/пароль/i), "demo");
    await userEvent.click(screen.getByRole("button", { name: /войти/i }));
  }

  it("shows context card on document page", async () => {
    render(
      <MemoryRouter
        initialEntries={["/documents/doc-1"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>,
    );

    await userEvent.type(
      screen.getByPlaceholderText(/электронная почта/i),
      "sokolov-d-a@example.com",
    );
    await userEvent.type(screen.getByPlaceholderText(/пароль/i), "demo");
    await userEvent.click(screen.getByRole("button", { name: /войти/i }));

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Policy Doc" })).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByTestId("assistant-open-button"));

    const panel = await screen.findByTestId("assistant-panel");
    expect(within(panel).getByTestId("assistant-context-card")).toBeInTheDocument();
    expect(within(panel).getByTestId("assistant-context-object")).toHaveTextContent(/Policy Doc/);
  });

  it("shows prompt suggestions on documents list in idle state", async () => {
    render(
      <MemoryRouter
        initialEntries={["/documents"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>,
    );

    await userEvent.type(
      screen.getByPlaceholderText(/электронная почта/i),
      "sokolov-d-a@example.com",
    );
    await userEvent.type(screen.getByPlaceholderText(/пароль/i), "demo");
    await userEvent.click(screen.getByRole("button", { name: /войти/i }));

    await waitFor(() => expect(screen.getByText("Policy Doc")).toBeInTheDocument());
    await userEvent.click(screen.getByTestId("assistant-open-button"));

    const panel = await screen.findByTestId("assistant-panel");
    expect(within(panel).getByTestId("assistant-prompt-suggestions")).toBeInTheDocument();
    expect(within(panel).getByTestId("assistant-suggestion-find-doc")).toBeInTheDocument();
  });

  it("sends suggestion prompt when chip is clicked", async () => {
    render(
      <MemoryRouter
        initialEntries={["/documents"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>,
    );

    await userEvent.type(
      screen.getByPlaceholderText(/электронная почта/i),
      "sokolov-d-a@example.com",
    );
    await userEvent.type(screen.getByPlaceholderText(/пароль/i), "demo");
    await userEvent.click(screen.getByRole("button", { name: /войти/i }));

    await waitFor(() => expect(screen.getByText("Policy Doc")).toBeInTheDocument());
    await userEvent.click(screen.getByTestId("assistant-open-button"));
    const panel = await screen.findByTestId("assistant-panel");
    await userEvent.click(within(panel).getByTestId("assistant-suggestion-find-doc"));

    await waitFor(() => expect(within(panel).getByTestId("assistant-answer")).toBeInTheDocument());
  });

  it("adds document mention when link endpoint returns empty success", async () => {
    const linkRequests: string[] = [];
    server.use(
      http.get("*/assistant/documents/mentions", () =>
        HttpResponse.json([
          { id: "doc-1", title: "Policy Doc", updatedAt: "2026-01-01T00:00:00Z" },
        ]),
      ),
      http.post("*/assistant/threads/:threadId/documents", async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as { documentId?: string };
        linkRequests.push(String(body.documentId ?? ""));
        return new HttpResponse(null, { status: 204 });
      }),
    );

    render(
      <MemoryRouter
        initialEntries={["/documents"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>,
    );

    await userEvent.type(
      screen.getByPlaceholderText(/электронная почта/i),
      "sokolov-d-a@example.com",
    );
    await userEvent.type(screen.getByPlaceholderText(/пароль/i), "demo");
    await userEvent.click(screen.getByRole("button", { name: /войти/i }));
    await waitFor(() => expect(screen.getByText("Policy Doc")).toBeInTheDocument());
    await userEvent.click(screen.getByTestId("assistant-open-button"));

    const panel = await screen.findByTestId("assistant-panel");
    await userEvent.type(within(panel).getByTestId("assistant-message-input"), "@Pol");
    await userEvent.click(await within(panel).findByRole("button", { name: /Policy Doc/i }));

    await waitFor(() => expect(linkRequests).toEqual(["doc-1"]));
    expect(screen.queryByText(/Сервис вернул неожиданный ответ/i)).not.toBeInTheDocument();
  });

  it("shows document mention suggestions for empty and one-letter aliases", async () => {
    const documentQueries: string[] = [];
    server.use(
      http.get("*/assistant/documents/mentions", ({ request }) => {
        documentQueries.push(new URL(request.url).searchParams.get("q") ?? "");
        return HttpResponse.json([
          { id: "doc-1", title: "Policy Doc", updatedAt: "2026-01-01T00:00:00Z" },
        ]);
      }),
    );

    render(
      <MemoryRouter
        initialEntries={["/documents"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>,
    );

    await loginAsAdmin();
    await waitFor(() => expect(screen.getByText("Policy Doc")).toBeInTheDocument());
    await userEvent.click(screen.getByTestId("assistant-open-button"));

    const panel = await screen.findByTestId("assistant-panel");
    const input = within(panel).getByTestId("assistant-message-input");
    await userEvent.type(input, "@");
    expect(await within(panel).findByRole("button", { name: /Policy Doc/i })).toBeInTheDocument();
    await waitFor(() => expect(documentQueries).toContain(""));

    await userEvent.clear(input);
    await userEvent.type(input, "@P");
    expect(await within(panel).findByRole("button", { name: /Policy Doc/i })).toBeInTheDocument();
    await waitFor(() => expect(documentQueries).toContain("P"));
  });

  it("inserts hash user mention and submits it unchanged", async () => {
    const submitTexts: string[] = [];
    server.use(
      http.post("*/assistant/threads/:threadId/submit", async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as { text?: string };
        submitTexts.push(String(body.text ?? ""));
        return HttpResponse.json({
          route: "CONTROLLED_ACTION",
          traceId: "trace-mock",
          status: "OK",
          action: {
            id: "act-hash-user",
            intent: "send_email",
            entities: {
              type: "send_email",
              to: "petrova-a-s@example.com",
              subject: "Документ для ознакомления",
              body: "Коллеги, направляю документ из DMIS.",
              attachmentDocumentIds: [],
            },
            actorId: "u-admin",
            status: "DRAFT",
            confirmedBy: null,
            result: null,
            assistantThreadId: "thread-1",
          },
        });
      }),
    );

    render(
      <MemoryRouter
        initialEntries={["/documents"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>,
    );

    await userEvent.type(
      screen.getByPlaceholderText(/электронная почта/i),
      "sokolov-d-a@example.com",
    );
    await userEvent.type(screen.getByPlaceholderText(/пароль/i), "demo");
    await userEvent.click(screen.getByRole("button", { name: /войти/i }));
    await waitFor(() => expect(screen.getByText("Policy Doc")).toBeInTheDocument());
    await userEvent.click(screen.getByTestId("assistant-open-button"));

    const panel = await screen.findByTestId("assistant-panel");
    const input = within(panel).getByTestId("assistant-message-input") as HTMLTextAreaElement;
    await userEvent.type(input, "Подготовь письмо #Пе");
    await userEvent.click(
      await within(panel).findByRole("button", { name: /Петрова Анна Сергеевна/i }),
    );
    expect(input.value).toBe("Подготовь письмо #Петрова А.С. ");

    await userEvent.click(within(panel).getByTestId("assistant-send-button"));
    await waitFor(() => expect(submitTexts).toEqual(["Подготовь письмо #Петрова А.С. "]));
  });

  it("shows user mention suggestions for empty and one-letter aliases", async () => {
    render(
      <MemoryRouter
        initialEntries={["/documents"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>,
    );

    await loginAsAdmin();
    await waitFor(() => expect(screen.getByText("Policy Doc")).toBeInTheDocument());
    await userEvent.click(screen.getByTestId("assistant-open-button"));

    const panel = await screen.findByTestId("assistant-panel");
    const input = within(panel).getByTestId("assistant-message-input");
    await userEvent.type(input, "#");
    expect(
      await within(panel).findByRole("button", { name: /Петрова Анна Сергеевна/i }),
    ).toBeInTheDocument();

    await userEvent.clear(input);
    await userEvent.type(input, "#П");
    expect(
      await within(panel).findByRole("button", { name: /Петрова Анна Сергеевна/i }),
    ).toBeInTheDocument();
  });

  it("shows clarification form for calendar action without date", async () => {
    render(
      <MemoryRouter
        initialEntries={["/documents/doc-1"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>,
    );

    await userEvent.type(
      screen.getByPlaceholderText(/электронная почта/i),
      "sokolov-d-a@example.com",
    );
    await userEvent.type(screen.getByPlaceholderText(/пароль/i), "demo");
    await userEvent.click(screen.getByRole("button", { name: /войти/i }));

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Policy Doc" })).toBeInTheDocument(),
    );
    await userEvent.click(screen.getByTestId("assistant-open-button"));
    const panel = await screen.findByTestId("assistant-panel");

    await userEvent.type(
      within(panel).getByTestId("assistant-message-input"),
      "Создай встречу по согласованию договора",
    );
    await userEvent.click(within(panel).getByTestId("assistant-send-button"));

    await waitFor(() =>
      expect(within(panel).getByTestId("assistant-clarification-form")).toBeInTheDocument(),
    );
    expect(within(panel).getByTestId("clarification-field-startAt")).toBeInTheDocument();
  });

  it("does not show previous thread action cards in a new assistant dialog", async () => {
    queryClient.clear();
    const threadOneAction = {
      id: "act-thread-1",
      intent: "send_email",
      entities: {
        type: "send_email",
        to: "volkova-e-v@example.com",
        subject: "Thread 1 action",
        body: "Old action body",
      },
      actorId: "u-admin",
      status: "DRAFT",
      confirmedBy: null,
      result: null,
      assistantThreadId: "thread-1",
    };
    server.use(
      http.get("*/actions", ({ request }) => {
        const threadId = new URL(request.url).searchParams.get("threadId");
        const actions = !threadId || threadId === "thread-1" ? [threadOneAction] : [];
        return HttpResponse.json(actions);
      }),
      http.post("*/assistant/threads", () =>
        HttpResponse.json({
          id: "thread-2",
          title: "Новый диалог",
          ideologyProfileId: "balanced",
          knowledgeSourceIds: ["documents"],
        }),
      ),
      http.get("*/assistant/threads/thread-2", () =>
        HttpResponse.json({
          thread: {
            id: "thread-2",
            title: "Новый диалог",
            ideologyProfileId: "balanced",
            knowledgeSourceIds: ["documents"],
          },
          messages: [],
          linkedDocumentIds: [],
        }),
      ),
    );

    render(
      <MemoryRouter
        initialEntries={["/documents/doc-1"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>,
    );

    await userEvent.type(
      screen.getByPlaceholderText(/электронная почта/i),
      "sokolov-d-a@example.com",
    );
    await userEvent.type(screen.getByPlaceholderText(/пароль/i), "demo");
    await userEvent.click(screen.getByRole("button", { name: /войти/i }));
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Policy Doc" })).toBeInTheDocument(),
    );
    await userEvent.click(screen.getByTestId("assistant-open-button"));

    const panel = await screen.findByTestId("assistant-panel");
    await waitFor(() =>
      expect(within(panel).getByText(/Действие: отправка письма/i)).toBeInTheDocument(),
    );
    await userEvent.click(within(panel).getByTestId("assistant-new-thread-button"));

    await waitFor(() =>
      expect(within(panel).queryByText(/Действие: отправка письма/i)).not.toBeInTheDocument(),
    );
  });

  it("cancels a draft action card from the assistant panel", async () => {
    queryClient.clear();
    const draftAction = {
      id: "act-cancel",
      intent: "send_email",
      entities: {
        type: "send_email",
        to: "volkova-e-v@example.com",
        subject: "Cancel action",
        body: "Cancel body",
      },
      actorId: "u-admin",
      status: "DRAFT",
      confirmedBy: null,
      result: null,
      assistantThreadId: "thread-1",
    };
    const cancelRequests: string[] = [];
    server.use(
      http.get("*/actions", () => HttpResponse.json([draftAction])),
      http.post("*/actions/act-cancel/cancel", () => {
        cancelRequests.push("act-cancel");
        return HttpResponse.json({ ...draftAction, status: "CANCELLED" });
      }),
    );

    render(
      <MemoryRouter
        initialEntries={["/documents/doc-1"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>,
    );

    await userEvent.type(
      screen.getByPlaceholderText(/электронная почта/i),
      "sokolov-d-a@example.com",
    );
    await userEvent.type(screen.getByPlaceholderText(/пароль/i), "demo");
    await userEvent.click(screen.getByRole("button", { name: /войти/i }));
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Policy Doc" })).toBeInTheDocument(),
    );
    await userEvent.click(screen.getByTestId("assistant-open-button"));

    const panel = await screen.findByTestId("assistant-panel");
    await waitFor(() =>
      expect(within(panel).getByText(/Действие: отправка письма/i)).toBeInTheDocument(),
    );
    within(panel).getByTestId("action-cancel-button").click();

    await waitFor(() => expect(cancelRequests).toHaveLength(1));
    await waitFor(() =>
      expect(within(panel).queryByText(/Действие: отправка письма/i)).not.toBeInTheDocument(),
    );
  });

  it("maps backend document statuses to UI labels", () => {
    expect(
      documentStatusLabel({
        documentId: "doc-1",
        title: "Policy Doc",
        fileName: "policy.txt",
        status: "PENDING",
        indexedChunkCount: 0,
        extractedTextLength: 120,
        indexedAt: null,
      }),
    ).toBe("Индексируется");

    expect(
      documentStatusLabel({
        documentId: "doc-1",
        title: "Policy Doc",
        fileName: "policy.txt",
        status: "INDEXED",
        indexedChunkCount: 2,
        extractedTextLength: 120,
        indexedAt: "2026-01-01T00:00:00Z",
      }),
    ).toBe("Готов");

    expect(
      documentStatusLabel({
        documentId: "doc-1",
        title: "Policy Doc",
        fileName: "policy.txt",
        status: "FAILED",
        indexedChunkCount: 0,
        extractedTextLength: 120,
        indexedAt: null,
      }),
    ).toBe("Ошибка индексации");
  });
});
