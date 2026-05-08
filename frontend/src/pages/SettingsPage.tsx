import { PageHeader } from "../shared/ui/PageHeader";

type User = { id: string; fullName: string; email: string; roles?: string[] };

type SettingsPageProps = { user: User };

export function SettingsPage({ user }: SettingsPageProps) {
  void user;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title="Настройки"
        subtitle="Настройки профиля и предпочтений находятся в разработке."
      />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid max-w-[640px] gap-3 rounded-[10px] border border-border bg-white p-[14px]">
          <div className="flex items-center justify-between gap-2.5">
            <div>
              <p className="m-0 text-sm font-semibold text-text">Тема интерфейса</p>
              <p className="mb-0 mt-1 text-xs text-muted">
                Переключение между светлой и тёмной темой (скоро).
              </p>
            </div>
            <button
              type="button"
              disabled
              className="rounded-md border border-border bg-white px-3 py-1 text-xs text-text"
            >
              Скоро
            </button>
          </div>

          <div className="flex items-center justify-between gap-2.5">
            <div>
              <p className="m-0 text-sm font-semibold text-text">Email-дайджест</p>
              <p className="mb-0 mt-1 text-xs text-muted">
                Ежедневная сводка по документам и активности (скоро).
              </p>
            </div>
            <button
              type="button"
              disabled
              className="rounded-md border border-border bg-white px-3 py-1 text-xs text-text"
            >
              Скоро
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
