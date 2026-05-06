type User = { id: string; fullName: string; email: string; roles?: string[] };

type SettingsPageProps = { user: User };

export function SettingsPage({ user }: SettingsPageProps) {
  void user;

  return (
    <div className="p-6">
      <h2 className="mb-2.5 mt-0 text-text">Настройки</h2>
      <p className="mb-[14px] mt-0 text-muted">
        Настройки профиля и предпочтений находятся в разработке.
      </p>

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
  );
}
