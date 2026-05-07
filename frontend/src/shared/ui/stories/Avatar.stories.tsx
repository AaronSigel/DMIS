import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "../Avatar";

const meta = {
  title: "Shared/Avatar",
  component: Avatar,
  args: {
    name: "Иван Иванов",
    size: 26,
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleWord: Story = {
  args: {
    name: "Сергей",
  },
};

export const Small: Story = {
  args: {
    size: 16,
  },
};

export const Medium: Story = {
  args: {
    size: 40,
  },
};

export const Large: Story = {
  args: {
    size: 64,
  },
};
