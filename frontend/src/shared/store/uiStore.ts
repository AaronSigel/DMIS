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

export type AssistantWorkspaceModule = "documents" | "mail" | "calendar" | "workspace";

export type AssistantContextObject =
  | { type: "DOCUMENT"; id: string; title?: string }
  | { type: "FOLDER"; id?: string; label?: string }
  | null;

export type AssistantContextSnapshot = {
  module: AssistantWorkspaceModule;
  object: AssistantContextObject;
};

const DEFAULT_ASSISTANT_CONTEXT: AssistantContextSnapshot = {
  module: "workspace",
  object: null,
};

function pathnameToAssistantModule(pathname: string): AssistantWorkspaceModule {
  const section = pathname.split("/").filter(Boolean)[0];
  if (section === "documents") return "documents";
  if (section === "mail") return "mail";
  if (section === "calendar") return "calendar";
  return "workspace";
}

type UiStoreState = {
  assistantQuery: string;
  assistantPrefillSeq: number;
  pendingLinkedDocumentIds: string[];
  pendingNewAssistantThread: boolean;
  assistantContext: AssistantContextSnapshot;
  mobileAiOpen: boolean;
  desktopAiOpen: boolean;
  sidebarWidth: number;
  assistantWidth: number;
  setAssistantQuery: (query: string) => void;
  setAssistantContext: (ctx: AssistantContextSnapshot) => void;
  setAssistantContextFromPath: (pathname: string) => void;
  clearAssistantContextObject: () => void;
  openAiWithQuery: (query?: string, options?: { newThread?: boolean }) => void;
  addPendingLinkedDocuments: (documentIds: string[]) => void;
  consumePendingLinkedDocuments: () => string[];
  consumePendingNewAssistantThread: () => boolean;
  closeMobileAi: () => void;
  closeDesktopAi: () => void;
  setSidebarWidth: (width: number) => void;
  setAssistantWidth: (width: number) => void;
  resetSidebarWidth: () => void;
  resetAssistantWidth: () => void;
};

export const useUiStore = create<UiStoreState>((set, get) => ({
  assistantQuery: "",
  assistantPrefillSeq: 0,
  pendingLinkedDocumentIds: [],
  pendingNewAssistantThread: false,
  assistantContext: DEFAULT_ASSISTANT_CONTEXT,
  mobileAiOpen: false,
  desktopAiOpen: false,
  sidebarWidth: initialSidebarWidth,
  assistantWidth: initialAssistantWidth,
  setAssistantQuery: (query) => set({ assistantQuery: query }),
  setAssistantContext: (ctx) => set({ assistantContext: ctx }),
  setAssistantContextFromPath: (pathname) =>
    set((state) => ({
      assistantContext: {
        module: pathnameToAssistantModule(pathname),
        object:
          state.assistantContext.module === pathnameToAssistantModule(pathname)
            ? state.assistantContext.object
            : null,
      },
    })),
  clearAssistantContextObject: () =>
    set((state) => ({
      assistantContext: { ...state.assistantContext, object: null },
    })),
  openAiWithQuery: (query, options) =>
    set((state) => ({
      assistantQuery: typeof query === "string" ? query : state.assistantQuery,
      assistantPrefillSeq:
        typeof query === "string" ? state.assistantPrefillSeq + 1 : state.assistantPrefillSeq,
      pendingNewAssistantThread: state.pendingNewAssistantThread || options?.newThread === true,
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
  consumePendingNewAssistantThread: () => {
    const pending = get().pendingNewAssistantThread;
    if (pending) set({ pendingNewAssistantThread: false });
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
