import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { DocTable, UploadPipeline } from "./DocTable";
import { ToastProvider } from "../../shared/ui/ToastProvider";

vi.mock("../../apiClient", () => ({
  apiListDocuments: vi.fn().mockResolvedValue({ content: [], totalPages: 1, page: 0 }),
  apiSearchDocuments: vi.fn().mockResolvedValue({ hits: [] }),
  apiDeleteDocument: vi.fn(),
  apiGetDocumentDownloadUrl: vi.fn(),
  apiUploadDocumentWithProgress: vi.fn(),
  apiUpdateDocument: vi.fn(),
  fetchWithAuth: vi.fn(),
  readApiError: vi.fn(),
  apiBaseUrl: "http://localhost",
}));

import { apiListDocuments } from "../../apiClient";

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location-search">{location.search}</div>;
}

function renderDocTable(initialEntry = "/documents") {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <ToastProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <LocationProbe />
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

function doc(params: { id: string; title: string; status: string; updatedAt: string }) {
  return {
    id: params.id,
    title: params.title,
    ownerId: "u1",
    description: "",
    tags: [],
    source: "upload",
    category: "memo",
    status: params.status,
    type: "memo",
    createdAt: "2026-05-30T10:00:00Z",
    updatedAt: params.updatedAt,
    totalSizeBytes: 10,
    fileName: `${params.id}.txt`,
    contentType: "text/plain",
    storageRef: `s3://${params.id}`,
    indexedChunkCount: 0,
    indexedAt: null,
    extractedTextPreview: "",
    extractedTextLength: 0,
    extractedTextTruncated: false,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(apiListDocuments).mockResolvedValue({
    content: [],
    totalElements: 0,
    totalPages: 1,
    page: 0,
    size: 20,
  });
});

afterEach(() => {
  cleanup();
});

it("switches status filter from ALL to specific status and back", async () => {
  vi.mocked(apiListDocuments).mockResolvedValue({
    content: [
      doc({ id: "d1", title: "Indexed doc", status: "INDEXED", updatedAt: "2026-05-30T10:00:00Z" }),
      doc({ id: "d2", title: "Failed doc", status: "FAILED", updatedAt: "2026-05-30T11:00:00Z" }),
    ],
    totalElements: 2,
    totalPages: 1,
    page: 0,
    size: 20,
  });

  const user = userEvent.setup();
  renderDocTable();

  expect(await screen.findByText("Indexed doc")).toBeInTheDocument();
  expect(screen.getByText("Failed doc")).toBeInTheDocument();

  const statusSelect = screen.getByRole("combobox", { name: "Фильтр по статусу" });
  await user.selectOptions(statusSelect, "FAILED");

  await waitFor(() => {
    expect(screen.queryByText("Indexed doc")).toBeNull();
    expect(screen.getByText("Failed doc")).toBeInTheDocument();
    expect(screen.getByText("Статус: FAILED")).toBeInTheDocument();
  });

  await user.selectOptions(statusSelect, "ALL");

  await waitFor(() => {
    expect(screen.getByText("Indexed doc")).toBeInTheDocument();
    expect(screen.getByText("Failed doc")).toBeInTheDocument();
    expect(statusSelect).toHaveValue("ALL");
  });
});

it("changes sort via dropdown and updates URL", async () => {
  vi.mocked(apiListDocuments).mockResolvedValue({
    content: [
      doc({ id: "old", title: "Old doc", status: "INDEXED", updatedAt: "2026-05-29T10:00:00Z" }),
      doc({ id: "new", title: "New doc", status: "INDEXED", updatedAt: "2026-05-31T10:00:00Z" }),
    ],
    totalElements: 2,
    totalPages: 1,
    page: 0,
    size: 20,
  });

  const user = userEvent.setup();
  renderDocTable();

  await screen.findByText("Old doc");
  await screen.findByText("New doc");

  // Default sort is date_desc — no sort param in URL
  expect(screen.getByTestId("location-search")).toHaveTextContent("");

  const sortSelect = screen.getByRole("combobox", { name: "Сортировка" });
  expect(sortSelect).toHaveValue("date_desc");

  await user.selectOptions(sortSelect, "date_asc");

  await waitFor(() => {
    expect(screen.getByTestId("location-search")).toHaveTextContent("?sort=date_asc");
  });

  await user.selectOptions(sortSelect, "name_asc");

  await waitFor(() => {
    expect(screen.getByTestId("location-search")).toHaveTextContent("?sort=name_asc");
  });
});

it("syncs query params for sort/archive/page from URL and UI actions", async () => {
  vi.mocked(apiListDocuments).mockResolvedValue({
    content: [
      doc({ id: "d1", title: "Doc 1", status: "INDEXED", updatedAt: "2026-05-30T10:00:00Z" }),
    ],
    totalElements: 60,
    totalPages: 3,
    page: 1,
    size: 20,
  });

  const user = userEvent.setup();
  renderDocTable("/documents?archive=1&sort=date_asc&page=1");

  expect(await screen.findByText("Doc 1")).toBeInTheDocument();
  expect(screen.getByTestId("location-search")).toHaveTextContent(
    "?archive=1&sort=date_asc&page=1",
  );
  expect(screen.getByRole("button", { name: "Архив: вкл" })).toBeInTheDocument();

  const sortSelect = screen.getByRole("combobox", { name: "Сортировка" });
  expect(sortSelect).toHaveValue("date_asc");

  await user.click(screen.getByRole("button", { name: "Архив: вкл" }));

  await waitFor(() => {
    expect(screen.getByTestId("location-search")).toHaveTextContent("?sort=date_asc");
  });

  await user.selectOptions(sortSelect, "date_desc");

  await waitFor(() => {
    expect(screen.getByTestId("location-search")).toHaveTextContent("");
  });

  await user.click(screen.getByRole("button", { name: "Далее →" }));

  await waitFor(() => {
    expect(screen.getByTestId("location-search")).toHaveTextContent("?page=1");
  });
});

it("UploadPipeline shows full pipeline labels", () => {
  render(<UploadPipeline status="done" />);
  expect(screen.getByText("Загружен")).toBeInTheDocument();
  expect(screen.getByText("Извлекается текст")).toBeInTheDocument();
  expect(screen.getByText("Индексируется")).toBeInTheDocument();
  expect(screen.getByText("Проиндексирован")).toBeInTheDocument();
});

it("UploadPipeline marks uploaded stage as current", () => {
  render(<UploadPipeline status="done" />);
  const currentStep = screen.getByText("Загружен").closest("[data-step-current]");
  expect(currentStep).toBeInTheDocument();
});
