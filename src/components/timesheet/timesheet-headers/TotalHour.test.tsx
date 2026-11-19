import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { DayEntry, TaskEntry } from "../../../restapi/types";
import { TotalHourCell, TotalHourForTask } from "./TotalHour";

vi.mock("lucide-react", () => ({
  Info: () => <svg data-testid="info-icon" />,
  DoorOpen: () => <svg data-testid="door-icon" />,
  Plane: () => <svg data-testid="plane-icon" />,
}));

describe("TotalHourCell", () => {
  const baseDay = new Date();

  const baseDayEntry: DayEntry = {
    id: 1,
    day: baseDay.toISOString(),
    lastModified: baseDay.toISOString(),
    closed: false,
    comment: null,
    contract: 1,
    timesheet: null,
    resource: 1,
    bank: 0,
    dueHours: 8,
    travelHours: 1,
    dayHours: 2,
    nightHours: 1,
    onCallHours: 0,
    isHoliday: false,
    askedHoliday: false,
    leaveHours: 0,
    specialLeaveHours: 0,
    specialLeaveReason: null,
    protocolNumber: null,
    isSick: false,
    restHours: 0,
    overtimeHours: 0,
    mealVoucher: 0,
  };

  const baseTaskEntry: TaskEntry = {
    id: 1,
    task: 1,
    taskTitle: null,
    dayEntry: baseDayEntry.id,
    dayShiftHours: 2,
    nightShiftHours: 1,
    onCallHours: 0,
    travelHours: 1,
    comment: null,
    metadata: {},
  };

  it("renders 0h if no day entry exists", () => {
    render(<TotalHourCell day={baseDay} />);

    expect(screen.getByText(/0h/)).toBeInTheDocument();
  });

  describe.each([true, false])("info indicator with isMonthView=%s", (isMonthView) => {
    const dayShiftEntry = {
      ...baseDayEntry,
      dayHours: 8,
      nightHours: 0,
      travelHours: 0,
    };

    it.each([undefined, { ...dayShiftEntry, dayHours: 0 }, dayShiftEntry])(
      "hides the indicator and tooltip without other hours (%j)",
      (dayEntry) => {
        render(<TotalHourCell day={baseDay} dayEntry={dayEntry} isMonthView={isMonthView} />);

        expect(screen.queryByTestId("info-icon")).not.toBeInTheDocument();
        expect(
          screen.queryByRole("button", { name: "Show hours breakdown" })
        ).not.toBeInTheDocument();
      }
    );

    it.each([
      { leaveHours: 2 },
      { specialLeaveHours: 2 },
      { restHours: 2 },
      { bank: 2 },
      { bank: -2 },
      { nightHours: 2 },
      { onCallHours: 2 },
      { travelHours: 2 },
      { leaveHours: "2.00" },
      { bank: "-2.00" },
      { bank: 8 },
      { dayHours: 0, onCallHours: 2 },
    ])("shows the indicator and enables the tooltip for %j", (hours) => {
      render(
        <TotalHourCell
          day={baseDay}
          dayEntry={{ ...dayShiftEntry, ...hours }}
          isMonthView={isMonthView}
        />
      );

      expect(screen.getByTestId("info-icon")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Show hours breakdown" })).toHaveAttribute(
        "data-tooltip-id"
      );
    });
  });

  it("renders 8h if total hours are 8h", () => {
    render(
      <TotalHourCell
        day={baseDay}
        dayEntry={{
          ...baseDayEntry,
          dayHours: 6,
        }}
      />
    );

    expect(screen.getByText(/8h/)).toBeInTheDocument();
  });

  it("prevents translation of the total displayed in a header cell", () => {
    render(<TotalHourCell day={baseDay} dayEntry={baseDayEntry} />);

    const headerTotal = screen.getByTestId("header-total-hours");

    expect(headerTotal).toHaveAttribute("translate", "no");
    expect(headerTotal).toHaveClass("notranslate");
  });

  it("adds withdrawn bank hours to the displayed total", () => {
    render(
      <TotalHourCell
        day={baseDay}
        dayEntry={{
          ...baseDayEntry,
          bank: -2,
        }}
      />
    );

    expect(screen.getByText(/6h/)).toBeInTheDocument();
  });

  it("renders TotalHourForTask", () => {
    render(<TotalHourForTask taskEntry={baseTaskEntry} />);

    expect(screen.getByText(/2h/)).toBeInTheDocument();
  });

  it("renders TotalHourForTask with a task title", () => {
    render(
      <TotalHourForTask
        taskEntry={{
          ...baseTaskEntry,
          taskTitle: "Test Task",
        }}
      />
    );

    expect(screen.getByText(/Task: Test Task/)).toBeInTheDocument();
  });

  it("shows only the info indicator when leave exists", () => {
    render(
      <TotalHourCell
        day={baseDay}
        dayEntry={{
          ...baseDayEntry,
          leaveHours: 1,
        }}
      />
    );

    expect(screen.queryByTestId("door-icon")).not.toBeInTheDocument();
    expect(screen.getByTestId("info-icon")).toBeInTheDocument();
  });

  it("shows only the info indicator when special leave exists", () => {
    render(
      <TotalHourCell
        day={baseDay}
        dayEntry={{
          ...baseDayEntry,
          specialLeaveHours: 1,
        }}
      />
    );

    expect(screen.queryByTestId("door-icon")).not.toBeInTheDocument();
    expect(screen.getByTestId("info-icon")).toBeInTheDocument();
  });

  it("does not render the door icon without leave", () => {
    render(<TotalHourCell day={baseDay} dayEntry={baseDayEntry} />);

    expect(screen.queryByTestId("door-icon")).not.toBeInTheDocument();
  });
});
