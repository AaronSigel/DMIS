import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AssistantInput } from "./AssistantInput";

function renderAssistantInput() {
  return render(
    <AssistantInput
      inputValue=""
      placeholder="Введите сообщение"
      recording={false}
      liveTranscript=""
      mentionCandidates={[
        {
          id: "doc-1",
          title: "Очень длинное название документа для проверки обрезки в списке упоминаний",
        },
      ]}
      mentionActiveIndex={0}
      userMentionCandidates={[
        {
          id: "user-1",
          email: "user@example.com",
          nickname: null,
          fullName: "Очень Длинная Фамилия Имя Отчество Пользователя",
        },
      ]}
      userMentionActiveIndex={0}
      blocksUserSend={false}
      isStreaming={false}
      token
      uploadRef={{ current: null }}
      onInputChange={vi.fn()}
      onSubmit={vi.fn()}
      onStopStream={vi.fn()}
      onDictation={vi.fn()}
      onAttachClick={vi.fn()}
      onFileSelected={vi.fn()}
      onAttachMention={vi.fn()}
      onMentionActiveIndexChange={vi.fn()}
      onClearMentionCandidates={vi.fn()}
      onAttachUserMention={vi.fn()}
      onUserMentionActiveIndexChange={vi.fn()}
      onClearUserMentionCandidates={vi.fn()}
    />,
  );
}

describe("AssistantInput mentions list", () => {
  it("shows truncated labels with full title tooltip for doc and user mentions", () => {
    renderAssistantInput();

    const docMention = screen.getByRole("button", {
      name: /Очень длинное название документа/,
    });
    expect(docMention).toHaveAttribute(
      "title",
      "Очень длинное название документа для проверки обрезки в списке упоминаний",
    );
    expect(docMention.className).toContain("truncate");

    const userMention = screen.getByRole("button", {
      name: /Очень Длинная Фамилия Имя Отчество Пользователя/,
    });
    expect(userMention).toHaveAttribute("title", "Очень Длинная Фамилия Имя Отчество Пользователя");
    expect(userMention.className).toContain("truncate");
  });
});
