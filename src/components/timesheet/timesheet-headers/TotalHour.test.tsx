import { render, screen } from "@testing-library/react";
import { TotalHourCell, TotalHourForTask } from "./TotalHour";
import { vi } from "vitest";

// Mock the Info icon from lucide-react
vi.mock("lucide-react", () => ({
  Info: () => <svg data-testid="info-icon" />,
  DoorOpen: () => <svg data-testid="door-icon" />,
}));

describe("TotalHourCell", () => {
  const baseDay = new Date();
  const baseEntry = {
    id: 1,
    dayShiftHours: 2,
    nightShiftHours: 1,
    restHours: 0,
    travelHours: 0,
    leaveHours: 0,
    onCallHours: 0,
    sickHours: 0,
    holidayHours: 0,
    date: baseDay.toISOString(),
    task: 1,
    specialLeaveHours: 0,
    specialReason: undefined,
    comment: undefined,
  };

  it("renders 0h if no timeEntries", () => {
    render(<TotalHourCell day={baseDay} />);
    expect(screen.getByText(/0h/)).toBeInTheDocument();
  });

  it("renders 3h if total hours is 3h", () => {
    render(<TotalHourCell day={baseDay} timeEntries={[baseEntry]} />);
    expect(screen.getByText(/3h/)).toBeInTheDocument();
    expect(screen.getByText(/3h/)).toHaveClass("text-blue-500");
  });

  it("renders 8h if total hours is 8h", () => {
    render(
      <TotalHourCell
        day={baseDay}
        timeEntries={[{ ...baseEntry, dayShiftHours: 7 }]}
      />
    );
    expect(screen.getByText(/8h/)).toBeInTheDocument();
    expect(screen.getByText(/8h/)).toHaveClass("text-green-500");
  });

  it("renders TotalHourForTask", () => {
    render(<TotalHourForTask timeEntry={baseEntry} />);
    expect(screen.getByText(/2h/)).toBeInTheDocument();
  });

  it("renders TotalHourForTask with taskTitle", () => {
    render(
      <TotalHourForTask timeEntry={{ ...baseEntry, taskTitle: "Test Task" }} />
    );
    expect(screen.getByText(/Task: Test Task/)).toBeInTheDocument();
  });
  it("renders door icon when leave exist", () => {
    render(
        <TotalHourCell
            day={baseDay}
            timeEntries={[{ ...baseEntry, leaveHours: 1 }]}
        />
    );
    expect(screen.getByTestId(`door-icon`))
  })
  it("renders door icon when special leave exist", () => {
    render(
        <TotalHourCell
            day={baseDay}
            timeEntries={[{ ...baseEntry, specialLeaveHours: 1 }]}
        />
    );
    expect(screen.getByTestId(`door-icon`))
  })
  it("does not render door icon when there is no leave or special leave", () => {
    render(
        <TotalHourCell
            day={baseDay}
            timeEntries={[{ ...baseEntry }]}
        />
    );
    expect(screen.queryByText(`door-icon`)).not.toBeInTheDocument();
  })
});
