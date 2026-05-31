import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  apiBaseUrl,
  apiListCalendarEvents,
  apiListDocuments,
  fetchWithAuth,
  parseAuthenticatedJson,
} from "../apiClient";
import { queryKeys } from "../shared/api/queryClient";
import { mapApiErrorToMessage } from "../shared/lib/mapApiErrorToMessage";
import { localizeStatus, localizeIntent } from "../shared/lib/localizeDomain";
import { PageHeader } from "../shared/ui/PageHeader";

type AiAction = { id: string; intent: string; status: "DRAFT" | "CONFIRMED" | "EXECUTED" };

type AiActionFull = AiAction & {
  entities?: Record<string, unknown> | null;
};

type DashboardPageProps = {
  token: string;
  onSessionExpired: () => void;
  onTokenRefresh: (t: string) => void;
};

function Card({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
  return (
    <div className="rounded-[10px] border border-border bg-white p-[14px]">
      <p className="mb-2 mt-0 text-xs text-muted">{title}</p>
      <p className="m-0 text-2xl font-bold text-text">{value}</p>
      {subtitle && <p className="mb-0 mt-2 text-xs text-muted">{subtitle}</p>}
    </div>
  );
}

function ClickableCard({
  title,
  value,
  subtitle,
  onClick,
}: {
  title: string;
  value: string;
  subtitle?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={title}
      onClick={onClick}
      className="w-full rounded-[10px] border border-border bg-white p-[14px] text-left cursor-pointer hover:border-primary hover:shadow-sm transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <p className="mb-2 mt-0 text-xs text-muted">{title}</p>
      <p className="m-0 text-2xl font-bold text-text">{value}</p>
      {subtitle && <p className="mb-0 mt-2 text-xs text-muted">{subtitle}</p>}
    </button>
  );
}

export function DashboardPage({ token, onSessionExpired, onTokenRefresh }: DashboardPageProps) {
  const navigate = useNavigate();

  const metricsQuery = useQuery({
    queryKey: queryKeys.dashboard.metrics,
    enabled: !!token,
    queryFn: async () => {
      const [docs, actionsRes, auditRes, healthRes, calendarEvents] = await Promise.all([
        apiListDocuments({ page: 0, size: 3 }, onSessionExpired, onTokenRefresh),
        fetchWithAuth(`${apiBaseUrl}/actions`, {}, onTokenRefresh),
        fetchWithAuth(`${apiBaseUrl}/audit`, {}, onTokenRefresh),
        fetch(`${apiBaseUrl}/health`),
        apiListCalendarEvents(undefined, onSessionExpired, onTokenRefresh),
      ]);
      let actions: AiAction[] = [];
      if (actionsRes.ok) {
        actions = await parseAuthenticatedJson<AiAction[]>(actionsRes, onSessionExpired);
      }
      let auditCount = 0;
      if (auditRes.ok) {
        const audits = await parseAuthenticatedJson<unknown[]>(auditRes, onSessionExpired);
        auditCount = audits.length;
      }
      return {
        docCount: docs.totalElements,
        recentDocs: docs.content,
        actionCount: actions.length,
        executedCount: actions.filter((a) => a.status === "EXECUTED").length,
        auditCount,
        calendarCount: calendarEvents.length,
        upcomingEvents: [...calendarEvents]
          .filter((ev) => new Date(ev.startIso).getTime() >= Date.now())
          .sort((a, b) => new Date(a.startIso).getTime() - new Date(b.startIso).getTime())
          .slice(0, 3),
        systemHealth: healthRes.ok ? "ok" : "degraded",
      };
    },
  });

  const draftsQuery = useQuery<AiActionFull[]>({
    queryKey: [...queryKeys.actions.list, "dashboard-drafts"],
    enabled: !!token,
    retry: false,
    queryFn: async () => {
      const res = await fetchWithAuth(`${apiBaseUrl}/actions`, {}, onTokenRefresh);
      if (!res.ok) throw new Error("actions fetch failed");
      return parseAuthenticatedJson<AiActionFull[]>(res, onSessionExpired);
    },
  });

  const draftActions = (draftsQuery.data ?? []).filter((a) => a.status === "DRAFT");
  const visibleDrafts = draftActions.slice(0, 5);
  const overflowCount = draftActions.length - visibleDrafts.length;
  const showDrafts = !draftsQuery.isLoading && !draftsQuery.isError && draftActions.length > 0;

  const docCount = metricsQuery.data?.docCount ?? 0;
  const actionCount = metricsQuery.data?.actionCount ?? 0;
  const executedCount = metricsQuery.data?.executedCount ?? 0;
  const auditCount = metricsQuery.data?.auditCount ?? 0;
  const calendarCount = metricsQuery.data?.calendarCount ?? 0;
  const systemHealth = metricsQuery.data?.systemHealth ?? "unknown";
  const error = metricsQuery.error
    ? mapApiErrorToMessage(
        metricsQuery.error instanceof Error
          ? metricsQuery.error.message
          : "Не удалось загрузить метрики",
      )
    : "";
  const recentDocs = metricsQuery.data?.recentDocs ?? [];
  const upcomingEvents = metricsQuery.data?.upcomingEvents ?? [];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader title="Дашборд" />
      <div className="flex-1 overflow-y-auto p-6">
        {error && <p className="mb-3 mt-0 text-danger">{error}</p>}
        <div className="mb-2.5 grid grid-cols-2 gap-2.5">
          <ClickableCard
            title="Документы"
            value={String(docCount)}
            subtitle="Всего документов в системе"
            onClick={() => navigate("/documents")}
          />
          <ClickableCard
            title="ИИ-действия"
            value={String(actionCount)}
            subtitle={`Выполнено: ${executedCount}`}
            onClick={() => navigate("/audit")}
          />
          <ClickableCard
            title="Аудит-события"
            value={String(auditCount)}
            subtitle="Записи журнала аудита (доступные текущей роли)"
            onClick={() => navigate("/audit")}
          />
          <ClickableCard
            title="События календаря"
            value={String(calendarCount)}
            subtitle="Всего событий в персональном календаре"
            onClick={() => navigate("/calendar")}
          />
          <Card
            title="Состояние системы"
            value={systemHealth === "ok" ? "норма" : "есть проблемы"}
            subtitle={`Адрес сервера: ${apiBaseUrl}`}
          />
        </div>
        {showDrafts && (
          <div className="mt-6 rounded-[10px] border border-border bg-white p-[14px]">
            <p className="mb-3 mt-0 text-[13px] font-semibold text-text">Ожидают подтверждения</p>
            <ul className="m-0 list-none p-0">
              {visibleDrafts.map((action) => {
                const entitySubtitle = action.entities
                  ? (Object.values(action.entities)[0] as string | undefined)
                  : undefined;
                return (
                  <li
                    key={action.id}
                    className="mb-2 flex items-center justify-between gap-2 last:mb-0"
                  >
                    <span className="flex flex-col">
                      <span className="text-xs font-medium text-text">
                        {localizeIntent(action.intent)}
                      </span>
                      {entitySubtitle && (
                        <span className="text-xs text-muted">{String(entitySubtitle)}</span>
                      )}
                    </span>
                    <button
                      type="button"
                      aria-label="Перейти"
                      onClick={() => navigate("/audit")}
                      className="shrink-0 text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      Перейти →
                    </button>
                  </li>
                );
              })}
            </ul>
            {overflowCount > 0 && (
              <p className="mb-0 mt-2 text-xs text-muted">+ {overflowCount} ещё</p>
            )}
          </div>
        )}
        <div className="rounded-[10px] border border-border bg-white p-[14px]">
          <p className="mb-2 mt-0 text-[13px] font-semibold text-text">Операционный срез</p>
          <p className="mb-1.5 mt-0 text-xs text-muted">
            Исполнение ИИ-действий:{" "}
            {actionCount === 0
              ? "данные отсутствуют"
              : `${executedCount} из ${actionCount} в статусе «${localizeStatus("EXECUTED")}»`}
            .
          </p>
          <p className="m-0 text-xs text-muted">
            Аудит:{" "}
            {auditCount > 0
              ? "журнал доступен и пополняется"
              : "нет доступных записей или ограничен доступ по роли"}
            .
          </p>
        </div>
        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          <div className="rounded-[10px] border border-border bg-white p-[14px]">
            <p className="mb-2 mt-0 text-[13px] font-semibold text-text">Последние документы</p>
            {recentDocs.length === 0 ? (
              <p className="m-0 text-xs text-muted">Пока нет документов.</p>
            ) : (
              <ul className="m-0 list-none p-0">
                {recentDocs.map((doc) => (
                  <li key={doc.id} className="mb-1 last:mb-0">
                    <button
                      type="button"
                      className="text-left text-xs text-primary hover:underline"
                      onClick={() => navigate(`/documents/${doc.id}`)}
                    >
                      {doc.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-[10px] border border-border bg-white p-[14px]">
            <p className="mb-2 mt-0 text-[13px] font-semibold text-text">Ближайшие события</p>
            {upcomingEvents.length === 0 ? (
              <p className="m-0 text-xs text-muted">Событий на сегодня/ближайшее время нет.</p>
            ) : (
              <ul className="m-0 list-none p-0">
                {upcomingEvents.map((ev) => (
                  <li key={ev.id} className="mb-1 last:mb-0">
                    <button
                      type="button"
                      className="text-left text-xs text-primary hover:underline"
                      onClick={() => navigate("/calendar")}
                    >
                      {ev.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
