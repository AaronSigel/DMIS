import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AssistantThreadsDialog } from "./AssistantThreadsDialog";

afterEach(() => {
  cleanup();
});

function renderDialog(overrides?: Partial<React.ComponentProps<typeof AssistantThreadsDialog>>) {
  const props: React.ComponentProps<typeof AssistantThreadsDialog> = {
    open: true,
    width: 320,
    threads: [
      {
        id: "thread-1",
        title: "Очень длинное название диалога для проверки подсказки и обрезки строки",
      },
    ],
    activeThreadId: "thread-1",
    deletePending: false,
    onClose: vi.fn(),
    onCreate: vi.fn(),
    onSelect: vi.fn(),
    onDelete: vi.fn(),
    ...overrides,
  };

  return {
    ...render(<AssistantThreadsDialog {...props} />),
    props,
  };
}

describe("AssistantThreadsDialog accessibility", () => {
  it("focuses the close button when opened", () => {
    renderDialog();

    expect(screen.getByRole("button", { name: "Закрыть" })).toHaveFocus();
  });

  it("closes on Escape key", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderDialog({ onClose });

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows full thread title in title attribute on truncated label", () => {
    renderDialog();

    const threadTitle = "Очень длинное название диалога для проверки подсказки и обрезки строки";
    const titleNode = screen.getByText(threadTitle);

    expect(titleNode).toHaveAttribute("title", threadTitle);
    expect(titleNode.className).toContain("truncate");
  });
});
