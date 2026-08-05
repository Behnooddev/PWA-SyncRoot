import { describe, expect, it } from "vitest";
import { buildCursorPage, clampLimit, parseOffsetParams, toOffsetPage } from "@/lib/pagination.js";

describe("clampLimit", () => {
  it("returns the fallback when input is missing or invalid", () => {
    expect(clampLimit(undefined)).toBe(20);
    expect(clampLimit("not-a-number")).toBe(20);
    expect(clampLimit(-5)).toBe(20);
    expect(clampLimit(0)).toBe(20);
  });

  it("parses numeric strings from query params", () => {
    expect(clampLimit("15")).toBe(15);
  });

  it("clamps values above the max", () => {
    expect(clampLimit(500)).toBe(100);
  });

  it("respects a custom fallback", () => {
    expect(clampLimit(undefined, 50)).toBe(50);
  });
});

describe("parseOffsetParams", () => {
  it("defaults offset to 0 and limit to 20", () => {
    expect(parseOffsetParams({})).toEqual({ limit: 20, offset: 0 });
  });

  it("parses valid string params", () => {
    expect(parseOffsetParams({ limit: "10", offset: "40" })).toEqual({ limit: 10, offset: 40 });
  });

  it("ignores a negative offset", () => {
    expect(parseOffsetParams({ offset: "-10" })).toEqual({ limit: 20, offset: 0 });
  });
});

describe("toOffsetPage", () => {
  it("wraps items with pagination metadata", () => {
    const page = toOffsetPage(["a", "b"], 12, { limit: 2, offset: 4 });
    expect(page).toEqual({ items: ["a", "b"], total: 12, limit: 2, offset: 4 });
  });
});

describe("buildCursorPage", () => {
  const rows = [{ id: "1" }, { id: "2" }, { id: "3" }];

  it("has no next cursor when there are fewer rows than the limit + 1", () => {
    const page = buildCursorPage(rows, 5);
    expect(page).toEqual({ items: rows, nextCursor: null });
  });

  it("returns a next cursor and trims the extra row when there are more results", () => {
    const page = buildCursorPage(rows, 2);
    expect(page.items).toEqual([{ id: "1" }, { id: "2" }]);
    expect(page.nextCursor).toBe("2");
  });
});
