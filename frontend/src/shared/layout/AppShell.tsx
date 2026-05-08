import type { ReactNode } from "react";
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
  return (
    <div className={`${styles.shell} ${assistantOpen ? styles.shellWithAssistant : ""}`}>
      <div className={`${styles.sidebar} ${mobileSidebarOpen ? styles.mobileSidebarOpen : ""}`}>
        {sidebar}
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

      {assistantOpen ? <aside className={styles.assistant}>{assistant}</aside> : null}

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
