import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ScreenState } from "./ScreenState";

afterEach(cleanup);

describe("ScreenState", () => {
  it("renders default loading message", () => {
    render(<ScreenState variant="loading" />);
    expect(screen.getByText("Загрузка…")).toBeInTheDocument();
  });

  it("renders custom message", () => {
    render(<ScreenState variant="loading" message="Получаем данные…" />);
    expect(screen.getByText("Получаем данные…")).toBeInTheDocument();
  });

  it("renders default error message", () => {
    render(<ScreenState variant="error" />);
    expect(screen.getByText("Не удалось загрузить данные")).toBeInTheDocument();
  });

  it("renders default empty message", () => {
    render(<ScreenState variant="empty" />);
    expect(screen.getByText("Нет данных")).toBeInTheDocument();
  });

  it("renders action button and calls onClick", async () => {
    const onClick = vi.fn();
    render(<ScreenState variant="error" action={{ label: "Повторить", onClick }} />);
    await userEvent.click(screen.getByRole("button", { name: "Повторить" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not render button when no action provided", () => {
    render(<ScreenState variant="empty" />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
