import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import {
  apiStreamAssistantAnswer,
  type AssistantStreamDoneEvent,
  type AssistantStreamPayload,
} from "../../apiClient";
import type { Citation } from "../../entities/search";

type UseAssistantStreamOptions = {
  onUnauthorized: () => void;
  onTokenRefresh?: (token: string) => void;
};

type StartAssistantStreamArgs = {
  payload: AssistantStreamPayload;
  onDone?: () => void | Promise<void>;
  onError?: (error: Error) => void;
};

/**
 * Схема одного источника в SSE done-payload (форма backend `RagSourceView`).
 * Лишние поля бэкенда отбрасываем, валидируем строго используемые.
 */
const SourceSchema = z.object({
  documentId: z.string(),
  documentTitle: z.string(),
  chunkId: z.string(),
  chunkText: z.string(),
  score: z.number(),
});

const SourcesSchema = z.array(SourceSchema);

/** Парсит `sources` из done-события и присваивает 1-based index, безопасно к мусорному payload. */
function parseSources(rawSources: unknown): Citation[] {
  const result = SourcesSchema.safeParse(rawSources);
  if (!result.success) return [];
  return result.data.map((source, idx) => ({
    index: idx + 1,
    documentId: source.documentId,
    documentTitle: source.documentTitle,
    chunkId: source.chunkId,
    chunkText: source.chunkText,
    score: source.score,
  }));
}

export function useAssistantStream(options: UseAssistantStreamOptions) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [streamSources, setStreamSources] = useState<Citation[]>([]);
  const [streamError, setStreamError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopStream = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsStreaming(false);
  }, []);

  const resetStream = useCallback(() => {
    setStreamText("");
    setStreamSources([]);
    setStreamError(null);
  }, []);

  /**
   * Сбрасывает только инкрементальный текст превью, сохраняя `streamSources`.
   * Используется после refetch persisted-сообщения, чтобы не дублировать карточку ответа,
   * но оставить чипы источников «прицепленными» к последнему ответу ассистента.
   */
  const clearStreamText = useCallback(() => {
    setStreamText("");
  }, []);

  const startStream = useCallback(
    async ({ payload, onDone, onError }: StartAssistantStreamArgs): Promise<void> => {
      stopStream();
      setStreamText("");
      setStreamSources([]);
      setStreamError(null);
      setIsStreaming(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        await apiStreamAssistantAnswer(
          payload,
          options.onUnauthorized,
          {
            onDelta: (delta) => {
              setStreamText((prev) => prev + delta);
            },
            onDone: async (event: AssistantStreamDoneEvent) => {
              setStreamSources(parseSources(event.sources));
              await onDone?.();
            },
            onError: (error) => {
              if (error.name === "AbortError") return;
              setStreamError(error.message);
              onError?.(error);
            },
          },
          controller.signal,
          options.onTokenRefresh,
        );
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        const resolved = error instanceof Error ? error : new Error("Ошибка потокового ответа");
        setStreamError(resolved.message);
        onError?.(resolved);
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
        setIsStreaming(false);
      }
    },
    [options.onTokenRefresh, options.onUnauthorized, stopStream],
  );

  useEffect(() => () => stopStream(), [stopStream]);

  return {
    isStreaming,
    streamText,
    streamSources,
    streamError,
    startStream,
    stopStream,
    resetStream,
    clearStreamText,
  };
}
