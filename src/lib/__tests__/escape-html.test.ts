import { describe, it, expect } from "vitest";
import { escapeHtml } from "../escape-html";

describe("escapeHtml", () => {
  it("escapes the five HTML special characters", () => {
    expect(escapeHtml(`<img src=x onerror="alert('1')" & more>`)).toBe(
      "&lt;img src=x onerror=&quot;alert(&#39;1&#39;)&quot; &amp; more&gt;",
    );
  });

  it("passes plain text through", () => {
    expect(escapeHtml("Jane Doe")).toBe("Jane Doe");
  });
});
