import { describe, it, expect } from "vitest";
import { normalizeUrl, pickContactEmail } from "../../services/prospect-utils";

describe("normalizeUrl", () => {
  it("lowercases host and strips bare trailing slash", () => {
    expect(normalizeUrl("HTTPS://Example.com/")).toBe("https://example.com");
  });
  it("keeps meaningful paths", () => {
    expect(normalizeUrl("https://example.com/about/")).toBe("https://example.com/about/");
  });
  it("strips fragments", () => {
    expect(normalizeUrl("https://example.com/#top")).toBe("https://example.com");
  });
  it("throws on garbage and non-http schemes", () => {
    expect(() => normalizeUrl("not a url")).toThrow("Invalid URL");
    expect(() => normalizeUrl("javascript:alert(1)")).toThrow("Unsupported URL scheme");
  });
});

describe("pickContactEmail", () => {
  it("rejects retina-image filenames", () => {
    expect(pickContactEmail("see our logo@2x.png here", "", "https://example.com")).toBeUndefined();
  });
  it("prefers mailto links over text matches", () => {
    const md = "contact tracker@thirdparty.io";
    const html = '<a href="mailto:office@example.com">Email us</a>';
    expect(pickContactEmail(md, html, "https://example.com")).toBe("office@example.com");
  });
  it("prefers the site's own domain among text matches", () => {
    const md = "ads@network.com or frontdesk@example.com";
    expect(pickContactEmail(md, "", "https://www.example.com")).toBe("frontdesk@example.com");
  });
  it("falls back to the first valid candidate off-domain", () => {
    expect(pickContactEmail("hello@other.org", "", "https://example.com")).toBe("hello@other.org");
  });
});
