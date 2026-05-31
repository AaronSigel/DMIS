import { describe, expect, it } from "vitest";
import { truncateId } from "./formatId";

describe("truncateId", () => {
  it("returns last 8 chars of UUID with ellipsis prefix", () => {
    expect(truncateId("a1b2c3d4-e5f6-7890-abcd-ef1234567890")).toBe("…34567890");
  });
  it("strips hyphens before taking last 8", () => {
    // raw: a1b2c3d4e5f67890abcdef1234567890 → last 8: 34567890
    expect(truncateId("a1b2c3d4-e5f6-7890-abcd-ef1234567890")).toBe("…34567890");
  });
  it("returns id unchanged if shorter than 8 chars", () => {
    expect(truncateId("abc")).toBe("abc");
  });
  it("returns empty string for empty input", () => {
    expect(truncateId("")).toBe("");
  });
});
