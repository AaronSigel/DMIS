import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClientProvider } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";
import { DashboardPage } from "./DashboardPage";
import { server } from "../test/setup";

// Re-usable mock navigate — must be set up before module imports resolve
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => mockNavigate };
});

function makeClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

const defaultProps = {
  token: "test-token",
  onSessionExpired: vi.fn(),
  onTokenRefresh: vi.fn(),
};

afterEach(() => {
  cleanup();
  mockNavigate.mockReset();
});

describe("DashboardPage — clickable cards", () => {
  beforeEach(() => {
    server.use(
      http.get("*/actions", () => HttpResponse.json([])),
      http.get("*/audit", () => HttpResponse.json([])),
      http.get("*/health", () => HttpResponse.json({ status: "ok" })),
      http.get("*/documents", () =>
        HttpResponse.json({ content: [], totalElements: 0, totalPages: 1, page: 0, size: 1 }),
      ),
      http.get("*/calendar/events", () => HttpResponse.json([])),
    );
  });

  it("navigates to /documents when Documents card is clicked", async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <QueryClientProvider client={makeClient()}>
          <DashboardPage {...defaultProps} />
        </QueryClientProvider>
      </MemoryRouter>,
    );

    const card = await screen.findByRole("button", { name: /документы/i });
    await userEvent.click(card);
    expect(mockNavigate).toHaveBeenCalledWith("/documents");
  });

  it("navigates to /audit when AI Actions card is clicked", async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <QueryClientProvider client={makeClient()}>
          <DashboardPage {...defaultProps} />
        </QueryClientProvider>
      </MemoryRouter>,
    );

    const card = await screen.findByRole("button", { name: /ии-действия/i });
    await userEvent.click(card);
    expect(mockNavigate).toHaveBeenCalledWith("/audit");
  });

  it("navigates to /audit when Audit Events card is clicked", async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <QueryClientProvider client={makeClient()}>
          <DashboardPage {...defaultProps} />
        </QueryClientProvider>
      </MemoryRouter>,
    );

    const card = await screen.findByRole("button", { name: /аудит-события/i });
    await userEvent.click(card);
    expect(mockNavigate).toHaveBeenCalledWith("/audit");
  });

  it("navigates to /calendar when Calendar Events card is clicked", async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <QueryClientProvider client={makeClient()}>
          <DashboardPage {...defaultProps} />
        </QueryClientProvider>
      </MemoryRouter>,
    );

    const card = await screen.findByRole("button", { name: /события календаря/i });
    await userEvent.click(card);
    expect(mockNavigate).toHaveBeenCalledWith("/calendar");
  });

  it("System Health card is NOT a button and has no click handler", async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <QueryClientProvider client={makeClient()}>
          <DashboardPage {...defaultProps} />
        </QueryClientProvider>
      </MemoryRouter>,
    );

    // Wait for the page to settle
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: /состояние системы/i })).not.toBeInTheDocument(),
    );
    // The static card should still be visible as text
    expect(screen.getByText("Состояние системы")).toBeInTheDocument();
  });
});

