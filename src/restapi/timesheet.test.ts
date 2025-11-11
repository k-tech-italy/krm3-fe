import { vi, describe, it, expect, beforeEach } from "vitest";
import * as timesheetApi from "./timesheet";
import { restapi } from "./restapi";
import { Days, SpecialReason, TimeEntry, Timesheet } from "./types";

// Mock the restapi module
vi.mock("./restapi", () => ({
  restapi: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("timesheet API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getTimesheet", () => {
    it("should fetch timesheet with correct params", async () => {
      const mockDays: Days = {
        "2025_01_15": { hol: false, nwd: false, closed: false },
        "2025_01_16": { hol: false, nwd: false, closed: false },
      };

      const mockTimesheet: Timesheet = {
        tasks: [],
        timeEntries: [],
        days: mockDays,
        bankHours: 0,
      };

      vi.mocked(restapi.get).mockResolvedValue({ data: mockTimesheet });

      const params = {
        resourceId: 1,
        startDate: "2025-01-15",
        endDate: "2025-01-20",
      };

      const result = await timesheetApi.getTimesheet(params);

      expect(restapi.get).toHaveBeenCalledWith("timesheet/", { params });
      expect(result).toBeDefined();
    });

    it("should sanitize days by converting underscores to hyphens", async () => {
      const mockDays: Days = {
        "2025_01_15": { hol: false, nwd: false, closed: false },
        "2025_01_16": { hol: true, nwd: false, closed: false },
        "2025_01_17": { hol: false, nwd: true, closed: false },
      };

      const mockTimesheet: Timesheet = {
        tasks: [],
        timeEntries: [],
        days: mockDays,
        bankHours: 0,
      };

      vi.mocked(restapi.get).mockResolvedValue({ data: mockTimesheet });

      const result = await timesheetApi.getTimesheet({
        resourceId: 1,
        startDate: "2025-01-15",
        endDate: "2025-01-20",
      });

      // Check that days are sanitized with hyphens instead of underscores
      expect(result.days).toHaveProperty("2025-01-15");
      expect(result.days).toHaveProperty("2025-01-16");
      expect(result.days).toHaveProperty("2025-01-17");
      expect(result.days).not.toHaveProperty("2025_01_15");
    });

    it("should handle empty days object", async () => {
      const mockTimesheet: Timesheet = {
        tasks: [],
        timeEntries: [],
        days: {},
        bankHours: 0,
      };

      vi.mocked(restapi.get).mockResolvedValue({ data: mockTimesheet });

      const result = await timesheetApi.getTimesheet({
        resourceId: 5,
        startDate: "2025-02-01",
        endDate: "2025-02-28",
      });

      expect(result.days).toEqual({});
    });

    it("should preserve day properties after sanitization", async () => {
      const mockDays: Days = {
        "2025_01_15": { hol: false, nwd: false, closed: false },
        "2025_01_16": { hol: true, nwd: false, closed: false },
      };

      const mockTimesheet: Timesheet = {
        tasks: [],
        timeEntries: [],
        days: mockDays,
        bankHours: 10,
      };

      vi.mocked(restapi.get).mockResolvedValue({ data: mockTimesheet });

      const result = await timesheetApi.getTimesheet({
        resourceId: 2,
        startDate: "2025-01-15",
        endDate: "2025-01-16",
      });

      expect(result.days["2025-01-15"]).toEqual({
        hol: false,
        nwd: false,
        closed: false,
      });
      expect(result.days["2025-01-16"]).toEqual({
        hol: true,
        nwd: false,
        closed: false,
      });
    });
  });

  describe("createTimeEntry", () => {
    it("should create time entry with required params", async () => {
      const params = {
        resourceId: 1,
        taskId: 10,
        dates: ["2025-01-15", "2025-01-16"],
        dayShiftHours: 8,
      };

      const mockResponse = { id: 1, ...params };
      vi.mocked(restapi.post).mockResolvedValue({ data: mockResponse });

      const result = await timesheetApi.createTimeEntry(params);

      expect(restapi.post).toHaveBeenCalledWith("timesheet/time-entry/", params);
      expect(result).toEqual(mockResponse);
    });

    it("should create time entry with all hour types", async () => {
      const params = {
        resourceId: 2,
        taskId: 5,
        dates: ["2025-01-15"],
        dayShiftHours: 6,
        nightShiftHours: 2,
        sickHours: 0,
        holidayHours: 0,
        leaveHours: 0,
        travelHours: 1,
        onCallHours: 0,
        restHours: 0,
        comment: "Test entry",
      };

      const mockResponse = { id: 2, ...params };
      vi.mocked(restapi.post).mockResolvedValue({ data: mockResponse });

      const result = await timesheetApi.createTimeEntry(params);

      expect(restapi.post).toHaveBeenCalledWith("timesheet/time-entry/", params);
      expect(result).toEqual(mockResponse);
    });

    it("should create time entry without taskId", async () => {
      const params = {
        resourceId: 3,
        dates: ["2025-01-15"],
        sickHours: 8,
      };

      const mockResponse = { id: 3, ...params };
      vi.mocked(restapi.post).mockResolvedValue({ data: mockResponse });

      await timesheetApi.createTimeEntry(params);

      expect(restapi.post).toHaveBeenCalledWith("timesheet/time-entry/", params);
    });

    it("should create time entry for multiple dates", async () => {
      const params = {
        resourceId: 4,
        taskId: 15,
        dates: ["2025-01-15", "2025-01-16", "2025-01-17", "2025-01-18"],
        dayShiftHours: 8,
      };

      const mockResponse = { id: 4, ...params };
      vi.mocked(restapi.post).mockResolvedValue({ data: mockResponse });

      await timesheetApi.createTimeEntry(params);

      expect(restapi.post).toHaveBeenCalledWith("timesheet/time-entry/", params);
    });

    it("should handle time entry with comment", async () => {
      const params = {
        resourceId: 5,
        taskId: 20,
        dates: ["2025-01-15"],
        dayShiftHours: 8,
        comment: "Working on important feature",
      };

      const mockResponse = { id: 5, ...params };
      vi.mocked(restapi.post).mockResolvedValue({ data: mockResponse });

      const result = await timesheetApi.createTimeEntry(params);

      expect(result).toEqual(mockResponse);
    });
  });

  describe("deleteTimeEntries", () => {
    it("should delete time entries with single id", async () => {
      const ids = [1];
      vi.mocked(restapi.post).mockResolvedValue({ data: {} });

      await timesheetApi.deleteTimeEntries(ids);

      expect(restapi.post).toHaveBeenCalledWith("timesheet/time-entry/clear/", {
        ids: ids,
      });
    });

    it("should delete time entries with multiple ids", async () => {
      const ids = [1, 2, 3, 4, 5];
      vi.mocked(restapi.post).mockResolvedValue({ data: {} });

      await timesheetApi.deleteTimeEntries(ids);

      expect(restapi.post).toHaveBeenCalledWith("timesheet/time-entry/clear/", {
        ids: ids,
      });
    });

    it("should handle empty ids array", async () => {
      const ids: number[] = [];
      vi.mocked(restapi.post).mockResolvedValue({ data: {} });

      await timesheetApi.deleteTimeEntries(ids);

      expect(restapi.post).toHaveBeenCalledWith("timesheet/time-entry/clear/", {
        ids: ids,
      });
    });
  });

  describe("getSpecialReason", () => {
    it("should fetch special reasons with from and to dates", async () => {
      const mockReasons: SpecialReason[] = [
        {
          id: 1,
          title: "Christmas",
          description: "Christmas holiday",
          fromDate: "2025-12-24",
          toDate: "2025-12-26",
        },
        {
          id: 2,
          title: "New Year",
          description: "New Year holiday",
          fromDate: "2025-12-31",
          toDate: "2026-01-01",
        },
      ];

      vi.mocked(restapi.get).mockResolvedValue({ data: mockReasons });

      const result = await timesheetApi.getSpecialReason(
        "2025-12-01",
        "2026-01-31"
      );

      expect(restapi.get).toHaveBeenCalledWith(
        "timesheet/special-leave-reason/",
        {
          params: { from: "2025-12-01", to: "2026-01-31" },
        }
      );
      expect(result).toEqual(mockReasons);
      expect(result).toHaveLength(2);
    });

    it("should handle empty special reasons list", async () => {
      vi.mocked(restapi.get).mockResolvedValue({ data: [] });

      const result = await timesheetApi.getSpecialReason(
        "2025-01-01",
        "2025-01-31"
      );

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("should fetch special reasons for different date ranges", async () => {
      const mockReasons: SpecialReason[] = [
        {
          id: 3,
          title: "Summer break",
          description: "Summer vacation period",
          fromDate: "2025-07-01",
          toDate: "2025-08-31",
        },
      ];

      vi.mocked(restapi.get).mockResolvedValue({ data: mockReasons });

      const result = await timesheetApi.getSpecialReason(
        "2025-07-01",
        "2025-08-31"
      );

      expect(restapi.get).toHaveBeenCalledWith(
        "timesheet/special-leave-reason/",
        {
          params: { from: "2025-07-01", to: "2025-08-31" },
        }
      );
      expect(result[0].title).toBe("Summer break");
    });
  });

  describe("submitTimesheet", () => {
    it("should submit timesheet with correct params", async () => {
      vi.mocked(restapi.post).mockResolvedValue({ data: {} });

      await timesheetApi.submitTimesheet(1, "2025-01-01", "2025-01-31");

      expect(restapi.post).toHaveBeenCalledWith("core/timesheet/", {
        resource: 1,
        period: ["2025-01-01", "2025-01-31"],
      });
    });

    it("should submit timesheet for different resource", async () => {
      vi.mocked(restapi.post).mockResolvedValue({ data: {} });

      await timesheetApi.submitTimesheet(42, "2025-02-01", "2025-02-28");

      expect(restapi.post).toHaveBeenCalledWith("core/timesheet/", {
        resource: 42,
        period: ["2025-02-01", "2025-02-28"],
      });
    });

    it("should submit timesheet with single day period", async () => {
      vi.mocked(restapi.post).mockResolvedValue({ data: {} });

      await timesheetApi.submitTimesheet(5, "2025-01-15", "2025-01-15");

      expect(restapi.post).toHaveBeenCalledWith("core/timesheet/", {
        resource: 5,
        period: ["2025-01-15", "2025-01-15"],
      });
    });
  });

  describe("calculateTotalHoursForDay", () => {
    it("should calculate total hours for a specific day", () => {
      const timeEntries: TimeEntry[] = [
        {
          id: 1,
          date: "2025-01-15",
          task: 1,
          dayShiftHours: 8,
          nightShiftHours: 0,
          sickHours: 0,
          holidayHours: 0,
          specialLeaveHours: 0,
          leaveHours: 0,
          travelHours: 0,
          onCallHours: 0,
          restHours: 0,
          bankTo: 0,
          bankFrom: 0,
        },
      ];

      const day = new Date("2025-01-15");
      const result = timesheetApi.calculateTotalHoursForDay(timeEntries, day);

      expect(result).toBe(8);
    });

    it("should sum multiple hour types for the same day", () => {
      const timeEntries: TimeEntry[] = [
        {
          id: 1,
          date: "2025-01-15",
          task: 1,
          dayShiftHours: 6,
          nightShiftHours: 2,
          sickHours: 0,
          holidayHours: 0,
          specialLeaveHours: 0,
          leaveHours: 0,
          travelHours: 1,
          onCallHours: 0,
          restHours: 0,
          bankTo: 0,
          bankFrom: 0,
        },
      ];

      const day = new Date("2025-01-15");
      const result = timesheetApi.calculateTotalHoursForDay(timeEntries, day);

      expect(result).toBe(9); // 6 + 2 + 1
    });

    it("should handle multiple entries for the same day", () => {
      const timeEntries: TimeEntry[] = [
        {
          id: 1,
          date: "2025-01-15",
          task: 1,
          dayShiftHours: 4,
          nightShiftHours: 0,
          sickHours: 0,
          holidayHours: 0,
          specialLeaveHours: 0,
          leaveHours: 0,
          travelHours: 0,
          onCallHours: 0,
          restHours: 0,
          bankTo: 0,
          bankFrom: 0,
        },
        {
          id: 2,
          date: "2025-01-15",
          task: 2,
          dayShiftHours: 4,
          nightShiftHours: 0,
          sickHours: 0,
          holidayHours: 0,
          specialLeaveHours: 0,
          leaveHours: 0,
          travelHours: 0,
          onCallHours: 0,
          restHours: 0,
          bankTo: 0,
          bankFrom: 0,
        },
      ];

      const day = new Date("2025-01-15");
      const result = timesheetApi.calculateTotalHoursForDay(timeEntries, day);

      expect(result).toBe(8); // 4 + 4
    });

    it("should return 0 for day with no entries", () => {
      const timeEntries: TimeEntry[] = [
        {
          id: 1,
          date: "2025-01-15",
          task: 1,
          dayShiftHours: 8,
          nightShiftHours: 0,
          sickHours: 0,
          holidayHours: 0,
          specialLeaveHours: 0,
          leaveHours: 0,
          travelHours: 0,
          onCallHours: 0,
          restHours: 0,
          bankTo: 0,
          bankFrom: 0,
        },
      ];

      const day = new Date("2025-01-16");
      const result = timesheetApi.calculateTotalHoursForDay(timeEntries, day);

      expect(result).toBe(0);
    });

    it("should handle empty time entries array", () => {
      const timeEntries: TimeEntry[] = [];
      const day = new Date("2025-01-15");

      const result = timesheetApi.calculateTotalHoursForDay(timeEntries, day);

      expect(result).toBe(0);
    });

    it("should include leave and special leave hours", () => {
      const timeEntries: TimeEntry[] = [
        {
          id: 1,
          date: "2025-01-15",
          task: null,
          dayShiftHours: 0,
          nightShiftHours: 0,
          sickHours: 0,
          holidayHours: 0,
          specialLeaveHours: 4,
          leaveHours: 4,
          travelHours: 0,
          onCallHours: 0,
          restHours: 0,
          bankTo: 0,
          bankFrom: 0,
        },
      ];

      const day = new Date("2025-01-15");
      const result = timesheetApi.calculateTotalHoursForDay(timeEntries, day);

      expect(result).toBe(8); // 4 special leave + 4 leave
    });

    it("should include rest hours in calculation", () => {
      const timeEntries: TimeEntry[] = [
        {
          id: 1,
          date: "2025-01-15",
          task: 1,
          dayShiftHours: 6,
          nightShiftHours: 0,
          sickHours: 0,
          holidayHours: 0,
          specialLeaveHours: 0,
          leaveHours: 0,
          travelHours: 0,
          onCallHours: 0,
          restHours: 2,
          bankTo: 0,
          bankFrom: 0,
        },
      ];

      const day = new Date("2025-01-15");
      const result = timesheetApi.calculateTotalHoursForDay(timeEntries, day);

      expect(result).toBe(8); // 6 + 2
    });

    it("should handle bank hours (bankFrom adds, bankTo subtracts)", () => {
      const timeEntries: TimeEntry[] = [
        {
          id: 1,
          date: "2025-01-15",
          task: 1,
          dayShiftHours: 8,
          nightShiftHours: 0,
          sickHours: 0,
          holidayHours: 0,
          specialLeaveHours: 0,
          leaveHours: 0,
          travelHours: 0,
          onCallHours: 0,
          restHours: 0,
          bankTo: 2,
          bankFrom: 1,
        },
      ];

      const day = new Date("2025-01-15");
      const result = timesheetApi.calculateTotalHoursForDay(timeEntries, day);

      expect(result).toBe(7); // 8 + 1 - 2
    });

    it("should handle null/undefined values as 0", () => {
      const timeEntries: TimeEntry[] = [
        {
          id: 1,
          date: "2025-01-15",
          task: 1,
          dayShiftHours: 8,
          nightShiftHours: 0,
          sickHours: 0,
          holidayHours: 0,
          specialLeaveHours: 0,
          leaveHours: 0,
          travelHours: 0,
          onCallHours: 0,
          restHours: 0,
          bankTo: 0,
          bankFrom: 0,
        } as TimeEntry,
      ];

      const day = new Date("2025-01-15");
      const result = timesheetApi.calculateTotalHoursForDay(timeEntries, day);

      expect(result).toBe(8);
    });

    it("should match dates correctly regardless of time component", () => {
      const timeEntries: TimeEntry[] = [
        {
          id: 1,
          date: "2025-01-15",
          task: 1,
          dayShiftHours: 8,
          nightShiftHours: 0,
          sickHours: 0,
          holidayHours: 0,
          specialLeaveHours: 0,
          leaveHours: 0,
          travelHours: 0,
          onCallHours: 0,
          restHours: 0,
          bankTo: 0,
          bankFrom: 0,
        },
      ];

      const dayWithTime = new Date("2025-01-15T15:30:00");
      const result = timesheetApi.calculateTotalHoursForDay(
        timeEntries,
        dayWithTime
      );

      expect(result).toBe(8);
    });
  });
});
