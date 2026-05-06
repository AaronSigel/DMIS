type StaticPageProps = {
  title: string;
  description: string;
  hint?: string;
  actionLabel?: string;
};

export function StaticPage({ title, description, hint, actionLabel }: StaticPageProps) {
  return (
    <div className="p-6">
      <h2 className="mb-2.5 mt-0 text-text">{title}</h2>
      <p className="m-0 leading-[1.6] text-muted">{description}</p>
      <div className="mt-[14px] max-w-[560px] rounded-[10px] border border-dashed border-border bg-white p-[14px]">
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
  );
}
