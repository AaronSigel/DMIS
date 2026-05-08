import { PageHeader } from "../shared/ui/PageHeader";

type StaticPageProps = {
  title: string;
  description: string;
  hint?: string;
  actionLabel?: string;
};

export function StaticPage({ title, description, hint, actionLabel }: StaticPageProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader title={title} subtitle={description} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[560px] rounded-[10px] border border-dashed border-border bg-white p-[14px]">
          <p className="m-0 text-[13px] text-text">
            {hint ??
              "Раздел находится в процессе внедрения. Данные появятся после настройки backend-коннекторов."}
          </p>
          {actionLabel && (
            <button
              type="button"
              disabled
              title="Функция пока не реализована"
              className="mt-2.5 cursor-not-allowed rounded-md border border-border bg-white px-3 py-1 text-xs text-text opacity-60"
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
