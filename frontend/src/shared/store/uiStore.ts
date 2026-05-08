import { create } from "zustand";

type UiStoreState = {
  assistantQuery: string;
  mobileAiOpen: boolean;
  desktopAiOpen: boolean;
  setAssistantQuery: (query: string) => void;
  openAiWithQuery: (query?: string) => void;
  closeMobileAi: () => void;
  closeDesktopAi: () => void;
};

export const useUiStore = create<UiStoreState>((set) => ({
  assistantQuery: "",
  mobileAiOpen: false,
  desktopAiOpen: false,
  setAssistantQuery: (query) => set({ assistantQuery: query }),
  openAiWithQuery: (query) =>
    set((state) => ({
      assistantQuery: typeof query === "string" ? query : state.assistantQuery,
      mobileAiOpen: window.innerWidth < 980,
      desktopAiOpen: window.innerWidth >= 980,
    })),
  closeMobileAi: () => set({ mobileAiOpen: false }),
  closeDesktopAi: () => set({ desktopAiOpen: false }),
}));
