import { useUiStore } from "../store/uiStore";

/**
 * Круглая кнопка открытия/закрытия правой панели ассистента на десктопе.
 * На узкой ширине панель открывается через глобальную кнопку «Ассистент» в WorkspacePage.
 */
export function AssistantLauncher() {
  const desktopAiOpen = useUiStore((state) => state.desktopAiOpen);
  const toggleDesktopAi = useUiStore((state) => state.toggleDesktopAi);

  return (
    <button
      type="button"
      onClick={toggleDesktopAi}
      aria-label={desktopAiOpen ? "Закрыть ассистента" : "Открыть ассистента"}
      title={desktopAiOpen ? "Закрыть ассистента" : "Открыть ассистента"}
      className="rounded-full border border-border bg-white p-1 shadow-sm transition-transform duration-200 ease-out hover:scale-105 hover:shadow-md active:scale-95"
    >
      <span
        className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold ${
          desktopAiOpen ? "bg-primary text-white" : "bg-surface text-text"
        }`}
      >
        AI
      </span>
    </button>
  );
}
