import type { Meta, StoryObj } from "@storybook/react";
import { ToastProvider, useToast } from "../ToastProvider";

function ToastTrigger() {
  const toast = useToast();
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => toast.success("Документ загружен")}
        className="rounded-md border border-success/40 bg-success-soft px-3 py-1.5 text-sm text-text"
      >
        Success
      </button>
      <button
        type="button"
        onClick={() => toast.error("Не удалось сохранить")}
        className="rounded-md border border-danger/40 bg-danger/10 px-3 py-1.5 text-sm text-text"
      >
        Error
      </button>
      <button
        type="button"
        onClick={() => toast.info("Сессия будет обновлена")}
        className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text"
      >
        Info
      </button>
    </div>
  );
}

const meta = {
  title: "Shared/Toast",
  component: ToastTrigger,
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof ToastTrigger>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Поток: клик по кнопке → toast в правом нижнем углу, исчезает через 3.5с. */
export const Default: Story = {};
