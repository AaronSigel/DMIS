import { useEffect, useRef, useState } from "react";
import { apiSearchUsers } from "../../apiClient";

type UserSummary = {
  id: string;
  email: string;
  fullName: string;
  nickname?: string | null;
};

type UserSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  multi?: boolean;
  placeholder?: string;
  onSessionExpired: () => void;
  onTokenRefresh?: (token: string) => void;
};

export function UserSearchInput({
  value,
  onChange,
  multi = false,
  placeholder,
  onSessionExpired,
  onTokenRefresh,
}: UserSearchInputProps) {
  const [inputText, setInputText] = useState("");
  const [results, setResults] = useState<UserSummary[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedEmails = multi
    ? value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  useEffect(() => {
    const trimmed = inputText.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      void apiSearchUsers(trimmed, onSessionExpired, onTokenRefresh).then((data) => {
        setResults(data as UserSummary[]);
        setOpen(true);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [inputText, onSessionExpired, onTokenRefresh]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectUser(user: UserSummary) {
    if (multi) {
      if (!selectedEmails.includes(user.email)) {
        const next = [...selectedEmails, user.email].join(", ");
        onChange(next);
      }
    } else {
      onChange(user.email);
      setInputText(user.email);
    }
    setInputText("");
    setOpen(false);
    setResults([]);
  }

  function removeEmail(email: string) {
    const next = selectedEmails.filter((e) => e !== email).join(", ");
    onChange(next);
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Multi-select chips */}
      {multi && selectedEmails.length > 0 && (
        <div className="mb-1 flex flex-wrap gap-1">
          {selectedEmails.map((email) => (
            <span
              key={email}
              className="flex items-center gap-1 rounded-full bg-muted/20 px-2 py-0.5 text-[11px]"
            >
              {email}
              <button
                type="button"
                aria-label={`Удалить ${email}`}
                onClick={() => removeEmail(email)}
                className="text-muted hover:text-danger"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        type="text"
        value={multi ? inputText : inputText || value}
        placeholder={placeholder ?? (multi ? "Введите имя или email…" : "Введите имя или email…")}
        onChange={(e) => {
          setInputText(e.target.value);
          if (!multi) onChange(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className="w-full rounded-md border border-border bg-surface px-2 py-1.5 text-[12px] outline-none"
      />

      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-40 w-full overflow-y-auto rounded-md border border-border bg-white shadow-md">
          {results.map((user) => (
            <li key={user.id}>
              <button
                type="button"
                className="w-full px-3 py-1.5 text-left text-[12px] hover:bg-surface"
                onClick={() => selectUser(user)}
              >
                <span className="font-medium">{user.fullName}</span>
                <span className="ml-2 text-muted">{user.email}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
