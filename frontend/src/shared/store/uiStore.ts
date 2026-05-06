import { create } from "zustand";

type ResizeMode = "sidebar" | "ai" | null;

type UiStoreState = {
  assistantQuery: string;
  mobileAiOpen: boolean;
  resizeMode: ResizeMode;
  setAssistantQuery: (query: string) => void;
  openAiWithQuery: (query?: string) => void;
  closeMobileAi: () => void;
  startResize: (mode: Exclude<ResizeMode, null>) => void;
  stopResize: () => void;
};

export const useUiStore = create<UiStoreState>((set) => ({
  assistantQuery: "",
  mobileAiOpen: false,
  resizeMode: null,
  setAssistantQuery: (query) => set({ assistantQuery: query }),
  openAiWithQuery: (query) =>
    set((state) => ({
      assistantQuery: typeof query === "string" ? query : state.assistantQuery,
      mobileAiOpen: true,
    })),
  closeMobileAi: () => set({ mobileAiOpen: false }),
  startResize: (mode) => set({ resizeMode: mode }),
  stopResize: () => set({ resizeMode: null }),
}));
