import { create } from "zustand";

export const LAYOUT_DEFAULTS = {
  sidebarWidth: 220,
  assistantWidth: 320,
} as const;

export const LAYOUT_LIMITS = {
  sidebar: { min: 180, max: 360 },
  assistant: { min: 280, max: 640 },
  minMain: 400,
} as const;

const STORAGE_KEYS = {
  sidebarWidth: "dmis.layout.sidebarWidth",
  assistantWidth: "dmis.layout.assistantWidth",
} as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function assistantMaxWidth(viewportWidth = window.innerWidth): number {
  return Math.min(LAYOUT_LIMITS.assistant.max, Math.round(viewportWidth * 0.45));
}

export function clampSidebarWidth(width: number): number {
  return clamp(width, LAYOUT_LIMITS.sidebar.min, LAYOUT_LIMITS.sidebar.max);
}

export function clampAssistantWidth(
  width: number,
  sidebarWidth: number,
  options?: { viewportWidth?: number; reserveMain?: boolean },
): number {
  const viewportWidth = options?.viewportWidth ?? window.innerWidth;
  const max = assistantMaxWidth(viewportWidth);
  let next = clamp(width, LAYOUT_LIMITS.assistant.min, max);
  if (options?.reserveMain !== false) {
    const available = viewportWidth - sidebarWidth - LAYOUT_LIMITS.minMain;
    next = Math.min(next, Math.max(LAYOUT_LIMITS.assistant.min, available));
  }
  return next;
}

function readStoredWidth(
  key: string,
  defaultValue: number,
  normalize: (value: number) => number,
): number {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return defaultValue;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return defaultValue;
    return normalize(parsed);
  } catch {
    return defaultValue;
  }
}

function persistWidth(key: string, width: number): void {
  try {
    localStorage.setItem(key, String(width));
  } catch {
    // localStorage недоступен (приватный режим и т.п.)
  }
}

const initialSidebarWidth = readStoredWidth(
  STORAGE_KEYS.sidebarWidth,
  LAYOUT_DEFAULTS.sidebarWidth,
  clampSidebarWidth,
);
const initialAssistantWidth = readStoredWidth(
  STORAGE_KEYS.assistantWidth,
  LAYOUT_DEFAULTS.assistantWidth,
  (value) => clampAssistantWidth(value, initialSidebarWidth),
);

type UiStoreState = {
  assistantQuery: string;
  pendingLinkedDocumentIds: string[];
  mobileAiOpen: boolean;
  desktopAiOpen: boolean;
  sidebarWidth: number;
  assistantWidth: number;
  setAssistantQuery: (query: string) => void;
  openAiWithQuery: (query?: string) => void;
  addPendingLinkedDocuments: (documentIds: string[]) => void;
  consumePendingLinkedDocuments: () => string[];
  closeMobileAi: () => void;
  closeDesktopAi: () => void;
  setSidebarWidth: (width: number) => void;
  setAssistantWidth: (width: number) => void;
  resetSidebarWidth: () => void;
  resetAssistantWidth: () => void;
};

export const useUiStore = create<UiStoreState>((set, get) => ({
  assistantQuery: "",
  pendingLinkedDocumentIds: [],
  mobileAiOpen: false,
  desktopAiOpen: false,
  sidebarWidth: initialSidebarWidth,
  assistantWidth: initialAssistantWidth,
  setAssistantQuery: (query) => set({ assistantQuery: query }),
  openAiWithQuery: (query) =>
    set((state) => ({
      assistantQuery: typeof query === "string" ? query : state.assistantQuery,
      mobileAiOpen: window.innerWidth < 980,
      desktopAiOpen: window.innerWidth >= 980,
    })),
  addPendingLinkedDocuments: (documentIds) =>
    set((state) => ({
      pendingLinkedDocumentIds: [
        ...new Set([...state.pendingLinkedDocumentIds, ...documentIds.filter(Boolean)]),
      ],
    })),
  consumePendingLinkedDocuments: () => {
    const pending = get().pendingLinkedDocumentIds;
    set({ pendingLinkedDocumentIds: [] });
    return pending;
  },
  closeMobileAi: () => set({ mobileAiOpen: false }),
  closeDesktopAi: () => set({ desktopAiOpen: false }),
  setSidebarWidth: (width) => {
    const sidebarWidth = clampSidebarWidth(width);
    persistWidth(STORAGE_KEYS.sidebarWidth, sidebarWidth);
    const assistantWidth = clampAssistantWidth(get().assistantWidth, sidebarWidth);
    persistWidth(STORAGE_KEYS.assistantWidth, assistantWidth);
    set({ sidebarWidth, assistantWidth });
  },
  setAssistantWidth: (width) => {
    const assistantWidth = clampAssistantWidth(width, get().sidebarWidth);
    persistWidth(STORAGE_KEYS.assistantWidth, assistantWidth);
    set({ assistantWidth });
  },
  resetSidebarWidth: () => {
    get().setSidebarWidth(LAYOUT_DEFAULTS.sidebarWidth);
  },
  resetAssistantWidth: () => {
    get().setAssistantWidth(LAYOUT_DEFAULTS.assistantWidth);
  },
}));
