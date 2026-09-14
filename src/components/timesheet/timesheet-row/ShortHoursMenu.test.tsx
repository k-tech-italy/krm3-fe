import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DayEntry, TaskEntry } from "../../../restapi/types";
import { ShortHoursMenu } from "./ShortHoursMenu";

const createTask = vi.fn().mockResolvedValue({});
const deleteTasks = vi.fn().mockResolvedValue({});
vi.mock("../../../hooks/useTimesheet", () => ({
  useCreateTaskEntry: () => ({ mutateAsync: createTask, error: null }),
  useDeleteTaskEntries: () => ({ mutateAsync: deleteTasks }),
}));
vi.mock("../../../hooks/useAuth", () => ({
  useGetCurrentUser: () => ({ data: { resource: { id: 1 } } }),
}));
vi.mock("react-toastify", () => ({
  toast: { error: vi.fn(), promise: vi.fn((promise) => promise) },
}));
vi.mock("react-tooltip", () => ({ Tooltip: () => <div /> }));

const day = new Date("2025-01-15T12:00:00");
const dayEntry = { id: 11, day: "2025-01-15", closed: false } as DayEntry;
const taskEntry = {
  id: 21,
  task: 3,
  dayEntry: 11,
  dayShiftHours: 2,
  nightShiftHours: 0,
  onCallHours: 0,
  travelHours: 0,
  comment: null,
  metadata: {},
} as TaskEntry;
const baseProps = {
  dayToOpen: day,
  taskId: 3,
  openShortMenu: { startDate: "2025-01-15", endDate: "2025-01-15", taskId: "3" },
  readOnly: false,
  selectedResourceId: 1,
  setOpenShortMenu: vi.fn(),
  openTaskEntryModal: vi.fn(),
  taskEntries: [] as TaskEntry[],
  dayEntries: [] as DayEntry[],
  schedule: { "2025_01_15": 8 },
};
const renderMenu = (overrides = {}) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ShortHoursMenu {...baseProps} {...overrides} />
    </QueryClientProvider>
  );

describe("ShortHoursMenu", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates task-entry hours from a quick option", async () => {
    renderMenu();
    fireEvent.click(screen.getByTestId("short-menu-2h-button"));
    await waitFor(() => expect(createTask).toHaveBeenCalled());
  });

  it("skips non-working days in a multi-day selection", async () => {
    renderMenu({
      dayToOpen: new Date("2025-01-17T12:00:00"),
      openShortMenu: { startDate: "2025-01-15", endDate: "2025-01-17", taskId: "3" },
      schedule: {
        "2025_01_15": 8,
        "2025_01_16": 0,
        "2025_01_17": 8,
      },
    });
    fireEvent.click(screen.getByTestId("short-menu-2h-button"));

    await waitFor(() =>
      expect(createTask).toHaveBeenCalledWith(
        expect.objectContaining({ dates: ["2025-01-15", "2025-01-17"] })
      )
    );
  });

  it("keeps a non-working day in a single-day selection", async () => {
    renderMenu({
      dayToOpen: new Date("2025-01-16T12:00:00"),
      openShortMenu: { startDate: "2025-01-16", endDate: "2025-01-16", taskId: "3" },
      schedule: { "2025_01_16": 0 },
    });
    fireEvent.click(screen.getByTestId("short-menu-2h-button"));

    await waitFor(() =>
      expect(createTask).toHaveBeenCalledWith(expect.objectContaining({ dates: ["2025-01-16"] }))
    );
  });

  it("requests backend autofill with zero daytime hours", async () => {
    renderMenu();
    fireEvent.click(screen.getByTestId("short-menu-autofill-button"));

    await waitFor(() =>
      expect(createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          dates: ["2025-01-15"],
          taskId: 3,
          autofill: true,
          dayShiftHours: 0,
        })
      )
    );
  });

  it("opens the task-entry modal from More", () => {
    renderMenu();
    fireEvent.click(screen.getByText("More"));
    expect(baseProps.openTaskEntryModal).toHaveBeenCalled();
  });

  it("deletes existing task entries", async () => {
    renderMenu({ dayEntries: [dayEntry], taskEntries: [taskEntry] });
    fireEvent.click(screen.getByTestId("short-menu-delete-button"));
    await waitFor(() => expect(deleteTasks).toHaveBeenCalledWith([21]));
  });

  it("shows Details in read-only mode", () => {
    renderMenu({ readOnly: true });
    expect(screen.getByText("Details")).toBeInTheDocument();
    expect(screen.queryByTestId("short-menu-2h-button")).not.toBeInTheDocument();
  });
});
