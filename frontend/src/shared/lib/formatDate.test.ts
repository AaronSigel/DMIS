import { describe, expect, it } from "vitest";
import { formatDate, formatDateTime, formatDateShort } from "./formatDate";

describe("formatDate", () => {
  it("formats ISO date as DD.MM.YYYY", () => {
    expect(formatDate("2026-05-31T12:00:00.000Z")).toBe("31.05.2026");
  });
  it("returns empty string for null", () => {
    expect(formatDate(null)).toBe("");
  });
  it("returns empty string for undefined", () => {
    expect(formatDate(undefined)).toBe("");
  });
  it("returns empty string for invalid date", () => {
    expect(formatDate("not-a-date")).toBe("");
  });
});

describe("formatDateTime", () => {
  it("formats ISO datetime as DD.MM.YYYY, HH:MM", () => {
    // Use a fixed local-time string to avoid TZ flakiness
    const result = formatDateTime("2026-05-31T00:00:00.000Z");
    expect(result).toMatch(/^\d{2}\.\d{2}\.\d{4},\s\d{2}:\d{2}$/);
  });
  it("returns empty string for null", () => {
    expect(formatDateTime(null)).toBe("");
  });
});

describe("formatDateShort", () => {
  it("formats as '31 мая'", () => {
    expect(formatDateShort("2026-05-31T00:00:00.000Z")).toMatch(/31\s+мая/);
  });
  it("returns empty string for null", () => {
    expect(formatDateShort(null)).toBe("");
  });
});
