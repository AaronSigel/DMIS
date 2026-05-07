import type { Meta, StoryObj } from "@storybook/react";
import { TopBarBtn } from "../TopBarBtn";

const meta = {
  title: "Shared/TopBarBtn",
  component: TopBarBtn,
  args: {
    children: "Действие",
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof TopBarBtn>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithTitle: Story = {
  args: {
    title: "Подсказка с пояснением",
    children: "Фильтр",
  },
};
