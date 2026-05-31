import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  cleanup();
});
import { DocTable } from "./DocTable";
import { ToastProvider } from "../../shared/ui/ToastProvider";

// minimal mock so render doesn't explode
vi.mock("../../apiClient", () => ({
  apiListDocuments: vi.fn().mockResolvedValue({ content: [], totalPages: 1, page: 0 }),
  apiSearchDocuments: vi.fn().mockResolvedValue({ hits: [] }),
  apiBaseUrl: "http://localhost",
}));

function renderDocTable() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <ToastProvider>
        <MemoryRouter>
          <DocTable
            token="tok"
            user={{ id: "u1", fullName: "User", email: "u@example.com" }}
            onSessionExpired={() => {}}
            onTokenRefresh={() => {}}
            section="all"
            uploadTrigger={0}
          />
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

it("does not render the indexed-only filter toggle", () => {
  renderDocTable();
  // button text variants both before and after toggle
  expect(screen.queryByText(/Фильтр: проиндексированные/)).toBeNull();
  expect(screen.queryByText(/Показываются только проиндексированные/)).toBeNull();
});

it("shows all status badge variants — no status filter applied", async () => {
  renderDocTable();
  // The filter badge pill should say "Все статусы" (not "Только проиндексированные")
  expect(await screen.findByText("Все статусы")).toBeInTheDocument();
});

import { UploadPipeline } from "./DocTable"; // will fail until exported

it("UploadPipeline shows full pipeline for done status", () => {
  render(<UploadPipeline status="done" />);
  expect(screen.getByText("Загружен")).toBeInTheDocument();
  expect(screen.getByText("Извлекается текст")).toBeInTheDocument();
  expect(screen.getByText("Индексируется")).toBeInTheDocument();
  expect(screen.getByText("Проиндексирован")).toBeInTheDocument();
});

it("UploadPipeline highlights Загружен as current step for done status", () => {
  render(<UploadPipeline status="done" />);
  // The current step (Загружен) has a highlighted class; pending steps have text-muted
  const currentStep = screen.getByText("Загружен").closest("[data-step-current]");
  expect(currentStep).toBeInTheDocument();
});

it("UploadPipeline shows only queued step for queued status", () => {
  render(<UploadPipeline status="queued" />);
  // For queued: only Загружен visible as pending (or current); no Проиндексирован
  // Implementation note: spec says queued shows "Загружен step only"
  // Exact visual treatment: Загружен step as current, rest hidden or grayed
  expect(screen.getByText("Загружен")).toBeInTheDocument();
});
