import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiListAudit, apiListUsers } from "../../apiClient";
import { queryKeys } from "../../shared/api/queryClient";
import { mapApiErrorToMessage } from "../../shared/lib/mapApiErrorToMessage";
import { PageHeader } from "../../shared/ui/PageHeader";
import {
  localizeAuditAction,
  localizeAuditDetails,
  localizeResourceType,
} from "../../shared/lib/localizeDomain";
import type { AuditRecord } from "../../entities/audit";
import { formatDateTime } from "../../shared/lib/formatDate";
import { truncateId } from "../../shared/lib/formatId";

type User = {
  id: string;
  fullName: string;
  email: string;
  nickname?: string | null;
  roles?: string[];
};

type AuditPageProps = {
  token: string;
  user: User;
  onSessionExpired: () => void;
  onTokenRefresh: (token: string) => void;
};

const PAGE_SIZE = 10;
type AuditEventTypeFilter = "all" | "assistant" | "action" | "mail" | "calendar" | "document";

function isAdmin(user: User): boolean {
  return user.roles?.includes("ADMIN") ?? false;
}

function uniqueValues(records: AuditRecord[], selector: (record: AuditRecord) => string): string[] {
  return Array.from(new Set(records.map(selector))).sort((a, b) => a.localeCompare(b, "ru"));
}

function matchesEventType(action: string, filter: AuditEventTypeFilter): boolean {
  if (filter === "all") return true;
  if (filter === "assistant") return action.startsWith("assistant.");
  if (filter === "action") return action.startsWith("action.");
  if (filter === "mail") return action.startsWith("mail.");
  if (filter === "calendar") return action.startsWith("calendar.");
  if (filter === "document") return action.startsWith("document.");
  return true;
}

export function deriveActionType(action: string): { label: string; className: string } {
  if (action.startsWith("action."))
    return { label: "ИИ", className: "bg-indigo-100 text-indigo-700" };
  if (
    action.startsWith("calendar.") ||
    action.startsWith("mail.") ||
    action.startsWith("document.") ||
    action.startsWith("rag.")
  )
    return { label: "система", className: "bg-gray-100 text-gray-600" };
  if (action.startsWith("admin."))
    return { label: "админ", className: "bg-orange-100 text-orange-700" };
  return { label: "пользователь", className: "bg-blue-100 text-blue-700" };
}

export function deriveAuditStatus(status: string | null | undefined): {
  label: string;
  className: string;
} {
  switch (status) {
    case "ERROR":
      return { label: "ошибка", className: "bg-red-100 text-red-700" };
    case "PENDING":
      return { label: "ожидает", className: "bg-yellow-100 text-yellow-700" };
    case "CANCELLED":
      return { label: "отменено", className: "bg-gray-100 text-gray-600" };
    case "SUCCESS":
    default:
      return { label: "успешно", className: "bg-green-100 text-green-700" };
  }
}

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

