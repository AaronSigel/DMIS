import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { server } from "../../test/setup";
import { AuditPage, deriveActionType, deriveAuditStatus } from "./AuditPage";

const adminUser = {
  id: "u-admin",
  fullName: "Соколов Дмитрий Алексеевич",
  email: "sokolov-d-a@example.com",
  roles: ["ADMIN"],
};

const baseRecord = {
  id: "rec-1",
  at: "2026-05-31T10:00:00Z",
  actorId: "u-admin",
  resourceType: "ai_action",
  resourceId: "3f6c1234-5678-90ab-cdef-000000000001",
  details: "Draft created",
};

function makeClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function renderPage(token = "token-1", user = adminUser) {
  const client = makeClient();
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <AuditPage
          token={token}
          user={user}
          onSessionExpired={() => {}}
          onTokenRefresh={() => {}}
        />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  cleanup();
});

// ── Pure function unit tests ──────────────────────────────────────────────────

describe("deriveActionType", () => {
  it("returns ИИ for action.* prefix", () => {
    expect(deriveActionType("action.draft").label).toBe("ИИ");
    expect(deriveActionType("action.execute").label).toBe("ИИ");
  });
  it("returns система for mail.* prefix", () => {
    expect(deriveActionType("mail.send").label).toBe("система");
  });
  it("returns система for calendar.* prefix", () => {
    expect(deriveActionType("calendar.event.create").label).toBe("система");
  });
  it("returns система for document.* prefix", () => {
    expect(deriveActionType("document.upload").label).toBe("система");
  });
  it("returns система for rag.* prefix", () => {
    expect(deriveActionType("rag.answer.request").label).toBe("система");
  });
  it("returns админ for admin.* prefix", () => {
    expect(deriveActionType("admin.user.delete").label).toBe("админ");
  });
  it("returns пользователь for unknown prefix", () => {
    expect(deriveActionType("unknown.thing").label).toBe("пользователь");
    expect(deriveActionType("").label).toBe("пользователь");
  });
});

describe("deriveAuditStatus", () => {
  it("returns успешно for SUCCESS", () => {
    expect(deriveAuditStatus("SUCCESS").label).toBe("успешно");
  });
  it("returns успешно for null", () => {
    expect(deriveAuditStatus(null).label).toBe("успешно");
  });
  it("returns успешно for undefined", () => {
    expect(deriveAuditStatus(undefined).label).toBe("успешно");
  });
  it("returns ошибка for ERROR", () => {
    expect(deriveAuditStatus("ERROR").label).toBe("ошибка");
  });
  it("returns ожидает for PENDING", () => {
    expect(deriveAuditStatus("PENDING").label).toBe("ожидает");
  });
  it("returns отменено for CANCELLED", () => {
    expect(deriveAuditStatus("CANCELLED").label).toBe("отменено");
  });
});

// ── RTL integration tests ─────────────────────────────────────────────────────

describe("AuditPage — action localization and type/status badges", () => {
  it("shows Russian label 'черновик действия' instead of 'action.draft'", async () => {
    server.use(
      http.get("*/audit", () => HttpResponse.json([{ ...baseRecord, action: "action.draft" }])),
      http.get("*/users", () => HttpResponse.json([])),
    );
    renderPage();
    await waitFor(() =>
      expect(screen.getAllByText("черновик действия").length).toBeGreaterThanOrEqual(1),
    );
    expect(screen.queryByText("action.draft")).not.toBeInTheDocument();
  });

  it("renders ИИ badge for action.draft", async () => {
    server.use(
      http.get("*/audit", () => HttpResponse.json([{ ...baseRecord, action: "action.draft" }])),
      http.get("*/users", () => HttpResponse.json([])),
    );
    renderPage();
    await waitFor(() => expect(screen.getByText("ИИ")).toBeInTheDocument());
  });

  it("renders система badge for mail.send", async () => {
    server.use(
      http.get("*/audit", () => HttpResponse.json([{ ...baseRecord, action: "mail.send" }])),
      http.get("*/users", () => HttpResponse.json([])),
    );
    renderPage();
    await waitFor(() => expect(screen.getByText("система")).toBeInTheDocument());
  });

  it("renders успешно badge when status is absent", async () => {
    server.use(
      http.get("*/audit", () => HttpResponse.json([{ ...baseRecord, action: "action.draft" }])),
      http.get("*/users", () => HttpResponse.json([])),
    );
    renderPage();
    await waitFor(() => expect(screen.getByText("успешно")).toBeInTheDocument());
  });

  it("renders ошибка badge for ERROR status", async () => {
    server.use(
      http.get("*/audit", () =>
        HttpResponse.json([{ ...baseRecord, action: "action.execute", status: "ERROR" }]),
      ),
      http.get("*/users", () => HttpResponse.json([])),
    );
    renderPage();
    await waitFor(() => expect(screen.getByText("ошибка")).toBeInTheDocument());
  });
});

