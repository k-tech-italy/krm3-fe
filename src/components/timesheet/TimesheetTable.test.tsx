import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDragAndDrop, DragCallbacks } from "../../hooks/useDragAndDrop";
import { useGetTimesheet } from "../../hooks/useTimesheet";
import { DayEntry, Task, Timesheet } from "../../restapi/types";
import { TimeSheetTable } from "./TimesheetTable";

vi.mock("../../hooks/useTimesheet", () => ({
  useGetTimesheet: vi.fn(),
}));

vi.mock("../../hooks/useDragAndDrop", () => ({
  useDragAndDrop: vi.fn(),
}));

vi.mock("./timesheet-headers/TimeSheetHeaders", () => ({
  default: ({
    onHeaderClick,
    isColumnView,
  }: {
    onHeaderClick: (day: Date) => void;
    isColumnView: boolean;
  }) => (
    <button
      data-testid="open-day-entry"
      data-column-view={String(isColumnView)}
      onClick={() => onHeaderClick(new Date("2025-01-15T12:00:00"))}
    >
      Open day entry
    </button>
  ),
}));

vi.mock("./timesheet-row/TimeSheetRow", () => ({
  TimeSheetRow: ({
    task,
    openTaskEntryModal,
    openShortMenu,
  }: {
    task: Task;
    openTaskEntryModal: (task: Task) => void;
    openShortMenu?: { startDate: string; endDate: string; taskId: string };
  }) => (
    <div>
      <button data-testid={`open-task-entry-${task.id}`} onClick={() => openTaskEntryModal(task)}>
        Open task entry
      </button>
      <span data-testid={`short-menu-${task.id}`}>{JSON.stringify(openShortMenu)}</span>
    </div>
  ),
}));

const scheduledDays = [
  new Date("2025-01-15T12:00:00"),
  new Date("2025-01-16T12:00:00"),
  new Date("2025-01-17T12:00:00"),
];
const task: Task = {
  id: 3,
  title: "Task 3",
  startDate: "2025-01-01",
  endDate: "2025-01-31",
};
const dayEntry = {
  id: 1,
  day: "2025-01-15",
  closed: false,
  askedHoliday: false,
  isHoliday: false,
  isSick: false,
} as DayEntry;
const timesheet: Timesheet = {
  submitted: false,
  tasks: [task],
  taskEntries: [],
  dayEntries: [dayEntry],
  days: ["2025-01-15", "2025-01-16", "2025-01-17"],
  schedule: {
    "2025-01-15": 8,
    "2025-01-16": 0,
    "2025-01-17": 8,
  },
  bankHours: 4,
};

const mockUseGetTimesheet = vi.mocked(useGetTimesheet);
const mockUseDragAndDrop = vi.mocked(useDragAndDrop);
let dragCallbacks: DragCallbacks;

function makeProps() {
  return {
    setIsEntryModalOpen: vi.fn(),
    setSelectedTask: vi.fn(),
    setIsDayEntry: vi.fn(),
    setStartDate: vi.fn(),
    setEndDate: vi.fn(),
    setTaskEntries: vi.fn(),
    setDayEntries: vi.fn(),
    setNoWorkingDay: vi.fn(),
    setSchedule: vi.fn(),
    scheduledDays: { days: scheduledDays, numberOfDays: scheduledDays.length },
    isColumnView: false,
    startDate: scheduledDays[0],
    selectedResourceId: 1,
    readOnly: false,
    selectedWeekRange: "whole" as const,
    setBankHours: vi.fn(),
    setIsSubmitted: vi.fn(),
  };
}

