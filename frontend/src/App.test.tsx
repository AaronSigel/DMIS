import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import { documentStatusLabel } from "./features/assistant/AiPanel";
import { useUiStore } from "./shared/store/uiStore";

describe("auth smoke", () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    useUiStore.setState({
      desktopAiOpen: false,
      assistantQuery: "",
      pendingLinkedDocumentIds: [],
      assistantContext: { module: "workspace", object: null },
    });
  });

  it("signs in and opens document card", async () => {
    render(
      <MemoryRouter
        initialEntries={["/documents"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>,
    );

    await userEvent.type(screen.getByPlaceholderText(/электронная почта/i), "admin@example.com");
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

  it("creates action drafts from document and assistant hooks", async () => {
    render(
      <MemoryRouter
        initialEntries={["/documents/doc-1"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>,
    );

    await userEvent.type(screen.getByPlaceholderText(/электронная почта/i), "admin@example.com");
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

    await userEvent.type(screen.getByPlaceholderText(/электронная почта/i), "admin@example.com");
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

    await userEvent.type(screen.getByPlaceholderText(/электронная почта/i), "user@example.com");
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

    // Заглушечные настройки не должны выглядеть интерактивными.
    await userEvent.click(screen.getByRole("button", { name: /настройки/i }));
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /настройки/i })).toBeInTheDocument(),
    );
    for (const btn of screen.getAllByRole("button", { name: "Скоро" })) {
      expect(btn).toBeDisabled();
    }
  });
});

describe("mail page", () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    window.history.replaceState({}, "", "/");
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

    await userEvent.type(screen.getByPlaceholderText(/электронная почта/i), "admin@example.com");
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

    await userEvent.type(screen.getByPlaceholderText(/электронная почта/i), "admin@example.com");
    await userEvent.type(screen.getByPlaceholderText(/пароль/i), "demo");
    await userEvent.click(screen.getByRole("button", { name: /войти/i }));

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /^календарь$/i })).toBeInTheDocument(),
    );

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

    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const deleteButtons = screen.getAllByRole("button", { name: /удалить/i });
    await userEvent.click(deleteButtons[0]!);
    await waitFor(() =>
      expect(screen.queryByText("Синк команды (обновлено)")).not.toBeInTheDocument(),
    );
    confirmSpy.mockRestore();
  });
});

describe("doc table url filters", () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  async function loginAsAdmin() {
    await userEvent.type(screen.getByPlaceholderText(/электронная почта/i), "admin@example.com");
    await userEvent.type(screen.getByPlaceholderText(/пароль/i), "demo");
    await userEvent.click(screen.getByRole("button", { name: /войти/i }));
  }

  it("restores filter and sort state from query string", async () => {
    window.history.pushState({}, "", "/documents?indexed=1&sort=oldest&page=2");

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );

    await loginAsAdmin();

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /фильтр: проиндексированные/i }),
      ).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: /сортировка: старые/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^архив$/i })).toBeInTheDocument();

    const params = new URLSearchParams(window.location.search);
    expect(params.get("indexed")).toBe("1");
    expect(params.get("sort")).toBe("oldest");
    expect(params.get("page")).toBe("2");
  });

  it("updates query string when filter and sort are toggled", async () => {
    window.history.pushState({}, "", "/documents");

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );

    await loginAsAdmin();
    await waitFor(() => expect(screen.getByText("Policy Doc")).toBeInTheDocument());

    await userEvent.click(screen.getByRole("button", { name: /^фильтр$/i }));
    await userEvent.click(screen.getByRole("button", { name: /сортировка: новые/i }));
    await userEvent.click(screen.getByRole("button", { name: /^архив$/i }));

    await waitFor(() => {
      const params = new URLSearchParams(window.location.search);
      expect(params.get("indexed")).toBe("1");
      expect(params.get("sort")).toBe("oldest");
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
      pendingLinkedDocumentIds: [],
      assistantContext: { module: "workspace", object: null },
    });
  });

  it("shows context card on document page", async () => {
    render(
      <MemoryRouter
        initialEntries={["/documents/doc-1"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>,
    );

    await userEvent.type(screen.getByPlaceholderText(/электронная почта/i), "admin@example.com");
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

    await userEvent.type(screen.getByPlaceholderText(/электронная почта/i), "admin@example.com");
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

    await userEvent.type(screen.getByPlaceholderText(/электронная почта/i), "admin@example.com");
    await userEvent.type(screen.getByPlaceholderText(/пароль/i), "demo");
    await userEvent.click(screen.getByRole("button", { name: /войти/i }));

    await waitFor(() => expect(screen.getByText("Policy Doc")).toBeInTheDocument());
    await userEvent.click(screen.getByTestId("assistant-open-button"));
    const panel = await screen.findByTestId("assistant-panel");
    await userEvent.click(within(panel).getByTestId("assistant-suggestion-find-doc"));

    await waitFor(() => expect(within(panel).getByTestId("assistant-answer")).toBeInTheDocument());
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

    await userEvent.type(screen.getByPlaceholderText(/электронная почта/i), "admin@example.com");
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
