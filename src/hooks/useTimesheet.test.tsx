import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  useCreateTimeEntry,
  useSubmitTimesheet,
  useGetTimesheet,
  useDeleteTimeEntries,
  useGetSpecialReason,
} from "./useTimesheet";
import * as timesheetApi from "../restapi/timesheet";
import * as useAuth from "./useAuth";
import { Timesheet, SpecialReason, Resource } from "../restapi/types";

// Mock the timesheet API
vi.mock("../restapi/timesheet", () => ({
  createTimeEntry: vi.fn(),
  getTimesheet: vi.fn(),
  deleteTimeEntries: vi.fn(),
  getSpecialReason: vi.fn(),
  submitTimesheet: vi.fn(),
}));

// Mock the auth hook
vi.mock("./useAuth", () => ({
  useGetCurrentUser: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useTimesheet hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("useCreateTimeEntry", () => {
    beforeEach(() => {
      vi.mocked(useAuth.useGetCurrentUser).mockReturnValue({
        data: {
          id: 1,
          resource: { id: 5, firstName: "John", lastName: "Doe" } as Resource,
        },
      } as any);
    });

    it("should create a time entry successfully with current user's resource", async () => {
      vi.mocked(timesheetApi.createTimeEntry).mockResolvedValue({ data: {} } as any);

      const { result } = renderHook(() => useCreateTimeEntry(null), {
        wrapper: createWrapper(),
      });

      const params = {
        taskId: 1,
        dates: ["2024-01-01", "2024-01-02"],
        dayShiftHours: 8,
      };

      result.current.mutate(params);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(timesheetApi.createTimeEntry).toHaveBeenCalledWith({
        ...params,
        resourceId: 5, // From current user
      });
    });

    it("should create a time entry with selected resource id", async () => {
      vi.mocked(timesheetApi.createTimeEntry).mockResolvedValue({ data: {} } as any);

      const { result } = renderHook(() => useCreateTimeEntry(10), {
        wrapper: createWrapper(),
      });

      const params = {
        taskId: 2,
        dates: ["2024-01-03"],
        dayShiftHours: 4,
      };

      result.current.mutate(params);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(timesheetApi.createTimeEntry).toHaveBeenCalledWith({
        ...params,
        resourceId: 10, // Selected resource
      });
    });

    it("should create time entry with various hour types", async () => {
      vi.mocked(timesheetApi.createTimeEntry).mockResolvedValue({ data: {} } as any);

      const { result } = renderHook(() => useCreateTimeEntry(null), {
        wrapper: createWrapper(),
      });

      const params = {
        taskId: 1,
        dates: ["2024-01-01"],
        dayShiftHours: 8,
        nightShiftHours: 2,
        travelHours: 1,
        onCallHours: 3,
        restHours: 1,
        sickHours: 0,
        holidayHours: 0,
        leaveHours: 0,
        specialLeaveHours: 0,
        comment: "Test comment",
      };

      result.current.mutate(params);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(timesheetApi.createTimeEntry).toHaveBeenCalledWith({
        ...params,
        resourceId: 5,
      });
    });

    it("should handle create time entry error", async () => {
      vi.mocked(timesheetApi.createTimeEntry).mockRejectedValue(
        new Error("Failed to create time entry")
      );

      const { result } = renderHook(() => useCreateTimeEntry(null), {
        wrapper: createWrapper(),
      });

      const params = {
        dates: ["2024-01-01"],
        dayShiftHours: 8,
      };

      result.current.mutate(params);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it("should invalidate timesheet queries on success", async () => {
      vi.mocked(timesheetApi.createTimeEntry).mockResolvedValue({ data: {} } as any);

      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useCreateTimeEntry(null), { wrapper });

      const params = {
        dates: ["2024-01-01"],
        dayShiftHours: 8,
      };

      result.current.mutate(params);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["timesheet"] });
    });

    it("should throw error when resource ID is undefined", () => {
      vi.mocked(useAuth.useGetCurrentUser).mockReturnValue({
        data: {
          id: 1,
          resource: { id: undefined } as any,
        },
      } as any);

      expect(() => {
        renderHook(() => useCreateTimeEntry(null), {
          wrapper: createWrapper(),
        });
      }).toThrow("Resource ID is undefined");
    });

    it("should create time entry with bank hours", async () => {
      vi.mocked(timesheetApi.createTimeEntry).mockResolvedValue({ data: {} } as any);

      const { result } = renderHook(() => useCreateTimeEntry(5), {
        wrapper: createWrapper(),
      });

      const params = {
        taskId: 1,
        dates: ["2024-01-01"],
        dayShiftHours: 8,
        bankFrom: 2,
        bankTo: 1,
      };

      result.current.mutate(params);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(timesheetApi.createTimeEntry).toHaveBeenCalledWith({
        ...params,
        resourceId: 5,
      });
    });
  });

  describe("useSubmitTimesheet", () => {
    it("should submit timesheet successfully", async () => {
      vi.mocked(timesheetApi.submitTimesheet).mockResolvedValue({ data: {} } as any);

      const { result } = renderHook(() => useSubmitTimesheet(), {
        wrapper: createWrapper(),
      });

      const params = {
        resourceId: 5,
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      };

      result.current.mutate(params);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(timesheetApi.submitTimesheet).toHaveBeenCalledWith(5, "2024-01-01", "2024-01-31");
    });

    it("should handle submit timesheet error", async () => {
      vi.mocked(timesheetApi.submitTimesheet).mockRejectedValue(
        new Error("Failed to submit timesheet")
      );

      const { result } = renderHook(() => useSubmitTimesheet(), {
        wrapper: createWrapper(),
      });

      const params = {
        resourceId: 5,
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      };

      result.current.mutate(params);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it("should invalidate timesheet queries on success", async () => {
      vi.mocked(timesheetApi.submitTimesheet).mockResolvedValue({ data: {} } as any);

      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useSubmitTimesheet(), { wrapper });

      const params = {
        resourceId: 5,
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      };

      result.current.mutate(params);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["timesheet"] });
    });
  });

  describe("useGetTimesheet", () => {
    const mockTimesheet: Timesheet = {
      tasks: [
        {
          id: 1,
          mission: 1,
          name: "Development",
          defaultHours: 8,
          type: "work",
        },
      ],
      timeEntries: [
        {
          id: 1,
          date: "2024-01-01",
          task: 1,
          dayShiftHours: 8,
          nightShiftHours: 0,
          sickHours: 0,
          holidayHours: 0,
          leaveHours: 0,
          specialLeaveHours: 0,
          travelHours: 0,
          onCallHours: 0,
          bankTo: 0,
          bankFrom: 0,
          restHours: 0,
          comment: "",
          protocolNumber: "",
        },
      ],
      days: {
        "2024-01-01": 8,
        "2024-01-02": 8,
      },
      bankHours: 0,
    };

    beforeEach(() => {
      vi.mocked(useAuth.useGetCurrentUser).mockReturnValue({
        data: {
          id: 1,
          resource: { id: 5, firstName: "John", lastName: "Doe" } as Resource,
        },
      } as any);
    });

    it("should fetch timesheet with current user's resource", async () => {
      vi.mocked(timesheetApi.getTimesheet).mockResolvedValue(mockTimesheet);

      const { result } = renderHook(
        () => useGetTimesheet("2024-01-01", "2024-01-31", null),
        {
          wrapper: createWrapper(),
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockTimesheet);
      expect(timesheetApi.getTimesheet).toHaveBeenCalledWith({
        resourceId: 5,
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      });
    });

    it("should fetch timesheet with selected resource id", async () => {
      vi.mocked(timesheetApi.getTimesheet).mockResolvedValue(mockTimesheet);

      const { result } = renderHook(
        () => useGetTimesheet("2024-01-01", "2024-01-31", 10),
        {
          wrapper: createWrapper(),
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockTimesheet);
      expect(timesheetApi.getTimesheet).toHaveBeenCalledWith({
        resourceId: 10,
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      });
    });

    it("should not fetch when resource ID is undefined", () => {
      vi.mocked(useAuth.useGetCurrentUser).mockReturnValue({
        data: {
          id: 1,
          resource: undefined,
        },
      } as any);

      const { result } = renderHook(
        () => useGetTimesheet("2024-01-01", "2024-01-31", null),
        {
          wrapper: createWrapper(),
        }
      );

      // Query should not run
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(timesheetApi.getTimesheet).not.toHaveBeenCalled();
    });

    it("should handle error when fetching timesheet", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(timesheetApi.getTimesheet).mockRejectedValue(
        new Error("Failed to fetch timesheet")
      );

      const { result } = renderHook(
        () => useGetTimesheet("2024-01-01", "2024-01-31", null),
        {
          wrapper: createWrapper(),
        }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Timesheet fetch failed:",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it("should use correct query key with parameters", async () => {
      vi.mocked(timesheetApi.getTimesheet).mockResolvedValue(mockTimesheet);

      const queryClient = new QueryClient();
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(
        () => useGetTimesheet("2024-01-01", "2024-01-31", 5),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const cachedData = queryClient.getQueryData([
        "timesheet",
        5,
        "2024-01-01",
        "2024-01-31",
      ]);
      expect(cachedData).toEqual(mockTimesheet);
    });
  });

  describe("useDeleteTimeEntries", () => {
    it("should delete time entries successfully", async () => {
      vi.mocked(timesheetApi.deleteTimeEntries).mockResolvedValue({ data: {} } as any);

      const { result } = renderHook(() => useDeleteTimeEntries(), {
        wrapper: createWrapper(),
      });

      const entryIds = [1, 2, 3];
      result.current.mutate(entryIds);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(timesheetApi.deleteTimeEntries).toHaveBeenCalledWith(entryIds);
    });

    it("should handle delete time entries error", async () => {
      vi.mocked(timesheetApi.deleteTimeEntries).mockRejectedValue(
        new Error("Failed to delete time entries")
      );

      const { result } = renderHook(() => useDeleteTimeEntries(), {
        wrapper: createWrapper(),
      });

      const entryIds = [1, 2];
      result.current.mutate(entryIds);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it("should invalidate timesheet queries on success", async () => {
      vi.mocked(timesheetApi.deleteTimeEntries).mockResolvedValue({ data: {} } as any);

      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useDeleteTimeEntries(), { wrapper });

      const entryIds = [1];
      result.current.mutate(entryIds);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["timesheet"] });
    });

    it("should delete single time entry", async () => {
      vi.mocked(timesheetApi.deleteTimeEntries).mockResolvedValue({ data: {} } as any);

      const { result } = renderHook(() => useDeleteTimeEntries(), {
        wrapper: createWrapper(),
      });

      const entryIds = [42];
      result.current.mutate(entryIds);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(timesheetApi.deleteTimeEntries).toHaveBeenCalledWith([42]);
    });
  });

  describe("useGetSpecialReason", () => {
    const mockSpecialReasons: SpecialReason[] = [
      {
        id: 1,
        title: "Medical Leave",
        description: "Medical leave for surgery",
        fromDate: "2024-01-15",
        toDate: "2024-01-20",
      },
      {
        id: 2,
        title: "Training",
        description: "Professional training course",
        fromDate: "2024-02-01",
        toDate: "2024-02-05",
      },
    ];

    it("should fetch special reasons successfully", async () => {
      vi.mocked(timesheetApi.getSpecialReason).mockResolvedValue(mockSpecialReasons);

      const { result } = renderHook(
        () => useGetSpecialReason("2024-01-01", "2024-02-28"),
        {
          wrapper: createWrapper(),
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockSpecialReasons);
      expect(timesheetApi.getSpecialReason).toHaveBeenCalledWith(
        "2024-01-01",
        "2024-02-28"
      );
    });

    it("should handle error when fetching special reasons", async () => {
      vi.mocked(timesheetApi.getSpecialReason).mockRejectedValue(
        new Error("Failed to fetch special reasons")
      );

      const { result } = renderHook(
        () => useGetSpecialReason("2024-01-01", "2024-02-28"),
        {
          wrapper: createWrapper(),
        }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.data).toBeUndefined();
    });

    it("should use correct query key with date parameters", async () => {
      vi.mocked(timesheetApi.getSpecialReason).mockResolvedValue(mockSpecialReasons);

      const queryClient = new QueryClient();
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(
        () => useGetSpecialReason("2024-01-01", "2024-02-28"),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const cachedData = queryClient.getQueryData([
        "special-reason",
        "2024-01-01",
        "2024-02-28",
      ]);
      expect(cachedData).toEqual(mockSpecialReasons);
    });

    it("should fetch empty array of special reasons", async () => {
      vi.mocked(timesheetApi.getSpecialReason).mockResolvedValue([]);

      const { result } = renderHook(
        () => useGetSpecialReason("2024-01-01", "2024-01-31"),
        {
          wrapper: createWrapper(),
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });
  });
});
