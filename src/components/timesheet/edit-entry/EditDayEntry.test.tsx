import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DayEntry, TaskEntry } from "../../../restapi/types";
import EditDayEntry from "./EditDayEntry";

const saveDays = vi.fn().mockResolvedValue({});
const clearDays = vi.fn().mockResolvedValue({});
const deleteDay = vi.fn().mockResolvedValue({});

vi.mock("../../../hooks/useTimesheet", () => ({
  useSaveDayEntries: () => ({ mutateAsync: saveDays, isLoading: false, error: null }),
  useClearDayEntries: () => ({ mutateAsync: clearDays, isLoading: false, error: null }),
  useDeleteDayEntries: () => ({ mutateAsync: deleteDay, isLoading: false, error: null }),
  useGetSpecialReason: () => ({
    data: [{ id: 1, title: "Medical appointment" }],
    isLoading: false,
    error: null,
  }),
}));
vi.mock("react-tooltip", () => ({ Tooltip: () => <div /> }));

const calendarDays = {
  "2024-06-01": { closed: false, hol: false, nwd: false },
  "2024-06-02": { closed: false, hol: false, nwd: false },
  "2024-06-03": { closed: false, hol: false, nwd: false },
};
const makeDayEntry = (overrides: Partial<DayEntry> = {}): DayEntry =>
  ({
    id: 1,
    day: "2024-06-01",
    closed: false,
    isHoliday: false,
    askedHoliday: false,
    isSick: false,
    leaveHours: 0,
    specialLeaveHours: 0,
    restHours: 0,
    bank: 0,
    comment: null,
    protocolNumber: null,
    ...overrides,
  }) as DayEntry;
const baseProps = {
  startDate: new Date("2024-06-01"),
  endDate: new Date("2024-06-03"),
  dayEntries: [] as DayEntry[],
  taskEntries: [],
  onClose: vi.fn(),
  readOnlyByRole: false,
  selectedResourceId: 1,
  calendarDays,
  schedule: { "2024_06_01": 8, "2024_06_02": 8, "2024_06_03": 8 },
};

