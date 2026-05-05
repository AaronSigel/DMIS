import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

describe("document card route", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("navigates from documents list to card and renders versions", async () => {
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

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          token: "token-1",
          user: {
            id: "u-admin",
            fullName: "System Admin",
            email: "admin@dmis.local",
            roles: ["ADMIN"]
          }
        })
      )
      .mockResolvedValueOnce(jsonResponse([] as { id: string; email: string; fullName: string }[]))
      .mockResolvedValueOnce(
        jsonResponse({
          content: [docView],
          totalElements: 1,
          totalPages: 1,
          page: 0,
          size: 20
        })
      )
      .mockResolvedValueOnce(jsonResponse(docView));

    vi.stubGlobal("fetch", fetchMock);

    render(
      <MemoryRouter initialEntries={["/documents"]}>
        <App />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole("button", { name: /login as demo admin/i }));
    await waitFor(() => expect(screen.getByRole("button", { name: /policy doc/i })).toBeInTheDocument());
    await userEvent.click(screen.getByRole("button", { name: /policy doc/i }));

    await waitFor(() => expect(screen.getByRole("heading", { name: "Policy Doc" })).toBeInTheDocument());
    expect(screen.getByText(/v1 - policy.txt/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/documents/doc-1"),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer token-1" })
      })
    );
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
