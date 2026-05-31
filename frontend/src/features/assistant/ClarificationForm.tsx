import { useEffect, useMemo, useState } from "react";
import { localizeIntent } from "../../shared/lib/localizeDomain";
import { isoToLocalDateTimeInput } from "../../shared/lib/datetimeLocal";
import { UserSearchInput } from "../../shared/ui/UserSearchInput";

export type ClarificationState = {
  intent: string;
  missingFields: string[];
  partialEntities: Record<string, unknown>;
  originalText: string;
};

const FIELD_LABELS: Record<string, string> = {
  startAt: "Дата и время",
  to: "Получатель",
  subject: "Тема",
  body: "Текст письма",
  participants: "Участники",
};

function fieldLabel(field: string): string {
  return FIELD_LABELS[field] ?? field;
}

function fieldValue(partialEntities: Record<string, unknown>, field: string): string {
  const value = partialEntities[field] ?? partialEntities[field === "startAt" ? "startIso" : field];
  if (Array.isArray(value)) return value.join(", ");
  if (value == null) return "";
  if (field === "startAt") {
    const raw = String(value);
    const localValue = isoToLocalDateTimeInput(raw);
    return localValue || raw;
  }
  return String(value);
}

type ClarificationFormProps = {
  clarification: ClarificationState;
  values: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  pending?: boolean;
  onSessionExpired: () => void;
  onTokenRefresh?: (token: string) => void;
};

export function ClarificationForm({
  clarification,
  values,
  onChange,
  onSubmit,
  onCancel,
  pending = false,
  onSessionExpired,
  onTokenRefresh,
}: ClarificationFormProps) {
  const baseValues = useMemo(() => {
    const next: Record<string, string> = {};
    for (const field of clarification.missingFields) {
      next[field] = values[field] ?? fieldValue(clarification.partialEntities, field);
    }
    return next;
  }, [clarification.missingFields, clarification.partialEntities, values]);

  const [draftValues, setDraftValues] = useState<Record<string, string>>(baseValues);

  useEffect(() => {
    setDraftValues(baseValues);
  }, [baseValues]);

  const hasEmptyRequiredField = clarification.missingFields.some(
    (field) => !(draftValues[field] ?? "").trim(),
  );
  const isSubmitDisabled = pending || hasEmptyRequiredField;

  return (
    <div
      data-testid="assistant-clarification-form"
      className="mt-2 rounded-lg border border-border bg-white px-3 py-2.5"
    >
      <p className="mb-1 mt-0 text-[11px] font-semibold text-text">
        Уточнение: {localizeIntent(clarification.intent)}
      </p>
      <p className="mb-2 mt-0 text-[12px] text-muted">Не хватает данных для подготовки действия.</p>
      {Object.keys(clarification.partialEntities).length > 0 && (
        <div className="mb-2 grid gap-1">
          <p className="mb-0 mt-0 text-[10px] uppercase tracking-wide text-muted">Уже определено</p>
          {Object.entries(clarification.partialEntities).map(([key, value]) => (
            <p key={key} className="mb-0 mt-0 text-[11px] text-text">
              {fieldLabel(key)}: {Array.isArray(value) ? value.join(", ") : String(value)}
            </p>
          ))}
        </div>
      )}
      <div className="grid gap-2">
        {clarification.missingFields.map((field) => (
          <label key={field} className="grid gap-1 text-[11px] text-text">
            {fieldLabel(field)}
            {field === "to" ? (
              <UserSearchInput
                value={draftValues[field] ?? ""}
                onChange={(val) => {
                  setDraftValues((prev) => ({ ...prev, [field]: val }));
                  onChange(field, val);
                }}
                multi={false}
                inputTestId={`clarification-field-${field}`}
                onSessionExpired={onSessionExpired}
                onTokenRefresh={onTokenRefresh}
              />
            ) : field === "participants" ? (
              <UserSearchInput
                value={draftValues[field] ?? ""}
                onChange={(val) => {
                  setDraftValues((prev) => ({ ...prev, [field]: val }));
                  onChange(field, val);
                }}
                multi={true}
                inputTestId={`clarification-field-${field}`}
                onSessionExpired={onSessionExpired}
                onTokenRefresh={onTokenRefresh}
              />
            ) : (
              <input
                data-testid={`clarification-field-${field}`}
                type={field === "startAt" ? "datetime-local" : "text"}
                value={draftValues[field] ?? ""}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setDraftValues((prev) => ({ ...prev, [field]: nextValue }));
                  onChange(field, nextValue);
                }}
                className="rounded-md border border-border bg-surface px-2 py-1.5 text-[12px] outline-none"
              />
            )}
          </label>
        ))}
      </div>
      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          className="rounded-md border border-border bg-white px-3 py-1 text-xs"
          onClick={onCancel}
        >
          Отмена
        </button>
        <button
          type="button"
          data-testid="clarification-submit-button"
          disabled={isSubmitDisabled}
          className="rounded-md border-0 bg-primary px-3 py-1 text-xs text-white disabled:opacity-50"
          onClick={onSubmit}
        >
          Продолжить
        </button>
      </div>
      {hasEmptyRequiredField && (
        <p className="mb-0 mt-2 text-[11px] text-muted">Заполните все обязательные поля.</p>
      )}
    </div>
  );
}

export function buildClarificationPrompt(
  originalText: string,
  missingFields: string[],
  values: Record<string, string>,
): string {
  const additions = missingFields
    .map((field) => {
      const value = values[field]?.trim();
      if (!value) return null;
      return `${fieldLabel(field)}: ${value}`;
    })
    .filter(Boolean)
    .join(". ");
  if (!additions) return originalText;
  return `${originalText.trim()}. ${additions}`;
}
