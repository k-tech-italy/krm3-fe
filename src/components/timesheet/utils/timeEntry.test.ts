import { describe, it, expect } from "vitest";
import {
  isHoliday,
  isSickDay,
  isToday,
  getDayType,
  isNonWorkingDay,
  isClosed,
  createHolidaySickDayMaps,
  getTimeEntriesForTaskAndDay,
  calculateTaskHoursForDay,
} from "./timeEntry";
import { DayType } from "../../../restapi/types";

const mockEntry = (overrides = {}) => ({
  id: 1, date: "2024-06-01", task: 1, dayShiftHours: 8, nightShiftHours: 0,
  travelHours: 0, restHours: 0, sickHours: 0, holidayHours: 0,
  leaveHours: 0, onCallHours: 0, specialLeaveHours: 0, ...overrides
});

describe("isHoliday", () => {
  it("returns true when day has holiday hours", () => {
    expect(isHoliday("2024-06-01", [mockEntry({ holidayHours: 8 })])).toBe(true);
  });
  it("returns false when no holiday hours", () => {
    expect(isHoliday("2024-06-01", [mockEntry()])).toBe(false);
  });
});

describe("isSickDay", () => {
  it("returns true when day has sick hours", () => {
    expect(isSickDay("2024-06-01", [mockEntry({ sickHours: 8 })])).toBe(true);
  });
  it("returns false when no sick hours", () => {
    expect(isSickDay("2024-06-01", [mockEntry()])).toBe(false);
  });
});

describe("isToday", () => {
  it("returns true for today", () => expect(isToday(new Date())).toBe(true));
  it("returns false for yesterday", () => {
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    expect(isToday(yesterday)).toBe(false);
  });
});

describe("getDayType", () => {
  it("returns WORK_DAY when no days provided", () => {
    expect(getDayType("2024-06-01")).toBe(DayType.WORK_DAY);
  });
  it("returns CLOSED_DAY when closed", () => {
    expect(getDayType("2024-06-01", { "2024-06-01": { closed: true, nwd: false, hol: false } })).toBe(DayType.CLOSED_DAY);
  });
  it("returns BANK_HOLIDAY when hol", () => {
    expect(getDayType("2024-06-01", { "2024-06-01": { closed: false, nwd: false, hol: true } })).toBe(DayType.BANK_HOLIDAY);
  });
});

describe("isNonWorkingDay", () => {
  it("returns true for nwd", () => {
    expect(isNonWorkingDay("2024-06-01", { "2024-06-01": { closed: false, nwd: true, hol: false } })).toBe(true);
  });
  it("returns false when no days", () => expect(isNonWorkingDay("2024-06-01")).toBe(false));
});

describe("isClosed", () => {
  it("returns true when closed", () => {
    expect(isClosed("2024-06-01", { "2024-06-01": { closed: true, nwd: false, hol: false } })).toBe(true);
  });
  it("returns false when not closed", () => expect(isClosed("2024-06-01")).toBe(false));
});

describe("createHolidaySickDayMaps", () => {
  const entries = [mockEntry({ holidayHours: 8 }), mockEntry({ date: "2024-06-02", sickHours: 8 })];
  const maps = createHolidaySickDayMaps(entries);

  it("detects holidays", () => expect(maps.isHoliday("2024-06-01")).toBe(true));
  it("detects sick days", () => expect(maps.isSickDay("2024-06-02")).toBe(true));
  it("gets entries for task", () => expect(maps.getTimeEntriesForTaskAndDay(1)).toHaveLength(2));
});

describe("getTimeEntriesForTaskAndDay", () => {
  const timesheet = { tasks: [], timeEntries: [mockEntry()], days: {}, bankHours: 0 };

  it("returns all entries for task without day", () => {
    expect(getTimeEntriesForTaskAndDay(1, timesheet)).toHaveLength(1);
  });
  it("returns empty when no timeEntries", () => {
    expect(getTimeEntriesForTaskAndDay(1, { ...timesheet, timeEntries: undefined })).toEqual([]);
  });
});

describe("calculateTaskHoursForDay", () => {
  it("calculates total hours", () => {
    expect(calculateTaskHoursForDay([mockEntry({ dayShiftHours: 4, nightShiftHours: 2, travelHours: 1 })], "2024-06-01")).toBe(7);
  });
  it("returns 0 for no entries", () => expect(calculateTaskHoursForDay([], "2024-06-01")).toBe(0));
});