describe("TimeSheetTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGetTimesheet.mockReturnValue({ data: timesheet, isLoading: false } as ReturnType<
      typeof useGetTimesheet
    >);
    mockUseDragAndDrop.mockImplementation(({ callbacks }) => {
      dragCallbacks = callbacks;
      return {
        activeId: null,
        draggedOverCells: [],
        dragType: null,
        handleDragStart: vi.fn(),
        handleDragMove: vi.fn(),
        handleDragEnd: vi.fn(),
        isCellInDragRange: vi.fn(() => false),
        isColumnActive: vi.fn(() => false),
        isColumnHighlighted: vi.fn(() => false),
        resetDragState: vi.fn(),
      };
    });
  });

  it("renders the loading state", () => {
    mockUseGetTimesheet.mockReturnValue({ data: undefined, isLoading: true } as ReturnType<
      typeof useGetTimesheet
    >);

    render(<TimeSheetTable {...makeProps()} />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders the empty state when no timesheet is available", () => {
    mockUseGetTimesheet.mockReturnValue({ data: undefined, isLoading: false } as ReturnType<
      typeof useGetTimesheet
    >);

    render(<TimeSheetTable {...makeProps()} />);

    expect(screen.getByText("No Data")).toBeInTheDocument();
  });

  it("synchronizes timesheet data with its parent", async () => {
    const props = makeProps();

    render(<TimeSheetTable {...props} />);

    await waitFor(() => {
      expect(props.setTaskEntries).toHaveBeenCalledWith(timesheet.taskEntries);
      expect(props.setDayEntries).toHaveBeenCalledWith(timesheet.dayEntries);
      expect(props.setSchedule).toHaveBeenCalledWith(timesheet.schedule);
      expect(props.setBankHours).toHaveBeenCalledWith(4);
    });
    expect(props.setNoWorkingDay).toHaveBeenCalledWith({
      "2025-01-15": { closed: false, hol: false, nwd: false },
      "2025-01-16": { closed: false, hol: false, nwd: true },
      "2025-01-17": { closed: false, hol: false, nwd: false },
    });
  });

  it("marks every calendar day as closed when the timesheet is submitted", async () => {
    mockUseGetTimesheet.mockReturnValue({
      data: { ...timesheet, submitted: true },
      isLoading: false,
    } as unknown as ReturnType<typeof useGetTimesheet>);
    const props = makeProps();

    render(<TimeSheetTable {...props} />);

    await waitFor(() => {
      expect(props.setIsSubmitted).toHaveBeenCalledWith(true);
      expect(props.setNoWorkingDay).toHaveBeenCalledWith({
        "2025-01-15": { closed: true, hol: false, nwd: false },
        "2025-01-16": { closed: true, hol: false, nwd: true },
        "2025-01-17": { closed: true, hol: false, nwd: false },
      });
    });
  });

  it("renders an empty-task message when the timesheet has no tasks", () => {
    mockUseGetTimesheet.mockReturnValue({
      data: { ...timesheet, tasks: [] },
      isLoading: false,
    } as unknown as ReturnType<typeof useGetTimesheet>);

    render(<TimeSheetTable {...makeProps()} />);

    expect(screen.getByText("No tasks available")).toBeInTheDocument();
  });

  it("opens a day entry from a header click", () => {
    const props = makeProps();

    render(<TimeSheetTable {...props} />);
    fireEvent.click(screen.getByTestId("open-day-entry"));

    expect(props.setStartDate).toHaveBeenCalledWith(new Date("2025-01-15T12:00:00"));
    expect(props.setEndDate).toHaveBeenCalledWith(new Date("2025-01-15T12:00:00"));
    expect(props.setIsDayEntry).toHaveBeenCalledWith(true);
    expect(props.setIsEntryModalOpen).toHaveBeenCalledWith(true);
  });

  it("opens a day entry for a column drag range", () => {
    const props = makeProps();
    const endDate = scheduledDays[2];

    render(<TimeSheetTable {...props} />);
    act(() => dragCallbacks.onColumnDrag?.({ startDate: scheduledDays[0], endDate }));

    expect(props.setStartDate).toHaveBeenCalledWith(scheduledDays[0]);
    expect(props.setEndDate).toHaveBeenCalledWith(endDate);
    expect(props.setIsDayEntry).toHaveBeenCalledWith(true);
    expect(props.setIsEntryModalOpen).toHaveBeenCalledWith(true);
  });

  it("opens a task entry from a task row", () => {
    const props = makeProps();

    render(<TimeSheetTable {...props} />);
    fireEvent.click(screen.getByTestId("open-task-entry-3"));

    expect(props.setSelectedTask).toHaveBeenCalledWith(task);
    expect(props.setIsDayEntry).toHaveBeenCalledWith(false);
    expect(props.setIsEntryModalOpen).toHaveBeenCalledWith(true);
  });

  it("stores the start date when dragging starts", () => {
    const props = makeProps();

    render(<TimeSheetTable {...props} />);
    act(() => dragCallbacks.onDragStart?.({ startDate: scheduledDays[0] }));

    expect(props.setStartDate).toHaveBeenCalledWith(scheduledDays[0]);
  });

  it("opens the short-hours menu for a valid task-entry drag", () => {
    const props = makeProps();

    render(<TimeSheetTable {...props} />);
    act(() => dragCallbacks.onTaskEntryDrag?.({ task, endDate: scheduledDays[2] }));

    expect(props.setSelectedTask).toHaveBeenCalledWith(task);
    expect(props.setEndDate).toHaveBeenCalledWith(scheduledDays[2]);
    expect(props.setIsDayEntry).toHaveBeenCalledWith(false);
    expect(screen.getByTestId("short-menu-3")).toHaveTextContent(
      JSON.stringify({ startDate: "2025-01-15", endDate: "2025-01-17", taskId: "3" })
    );
  });

  it.each([
    ["before the task starts", { ...task, startDate: "2025-01-16" }, scheduledDays[0], timesheet],
    ["after the task ends", { ...task, endDate: "2025-01-16" }, scheduledDays[2], timesheet],
    [
      "on a closed day",
      task,
      scheduledDays[2],
      {
        ...timesheet,
        dayEntries: [{ ...dayEntry, day: "2025-01-17", closed: true }],
      },
    ],
    [
      "when every selected day is a holiday",
      task,
      scheduledDays[2],
      {
        ...timesheet,
        dayEntries: timesheet.days.map(
          (day, index) => ({ ...dayEntry, id: index + 1, day, askedHoliday: true }) as DayEntry
        ),
      },
    ],
  ])("does not open the short-hours menu %s", (_label, draggedTask, endDate, testTimesheet) => {
    mockUseGetTimesheet.mockReturnValue({ data: testTimesheet, isLoading: false } as ReturnType<
      typeof useGetTimesheet
    >);

    render(<TimeSheetTable {...makeProps()} />);
    act(() => dragCallbacks.onTaskEntryDrag?.({ task: draggedTask, endDate }));

    expect(screen.getByTestId("short-menu-3")).toBeEmptyDOMElement();
  });

  it("renders the column-view layout", () => {
    render(<TimeSheetTable {...makeProps()} isColumnView />);

    expect(screen.getByTestId("open-day-entry")).toHaveAttribute("data-column-view", "true");
    expect(screen.getByText("Hours")).toBeInTheDocument();
  });
});
