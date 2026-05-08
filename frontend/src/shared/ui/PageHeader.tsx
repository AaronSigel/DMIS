import type { ReactNode } from "react";
import { useUiStore } from "../store/uiStore";

type PageHeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  navigation?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({ title, subtitle, navigation, actions }: PageHeaderProps) {
  const desktopAiOpen = useUiStore((state) => state.desktopAiOpen);
  const openAiWithQuery = useUiStore((state) => state.openAiWithQuery);

  return (
    <header className="flex shrink-0 flex-col gap-3 border-b border-border bg-surface px-6 pb-[14px] pt-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {navigation}
        <div className="min-w-0 flex-1">
          <h2 className="m-0 min-w-0 break-words text-xl font-bold leading-snug text-text">
            {title}
          </h2>
          {subtitle && (
            <p className="mb-0 mt-1 text-[13px] leading-[1.45] text-muted">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:max-w-[min(100%,560px)] sm:justify-end">
        {actions}
        <button
          type="button"
          onClick={() => openAiWithQuery()}
          aria-label={desktopAiOpen ? "Ассистент открыт" : "Открыть ассистента"}
          title={desktopAiOpen ? "Ассистент открыт" : "Открыть ассистента"}
          className="rounded-full border border-border bg-white p-1 shadow-sm transition-transform duration-200 ease-out hover:scale-105 hover:shadow-md active:scale-95"
        >
          <span
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold ${
              desktopAiOpen ? "bg-primary text-white" : "bg-surface text-text"
            }`}
          >
            AI
          </span>
        </button>
      </div>
    </header>
  );
}
