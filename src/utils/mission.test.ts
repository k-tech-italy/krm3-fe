import { describe, it, expect } from "vitest";
import { missionDisplayTitle } from "./mission";
import { City } from "../restapi/types";

describe("missionDisplayTitle", () => {
  const base = {
    city: { id: 1, name: "Rome" } as City,
    fromDate: "2025-01-01",
    toDate: "2025-01-03",
  };

  it("returns the title when set", () => {
    expect(missionDisplayTitle({ ...base, title: "M_2025_001" })).toBe("M_2025_001");
  });

  it("falls back to city and dates when the title is empty", () => {
    expect(missionDisplayTitle({ ...base, title: "" })).toBe("Rome 2025-01-01 - 2025-01-03");
  });
});
