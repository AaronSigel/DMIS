import type { Meta, StoryObj } from "@storybook/react";
import { StatusBadge } from "../StatusBadge";

const meta = {
  title: "Shared/StatusBadge",
  component: StatusBadge,
  args: {
    status: "final",
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Final: Story = {};

export const Indexed: Story = {
  args: { status: "indexed" },
};

export const Review: Story = {
  args: { status: "review" },
};

export const Pending: Story = {
  args: { status: "pending" },
};

export const Failed: Story = {
  args: { status: "failed" },
};

export const Draft: Story = {
  args: { status: "draft" },
};

/** Неизвестные статусы рендерятся как-есть с нейтральной обводкой. */
export const Unknown: Story = {
  args: { status: "EXECUTED" },
};

/** Все варианты рядом — удобно для визуальной регрессии. */
export const Gallery: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {(["final", "indexed", "review", "pending", "failed", "draft", "EXECUTED"] as const).map(
        (s) => (
          <StatusBadge key={s} status={s} />
        ),
      )}
    </div>
  ),
};
