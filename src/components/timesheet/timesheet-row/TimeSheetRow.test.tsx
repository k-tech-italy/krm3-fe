import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DayEntry, TaskEntry, Timesheet } from "../../../restapi/types";
import { TimeSheetRow } from "./TimeSheetRow";

vi.mock("react-tooltip", () => ({
  Tooltip: ({ children }: { children?: React.ReactNode }) => children,
}));

const day = new Date("2025-01-15T12:00:00");
const task = { id: 3, title: "Task 3", startDate: "2025-01-01", color: "#fff" };
const dayEntry = {
  id: 1,
  day: "2025-01-15",
  closed: false,
  askedHoliday: false,
  isHoliday: false,
  isSick: false,
} as DayEntry;
const taskEntry = {
  id: 2,
  task: 3,
  dayEntry: 1,
  dayShiftHours: 4,
  nightShiftHours: 0,
  travelHours: 0,
  onCallHours: 0,
  comment: null,
  metadata: {},
} as TaskEntry;
const timesheet: Timesheet = {
  submitted: false,
  tasks: [task],
  days: ["2025-01-15"],
  dayEntries: [dayEntry],
  taskEntries: [taskEntry],
  schedule: { "2025-01-15": 8 },
  bankHours: 0,
};
const baseProps = {
  timesheet,
  index: 0,
  scheduledDays: [day],
  task,
  isMonthView: true,
  isColumnView: false,
  isCellInDragRange: () => false,
  isColumnHighlighted: () => false,
  openTaskEntryModal: vi.fn(),
  readOnly: false,
  selectedResourceId: 1,
};

describe("TimeSheetRow", () => {
  it("renders task-entry hours", () => {
    render(<TimeSheetRow {...baseProps} />);
    expect(screen.getAllByText("4").length).toBeGreaterThan(0);
  });

  it("renders task-entry hours on a public holiday", () => {
    const publicHoliday = { ...dayEntry, isHoliday: true };
    const { container } = render(
      <TimeSheetRow {...baseProps} timesheet={{ ...timesheet, dayEntries: [publicHoliday] }} />
    );

    expect(screen.getAllByText("4").length).toBeGreaterThan(0);
    expect(container.querySelector('[id^="holiday-cell-"]')).not.toBeInTheDocument();
  });

  it("renders an empty task cell without a task entry", () => {
    render(<TimeSheetRow {...baseProps} timesheet={{ ...timesheet, taskEntries: [] }} />);
    expect(screen.getByText("Task 3")).toBeInTheDocument();
  });

  it("renders closed day entries as locked cells", () => {
    const closedDay = { ...dayEntry, closed: true };
    render(<TimeSheetRow {...baseProps} timesheet={{ ...timesheet, dayEntries: [closedDay] }} />);
    expect(screen.getByText("Task 3")).toBeInTheDocument();
  });
});