export function AuditPage({ token, user, onSessionExpired, onTokenRefresh }: AuditPageProps) {
  const adminMode = isAdmin(user);
  const [actionFilter, setActionFilter] = useState("");
  const [resourceTypeFilter, setResourceTypeFilter] = useState("");
  const [actorFilter, setActorFilter] = useState("");
  const [search, setSearch] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState<AuditEventTypeFilter>("all");
  const [page, setPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  type DateRange = "all" | "today" | "7d" | "30d";
  const [dateRange, setDateRange] = useState<DateRange>("all");

  function toggleRow(id: string) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const auditQuery = useQuery({
    queryKey: queryKeys.audit.list,
    queryFn: () => apiListAudit(onSessionExpired, onTokenRefresh),
    enabled: !!token,
  });

  const usersQuery = useQuery({
    queryKey: queryKeys.users.list,
    queryFn: () => apiListUsers(onSessionExpired, onTokenRefresh),
    enabled: adminMode,
    staleTime: 5 * 60_000,
  });

  const actorLookup = useMemo(
    () => new Map((usersQuery.data ?? []).map((u) => [u.id, u.email])),
    [usersQuery.data],
  );

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
  const actorOptions = useMemo(
    () => (adminMode ? uniqueValues(scopedRecords, (record) => record.actorId) : []),
    [adminMode, scopedRecords],
  );

  const filteredRecords = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    // Compute the cutoff timestamp once
    let cutoffMs: number | null = null;
    if (dateRange === "today") {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      cutoffMs = d.getTime();
    } else if (dateRange === "7d") {
      cutoffMs = Date.now() - 7 * 24 * 60 * 60 * 1000;
    } else if (dateRange === "30d") {
      cutoffMs = Date.now() - 30 * 24 * 60 * 60 * 1000;
    }

    return scopedRecords.filter((record) => {
      if (actionFilter && record.action !== actionFilter) return false;
      if (!matchesEventType(record.action, eventTypeFilter)) return false;
      if (resourceTypeFilter && record.resourceType !== resourceTypeFilter) return false;
      if (adminMode && actorFilter && record.actorId !== actorFilter) return false;
      if (cutoffMs !== null && new Date(record.at).getTime() < cutoffMs) return false;
      if (!normalizedSearch) return true;
      const haystack =
        `${record.actorId} ${record.action} ${record.resourceType} ${record.resourceId} ${record.details}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [
    actionFilter,
    eventTypeFilter,
    resourceTypeFilter,
    adminMode,
    actorFilter,
    dateRange,
    scopedRecords,
    search,
  ]);

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

  const hasFilters = Boolean(
    eventTypeFilter !== "all" ||
    actionFilter ||
    resourceTypeFilter ||
    actorFilter ||
    search.trim() ||
    dateRange !== "all" ||
    page !== 1,
  );

  const summary = useMemo(() => {
    const errorCount = filteredRecords.filter((record) => record.status === "ERROR").length;
    const pendingCount = filteredRecords.filter((record) => record.status === "PENDING").length;
    const cancelledCount = filteredRecords.filter((record) => record.status === "CANCELLED").length;

    return {
      total: filteredRecords.length,
      errorCount,
      pendingCount,
      cancelledCount,
    };
  }, [filteredRecords]);

  function resetFilters() {
    setSearch("");
    setActionFilter("");
    setResourceTypeFilter("");
    setActorFilter("");
    setDateRange("all");
    setEventTypeFilter("all");
    setPage(1);
  }

  return (
    <section className="flex h-full min-h-0 flex-col">
      <PageHeader
        title={adminMode ? "Журнал аудита" : "Мои ИИ-действия"}
        subtitle={
          adminMode
            ? "Прозрачный журнал действий в системе с фильтрами и постраничным просмотром."
            : "Лента ваших действий, выполненных через контролируемый поток ассистента."
        }
      />

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
        <div className="grid gap-2 rounded-lg border border-border bg-white p-3 md:grid-cols-[1fr_180px_180px_180px_160px]">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Поиск по пользователю, действию, ресурсу или деталям…"
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
                {localizeAuditAction(value)}
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
                {localizeResourceType(value)}
              </option>
            ))}
          </select>
          {adminMode && (
            <select
              value={actorFilter}
              onChange={(event) => {
                setActorFilter(event.target.value);
                setPage(1);
              }}
              aria-label="Фильтр по пользователю"
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-[13px] text-text outline-none"
            >
              <option value="">Все пользователи</option>
              {actorOptions.map((actorId) => (
                <option key={actorId} value={actorId}>
                  {actorLookup.get(actorId) ?? actorId}
                </option>
              ))}
            </select>
          )}
          <select
            value={dateRange}
            onChange={(event) => {
              setDateRange(event.target.value as DateRange);
              setPage(1);
            }}
            aria-label="Фильтр по дате"
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-[13px] text-text outline-none"
          >
            <option value="all">Всё время</option>
            <option value="today">Сегодня</option>
            <option value="7d">7 дней</option>
            <option value="30d">30 дней</option>
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2">
          <span className="text-[11px] text-muted">Быстрый фильтр:</span>
          {(
            [
              ["all", "все"],
              ["assistant", "assistant.*"],
              ["action", "action.*"],
              ["mail", "mail.*"],
              ["calendar", "calendar.*"],
              ["document", "document.*"],
            ] as Array<[AuditEventTypeFilter, string]>
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={eventTypeFilter === value}
              onClick={() => {
                setEventTypeFilter(value);
                setPage(1);
              }}
              className={`rounded-full border px-2 py-1 text-[11px] ${
                eventTypeFilter === value
                  ? "border-primary bg-primary-soft text-text"
                  : "border-border bg-surface text-muted"
              }`}
            >
              {label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            {hasFilters && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] text-amber-700">
                фильтры активны
              </span>
            )}
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-md border border-border bg-surface px-2 py-1 text-[11px] text-text"
            >
              Сбросить фильтры
            </button>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-white px-3 py-2">
            <p className="m-0 text-[11px] text-muted">Всего записей</p>
            <p data-testid="audit-summary-total" className="m-0 text-lg font-semibold text-text">
              {summary.total}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-white px-3 py-2">
            <p className="m-0 text-[11px] text-muted">Ошибки</p>
            <p data-testid="audit-summary-error" className="m-0 text-lg font-semibold text-red-700">
              {summary.errorCount}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-white px-3 py-2">
            <p className="m-0 text-[11px] text-muted">Pending</p>
            <p
              data-testid="audit-summary-pending"
              className="m-0 text-lg font-semibold text-yellow-700"
            >
              {summary.pendingCount}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-white px-3 py-2">
            <p className="m-0 text-[11px] text-muted">Cancelled</p>
            <p
              data-testid="audit-summary-cancelled"
              className="m-0 text-lg font-semibold text-gray-700"
            >
              {summary.cancelledCount}
            </p>
          </div>
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
                        Пользователь
                      </th>
                      <th className="border-b border-border px-3 py-2 font-semibold text-text">
                        Действие
                      </th>
                      <th className="border-b border-border px-3 py-2 font-semibold text-text">
                        Тип
                      </th>
                      <th className="border-b border-border px-3 py-2 font-semibold text-text">
                        Статус
                      </th>
                      <th className="border-b border-border px-3 py-2 font-semibold text-text">
                        Ресурс
                      </th>
                      <th className="border-b border-border px-3 py-2 font-semibold text-text">
                        Детали
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRecords.map((record) => (
                      <React.Fragment key={record.id}>
                        <tr>
                          <td className="border-b border-border px-3 py-2 align-top text-muted">
                            {formatDateTime(record.at)}
                          </td>
                          <td className="border-b border-border px-3 py-2 align-top text-text">
                            {adminMode
                              ? (actorLookup.get(record.actorId) ?? record.actorId)
                              : user.email}
                          </td>
                          <td className="border-b border-border px-3 py-2 align-top text-text">
                            {localizeAuditAction(record.action)}
                          </td>
                          <td className="border-b border-border px-3 py-2 align-top">
                            <Badge {...deriveActionType(record.action)} />
                          </td>
                          <td className="border-b border-border px-3 py-2 align-top">
                            <Badge {...deriveAuditStatus(record.status)} />
                          </td>
                          <td className="border-b border-border px-3 py-2 align-top text-text">
                            <div className="flex items-center gap-1.5">
                              <div className="flex flex-col gap-0.5">
                                <span>{localizeResourceType(record.resourceType)}</span>
                                <span className="text-xs text-muted">
                                  {record.resourceId ? truncateId(record.resourceId) : "—"}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleRow(record.id)}
                                aria-label={
                                  expandedRows.has(record.id) ? "Скрыть детали" : "Показать детали"
                                }
                                className={`ml-auto shrink-0 text-muted transition-transform duration-150 ${
                                  expandedRows.has(record.id) ? "rotate-90" : ""
                                }`}
                              >
                                ›
                              </button>
                            </div>
                          </td>
                          <td className="border-b border-border px-3 py-2 align-top text-text">
                            {localizeAuditDetails(record.details) || "(без деталей)"}
                          </td>
                        </tr>
                        {expandedRows.has(record.id) && (
                          <tr key={`${record.id}-detail`}>
                            <td colSpan={7} className="border-b border-border bg-surface px-3 py-2">
                              <pre className="overflow-auto text-xs text-muted">
                                {JSON.stringify(
                                  {
                                    resourceId: record.resourceId,
                                    actorId: record.actorId,
                                    action: record.action,
                                    ...(record.metadata != null
                                      ? { metadata: record.metadata }
                                      : {}),
                                  },
                                  null,
                                  2,
                                )}
                              </pre>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
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
