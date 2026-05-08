import { create } from "zustand";

type ResizeMode = "sidebar" | "ai" | null;

type UiStoreState = {
  assistantQuery: string;
  mobileAiOpen: boolean;
  desktopAiOpen: boolean;
  resizeMode: ResizeMode;
  setAssistantQuery: (query: string) => void;
  openAiWithQuery: (query?: string) => void;
  closeMobileAi: () => void;
  openDesktopAi: () => void;
  closeDesktopAi: () => void;
  toggleDesktopAi: () => void;
  startResize: (mode: Exclude<ResizeMode, null>) => void;
  stopResize: () => void;
};

export const useUiStore = create<UiStoreState>((set) => ({
  assistantQuery: "",
  mobileAiOpen: false,
  desktopAiOpen: false,
  resizeMode: null,
  setAssistantQuery: (query) => set({ assistantQuery: query }),
  openAiWithQuery: (query) =>
    set((state) => ({
      assistantQuery: typeof query === "string" ? query : state.assistantQuery,
      mobileAiOpen: window.innerWidth < 980,
      desktopAiOpen: window.innerWidth >= 980,
    })),
  closeMobileAi: () => set({ mobileAiOpen: false }),
  openDesktopAi: () => set({ desktopAiOpen: true }),
  closeDesktopAi: () => set({ desktopAiOpen: false }),
  toggleDesktopAi: () => set((state) => ({ desktopAiOpen: !state.desktopAiOpen })),
  startResize: (mode) => set({ resizeMode: mode }),
  stopResize: () => set({ resizeMode: null }),
}));
