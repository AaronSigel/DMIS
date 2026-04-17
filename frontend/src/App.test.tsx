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
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(
        jsonResponse({
          token: "token-1",
          user: { id: "u-admin", fullName: "System Admin", email: "admin@dmis.local" }
        })
      )
      .mockResolvedValueOnce(jsonResponse([{ id: "doc-1", title: "Policy Doc" }]))
      .mockResolvedValueOnce(
        jsonResponse({
          id: "doc-1",
          title: "Policy Doc",
          ownerId: "u-admin",
          versions: [
            {
              versionId: "v1",
              fileName: "policy.txt",
              contentType: "text/plain",
              sizeBytes: 128,
              storageRef: "minio://bucket/path",
              createdAt: "2026-01-01T00:00:00Z"
            }
          ],
          storageRef: "minio://bucket/path",
          extractedText: "test content"
        })
      );
    vi.stubGlobal("fetch", fetchMock);

    render(
      <MemoryRouter initialEntries={["/documents"]}>
        <App />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole("button", { name: /login as demo admin/i }));
    await userEvent.click(screen.getByRole("button", { name: /refresh/i }));
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
    json: async () => payload
  } as Response;
}
