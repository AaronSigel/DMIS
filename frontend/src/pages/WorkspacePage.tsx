import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { apiListDocuments } from "../apiClient";
import { queryKeys } from "../shared/api/queryClient";
import { useUiStore } from "../shared/store/uiStore";
import { AiPanel } from "../features/assistant/AiPanel";
import { DocTable } from "../features/documents/DocTable";
import { MailPage } from "../features/mail/MailPage";
import { CalendarPage } from "../features/calendar/CalendarPage";
import { AuditPage } from "../features/audit/AuditPage";
import { Avatar } from "../shared/ui/Avatar";
import { SectionLabel } from "../shared/ui/SectionLabel";
import { DashboardPage } from "./DashboardPage";
import { DocumentCardPage } from "./DocumentCardPage";
import { SettingsPage } from "./SettingsPage";

type User = { id: string; fullName: string; email: string; roles?: string[] };

function isAdmin(u: User | null) {
  return u?.roles?.includes("ADMIN") ?? false;
}

type NavSearchResultItem = {
  id: string;
  label: string;
  hint?: string;
  onActivate: () => void;
};

type SidebarProps = {
  user: User;
  docCount: number;
  width: number;
  navSearchQuery: string;
  onNavSearchChange: (q: string) => void;
  onNavSearchEnter: () => void;
  navResults: NavSearchResultItem[];
  onNewDoc: () => void;
  section: string;
  onSection: (s: string) => void;
  onLogout: () => void;
  mobile?: boolean;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
};

