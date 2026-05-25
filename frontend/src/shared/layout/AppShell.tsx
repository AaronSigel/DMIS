import { useCallback, useRef, type CSSProperties, type ReactNode } from "react";
import { useUiStore } from "../store/uiStore";
import styles from "./AppShell.module.css";

type AppShellProps = {
  sidebar: ReactNode;
  main: ReactNode;
  assistant: ReactNode;
  assistantOpen: boolean;
  mobileSidebarOpen: boolean;
  mobileAssistantOpen: boolean;
  onOpenSidebar: () => void;
  onCloseSidebar: () => void;
  onCloseAssistant: () => void;
};

type DragState = {
  startX: number;
  startWidth: number;
};

function capturePointer(target: HTMLElement, pointerId: number): void {
  if (typeof target.setPointerCapture === "function") {
    target.setPointerCapture(pointerId);
  }
}

function releasePointer(target: HTMLElement, pointerId: number): void {
  if (
    typeof target.releasePointerCapture === "function" &&
    typeof target.hasPointerCapture === "function" &&
    target.hasPointerCapture(pointerId)
  ) {
    target.releasePointerCapture(pointerId);
  }
}

export function AppShell({
  sidebar,
  main,
  assistant,
  assistantOpen,
  mobileSidebarOpen,
  mobileAssistantOpen,
  onOpenSidebar,
  onCloseSidebar,
  onCloseAssistant,
}: AppShellProps) {
  const sidebarWidth = useUiStore((state) => state.sidebarWidth);
  const assistantWidth = useUiStore((state) => state.assistantWidth);
  const setSidebarWidth = useUiStore((state) => state.setSidebarWidth);
  const setAssistantWidth = useUiStore((state) => state.setAssistantWidth);
  const resetSidebarWidth = useUiStore((state) => state.resetSidebarWidth);
  const resetAssistantWidth = useUiStore((state) => state.resetAssistantWidth);

  const sidebarDragRef = useRef<DragState | null>(null);
  const assistantDragRef = useRef<DragState | null>(null);

  const shellStyle = {
    "--sidebar-width": `${sidebarWidth}px`,
    "--assistant-width": `${assistantWidth}px`,
  } as CSSProperties;

  const endBodyDrag = useCallback(() => {
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  }, []);

  const onSidebarPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      capturePointer(e.currentTarget, e.pointerId);
      sidebarDragRef.current = { startX: e.clientX, startWidth: sidebarWidth };
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
    },
    [sidebarWidth],
  );

  const onSidebarPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!sidebarDragRef.current) return;
      const delta = e.clientX - sidebarDragRef.current.startX;
      setSidebarWidth(sidebarDragRef.current.startWidth + delta);
    },
    [setSidebarWidth],
  );

  const onSidebarPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!sidebarDragRef.current) return;
      sidebarDragRef.current = null;
      endBodyDrag();
      releasePointer(e.currentTarget, e.pointerId);
    },
    [endBodyDrag],
  );

  const onAssistantPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      capturePointer(e.currentTarget, e.pointerId);
      assistantDragRef.current = { startX: e.clientX, startWidth: assistantWidth };
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
    },
    [assistantWidth],
  );

  const onAssistantPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!assistantDragRef.current) return;
      const delta = assistantDragRef.current.startX - e.clientX;
      setAssistantWidth(assistantDragRef.current.startWidth + delta);
    },
    [setAssistantWidth],
  );

  const onAssistantPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!assistantDragRef.current) return;
      assistantDragRef.current = null;
      endBodyDrag();
      releasePointer(e.currentTarget, e.pointerId);
    },
    [endBodyDrag],
  );

  return (
    <div
      className={`${styles.shell} ${assistantOpen ? styles.shellWithAssistant : ""}`}
      style={shellStyle}
    >
      <div className={`${styles.sidebarWrap} ${mobileSidebarOpen ? styles.mobileSidebarOpen : ""}`}>
        <div className={styles.sidebar}>{sidebar}</div>
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Ширина навигации"
          tabIndex={0}
          className={`${styles.resizeHandle} ${styles.resizeHandleSidebar}`}
          onPointerDown={onSidebarPointerDown}
          onPointerMove={onSidebarPointerMove}
          onPointerUp={onSidebarPointerUp}
          onPointerCancel={onSidebarPointerUp}
          onDoubleClick={resetSidebarWidth}
        />
      </div>

      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Закрыть меню"
          className={styles.overlay}
          onClick={onCloseSidebar}
        />
      )}
      {!mobileSidebarOpen && (
        <button type="button" onClick={onOpenSidebar} className={styles.menuButton}>
          Меню
        </button>
      )}

      <main className={styles.main}>{main}</main>

      {assistantOpen ? (
        <div className={styles.assistantWrap}>
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Ширина ассистента"
            tabIndex={0}
            className={`${styles.resizeHandle} ${styles.resizeHandleAssistant}`}
            onPointerDown={onAssistantPointerDown}
            onPointerMove={onAssistantPointerMove}
            onPointerUp={onAssistantPointerUp}
            onPointerCancel={onAssistantPointerUp}
            onDoubleClick={resetAssistantWidth}
          />
          <aside className={styles.assistant}>{assistant}</aside>
        </div>
      ) : null}

      {mobileAssistantOpen && (
        <div
          role="presentation"
          onClick={onCloseAssistant}
          className={styles.mobileAssistantOverlay}
        >
          <div onClick={(e) => e.stopPropagation()} className={styles.mobileAssistant}>
            {assistant}
          </div>
        </div>
      )}
    </div>
  );
}
