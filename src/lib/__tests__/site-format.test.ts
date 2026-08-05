import { describe, it, expect } from "vitest";
import {
  formatOfficeHours,
  starString,
  providerDisplayName,
  initials,
  formatReviewDate,
} from "../site-format";

describe("formatOfficeHours", () => {
  it("groups consecutive weekdays with identical hours", () => {
    expect(
      formatOfficeHours({
        monday: "8am–5pm",
        tuesday: "8am–5pm",
        wednesday: "8am–5pm",
        thursday: "8am–5pm",
        friday: "8am–12pm",
      }),
    ).toEqual(["Mon–Thu: 8am–5pm", "Fri: 8am–12pm", "Sat–Sun: Closed"]);
  });

  it("does not merge non-uniform weekdays", () => {
    expect(
      formatOfficeHours({
        monday: "8am–5pm",
        tuesday: "9am–6pm",
        wednesday: "8am–5pm",
      }),
    ).toEqual([
      "Mon: 8am–5pm",
      "Tue: 9am–6pm",
      "Wed: 8am–5pm",
      "Thu–Sun: Closed",
    ]);
  });

  it("handles closed monday with open tue–thu", () => {
    expect(
      formatOfficeHours({
        tuesday: "8am–5pm",
        wednesday: "8am–5pm",
        thursday: "8am–5pm",
      }),
    ).toEqual(["Mon: Closed", "Tue–Thu: 8am–5pm", "Fri–Sun: Closed"]);
  });

  it("returns [] when no hours are set", () => {
    expect(formatOfficeHours({})).toEqual([]);
  });
});

describe("starString", () => {
  it("rounds 3.8 to four filled stars", () => {
    expect(starString(3.8)).toBe("★★★★☆");
  });
  it("renders five for 5.0", () => {
    expect(starString(5)).toBe("★★★★★");
  });
  it("renders none filled for 0", () => {
    expect(starString(0)).toBe("☆☆☆☆☆");
  });
});

describe("providerDisplayName", () => {
  it("prefixes Dr. for physicians", () => {
    expect(
      providerDisplayName({ firstName: "Jane", lastName: "Smith", credentials: "MD" }),
    ).toBe("Dr. Jane Smith");
    expect(
      providerDisplayName({ firstName: "Jo", lastName: "Ng", credentials: "DO, FACOG" }),
    ).toBe("Dr. Jo Ng");
  });
  it("suffixes credentials for non-physicians", () => {
    expect(
      providerDisplayName({ firstName: "Ann", lastName: "Lee", credentials: "NP" }),
    ).toBe("Ann Lee, NP");
  });
  it("falls back to bare name with empty credentials", () => {
    expect(
      providerDisplayName({ firstName: "Ann", lastName: "Lee", credentials: "" }),
    ).toBe("Ann Lee");
  });
});

describe("initials", () => {
  it("builds initials from both names", () => {
    expect(initials("Jane", "Smith")).toBe("JS");
  });
  it("is safe on empty/undefined", () => {
    expect(initials("", "")).toBe("");
    expect(initials(undefined, "Smith")).toBe("S");
  });
});

describe("formatReviewDate", () => {
  it("renders YYYY-MM-DD as a local date without UTC day-shift", () => {
    expect(formatReviewDate("2026-02-01")).toBe("Feb 2026");
  });
  it("returns empty string for empty input", () => {
    expect(formatReviewDate("")).toBe("");
  });
});
