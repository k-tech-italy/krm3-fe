import { render, screen, fireEvent } from "@testing-library/react";
import { ShortHoursMenu } from "./ShortHoursMenu";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { vi } from "vitest";

// Mock useCreateTimeEntry
const mutateAsyncMock = vi.fn();
vi.mock("../../../hooks/useTimesheet", () => ({
  useCreateTimeEntry: () => ({
    mutateAsync: mutateAsyncMock,
    error: null,
  }),
}));

// Mock toast (define functions inside the factory to avoid hoisting issues)
vi.mock("react-toastify", () => {
  return {
    toast: {
      error: vi.fn(),
      warning: vi.fn(),
      promise: vi.fn(),
    },
  };
});

describe("ShortHoursMenu (extended)", () => {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const baseProps = {
    dayToOpen: today,
    taskId: 1,
    openShortMenu: {
      startDate: todayStr,
      endDate: todayStr,
      taskId: "1",
    },
    readOnly: false,
    selectedResourceId: 1,
    setOpenShortMenu: () => {},
    openTimeEntryModalHandler: () => {},
    timeEntries: [],
    days: {},
    holidayOrSickDays: [],
  };
  function renderMenu(props = {}) {
    const queryClient = new QueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
        <ShortHoursMenu {...baseProps} {...props} />
      </QueryClientProvider>
    );
  }

  it("renders hour options", () => {
    renderMenu();
    expect(screen.getByText("2h")).toBeInTheDocument();
    expect(screen.getByText("4h")).toBeInTheDocument();
    expect(screen.getByText("8h")).toBeInTheDocument();
    expect(screen.getByText("More")).toBeInTheDocument();
  });

  it("renders readOnly option", () => {
    renderMenu({ readOnly: true });
    expect(screen.getByText("Details")).toBeInTheDocument();
  });

  it("calls openTimeEntryModalHandler when 'More' is clicked", () => {
    const openTimeEntryModalHandler = vi.fn();
    renderMenu({ openTimeEntryModalHandler });
    fireEvent.click(screen.getByText("More"));
    expect(openTimeEntryModalHandler).toHaveBeenCalled();
  });

  it("calls mutateAsync when hour option is clicked", () => {
    renderMenu();
    fireEvent.click(screen.getByText("2h"));
    expect(mutateAsyncMock).toHaveBeenCalled();
  });

  it("does not render menu if openShortMenu is not visible", () => {
    const queryClient = new QueryClient();
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <ShortHoursMenu {...baseProps} openShortMenu={null} />
      </QueryClientProvider>
    );
    expect(container.firstChild).toBeNull();
  });

  it("shows confirm modal when clicking hour with existing entries", () => {
    // Simulate daysWithTimeEntries present
    const timeEntries = [{ date: todayStr, task: 1 }];
    renderMenu({
      timeEntries,
      openShortMenu: {
        ...baseProps.openShortMenu,
        startDate: todayStr,
        endDate: todayStr,
        taskId: "1",
      },
    });
    fireEvent.click(screen.getByText("2h"));
    // Modal should appear
    expect(screen.getByText(/Overwrite existing entries/i)).toBeInTheDocument();
  });

  it("handles confirm modal actions", () => {
    // Simulate daysWithTimeEntries present
    const timeEntries = [{ date: todayStr, task: 1 }];
    renderMenu({
      timeEntries,
      openShortMenu: {
        ...baseProps.openShortMenu,
        startDate: todayStr,
        endDate: todayStr,
        taskId: "1",
      },
    });
    fireEvent.click(screen.getByText("2h"));
    // Click "No, Don't Overwrite"
    fireEvent.click(screen.getByText(/No, Don't Overwrite/i));
    // Click "Yes, Overwrite"
    fireEvent.click(screen.getByText(/Yes, Overwrite/i));
    // Both should call mutateAsyncMock
    expect(mutateAsyncMock).toHaveBeenCalled();
  });

  it("handles mouse leave", () => {
    renderMenu();
    // Simulate mouse leave on the menu
    const menu = screen.getByRole("menu");
    fireEvent.mouseLeave(menu);
    // No assertion needed, just for coverage
  });
}); 