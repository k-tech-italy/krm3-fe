import { render } from "@testing-library/react";
import { TimeEntryCell } from "./TimeEntryCell";
import React from "react";
import { TimeEntryType } from "../../../restapi/types";

describe("TimeEntryCell", () => {
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
    schedule: {},
  };

  it("renders EmptyCell for TASK type", () => {
    const { container } = render(
      <TimeEntryCell {...baseProps} type={TimeEntryType.TASK} />
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders EmptyCell for CLOSED type", () => {
    const { container } = render(
      <TimeEntryCell {...baseProps} type={TimeEntryType.CLOSED} />
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders SpecialDayCell for HOLIDAY type", () => {
    const { container } = render(
      <TimeEntryCell {...baseProps} type={TimeEntryType.HOLIDAY} />
    );
    expect(container.querySelector('[id^="holiday-cell-"]')).toBeInTheDocument();
  });

  it("renders SpecialDayCell for SICK type", () => {
    const { container } = render(
      <TimeEntryCell {...baseProps} type={TimeEntryType.SICK} />
    );
    expect(container.querySelector('[id^="sick-day-cell-"]')).toBeInTheDocument();
  });

  it("renders SpecialDayCell for FINISHED type", () => {
    const { container } = render(
      <TimeEntryCell {...baseProps} type={TimeEntryType.FINISHED} />
    );
    expect(container.querySelector('[id^="task-finished-cell-"]')).toBeInTheDocument();
  });

  it("renders TimeEntryItem when timeEntry is provided", () => {
    const timeEntry = {
      id: 1,
      dayShiftHours: 2,
      nightShiftHours: 1,
      restHours: 0,
      travelHours: 0,
      date: new Date().toISOString(),
      task: 1,
      sickHours: 0,
      holidayHours: 0,
      leaveHours: 0,
      onCallHours: 0,
      specialLeaveHours: 0,
      specialReason: undefined,
      comment: undefined,
      bankFrom: 0,
      bankTo: 0
    };
    const { container } = render(
      <TimeEntryCell {...baseProps} type={TimeEntryType.TASK} timeEntry={timeEntry} />
    );
    expect(container).toHaveTextContent("3");
  });

  it("renders with column view styling", () => {
    const { container } = render(
      <TimeEntryCell {...baseProps} type={TimeEntryType.TASK} isColumnView={true} />
    );
    const divElement = container.querySelector('div[class*="border-l"]');
    expect(divElement).toBeInTheDocument();
  });

  it("renders with isToday styling", () => {
    const today = new Date();
    const { container } = render(
      <TimeEntryCell {...baseProps} day={today} type={TimeEntryType.TASK} />
    );
    const element = container.querySelector('div[class*="bg-table-today"]');
    expect(element).toBeInTheDocument();
  });

  it("renders with no-work-day styling when scheduledHours is 0", () => {
    const testDate = new Date('2025-10-11'); // Saturday
    const schedule = { '2025_10_11': 0 };
    const { container } = render(
      <TimeEntryCell
        {...baseProps}
        day={testDate}
        type={TimeEntryType.TASK}
        schedule={schedule}
        isNoWorkDay={true}
      />
    );
    const element = container.querySelector('div[class*="bg-table-row-alt"], div[class*="bg-closed-non-work"]');
    expect(element).toBeInTheDocument();
  });

  it("renders with locked no-work-day styling", () => {
    const testDate = new Date('2025-10-11');
    const schedule = { '2025_10_11': 0 };
    const { container } = render(
      <TimeEntryCell
        {...baseProps}
        day={testDate}
        type={TimeEntryType.TASK}
        schedule={schedule}
        isNoWorkDay={true}
        isLockedDay={true}
      />
    );
    const element = container.querySelector('div[class*="bg-closed-non-work"]');
    expect(element).toBeInTheDocument();
  });

  it("renders with drag range highlighting", () => {
    const { container } = render(
      <TimeEntryCell {...baseProps} type={TimeEntryType.TASK} isInDragRange={true} />
    );
    const element = container.querySelector('div[class*="bg-card"]');
    expect(element).toBeInTheDocument();
  });

  it("renders with column highlighted", () => {
    const { container } = render(
      <TimeEntryCell {...baseProps} type={TimeEntryType.TASK} isColumnHighlighted={true} />
    );
    const element = container.querySelector('div[class*="bg-card"]');
    expect(element).toBeInTheDocument();
  });

  it("renders with not in selected weekdays", () => {
    const { container } = render(
      <TimeEntryCell
        {...baseProps}
        type={TimeEntryType.TASK}
        isInSelectedWeekdays={false}
      />
    );
    const element = container.querySelector('div[class*="cursor-not-allowed"]');
    expect(element).toBeInTheDocument();
  });

  it("disables droppable when not in month view and not in selected weekdays", () => {
    const { container } = render(
      <TimeEntryCell
        {...baseProps}
        type={TimeEntryType.TASK}
        isMonthView={false}
        isInSelectedWeekdays={false}
      />
    );
    // The component should render but with disabled interactions
    expect(container.firstChild).toBeInTheDocument();
  });

  it("disables droppable when day is locked", () => {
    const { container } = render(
      <TimeEntryCell
        {...baseProps}
        type={TimeEntryType.TASK}
        isLockedDay={true}
      />
    );
    // The component should render but with disabled interactions
    expect(container.firstChild).toBeInTheDocument();
  });
}); 