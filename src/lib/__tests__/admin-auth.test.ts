import { describe, it, expect } from "vitest";
import { parseAdminEmails, isAdminEmail } from "../admin-auth";

describe("parseAdminEmails", () => {
  it("splits, trims, lowercases, drops empties", () => {
    expect(parseAdminEmails(" A@x.com, b@Y.com ,,")).toEqual(["a@x.com", "b@y.com"]);
  });

  it("returns [] for undefined", () => {
    expect(parseAdminEmails(undefined)).toEqual([]);
  });
});

describe("isAdminEmail", () => {
  it("matches case-insensitively", () => {
    expect(isAdminEmail("A@X.com", ["a@x.com"])).toBe(true);
  });

  it("fails closed on empty allowlist", () => {
    expect(isAdminEmail("a@x.com", [])).toBe(false);
  });

  it("rejects null email", () => {
    expect(isAdminEmail(null, ["a@x.com"])).toBe(false);
  });
});
