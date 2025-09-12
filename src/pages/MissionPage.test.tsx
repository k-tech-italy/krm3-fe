import { render, screen, fireEvent } from "@testing-library/react";
import { MissionPage } from "./MissionPage";
import { vi } from "vitest";
import { useGetMissions } from "../hooks/useMissions";
import { useGetExpense } from "../hooks/useExpense";
import { useGetCurrentUser } from "../hooks/useAuth";
import { useMediaQuery } from "../hooks/useView";
import { UseQueryResult } from "react-query";

// Mock the modules to return mock functions
vi.mock("../hooks/useMissions", () => ({
  useGetMissions: vi.fn(),
}));

vi.mock("../hooks/useExpense", () => ({
  useGetExpense: vi.fn(),
}));
vi.mock("../hooks/useAuth", () => ({
  useGetCurrentUser: vi.fn(),
}));
vi.mock("../hooks/useView", () => ({
  useMediaQuery: vi.fn()
}));
vi.mock("../components/commons/LoadSpinner", () => ({
  default: () => <div>Loading...</div>,
}));
vi.mock("../components/missions/filter", () => ({
  default: () => <div>FilterResource</div>,
}));

vi.mock("../components/commons/Krm3Table", () => ({
  default: ({ data, columns, onClickRow }: any) => (
    <table>
      <tbody>
        {data.map((row: any, i: number) => (
          <tr key={i} onClick={() => onClickRow(row)} data-testid={`row-${i}`}>
            <td data-testid={`id-${i}`}>{row.id}</td>
            <td data-testid={`mission-title-${i}`}>{row.mission_title}</td>
            <td data-testid={`resource-${i}`}>{row.resource}</td>
            <td data-testid={`amount-${i}`}>{row.amountCurrency}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));
vi.mock("../components/expense/ExpenseFilter", () => ({
  default: () => <div>ExpenseFilter</div>,
}));
vi.mock("../components/expense/edit/ExpenseEdit", () => ({
  default: () => <div>ExpenseEditModal</div>,
}));
vi.mock("../components/missions/create/CreateMission", () => ({
  default: ({ show, onClose }: any) =>
    show ? (
      <div>
        MissionModal<button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

beforeAll(() => {
  Object.defineProperty(window, "location", {
    value: { ...window.location, replace: vi.fn() },
    writable: true,
  });
});

// Create mock references for all hooks
const mockUseGetMissions = vi.mocked(useGetMissions);
const mockUseGetExpense = vi.mocked(useGetExpense);
const mockUseGetCurrentUser = vi.mocked(useGetCurrentUser);
const mockUseMediaQuery = vi.mocked(useMediaQuery);

// Mock data
const mockMissionData = {
  results: [
    {
      id: 1,
      fromDate: "2023-01-01",
      toDate: "2023-01-05",
      title: "Test Mission",
      resource: { firstName: "John", lastName: "Doe" }
    }
  ]
};

const mockExpenseData = {
  results: [
    {
      id: 100,
      day: "2023-01-02",
      mission: 1,
      amountCurrency: "100 EUR"
    }
  ]
};

describe("MissionPage", () => {
  beforeEach(() => {
    // Set default mock return values
    mockUseGetMissions.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockMissionData,
    } as UseQueryResult<any>);

    mockUseGetExpense.mockReturnValue({
      data: mockExpenseData,
    } as UseQueryResult<any>);

    mockUseGetCurrentUser.mockReturnValue({
      data: { isStaff: true },
    } as UseQueryResult<any>);

    mockUseMediaQuery.mockReturnValue(false);
  });

  it("renders loading state", () => {
    mockUseGetMissions.mockReturnValueOnce({
      isLoading: true,
    } as UseQueryResult<any>);
    render(<MissionPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("renders error state", () => {
    mockUseGetMissions.mockReturnValueOnce({
      isLoading: false,
      isError: true,
    } as UseQueryResult<any>);
    render(<MissionPage />);
    expect(screen.getByText(/errore/i)).toBeInTheDocument();
  });

  it("renders tabs and switches tab", () => {
    render(<MissionPage />);
    fireEvent.click(screen.getByText(/spese/i));
    expect(screen.getByText(/expensefilter/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/trasferte/i));
    expect(screen.getByText(/filterresource/i)).toBeInTheDocument();
  });

  it("correctly maps mission title and resource for expenses", () => {
    render(<MissionPage />);
    fireEvent.click(screen.getByText(/spese/i));

    expect(screen.getByTestId("mission-title-0")).toHaveTextContent("Test Mission");
    expect(screen.getByTestId("resource-0")).toHaveTextContent("John");
  });

  it("handles expenses with non-existent mission IDs", () => {
    const expenseWithInvalidMission = {
      id: 999,
      day: "2023-01-03",
      mission: 9999,
      amountCurrency: "50 EUR"
    };

    mockUseGetExpense.mockReturnValue({
      data: { results: [expenseWithInvalidMission] },
    } as UseQueryResult<any>);

    render(<MissionPage />);
    fireEvent.click(screen.getByText(/spese/i));

    expect(screen.getByTestId("id-0")).toHaveTextContent("999");
    expect(screen.getByTestId("mission-title-0")).toHaveTextContent("");
    expect(screen.getByTestId("resource-0")).toHaveTextContent("");
    expect(screen.getByTestId("amount-0")).toHaveTextContent("50 EUR");
  });

});