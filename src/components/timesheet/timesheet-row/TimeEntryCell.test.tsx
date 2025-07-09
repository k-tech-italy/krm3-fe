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
    };
    const { container } = render(
      <TimeEntryCell {...baseProps} type={TimeEntryType.TASK} timeEntry={timeEntry} />
    );
    expect(container).toHaveTextContent("3");
  });
}); 