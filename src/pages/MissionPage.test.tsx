import { act, render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MissionPage } from "./MissionPage";
import { vi } from "vitest";
import { useGetResources, useMissionList } from "../hooks/useMissions";
import { useExpenseList } from "../hooks/useExpense";
import { useMediaQuery } from "../hooks/useView";

type TableRow = {
  id: number;
  missionTitle?: string;
  resource?: string;
  amountCurrency?: string;
};

type TableMockProps = {
  data: TableRow[];
  columns: { accessorKey: string; header: string }[];
  onClickRow: (row: TableRow) => void;
  ordering?: string | null;
  onOrderingChange?: (ordering: string | null) => void;
  pagination?: { page: number; pageCount: number; onPageChange: (page: number) => void };
};

type ModalMockProps = {
  show: boolean;
  onClose: () => void;
};

const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
}));

vi.mock("../hooks/useMissions", () => ({
  useMissionList: vi.fn(),
  useGetResources: vi.fn(),
}));

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => mockNavigate,
}));

vi.mock("../hooks/useExpense", () => ({
  useExpenseList: vi.fn(),
}));
// the filters save and list saved filters through the API: no saved filters here
vi.mock("../hooks/useSavedFilters", () => ({
  useSavedFilters: () => ({ data: [] }),
  useSaveFilter: () => ({ mutate: vi.fn(), isLoading: false }),
}));
const mockUserPermissions = vi.hoisted(() => ({ value: ["core.add_mission"] as string[] }));
vi.mock("../hooks/useAuth", () => ({
  useGetCurrentUser: () => ({
    data: { isStaff: true },
    userCan: (required: string[]) => required.every((p) => mockUserPermissions.value.includes(p)),
  }),
}));
vi.mock("../hooks/useView", () => ({
  useMediaQuery: vi.fn(),
}));
vi.mock("../components/commons/LoadSpinner", () => ({
  default: () => <div>Loading...</div>,
}));

