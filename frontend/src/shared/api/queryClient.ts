import { QueryClient } from "@tanstack/react-query";

export const queryKeys = {
  documents: {
    all: ["documents"] as const,
    list: (params: { section: string; page: number; size: number; archive?: boolean }) =>
      ["documents", params] as const,
    count: ["documents-count"] as const,
    card: (documentId: string | undefined) => ["document-card", documentId] as const,
  },
  assistant: {
    threads: ["assistant-threads"] as const,
    threadDetail: (threadId: string) => ["assistant-thread-detail", threadId] as const,
  },
  dashboard: {
    metrics: ["dashboard-metrics"] as const,
  },
  mail: {
    list: ["mail", "list"] as const,
    detail: (id: string) => ["mail", "detail", id] as const,
    search: (query: string) => ["mail", "search", query] as const,
  },
  calendar: {
    list: ["calendar", "list"] as const,
  },
  audit: {
    list: ["audit", "list"] as const,
  },
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
