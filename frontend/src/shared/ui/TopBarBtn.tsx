import type { ReactNode } from "react";

/** Кнопка-таблетка для верхней панели рабочей области. */
export function TopBarBtn({
  children,
  onClick,
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="rounded-[20px] border border-border bg-transparent px-[14px] py-[5px] text-[13px] text-text"
    >
      {children}
    </button>
  );
}
