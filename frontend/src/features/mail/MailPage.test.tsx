import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MailPage } from "./MailPage";
import { apiGetMailMessage, apiMailThreadSummary, apiReplyDraft } from "../../apiClient";

const toastMocks = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
};

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
  useToast: () => toastMocks,
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

beforeEach(() => {
  toastMocks.success.mockReset();
  toastMocks.error.mockReset();
  toastMocks.info.mockReset();

  vi.mocked(apiGetMailMessage).mockResolvedValue({
    id: "1",
    from: "a@b.com",
    to: "c@d.com",
    subject: "Test",
    body: "Body",
    sentAtIso: new Date().toISOString(),
    attachments: [],
  });
});

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

it("opens shared confirm dialog before sending from compose", async () => {
  renderMailPage();
  fireEvent.click(screen.getByRole("button", { name: "Написать" }));
  fireEvent.click(screen.getByRole("button", { name: "Отправить…" }));

  expect(await screen.findByText("Отправить письмо?")).toBeInTheDocument();
  expect(screen.getByText("Это действие нельзя отменить.")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Да, отправить" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Нет" })).toBeInTheDocument();
});

it("closes confirm dialog on Escape", async () => {
  renderMailPage();
  fireEvent.click(screen.getByRole("button", { name: "Написать" }));
  fireEvent.click(screen.getByRole("button", { name: "Отправить…" }));
  expect(await screen.findByText("Отправить письмо?")).toBeInTheDocument();

  fireEvent.keyDown(window, { key: "Escape" });
  expect(screen.queryByText("Отправить письмо?")).toBeNull();
});

it("shows success toast when reply draft is created", async () => {
  vi.mocked(apiReplyDraft).mockResolvedValue({
    id: "draft-1",
    to: "a@b.com",
    subject: "Re: Test",
    body: "Reply draft",
    createdBy: "c@d.com",
  });

  renderMailPage();
  fireEvent.click(await screen.findByRole("button", { name: /a@b\.com/i }));
  fireEvent.click(await screen.findByRole("button", { name: "Ответить" }));

  await waitFor(() => {
    expect(toastMocks.success).toHaveBeenCalledWith("Черновик ответа создан.");
  });
});

it("shows error toast when summary generation fails", async () => {
  vi.mocked(apiMailThreadSummary).mockRejectedValue(new Error("summary failed"));

  renderMailPage();
  fireEvent.click(await screen.findByRole("button", { name: /a@b\.com/i }));
  fireEvent.click(await screen.findByRole("button", { name: "Кратко пересказать" }));

  await waitFor(() => {
    expect(toastMocks.error).toHaveBeenCalledWith("summary failed");
  });
});
