import { render, screen, fireEvent } from "@testing-library/react";
import EditDayEntry from "./EditDayEntry";
import { vi } from "vitest";
import {TimeEntry} from "../../../restapi/types.ts";

const mutateDeleteMock = vi.fn().mockResolvedValue(undefined);

vi.mock("../../../hooks/useTimesheet", () => ({
  useCreateTimeEntry: () => ({
    mutateAsync: vi.fn(),
    isLoading: false,
    isError: false,
    error: null,
  }),
  useDeleteTimeEntries: () => ({
    mutateAsync: mutateDeleteMock,
  }),
  useGetSpecialReason: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
}));
vi.mock("react-tooltip", () => ({
  Tooltip: () => <div data-testid="tooltip" />,
}));

describe("EditDayEntry", () => {
  const baseProps = {
    startDate: new Date("2024-06-01"),
    endDate: new Date("2024-06-03"),
    timeEntries: [],
    onClose: vi.fn(),
    readOnly: false,
    selectedResourceId: 1,
    noWorkingDays: {},
  };
  it("renders form and entry type options", () => {
    render(<EditDayEntry {...baseProps} />);
    expect(screen.getByText(/days/i)).toBeInTheDocument();
    expect(screen.getByText(/entry type/i)).toBeInTheDocument();
    expect(screen.getByText(/holiday/i)).toBeInTheDocument();
    expect(screen.getByText(/sick day/i)).toBeInTheDocument();
    expect(screen.getByText(/leave/i)).toBeInTheDocument();
    expect(screen.getByText(/rest/i)).toBeInTheDocument();
  });
  it("calls onClose when Cancel is clicked", () => {
    render(<EditDayEntry {...baseProps} />);
    fireEvent.click(screen.getByText(/cancel/i));
    expect(baseProps.onClose).toHaveBeenCalled();
  });
  it("renders delete button when leave exist", () => {
    const timeEntries : TimeEntry[] = [
      {
        date: '2024-06-01',
        id: 1,
        dayShiftHours: 0,
        sickHours: 0,
        holidayHours: 0,
        leaveHours: 2,
        specialLeaveHours: 0,
        travelHours: 0,
        restHours: 0,
        nightShiftHours: 0,
        onCallHours: 0,
        task: 1
      }
    ]
    render(<EditDayEntry {...baseProps } timeEntries={timeEntries}/>);
    expect(screen.getByText('Delete')).toBeInTheDocument();
  })
  it("renders delete button when special leave exist", () => {
    const timeEntries : TimeEntry[] = [
      {
        date: '2024-06-01',
        id: 1,
        dayShiftHours: 0,
        sickHours: 0,
        holidayHours: 0,
        leaveHours: 0,
        specialLeaveHours: 5,
        travelHours: 0,
        restHours: 0,
        nightShiftHours: 0,
        onCallHours: 0,
        task: 1
      }
    ]
    render(<EditDayEntry {...baseProps } timeEntries={timeEntries}/>);
    expect(screen.getByText('Delete')).toBeInTheDocument();
  })
  it("renders delete button when rest exist", () => {
    const timeEntries : TimeEntry[] = [
      {
        date: '2024-06-01',
        id: 1,
        dayShiftHours: 0,
        sickHours: 0,
        holidayHours: 0,
        leaveHours: 0,
        specialLeaveHours: 0,
        travelHours: 0,
        restHours: 1,
        nightShiftHours: 0,
        onCallHours: 0,
        task: 1
      }
    ]
    render(<EditDayEntry {...baseProps } timeEntries={timeEntries}/>);
    expect(screen.getByText('Delete')).toBeInTheDocument();
  })
  it("do not render delete button when there is no rest or leave entry", () => {
    const timeEntries : TimeEntry[] = [
      {
        date: '2024-06-01',
        id: 1,
        dayShiftHours: 2,
        sickHours: 0,
        holidayHours: 0,
        leaveHours: 0,
        specialLeaveHours: 0,
        travelHours: 0,
        restHours: 0,
        nightShiftHours: 0,
        onCallHours: 0,
        task: 1
      }
    ]
    render(<EditDayEntry {...baseProps } timeEntries={timeEntries}/>);
    expect(screen.queryByText('Delete')).toBeNull();
  })
  it("delete only leaves/rests when clicked on delete button", () => {
    const timeEntries : TimeEntry[] = [
      {
        date: '2024-06-01',
        id: 1,
        dayShiftHours: 0,
        sickHours: 0,
        holidayHours: 0,
        leaveHours: 0,
        specialLeaveHours: 0,
        travelHours: 0,
        restHours: 1,
        nightShiftHours: 0,
        onCallHours: 0,
        task: 1
      },
      {
        date: '2024-06-02',
        id: 2,
        dayShiftHours: 0,
        sickHours: 0,
        holidayHours: 0,
        leaveHours: 2,
        specialLeaveHours: 0,
        travelHours: 0,
        restHours: 0,
        nightShiftHours: 0,
        onCallHours: 0,
        task: 1
      },
      {
        date: '2024-06-01',
        id: 3,
        dayShiftHours: 2,
        sickHours: 0,
        holidayHours: 0,
        leaveHours: 0,
        specialLeaveHours: 0,
        travelHours: 0,
        restHours: 0,
        nightShiftHours: 0,
        onCallHours: 0,
        task: 1
      },
      {
        date: '2024-06-03',
        id: 4,
        dayShiftHours: 0,
        sickHours: 0,
        holidayHours: 0,
        leaveHours: 0,
        specialLeaveHours: 4,
        travelHours: 0,
        restHours: 0,
        nightShiftHours: 0,
        onCallHours: 0,
        task: 1
      }
    ]
    render(<EditDayEntry {...baseProps } timeEntries={timeEntries}/>);
    screen.getByText('Delete').click()
    expect(mutateDeleteMock).toHaveBeenCalledWith([1, 2, 4]);
  })
}); 