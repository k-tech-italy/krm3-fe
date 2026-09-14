import { beforeEach, describe, expect, it, vi } from "vitest";
import { restapi } from "./restapi";
import {
  calculateTotalHoursForDay,
  clearDayEntries,
  createTaskEntry,
  deleteDayEntry,
  deleteDayEntries,
  deleteTaskEntries,
  getSpecialReason,
  getTimesheet,
  submitTimesheet,
  saveDayEntries,
} from "./timesheet";
import { DayEntry } from "./types";

vi.mock("./restapi", () => ({
  restapi: { delete: vi.fn(), get: vi.fn(), post: vi.fn(), put: vi.fn() },
}));

const dayEntry = (overrides: Partial<DayEntry> = {}): DayEntry =>
  ({
    id: 1,
    day: "2025-01-15",
    dayHours: 4,
    nightHours: 2,
    leaveHours: 1,
    specialLeaveHours: 0,
    restHours: 0,
    travelHours: 1,
    bank: 1,
    ...overrides,
  }) as DayEntry;

describe("timesheet API", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetches a timesheet and normalizes task periods", async () => {
    const response = {
      tasks: [{ id: 1, title: "Task", period: { lower: "2025-01-01", upper: null } }],
      days: ["2025-01-15"],
      bankHours: 0,
    };
    vi.mocked(restapi.get).mockResolvedValue({ data: response });
    const params = { resourceId: 1, startDate: "2025-01-01", endDate: "2025-01-31" };

    const result = await getTimesheet(params);

    expect(restapi.get).toHaveBeenCalledWith("timesheet/", { params });
    expect(result.tasks[0]).toMatchObject({ startDate: "2025-01-01", endDate: undefined });
  });

  it("creates task entries", async () => {
    vi.mocked(restapi.post).mockResolvedValue({ data: { id: 1 } });
    const payload = { resourceId: 1, taskId: 2, dates: ["2025-01-15"], dayShiftHours: 8 };

    await createTaskEntry(payload);

    expect(restapi.post).toHaveBeenCalledWith("timesheet/task-entry/", payload);
  });

  it("saves multiple day entries in one request", async () => {
    vi.mocked(restapi.post).mockResolvedValue({ data: [] });
    const payload = {
      resourceId: 7,
      dates: ["2025-01-15", "2025-01-16"],
      askedHoliday: true,
    };

    await saveDayEntries(payload);

    expect(restapi.post).toHaveBeenCalledWith("timesheet/day-entry/", {
      resource: 7,
      dates: ["2025-01-15", "2025-01-16"],
      askedHoliday: true,
    });
  });

  it("deletes day and task entries", async () => {
    await deleteDayEntry(3);
    await deleteDayEntries([3, 4]);
    await clearDayEntries([3, 4]);
    await deleteTaskEntries([4, 5]);
    expect(restapi.delete).toHaveBeenCalledWith("timesheet/day-entry/3/");
    expect(restapi.post).toHaveBeenCalledWith("timesheet/day-entry/delete/", {
      ids: [3, 4],
    });
    expect(restapi.post).toHaveBeenCalledWith("timesheet/day-entry/clear/", { ids: [3, 4] });
    expect(restapi.post).toHaveBeenCalledWith("timesheet/task-entry/clear/", { ids: [4, 5] });
  });

  it("fetches special reasons and submits a timesheet", async () => {
    vi.mocked(restapi.get).mockResolvedValue({ data: [] });
    await getSpecialReason("2025-01-01", "2025-01-31");
    await submitTimesheet(7, "2025-01-01", "2025-01-31");

    expect(restapi.get).toHaveBeenCalledWith("timesheet/special-leave-reason/", {
      params: { from: "2025-01-01", to: "2025-01-31" },
    });
    expect(restapi.post).toHaveBeenCalledWith("core/timesheet/", {
      resource: 7,
      period: ["2025-01-01", "2025-01-31"],
    });
  });

  it("calculates total day-entry hours and bank balance", () => {
    expect(calculateTotalHoursForDay([dayEntry()], "2025-01-15")).toBe(7);
    expect(calculateTotalHoursForDay([dayEntry({ bank: -2 })], "2025-01-15")).toBe(10);
    expect(calculateTotalHoursForDay([dayEntry()], "2025-01-16")).toBe(0);
    expect(calculateTotalHoursForDay([], "2025-01-15")).toBe(0);
  });
});
