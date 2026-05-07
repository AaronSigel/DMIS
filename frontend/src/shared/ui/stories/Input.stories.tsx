import type { Meta, StoryObj } from "@storybook/react";
import { useId } from "react";

type DemoInputProps = {
  label: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  value?: string;
};

function DemoInput({
  label,
  placeholder,
  disabled = false,
  error = "",
  value = "",
}: DemoInputProps) {
  const id = useId();

  return (
    <div className="w-[320px] space-y-1">
      <label htmlFor={id} className="block text-xs font-semibold text-muted">
        {label}
      </label>
      <input
        id={id}
        disabled={disabled}
        defaultValue={value}
        placeholder={placeholder}
        className="box-border w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text outline-none disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted"
      />
      {error ? (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const meta = {
  title: "Primitives/Input",
  component: DemoInput,
  args: {
    label: "Название документа",
    placeholder: "Введите название",
    disabled: false,
    error: "",
    value: "",
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof DemoInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  args: {
    value: "Протокол встречи",
  },
};

export const WithError: Story = {
  args: {
    error: "Поле обязательно для заполнения.",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: "Черновик",
  },
};
