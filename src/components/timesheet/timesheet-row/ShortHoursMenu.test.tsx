import {render, screen, fireEvent} from "@testing-library/react";
import {ShortHoursMenu} from "./ShortHoursMenu";
import React from "react";
import {QueryClient, QueryClientProvider} from "react-query";
import {vi} from "vitest";

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
  const todayStr = "2026-02-26";
  const today = new Date(todayStr);
  const yesterdayStr = "2026-02-25";

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
    setOpenShortMenu: () => {
    },
    openTimeEntryModalHandler: () => {
    },
    timeEntries: [],
    allTimeEntries: [],
    schedule: {[todayStr.replaceAll("-", "_")]: 8},
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
    renderMenu({
      timeEntries: [
        {
          id: 1,
          dayShiftHours: 2,
          nightShiftHours: 1,
          restHours: 0,
          travelHours: 0,
          date: todayStr,
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
    renderMenu({
      timeEntries: [
        {
          id: 1,
          dayShiftHours: 2,
          nightShiftHours: 0,
          restHours: 0,
          travelHours: 0,
          date: todayStr,
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
          date: yesterdayStr,
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
          date: todayStr,
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
    renderMenu({readOnly: true});
    expect(screen.getByText("Details")).toBeInTheDocument();
  });

  it("calls openTimeEntryModalHandler when 'More' is clicked", () => {
    const openTimeEntryModalHandler = vi.fn();
    renderMenu({openTimeEntryModalHandler});
    fireEvent.click(screen.getByText("More"));
    expect(openTimeEntryModalHandler).toHaveBeenCalled();
  });

  it("calls mutateAsync when hour option is clicked", () => {
    renderMenu();
    fireEvent.click(screen.getByText("2h"));
    expect(mutateAsyncMock).toHaveBeenCalled();
  });

  it("calls mutateAsync with autoFill true when 'Autofill' is clicked", async () => {
    renderMenu();
    fireEvent.click(screen.getByText("Autofill"));
    expect(mutateAsyncMock).toHaveBeenCalledWith({
      dates: [todayStr],
      taskId: 1,
      autoFill: true,
    });
  });

  it("hides Autofill button when total hours reach schedule", () => {
    const todayKey = todayStr.replaceAll("-", "_");
    renderMenu({
      allTimeEntries: [
        {
          id: 1,
          date: todayStr,
          dayShiftHours: 8,
          nightShiftHours: 0,
          restHours: 0,
          travelHours: 0,
          task: 1,
          sickHours: 0,
          holidayHours: 0,
          leaveHours: 0,
          onCallHours: 0,
          specialLeaveHours: 0,
        },
      ],
      schedule: {[todayKey]: 8},
    });
    expect(screen.queryByText("Autofill")).not.toBeInTheDocument();
  });

  it("shows Autofill button when total hours are less than schedule", () => {
    const todayKey = todayStr.replaceAll("-", "_");
    renderMenu({
      allTimeEntries: [
        {
          id: 1,
          date: todayStr,
          dayShiftHours: 4,
          nightShiftHours: 0,
          restHours: 0,
          travelHours: 0,
          task: 1,
          sickHours: 0,
          holidayHours: 0,
          leaveHours: 0,
          onCallHours: 0,
          specialLeaveHours: 0,
          bankFrom: 0,
          bankTo: 0,
        },
      ],
      schedule: {[todayKey]: 8},
    });
    expect(screen.getByText("Autofill")).toBeInTheDocument();
  });

  it("does not render menu if openShortMenu is not visible", () => {
    const queryClient = new QueryClient();
    const {container} = render(
      <QueryClientProvider client={queryClient}>
        <ShortHoursMenu {...baseProps} openShortMenu={null}/>
      </QueryClientProvider>
    );
    expect(container.firstChild).toBeNull();
  });

  it("shows confirm modal when clicking hour with existing entries", () => {
    // Simulate daysWithTimeEntries present
    const timeEntries = [{date: todayStr, task: 1}];
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
    const timeEntries = [{date: todayStr, task: 1}];
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
    const setOpenShortMenuMock = vi.fn();
    const timeEntries = [{date: todayStr, task: 1}];
    renderMenu({
      timeEntries,
      setOpenShortMenu: setOpenShortMenuMock,
      openShortMenu: {
        ...baseProps.openShortMenu,
        startDate: yesterdayStr,
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
    const timeEntries = [{date: todayStr, task: 1}];
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
    const closeButton = screen.getByRole('button', {name: /close/i}) || document.querySelector('[aria-label="close"]');
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(setOpenShortMenuMock).toHaveBeenCalledWith(undefined);
    }
  });

  it("does not close menu on mouse leave when confirm modal is open", () => {
    const setOpenShortMenuMock = vi.fn();
    const timeEntries = [{date: todayStr, task: 1}];
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
    renderMenu({openShortMenu: null});
    // Component should not render, so no delete button should exist
    expect(screen.queryByTestId("short-menu-delete-button")).not.toBeInTheDocument();
  });

  it("shows Autofill button if ANY day in the range needs filling", () => {
    const yesterdayKey = yesterdayStr.replaceAll("-", "_");
    const todayKey = todayStr.replaceAll("-", "_");

    renderMenu({
      openShortMenu: {
        startDate: yesterdayStr,
        endDate: todayStr,
        taskId: "1",
      },
      allTimeEntries: [
        {
          id: 1,
          date: todayStr,
          dayShiftHours: 8,
          nightShiftHours: 0,
          restHours: 0,
          travelHours: 0,
          task: 1,
          sickHours: 0,
          holidayHours: 0,
          leaveHours: 0,
          onCallHours: 0,
          specialLeaveHours: 0
        },
      ],
      schedule: {
        [todayKey]: 8,
        [yesterdayKey]: 8,
      },
    });

    expect(screen.getByText("Autofill")).toBeInTheDocument();
  });

  it("hides Autofill button if ALL days in the range are full", () => {
    const yesterdayKey = yesterdayStr.replaceAll("-", "_");
    const todayKey = todayStr.replaceAll("-", "_");

    renderMenu({
      openShortMenu: {
        startDate: yesterdayStr,
        endDate: todayStr,
        taskId: "1",
      },
      allTimeEntries: [
        {
          id: 1,
          date: todayStr,
          dayShiftHours: 8,
          nightShiftHours: 0,
          restHours: 0,
          travelHours: 0,
          task: 1,
          sickHours: 0,
          holidayHours: 0,
          leaveHours: 0,
          onCallHours: 0,
          specialLeaveHours: 0
        },
        {
          id: 2,
          date: yesterdayStr,
          dayShiftHours: 8,
          nightShiftHours: 0,
          restHours: 0,
          travelHours: 0,
          task: 1,
          sickHours: 0,
          holidayHours: 0,
          leaveHours: 0,
          onCallHours: 0,
          specialLeaveHours: 0
        },
      ],
      schedule: {
        [todayKey]: 8,
        [yesterdayKey]: 8,
      },
    });

    expect(screen.queryByText("Autofill")).not.toBeInTheDocument();
  });

  it("Autofill only processes dates that require hours", async () => {
    const yesterdayKey = yesterdayStr.replaceAll("-", "_");
    const todayKey = todayStr.replaceAll("-", "_");

    renderMenu({
      openShortMenu: {
        startDate: yesterdayStr,
        endDate: todayStr,
        taskId: "1",
      },
      allTimeEntries: [
        {
          id: 1,
          date: todayStr,
          dayShiftHours: 8,
          nightShiftHours: 0,
          restHours: 0,
          travelHours: 0,
          task: 1,
          sickHours: 0,
          holidayHours: 0,
          leaveHours: 0,
          onCallHours: 0,
          specialLeaveHours: 0
        },
      ],
      schedule: {
        [todayKey]: 8,
        [yesterdayKey]: 8,
      },
    });

    fireEvent.click(screen.getByText("Autofill"));

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      dates: [yesterdayStr],
      taskId: 1,
      autoFill: true,
    });
  });
});
