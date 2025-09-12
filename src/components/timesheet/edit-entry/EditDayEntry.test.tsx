import { render, screen, fireEvent } from "@testing-library/react";
import EditDayEntry from "./EditDayEntry";
import { vi } from "vitest";
import {TimeEntry} from "../../../restapi/types.ts";
import EditTimeEntry from "./EditTimeEntry.tsx";
import {getLastDayOfMonth} from "../utils/dates.ts";

const mutateDeleteMock = vi.fn().mockResolvedValue(undefined);

const calendarDays = () => ({
    "2024-06-01": { closed: false, hol: false, nwd: false },
    "2024-06-02": { closed: false, hol: false, nwd: false },
    "2024-06-03": { closed: false, hol: false, nwd: false },
    "2024-06-10": { closed: false, hol: false, nwd: false },
});

const submitMock = vi.fn().mockResolvedValue({})
vi.mock("../../../hooks/useTimesheet", () => ({
  useCreateTimeEntry: () => ({
    mutateAsync: submitMock,
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
    readOnlyByRole: false,
    selectedResourceId: 1,
    calendarDays: calendarDays(),
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
      readOnlyByRole: false,
      selectedResourceId: 1,
      calendarDays: calendarDays(),
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
    fireEvent.click(screen.getByTestId("day-entry-leave-div"))
    expect(screen.getByTestId("day-entry-leave-radio")).toBeChecked()
    fireEvent.click(screen.getByTestId("day-entry-rest-div"))
    expect(screen.getByTestId("day-entry-rest-radio")).toBeChecked()
    fireEvent.click(screen.getByTestId("day-entry-holiday-div"))
    expect(screen.getByTestId("day-entry-holiday-radio")).toBeChecked()
    fireEvent.click(screen.getByTestId("day-entry-sick-div"))
    expect(screen.getByTestId("day-entry-sick-radio")).toBeChecked()
    fireEvent.click(screen.getByTestId("day-entry-leave-div"))
    expect(screen.getByTestId("day-entry-leave-radio")).toBeChecked()
    fireEvent.click(screen.getByTestId("day-entry-rest-div"))
    expect(screen.getByText("Rest Hours *")).toBeInTheDocument()
    fireEvent.click(screen.getByTestId("day-entry-holiday-div"))
    expect(screen.getByTestId("day-entry-holiday-div").className).toContain("bg-yellow-100")
    fireEvent.click(screen.getByTestId("day-entry-sick-div"))
    expect(screen.getByTestId("day-entry-sick-div").className).toContain("bg-yellow-100")
  })

  it("if one of selected days have schedule of 0 hours user shouldn't be able to log leave, rest, special leave, holiday, sick day" , () => {
    const schedule = {
      "2024_06_01": 5,
      "2024_06_02": 0,
      "2024_06_03": 8,
    }
    render(<EditDayEntry {...baseProps} schedule={schedule}/>);
    expect(screen.getByTestId("get-from-bank-hour-input")).toBeDisabled()
    fireEvent.click(screen.getByTestId("day-entry-leave-div"))
    expect(screen.getByTestId("day-entry-leave-radio")).not.toBeChecked()
    fireEvent.click(screen.getByTestId("day-entry-rest-div"))
    expect(screen.getByTestId("day-entry-rest-radio")).not.toBeChecked()
    fireEvent.click(screen.getByTestId("day-entry-holiday-div"))
    expect(screen.getByTestId("day-entry-holiday-radio")).not.toBeChecked()
    fireEvent.click(screen.getByTestId("day-entry-sick-div"))
    expect(screen.getByTestId("day-entry-sick-radio")).not.toBeChecked()
    fireEvent.click(screen.getByTestId("day-entry-leave-div"))
    expect(screen.getByTestId("day-entry-leave-radio")).not.toBeChecked()
    fireEvent.click(screen.getByTestId("day-entry-rest-div"))
    expect(screen.queryByText("Rest Hours *")).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId("day-entry-holiday-div"))
    expect(screen.getByTestId("day-entry-holiday-div").className).toContain("cursor-not-allowed")
    fireEvent.click(screen.getByTestId("day-entry-sick-div"))
    expect(screen.getByTestId("day-entry-sick-div").className).toContain("cursor-not-allowed")
  })
  it("handle data change and submit", () => {
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
        task: null,
        bankFrom: 0,
        bankTo: 0,
      },
      {
        date: '2024-06-02',
        id: 2,
        dayShiftHours: 0,
        sickHours: 0,
        holidayHours: 0,
        leaveHours: 0,
        specialLeaveHours: 0,
        travelHours: 0,
        restHours: 1,
        nightShiftHours: 0,
        onCallHours: 0,
        task: null,
        bankFrom: 0,
        bankTo: 0,
      },
      {
        date: '2024-06-03',
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
        date: '2024-06-04',
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
        task: null,
        bankFrom: 0,
        bankTo: 0,
      }
    ]
    const schedule = {
      "2024_06_01": 2,
      "2024_06_02": 2,
      "2024_06_03": 2,
      "2024_06_04": 2,
    }
    const calendarDaysExtended = {
      ...calendarDays(),
      "2024-06-04": { closed: false, hol: false, nwd: false },
    }
    const props = {
      ...baseProps,
      startDate: new Date("2024-06-02"),
      endDate: new Date("2024-06-04"),
      timeEntries: timeEntries,
      schedule: schedule,
      calendarDays: calendarDaysExtended
    }
    render(<EditDayEntry {...props}/>);
    const submitButton = document.getElementById("day-entry-submit-button") as HTMLButtonElement
    fireEvent.submit(submitButton.form as HTMLFormElement)
    expect(submitMock).toBeCalledWith(
        expect.objectContaining({
          dates: [
              "2024-06-02",
              "2024-06-03",
              "2024-06-04",
          ],
          restHours: 1
        })
    )
  })
  const cases = [
    {
      date: '2024-06-01',
      id: 1,
      dayShiftHours: 0,
      sickHours: 0,
      holidayHours: 0,
      leaveHours: 1,
      specialLeaveHours: 0,
      travelHours: 0,
      restHours: 0,
      nightShiftHours: 0,
      onCallHours: 0,
      task: null,
      bankFrom: 0,
      bankTo: 0,
    },
    {
      date: '2024-06-01',
      id: 1,
      dayShiftHours: 0,
      sickHours: 0,
      holidayHours: 0,
      leaveHours: 0,
      specialLeaveHours: 1,
      travelHours: 0,
      restHours: 0,
      nightShiftHours: 0,
      onCallHours: 0,
      task: null,
      bankFrom: 0,
      bankTo: 0,
    },
    {
      date: '2024-06-01',
      id: 1,
      dayShiftHours: 0,
      sickHours: 0,
      holidayHours: 2,
      leaveHours: 0,
      specialLeaveHours: 0,
      travelHours: 0,
      restHours: 0,
      nightShiftHours: 0,
      onCallHours: 0,
      task: null,
      bankFrom: 0,
      bankTo: 0,
    },
    {
      date: '2024-06-01',
      id: 1,
      dayShiftHours: 0,
      sickHours: 2,
      holidayHours: 0,
      leaveHours: 0,
      specialLeaveHours: 0,
      travelHours: 0,
      restHours: 0,
      nightShiftHours: 0,
      onCallHours: 0,
      task: null,
      bankFrom: 0,
      bankTo: 0,
      comment: "some sick day"
    },
    {
      date: '2024-06-01',
      id: 1,
      dayShiftHours: 0,
      sickHours: 0,
      holidayHours: 0,
      leaveHours: 0,
      specialLeaveHours: 0,
      travelHours: 0,
      restHours: 0,
      nightShiftHours: 0,
      onCallHours: 0,
      task: null,
      bankFrom: 1,
      bankTo: 0,
    },
    {
      date: '2024-06-01',
      id: 1,
      dayShiftHours: 0,
      sickHours: 0,
      holidayHours: 0,
      leaveHours: 0,
      specialLeaveHours: 0,
      travelHours: 0,
      restHours: 0,
      nightShiftHours: 0,
      onCallHours: 0,
      task: null,
      bankFrom: 0,
      bankTo: 1,
    }
  ]
  cases.forEach((timeEntry) => {
    it(`submit should be called with start entry params`, () => {
      const schedule = {
        "2024_06_01": 2,
        "2024_06_02": 2,
        "2024_06_03": 2,
        "2024_06_04": 2,
      }
      const timeEntries: TimeEntry[] = [
        {
          date: '2024-06-03',
          id: 1,
          dayShiftHours: 0.5,
          sickHours: 0.5,
          holidayHours: 0.5,
          leaveHours: 0.5,
          specialLeaveHours: 0.5,
          travelHours: 0.5,
          restHours: 0.5,
          nightShiftHours: 0.5,
          onCallHours: 0.5,
          task: null,
          bankFrom: 0,
          bankTo: 0,
        },
        timeEntry
      ]
      render(<EditDayEntry {...baseProps} timeEntries={timeEntries} schedule={schedule}/>);
      const submitButton = document.getElementById("day-entry-submit-button") as HTMLButtonElement
      fireEvent.submit(submitButton.form as HTMLFormElement)
      expect(submitMock).toBeCalledWith(
          expect.objectContaining({
            ...(timeEntry.sickHours > 0 ? { sickHours: timeEntry.sickHours } : {}),
            ...(timeEntry.holidayHours > 0 ? { holidayHours: timeEntry.holidayHours } : {}),
            ...(timeEntry.leaveHours > 0 ? { leaveHours: timeEntry.leaveHours } : {}),
            ...(timeEntry.specialLeaveHours > 0 ? { specialLeaveHours: timeEntry.specialLeaveHours } : {}),
            ...(timeEntry.restHours > 0 ? { restHours: timeEntry.restHours } : {}),
            ...(timeEntry.bankFrom > 0 ? { bankFrom: timeEntry.bankFrom } : {}),
            ...(timeEntry.bankTo > 0 ? { bankTo: timeEntry.bankTo } : {}),
          })
      )
    });
  });
  it("handle hours change", () => {
    const schedule = {
      "2024_06_01": 2,
      "2024_06_02": 2,
      "2024_06_03": 2,
      "2024_06_04": 2,
    }
    render(<EditDayEntry {...baseProps} schedule={schedule}/>);
    fireEvent.click(screen.getByTestId("day-entry-leave-radio"))
    fireEvent.change(screen.getByTestId("day-entry-leave-hour-input"), {target: {value : 2}})
    expect(screen.getByTestId("day-entry-leave-hour-input")).toHaveValue(2)
    fireEvent.change(screen.getByTestId("day-entry-special-leave-hour-input"), {target: {value : 1}})
    expect(screen.getByTestId("day-entry-special-leave-hour-input")).toHaveValue(1)
  })
  it("renders leave, rest, specialLeave error", () => {
    const schedule = {
      "2024_06_01": 4,
      "2024_06_02": 2,
      "2024_06_03": 4,
    }
    render(<EditDayEntry {...baseProps} schedule={schedule}/>);
    fireEvent.click(screen.getByTestId("day-entry-leave-div"))
    fireEvent.change(screen.getByTestId("day-entry-leave-hour-input"), { target: { value: "1" }})
    fireEvent.change(screen.getByTestId("day-entry-special-leave-hour-input"), { target: { value: "1" }})

    fireEvent.click(screen.getByTestId("day-entry-rest-div"))
    fireEvent.change(screen.getByTestId("day-entry-rest-hour-input"), { target: { value: "1" }})
    expect(screen.getByText("No overtime allowed when logging leave, special leave or rest hours. Maximum allowed for 2024-06-02 is 2 hours, Total hours: 3")).
    toBeInTheDocument()

    fireEvent.change(document.getElementById("day-entry-from-date-picker") as HTMLElement, { target: { value: "2024-06-03" }})
    expect(screen.queryByText(
        "No overtime allowed when logging leave, special leave or rest hours. Maximum allowed for 2024-06-02 is 2 hours, Total hours: 3")).
    not.toBeInTheDocument()

    fireEvent.change(document.getElementById("day-entry-from-date-picker") as HTMLElement, { target: { value: "2024-06-01" }})
    expect(screen.getByText(
        "No overtime allowed when logging leave, special leave or rest hours. Maximum allowed for 2024-06-02 is 2 hours, Total hours: 3")).
    toBeInTheDocument()

    fireEvent.change(document.getElementById("day-entry-to-date-picker") as HTMLElement, { target: { value: "2024-06-01" }})
    expect(screen.queryByText(
        "No overtime allowed when logging leave, special leave or rest hours. Maximum allowed for 2024-06-02 is 2 hours, Total hours: 3")).
    not.toBeInTheDocument()
  })

  it("cannot change entry type in read only mode", () => {
    const schedule = {
      "2024_06_01": 2,
      "2024_06_02": 2,
      "2024_06_03": 2,
      "2024_06_04": 2,
    }
    const calendarDaysClosed = {
      "2024-06-01": { closed: true, hol: false, nwd: false },
      "2024-06-02": { closed: true, hol: false, nwd: false },
      "2024-06-03": { closed: true, hol: false, nwd: false },
      "2024-06-10": { closed: true, hol: false, nwd: false },
    };
    render(<EditDayEntry {...baseProps} schedule={schedule} calendarDays={calendarDaysClosed}/>);
    fireEvent.click(screen.getByTestId("day-entry-leave-div"))
    // In readonly mode (when calendar days are closed), the entry type doesn't change, so input is not shown
    expect(screen.queryByTestId("day-entry-leave-hour-input")).not.toBeInTheDocument()
  })
  it("Adding leave when overhours are logged should display error", () => {
    const schedule = {
      "2024_06_01": 2,
      "2024_06_02": 2,
      "2024_06_03": 2,
      "2024_06_04": 2,
    }
    const timeEntries: TimeEntry[] = [
      {
        date: '2024-06-01',
        id: 1,
        dayShiftHours: 3,
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
    render(<EditDayEntry {...baseProps} schedule={schedule} timeEntries={timeEntries}/>);
    fireEvent.click(screen.getByTestId("day-entry-leave-div"))
    fireEvent.change(screen.getByTestId("day-entry-leave-hour-input"), {target: {value : 2}})
    expect(screen.getByText(/No overtime allowed when logging leave, special leave or rest hours.*Maximum allowed for 2024-06-01.*is 2 hours.*Total hours.*5/, {exact: false})).toBeInTheDocument()
  })

});