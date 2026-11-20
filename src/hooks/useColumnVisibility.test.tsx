import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useColumnVisibility } from "./useColumnVisibility";

const columns = [{ accessorKey: "id" }, { accessorKey: "name" }, { accessorKey: "day" }];
const setup = () => renderHook(() => useColumnVisibility("test", columns, ["id"]));

describe("useColumnVisibility", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it("shows all but the default hidden columns", () => {
    const { result } = setup();
    expect(result.current.visible).toEqual(["name", "day"]);
    expect(result.current.visibleColumns(columns)).toEqual([
      { accessorKey: "name" },
      { accessorKey: "day" },
    ]);
  });

  it("remembers the choice in the browser and resets it", () => {
    const { result } = setup();
    act(() => result.current.setVisible(["id", "day"]));
    expect(result.current.visible).toEqual(["id", "day"]);

    const again = setup();
    expect(again.result.current.visible).toEqual(["id", "day"]);

    act(() => again.result.current.reset());
    expect(again.result.current.visible).toEqual(["name", "day"]);
    expect(setup().result.current.visible).toEqual(["name", "day"]);
  });

  it("ignores stored columns the table no longer has, and broken storage", () => {
    localStorage.setItem("krm3.columns.test", JSON.stringify(["gone"]));
    expect(setup().result.current.visible).toEqual(["name", "day"]);

    localStorage.setItem("krm3.columns.test", "{not json");
    expect(setup().result.current.visible).toEqual(["name", "day"]);
  });

  it("works when the storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const { result } = setup();
    act(() => result.current.setVisible(["day"]));
    expect(result.current.visible).toEqual(["day"]);
  });
});
