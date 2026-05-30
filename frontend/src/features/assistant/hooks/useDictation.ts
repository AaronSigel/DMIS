import { useState, useRef } from "react";
import { apiBaseUrl, fetchWithAuth, parseAuthenticatedJson } from "../../../apiClient";
import { useToast } from "../../../shared/ui/ToastProvider";
import { mapApiErrorToMessage } from "../../../shared/lib/mapApiErrorToMessage";

type UseDictationArgs = {
  inputValueRef: React.MutableRefObject<string>;
  onInputChange: (value: string) => void;
  onSessionExpired: () => void;
  onTokenRefresh?: (token: string) => void;
};

export type UseDictationReturn = {
  recording: boolean;
  liveTranscript: string;
  startOrStopDictation: () => Promise<void>;
};

export function useDictation({
  inputValueRef,
  onInputChange,
  onSessionExpired,
  onTokenRefresh,
}: UseDictationArgs): UseDictationReturn {
  const toast = useToast();
  const [recording, setRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaChunksRef = useRef<Blob[]>([]);
  const sttPreviewSeqRef = useRef(0);
  const sttPreviewAbortRef = useRef<AbortController | null>(null);
  const isStoppingRecordRef = useRef(false);

  async function startOrStopDictation() {
    if (recording) {
      isStoppingRecordRef.current = true;
      sttPreviewAbortRef.current?.abort();
      mediaRecorderRef.current?.stop();
      setRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaChunksRef.current = [];
      isStoppingRecordRef.current = false;

      recorder.ondataavailable = async (event) => {
        if (event.data.size === 0) return;
        mediaChunksRef.current.push(event.data);
        if (isStoppingRecordRef.current) return;
        sttPreviewAbortRef.current?.abort();
        const ctrl = new AbortController();
        sttPreviewAbortRef.current = ctrl;
        const seq = ++sttPreviewSeqRef.current;
        const partialBlob = new Blob(mediaChunksRef.current, { type: "audio/webm" });
        const form = new FormData();
        form.append("audio", partialBlob, "recording.webm");
        form.append("language", "ru");
        try {
          const response = await fetchWithAuth(
            `${apiBaseUrl}/stt/audio`,
            { method: "POST", body: form, signal: ctrl.signal },
            onTokenRefresh,
          );
          const payload = await parseAuthenticatedJson<{ text: string }>(
            response,
            onSessionExpired,
          );
          if (seq === sttPreviewSeqRef.current) setLiveTranscript(payload.text);
        } catch (e) {
          if (e instanceof Error && e.name === "AbortError") return;
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        sttPreviewAbortRef.current?.abort();
        setLiveTranscript("");
        const audio = new Blob(mediaChunksRef.current, { type: "audio/webm" });
        const form = new FormData();
        form.append("audio", audio, "recording.webm");
        form.append("language", "ru");
        try {
          const response = await fetchWithAuth(
            `${apiBaseUrl}/stt/audio`,
            { method: "POST", body: form },
            onTokenRefresh,
          );
          const payload = await parseAuthenticatedJson<{ text: string }>(
            response,
            onSessionExpired,
          );
          const nextValue = [inputValueRef.current, payload.text].filter(Boolean).join(" ").trim();
          onInputChange(nextValue);
        } catch (e) {
          toast.error(
            e instanceof Error ? mapApiErrorToMessage(e.message) : "Ошибка распознавания речи",
          );
        }
      };

      recorder.start(2500);
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch {
      toast.error(
        "Доступ к микрофону отклонён. Разрешите запись в настройках браузера для этого сайта и повторите.",
      );
    }
  }

  return { recording, liveTranscript, startOrStopDictation };
}