describe("DashboardPage — pending confirmations block", () => {
  it("renders section with localized intents when DRAFT actions exist", async () => {
    server.use(
      http.get("*/actions", ({ request }) => {
        // dashboard metrics query (no threadId) and draft-actions query both hit this endpoint
        return HttpResponse.json([
          {
            id: "act-draft-1",
            intent: "send_email",
            entities: { to: "alice@example.com" },
            actorId: "u-admin",
            status: "DRAFT",
            confirmedBy: null,
            result: null,
            assistantThreadId: null,
          },
          {
            id: "act-draft-2",
            intent: "create_calendar_event",
            entities: { title: "Синк команды" },
            actorId: "u-admin",
            status: "DRAFT",
            confirmedBy: null,
            result: null,
            assistantThreadId: null,
          },
          {
            id: "act-exec-1",
            intent: "send_email",
            entities: {},
            actorId: "u-admin",
            status: "EXECUTED",
            confirmedBy: "u-admin",
            result: null,
            assistantThreadId: null,
          },
        ]);
      }),
      http.get("*/audit", () => HttpResponse.json([])),
      http.get("*/health", () => HttpResponse.json({ status: "ok" })),
      http.get("*/documents", () =>
        HttpResponse.json({ content: [], totalElements: 0, totalPages: 1, page: 0, size: 1 }),
      ),
      http.get("*/calendar/events", () => HttpResponse.json([])),
    );

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <QueryClientProvider client={makeClient()}>
          <DashboardPage {...defaultProps} />
        </QueryClientProvider>
      </MemoryRouter>,
    );

    // Section heading
    await screen.findByText("Ожидают подтверждения");

    // Localized intent labels (from localizeIntent)
    expect(screen.getByText("отправка письма")).toBeInTheDocument();
    expect(screen.getByText("создание встречи")).toBeInTheDocument();

    // EXECUTED action must NOT appear in draft section
    // (it is only counted in the metrics, not listed)
    const draftLinks = screen.getAllByRole("button", { name: /перейти/i });
    expect(draftLinks).toHaveLength(2);
  });

  it("hides the section when there are no DRAFT actions", async () => {
    server.use(
      http.get("*/actions", () =>
        HttpResponse.json([
          {
            id: "act-exec-1",
            intent: "send_email",
            entities: {},
            actorId: "u-admin",
            status: "EXECUTED",
            confirmedBy: "u-admin",
            result: null,
            assistantThreadId: null,
          },
        ]),
      ),
      http.get("*/audit", () => HttpResponse.json([])),
      http.get("*/health", () => HttpResponse.json({ status: "ok" })),
      http.get("*/documents", () =>
        HttpResponse.json({ content: [], totalElements: 0, totalPages: 1, page: 0, size: 1 }),
      ),
      http.get("*/calendar/events", () => HttpResponse.json([])),
    );

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <QueryClientProvider client={makeClient()}>
          <DashboardPage {...defaultProps} />
        </QueryClientProvider>
      </MemoryRouter>,
    );

    // Let the page settle; section must never appear
    await waitFor(() =>
      expect(screen.queryByText("Ожидают подтверждения")).not.toBeInTheDocument(),
    );
  });

  it("hides section on fetch error without showing error UI", async () => {
    server.use(
      http.get("*/actions", () => HttpResponse.error()),
      http.get("*/audit", () => HttpResponse.json([])),
      http.get("*/health", () => HttpResponse.json({ status: "ok" })),
      http.get("*/documents", () =>
        HttpResponse.json({ content: [], totalElements: 0, totalPages: 1, page: 0, size: 1 }),
      ),
      http.get("*/calendar/events", () => HttpResponse.json([])),
    );

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <QueryClientProvider client={makeClient()}>
          <DashboardPage {...defaultProps} />
        </QueryClientProvider>
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(screen.queryByText("Ожидают подтверждения")).not.toBeInTheDocument(),
    );
  });

  it("shows max 5 items and appends overflow count line", async () => {
    const drafts = Array.from({ length: 7 }, (_, i) => ({
      id: `act-d-${i}`,
      intent: "send_email",
      entities: { to: `user${i}@example.com` },
      actorId: "u-admin",
      status: "DRAFT",
      confirmedBy: null,
      result: null,
      assistantThreadId: null,
    }));

    server.use(
      http.get("*/actions", () => HttpResponse.json(drafts)),
      http.get("*/audit", () => HttpResponse.json([])),
      http.get("*/health", () => HttpResponse.json({ status: "ok" })),
      http.get("*/documents", () =>
        HttpResponse.json({ content: [], totalElements: 0, totalPages: 1, page: 0, size: 1 }),
      ),
      http.get("*/calendar/events", () => HttpResponse.json([])),
    );

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <QueryClientProvider client={makeClient()}>
          <DashboardPage {...defaultProps} />
        </QueryClientProvider>
      </MemoryRouter>,
    );

    await screen.findByText("Ожидают подтверждения");
    const links = screen.getAllByRole("button", { name: /перейти/i });
    expect(links).toHaveLength(5);
    expect(screen.getByText("+ 2 ещё")).toBeInTheDocument();
  });

  it("clicking Перейти navigates to /audit", async () => {
    server.use(
      http.get("*/actions", () =>
        HttpResponse.json([
          {
            id: "act-draft-nav",
            intent: "send_email",
            entities: {},
            actorId: "u-admin",
            status: "DRAFT",
            confirmedBy: null,
            result: null,
            assistantThreadId: null,
          },
        ]),
      ),
      http.get("*/audit", () => HttpResponse.json([])),
      http.get("*/health", () => HttpResponse.json({ status: "ok" })),
      http.get("*/documents", () =>
        HttpResponse.json({ content: [], totalElements: 0, totalPages: 1, page: 0, size: 1 }),
      ),
      http.get("*/calendar/events", () => HttpResponse.json([])),
    );

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <QueryClientProvider client={makeClient()}>
          <DashboardPage {...defaultProps} />
        </QueryClientProvider>
      </MemoryRouter>,
    );

    await screen.findByText("Ожидают подтверждения");
    await userEvent.click(screen.getByRole("button", { name: /перейти/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/audit");
  });
});
