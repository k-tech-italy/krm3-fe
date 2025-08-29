import { render, screen } from "@testing-library/react";
import Krm3Calendar from "./Krm3Calendar";
import { useGetCurrentUser } from "../../hooks/useAuth";
import { useGetTimesheet, useSubmitTimesheet } from "../../hooks/useTimesheet";
import { useColumnViewPreference } from "../../hooks/useView";
import { vi } from "vitest";
import { QueryClient, QueryClientProvider } from "react-query";
import {Schedule} from "../../restapi/types.ts";

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

  beforeEach(() => {
    mockUseGetCurrentUser.mockReturnValue({
      data: { resource: { id: 1 } },
      userCan: () => true,
    });
    mockUseSubmitTimesheet.mockReturnValue({
      mutateAsync: vi.fn(),
      error: null,
    });
    mockUseColumnViewPreference.mockReturnValue({
      isColumnView: false,
      setColumnView: vi.fn(),
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

  test("submit button is enabled when minimum hours are scheduled", async () => {
    const timeEntries = []
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
    mockUseGetTimesheet.mockReturnValue({
      data: {
        timeEntries: timeEntries,
        days: days,
        schedule: schedule,
      },
      isSuccess: true,
    });

    renderWithProviders(<Krm3Calendar selectedResourceId={1} />);

    const submitButton = await screen.findByRole("button", {
        name: /Submit Timesheet/i,
      });

    expect(submitButton).toBeEnabled();
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
});

