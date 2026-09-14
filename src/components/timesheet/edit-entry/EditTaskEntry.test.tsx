import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DayEntry, TaskEntry } from "../../../restapi/types";
import EditTaskEntry from "./EditTaskEntry";

const createTask = vi.fn().mockResolvedValue({});
const deleteTasks = vi.fn().mockResolvedValue({});

vi.mock("../../../hooks/useTimesheet", () => ({
  useCreateTaskEntry: () => ({ mutateAsync: createTask, error: null }),
  useDeleteTaskEntries: () => ({ mutateAsync: deleteTasks, isLoading: false, error: null }),
}));
vi.mock("react-toastify", () => ({ toast: { promise: vi.fn((promise) => promise) } }));
vi.mock("react-tooltip", () => ({ Tooltip: () => <div /> }));

const dayEntries = [
  { id: 11, day: "2024-06-01" },
  { id: 12, day: "2024-06-02" },
] as DayEntry[];
const makeTaskEntry = (overrides: Partial<TaskEntry> = {}): TaskEntry => ({
  id: 21,
  task: 1,
  dayEntry: 11,
  dayShiftHours: 4,
  nightShiftHours: 0,
  travelHours: 0,
  onCallHours: 0,
  comment: null,
  metadata: {},
  ...overrides,
});
const baseProps = {
  task: { id: 1, title: "Task 1", startDate: new Date("2024-06-01") },
  taskEntries: [] as TaskEntry[],
  dayEntries,
  startDate: new Date("2024-06-01"),
  endDate: new Date("2024-06-02"),
  closeModal: vi.fn(),
  readOnly: false,
  selectedResourceId: 1,
  holidayOrSickDays: [],
  noWorkingDays: {},
};

describe("EditTaskEntry", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders task-entry controls", () => {
    render(<EditTaskEntry {...baseProps} />);
    expect(document.getElementById("edit-task-entry-container")).toBeInTheDocument();
    expect(document.getElementById("task-entry-from-date-picker")).toBeInTheDocument();
  });

  it("initializes hours from an existing task entry", () => {
    render(<EditTaskEntry {...baseProps} taskEntries={[makeTaskEntry()]} />);
    expect(screen.getByDisplayValue("4")).toBeInTheDocument();
    expect(screen.getByText(/Task entries already exist/i)).toBeInTheDocument();
  });

  it("creates task entries", async () => {
    render(<EditTaskEntry {...baseProps} />);
    fireEvent.change(document.getElementById("daytime-input")!, {
      target: { value: "4" },
    });
    fireEvent.click(screen.getByText("Save"));
    await waitFor(() => expect(createTask).toHaveBeenCalled());
  });

  it("creates task entries with only on-call hours", async () => {
    render(<EditTaskEntry {...baseProps} />);
    fireEvent.change(document.getElementById("oncall-input")!, {
      target: { value: "8" },
    });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() =>
      expect(createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          dayShiftHours: 0,
          nightShiftHours: 0,
          travelHours: 0,
          onCallHours: 8,
        })
      )
    );
  });

  it("saves existing and new task entries in one request", async () => {
    render(<EditTaskEntry {...baseProps} taskEntries={[makeTaskEntry()]} />);
    fireEvent.change(document.getElementById("daytime-input")!, {
      target: { value: "6" },
    });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() =>
      expect(createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          taskId: 1,
          dates: ["2024-06-01", "2024-06-02"],
          dayShiftHours: 6,
        })
      )
    );
  });

  it("skips non-working days in a multi-day selection", async () => {
    render(
      <EditTaskEntry
        {...baseProps}
        noWorkingDays={{
          "2024-06-01": { closed: false, hol: false, nwd: false },
          "2024-06-02": { closed: false, hol: false, nwd: true },
        }}
      />
    );
    fireEvent.change(document.getElementById("daytime-input")!, {
      target: { value: "4" },
    });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() =>
      expect(createTask).toHaveBeenCalledWith(expect.objectContaining({ dates: ["2024-06-01"] }))
    );
  });

  it("keeps a non-working day in a single-day selection", async () => {
    const nonWorkingDay = new Date("2024-06-02");
    render(
      <EditTaskEntry
        {...baseProps}
        startDate={nonWorkingDay}
        endDate={nonWorkingDay}
        noWorkingDays={{
          "2024-06-02": { closed: false, hol: false, nwd: true },
        }}
      />
    );
    fireEvent.change(document.getElementById("daytime-input")!, {
      target: { value: "4" },
    });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() =>
      expect(createTask).toHaveBeenCalledWith(expect.objectContaining({ dates: ["2024-06-02"] }))
    );
  });

  it("deletes selected task entries", async () => {
    render(<EditTaskEntry {...baseProps} taskEntries={[makeTaskEntry()]} />);
    fireEvent.click(screen.getByText("Delete"));
    await waitFor(() => expect(deleteTasks).toHaveBeenCalledWith([21]));
  });

  it("closes when Cancel is selected", () => {
    render(<EditTaskEntry {...baseProps} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(baseProps.closeModal).toHaveBeenCalled();
  });
});
