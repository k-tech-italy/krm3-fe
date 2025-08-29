import { render, screen } from "@testing-library/react";
import { TimeSheetRow } from "./TimeSheetRow";
import { TimeEntry } from "../../../restapi/types";
import React from "react";
import {vi} from "vitest";
vi.mock("lucide-react", () => ({
  Plane: () => <svg data-testid="plane-icon" />,
  Plus: () => <svg data-testid="plus-icon" />
}));

describe("TimeSheetRow", () => {
  const baseTask = {
    id: 1,
    title: "Task 1",
    projectName: "Project A",
    startDate: new Date(),
    color: "#fff",
  };
  const baseTimesheet = {
    tasks: [],
    timeEntries: [],
    days: {},
    bankHours: 0,
  };
  const baseProps = {
    timesheet: baseTimesheet,
    index: 0,
    scheduledDays: [new Date()],
    task: baseTask,
    isMonthView: false,
    isColumnView: false,
    isCellInDragRange: () => false,
    isColumnHighlighted: () => false,
    openTimeEntryModalHandler: () => {},
    readOnly: false,
    selectedResourceId: 1,
    holidayOrSickDays: [],
    schedule: {}
  };

  it("renders with minimal props", () => {
    render(<TimeSheetRow {...baseProps} />);
    expect(screen.getByText("Task 1")).toBeInTheDocument();
  });

  it("renders with isMonthView and isColumnView true", () => {
    render(<TimeSheetRow {...baseProps} isMonthView={true} isColumnView={true} />);
    expect(screen.getByText("Task 1")).toBeInTheDocument();
  });

  it("renders with locked days", () => {
    const days: any = {};
    const today = new Date();
    days[today.toISOString().slice(0, 10)] = { hol: false, nwd: false, closed: true };
    render(
      <TimeSheetRow
        {...baseProps}
        scheduledDays={[today]}
        timesheet={{ ...baseTimesheet, days }}
      />
    );
    expect(screen.getByText("Task 1")).toBeInTheDocument();
  });

  it("renders with timeEntries and calculates totalHours", () => {
    const timeEntries = [
      {
        id: 1,
        dayShiftHours: 2,
        nightShiftHours: 1,
        restHours: 1,
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
        bankTo: 0,
      },
    ];
    render(
      <TimeSheetRow
        {...baseProps}
        timesheet={{ ...baseTimesheet, timeEntries }}
      />
    );
    // totalHours = 2 + 1 + 1 = 4
    expect(screen.getAllByText("4").length).toBeGreaterThan(0);
  });
  it("renders plane icon when travel hours exist", () => {
    const timeEntries = [
      {
        id: 1,
        dayShiftHours: 2,
        nightShiftHours: 1,
        restHours: 1,
        travelHours: 2,
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
      }]
    render(
        <TimeSheetRow
            {...baseProps}
            timesheet={{ ...baseTimesheet, timeEntries }}
        />
    )
    expect(screen.getByTestId('plane-icon')).toBeInTheDocument();
  })
  it("doesn't render plane icon when there are no travel hours", () => {
    const timeEntries = [
      {
        id: 1,
        dayShiftHours: 2,
        nightShiftHours: 1,
        restHours: 1,
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
      }]
    render(
        <TimeSheetRow
            {...baseProps}
            timesheet={{ ...baseTimesheet, timeEntries }}
        />
    )
    expect(screen.queryByTestId('plane-icon')).not.toBeInTheDocument();
  })
}); 