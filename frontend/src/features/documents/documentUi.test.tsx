import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

import { RenameDocumentModal } from "./documentUi";

afterEach(() => {
  cleanup();
});

describe("RenameDocumentModal", () => {
  it("focuses input on open", async () => {
    render(
      <RenameDocumentModal
        open
        onClose={() => {}}
        initialTitle="Документ"
        onSave={async () => {}}
      />,
    );

    const input = screen.getByLabelText("Имя документа");
    await waitFor(() => {
      expect(input).toHaveFocus();
    });
  });

  it("closes on Escape when not busy", () => {
    const onClose = vi.fn();

    render(
      <RenameDocumentModal
        open
        onClose={onClose}
        initialTitle="Документ"
        onSave={async () => {}}
      />,
    );

    const input = screen.getByLabelText("Имя документа");
    fireEvent.keyDown(input, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("submits on Enter with same validation", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(
      <RenameDocumentModal
        open
        onClose={() => {}}
        initialTitle="  Новый заголовок  "
        onSave={onSave}
      />,
    );

    const input = screen.getByLabelText("Имя документа");
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith("Новый заголовок");
    });
  });

  it("does not close on Escape while busy", async () => {
    const onClose = vi.fn();
    let resolveSave: (() => void) | undefined;
    const onSave = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSave = resolve;
        }),
    );

    render(<RenameDocumentModal open onClose={onClose} initialTitle="Документ" onSave={onSave} />);

    const input = screen.getByLabelText("Имя документа");
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledTimes(1);
    });

    fireEvent.keyDown(input, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(0);

    resolveSave?.();
  });
});
