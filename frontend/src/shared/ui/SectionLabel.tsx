import type { ReactNode } from "react";

/** Заголовок секции в боковой панели/группах настроек: тонкий uppercase-текст. */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-0.5 mt-[10px] px-[10px] text-[10px] font-bold uppercase tracking-[0.08em] text-muted">
      {children}
    </p>
  );
}
