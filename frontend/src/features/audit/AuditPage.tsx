import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiListAudit } from "../../apiClient";
import { queryKeys } from "../../shared/api/queryClient";
import { mapApiErrorToMessage } from "../../shared/lib/mapApiErrorToMessage";
import { PageHeader } from "../../shared/ui/PageHeader";
import type { AuditRecord } from "../../entities/audit";

type User = { id: string; fullName: string; email: string; roles?: string[] };

type AuditPageProps = {
  token: string;
  user: User;
  onSessionExpired: () => void;
  onTokenRefresh: (token: string) => void;
};

const PAGE_SIZE = 10;

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function isAdmin(user: User): boolean {
  return user.roles?.includes("ADMIN") ?? false;
}

function uniqueValues(records: AuditRecord[], selector: (record: AuditRecord) => string): string[] {
  return Array.from(new Set(records.map(selector))).sort((a, b) => a.localeCompare(b, "ru"));
}

export function AuditPage({ token, user, onSessionExpired, onTokenRefresh }: AuditPageProps) {
  const adminMode = isAdmin(user);
  const [actionFilter, setActionFilter] = useState("");
  const [resourceTypeFilter, setResourceTypeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const auditQuery = useQuery({
    queryKey: queryKeys.audit.list,
    queryFn: () => apiListAudit(onSessionExpired, onTokenRefresh),
    enabled: !!token,
  });

  const allRecords = useMemo(() => {
    const records = auditQuery.data ?? [];
    return [...records].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  }, [auditQuery.data]);

  const scopedRecords = useMemo(() => {
    if (adminMode) return allRecords;
    return allRecords.filter((record) => record.actorId === user.id);
  }, [adminMode, allRecords, user.id]);

  const actionOptions = useMemo(
    () => uniqueValues(scopedRecords, (record) => record.action),
    [scopedRecords],
  );
  const resourceTypeOptions = useMemo(
    () => uniqueValues(scopedRecords, (record) => record.resourceType),
    [scopedRecords],
  );

  const filteredRecords = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return scopedRecords.filter((record) => {
      if (actionFilter && record.action !== actionFilter) return false;
      if (resourceTypeFilter && record.resourceType !== resourceTypeFilter) return false;
      if (!normalizedSearch) return true;
      const haystack =
        `${record.actorId} ${record.action} ${record.resourceType} ${record.resourceId} ${record.details}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [actionFilter, resourceTypeFilter, scopedRecords, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedRecords = filteredRecords.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const queryError =
    auditQuery.error instanceof Error
      ? mapApiErrorToMessage(auditQuery.error.message)
      : "Не удалось загрузить аудит.";

  const hasFilters = Boolean(actionFilter || resourceTypeFilter || search.trim());

  return (
    <section className="flex h-full min-h-0 flex-col">
      <PageHeader
        title={adminMode ? "Журнал аудита" : "Мои AI-действия"}
        subtitle={
          adminMode
            ? "Прозрачный журнал действий в системе с фильтрами и постраничным просмотром."
            : "Лента ваших действий, выполненных через контролируемый AI-поток."
        }
      />

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
        <div className="grid gap-2 rounded-lg border border-border bg-white p-3 md:grid-cols-[1fr_220px_220px]">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Поиск по actor/action/resource/details…"
            aria-label="Поиск по журналу аудита"
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-[13px] text-text outline-none"
          />
          <select
            value={actionFilter}
            onChange={(event) => {
              setActionFilter(event.target.value);
              setPage(1);
            }}
            aria-label="Фильтр по действию"
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-[13px] text-text outline-none"
          >
            <option value="">Все действия</option>
            {actionOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <select
            value={resourceTypeFilter}
            onChange={(event) => {
              setResourceTypeFilter(event.target.value);
              setPage(1);
            }}
            aria-label="Фильтр по типу ресурса"
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-[13px] text-text outline-none"
          >
            <option value="">Все ресурсы</option>
            {resourceTypeOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-border bg-white p-3">
          {auditQuery.isPending && (
            <p className="m-0 text-[13px] text-muted">Загрузка журнала аудита…</p>
          )}
          {!auditQuery.isPending && auditQuery.error && (
            <p className="m-0 text-[13px] text-danger">{queryError}</p>
          )}
          {!auditQuery.isPending && !auditQuery.error && filteredRecords.length === 0 && (
            <p className="m-0 text-[13px] text-muted">
              {hasFilters
                ? "Записи по заданным фильтрам не найдены."
                : adminMode
                  ? "Журнал аудита пока пуст."
                  : "Для вашего пользователя пока нет действий."}
            </p>
          )}
          {!auditQuery.isPending && !auditQuery.error && filteredRecords.length > 0 && (
            <>
              <div className="mb-2 flex items-center justify-between text-xs text-muted">
                <span>Всего записей: {filteredRecords.length}</span>
                <span>
                  Страница {currentPage} из {totalPages}
                </span>
              </div>
              <div className="min-h-0 flex-1 overflow-auto rounded-md border border-border">
                <table className="w-full border-collapse text-left text-[13px]">
                  <thead className="sticky top-0 bg-surface">
                    <tr>
                      <th className="border-b border-border px-3 py-2 font-semibold text-text">
                        Время
                      </th>
                      <th className="border-b border-border px-3 py-2 font-semibold text-text">
                        Actor
                      </th>
                      <th className="border-b border-border px-3 py-2 font-semibold text-text">
                        Action
                      </th>
                      <th className="border-b border-border px-3 py-2 font-semibold text-text">
                        Ресурс
                      </th>
                      <th className="border-b border-border px-3 py-2 font-semibold text-text">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRecords.map((record) => (
                      <tr key={record.id}>
                        <td className="border-b border-border px-3 py-2 align-top text-muted">
                          {formatDateTime(record.at)}
                        </td>
                        <td className="border-b border-border px-3 py-2 align-top text-text">
                          {record.actorId}
                        </td>
                        <td className="border-b border-border px-3 py-2 align-top text-text">
                          {record.action}
                        </td>
                        <td className="border-b border-border px-3 py-2 align-top text-text">
                          <div className="flex flex-col gap-0.5">
                            <span>{record.resourceType}</span>
                            <span className="text-xs text-muted">{record.resourceId}</span>
                          </div>
                        </td>
                        <td className="border-b border-border px-3 py-2 align-top text-text">
                          {record.details || "(без деталей)"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage <= 1}
                  className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-text disabled:opacity-50"
                >
                  Назад
                </button>
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage >= totalPages}
                  className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-text disabled:opacity-50"
                >
                  Вперёд
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
