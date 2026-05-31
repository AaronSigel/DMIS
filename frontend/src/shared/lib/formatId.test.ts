import { describe, expect, it } from "vitest";
import { truncateId } from "./formatId";

describe("truncateId", () => {
  it("returns last 8 chars of UUID with ellipsis prefix", () => {
    expect(truncateId("a1b2c3d4-e5f6-7890-abcd-ef1234567890")).toBe("…34567890");
  });
  it("strips hyphens before taking last 8", () => {
    // without stripping hyphens, last 8 of "abcdef12-3456-7890" would be "456-7890"
    // with stripping: "abcdef1234567890" → last 8 = "34567890"
    expect(truncateId("abcdef12-3456-7890")).toBe("…34567890");
  });
  it("returns id unchanged if shorter than 8 chars", () => {
    expect(truncateId("abc")).toBe("abc");
  });
  it("returns empty string for empty input", () => {
    expect(truncateId("")).toBe("");
  });
});
