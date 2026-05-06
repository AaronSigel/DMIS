import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ToastViewport } from "./ToastViewport";

type ToastTone = "success" | "error" | "info";

type ToastItem = {
  id: string;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  /** Успех пользовательского действия (save/delete/upload и т.п.). */
  success: (message: string) => void;
  /** Ошибка пользовательского действия, не требующая постоянного inline-контекста. */
  error: (message: string) => void;
  /** Нейтральное уведомление без семантики успеха/ошибки. */
  info: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function toastClassName(tone: ToastTone): string {
  if (tone === "success") {
    return "border-success/40 bg-successSoft text-text";
  }
  if (tone === "error") {
    return "border-danger/40 bg-danger/10 text-text";
  }
  return "border-border bg-surface text-text";
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seqRef = useRef(0);

  const dismiss = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const push = useCallback(
    (tone: ToastTone, message: string) => {
      const id = `toast-${Date.now()}-${seqRef.current++}`;
      setItems((current) => [...current, { id, message, tone }]);
      window.setTimeout(() => dismiss(id), 3500);
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (message) => push("success", message),
      error: (message) => push("error", message),
      info: (message) => push("info", message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport>
        {items.map((item) => (
          <div
            key={item.id}
            role="status"
            aria-live="polite"
            className={`rounded-lg border px-3 py-2 text-sm shadow-menu ${toastClassName(item.tone)}`}
          >
            {item.message}
          </div>
        ))}
      </ToastViewport>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return ctx;
}
