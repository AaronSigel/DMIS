import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
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
    expect(window.localStorage.getItem("dmis_token")).toBe("token-1");
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
    expect(screen.queryByRole("button", { name: /AI-действия/i })).not.toBeInTheDocument();
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

    await waitFor(() => {
      const params = new URLSearchParams(window.location.search);
      expect(params.get("indexed")).toBe("1");
      expect(params.get("sort")).toBe("oldest");
      expect(params.get("page")).toBeNull();
    });
  });
});
