import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ActionCard } from "./ActionCard";
import { ToastProvider } from "../../shared/ui/ToastProvider";
import { server } from "../../test/setup";

function renderActionCard(overrides?: Partial<React.ComponentProps<typeof ActionCard>>) {
  const props = {
    id: "action-1",
    intent: "send_email",
    status: "DRAFT" as const,
    entities: {
      to: "test@example.com",
      subject: "Test subject",
      body: "Test body",
    },
    ...overrides,
  };
  return render(
    <ToastProvider>
      <ActionCard {...props} />
    </ToastProvider>,
  );
}

describe("ActionCard inline confirmation bar", () => {
  afterEach(() => cleanup());

  it("AC-F1: DRAFT card shows Отменить and Подтвердить buttons, no dialog", () => {
    renderActionCard();
    expect(screen.getByTestId("action-cancel-button")).toBeInTheDocument();
    expect(screen.getByTestId("action-confirm-button")).toBeInTheDocument();
    // No modal overlay present
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // Inline bar is not shown yet
    expect(screen.queryByTestId("inline-confirm-bar")).not.toBeInTheDocument();
  });

  it("AC-F2: clicking Подтвердить shows inline bar, hides buttons", async () => {
    const user = userEvent.setup();
    renderActionCard();
    await user.click(screen.getByTestId("action-confirm-button"));
    // Inline bar appears
    expect(screen.getByTestId("inline-confirm-bar")).toBeInTheDocument();
    expect(screen.getByText(/Вы уверены/)).toBeInTheDocument();
    expect(screen.getByTestId("inline-confirm-yes-button")).toBeInTheDocument();
    expect(screen.getByTestId("inline-confirm-cancel-button")).toBeInTheDocument();
    // No modal dialog
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // AC-F5: Отменить (draft-cancel) button is hidden while bar is open
    expect(screen.queryByTestId("action-cancel-button")).not.toBeInTheDocument();
  });

  it("AC-F3: clicking Отмена in inline bar restores button row, no API call", async () => {
    const user = userEvent.setup();
    const onSessionExpired = vi.fn();
    renderActionCard({ onSessionExpired });
    await user.click(screen.getByTestId("action-confirm-button"));
    expect(screen.getByTestId("inline-confirm-bar")).toBeInTheDocument();
    await user.click(screen.getByTestId("inline-confirm-cancel-button"));
    // Bar disappears
    expect(screen.queryByTestId("inline-confirm-bar")).not.toBeInTheDocument();
    // Buttons restored
    expect(screen.getByTestId("action-cancel-button")).toBeInTheDocument();
    expect(screen.getByTestId("action-confirm-button")).toBeInTheDocument();
  });

  it("AC-F4: clicking Да, подтвердить calls API, shows pending text, transitions on success", async () => {
    server.use(
      http.post("*/actions/action-1/confirm", async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return HttpResponse.json({
          id: "action-1",
          intent: "send_email",
          entities: { type: "send_email", to: "test@example.com", subject: "Test", body: "Test" },
          actorId: "u-admin",
          status: "EXECUTED",
          confirmedBy: "u-admin",
        });
      }),
    );
    const user = userEvent.setup();
    renderActionCard();
    await user.click(screen.getByTestId("action-confirm-button"));
    await user.click(screen.getByTestId("inline-confirm-yes-button"));
    // Pending state — button shows Выполнение…
    await waitFor(() =>
      expect(screen.getByTestId("inline-confirm-yes-button")).toHaveTextContent(/Выполнение/),
    );
    // After API resolves, bar disappears and status badge updates
    await waitFor(() => expect(screen.queryByTestId("inline-confirm-bar")).not.toBeInTheDocument());
  });

  it("keeps DRAFT and allows retry when confirm execution fails", async () => {
    let attempts = 0;
    server.use(
      http.post("*/actions/action-1/confirm", async () => {
        attempts += 1;
        if (attempts === 1) {
          return HttpResponse.json({ message: "SMTP временно недоступен" }, { status: 503 });
        }
        return HttpResponse.json({
          id: "action-1",
          intent: "send_email",
          entities: { type: "send_email", to: "test@example.com", subject: "Test", body: "Test" },
          actorId: "u-admin",
          status: "EXECUTED",
          confirmedBy: "u-admin",
        });
      }),
    );

    const user = userEvent.setup();
    renderActionCard();

    await user.click(screen.getByTestId("action-confirm-button"));
    await user.click(screen.getByTestId("inline-confirm-yes-button"));

    await waitFor(() =>
      expect(screen.getAllByText(/SMTP временно недоступен/i).length).toBeGreaterThan(0),
    );
    expect(screen.getByTestId("inline-confirm-bar")).toBeInTheDocument();
    expect(screen.getByTestId("action-status")).toHaveTextContent(/черновик/i);

    await user.click(screen.getByTestId("inline-confirm-yes-button"));
    await waitFor(() => expect(screen.queryByTestId("inline-confirm-bar")).not.toBeInTheDocument());
    expect(attempts).toBe(2);
    expect(screen.getByTestId("action-status")).toHaveTextContent(/выполнено/i);
  });
});

describe("ActionCard EXECUTED state", () => {
  afterEach(() => cleanup());

  it("AC-F6: EXECUTED card shows green Выполнено badge", () => {
    renderActionCard({ status: "EXECUTED" as const });
    const badge = screen.getByTestId("executed-badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("Выполнено");
    // Verify green styling token is present
    expect(badge).toHaveClass("bg-green-100");
    expect(badge).toHaveClass("text-green-700");
  });

  it("AC-F6: DRAFT card does not show executed badge", () => {
    renderActionCard({ status: "DRAFT" as const });
    expect(screen.queryByTestId("executed-badge")).not.toBeInTheDocument();
  });
});
