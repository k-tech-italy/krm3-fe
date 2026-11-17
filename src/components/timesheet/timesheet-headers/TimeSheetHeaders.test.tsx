import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { DayEntry, TaskEntry, Timesheet } from "../../../restapi/types";
import TimeSheetHeaders from "./TimeSheetHeaders";

const day = new Date("2025-01-15T12:00:00");
const dayEntry = {
  id: 1,
  day: "2025-01-15",
  closed: false,
  isHoliday: false,
  askedHoliday: false,
  isSick: false,
  dayHours: 4,
  nightHours: 0,
  onCallHours: 0,
  travelHours: 0,
  leaveHours: 0,
  specialLeaveHours: 0,
  restHours: 0,
  bank: 0,
} as DayEntry;
const taskEntry = {
  id: 2,
  task: 3,
  dayEntry: 1,
  dayShiftHours: 2,
  nightShiftHours: 0,
  onCallHours: 0,
  travelHours: 0,
  comment: null,
  metadata: {},
} as TaskEntry;
const timesheet: Timesheet = {
  status: null,
  tasks: [],
  days: ["2025-01-15"],
  dayEntries: [dayEntry],
  taskEntries: [taskEntry],
  schedule: { "2025_01_15": 8 },
  bankHours: 0,
};
const baseProps = {
  timesheet,
  scheduledDays: { days: [day], numberOfDays: 1 },
  isColumnView: false,
  isMonthView: true,
  isColumnActive: () => false,
  isColumnHighlighted: () => false,
};

describe("TimeSheetHeaders", () => {
  beforeAll(() => {
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    );
  });

  afterAll(() => vi.unstubAllGlobals());

  it("renders a header from day and task entries", () => {
    render(<TimeSheetHeaders {...baseProps} />);
    expect(screen.getByTestId("header-2025-01-15")).toBeInTheDocument();
  });

  it("uses the overtime color for worked hours on a public holiday", () => {
    const publicHoliday = { ...dayEntry, isHoliday: true, dayHours: 8 };
    const colors = {
      lessThanScheduleColorBrightTheme: "#red",
      exactScheduleColorBrightTheme: "#white",
      moreThanScheduleColorBrightTheme: "#blue",
      lessThanScheduleColorDarkTheme: "#dark-red",
      exactScheduleColorDarkTheme: "#dark-white",
      moreThanScheduleColorDarkTheme: "#dark-blue",
    };

    render(
      <TimeSheetHeaders
        {...baseProps}
        timesheet={{
          ...timesheet,
          dayEntries: [publicHoliday],
          schedule: { "2025_01_15": 0 },
          timesheetColors: colors,
        }}
      />
    );

    expect(screen.getByTestId("header-2025-01-15")).toHaveStyle({
      "--header-bg-light": "#blue",
      "--header-bg-dark": "#dark-blue",
    });
  });

  it("opens the day entry editor when the header is selected", () => {
    const onHeaderClick = vi.fn();
    render(<TimeSheetHeaders {...baseProps} onHeaderClick={onHeaderClick} />);
    fireEvent.click(screen.getByTestId("header-2025-01-15"));
    expect(onHeaderClick).toHaveBeenCalledWith(day);
  });

  it.each([true, false])(
    "opens hours details on tap without opening the editor (isMonthView=%s)",
    async (isMonthView) => {
      const onHeaderClick = vi.fn();
      render(
        <TimeSheetHeaders
          {...baseProps}
          isMonthView={isMonthView}
          onHeaderClick={onHeaderClick}
          timesheet={{ ...timesheet, dayEntries: [{ ...dayEntry, leaveHours: 2 }] }}
        />
      );

      const icon = screen.getByTestId("header-2025-01-15").querySelector(".lucide-info")!;
      fireEvent.pointerDown(icon);
      fireEvent.click(icon);

      expect(onHeaderClick).not.toHaveBeenCalled();
      const tooltip = await screen.findByRole("tooltip");
      expect(within(tooltip).getByText("Leave:")).toBeInTheDocument();

      await waitFor(() => expect(tooltip).toHaveClass("react-tooltip__show"));
      fireEvent.click(document.body);
      await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
    }
  );

  it("still opens hours details on hover", async () => {
    render(
      <TimeSheetHeaders
        {...baseProps}
        timesheet={{ ...timesheet, dayEntries: [{ ...dayEntry, leaveHours: 2 }] }}
      />
    );

    fireEvent.mouseOver(screen.getByRole("button", { name: "Show hours breakdown" }));
    expect(within(await screen.findByRole("tooltip")).getByText("Leave:")).toBeInTheDocument();
  });

  it("disables days outside the selected week", () => {
    render(<TimeSheetHeaders {...baseProps} isMonthView={false} selectedWeekdays={[]} />);
    expect(screen.getByTestId("header-2025-01-15")).toBeInTheDocument();
  });
});
