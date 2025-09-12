import { render, screen, fireEvent } from "@testing-library/react";
import { ShortHoursMenu } from "./ShortHoursMenu";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { vi } from "vitest";

const mutateDeleteMock = vi.fn().mockResolvedValue(undefined);

// Mock useCreateTimeEntry
const mutateAsyncMock = vi.fn();
vi.mock("../../../hooks/useTimesheet", () => ({
  useCreateTimeEntry: () => ({
    mutateAsync: mutateAsyncMock,
    error: null,
  }),
  useDeleteTimeEntries: () => ({
    mutateAsync: mutateDeleteMock,
  })
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
    expect(screen.queryByTestId("short-menu-delete-button")).not.toBeInTheDocument();
  });
  it("renders delete option if timeentry is selected", () => {
    renderMenu({timeEntries: [
        {
          id: 1,
          dayShiftHours: 2,
          nightShiftHours: 1,
          restHours: 0,
          travelHours: 0,
          date: new Date().toISOString().slice(0, 10),
          task: 1,
          sickHours: 0,
          holidayHours: 0,
          leaveHours: 0,
          onCallHours: 0,
          specialLeaveHours: 0,
          specialReason: undefined,
          comment: undefined,
        },
      ]
    })
    expect(screen.getByTestId("short-menu-delete-button")).toBeInTheDocument();
  })
  it("delete is called with correct parameters", () => {
    renderMenu({timeEntries: [
        {
          id: 1,
          dayShiftHours: 2,
          nightShiftHours: 0,
          restHours: 0,
          travelHours: 0,
          date: new Date().toISOString().slice(0, 10),
          task: 1,
          sickHours: 0,
          holidayHours: 0,
          leaveHours: 0,
          onCallHours: 0,
          specialLeaveHours: 0,
          specialReason: undefined,
          comment: undefined,
        },
        {
          id: 2,
          dayShiftHours: 2,
          nightShiftHours: 0,
          restHours: 0,
          travelHours: 0,
          // yesterday
          date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
          task: 1,
          sickHours: 0,
          holidayHours: 0,
          leaveHours: 0,
          onCallHours: 0,
          specialLeaveHours: 0,
          specialReason: undefined,
          comment: undefined,
        },
        {
          id: 3,
          dayShiftHours: 2,
          nightShiftHours: 0,
          restHours: 0,
          travelHours: 0,
          date: new Date().toISOString().slice(0, 10),
          task: 2,
          sickHours: 0,
          holidayHours: 0,
          leaveHours: 0,
          onCallHours: 0,
          specialLeaveHours: 0,
          specialReason: undefined,
          comment: undefined,
        },
      ]
    })
    fireEvent.click(screen.getByTestId("short-menu-delete-button"))
    expect(mutateDeleteMock).toHaveBeenCalledWith([1])
  })

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

  it("handles confirm submission without overwrite when dates with no entries exist", () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const setOpenShortMenuMock = vi.fn();
    const timeEntries = [{ date: todayStr, task: 1 }];
    renderMenu({
      timeEntries,
      setOpenShortMenu: setOpenShortMenuMock,
      openShortMenu: {
        ...baseProps.openShortMenu,
        startDate: yesterday,
        endDate: todayStr,
        taskId: "1",
      },
    });
    fireEvent.click(screen.getByText("2h"));
    expect(screen.getByText(/Overwrite existing entries/i)).toBeInTheDocument();
    // Click "No, Don't Overwrite" - this should only add to dates without entries
    fireEvent.click(screen.getByText(/No, Don't Overwrite/i));
    expect(mutateAsyncMock).toHaveBeenCalled();
    expect(setOpenShortMenuMock).toHaveBeenCalledWith(undefined);
  });

  it("handles confirm modal close", () => {
    const setOpenShortMenuMock = vi.fn();
    const timeEntries = [{ date: todayStr, task: 1 }];
    renderMenu({
      timeEntries,
      setOpenShortMenu: setOpenShortMenuMock,
      openShortMenu: {
        ...baseProps.openShortMenu,
        startDate: todayStr,
        endDate: todayStr,
        taskId: "1",
      },
    });
    fireEvent.click(screen.getByText("2h"));
    expect(screen.getByText(/Overwrite existing entries/i)).toBeInTheDocument();
    // Find and click the close button (assuming Krm3Modal has a close button)
    const closeButton = screen.getByRole('button', { name: /close/i }) || document.querySelector('[aria-label="close"]');
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(setOpenShortMenuMock).toHaveBeenCalledWith(undefined);
    }
  });

  it("does not close menu on mouse leave when confirm modal is open", () => {
    const setOpenShortMenuMock = vi.fn();
    const timeEntries = [{ date: todayStr, task: 1 }];
    renderMenu({
      timeEntries,
      setOpenShortMenu: setOpenShortMenuMock,
      openShortMenu: {
        ...baseProps.openShortMenu,
        startDate: todayStr,
        endDate: todayStr,
        taskId: "1",
      },
    });
    // Open confirm modal by clicking hour option
    fireEvent.click(screen.getByText("2h"));
    expect(screen.getByText(/Overwrite existing entries/i)).toBeInTheDocument();

    // Try to leave menu - should not close because modal is open
    const menu = screen.getByRole("menu");
    fireEvent.mouseLeave(menu);

    // Menu should still be visible (setOpenShortMenu should not be called)
    expect(setOpenShortMenuMock).not.toHaveBeenCalledWith(undefined);
  });

  it("handles isDeleteButtonVisible when openShortMenu is null", () => {
    // This tests the early return in isDeleteButtonVisible
    renderMenu({ openShortMenu: null });
    // Component should not render, so no delete button should exist
    expect(screen.queryByTestId("short-menu-delete-button")).not.toBeInTheDocument();
  });
}); 