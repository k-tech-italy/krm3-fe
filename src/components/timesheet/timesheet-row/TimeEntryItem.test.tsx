import { render, screen } from "@testing-library/react";
import { TimeEntryItem } from "./TimeEntryItem";
import React from "react";

describe("TimeEntryItem", () => {
  const entry = {
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

  it("renders with isMonthView false", () => {
    render(
      <TimeEntryItem
        entry={entry}
        taskId={1}
        isMonthView={false}
        backgroundColor="#fff"
        isDayLocked={false}
      />
    );
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders with isMonthView true", () => {
    render(
      <TimeEntryItem
        entry={entry}
        taskId={1}
        isMonthView={true}
        backgroundColor="#fff"
        isDayLocked={false}
      />
    );
    expect(screen.getByText("3")).toBeInTheDocument();
  });
}); 