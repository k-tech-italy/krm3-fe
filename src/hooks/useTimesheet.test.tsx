import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as timesheetApi from "../restapi/timesheet";
import * as useAuth from "./useAuth";
import {
  useCreateTaskEntry,
  useClearDayEntries,
  useDeleteDayEntry,
  useDeleteDayEntries,
  useDeleteTaskEntries,
  useGetSpecialReason,
  useGetTimesheet,
  useSubmitTimesheet,
  useSaveDayEntries,
} from "./useTimesheet";

vi.mock("../restapi/timesheet", () => ({
  createTaskEntry: vi.fn(),
  clearDayEntries: vi.fn(),
  deleteDayEntry: vi.fn(),
  deleteDayEntries: vi.fn(),
  deleteTaskEntries: vi.fn(),
  getSpecialReason: vi.fn(),
  getTimesheet: vi.fn(),
  submitTimesheet: vi.fn(),
  saveDayEntries: vi.fn(),
}));
vi.mock("./useAuth", () => ({ useGetCurrentUser: vi.fn() }));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("timesheet hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth.useGetCurrentUser).mockReturnValue({
      data: { resource: { id: 1 } },
    } as ReturnType<typeof useAuth.useGetCurrentUser>);
  });

  it("creates a task entry for the selected resource", async () => {
    vi.mocked(timesheetApi.createTaskEntry).mockResolvedValue({ id: 1 });
    const { result } = renderHook(() => useCreateTaskEntry(7), { wrapper: createWrapper() });
    const payload = { taskId: 2, dates: ["2025-01-15"], dayShiftHours: 8 };

    await act(() => result.current.mutateAsync(payload));

    expect(timesheetApi.createTaskEntry).toHaveBeenCalledWith({ ...payload, resourceId: 7 });
  });

  it("saves day entries for all selected dates", async () => {
    vi.mocked(timesheetApi.saveDayEntries).mockResolvedValue([]);
    const hook = renderHook(() => useSaveDayEntries(7), { wrapper: createWrapper() });
    const payload = { dates: ["2025-01-15", "2025-01-16"], askedHoliday: true };

    await act(() => hook.result.current.mutateAsync(payload));

    expect(timesheetApi.saveDayEntries).toHaveBeenCalledWith({
      ...payload,
      resourceId: 7,
    });
  });

  it("deletes day and task entries", async () => {
    const wrapper = createWrapper();
    const dayHook = renderHook(() => useDeleteDayEntry(), { wrapper });
    const dayEntriesHook = renderHook(() => useDeleteDayEntries(), { wrapper });
    const clearDayHook = renderHook(() => useClearDayEntries(), { wrapper });
    const taskHook = renderHook(() => useDeleteTaskEntries(), { wrapper });

    await act(() => dayHook.result.current.mutateAsync(3));
    await act(() => dayEntriesHook.result.current.mutateAsync([3, 4]));
    await act(() => clearDayHook.result.current.mutateAsync([3, 4]));
    await act(() => taskHook.result.current.mutateAsync([4, 5]));

    expect(timesheetApi.deleteDayEntry).toHaveBeenCalledWith(3);
    expect(timesheetApi.deleteDayEntries).toHaveBeenCalledWith([3, 4]);
    expect(timesheetApi.clearDayEntries).toHaveBeenCalledWith([3, 4]);
    expect(timesheetApi.deleteTaskEntries).toHaveBeenCalledWith([4, 5]);
  });

  it("submits and fetches a timesheet", async () => {
    vi.mocked(timesheetApi.getTimesheet).mockResolvedValue({
      submitted: false,
      tasks: [],
      days: [],
      bankHours: 0,
    });
    const wrapper = createWrapper();
    const submitHook = renderHook(() => useSubmitTimesheet(), { wrapper });
    const queryHook = renderHook(() => useGetTimesheet("2025-01-01", "2025-01-31", 7), {
      wrapper,
    });

    await act(() =>
      submitHook.result.current.mutateAsync({
        resourceId: 7,
        startDate: "2025-01-01",
        endDate: "2025-01-31",
      })
    );
    await waitFor(() => expect(queryHook.result.current.isSuccess).toBe(true));

    expect(timesheetApi.submitTimesheet).toHaveBeenCalledWith(7, "2025-01-01", "2025-01-31");
    expect(timesheetApi.getTimesheet).toHaveBeenCalledWith({
      resourceId: 7,
      startDate: "2025-01-01",
      endDate: "2025-01-31",
    });
  });

  it("fetches special reasons", async () => {
    vi.mocked(timesheetApi.getSpecialReason).mockResolvedValue([]);
    const { result } = renderHook(() => useGetSpecialReason("2025-01-01", "2025-01-31"), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(timesheetApi.getSpecialReason).toHaveBeenCalledWith("2025-01-01", "2025-01-31");
  });
});
