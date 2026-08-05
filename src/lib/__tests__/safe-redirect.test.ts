import { describe, it, expect } from "vitest";
import { safeRedirectPath } from "../safe-redirect";

describe("safeRedirectPath", () => {
  it("accepts a normal relative path", () => {
    expect(safeRedirectPath("/dashboard", "/x")).toBe("/dashboard");
  });

  it("rejects protocol-relative URLs", () => {
    expect(safeRedirectPath("//evil.com", "/x")).toBe("/x");
  });

  it("rejects userinfo-trick values", () => {
    expect(safeRedirectPath("@evil.com", "/x")).toBe("/x");
  });

  it("rejects backslash smuggling", () => {
    expect(safeRedirectPath("/\\evil.com", "/x")).toBe("/x");
  });

  it("rejects null and empty values", () => {
    expect(safeRedirectPath(null, "/x")).toBe("/x");
    expect(safeRedirectPath("", "/x")).toBe("/x");
  });
});
