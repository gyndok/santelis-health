import { describe, it, expect } from "vitest";
import { withAlpha } from "../color";

describe("withAlpha", () => {
  it("converts 6-digit hex to rgba", () => {
    expect(withAlpha("#0D9488", 0.3)).toBe("rgba(13, 148, 136, 0.3)");
  });

  it("expands 3-digit hex", () => {
    expect(withAlpha("#fff", 0.5)).toBe("rgba(255, 255, 255, 0.5)");
  });

  it("clamps alpha into 0..1", () => {
    expect(withAlpha("#000000", 2)).toBe("rgba(0, 0, 0, 1)");
    expect(withAlpha("#000000", -1)).toBe("rgba(0, 0, 0, 0)");
  });

  it("passes non-hex values through unchanged", () => {
    expect(withAlpha("rgb(1,2,3)", 0.5)).toBe("rgb(1,2,3)");
    expect(withAlpha("var(--site-primary)", 0.5)).toBe("var(--site-primary)");
    expect(withAlpha("", 0.5)).toBe("");
  });
});
