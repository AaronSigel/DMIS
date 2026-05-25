import { describe, expect, it } from "vitest";
import {
  LAYOUT_DEFAULTS,
  LAYOUT_LIMITS,
  assistantMaxWidth,
  clampAssistantWidth,
  clampSidebarWidth,
} from "./uiStore";

describe("layout width clamp", () => {
  it("clamps sidebar within limits", () => {
    expect(clampSidebarWidth(100)).toBe(LAYOUT_LIMITS.sidebar.min);
    expect(clampSidebarWidth(500)).toBe(LAYOUT_LIMITS.sidebar.max);
    expect(clampSidebarWidth(220)).toBe(220);
  });

  it("clamps assistant within limits and reserves main area", () => {
    expect(clampAssistantWidth(200, LAYOUT_DEFAULTS.sidebarWidth, { viewportWidth: 1400 })).toBe(
      LAYOUT_LIMITS.assistant.min,
    );
    expect(clampAssistantWidth(900, LAYOUT_DEFAULTS.sidebarWidth, { viewportWidth: 1400 })).toBe(
      assistantMaxWidth(1400),
    );
    expect(
      clampAssistantWidth(500, LAYOUT_DEFAULTS.sidebarWidth, { viewportWidth: 900 }),
    ).toBeLessThanOrEqual(900 - LAYOUT_DEFAULTS.sidebarWidth - LAYOUT_LIMITS.minMain);
  });

  it("caps assistant max at 45vw", () => {
    expect(assistantMaxWidth(1000)).toBe(450);
    expect(assistantMaxWidth(2000)).toBe(LAYOUT_LIMITS.assistant.max);
  });
});
