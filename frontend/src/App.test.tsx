import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

describe("auth smoke", () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
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

    await userEvent.type(screen.getByPlaceholderText(/электронная почта/i), "admin@dmis.local");
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
    expect(screen.getByRole("button", { name: /спросить ai/i })).toBeInTheDocument();
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

    await userEvent.type(screen.getByPlaceholderText(/электронная почта/i), "admin@dmis.local");
    await userEvent.type(screen.getByPlaceholderText(/пароль/i), "demo");
    await userEvent.click(screen.getByRole("button", { name: /войти/i }));

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Policy Doc" })).toBeInTheDocument(),
    );
    await userEvent.click(screen.getByRole("button", { name: /создать встречу/i }));
    await userEvent.type(
      screen.getByPlaceholderText(/email или @username через запятую/i),
      "@analyst",
    );
    await userEvent.click(screen.getByRole("button", { name: /^создать draft$/i }));

    await waitFor(() => expect(screen.getByText(/черновик встречи создан/i)).toBeInTheDocument());

    await waitFor(() =>
      expect(screen.getByText("Краткий ответ AI для подготовки письма.")).toBeInTheDocument(),
    );
    await userEvent.click(screen.getByRole("button", { name: /создать письмо из ответа ai/i }));
    await userEvent.type(screen.getByLabelText(/получатель письма из ответа ai/i), "@analyst");
    await userEvent.click(screen.getByRole("button", { name: /^создать draft$/i }));

    await waitFor(() => expect(screen.getByText(/черновик действия создан/i)).toBeInTheDocument());
    expect(screen.getByText(/Действие: send_email/)).toBeInTheDocument();

    const confirmButtons = screen.getAllByRole("button", { name: /подтвердить/i });
    await userEvent.click(confirmButtons[confirmButtons.length - 1]!);
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /подтвердить действие/i })).toBeInTheDocument(),
    );
    const dialogConfirmButtons = screen.getAllByRole("button", { name: /подтвердить/i });
    await userEvent.click(dialogConfirmButtons[dialogConfirmButtons.length - 1]!);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /выполнить/i })).toBeInTheDocument(),
    );
    await userEvent.click(screen.getByRole("button", { name: /выполнить/i }));
    await waitFor(() => expect(screen.getByText(/действие выполнено/i)).toBeInTheDocument());
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

    await userEvent.type(screen.getByPlaceholderText(/электронная почта/i), "user@dmis.local");
    await userEvent.type(screen.getByPlaceholderText(/пароль/i), "demo");
    await userEvent.click(screen.getByRole("button", { name: /войти/i }));

    await waitFor(() =>
      expect(screen.getAllByRole("button", { name: /документы/i }).length).toBeGreaterThan(0),
    );
    expect(screen.queryByRole("button", { name: /RAG-ассистент/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Мои AI-действия/i })).toBeInTheDocument();
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

  it("renders inbox list, opens detail, exposes reply via AI button", async () => {
    render(
      <MemoryRouter
        initialEntries={["/mail"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>,
    );

    await userEvent.type(screen.getByPlaceholderText(/электронная почта/i), "admin@dmis.local");
    await userEvent.type(screen.getByPlaceholderText(/пароль/i), "demo");
    await userEvent.click(screen.getByRole("button", { name: /войти/i }));

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /^почта$/i })).toBeInTheDocument(),
    );

    const subject = await screen.findByText(/Hello from Alice/);
    await userEvent.click(subject);

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /Hello from Alice/ })).toBeInTheDocument(),
    );
    expect(screen.getByText(/Нужно обсудить контракт на следующей неделе\./)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /ответить на письмо через AI-ассистента/i }),
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

    await userEvent.type(screen.getByPlaceholderText(/электронная почта/i), "admin@dmis.local");
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
      "bob@dmis.local, carol@dmis.local",
    );
    await userEvent.type(screen.getByLabelText(/начало события/i), "2026-05-01T12:00");
    await userEvent.type(screen.getByLabelText(/окончание события/i), "2026-05-01T13:00");
    await userEvent.click(screen.getByRole("button", { name: /^создать$/i }));

    await waitFor(() => expect(screen.getByText("Синк команды")).toBeInTheDocument());

    const editButtons = screen.getAllByRole("button", { name: /изменить/i });
    await userEvent.click(editButtons[0]!);
    const titleInput = screen.getByLabelText(/название события/i);
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "Синк команды (обновлено)");
    await userEvent.click(screen.getByRole("button", { name: /сохранить/i }));

    await waitFor(() => expect(screen.getByText("Синк команды (обновлено)")).toBeInTheDocument());

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
    await userEvent.type(screen.getByPlaceholderText(/электронная почта/i), "admin@dmis.local");
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
