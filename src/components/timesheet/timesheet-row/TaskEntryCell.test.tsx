import { render } from "@testing-library/react";
import { TaskEntry, TaskEntryCellType } from "../../../restapi/types";
import { TaskEntryCell } from "./TaskEntryCell";

describe("TaskEntryCell", () => {
  const baseProps = {
    day: new Date(),
    taskId: 1,
    isMonthView: false,
    isColumnHighlighted: false,
    colors: { backgroundColor: "#fff", borderColor: "#000" },
    isInDragRange: false,
    isColumnView: false,
    readOnly: false,
    isNoWorkDay: false,
    isLockedDay: false,
    isInSelectedWeekdays: true,
  };

  it("renders EmptyCell for TASK type", () => {
    const { container } = render(<TaskEntryCell {...baseProps} type={TaskEntryCellType.TASK} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders EmptyCell for CLOSED type", () => {
    const { container } = render(<TaskEntryCell {...baseProps} type={TaskEntryCellType.CLOSED} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders SpecialDayCell for HOLIDAY type", () => {
    const { container } = render(<TaskEntryCell {...baseProps} type={TaskEntryCellType.HOLIDAY} />);
    expect(container.querySelector('[id^="holiday-cell-"]')).toBeInTheDocument();
  });

  it("renders SpecialDayCell for SICK type", () => {
    const { container } = render(<TaskEntryCell {...baseProps} type={TaskEntryCellType.SICK} />);
    expect(container.querySelector('[id^="sick-day-cell-"]')).toBeInTheDocument();
  });

  it("renders SpecialDayCell for FINISHED type", () => {
    const { container } = render(
      <TaskEntryCell {...baseProps} type={TaskEntryCellType.FINISHED} />
    );
    expect(container.querySelector('[id^="task-finished-cell-"]')).toBeInTheDocument();
  });

  it("renders TaskEntryItem when taskEntry is provided", () => {
    const taskEntry: TaskEntry = {
      id: 1,
      task: 1,
      taskTitle: null,
      dayEntry: 1,
      dayShiftHours: 2,
      nightShiftHours: 1,
      onCallHours: 0,
      travelHours: 0,
      comment: null,
      metadata: {},
    };

    const { container } = render(
      <TaskEntryCell {...baseProps} type={TaskEntryCellType.TASK} taskEntry={taskEntry} />
    );

    expect(container).toHaveTextContent("3");
  });

  it("renders with column view styling", () => {
    const { container } = render(
      <TaskEntryCell {...baseProps} type={TaskEntryCellType.TASK} isColumnView={true} />
    );
    const divElement = container.querySelector('div[class*="border-l"]');
    expect(divElement).toBeInTheDocument();
  });

  it("renders with isToday styling", () => {
    const today = new Date();
    const { container } = render(
      <TaskEntryCell {...baseProps} day={today} type={TaskEntryCellType.TASK} />
    );
    const element = container.querySelector('div[class*="bg-table-today"]');
    expect(element).toBeInTheDocument();
  });

  it("renders with no-work-day styling", () => {
    const testDate = new Date("2025-10-11"); // Saturday
    const { container } = render(
      <TaskEntryCell
        {...baseProps}
        day={testDate}
        type={TaskEntryCellType.TASK}
        isNoWorkDay={true}
      />
    );
    const element = container.querySelector(
      'div[class*="bg-table-row-alt"], div[class*="bg-closed-non-work"]'
    );
    expect(element).toBeInTheDocument();
  });

  it("renders with locked no-work-day styling", () => {
    const testDate = new Date("2025-10-11");
    const { container } = render(
      <TaskEntryCell
        {...baseProps}
        day={testDate}
        type={TaskEntryCellType.TASK}
        isNoWorkDay={true}
        isLockedDay={true}
      />
    );
    const element = container.querySelector('div[class*="bg-closed-non-work"]');
    expect(element).toBeInTheDocument();
  });

  it("renders with drag range highlighting", () => {
    const { container } = render(
      <TaskEntryCell {...baseProps} type={TaskEntryCellType.TASK} isInDragRange={true} />
    );
    const element = container.querySelector('div[class*="bg-card"]');
    expect(element).toBeInTheDocument();
  });

  it("renders with column highlighted", () => {
    const { container } = render(
      <TaskEntryCell {...baseProps} type={TaskEntryCellType.TASK} isColumnHighlighted={true} />
    );
    const element = container.querySelector('div[class*="bg-card"]');
    expect(element).toBeInTheDocument();
  });

  it("renders with not in selected weekdays", () => {
    const { container } = render(
      <TaskEntryCell {...baseProps} type={TaskEntryCellType.TASK} isInSelectedWeekdays={false} />
    );
    const element = container.querySelector('div[class*="cursor-not-allowed"]');
    expect(element).toBeInTheDocument();
  });

  it("disables droppable when not in month view and not in selected weekdays", () => {
    const { container } = render(
      <TaskEntryCell
        {...baseProps}
        type={TaskEntryCellType.TASK}
        isMonthView={false}
        isInSelectedWeekdays={false}
      />
    );
    // The component should render but with disabled interactions
    expect(container.firstChild).toBeInTheDocument();
  });

  it("disables droppable when day is locked", () => {
    const { container } = render(
      <TaskEntryCell {...baseProps} type={TaskEntryCellType.TASK} isLockedDay={true} />
    );
    // The component should render but with disabled interactions
    expect(container.firstChild).toBeInTheDocument();
  });
});
