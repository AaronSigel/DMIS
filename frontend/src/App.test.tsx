import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

describe("auth smoke", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
    window.localStorage.clear();
  });

  it("signs in and opens document card", async () => {
    const docView = {
      id: "doc-1",
      title: "Policy Doc",
      ownerId: "u-admin",
      description: "",
      tags: [],
      source: "upload",
      category: "general",
      status: "INDEXED",
      type: "text/plain",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
      versionCount: 1,
      totalSizeBytes: 128,
      lastVersionAt: "2026-01-01T00:00:00Z",
      versions: [
        {
          versionId: "v1",
          fileName: "policy.txt",
          contentType: "text/plain",
          sizeBytes: 128,
          storageRef: "minio://bucket/path",
          createdAt: "2026-01-01T00:00:00Z",
          indexStatus: "INDEXED",
          indexedChunkCount: 1,
          indexedAt: "2026-01-01T00:00:00Z",
          latest: true
        }
      ],
      storageRef: "minio://bucket/path",
      extractedTextPreview: "test content",
      extractedTextLength: 12,
      extractedTextTruncated: false
    };

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/health")) return okTextResponse("ok");
      if (url.endsWith("/auth/login")) {
        return jsonResponse({
          token: "token-1",
          refreshToken: "refresh-1",
          user: {
            id: "u-admin",
            fullName: "System Admin",
            email: "admin@dmis.local",
            roles: ["ADMIN"]
          }
        });
      }
      if (url.includes("/assistant/threads")) return jsonResponse([]);
      if (url.includes("/documents?page=0&size=1")) {
        return jsonResponse({ content: [docView], totalElements: 1, totalPages: 1, page: 0, size: 1 });
      }
      if (url.includes("/documents?page=0&size=20")) {
        return jsonResponse({ content: [docView], totalElements: 1, totalPages: 1, page: 0, size: 20 });
      }
      if (url.includes("/documents/doc-1/extracted-text")) return okTextResponse("policy content");
      if (url.includes("/documents/doc-1")) return jsonResponse(docView);
      return jsonResponse([]);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(
      <MemoryRouter initialEntries={["/documents"]}>
        <App />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText(/электронная почта/i), "admin@dmis.local");
    await userEvent.type(screen.getByPlaceholderText(/пароль/i), "demo");
    await userEvent.click(screen.getByRole("button", { name: /войти/i }));

    await waitFor(() => expect(screen.getByText("Policy Doc")).toBeInTheDocument());
    await userEvent.click(screen.getAllByText("Policy Doc")[0]);

    await waitFor(() => expect(screen.getByRole("heading", { name: "Policy Doc" })).toBeInTheDocument());
    expect(screen.getByText("policy.txt")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/documents/doc-1"),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer token-1" })
      })
    );
  });

  it("uses new navigation layout and hides admin control for non-admin", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/health")) return okTextResponse("ok");
      if (url.endsWith("/auth/login")) {
        return jsonResponse({
          token: "token-1",
          refreshToken: "refresh-1",
          user: {
            id: "u-user",
            fullName: "Demo User",
            email: "user@dmis.local",
            roles: ["USER"]
          }
        });
      }
      if (url.includes("/assistant/threads")) return jsonResponse([]);
      if (url.includes("/health")) return okTextResponse("ok");
      if (url.includes("/documents")) return jsonResponse({ content: [], totalElements: 0, totalPages: 1, page: 0, size: 1 });
      if (url.includes("/actions")) return jsonResponse([]);
      if (url.includes("/audit")) return jsonResponse([]);
      return jsonResponse([]);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <App />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText(/электронная почта/i), "user@dmis.local");
    await userEvent.type(screen.getByPlaceholderText(/пароль/i), "demo");
    await userEvent.click(screen.getByRole("button", { name: /войти/i }));

    await waitFor(() => expect(screen.getAllByRole("button", { name: /документы/i }).length).toBeGreaterThan(0));
    expect(screen.queryByRole("button", { name: /RAG-ассистент/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /AI-действия/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Интеграции/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /календарь/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /журнал аудита/i })).not.toBeInTheDocument();
  });
});

function jsonResponse(payload: unknown): Response {
  return {
    ok: true,
    status: 200,
    headers: new Headers({ "content-type": "application/json" }),
    json: async () => payload
  } as Response;
}

function okTextResponse(payload: string): Response {
  return {
    ok: true,
    status: 200,
    headers: new Headers({ "content-type": "text/plain" }),
    text: async () => payload
  } as Response;
}
