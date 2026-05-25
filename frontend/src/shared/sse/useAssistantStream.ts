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
  const [streamContextDiagnostic, setStreamContextDiagnostic] = useState<string | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [streamPipeline, setStreamPipeline] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopStream = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsStreaming(false);
  }, []);

  const resetStream = useCallback(() => {
    setStreamText("");
    setStreamSources([]);
    setStreamContextDiagnostic(null);
    setStreamError(null);
    setStreamPipeline(null);
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
      setStreamContextDiagnostic(null);
      setStreamError(null);
      setStreamPipeline(null);
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
              if (event.type === "error" || event.status === "ERROR") {
                setStreamError(event.message ?? event.diagnosticCode ?? "Ошибка потокового ответа");
              }
              setStreamSources(parseSources(event.sources));
              const diagnosticCode =
                event.contextDiagnosticCode ?? event.contextStatus ?? event.status;
              if (diagnosticCode && diagnosticCode !== "OK") {
                setStreamContextDiagnostic(diagnosticCode);
              } else {
                setStreamContextDiagnostic(null);
              }
              if (event.pipeline != null) {
                setStreamPipeline(
                  typeof event.pipeline === "string"
                    ? event.pipeline
                    : JSON.stringify(event.pipeline),
                );
              } else {
                setStreamPipeline(null);
              }
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

  const showStaticResponse = useCallback(
    (answer: string, diagnosticCode?: string | null) => {
      stopStream();
      resetStream();
      setStreamText(answer);
      if (diagnosticCode && diagnosticCode !== "OK") {
        setStreamContextDiagnostic(diagnosticCode);
      }
      setIsStreaming(false);
    },
    [resetStream, stopStream],
  );

  useEffect(() => () => stopStream(), [stopStream]);

  return {
    isStreaming,
    streamText,
    streamSources,
    streamContextDiagnostic,
    streamError,
    streamPipeline,
    startStream,
    stopStream,
    resetStream,
    clearStreamText,
    showStaticResponse,
  };
}
