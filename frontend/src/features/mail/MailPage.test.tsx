import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, expect, it, vi } from "vitest";
import { MailPage } from "./MailPage";

afterEach(() => {
  cleanup();
});

// Mock all API calls
vi.mock("../../apiClient", () => ({
  apiListMailMessages: vi.fn().mockResolvedValue([
    {
      id: "1",
      from: "a@b.com",
      to: "c@d.com",
      subject: "Test",
      preview: "hi",
      sentAtIso: new Date().toISOString(),
      hasAttachments: false,
      draft: false,
    },
    {
      id: "2",
      from: "e@f.com",
      to: "c@d.com",
      subject: "Test 2",
      preview: "ho",
      sentAtIso: new Date().toISOString(),
      hasAttachments: false,
      draft: false,
    },
    {
      id: "3",
      from: "g@h.com",
      to: "c@d.com",
      subject: "Test 3",
      preview: "ha",
      sentAtIso: new Date().toISOString(),
      hasAttachments: false,
      draft: false,
    },
  ]),
  apiSearchMailMessages: vi.fn().mockResolvedValue({ messages: [] }),
  apiCreateMailDraft: vi.fn(),
  apiUpdateMailDraft: vi.fn(),
  apiSendMailDraft: vi.fn(),
  apiReplyDraft: vi.fn(),
  apiForwardDraft: vi.fn(),
  apiMailThreadSummary: vi.fn(),
  apiGetMailMessage: vi.fn(),
  apiDownloadMailAttachment: vi.fn(),
  apiSaveMailAttachmentToDocuments: vi.fn(),
}));

// Mock uiStore
vi.mock("../../shared/store/uiStore", () => ({
  useUiStore: () => ({ openAiWithQuery: vi.fn() }),
}));

// Mock toast
vi.mock("../../shared/ui/ToastProvider", () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }),
}));

function renderMailPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <MailPage token="tok" onSessionExpired={() => {}} onTokenRefresh={() => {}} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

it("shows message count badge on the active (INBOX) folder", async () => {
  renderMailPage();
  // After list loads, INBOX is active and should show "(3)"
  const badge = await screen.findByText("(3)");
  expect(badge).toBeInTheDocument();
});

it("does not show a count badge on inactive folders", async () => {
  renderMailPage();
  // Wait for messages to load (badge appears on active folder)
  await screen.findByText("(3)");

  // Check that SENT folder button does not contain a count badge
  const sentButton = screen.getByRole("button", { name: /Отправленные/ });
  // The button text should be just "Отправленные" — no "(N)" inside
  expect(sentButton.textContent).toBe("Отправленные");
});

it("does not show count badge while loading", () => {
  // This test is harder to assert in isolation without controlling isPending.
  // We assert the badge is absent when the list is in a pending state (before data resolves).
  renderMailPage();
  // Synchronously, before any async resolution, badge "(3)" should not appear
  expect(screen.queryByText("(3)")).toBeNull();
});
