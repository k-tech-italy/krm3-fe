import { render, screen, fireEvent } from "@testing-library/react";
import EditDayEntry from "./EditDayEntry";
import { vi } from "vitest";

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
    endDate: new Date("2024-06-02"),
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
}); 