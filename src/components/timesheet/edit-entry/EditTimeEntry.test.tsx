import { render, screen, fireEvent } from "@testing-library/react";
import EditTimeEntry from "./EditTimeEntry";
import { vi } from "vitest";
import {normalizeDate} from "../utils/dates.ts";
import {TotalHourCell} from "../timesheet-headers/TotalHour.tsx";

vi.mock("../../../hooks/useTimesheet", () => ({
  useCreateTimeEntry: () => ({
    mutateAsync: vi.fn(),
    isLoading: false,
    isError: false,
    error: null,
  }),
  useDeleteTimeEntries: () => ({
    mutateAsync: vi.fn(),
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
  it("renders form and hours inputs", () => {
    render(<EditTimeEntry {...baseProps} />);
    expect(screen.getByText(/date range/i)).toBeInTheDocument();
  });
  it("calls closeModal when Cancel is clicked", () => {
    render(<EditTimeEntry {...baseProps} />);
    fireEvent.click(screen.getByText(/cancel/i));
    expect(baseProps.closeModal).toHaveBeenCalled();
  });

}); 