describe("EditDayEntry", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders day-entry controls", () => {
    render(<EditDayEntry {...baseProps} />);
    expect(screen.getByText(/entry type/i)).toBeInTheDocument();
    expect(screen.getByText(/holiday/i)).toBeInTheDocument();
    expect(screen.getByText(/sick day/i)).toBeInTheDocument();
  });

  it("creates day entries for the selected range", async () => {
    render(<EditDayEntry {...baseProps} />);
    fireEvent.click(screen.getByTestId("day-entry-holiday-div"));
    fireEvent.click(screen.getByTestId("day-entry-submit-button"));
    await waitFor(() => expect(saveDays).toHaveBeenCalledTimes(1));
    expect(saveDays).toHaveBeenCalledWith(
      expect.objectContaining({
        dates: ["2024-06-01", "2024-06-02", "2024-06-03"],
        askedHoliday: true,
      })
    );
  });

  it("updates an existing day entry", async () => {
    render(
      <EditDayEntry {...baseProps} dayEntries={[makeDayEntry()]} endDate={baseProps.startDate} />
    );
    fireEvent.click(screen.getByTestId("day-entry-holiday-div"));
    fireEvent.click(screen.getByTestId("day-entry-submit-button"));
    await waitFor(() =>
      expect(saveDays).toHaveBeenCalledWith(
        expect.objectContaining({ dates: ["2024-06-01"], askedHoliday: true })
      )
    );
  });

  it("clears the protocol number when changing a sick day to a holiday", async () => {
    render(
      <EditDayEntry
        {...baseProps}
        dayEntries={[makeDayEntry({ isSick: true, protocolNumber: "12345" })]}
        endDate={baseProps.startDate}
      />
    );
    fireEvent.click(screen.getByTestId("day-entry-holiday-div"));
    fireEvent.click(screen.getByTestId("day-entry-submit-button"));

    await waitFor(() =>
      expect(saveDays).toHaveBeenCalledWith(
        expect.objectContaining({ isSick: false, protocolNumber: null })
      )
    );
  });

  it("clears the special leave reason when changing special leave to a holiday", async () => {
    render(
      <EditDayEntry
        {...baseProps}
        dayEntries={[makeDayEntry({ specialLeaveHours: 2, specialLeaveReason: 1 })]}
        endDate={baseProps.startDate}
      />
    );
    fireEvent.click(screen.getByTestId("day-entry-holiday-div"));
    fireEvent.click(screen.getByTestId("day-entry-submit-button"));

    await waitFor(() =>
      expect(saveDays).toHaveBeenCalledWith(
        expect.objectContaining({ specialLeaveHours: 0, specialLeaveReason: null })
      )
    );
  });

  it("requires a reason when special leave hours are entered", () => {
    render(<EditDayEntry {...baseProps} endDate={baseProps.startDate} />);

    fireEvent.change(screen.getByTestId("day-entry-special-leave-hour-input"), {
      target: { value: "2" },
    });

    expect(screen.getByText("Please select a reason for the special leave.")).toBeInTheDocument();
    expect(screen.getByTestId("day-entry-submit-button")).toBeDisabled();
    expect(saveDays).not.toHaveBeenCalled();
  });

  it("allows special leave hours when a reason is selected", async () => {
    render(<EditDayEntry {...baseProps} endDate={baseProps.startDate} />);

    fireEvent.change(screen.getByTestId("day-entry-special-leave-hour-input"), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Reason" }), {
      target: { value: "1" },
    });
    fireEvent.click(screen.getByTestId("day-entry-submit-button"));

    await waitFor(() =>
      expect(saveDays).toHaveBeenCalledWith(
        expect.objectContaining({ specialLeaveHours: 2, specialLeaveReason: "1" })
      )
    );
  });

  it("does not reduce available leave hours when task entries contain on-call hours", async () => {
    const existingDayEntry = makeDayEntry();
    const taskEntry = {
      id: 2,
      task: 1,
      dayEntry: existingDayEntry.id,
      dayShiftHours: 0,
      nightShiftHours: 0,
      travelHours: 0,
      onCallHours: 8,
      comment: null,
      metadata: {},
    } as TaskEntry;

    render(
      <EditDayEntry
        {...baseProps}
        dayEntries={[existingDayEntry]}
        taskEntries={[taskEntry]}
        endDate={baseProps.startDate}
      />
    );
    fireEvent.change(screen.getByTestId("day-entry-leave-hour-input"), {
      target: { value: "8" },
    });
    fireEvent.click(screen.getByTestId("day-entry-submit-button"));

    await waitFor(() =>
      expect(saveDays).toHaveBeenCalledWith(expect.objectContaining({ leaveHours: 8 }))
    );
    expect(screen.queryByText(/No overtime allowed/i)).not.toBeInTheDocument();
  });

  it("deletes existing day entries", async () => {
    render(
      <EditDayEntry
        {...baseProps}
        dayEntries={[
          makeDayEntry({ id: 1, day: "2024-06-01", leaveHours: 2 }),
          makeDayEntry({ id: 2, day: "2024-06-02", bank: 1 }),
        ]}
      />
    );
    fireEvent.click(screen.getByTestId("clear-button"));
    await waitFor(() => expect(clearDays).toHaveBeenCalledWith([1, 2]));
  });

  it("clears non-task data in one request", async () => {
    render(
      <EditDayEntry
        {...baseProps}
        dayEntries={[
          makeDayEntry({ id: 1, day: "2024-06-01", leaveHours: 2 }),
          makeDayEntry({ id: 2, day: "2024-06-02", bank: 1 }),
        ]}
      />
    );
    fireEvent.click(screen.getByTestId("delete-button"));
    await waitFor(() => expect(deleteDay).toHaveBeenCalledWith([1, 2]));
    expect(clearDays).not.toHaveBeenCalled();
  });

  it("does not show Delete for task-only day entries", () => {
    render(<EditDayEntry {...baseProps} dayEntries={[makeDayEntry()]} />);
    expect(screen.queryByTestId("delete-button")).not.toBeInTheDocument();
  });

  it("uses the Day entries warning label", () => {
    render(<EditDayEntry {...baseProps} dayEntries={[makeDayEntry()]} />);
    expect(screen.getByText(/Day entries already exist/i)).toBeInTheDocument();
  });
});
