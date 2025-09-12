import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EditTimeEntry from "./EditTimeEntry";
import { vi } from "vitest";

const mutateAsyncMock = vi.fn().mockResolvedValue(undefined);
const deleteAsyncMock = vi.fn().mockResolvedValue(undefined);

vi.mock("../../../hooks/useTimesheet", () => ({
  useCreateTimeEntry: () => ({
    mutateAsync: mutateAsyncMock,
    isLoading: false,
    isError: false,
    error: null,
  }),
  useDeleteTimeEntries: () => ({
    mutateAsync: deleteAsyncMock,
    isLoading: false,
    error: null,
  }),
}));
vi.mock("react-tooltip", () => ({
  Tooltip: () => <div data-testid="tooltip" />,
}));

describe("EditTimeEntry", () => {
  const baseProps = {
    task: { id: 1, title: "Task 1", startDate: new Date("2024-06-01") },
    timeEntries: [],
    startDate: new Date("2024-06-01"),
    endDate: new Date("2024-06-02"),
    closeModal: vi.fn(),
    readOnly: false,
    selectedResourceId: 1,
    holidayOrSickDays: [],
    noWorkingDays: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form and hours inputs", () => {
    render(<EditTimeEntry {...baseProps} />);
    expect(screen.getByText(/date range/i)).toBeInTheDocument();
  });

  it("calls closeModal when Cancel is clicked", () => {
    render(<EditTimeEntry {...baseProps} />);
    fireEvent.click(screen.getByText(/cancel/i));
    expect(baseProps.closeModal).toHaveBeenCalled();
  });

  it("initializes with existing time entry values", () => {
    const existingEntry = {
      id: 1,
      date: "2024-06-01",
      task: 1,
      dayShiftHours: 4,
      nightShiftHours: 2,
      travelHours: 1,
      onCallHours: 1,
      comment: "Test comment",
    };
    render(<EditTimeEntry {...baseProps} timeEntries={[existingEntry]} />);

    const dayInput = document.getElementById("daytime-input") as HTMLInputElement;
    const nightInput = document.getElementById("nightime-input") as HTMLInputElement;
    const travelInput = document.getElementById("travelHours-input") as HTMLInputElement;
    const onCallInput = document.getElementById("oncall-input") as HTMLInputElement;
    const commentInput = document.getElementById("comment-textarea") as HTMLTextAreaElement;

    expect(dayInput.value).toBe("4");
    expect(nightInput.value).toBe("2");
    expect(travelInput.value).toBe("1");
    expect(onCallInput.value).toBe("1");
    expect(commentInput.value).toBe("Test comment");
  });

  it("updates dayShiftHours when input changes", () => {
    render(<EditTimeEntry {...baseProps} />);
    const dayInput = document.getElementById("daytime-input") as HTMLInputElement;

    fireEvent.change(dayInput, { target: { value: "8" } });
    expect(dayInput.value).toBe("8");
  });

  it("updates nightShiftHours when input changes", () => {
    render(<EditTimeEntry {...baseProps} />);
    const nightInput = document.getElementById("nightime-input") as HTMLInputElement;

    fireEvent.change(nightInput, { target: { value: "4" } });
    expect(nightInput.value).toBe("4");
  });

  it("updates travelHours when input changes", () => {
    render(<EditTimeEntry {...baseProps} />);
    const travelInput = document.getElementById("travelHours-input") as HTMLInputElement;

    fireEvent.change(travelInput, { target: { value: "2" } });
    expect(travelInput.value).toBe("2");
  });

  it("updates onCallHours when input changes", () => {
    render(<EditTimeEntry {...baseProps} />);
    const onCallInput = document.getElementById("oncall-input") as HTMLInputElement;

    fireEvent.change(onCallInput, { target: { value: "3" } });
    expect(onCallInput.value).toBe("3");
  });

  it("updates comment when textarea changes", () => {
    render(<EditTimeEntry {...baseProps} />);
    const commentInput = document.getElementById("comment-textarea") as HTMLTextAreaElement;

    fireEvent.change(commentInput, { target: { value: "New comment" } });
    expect(commentInput.value).toBe("New comment");
  });

  it("shows error message when total hours exceed 24", () => {
    render(<EditTimeEntry {...baseProps} />);
    const dayInput = document.getElementById("daytime-input") as HTMLInputElement;

    fireEvent.change(dayInput, { target: { value: "25" } });
    expect(screen.getByText(/total hours cannot exceed 24 hours/i)).toBeInTheDocument();
  });

  it("disables save button when total hours exceed 24", () => {
    render(<EditTimeEntry {...baseProps} />);
    const dayInput = document.getElementById("daytime-input") as HTMLInputElement;
    const saveButton = screen.getByText(/save/i);

    fireEvent.change(dayInput, { target: { value: "25" } });
    expect(saveButton).toBeDisabled();
  });

  it("disables save button when total hours is 0", () => {
    render(<EditTimeEntry {...baseProps} />);
    const saveButton = screen.getByText(/save/i);

    expect(saveButton).toBeDisabled();
  });

  it("calls createTimeEntries on form submit with correct data", async () => {
    render(<EditTimeEntry {...baseProps} />);
    const dayInput = document.getElementById("daytime-input") as HTMLInputElement;
    const saveButton = screen.getByText(/save/i);

    fireEvent.change(dayInput, { target: { value: "8" } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith(
        expect.objectContaining({
          taskId: 1,
          dayShiftHours: 8,
          nightShiftHours: 0,
          travelHours: 0,
          onCallHours: 0,
        })
      );
    });
  });

  it("calls deleteTimeEntries when delete button is clicked", async () => {
    const timeEntries = [
      { id: 1, date: "2024-06-01", task: 1, dayShiftHours: 8 },
      { id: 2, date: "2024-06-02", task: 1, dayShiftHours: 8 },
    ];
    render(<EditTimeEntry {...baseProps} timeEntries={timeEntries} />);
    const deleteButton = screen.getByText(/delete/i);

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(deleteAsyncMock).toHaveBeenCalledWith([1, 2]);
    });
  });

  it("handles date change for fromDate", () => {
    render(<EditTimeEntry {...baseProps} />);
    expect(screen.getByText(/from date/i)).toBeInTheDocument();
  });

  it("handles date change for toDate", () => {
    render(<EditTimeEntry {...baseProps} />);
    expect(screen.getByText(/to date/i)).toBeInTheDocument();
  });

  it("filters out holiday/sick days from dates to save", async () => {
    const holidayOrSickDays = ["2024-06-01"];
    render(<EditTimeEntry {...baseProps} holidayOrSickDays={holidayOrSickDays} />);
    const dayInput = document.getElementById("daytime-input") as HTMLInputElement;
    const saveButton = screen.getByText(/save/i);

    fireEvent.change(dayInput, { target: { value: "8" } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalled();
      const callArgs = mutateAsyncMock.mock.calls[0][0];
      expect(callArgs.dates).not.toContain("2024-06-01");
    });
  });

  it("filters out dates before task start date", async () => {
    const task = { id: 1, title: "Task 1", startDate: new Date("2024-06-05") };
    render(<EditTimeEntry {...baseProps} task={task} />);
    const dayInput = document.getElementById("daytime-input") as HTMLInputElement;

    fireEvent.change(dayInput, { target: { value: "8" } });
    expect(screen.getByText(/save/i)).toBeInTheDocument();
  });

  it("filters out dates after task end date", async () => {
    const task = {
      id: 1,
      title: "Task 1",
      startDate: new Date("2024-05-01"),
      endDate: new Date("2024-05-31")
    };
    render(<EditTimeEntry {...baseProps} task={task} />);
    const dayInput = document.getElementById("daytime-input") as HTMLInputElement;

    fireEvent.change(dayInput, { target: { value: "8" } });
    expect(screen.getByText(/save/i)).toBeInTheDocument();
  });

  it("disables all inputs when readOnly is true", () => {
    render(<EditTimeEntry {...baseProps} readOnly={true} />);

    const dayInput = document.getElementById("daytime-input") as HTMLInputElement;
    const nightInput = document.getElementById("nightime-input") as HTMLInputElement;
    const travelInput = document.getElementById("travelHours-input") as HTMLInputElement;
    const onCallInput = document.getElementById("oncall-input") as HTMLInputElement;
    const commentInput = document.getElementById("comment-textarea") as HTMLTextAreaElement;

    expect(dayInput).toBeDisabled();
    expect(nightInput).toBeDisabled();
    expect(travelInput).toBeDisabled();
    expect(onCallInput).toBeDisabled();
    expect(commentInput).toBeDisabled();
    expect(screen.getByText(/save/i)).toBeDisabled();
  });

  it("disables delete button when no time entries exist", () => {
    render(<EditTimeEntry {...baseProps} />);
    const deleteButton = screen.getByText(/delete/i);

    expect(deleteButton).toBeDisabled();
  });

  it("shows warning for existing entries", () => {
    const timeEntries = [
      { id: 1, date: "2024-06-01", task: 1, dayShiftHours: 8 },
    ];
    render(<EditTimeEntry {...baseProps} timeEntries={timeEntries} />);

    expect(screen.getByText(/holiday, sick days and n\/a entries will be skipped/i)).toBeInTheDocument();
  });

  it("handles inverted date range (endDate < startDate)", () => {
    render(<EditTimeEntry
      {...baseProps}
      startDate={new Date("2024-06-10")}
      endDate={new Date("2024-06-01")}
    />);

    expect(screen.getByText(/date range/i)).toBeInTheDocument();
  });

  it("initializes with 0 hours when no existing entry", () => {
    render(<EditTimeEntry {...baseProps} />);

    const dayInput = document.getElementById("daytime-input") as HTMLInputElement;
    const nightInput = document.getElementById("nightime-input") as HTMLInputElement;
    const travelInput = document.getElementById("travelHours-input") as HTMLInputElement;
    const onCallInput = document.getElementById("oncall-input") as HTMLInputElement;

    expect(dayInput.value).toBe("");
    expect(nightInput.value).toBe("");
    expect(travelInput.value).toBe("");
    expect(onCallInput.value).toBe("");
  });
});
