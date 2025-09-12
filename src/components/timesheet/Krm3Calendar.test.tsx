import {fireEvent, render, screen, within} from "@testing-library/react";
import Krm3Calendar from "./Krm3Calendar";
import { useGetCurrentUser } from "../../hooks/useAuth";
import { useGetTimesheet, useSubmitTimesheet } from "../../hooks/useTimesheet";
import { useColumnViewPreference } from "../../hooks/useView";
import { vi } from "vitest";
import { QueryClient, QueryClientProvider } from "react-query";
import {Schedule} from "../../restapi/types.ts";
import * as reactResponsive from "react-responsive";

vi.mock("../../hooks/useAuth");
vi.mock("../../hooks/useTimesheet");
vi.mock("../../hooks/useView");
vi.mock("react-toastify", () => ({
  toast: {
    promise: vi.fn(),
  },
}));

const queryClient = new QueryClient();

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
};

describe("Krm3Calendar", () => {
  const mockUseGetCurrentUser = useGetCurrentUser as jest.Mock;
  const mockUseGetTimesheet = useGetTimesheet as jest.Mock;
  const mockUseSubmitTimesheet = useSubmitTimesheet as jest.Mock;
  const mockUseColumnViewPreference = useColumnViewPreference as jest.Mock;
  const mockMutateSubmitTimesheet = vi.fn();
  const fixedDate = new Date("2025-07-01T00:00:00Z");
  const timeEntries = [] as any
  for(let i = 1; i < 32; i++) {
    timeEntries.push({date: `2025-07-${i / 10 >= 1 ? i : "0" + i}`, dayShiftHours: 8})
  }
  const days: Record<string, {}> = {}
  for(let i = 1; i < 32; i++) {
    days[`2025-07-${i / 10 >= 1 ? String(i) : "0" + i}`] = { closed: false, hol: false }
  }
  const schedule: Schedule = {}
  for(let i = 1; i < 32; i++) {
    schedule[`2025_07_${i / 10 >= 1 ? String(i) : "0" + i}`] = 8
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers();
    vi.setSystemTime(fixedDate);
    mockMutateSubmitTimesheet.mockClear();
    mockUseGetCurrentUser.mockReturnValue({
      data: { resource: { id: 1 } },
      userCan: () => true,
    });
    mockUseSubmitTimesheet.mockReturnValue({
      mutateAsync: mockMutateSubmitTimesheet,
      error: null,
    });
    mockUseColumnViewPreference.mockReturnValue({
      isColumnView: false,
      setColumnView: vi.fn(),
    });
    mockUseGetTimesheet.mockReturnValue({
      data: {
        timeEntries: timeEntries,
        days: days,
        schedule: schedule,
      },
      isSuccess: true,
    });
  });

  test("submit button is disabled when minimum hours are not scheduled", () => {
    const days: Record<string, {}> = {}
    for(let i = 1; i < 32; i++) {
      days[`2025-07-${i / 10 >= 1 ? String(i) : "0" + i}`] = { closed: false, hol: false }
    }
    const schedule: Schedule = {}
    for(let i = 1; i < 32; i++) {
      schedule[`2025_07_${i / 10 >= 1 ? String(i) : "0" + i}`] = 8
    }
    mockUseGetTimesheet.mockReturnValue({
      data: {
        timeEntries: [
          {
            date: "2025-07-01",
            dayShiftHours: 4,
          },
        ],
        days: days,
        schedule: schedule,
      },
      isSuccess: true,
    });
    renderWithProviders(<Krm3Calendar selectedResourceId={1} />);

    const submitButton = screen.getByRole("button", {
      name: /Submit Timesheet/i,
    });
    expect(submitButton).toBeDisabled();
  });

  test("mutateSubmitTimesheet should be called with proper parameters", async () => {
    renderWithProviders(<Krm3Calendar selectedResourceId={1} />);

    const submitButton = await screen.findByRole("button", {
        name: /Submit Timesheet/i,
      });

    expect(submitButton).toBeEnabled();
    fireEvent.click(submitButton)
    expect(mockMutateSubmitTimesheet).toBeCalledWith({"startDate": "2025-07-01", "endDate": "2025-07-31", "resourceId": 1 })

  });
  test("bank hours should be rendered", () => {
    mockUseGetTimesheet.mockReturnValue({
      data: {
        timeEntries: [
          {
            date: "2025-08-01",
            dayShiftHours: 4,
            bankFrom: 4,
            bankTo: 0,
          },
        ],
        days: [],
        schedule: {},
        bankHours: 10.5
      },
      isSuccess: true,
    });

    renderWithProviders(<Krm3Calendar selectedResourceId={1} />);
    expect(screen.getByTestId("bank-total")).toHaveTextContent("10.5h")
    expect(screen.getByTestId("bank-delta")).toHaveTextContent("-4h")
  })
  test("navigate to next and prev month", () => {

    renderWithProviders(<Krm3Calendar selectedResourceId={1} />);
    const navigateNextButton = document.getElementById("nav-next-btn") as HTMLElement
    const navigatePrevButton = document.getElementById("nav-prev-btn") as HTMLElement
    fireEvent.click(navigateNextButton);
    fireEvent.click(navigateNextButton);
    fireEvent.click(navigatePrevButton);
    fireEvent.click(navigatePrevButton);
    expect(mockUseGetTimesheet).toHaveBeenNthCalledWith(
        2,
        "2025-07-01",
        "2025-07-31",
        1
    )
    expect(mockUseGetTimesheet).toHaveBeenNthCalledWith(
        3,
        "2025-08-01",
        "2025-08-31",
        1
    )
    expect(mockUseGetTimesheet).toHaveBeenNthCalledWith(
        4,
        "2025-09-01",
        "2025-09-30",
        1
    )
    expect(mockUseGetTimesheet).toHaveBeenNthCalledWith(
        5,
        "2025-08-01",
        "2025-08-31",
        1
    )
    expect(mockUseGetTimesheet).toHaveBeenNthCalledWith(
        6,
        "2025-07-01",
        "2025-07-31",
        1
    )
  }, 10000)
  test("navigate to next and prev week", () => {
    renderWithProviders(<Krm3Calendar selectedResourceId={1} />);
    const navigateNextButton = document.getElementById("nav-next-btn") as HTMLElement
    const navigatePrevButton = document.getElementById("nav-prev-btn") as HTMLElement
    fireEvent.click(document.getElementById("switch-month-on") as HTMLElement);
    fireEvent.click(navigateNextButton);
    fireEvent.click(navigatePrevButton);
    fireEvent.click(navigatePrevButton);
    expect(mockUseGetTimesheet).toHaveBeenNthCalledWith(
        3,
        "2025-07-07",
        "2025-07-13",
        1
    )
    expect(mockUseGetTimesheet).toHaveBeenNthCalledWith(
        4,
        "2025-07-14",
        "2025-07-20",
        1
    )
    expect(mockUseGetTimesheet).toHaveBeenNthCalledWith(
        5,
        "2025-07-07",
        "2025-07-13",
        1
    )
    expect(mockUseGetTimesheet).toHaveBeenNthCalledWith(
        6,
        "2025-06-30",
        "2025-07-06",
        1
    )
  })
  test("current month button", () => {
    renderWithProviders(<Krm3Calendar selectedResourceId={1} />);
    const dateRangeDisplay = document.getElementById("date-range-display") as HTMLElement
    const navigateNextButton = document.getElementById("nav-next-btn") as HTMLElement
    fireEvent.click(navigateNextButton);
    fireEvent.click(navigateNextButton);
    expect(within(dateRangeDisplay).getByText("September 2025")).toBeInTheDocument();

    fireEvent.click(document.getElementById("krm3-calendar-current-week-button") as HTMLElement);
    expect(within(dateRangeDisplay).getByText("July 2025")).toBeInTheDocument();
  }, 10000)
  test("current week button", () => {
    renderWithProviders(<Krm3Calendar selectedResourceId={1} />);
    const dateRangeDisplay = document.getElementById("date-range-display") as HTMLElement
    const navigateNextButton = document.getElementById("nav-next-btn") as HTMLElement
    fireEvent.click(document.getElementById("switch-month-on") as HTMLElement);

    expect(within(dateRangeDisplay).getByText("Jul 7")).toBeInTheDocument();
    expect(within(dateRangeDisplay).getByText("Jul 13")).toBeInTheDocument();
    fireEvent.click(dateRangeDisplay);

    fireEvent.click(document.getElementById("krm3-calendar-current-week-button") as HTMLElement);
    expect(within(dateRangeDisplay).getByText("Jun 30")).toBeInTheDocument();
    expect(within(dateRangeDisplay).getByText("Jul 6")).toBeInTheDocument();
  })
  test("current week button for overlapping week", () => {
    const fixedDate = new Date("2025-07-01T00:00:00Z");
    vi.setSystemTime(fixedDate);
    renderWithProviders(<Krm3Calendar selectedResourceId={1} />);
    const navigateNextButton = document.getElementById("nav-next-btn") as HTMLElement
    const dateRangeDisplay = document.getElementById("date-range-display") as HTMLElement
    const navigatePrevButton = document.getElementById("nav-prev-btn") as HTMLElement
    
    fireEvent.click(document.getElementById("switch-month-on") as HTMLElement);
    fireEvent.click(navigateNextButton);
    fireEvent.click(document.getElementById("krm3-calendar-current-week-button") as HTMLElement);

    expect(within(dateRangeDisplay).getByText("Jun 30")).toBeInTheDocument();
    expect(within(dateRangeDisplay).getByText("Jul 6")).toBeInTheDocument();
    expect(screen.getByTestId("week-start")).not.toHaveClass("font-bold")
    expect(screen.getByTestId("week-end")).toHaveClass("font-bold")

    fireEvent.click(navigatePrevButton);
    fireEvent.click(document.getElementById("krm3-calendar-current-week-button") as HTMLElement);

    expect(within(dateRangeDisplay).getByText("Jun 30")).toBeInTheDocument();
    expect(within(dateRangeDisplay).getByText("Jul 6")).toBeInTheDocument();
    expect(screen.getByTestId("week-start")).toHaveClass("font-bold")
    expect(screen.getByTestId("week-end")).not.toHaveClass("font-bold")

  })
  test("overlapping week", () => {
    renderWithProviders(<Krm3Calendar selectedResourceId={1} />);
    const navigateNextButton = document.getElementById("nav-next-btn") as HTMLElement
    const navigatePrevButton = document.getElementById("nav-prev-btn") as HTMLElement
    const dateRangeDisplay = document.getElementById("date-range-display") as HTMLElement
    fireEvent.click(document.getElementById("switch-month-on") as HTMLElement);

    fireEvent.click(navigatePrevButton);
    expect(within(dateRangeDisplay).getByText("Jun 30")).toBeInTheDocument();
    expect(within(dateRangeDisplay).getByText("Jul 6")).toBeInTheDocument();

    fireEvent.click(navigatePrevButton);
    expect(within(dateRangeDisplay).getByText("Jun 30")).toBeInTheDocument();
    expect(within(dateRangeDisplay).getByText("Jul 6")).toBeInTheDocument();

    fireEvent.click(navigatePrevButton);
    expect(within(dateRangeDisplay).getByText("Jun 23")).toBeInTheDocument();
    expect(within(dateRangeDisplay).getByText("Jun 29")).toBeInTheDocument();

    fireEvent.click(navigateNextButton);
    expect(within(dateRangeDisplay).getByText("Jun 30")).toBeInTheDocument();
    expect(within(dateRangeDisplay).getByText("Jul 6")).toBeInTheDocument();

    fireEvent.click(navigateNextButton);
    expect(within(dateRangeDisplay).getByText("Jun 30")).toBeInTheDocument();
    expect(within(dateRangeDisplay).getByText("Jul 6")).toBeInTheDocument();

    fireEvent.click(navigateNextButton);
    expect(within(dateRangeDisplay).getByText("Jul 7")).toBeInTheDocument();
    expect(within(dateRangeDisplay).getByText("Jul 13")).toBeInTheDocument();
  })
  test("change month on week view when there is no overlapping week", () => {
    const fixedDate = new Date("2025-09-01T00:00:00Z");
    vi.setSystemTime(fixedDate);
    renderWithProviders(<Krm3Calendar selectedResourceId={1} />);
    const navigatePrevButton = document.getElementById("nav-prev-btn") as HTMLElement
    const navigateNextButton = document.getElementById("nav-next-btn") as HTMLElement
    const dateRangeDisplay = document.getElementById("date-range-display") as HTMLElement
    fireEvent.click(document.getElementById("switch-month-on") as HTMLElement);
    expect(within(dateRangeDisplay).getByText("Sep 1")).toBeInTheDocument();
    expect(within(dateRangeDisplay).getByText("Sep 7")).toBeInTheDocument();

    fireEvent.click(navigatePrevButton);
    expect(within(dateRangeDisplay).getByText("Aug 25")).toBeInTheDocument();
    expect(within(dateRangeDisplay).getByText("Aug 31")).toBeInTheDocument();

    fireEvent.click(navigateNextButton);
    expect(within(dateRangeDisplay).getByText("Sep 1")).toBeInTheDocument();
    expect(within(dateRangeDisplay).getByText("Sep 7")).toBeInTheDocument();
  })
  test("should display error message for user without permissions", () => {
    mockUseGetCurrentUser.mockReturnValue({
      data: { resource: { id: 1 } },
      userCan: () => false,
    });
    renderWithProviders(<Krm3Calendar selectedResourceId={2} />);
    expect(screen.getByText("Access Denied. You don't have permissions to View/Edit timesheet")).toBeInTheDocument();
    expect(document.getElementById("krm3-calendar-container") as HTMLElement).not.toBeInTheDocument();
  })
  test("check landmark icon size for desktop", () => {
    vi.spyOn(reactResponsive, "useMediaQuery").mockReturnValue(true)
    renderWithProviders(<Krm3Calendar selectedResourceId={1} />);
    const landmark = screen.getByTestId("landmark-icon");
    expect(landmark).toHaveAttribute("width", "40");
  })
  test("check landmark icon size for mobile", () => {
    vi.spyOn(reactResponsive, "useMediaQuery").mockReturnValue(false)
    renderWithProviders(<Krm3Calendar selectedResourceId={1} />);
    const landmark = screen.getByTestId("landmark-icon");
    expect(landmark).toHaveAttribute("width", "30");
  })
  test("renders loading icon", () => {
    mockUseGetTimesheet.mockReturnValue({
      data: {
        timeEntries: timeEntries,
        days: days,
        schedule: schedule,
      },
      isLoading: true,
      isSuccess: false,
    });
    renderWithProviders(<Krm3Calendar selectedResourceId={1} />);
    expect(screen.getByText("Loading...")).toBeInTheDocument()
  })
  it("renders information for no data for timesheet table", () => {
    mockUseGetTimesheet.mockReturnValue({
      data: undefined,
      isLoading: false,
      isSuccess: false,
    });
    renderWithProviders(<Krm3Calendar selectedResourceId={1} />);
    expect(screen.getByText("No Data")).toBeInTheDocument()
  })
});

