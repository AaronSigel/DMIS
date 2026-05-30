import type { RefObject } from "react";
import type { MentionDoc } from "./assistantPanelTypes";

type AssistantInputProps = {
  inputValue: string;
  placeholder: string;
  recording: boolean;
  liveTranscript: string;
  mentionCandidates: MentionDoc[];
  mentionActiveIndex: number;
  blocksUserSend: boolean;
  isStreaming: boolean;
  token: boolean;
  uploadRef: RefObject<HTMLInputElement>;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onStopStream: () => void;
  onDictation: () => void;
  onAttachClick: () => void;
  onFileSelected: (file: File) => void;
  onAttachMention: (candidate: MentionDoc) => void;
  onMentionActiveIndexChange: (index: number) => void;
  onClearMentionCandidates: () => void;
};

export function AssistantInput({
  inputValue,
  placeholder,
  recording,
  liveTranscript,
  mentionCandidates,
  mentionActiveIndex,
  blocksUserSend,
  isStreaming,
  token,
  uploadRef,
  onInputChange,
  onSubmit,
  onStopStream,
  onDictation,
  onAttachClick,
  onFileSelected,
  onAttachMention,
  onMentionActiveIndexChange,
  onClearMentionCandidates,
}: AssistantInputProps) {
  return (
    <div className="shrink-0 border-t border-border px-4 py-3">
      {recording && liveTranscript && (
        <div className="mb-2 rounded-lg border border-primary bg-primary-soft px-3 py-2 text-[12px] text-primary">
          {liveTranscript}
        </div>
      )}
      {!!mentionCandidates.length && (
        <div className="mb-2 grid gap-1 rounded-[10px] border border-border bg-white p-1.5">
          {mentionCandidates.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              onClick={() => onAttachMention(candidate)}
              className={`rounded-md border-none px-2 py-1.5 text-left text-xs text-text ${
                mentionCandidates[mentionActiveIndex]?.id === candidate.id
                  ? "bg-primary-soft"
                  : "bg-transparent"
              }`}
            >
              <span className="mr-1.5 text-primary">@</span>
              {candidate.title}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-stretch gap-1.5">
        <input
          data-testid="assistant-message-input"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (mentionCandidates.length) {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                onMentionActiveIndexChange((mentionActiveIndex + 1) % mentionCandidates.length);
                return;
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                onMentionActiveIndexChange(
                  mentionActiveIndex <= 0 ? mentionCandidates.length - 1 : mentionActiveIndex - 1,
                );
                return;
              }
              if (e.key === "Enter") {
                e.preventDefault();
                const candidate = mentionCandidates[mentionActiveIndex] ?? mentionCandidates[0];
                if (candidate) onAttachMention(candidate);
                return;
              }
              if (e.key === "Escape") {
                e.preventDefault();
                onClearMentionCandidates();
                return;
              }
            }
            if (e.key === "Enter") {
              e.preventDefault();
              onSubmit();
            }
          }}
          placeholder={placeholder}
          className="w-full rounded-lg border border-border bg-surface px-[10px] py-2 text-[13px] outline-none"
        />
        <button
          type="button"
          onClick={onDictation}
          aria-label={
            recording
              ? "Остановить запись голоса и распознать текст"
              : "Голосовой ввод: записать речь и вставить текст в поле"
          }
          className={`rounded-lg border border-border px-[10px] py-2 text-sm ${
            recording ? "bg-danger-soft text-danger" : "bg-white text-text"
          }`}
        >
          🎤
        </button>
        <button
          type="button"
          onClick={onAttachClick}
          aria-label="Прикрепить файл к текущему диалогу ассистента"
          className="rounded-lg border border-border bg-white px-[10px] py-2 text-sm text-text"
        >
          ＋
        </button>
        <input
          ref={uploadRef}
          type="file"
          data-testid="assistant-upload-input"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            onFileSelected(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={onStopStream}
          disabled={!isStreaming}
          aria-label="Остановить потоковый ответ ассистента"
          className="rounded-lg border border-border bg-white px-[10px] py-2 text-xs text-text disabled:opacity-50"
        >
          Стоп
        </button>
        <button
          data-testid="assistant-send-button"
          type="button"
          onClick={onSubmit}
          disabled={!inputValue.trim() || blocksUserSend || !token}
          aria-label="Отправить вопрос ассистенту"
          className="ml-auto rounded-lg border-0 bg-primary px-3 py-2 text-base text-white disabled:opacity-50"
        >
          ↑
        </button>
      </div>
    </div>
  );
}