function Sidebar({
  user,
  docCount,
  width,
  navSearchQuery,
  onNavSearchChange,
  onNavSearchEnter,
  navResults,
  onNewDoc,
  section,
  onSection,
  onLogout,
  mobile = false,
  mobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  function NavItem({
    label,
    count,
    k,
    icon,
  }: {
    label: string;
    count?: number;
    k: string;
    icon: string;
  }) {
    const active = section === k;
    return (
      <button
        onClick={() => {
          onSection(k);
          onCloseMobile?.();
        }}
        className={`flex w-full items-center justify-between rounded-md border-none px-[10px] py-[5px] text-left text-[13px] ${
          active ? "bg-primary/20 text-primary" : "bg-transparent text-text"
        }`}
      >
        <span className="flex items-center gap-[7px]">
          <span className="text-xs opacity-70">{icon}</span>
          {label}
        </span>
        {count !== undefined && <span className="text-xs text-muted">{count}</span>}
      </button>
    );
  }

  return (
    <aside
      className={`flex h-screen shrink-0 flex-col gap-0.5 overflow-y-auto border-r border-border bg-surface-alt px-[10px] py-[14px] ${
        mobile
          ? `fixed left-0 top-0 z-40 transition-transform duration-150 ease-out ${mobileOpen ? "translate-x-0" : "-translate-x-[105%]"}`
          : "relative"
      }`}
      style={{ width }}
    >
      <div className="flex shrink-0 items-center justify-between px-1 pb-[10px]">
        <span className="font-mono text-[20px] font-bold text-primary">DMIS</span>
        <div className="flex items-center gap-1.5">
          <span className="whitespace-nowrap rounded-xl bg-danger-soft px-1.5 py-[2px] text-[10px] font-semibold text-danger">
            ● audit on
          </span>
          {mobile && (
            <button
              onClick={onCloseMobile}
              className="rounded-md border border-border bg-white px-2 py-1 text-xs text-text"
            >
              Закрыть
            </button>
          )}
          <button
            onClick={onLogout}
            title="Выйти"
            className="cursor-pointer border-none bg-transparent p-0"
          >
            <Avatar name={user.fullName} />
          </button>
        </div>
      </div>

      <div className="relative mb-1.5 shrink-0">
        <span className="pointer-events-none absolute left-[9px] top-1/2 -translate-y-1/2 text-sm text-muted">
          ⌕
        </span>
        <input
          id="dmis-nav-search-input"
          value={navSearchQuery}
          onChange={(e) => onNavSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onNavSearchEnter();
            }
          }}
          aria-label="Поиск разделов и команд"
          placeholder="Разделы и команды…"
          autoComplete="off"
          className="box-border w-full rounded-[7px] border border-border bg-surface py-[7px] pl-[26px] pr-[10px] text-[13px] outline-none"
        />
        <div
          role="region"
          aria-label="Подсказки навигации"
          className={`mt-1.5 max-h-[220px] overflow-y-auto rounded-lg bg-surface ${
            navResults.length
              ? "border border-border px-1 py-1.5"
              : "border border-dashed border-border px-[10px] py-[10px]"
          }`}
        >
          {navResults.length === 0 ? (
            <p className="m-0 text-xs leading-[1.45] text-muted">
              {navSearchQuery.trim()
                ? "Ничего не найдено. Enter — перейти к документам и искать по названию на странице."
                : "Введите название раздела или команды. Enter — выполнить первый пункт списка."}
            </p>
          ) : (
            <ul className="m-0 grid list-none gap-1 px-1 py-0">
              {navResults.map((item, idx) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => item.onActivate()}
                    title={item.hint}
                    className={`flex w-full items-start justify-between gap-2 rounded-md border-none px-[10px] py-2 text-left text-[13px] text-text ${
                      idx === 0 ? "bg-primary/15" : "bg-transparent"
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.hint && (
                      <span className="shrink-0 text-[11px] text-muted">{item.hint}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <button
        onClick={onNewDoc}
        className="mb-2.5 flex shrink-0 items-center justify-center gap-1.5 rounded-lg border-0 bg-primary px-4 py-2 text-sm font-semibold text-white"
      >
        + Новый
      </button>

      <SectionLabel>рабочее пространство</SectionLabel>
      <NavItem label="Дашборд" k="dashboard" icon="◈" />
      <NavItem label="Документы" count={docCount} k="documents" icon="📄" />
      <SectionLabel>сервисы</SectionLabel>
      <NavItem label="Почта" k="mail" icon="✉" />
      <NavItem label="Календарь" k="calendar" icon="📅" />
      <SectionLabel>контроль</SectionLabel>
      <NavItem label={isAdmin(user) ? "Журнал аудита" : "Мои AI-действия"} k="audit" icon="○" />
      <NavItem label="Настройки" k="settings" icon="☰" />
      {isAdmin(user) && <NavItem label="ACL (скоро)" k="acl" icon="🔒" />}
    </aside>
  );
}

type WorkspacePageProps = {
  user: User;
  token: string;
  onSessionExpired: () => void;
  onTokenRefresh: (t: string) => void;
};

export function WorkspacePage({
  user,
  token,
  onSessionExpired,
  onTokenRefresh,
}: WorkspacePageProps) {
  const location = useLocation();
  const [navSearchQuery, setNavSearchQuery] = useState("");
  const [uploadTrigger, setUploadTrigger] = useState(0);
  const [sidebarWidth, setSidebarWidth] = useState(220);
  const [aiPanelWidth, setAiPanelWidth] = useState(288);
  const [isNarrow, setIsNarrow] = useState(() => window.innerWidth < 980);
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const mobileAiOpen = useUiStore((state) => state.mobileAiOpen);
  const desktopAiOpen = useUiStore((state) => state.desktopAiOpen);
  const openAiWithQuery = useUiStore((state) => state.openAiWithQuery);
  const closeMobileAi = useUiStore((state) => state.closeMobileAi);
  const closeDesktopAi = useUiStore((state) => state.closeDesktopAi);
  const resizeMode = useUiStore((state) => state.resizeMode);
  const stopResize = useUiStore((state) => state.stopResize);
  const startResize = useUiStore((state) => state.startResize);
  const navigate = useNavigate();
  const section = location.pathname.split("/")[1] || "dashboard";

  useEffect(() => {
    const onResize = () => {
      setIsNarrow(window.innerWidth < 980);
      setViewportWidth(window.innerWidth);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!isNarrow) {
      setMobileSidebarOpen(false);
      closeMobileAi();
      return;
    }
    closeDesktopAi();
  }, [closeDesktopAi, closeMobileAi, isNarrow]);

  useEffect(() => {
    if (!isNarrow) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || !mobileSidebarOpen) return;
      e.preventDefault();
      setMobileSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isNarrow, mobileSidebarOpen]);

  useEffect(() => {
    if (isNarrow || !desktopAiOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      closeDesktopAi();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeDesktopAi, desktopAiOpen, isNarrow]);

  useEffect(() => {
    if (isNarrow) return;
    const onMouseMove = (event: MouseEvent) => {
      if (!resizeMode) return;
      if (resizeMode === "sidebar") {
        const nextWidth = Math.min(Math.max(event.clientX, 180), 420);
        setSidebarWidth(nextWidth);
        return;
      }
      const nextWidth = Math.min(Math.max(window.innerWidth - event.clientX, 240), 560);
      setAiPanelWidth(nextWidth);
    };

    const onMouseUp = () => {
      stopResize();
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isNarrow, resizeMode, stopResize]);

  const documentsCountQuery = useQuery({
    queryKey: queryKeys.documents.count,
    queryFn: () => apiListDocuments({ page: 0, size: 1 }, onSessionExpired, onTokenRefresh),
    enabled: !!token,
  });
  const docCount = documentsCountQuery.data?.totalElements ?? 0;

  const handleSection = useCallback(
    (s: string) => {
      const map: Record<string, string> = {
        dashboard: "/dashboard",
        documents: "/documents",
        mail: "/mail",
        calendar: "/calendar",
        audit: "/audit",
        settings: "/settings",
        acl: "/settings",
      };
      if (s === "documents") {
        setUploadTrigger(0);
      }
      navigate(map[s] ?? "/dashboard");
    },
    [navigate],
  );

  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);

  const handleNewDoc = useCallback(() => {
    navigate("/documents");
    setUploadTrigger((n) => n + 1);
  }, [navigate]);

  const navResults = useMemo((): NavSearchResultItem[] => {
    const q = navSearchQuery.trim().toLowerCase();
    const handoff: NavSearchResultItem[] = q
      ? [
          {
            id: "handoff-docs",
            label: `Искать «${navSearchQuery.trim()}» в списке документов`,
            hint: "страница «Документы»",
            onActivate: () => {
              handleSection("documents");
              closeMobileSidebar();
            },
          },
        ]
      : [];

    const core: NavSearchResultItem[] = [
      {
        id: "sec-dash",
        label: "Дашборд",
        hint: "раздел",
        onActivate: () => {
          handleSection("dashboard");
          closeMobileSidebar();
        },
      },
      {
        id: "sec-docs",
        label: "Документы",
        hint: `${docCount} в системе`,
        onActivate: () => {
          handleSection("documents");
          closeMobileSidebar();
        },
      },
      {
        id: "cmd-new",
        label: "Новый документ",
        hint: "загрузка",
        onActivate: () => {
          handleNewDoc();
          closeMobileSidebar();
        },
      },
      {
        id: "sec-mail",
        label: "Почта",
        hint: "раздел",
        onActivate: () => {
          handleSection("mail");
          closeMobileSidebar();
        },
      },
      {
        id: "sec-cal",
        label: "Календарь",
        hint: "раздел",
        onActivate: () => {
          handleSection("calendar");
          closeMobileSidebar();
        },
      },
      {
        id: "sec-settings",
        label: "Настройки",
        hint: "раздел",
        onActivate: () => {
          handleSection("settings");
          closeMobileSidebar();
        },
      },
      {
        id: "sec-audit",
        label: isAdmin(user) ? "Журнал аудита" : "Мои AI-действия",
        hint: "раздел",
        onActivate: () => {
          handleSection("audit");
          closeMobileSidebar();
        },
      },
    ];

    if (isAdmin(user)) {
      core.push({
        id: "sec-acl",
        label: "ACL",
        hint: "скоро",
        onActivate: () => {
          handleSection("acl");
          closeMobileSidebar();
        },
      });
    }

    const matches = (item: NavSearchResultItem) => {
      const hay = `${item.label} ${item.hint ?? ""}`.toLowerCase();
      if (!q) return true;
      return hay.includes(q) || q.split(/\s+/).every((w) => hay.includes(w));
    };

    const filteredCore = core.filter(matches);
    const merged = [...handoff, ...filteredCore];
    if (!q) return [];
    return merged;
  }, [navSearchQuery, docCount, user, handleSection, handleNewDoc, closeMobileSidebar]);

  function handleNavSearchEnter() {
    const firstResult = navResults[0];
    if (firstResult) {
      firstResult.onActivate();
      return;
    }
    if (navSearchQuery.trim()) {
      handleSection("documents");
      closeMobileSidebar();
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface text-text">
      <Sidebar
        user={user}
        docCount={docCount}
        width={isNarrow ? 220 : sidebarWidth}
        navSearchQuery={navSearchQuery}
        onNavSearchChange={setNavSearchQuery}
        onNavSearchEnter={handleNavSearchEnter}
        navResults={navResults}
        onNewDoc={handleNewDoc}
        section={section}
        onSection={handleSection}
        onLogout={onSessionExpired}
        mobile={isNarrow}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />
      {isNarrow && mobileSidebarOpen && (
        <div
          aria-hidden
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-[34] bg-black/20"
        />
      )}
      {isNarrow && !mobileSidebarOpen && (
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="fixed left-2.5 top-2.5 z-[32] rounded-md border border-border bg-white px-3 py-1 text-xs text-text"
        >
          Меню
        </button>
      )}
      {isNarrow && !mobileAiOpen && (
        <button
          type="button"
          onClick={() => openAiWithQuery()}
          className="fixed right-2.5 top-2.5 z-[32] rounded-md border border-border bg-white px-3 py-1 text-xs text-text"
        >
          Ассистент
        </button>
      )}
      {!isNarrow && (
        <div
          onMouseDown={() => {
            startResize("sidebar");
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
          }}
          className="w-[6px] shrink-0 cursor-col-resize border-x border-border bg-transparent"
          title="Изменить ширину левой панели"
        />
      )}
      <div
        className={`box-border flex min-w-0 flex-1 flex-col overflow-hidden ${isNarrow ? "pt-[52px]" : ""}`}
      >
        <Routes>
          <Route
            path="/dashboard"
            element={
              <DashboardPage
                token={token}
                onSessionExpired={onSessionExpired}
                onTokenRefresh={onTokenRefresh}
              />
            }
          />
          <Route
            path="/documents"
            element={
              <DocTable
                token={token}
                user={user}
                onSessionExpired={onSessionExpired}
                onTokenRefresh={onTokenRefresh}
                section="documents"
                uploadTrigger={uploadTrigger}
                searchQuery={navSearchQuery}
              />
            }
          />
          <Route
            path="/mail"
            element={
              <MailPage
                token={token}
                onSessionExpired={onSessionExpired}
                onTokenRefresh={onTokenRefresh}
              />
            }
          />
          <Route
            path="/calendar"
            element={
              <CalendarPage
                token={token}
                onSessionExpired={onSessionExpired}
                onTokenRefresh={onTokenRefresh}
              />
            }
          />
          <Route
            path="/audit"
            element={
              <AuditPage
                token={token}
                user={user}
                onSessionExpired={onSessionExpired}
                onTokenRefresh={onTokenRefresh}
              />
            }
          />
          <Route path="/settings" element={<SettingsPage user={user} />} />
          <Route
            path="/documents/:documentId"
            element={
              <DocumentCardPage
                token={token}
                onSessionExpired={onSessionExpired}
                onTokenRefresh={onTokenRefresh}
              />
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
      {!isNarrow && desktopAiOpen && (
        <div className="flex h-screen">
          <div
            onMouseDown={() => {
              startResize("ai");
              document.body.style.cursor = "col-resize";
              document.body.style.userSelect = "none";
            }}
            className="w-[6px] shrink-0 cursor-col-resize border-x border-border bg-transparent"
            title="Изменить ширину AI-панели"
          />
          <AiPanel
            token={token}
            width={aiPanelWidth}
            height="100%"
            onSessionExpired={onSessionExpired}
            onTokenRefresh={onTokenRefresh}
            onClose={closeDesktopAi}
          />
        </div>
      )}
      {isNarrow && mobileAiOpen && (
        <div
          role="presentation"
          onClick={closeMobileAi}
          className="fixed inset-0 z-[46] flex justify-end bg-black/20"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="h-full border-l border-border bg-surface"
            style={{ width: viewportWidth, maxWidth: 520 }}
          >
            <AiPanel
              token={token}
              width={Math.min(viewportWidth, 520)}
              height="100%"
              onSessionExpired={onSessionExpired}
              onTokenRefresh={onTokenRefresh}
              onClose={closeMobileAi}
            />
          </div>
        </div>
      )}
    </div>
  );
}
