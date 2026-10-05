import { describe, expect, it } from "vitest";
import { DayEntry, DayType, TaskEntry } from "../../../restapi/types";
import {
  calculateTaskHoursForDay,
  calculateMaximumWorkingHours,
  getDayType,
  isAbsenceDay,
  isClosed,
  isHoliday,
  isNonWorkingDay,
  isSickDay,
  isToday,
} from "./entryUtils";

function createDayEntry(overrides: Partial<DayEntry> = {}): DayEntry {
  return {
    id: 1,
    day: "2024-06-01",
    lastModified: "2024-06-01T00:00:00Z",
    closed: false,
    comment: null,
    contract: 1,
    timesheet: null,
    resource: 1,
    bank: 0,
    dueHours: 8,
    travelHours: 0,
    dayHours: 0,
    nightHours: 0,
    onCallHours: 0,
    isHoliday: false,
    askedHoliday: false,
    leaveHours: 0,
    specialLeaveHours: 0,
    specialLeaveReason: null,
    protocolNumber: null,
    isSick: false,
    restHours: 0,
    overtimeHours: 0,
    mealVoucher: 0,
    ...overrides,
  };
}

function createTaskEntry(overrides: Partial<TaskEntry> = {}): TaskEntry {
  return {
    id: 1,
    task: 1,
    taskTitle: null,
    dayEntry: 1,
    dayShiftHours: 0,
    nightShiftHours: 0,
    onCallHours: 0,
    travelHours: 0,
    comment: null,
    metadata: {},
    ...overrides,
  };
}

describe("isHoliday", () => {
  it("returns true for a calendar holiday", () => {
    const entry = createDayEntry({
      isHoliday: true,
    });

    expect(isHoliday("2024-06-01", [entry])).toBe(true);
  });

  it("returns true for requested holiday leave", () => {
    const entry = createDayEntry({
      askedHoliday: true,
    });

    expect(isHoliday("2024-06-01", [entry])).toBe(true);
  });

  it("returns false for a normal day", () => {
    expect(isHoliday("2024-06-01", [createDayEntry()])).toBe(false);
  });
});

describe("isAbsenceDay", () => {
  it("does not classify a public holiday as an absence", () => {
    expect(isAbsenceDay("2024-06-01", [createDayEntry({ isHoliday: true })])).toBe(false);
  });

  it("classifies requested holiday and sick days as absences", () => {
    expect(isAbsenceDay("2024-06-01", [createDayEntry({ askedHoliday: true })])).toBe(true);
    expect(isAbsenceDay("2024-06-01", [createDayEntry({ isSick: true })])).toBe(true);
  });
});

describe("isSickDay", () => {
  it("returns true for a sick day", () => {
    const entry = createDayEntry({
      isSick: true,
    });

    expect(isSickDay("2024-06-01", [entry])).toBe(true);
  });

  it("returns false for a normal day", () => {
    expect(isSickDay("2024-06-01", [createDayEntry()])).toBe(false);
  });
});

describe("isToday", () => {
  it("returns true for today", () => {
    expect(isToday(new Date())).toBe(true);
  });

  it("returns false for yesterday", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    expect(isToday(yesterday)).toBe(false);
  });
});

describe("getDayType", () => {
  it("returns WORK_DAY when no days are provided", () => {
    expect(getDayType("2024-06-01")).toBe(DayType.WORK_DAY);
  });

  it("returns CLOSED_DAY when the day is closed", () => {
    expect(
      getDayType("2024-06-01", {
        "2024-06-01": {
          closed: true,
          nwd: false,
          hol: false,
        },
      })
    ).toBe(DayType.CLOSED_DAY);
  });

  it("returns BANK_HOLIDAY for a holiday", () => {
    expect(
      getDayType("2024-06-01", {
        "2024-06-01": {
          closed: false,
          nwd: false,
          hol: true,
        },
      })
    ).toBe(DayType.BANK_HOLIDAY);
  });
});

describe("isNonWorkingDay", () => {
  it("returns true for a non-working day", () => {
    expect(
      isNonWorkingDay("2024-06-01", {
        "2024-06-01": {
          closed: false,
          nwd: true,
          hol: false,
        },
      })
    ).toBe(true);
  });

  it("returns false when days are not provided", () => {
    expect(isNonWorkingDay("2024-06-01")).toBe(false);
  });
});

describe("isClosed", () => {
  it("returns true when the matching DayEntry is closed", () => {
    const entry = createDayEntry({
      closed: true,
    });

    expect(isClosed("2024-06-01", [entry])).toBe(true);
  });

  it("returns false when DayEntry records are not provided", () => {
    expect(isClosed("2024-06-01")).toBe(false);
  });
});

describe("calculateTaskHoursForDay", () => {
  it("calculates task hours for the selected day", () => {
    const dayEntry = createDayEntry();

    const taskEntry = createTaskEntry({
      dayEntry: dayEntry.id,
      dayShiftHours: 4,
      nightShiftHours: 2,
      travelHours: 1,
    });

    expect(calculateTaskHoursForDay([taskEntry], [dayEntry], "2024-06-01")).toBe(7);
  });

  it("does not count on-call hours as worked task hours", () => {
    const dayEntry = createDayEntry();
    const taskEntry = createTaskEntry({
      dayEntry: dayEntry.id,
      dayShiftHours: 4,
      onCallHours: 8,
    });

    expect(calculateTaskHoursForDay([taskEntry], [dayEntry], "2024-06-01")).toBe(4);
  });

  it("ignores TaskEntry records belonging to another day", () => {
    const dayEntry = createDayEntry();

    const taskEntry = createTaskEntry({
      dayEntry: 999,
      dayShiftHours: 8,
    });

    expect(calculateTaskHoursForDay([taskEntry], [dayEntry], "2024-06-01")).toBe(0);
  });

  it("returns 0 when no matching DayEntry exists", () => {
    expect(calculateTaskHoursForDay([], [], "2024-06-01")).toBe(0);
  });

  it("can exclude the task that is being overwritten", () => {
    const dayEntry = createDayEntry();
    const selectedTaskEntry = createTaskEntry({ task: 1, dayShiftHours: 4 });
    const otherTaskEntry = createTaskEntry({ id: 2, task: 2, dayShiftHours: 2 });

    expect(
      calculateTaskHoursForDay([selectedTaskEntry, otherTaskEntry], [dayEntry], "2024-06-01", 1)
    ).toBe(2);
  });
});

describe("calculateMaximumWorkingHours", () => {
  it("limits working hours when leave covers part of the due hours", () => {
    expect(calculateMaximumWorkingHours(createDayEntry({ dueHours: 8, leaveHours: 4 }))).toBe(4);
  });

  it("counts only bank withdrawals", () => {
    expect(calculateMaximumWorkingHours(createDayEntry({ dueHours: 8, bank: -5 }))).toBe(3);
    expect(calculateMaximumWorkingHours(createDayEntry({ dueHours: 8, bank: 5 }))).toBeNull();
  });

  it("returns null when no hours cover the working day", () => {
    expect(calculateMaximumWorkingHours(createDayEntry({ dueHours: 8 }))).toBeNull();
  });
});
