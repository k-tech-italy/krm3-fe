import { describe, expect, it } from "vitest";
import {
  describeRelativePeriod,
  normalizeRelativePeriod,
  parseRelativePeriod,
  resolveRelativePeriod,
} from "./relativePeriod";

describe("parseRelativePeriod", () => {
  it.each([
    ["30d", { amount: 30, unit: "d" }],
    ["30D", { amount: 30, unit: "d" }],
    ["3m", { amount: 3, unit: "m" }],
    ["3M", { amount: 3, unit: "m" }],
    ["1a", { amount: 1, unit: "a" }],
    [" 2 A ", { amount: 2, unit: "a" }],
  ])("reads %j", (text, expected) => {
    expect(parseRelativePeriod(text)).toEqual(expected);
  });

  it.each(["", "d", "30", "0d", "3y", "3w", "-3m", "1.5m", "3 months", "12345d"])(
    "rejects %j",
    (text) => {
      expect(parseRelativePeriod(text)).toBeNull();
    }
  );
});

describe("normalizeRelativePeriod", () => {
  it("writes valid periods in their canonical form and trims the others", () => {
    expect(normalizeRelativePeriod(" 3 M ")).toBe("3m");
    expect(normalizeRelativePeriod(" nope ")).toBe("nope");
  });
});

describe("describeRelativePeriod", () => {
  it.each([
    ["1d", "1 day"],
    ["30d", "30 days"],
    ["1m", "1 month"],
    ["3M", "3 months"],
    ["1a", "1 year"],
    ["2a", "2 years"],
    ["nope", "nope"],
  ])("describes %j as %j", (text, expected) => {
    expect(describeRelativePeriod(text)).toBe(expected);
  });
});

describe("resolveRelativePeriod", () => {
  const today = new Date(2025, 4, 31); // 31 May 2025

  it.each([
    [{ amount: 30, unit: "d" as const }, "2025-05-01"],
    [{ amount: 3, unit: "m" as const }, "2025-02-28"],
    [{ amount: 1, unit: "a" as const }, "2024-05-31"],
  ])("goes back %j from today", (period, from) => {
    expect(resolveRelativePeriod(period, today)).toEqual({ from, to: "2025-05-31" });
  });
});
