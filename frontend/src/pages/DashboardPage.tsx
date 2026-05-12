import { useQuery } from "@tanstack/react-query";
import {
  apiBaseUrl,
  apiListCalendarEvents,
  apiListDocuments,
  fetchWithAuth,
  parseAuthenticatedJson,
} from "../apiClient";
import { queryKeys } from "../shared/api/queryClient";
import { mapApiErrorToMessage } from "../shared/lib/mapApiErrorToMessage";
import { PageHeader } from "../shared/ui/PageHeader";

type AiAction = { id: string; intent: string; status: "DRAFT" | "CONFIRMED" | "EXECUTED" };

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

export function DashboardPage({ token, onSessionExpired, onTokenRefresh }: DashboardPageProps) {
  const metricsQuery = useQuery({
    queryKey: queryKeys.dashboard.metrics,
    enabled: !!token,
    queryFn: async () => {
      const [docs, actionsRes, auditRes, healthRes, calendarEvents] = await Promise.all([
        apiListDocuments({ page: 0, size: 1 }, onSessionExpired, onTokenRefresh),
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
        actionCount: actions.length,
        executedCount: actions.filter((a) => a.status === "EXECUTED").length,
        auditCount,
        calendarCount: calendarEvents.length,
        systemHealth: healthRes.ok ? "ok" : "degraded",
      };
    },
  });
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

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader title="Дашборд" />
      <div className="flex-1 overflow-y-auto p-6">
        {error && <p className="mb-3 mt-0 text-danger">{error}</p>}
        <div className="mb-2.5 grid grid-cols-2 gap-2.5">
          <Card title="Документы" value={String(docCount)} subtitle="Всего документов в системе" />
          <Card
            title="AI-действия"
            value={String(actionCount)}
            subtitle={`Выполнено: ${executedCount}`}
          />
          <Card
            title="Аудит-события"
            value={String(auditCount)}
            subtitle="Записи журнала аудита (доступные текущей роли)"
          />
          <Card
            title="События календаря"
            value={String(calendarCount)}
            subtitle="Всего событий в персональном календаре"
          />
          <Card
            title="Состояние системы"
            value={systemHealth === "ok" ? "OK" : "DEGRADED"}
            subtitle={`API: ${apiBaseUrl}`}
          />
        </div>
        <div className="rounded-[10px] border border-border bg-white p-[14px]">
          <p className="mb-2 mt-0 text-[13px] font-semibold text-text">Операционный срез</p>
          <p className="mb-1.5 mt-0 text-xs text-muted">
            Исполнение AI-действий:{" "}
            {actionCount === 0
              ? "данные отсутствуют"
              : `${executedCount} из ${actionCount} в статусе EXECUTED`}
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
      </div>
    </div>
  );
}
