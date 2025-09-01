import { render, screen, fireEvent } from "@testing-library/react";
import EditDayEntry from "./EditDayEntry";
import { vi } from "vitest";
import {TimeEntry} from "../../../restapi/types.ts";
import EditTimeEntry from "./EditTimeEntry.tsx";

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
    calendarDays: {},
    schedule: {},
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
    const timeEntries: TimeEntry[] = [
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
        task: 1,
        bankFrom: 0,
        bankTo: 0,
      }
    ]
    render(<EditDayEntry {...baseProps} timeEntries={timeEntries}/>);
    expect(screen.getByText('Delete')).toBeInTheDocument();
  })
  it("renders delete button when special leave exist", () => {
    const timeEntries: TimeEntry[] = [
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
        task: 1,
        bankFrom: 0,
        bankTo: 0,
      }
    ]
    render(<EditDayEntry {...baseProps} timeEntries={timeEntries}/>);
    expect(screen.getByText('Delete')).toBeInTheDocument();
  })
  it("renders delete button when rest exist", () => {
    const timeEntries: TimeEntry[] = [
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
        task: 1,
        bankFrom: 0,
        bankTo: 0,
      }
    ]
    render(<EditDayEntry {...baseProps} timeEntries={timeEntries}/>);
    expect(screen.getByText('Delete')).toBeInTheDocument();
  })
  it("do not render delete button when there is no rest or leave entry", () => {
    const timeEntries: TimeEntry[] = [
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
        task: 1,
        bankFrom: 0,
        bankTo: 0,
      }
    ]
    render(<EditDayEntry {...baseProps} timeEntries={timeEntries}/>);
    expect(screen.queryByText('Delete')).toBeNull();
  })
  it("delete only leaves/rests when clicked on delete button", () => {
    const timeEntries: TimeEntry[] = [
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
        task: 1,
        bankFrom: 0,
        bankTo: 0,
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
        task: 1,
        bankFrom: 0,
        bankTo: 0,
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
        task: 1,
        bankFrom: 0,
        bankTo: 0,
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
        task: 1,
        bankFrom: 0,
        bankTo: 0,
      }
    ]
    render(<EditDayEntry {...baseProps} timeEntries={timeEntries}/>);
    screen.getByText('Delete').click()
    expect(mutateDeleteMock).toHaveBeenCalledWith([1, 2, 4]);
  })
  it.each([
    'dayShiftHours', 'holidayHours', 'leaveHours', 'specialLeaveHours', 'travelHours',
      'restHours', 'nightShiftHours', 'onCallHours', 'sickHours'
  ])("clear button deletes all TimeEntries for selected days", (entryType) => {
    const props = {
      startDate: new Date("2024-06-10"),
      endDate: new Date("2024-06-20"),
      timeEntries: [],
      onClose: vi.fn(),
      readOnly: false,
      selectedResourceId: 1,
      calendarDays: {},
      schedule: {}
    };
    const timeEntries: TimeEntry[] = []
    for (let i = 0; i < 10; i++) {
      timeEntries.push(
          {
            date: `2024-06-1${i}`,
            id: i,
            dayShiftHours: 0,
            sickHours: 0,
            holidayHours: 0,
            leaveHours: 0,
            specialLeaveHours: 0,
            travelHours: 0,
            restHours: 0,
            nightShiftHours: 0,
            onCallHours: 0,
            task: 1,
            bankFrom: 0,
            bankTo: 0,
          });
      (timeEntries[i] as any)[entryType] = 8
    }
    render(<EditDayEntry {...props} timeEntries={timeEntries} />);
    screen.getByTestId('clear-button').click()
    expect(mutateDeleteMock).toHaveBeenCalledWith([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  })
  it("if none of selected days have schedule of 0 hours user should be able to log leave, rest, special leave, holiday, sick day" , () => {
    const schedule = {
      "2024_06_01": 5,
      "2024_06_02": 5,
      "2024_06_03": 8,
    }
    render(<EditDayEntry {...baseProps} schedule={schedule}/>);
    expect(screen.getByTestId("get-from-bank-hour-input")).toBeEnabled()
    fireEvent.click(screen.getByTestId("day-entry-leave-radio"))
    expect(screen.getByTestId("day-entry-leave-input")).toBeChecked()
    fireEvent.click(screen.getByTestId("day-entry-rest-radio"))
    expect(screen.getByTestId("day-entry-rest-input")).toBeChecked()
    fireEvent.click(screen.getByTestId("day-entry-holiday-radio"))
    expect(screen.getByTestId("day-entry-holiday-input")).toBeChecked()
    fireEvent.click(screen.getByTestId("day-entry-sick-radio"))
    expect(screen.getByTestId("day-entry-sick-input")).toBeChecked()
  })

  it("if one of selected days have schedule of 0 hours user shouldn't be able to log leave, rest, special leave, holiday, sick day" , () => {
    const schedule = {
      "2024_06_01": 5,
      "2024_06_02": 0,
      "2024_06_03": 8,
    }
    render(<EditDayEntry {...baseProps} schedule={schedule}/>);
    expect(screen.getByTestId("get-from-bank-hour-input")).toBeDisabled()
    fireEvent.click(screen.getByTestId("day-entry-leave-radio"))
    expect(screen.getByTestId("day-entry-leave-input")).not.toBeChecked()
    fireEvent.click(screen.getByTestId("day-entry-rest-radio"))
    expect(screen.getByTestId("day-entry-rest-input")).not.toBeChecked()
    fireEvent.click(screen.getByTestId("day-entry-holiday-radio"))
    expect(screen.getByTestId("day-entry-holiday-input")).not.toBeChecked()
    fireEvent.click(screen.getByTestId("day-entry-sick-radio"))
    expect(screen.getByTestId("day-entry-sick-input")).not.toBeChecked()
  })
}); 