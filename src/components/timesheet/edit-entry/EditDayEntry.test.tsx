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
    dueHours: 8,
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

  it("disables Save when no values have changed", () => {
    render(
      <EditDayEntry {...baseProps} dayEntries={[makeDayEntry()]} endDate={baseProps.startDate} />
    );

    expect(screen.getByTestId("day-entry-submit-button")).toBeDisabled();
    expect(saveDays).not.toHaveBeenCalled();
  });

  it("saves a comment without requiring another day-entry value", async () => {
    render(
      <EditDayEntry {...baseProps} dayEntries={[makeDayEntry()]} endDate={baseProps.startDate} />
    );

    fireEvent.change(screen.getByLabelText(/comments/i), {
      target: { value: "Updated comment" },
    });
    fireEvent.click(screen.getByTestId("day-entry-submit-button"));

    await waitFor(() =>
      expect(saveDays).toHaveBeenCalledWith(
        expect.objectContaining({
          dates: ["2024-06-01"],
          comment: "Updated comment",
        })
      )
    );
  });

  it("clears an existing comment", async () => {
    render(
      <EditDayEntry
        {...baseProps}
        dayEntries={[makeDayEntry({ comment: "Existing comment" })]}
        endDate={baseProps.startDate}
      />
    );

    fireEvent.change(screen.getByLabelText(/comments/i), { target: { value: "" } });
    fireEvent.click(screen.getByTestId("day-entry-submit-button"));

    await waitFor(() =>
      expect(saveDays).toHaveBeenCalledWith(
        expect.objectContaining({ dates: ["2024-06-01"], comment: "" })
      )
    );
  });

  it("saves zero when removing bank hours from an existing day entry", async () => {
    render(
      <EditDayEntry
        {...baseProps}
        dayEntries={[makeDayEntry({ bank: 3 })]}
        endDate={baseProps.startDate}
      />
    );

    fireEvent.change(screen.getByTestId("save-bank-hour-input"), {
      target: { value: "0" },
    });
    fireEvent.click(screen.getByTestId("day-entry-submit-button"));

    await waitFor(() =>
      expect(saveDays).toHaveBeenCalledWith(
        expect.objectContaining({ dates: ["2024-06-01"], bank: 0 })
      )
    );
  });

  it("rejects a bank withdrawal above the hours available after task work", () => {
    const existingDayEntry = makeDayEntry();
    const taskEntry = {
      id: 2,
      task: 1,
      dayEntry: existingDayEntry.id,
      dayShiftHours: 8,
      nightShiftHours: 0,
      travelHours: 0,
      onCallHours: 0,
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
    fireEvent.change(screen.getByTestId("get-from-bank-hour-input"), {
      target: { value: "1" },
    });

    expect(screen.getByText(/bank withdrawal hours/i)).toBeInTheDocument();
    expect(screen.getByTestId("day-entry-submit-button")).toBeDisabled();
    expect(saveDays).not.toHaveBeenCalled();
  });

  it("accepts a bank withdrawal equal to the available hours", async () => {
    const existingDayEntry = makeDayEntry();
    const taskEntry = {
      id: 2,
      task: 1,
      dayEntry: existingDayEntry.id,
      dayShiftHours: 4,
      nightShiftHours: 0,
      travelHours: 0,
      onCallHours: 0,
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
    fireEvent.change(screen.getByTestId("get-from-bank-hour-input"), {
      target: { value: "4" },
    });
    fireEvent.click(screen.getByTestId("day-entry-submit-button"));

    await waitFor(() =>
      expect(saveDays).toHaveBeenCalledWith(expect.objectContaining({ bank: -4 }))
    );
  });

  it("rejects a bank deposit that leaves effective hours below scheduled hours", () => {
    const existingDayEntry = makeDayEntry();
    const taskEntry = {
      id: 2,
      task: 1,
      dayEntry: existingDayEntry.id,
      dayShiftHours: 8,
      nightShiftHours: 0,
      travelHours: 0,
      onCallHours: 0,
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
    fireEvent.change(screen.getByTestId("save-bank-hour-input"), {
      target: { value: "1" },
    });

    expect(screen.getByText(/cannot deposit 1 bank hours/i)).toBeInTheDocument();
    expect(screen.getByTestId("day-entry-submit-button")).toBeDisabled();
    expect(saveDays).not.toHaveBeenCalled();
  });

  it("accepts a bank deposit that leaves exactly the scheduled hours", async () => {
    const existingDayEntry = makeDayEntry();
    const taskEntry = {
      id: 2,
      task: 1,
      dayEntry: existingDayEntry.id,
      dayShiftHours: 9,
      nightShiftHours: 0,
      travelHours: 0,
      onCallHours: 0,
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
    fireEvent.change(screen.getByTestId("save-bank-hour-input"), {
      target: { value: "1" },
    });
    fireEvent.click(screen.getByTestId("day-entry-submit-button"));

    await waitFor(() =>
      expect(saveDays).toHaveBeenCalledWith(expect.objectContaining({ bank: 1 }))
    );
    expect(screen.queryByText(/bank withdrawal hours/i)).not.toBeInTheDocument();
  });

  it("accepts a bank deposit that leaves overtime hours", async () => {
    const existingDayEntry = makeDayEntry();
    const taskEntry = {
      id: 2,
      task: 1,
      dayEntry: existingDayEntry.id,
      dayShiftHours: 11,
      nightShiftHours: 0,
      travelHours: 0,
      onCallHours: 0,
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
    fireEvent.change(screen.getByTestId("save-bank-hour-input"), {
      target: { value: "2" },
    });
    fireEvent.click(screen.getByTestId("day-entry-submit-button"));

    await waitFor(() =>
      expect(saveDays).toHaveBeenCalledWith(expect.objectContaining({ bank: 2 }))
    );
    expect(screen.queryByText(/bank withdrawal hours/i)).not.toBeInTheDocument();
  });

  it.each([
    ["holiday", "day-entry-holiday-div"],
    ["sick", "day-entry-sick-div"],
  ])("rejects bank deposits when selecting %s", (_entryType, entryTypeTestId) => {
    const existingDayEntry = makeDayEntry();
    const taskEntry = {
      id: 2,
      task: 1,
      dayEntry: existingDayEntry.id,
      dayShiftHours: 16,
      nightShiftHours: 0,
      travelHours: 0,
      onCallHours: 0,
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

    fireEvent.click(screen.getByTestId(entryTypeTestId));
    fireEvent.change(screen.getByTestId("save-bank-hour-input"), {
      target: { value: "8" },
    });

    expect(
      screen.getByText("Bank hours cannot be used during holidays or sick days.")
    ).toBeInTheDocument();
    expect(screen.getByTestId("day-entry-submit-button")).toBeDisabled();
    expect(saveDays).not.toHaveBeenCalled();
  });

  it.each([
    ["holiday", "day-entry-holiday-div"],
    ["sick", "day-entry-sick-div"],
  ])("rejects bank withdrawals when selecting %s", (_entryType, entryTypeTestId) => {
    render(
      <EditDayEntry {...baseProps} dayEntries={[makeDayEntry()]} endDate={baseProps.startDate} />
    );

    fireEvent.click(screen.getByTestId(entryTypeTestId));
    fireEvent.change(screen.getByTestId("get-from-bank-hour-input"), {
      target: { value: "4" },
    });

    expect(
      screen.getByText("Bank hours cannot be used during holidays or sick days.")
    ).toBeInTheDocument();
    expect(screen.getByTestId("day-entry-submit-button")).toBeDisabled();
    expect(saveDays).not.toHaveBeenCalled();
  });

  it.each([
    ["leave", "day-entry-leave-hour-input"],
    ["rest", "day-entry-rest-hour-input"],
    ["special leave", "day-entry-special-leave-hour-input"],
  ])("rejects bank deposits during %s", (_dayEntryType, hoursInputTestId) => {
    render(<EditDayEntry {...baseProps} endDate={baseProps.startDate} />);

    fireEvent.change(screen.getByTestId(hoursInputTestId), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByTestId("save-bank-hour-input"), {
      target: { value: "1" },
    });

    expect(
      screen.getByText("Bank hours cannot be deposited during leave, rest, or special leave.")
    ).toBeInTheDocument();
    expect(screen.getByTestId("day-entry-submit-button")).toBeDisabled();
    expect(saveDays).not.toHaveBeenCalled();
  });

  it("allows bank withdrawals during leave", async () => {
    render(<EditDayEntry {...baseProps} endDate={baseProps.startDate} />);

    fireEvent.change(screen.getByTestId("day-entry-leave-hour-input"), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByTestId("get-from-bank-hour-input"), {
      target: { value: "2" },
    });
    fireEvent.click(screen.getByTestId("day-entry-submit-button"));

    await waitFor(() =>
      expect(saveDays).toHaveBeenCalledWith(expect.objectContaining({ bank: -2, leaveHours: 2 }))
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

  it("rejects a protocol number containing non-digit characters", () => {
    render(<EditDayEntry {...baseProps} endDate={baseProps.startDate} />);

    fireEvent.click(screen.getByTestId("day-entry-sick-div"));
    const protocolNumberInput = screen.getByLabelText(/protocol number/i);
    fireEvent.change(protocolNumberInput, { target: { value: "124ABC" } });

    expect(protocolNumberInput).toHaveAttribute("type", "text");
    expect(protocolNumberInput).toHaveAttribute("inputmode", "numeric");
    expect(screen.getByText("Protocol number must contain digits only.")).toBeInTheDocument();
    expect(screen.getByTestId("day-entry-submit-button")).toBeDisabled();
    expect(saveDays).not.toHaveBeenCalled();
  });

  it("accepts a protocol number containing digits only", async () => {
    render(<EditDayEntry {...baseProps} endDate={baseProps.startDate} />);

    fireEvent.click(screen.getByTestId("day-entry-sick-div"));
    fireEvent.change(screen.getByLabelText(/protocol number/i), {
      target: { value: "00124" },
    });
    fireEvent.click(screen.getByTestId("day-entry-submit-button"));

    await waitFor(() =>
      expect(saveDays).toHaveBeenCalledWith(expect.objectContaining({ protocolNumber: "00124" }))
    );
    expect(screen.queryByText("Protocol number must contain digits only.")).not.toBeInTheDocument();
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
        expect.objectContaining({ specialLeaveHours: 2, specialLeaveReason: 1 })
      )
    );
  });

  it("clears the special leave reason when special leave hours are set to zero", async () => {
    render(
      <EditDayEntry
        {...baseProps}
        dayEntries={[makeDayEntry({ specialLeaveHours: 2, specialLeaveReason: 1 })]}
        endDate={baseProps.startDate}
      />
    );

    const reasonSelect = screen.getByRole("combobox", { name: "Reason" });
    expect(reasonSelect).toHaveValue("1");

    fireEvent.change(screen.getByTestId("day-entry-special-leave-hour-input"), {
      target: { value: "0" },
    });

    expect(reasonSelect).toHaveValue("");

    fireEvent.click(screen.getByTestId("day-entry-submit-button"));

    await waitFor(() =>
      expect(saveDays).toHaveBeenCalledWith(
        expect.objectContaining({
          specialLeaveHours: 0,
          specialLeaveReason: null,
        })
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

  it("clears a public holiday when it has task entries", async () => {
    const holidayEntry = makeDayEntry({ id: 3, day: "2024-06-01", isHoliday: true });
    const taskEntry = {
      id: 4,
      task: 1,
      dayEntry: holidayEntry.id,
      dayShiftHours: 8,
      nightShiftHours: 0,
      travelHours: 0,
      onCallHours: 0,
      comment: null,
      metadata: {},
    } as TaskEntry;

    render(
      <EditDayEntry
        {...baseProps}
        dayEntries={[holidayEntry]}
        taskEntries={[taskEntry]}
        endDate={baseProps.startDate}
      />
    );

    fireEvent.click(screen.getByTestId("clear-button"));
    await waitFor(() => expect(clearDays).toHaveBeenCalledWith([holidayEntry.id]));
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
