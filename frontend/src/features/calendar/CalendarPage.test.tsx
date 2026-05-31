import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CalendarPage } from "./CalendarPage";
import { ToastProvider } from "../../shared/ui/ToastProvider";
import { server } from "../../test/setup";
import { http, HttpResponse } from "msw";

// Minimal stub so React Query doesn't hit real network
function makeClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function renderCalendar() {
  const client = makeClient();
  return render(
    <QueryClientProvider client={client}>
      <ToastProvider>
        <MemoryRouter>
          <CalendarPage token="test-token" onSessionExpired={() => {}} onTokenRefresh={() => {}} />
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  server.use(http.get("*/calendar/events", () => HttpResponse.json([])));
});

afterEach(() => {
  cleanup();
});

// ── AC-E1 ────────────────────────────────────────────────────────────────────
describe("AC-E1: create form hidden by default", () => {
  it("does NOT show the create form on initial render", async () => {
    renderCalendar();
    // The form's "Название" input is only present when composeOpen === true
    expect(screen.queryByLabelText(/название события/i)).not.toBeInTheDocument();
  });

  it("shows '+ Создать событие' button on initial render", async () => {
    renderCalendar();
    expect(screen.getByRole("button", { name: /создать событие/i })).toBeInTheDocument();
  });
});

// ── AC-E2 ────────────────────────────────────────────────────────────────────
describe("AC-E2: clicking '+ Создать событие' expands the form", () => {
  it("shows the create form after clicking the button", async () => {
    renderCalendar();
    await userEvent.click(screen.getByRole("button", { name: /создать событие/i }));
    expect(screen.getByLabelText(/название события/i)).toBeInTheDocument();
  });

  it("shows 'Скрыть форму' control after clicking create button", async () => {
    renderCalendar();
    await userEvent.click(screen.getByRole("button", { name: /создать событие/i }));
    expect(screen.getByText(/скрыть форму/i)).toBeInTheDocument();
  });
});

// ── AC-E3 ────────────────────────────────────────────────────────────────────
describe("AC-E3: clicking an event closes the compose form", () => {
  it("closes the create form when an event is selected in month view", async () => {
    server.use(
      http.get("*/calendar/events", () =>
        HttpResponse.json([
          {
            id: "ev-test",
            title: "Тест событие",
            attendees: ["alice@example.com"],
            startIso: new Date().toISOString(),
            endIso: new Date(Date.now() + 3600000).toISOString(),
            createdBy: "u-1",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            description: "",
            creationSource: "UI",
            sourceMailMessageId: null,
            participants: [],
            attachments: [],
          },
        ]),
      ),
    );

    renderCalendar();

    // Open the create form first
    await userEvent.click(screen.getByRole("button", { name: /создать событие/i }));
    expect(screen.getByLabelText(/название события/i)).toBeInTheDocument();

    // Switch to month view so the event button appears
    await userEvent.click(screen.getByRole("button", { name: /месяц/i }));

    // Click the event card — form should close
    const eventButton = await screen.findByRole("button", { name: /Тест событие/i });
    await userEvent.click(eventButton);

    expect(screen.queryByLabelText(/название события/i)).not.toBeInTheDocument();
  });
});

// ── AC-E4 ────────────────────────────────────────────────────────────────────
describe("AC-E4: period header shows DD.MM.YYYY dates", () => {
  it("renders period dates in dd.mm.yyyy format, not MM/DD/YYYY", async () => {
    renderCalendar();

    // The period header is always rendered (listRange is always non-null).
    // Switch to month view so the date range is a full month — easier to assert.
    await userEvent.click(screen.getByRole("button", { name: /месяц/i }));

    // The header text contains " · период " followed by two dates.
    // A correct dd.mm.yyyy date like 01.05.2026 will match /\d{2}\.\d{2}\.\d{4}/.
    // An incorrect MM/DD/YYYY date like 5/1/2026 would NOT match.
    const header = await screen.findByText(/период/i);
    expect(header.textContent).toMatch(/период \d{2}\.\d{2}\.\d{4} — \d{2}\.\d{2}\.\d{4}/);
  });

  it("does not show 'undefined' or 'NaN' in the period header", async () => {
    renderCalendar();
    // Check the muted span that holds the source/period label
    const periodSpans = screen.getAllByText(/источник данных/i);
    for (const span of periodSpans) {
      expect(span.textContent).not.toContain("undefined");
      expect(span.textContent).not.toContain("NaN");
      expect(span.textContent).not.toContain("Invalid");
    }
  });
});
