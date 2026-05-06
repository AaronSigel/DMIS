import type { Meta, StoryObj } from "@storybook/react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type DemoButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  size?: "sm" | "md";
  children: ReactNode;
};

function DemoButton({ variant = "primary", size = "md", children, ...props }: DemoButtonProps) {
  const sizeClass = size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm";
  const variantClass =
    variant === "primary"
      ? "border border-primary bg-primary text-white"
      : "border border-border bg-white text-text";

  return (
    <button
      type="button"
      className={`rounded-md font-medium transition-opacity disabled:cursor-not-allowed disabled:opacity-50 ${sizeClass} ${variantClass}`}
      {...props}
    >
      {children}
    </button>
  );
}

const meta = {
  title: "Primitives/Button",
  component: DemoButton,
  args: {
    children: "Сохранить",
    variant: "primary",
    size: "md",
    disabled: false,
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof DemoButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Отмена",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