vi.mock("../components/commons/Krm3Table", () => ({
  default: ({
    data,
    columns,
    onClickRow,
    ordering,
    onOrderingChange,
    pagination,
  }: TableMockProps) => (
    <table>
      <thead>
        <tr>
          <th data-testid="columns">{columns.map((c) => c.accessorKey).join(",")}</th>
          <th data-testid="ordering">{ordering ?? ""}</th>
          <th>
            <button onClick={() => onOrderingChange?.("-fromDate")}>Sort</button>
            <button onClick={() => pagination?.onPageChange(2)}>Page 2</button>
            <span data-testid="page-count">{pagination?.pageCount}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={row.id} onClick={() => onClickRow(row)} data-testid={`row-${i}`}>
            <td data-testid={`id-${i}`}>{row.id}</td>
            <td data-testid={`mission-title-${i}`}>{row.missionTitle}</td>
            <td data-testid={`resource-${i}`}>{row.resource}</td>
            <td data-testid={`amount-${i}`}>{row.amountCurrency}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));
vi.mock("../components/expense/edit/ExpenseEdit", () => ({
  ExpenseEdit: ({ show, onClose }: ModalMockProps) =>
    show ? (
      <div>
        ExpenseEditModal
        <button onClick={onClose}>Close Expense</button>
      </div>
    ) : null,
}));
vi.mock("../components/missions/create/CreateMission", () => ({
  default: ({ show, onClose }: ModalMockProps) =>
    show ? (
      <div>
        MissionModal<button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

const mockUseMissionList = vi.mocked(useMissionList);
const mockUseExpenseList = vi.mocked(useExpenseList);
const mockUseGetResources = vi.mocked(useGetResources);
const mockUseMediaQuery = vi.mocked(useMediaQuery);

const mockMissionData = {
  count: 60,
  results: [
    {
      id: 1,
      fromDate: "2023-01-01",
      toDate: "2023-01-05",
      title: "Test Mission",
      resource: { firstName: "John", lastName: "Doe" },
    },
  ],
};

const mockExpenseData = {
  count: 1,
  results: [
    {
      id: 100,
      day: "2023-01-02",
      mission: 1,
      missionTitle: "Test Mission",
      resourceName: "John Doe",
      amountCurrency: "100 EUR",
    },
  ],
};

function renderPage(url = "/trasferte") {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <MissionPage />
    </MemoryRouter>
  );
}

function lastMissionParams() {
  return mockUseMissionList.mock.lastCall?.[0];
}

function lastExpenseParams() {
  return mockUseExpenseList.mock.lastCall?.[0];
}

describe("MissionPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    mockUseMissionList.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockMissionData,
    } as unknown as ReturnType<typeof useMissionList>);

    mockUseExpenseList.mockReturnValue({
      data: mockExpenseData,
    } as unknown as ReturnType<typeof useExpenseList>);

    mockUseGetResources.mockReturnValue({
      count: 1,
      next: null,
      previous: null,
      results: [{ id: 5, firstName: "Jane", lastName: "Roe" }],
    } as ReturnType<typeof useGetResources>);

    mockUseMediaQuery.mockReturnValue(false);
    mockUserPermissions.value = ["core.add_mission"];
  });

  it("shows the add mission button to users with core.add_mission", () => {
    renderPage();
    expect(screen.getByTestId("add-mission-button")).toBeInTheDocument();
  });

  it("hides the add mission button without core.add_mission, even for staff", () => {
    mockUserPermissions.value = [];
    renderPage();
    expect(screen.queryByTestId("add-mission-button")).not.toBeInTheDocument();
  });

  it("hides the add mission button on small screens", () => {
    mockUseMediaQuery.mockReturnValue(true);
    renderPage();
    expect(screen.queryByTestId("add-mission-button")).not.toBeInTheDocument();
  });

  it("renders loading state", () => {
    mockUseMissionList.mockReturnValue({
      isLoading: true,
    } as ReturnType<typeof useMissionList>);
    renderPage();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("renders error state", () => {
    mockUseMissionList.mockReturnValue({
      isLoading: false,
      isError: true,
    } as ReturnType<typeof useMissionList>);
    renderPage();
    expect(screen.getByText(/errore/i)).toBeInTheDocument();
  });

  it("renders tabs and switches tab", () => {
    renderPage();
    expect(screen.getByTestId("mission-filter-button")).toBeInTheDocument();
    fireEvent.click(screen.getByText(/spese/i));
    expect(screen.getByTestId("expense-filter-button")).toBeInTheDocument();
    fireEvent.click(screen.getByText(/trasferte/i));
    expect(screen.getByTestId("mission-filter-button")).toBeInTheDocument();
  });

  it("opens the expenses tab from the URL", () => {
    renderPage("/trasferte?tab=spese");
    expect(screen.getByTestId("expense-filter-button")).toBeInTheDocument();
  });

  it("shows mission title and resource of expenses from the API", () => {
    renderPage();
    fireEvent.click(screen.getByText(/spese/i));

    expect(screen.getByTestId("mission-title-0")).toHaveTextContent("Test Mission");
    expect(screen.getByTestId("resource-0")).toHaveTextContent("John Doe");
    expect(screen.getByTestId("amount-0")).toHaveTextContent("100 EUR");
  });

  it("navigates to mission detail when clicking on mission row", () => {
    renderPage();
    fireEvent.click(screen.getByTestId("row-0"));
    expect(mockNavigate).toHaveBeenCalledWith("/trasferte/1");
  });

  it("sets selected expense when clicking on expense row", () => {
    renderPage();
    fireEvent.click(screen.getByText(/spese/i));

    fireEvent.click(screen.getByTestId("row-0"));
    expect(screen.getByText("ExpenseEditModal")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Close Expense"));
    expect(screen.queryByText("ExpenseEditModal")).not.toBeInTheDocument();
  });

  it("hides cancelled missions when no status is selected", () => {
    renderPage();
    expect(lastMissionParams()).toEqual({ page: 1, pageSize: 25, status: "DRAFT,SUBMITTED" });
  });

  it("sends the filters, ordering and page from the URL to the API", () => {
    renderPage("/trasferte?status=CANCELLED&search=rome&year=2025&ordering=-toDate&page=2");
    expect(lastMissionParams()).toEqual({
      page: 2,
      pageSize: 25,
      status: "CANCELLED",
      search: "rome",
      year: "2025",
      ordering: "-toDate",
    });
    expect(screen.getByTestId("ordering")).toHaveTextContent("-toDate");
    expect(screen.getByTestId("mission-filter-badge")).toHaveTextContent("3");
  });

  it("computes the page count from the API count", () => {
    renderPage();
    expect(screen.getByTestId("page-count")).toHaveTextContent("3");
  });

  it("applies the filter form and goes back to the first page", () => {
    renderPage("/trasferte?page=3");
    fireEvent.click(screen.getByTestId("mission-filter-button"));
    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "audit" } });
    fireEvent.click(screen.getByLabelText("Cancelled"));
    fireEvent.click(screen.getByTestId("mission-filter-submit"));

    expect(screen.queryByTestId("mission-filter-panel")).not.toBeInTheDocument();
    expect(lastMissionParams()).toEqual({
      page: 1,
      pageSize: 25,
      search: "audit",
      status: "CANCELLED",
    });
  });

  it("changes ordering and page through the table", () => {
    renderPage();
    fireEvent.click(screen.getByText("Page 2"));
    expect(lastMissionParams()).toMatchObject({ page: 2 });
    fireEvent.click(screen.getByText("Sort"));
    expect(lastMissionParams()).toMatchObject({ page: 1, ordering: "-fromDate" });
  });

  it("offers the resource filter only to users who can see other people's missions", () => {
    renderPage();
    fireEvent.click(screen.getByTestId("mission-filter-button"));
    expect(screen.queryByText("Resource")).not.toBeInTheDocument();
    expect(mockUseGetResources).toHaveBeenLastCalledWith(false);
  });

  it("filters missions by resource for mission viewers", async () => {
    mockUserPermissions.value = ["core.view_any_mission"];
    renderPage();
    fireEvent.click(screen.getByTestId("mission-filter-button"));
    fireEvent.change(screen.getByLabelText("Resource"), { target: { value: "jan" } });
    fireEvent.mouseDown(await screen.findByRole("option", { name: "Jane Roe" }));
    fireEvent.click(screen.getByTestId("mission-filter-submit"));
    expect(lastMissionParams()).toMatchObject({ resource: "5" });
  });

  it("suggests resources from the third character and keeps the filter open while picking", async () => {
    mockUserPermissions.value = ["core.view_any_mission"];
    renderPage();
    fireEvent.click(screen.getByTestId("mission-filter-button"));
    fireEvent.change(screen.getByLabelText("Resource"), { target: { value: "ja" } });
    // the debounce timer updates the autocomplete state: let it fire inside act()
    await act(() => new Promise((resolve) => setTimeout(resolve, 450)));
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Resource"), { target: { value: "jan" } });
    // the suggestions follow the typing after the 0.4 s debounce
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
    fireEvent.mouseDown(await screen.findByRole("option", { name: "Jane Roe" }));
    expect(screen.getByTestId("mission-filter-panel")).toBeInTheDocument();
    expect(screen.getByLabelText("Remove Jane Roe")).toBeInTheDocument();
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("hides the Id column by default and shows it from the column chooser", () => {
    renderPage();
    expect(screen.getByTestId("columns")).toHaveTextContent(
      "number,status,fromDate,toDate,title,resource"
    );

    fireEvent.click(screen.getByTestId("mission-columns-button"));
    fireEvent.click(screen.getByLabelText("Id"));
    fireEvent.click(screen.getByLabelText("Status"));
    expect(screen.getByTestId("columns")).toHaveTextContent(
      "id,number,fromDate,toDate,title,resource"
    );
  });

  it("chooses the expense columns separately", () => {
    renderPage("/trasferte?tab=spese");
    expect(screen.getByTestId("columns")).toHaveTextContent(
      "day,mission,missionTitle,resource,amountCurrency"
    );
    fireEvent.click(screen.getByTestId("expense-columns-button"));
    fireEvent.click(screen.getByLabelText("Id"));
    expect(screen.getByTestId("columns")).toHaveTextContent(
      "id,day,mission,missionTitle,resource,amountCurrency"
    );
  });

  it("filters expenses through the API, keeping the tab", () => {
    renderPage("/trasferte?tab=spese");
    fireEvent.click(screen.getByTestId("expense-filter-button"));
    fireEvent.change(screen.getByLabelText("From"), { target: { value: "2023-01-01" } });
    fireEvent.click(screen.getByTestId("expense-filter-submit"));

    expect(screen.getByTestId("expense-filter-button")).toBeInTheDocument();
    expect(lastExpenseParams()).toEqual({ page: 1, pageSize: 25, dateFrom: "2023-01-01" });
  });

  it("switching tab drops the other tab's filters", () => {
    renderPage("/trasferte?search=rome");
    fireEvent.click(screen.getByText(/spese/i));
    expect(lastExpenseParams()).toEqual({ page: 1, pageSize: 25 });
  });
});
