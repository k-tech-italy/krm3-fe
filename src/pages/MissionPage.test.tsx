import { render, screen, fireEvent } from "@testing-library/react";
import { MissionPage } from "./MissionPage";
import { vi } from "vitest";
import { useGetMissions } from "../hooks/useMissions";
import { UseQueryResult } from "react-query";

// Mock the module to return a mock function
vi.mock("../hooks/useMissions", () => ({
  useGetMissions: vi.fn(),
}));

vi.mock("../hooks/useExpense", () => ({
  useGetExpense: () => ({ data: { results: [] } }),
}));
vi.mock("../hooks/useAuth", () => ({
  useGetCurrentUser: () => ({ data: { isStaff: true } }),
}));
vi.mock("../hooks/useView", () => ({ useMediaQuery: () => false }));
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
          <tr key={i} onClick={() => onClickRow(row)}>
            <td>{row.id}</td>
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

// Cast the imported function as a mock
const mockUseGetMissions = vi.mocked(useGetMissions);

describe("Home", () => {
  beforeEach(() => {
    // Set default mock return value
    mockUseGetMissions.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { results: [] },
    } as UseQueryResult<any>);
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
});