describe("AuditPage — UUID truncation and expandable rows", () => {
  it("shows truncated UUID in resource column", async () => {
    server.use(
      http.get("*/audit", () =>
        HttpResponse.json([
          {
            ...baseRecord,
            action: "action.draft",
            resourceId: "3f6c1234-5678-90ab-cdef-000000000001",
          },
        ]),
      ),
      http.get("*/users", () => HttpResponse.json([])),
    );
    renderPage();
    // Full UUID must not appear as a text node; truncated form must appear
    await waitFor(() => expect(screen.getByText(/^…\w{8}$/)).toBeInTheDocument());
    expect(screen.queryByText("3f6c1234-5678-90ab-cdef-000000000001")).not.toBeInTheDocument();
  });

  it("shows em-dash when resourceId is empty", async () => {
    server.use(
      http.get("*/audit", () =>
        HttpResponse.json([{ ...baseRecord, action: "action.draft", resourceId: "" }]),
      ),
      http.get("*/users", () => HttpResponse.json([])),
    );
    renderPage();
    await waitFor(() => expect(screen.getByText("—")).toBeInTheDocument());
  });

  it("expands detail row on toggle click and collapses on second click", async () => {
    const user = userEvent.setup();
    server.use(
      http.get("*/audit", () =>
        HttpResponse.json([
          {
            ...baseRecord,
            action: "action.draft",
            resourceId: "3f6c1234-5678-90ab-cdef-000000000001",
          },
        ]),
      ),
      http.get("*/users", () => HttpResponse.json([])),
    );
    renderPage();

    // Wait for the row to appear
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Показать детали/i })).toBeInTheDocument(),
    );

    // Detail pre block should not yet be visible
    expect(screen.queryByText(/"resourceId"/)).not.toBeInTheDocument();

    // Expand
    await user.click(screen.getByRole("button", { name: /Показать детали/i }));
    await waitFor(() => expect(screen.getByText(/"resourceId"/)).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /Скрыть детали/i })).toBeInTheDocument();

    // Collapse
    await user.click(screen.getByRole("button", { name: /Скрыть детали/i }));
    await waitFor(() => expect(screen.queryByText(/"resourceId"/)).not.toBeInTheDocument());
  });
});

describe("AuditPage — date range filter", () => {
  it("shows dropdown with default 'Всё время' option", async () => {
    server.use(
      http.get("*/audit", () => HttpResponse.json([])),
      http.get("*/users", () => HttpResponse.json([])),
    );
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole("combobox", { name: /Фильтр по дате/i })).toBeInTheDocument(),
    );
    expect(
      (screen.getByRole("combobox", { name: /Фильтр по дате/i }) as HTMLSelectElement).value,
    ).toBe("all");
  });

  it("filters out old records when 'Сегодня' is selected", async () => {
    const oldRecord = {
      ...baseRecord,
      id: "rec-old",
      at: "2020-01-01T00:00:00Z", // definitely before today
      action: "action.draft",
    };
    const todayRecord = {
      ...baseRecord,
      id: "rec-today",
      at: new Date().toISOString(), // now
      action: "action.confirm",
    };
    server.use(
      http.get("*/audit", () => HttpResponse.json([oldRecord, todayRecord])),
      http.get("*/users", () => HttpResponse.json([])),
    );
    renderPage();

    // Both visible under "all"
    await waitFor(() =>
      expect(screen.getAllByText("черновик действия").length).toBeGreaterThanOrEqual(1),
    );
    expect(screen.getAllByText("подтверждение действия").length).toBeGreaterThanOrEqual(1);

    // Switch to "Сегодня"
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: /Фильтр по дате/i }),
      "today",
    );

    // After filtering, "черновик действия" should only appear in the dropdown option (not as a table row)
    // The old record (2020) is filtered out — only the today record remains
    await waitFor(() => {
      // The old draft row is gone; only dropdown option may remain
      const matches = screen.queryAllByText("черновик действия");
      // Should be at most in dropdown only (0 or 1 option element), not in a table <td>
      const inTable = matches.filter((el) => el.closest("td") !== null);
      expect(inTable.length).toBe(0);
    });
    expect(screen.getAllByText("подтверждение действия").length).toBeGreaterThanOrEqual(1);
  });

  it("ANDs date filter with action filter", async () => {
    const oldDraft = {
      ...baseRecord,
      id: "rec-old-draft",
      at: "2020-01-01T00:00:00Z",
      action: "action.draft",
    };
    const todayDraft = {
      ...baseRecord,
      id: "rec-today-draft",
      at: new Date().toISOString(),
      action: "action.draft",
    };
    const todayConfirm = {
      ...baseRecord,
      id: "rec-today-confirm",
      at: new Date().toISOString(),
      action: "action.confirm",
    };
    server.use(
      http.get("*/audit", () => HttpResponse.json([oldDraft, todayDraft, todayConfirm])),
      http.get("*/users", () => HttpResponse.json([])),
    );
    renderPage();

    await waitFor(() => {
      // 2 rows + up to 1 dropdown option = 3 total; just confirm 2 table rows exist
      const inTable = screen
        .getAllByText("черновик действия")
        .filter((el) => el.closest("td") !== null);
      expect(inTable.length).toBe(2);
    });

    // Apply action filter to "action.draft"
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: /Фильтр по действию/i }),
      "action.draft",
    );
    // Apply date filter to "Сегодня"
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: /Фильтр по дате/i }),
      "today",
    );

    // Only todayDraft survives both filters — 1 table row remaining
    await waitFor(() => {
      const inTable = screen
        .getAllByText("черновик действия")
        .filter((el) => el.closest("td") !== null);
      expect(inTable.length).toBe(1);
    });
    // подтверждение действия should not be in any table cell
    const confirmInTable = screen
      .queryAllByText("подтверждение действия")
      .filter((el) => el.closest("td") !== null);
    expect(confirmInTable.length).toBe(0);
  });
});
