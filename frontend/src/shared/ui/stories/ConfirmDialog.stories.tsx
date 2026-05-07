import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ConfirmDialog } from "../ConfirmDialog";

const meta = {
  title: "Shared/ConfirmDialog",
  component: ConfirmDialog,
  args: {
    open: false,
    onOpenChange: () => {},
    onConfirm: () => {},
    title: "Подтвердить?",
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

function ConfirmDialogDefaultStory() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-primary bg-primary px-3 py-1.5 text-sm text-white"
      >
        Удалить документ
      </button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={() => setOpen(false)}
        title="Удалить документ?"
        description="Документ и все связанные индексы будут удалены без возможности восстановления."
        confirmText="Удалить"
        cancelText="Отмена"
      />
    </div>
  );
}

/** Базовый сценарий: кнопка открывает диалог; Confirm/Cancel — закрытие. */
export const Default: Story = {
  render: () => <ConfirmDialogDefaultStory />,
};

/** Состояние выполнения: Confirm и Cancel заблокированы; текст кнопки меняется. */
export const Pending: Story = {
  render: () => (
    <ConfirmDialog
      open
      pending
      onOpenChange={() => {}}
      onConfirm={() => {}}
      title="Удалить документ?"
      description="Документ и все связанные индексы будут удалены."
      confirmText="Удалить"
    />
  ),
};

/** Без description — компактная форма. */
export const WithoutDescription: Story = {
  render: () => (
    <ConfirmDialog
      open
      onOpenChange={() => {}}
      onConfirm={() => {}}
      title="Подтвердить действие?"
    />
  ),
};
