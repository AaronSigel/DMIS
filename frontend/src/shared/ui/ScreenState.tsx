const defaultMessages = {
  loading: "Загрузка…",
  error: "Не удалось загрузить данные",
  empty: "Нет данных",
} as const;

type ScreenStateProps = {
  variant: "loading" | "error" | "empty";
  message?: string;
  action?: { label: string; onClick: () => void };
};

export function ScreenState({ variant, message, action }: ScreenStateProps) {
  const text = message ?? defaultMessages[variant];
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      {variant === "loading" && (
        <span aria-hidden="true" className="text-2xl opacity-40">
          ⟳
        </span>
      )}
      {variant === "error" && (
        <span aria-hidden="true" className="text-2xl text-danger opacity-60">
          ⚠
        </span>
      )}
      {variant === "empty" && (
        <span aria-hidden="true" className="text-2xl opacity-30">
          ○
        </span>
      )}
      <p className="m-0 text-sm text-muted">{text}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="rounded-md border border-border bg-white px-3 py-1.5 text-sm text-text hover:bg-surface-alt"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
