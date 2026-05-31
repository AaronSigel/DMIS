import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ClarificationForm, type ClarificationState } from "./ClarificationForm";

function renderClarificationForm(
  overrides?: Partial<React.ComponentProps<typeof ClarificationForm>>,
) {
  const clarification: ClarificationState = {
    intent: "schedule_meeting",
    missingFields: ["startAt", "subject"],
    partialEntities: {},
    originalText: "Создай встречу",
  };

  const props: React.ComponentProps<typeof ClarificationForm> = {
    clarification,
    values: {},
    onChange: vi.fn(),
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    pending: false,
    onSessionExpired: vi.fn(),
    onTokenRefresh: vi.fn(),
    ...overrides,
  };

  return render(<ClarificationForm {...props} />);
}

describe("ClarificationForm", () => {
  it("disables submit and shows required-fields hint when any missing field is blank after trim", async () => {
    const user = userEvent.setup();
    renderClarificationForm({
      clarification: {
        intent: "send_email",
        missingFields: ["subject", "body"],
        partialEntities: {},
        originalText: "Подготовь письмо",
      },
    });

    const submit = screen.getByTestId("clarification-submit-button");
    expect(submit).toBeDisabled();
    expect(screen.getByText("Заполните все обязательные поля.")).toBeInTheDocument();

    await user.type(screen.getByTestId("clarification-field-subject"), "Тема");
    await user.type(screen.getByTestId("clarification-field-body"), "   ");

    expect(submit).toBeDisabled();
    expect(screen.getByText("Заполните все обязательные поля.")).toBeInTheDocument();

    await user.clear(screen.getByTestId("clarification-field-body"));
    await user.type(screen.getByTestId("clarification-field-body"), "Текст письма");

    expect(submit).toBeEnabled();
    expect(screen.queryByText("Заполните все обязательные поля.")).not.toBeInTheDocument();
  });
});
