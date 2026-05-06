import type { ReactNode } from "react";

export function ToastViewport({ children }: { children: ReactNode }) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed bottom-4 right-4 z-[60] flex max-w-[320px] flex-col gap-2"
    >
      {children}
    </div>
  );
}
