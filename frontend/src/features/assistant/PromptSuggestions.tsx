import type { PromptSuggestion } from "./promptCatalog";

type PromptSuggestionsProps = {
  suggestions: PromptSuggestion[];
  onSelect: (prompt: string) => void;
  onDisabledClick?: (hint: string) => void;
};

export function PromptSuggestions({
  suggestions,
  onSelect,
  onDisabledClick,
}: PromptSuggestionsProps) {
  if (!suggestions.length) return null;

  return (
    <div data-testid="assistant-prompt-suggestions" className="mb-3">
      <p className="mb-1.5 mt-0 text-[10px] font-semibold uppercase tracking-wide text-muted">
        Быстрые действия
      </p>
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((item) => (
          <button
            key={item.id}
            type="button"
            data-testid={`assistant-suggestion-${item.id}`}
            disabled={item.disabled}
            title={item.disabled ? item.disabledHint : undefined}
            className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-text transition-colors hover:border-primary hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => {
              if (item.disabled) {
                onDisabledClick?.(item.disabledHint ?? "Недоступно");
                return;
              }
              onSelect(item.prompt);
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
