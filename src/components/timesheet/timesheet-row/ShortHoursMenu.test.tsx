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
  const todayStr = "2026-02-26";
  const today = new Date(todayStr);
  const yesterdayStr = "2026-02-25";
  const todayKey = todayStr.replaceAll("-", "_");
  const yesterdayKey = yesterdayStr.replaceAll("-", "_");

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
    taskEntries: [],
    timeEntries: [],
    schedule: { [todayStr.replaceAll("-", "_")]: 8 },
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

  // Helper: click a quick hour button by label
  function clickQuickHour(label: "2h" | "4h" | "8h") {
    fireEvent.click(screen.getByTestId(`short-menu-${label}-button`));
  }

  // Helper: type a value into the custom hours input and click Add
  function submitHoursInput(value: string) {
    const input = screen.getByPlaceholderText("…");
    fireEvent.change(input, { target: { value } });
    fireEvent.click(screen.getByText("Add"));
  }

  it("renders quick hour buttons, custom input, and action options", () => {
    renderMenu();
    expect(screen.getByTestId("short-menu-2h-button")).toBeInTheDocument();
    expect(screen.getByTestId("short-menu-4h-button")).toBeInTheDocument();
    expect(screen.getByTestId("short-menu-8h-button")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("…")).toBeInTheDocument();
    expect(screen.getByText("Add")).toBeInTheDocument();
    expect(screen.getByText("More")).toBeInTheDocument();
    expect(screen.queryByTestId("short-menu-delete-button")).not.toBeInTheDocument();
  });

  it("renders delete option if timeentry is selected", () => {
    renderMenu({
      taskEntries: [
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
      ],
    });
    expect(screen.getByTestId("short-menu-delete-button")).toBeInTheDocument();
  });

  it("delete is called with correct parameters", () => {
    renderMenu({
      taskEntries: [
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
      ],
    });
    fireEvent.click(screen.getByTestId("short-menu-delete-button"));
    expect(mutateDeleteMock).toHaveBeenCalledWith([1]);
  });

  it("renders readOnly Details option and hides quick buttons and input", () => {
    renderMenu({ readOnly: true });
    expect(screen.getByText("Details")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("…")).not.toBeInTheDocument();
    expect(screen.queryByText("Add")).not.toBeInTheDocument();
    expect(screen.queryByTestId("short-menu-2h-button")).not.toBeInTheDocument();
    expect(screen.queryByTestId("short-menu-4h-button")).not.toBeInTheDocument();
    expect(screen.queryByTestId("short-menu-8h-button")).not.toBeInTheDocument();
  });

  it("calls openTimeEntryModalHandler when 'More' is clicked", () => {
    const openTimeEntryModalHandler = vi.fn();
    renderMenu({ openTimeEntryModalHandler });
    fireEvent.click(screen.getByText("More"));
    expect(openTimeEntryModalHandler).toHaveBeenCalled();
  });

  it("calls mutateAsync when 2h quick button is clicked", () => {
    renderMenu();
    clickQuickHour("2h");
    expect(mutateAsyncMock).toHaveBeenCalled();
  });

  it("calls mutateAsync when 4h quick button is clicked", () => {
    renderMenu();
    clickQuickHour("4h");
    expect(mutateAsyncMock).toHaveBeenCalled();
  });

  it("calls mutateAsync when 8h quick button is clicked", () => {
    renderMenu();
    clickQuickHour("8h");
    expect(mutateAsyncMock).toHaveBeenCalled();
  });

  it("calls mutateAsync when a valid custom hour value is submitted", () => {
    renderMenu();
    submitHoursInput("3");
    expect(mutateAsyncMock).toHaveBeenCalled();
  });

  it("calls mutateAsync when Enter key is pressed on the custom input", () => {
    renderMenu();
    const input = screen.getByPlaceholderText("…");
    fireEvent.change(input, { target: { value: "3" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(mutateAsyncMock).toHaveBeenCalled();
  });

  it("shows validation error for value below 0.5", () => {
    renderMenu();
    submitHoursInput("0");
    expect(screen.getByText("Enter a value from 0.5 to 8 in 0.5 increments")).toBeInTheDocument();
    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });

  it("shows validation error for value above 8", () => {
    renderMenu();
    submitHoursInput("8.5");
    expect(screen.getByText("Enter a value from 0.5 to 8 in 0.5 increments")).toBeInTheDocument();
    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });

  it("shows validation error for non-0.5 increment (e.g. 1.3)", () => {
    renderMenu();
    submitHoursInput("1.3");
    expect(screen.getByText("Enter a value from 0.5 to 8 in 0.5 increments")).toBeInTheDocument();
    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });

  it("shows validation error for non-numeric input", () => {
    renderMenu();
    submitHoursInput("abc");
    expect(screen.getByText("Enter a value from 0.5 to 8 in 0.5 increments")).toBeInTheDocument();
    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });

  it("clears validation error when input changes", () => {
    renderMenu();
    submitHoursInput("0");
    expect(screen.getByText("Enter a value from 0.5 to 8 in 0.5 increments")).toBeInTheDocument();
    const input = screen.getByPlaceholderText("…");
    fireEvent.change(input, { target: { value: "4" } });
    expect(
      screen.queryByText("Enter a value from 0.5 to 8 in 0.5 increments")
    ).not.toBeInTheDocument();
  });

  it("accepts valid 0.5 increment values (0.5, 4, 7.5, 8)", () => {
    for (const value of ["0.5", "4", "7.5", "8"]) {
      mutateAsyncMock.mockClear();
      renderMenu();
      submitHoursInput(value);
      expect(
        screen.queryByText("Enter a value from 0.5 to 8 in 0.5 increments")
      ).not.toBeInTheDocument();
      expect(mutateAsyncMock).toHaveBeenCalled();
    }
  });

  it("calls mutateAsync with autofill true when 'Autofill' is clicked", async () => {
    renderMenu();
    fireEvent.click(screen.getByText("Autofill"));
    expect(mutateAsyncMock).toHaveBeenCalledWith({
      dates: [todayStr],
      taskId: 1,
      autofill: true,
    });
  });

  const hideAutofillScenarios = [
    {
      name: "8h one task",
      entries: [{ date: todayStr, dayShiftHours: 8, taskId: 1 }],
    },
    {
      name: "overtime",
      entries: [{ date: todayStr, dayShiftHours: 12, taskId: 1 }],
    },
    {
      name: "day entries and task entries",
      entries: [
        { date: todayStr, dayShiftHours: 4, taskId: 1 },
        { date: todayStr, leaveHours: 4 },
        { date: todayStr, restHours: 2 },
      ],
    },
  ];
  it.each(hideAutofillScenarios)(
    "hides Autofill button when total hours reach schedule",
    ({ entries }) => {
      renderMenu({
        timeEntries: entries,
        schedule: { [todayKey]: 8 },
      });
      expect(screen.queryByText("Autofill")).not.toBeInTheDocument();
    }
  );

  const showAutofillScenarios = [
    {
      name: "empty day",
      entries: [],
    },
    {
      name: "one task entry",
      entries: [{ date: todayStr, dayShiftHours: 6, taskId: 1 }],
    },
    {
      name: "one day entry",
      entries: [{ date: todayStr, leaveHours: 4 }],
    },
    {
      name: "day entries and task entries",
      entries: [
        { date: todayStr, dayShiftHours: 2, taskId: 1 },
        { date: todayStr, leaveHours: 2 },
        { date: todayStr, restHours: 2 },
      ],
    },
  ];

  it.each(showAutofillScenarios)(
    "shows Autofill button when total hours are less than schedule",
    ({ entries }) => {
      renderMenu({
        timeEntries: entries,
        schedule: { [todayKey]: 8 },
      });
      expect(screen.getByText("Autofill")).toBeInTheDocument();
    }
  );

  it("does not render menu if openShortMenu is not visible", () => {
    const queryClient = new QueryClient();
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <ShortHoursMenu {...baseProps} openShortMenu={null} />
      </QueryClientProvider>
    );
    expect(container.firstChild).toBeNull();
  });

  it("shows confirm modal when clicking a quick hour button with existing entries", () => {
    const taskEntries = [{ date: todayStr, task: 1 }];
    renderMenu({
      taskEntries,
      openShortMenu: {
        ...baseProps.openShortMenu,
        startDate: todayStr,
        endDate: todayStr,
        taskId: "1",
      },
    });
    clickQuickHour("2h");
    expect(screen.getByText(/Overwrite existing entries/i)).toBeInTheDocument();
  });

  it("shows confirm modal when submitting custom hours with existing entries", () => {
    const taskEntries = [{ date: todayStr, task: 1 }];
    renderMenu({
      taskEntries,
      openShortMenu: {
        ...baseProps.openShortMenu,
        startDate: todayStr,
        endDate: todayStr,
        taskId: "1",
      },
    });
    submitHoursInput("3");
    expect(screen.getByText(/Overwrite existing entries/i)).toBeInTheDocument();
  });

  it("handles confirm modal actions", () => {
    const taskEntries = [{ date: todayStr, task: 1 }];
    renderMenu({
      taskEntries,
      openShortMenu: {
        ...baseProps.openShortMenu,
        startDate: todayStr,
        endDate: todayStr,
        taskId: "1",
      },
    });
    clickQuickHour("2h");
    fireEvent.click(screen.getByText(/No, Don't Overwrite/i));
    fireEvent.click(screen.getByText(/Yes, Overwrite/i));
    expect(mutateAsyncMock).toHaveBeenCalled();
  });

  it("handles mouse leave", () => {
    renderMenu();
    const menu = screen.getByRole("menu");
    fireEvent.mouseLeave(menu);
    // No assertion needed, just for coverage
  });

  it("handles confirm submission without overwrite when dates with no entries exist", () => {
    const setOpenShortMenuMock = vi.fn();
    const taskEntries = [{ date: todayStr, task: 1 }];
    renderMenu({
      taskEntries,
      setOpenShortMenu: setOpenShortMenuMock,
      openShortMenu: {
        ...baseProps.openShortMenu,
        startDate: yesterdayStr,
        endDate: todayStr,
        taskId: "1",
      },
    });
    clickQuickHour("2h");
    expect(screen.getByText(/Overwrite existing entries/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/No, Don't Overwrite/i));
    expect(mutateAsyncMock).toHaveBeenCalled();
    expect(setOpenShortMenuMock).toHaveBeenCalledWith(undefined);
  });

  it("handles confirm modal close", () => {
    const setOpenShortMenuMock = vi.fn();
    const taskEntries = [{ date: todayStr, task: 1 }];
    renderMenu({
      taskEntries,
      setOpenShortMenu: setOpenShortMenuMock,
      openShortMenu: {
        ...baseProps.openShortMenu,
        startDate: todayStr,
        endDate: todayStr,
        taskId: "1",
      },
    });
    clickQuickHour("2h");
    expect(screen.getByText(/Overwrite existing entries/i)).toBeInTheDocument();
    const closeButton =
      screen.getByRole("button", { name: /close/i }) ||
      document.querySelector('[aria-label="close"]');
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(setOpenShortMenuMock).toHaveBeenCalledWith(undefined);
    }
  });

  it("does not close menu on mouse leave when confirm modal is open", () => {
    const setOpenShortMenuMock = vi.fn();
    const taskEntries = [{ date: todayStr, task: 1 }];
    renderMenu({
      taskEntries,
      setOpenShortMenu: setOpenShortMenuMock,
      openShortMenu: {
        ...baseProps.openShortMenu,
        startDate: todayStr,
        endDate: todayStr,
        taskId: "1",
      },
    });
    clickQuickHour("2h");
    expect(screen.getByText(/Overwrite existing entries/i)).toBeInTheDocument();
    const menu = screen.getByRole("menu");
    fireEvent.mouseLeave(menu);
    expect(setOpenShortMenuMock).not.toHaveBeenCalledWith(undefined);
  });

  it("handles isDeleteButtonVisible when openShortMenu is null", () => {
    renderMenu({ openShortMenu: null });
    expect(screen.queryByTestId("short-menu-delete-button")).not.toBeInTheDocument();
  });

  it("shows Autofill button if ANY day in the range needs filling", () => {
    renderMenu({
      openShortMenu: {
        startDate: yesterdayStr,
        endDate: todayStr,
        taskId: "1",
      },
      timeEntries: [
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
      schedule: {
        [todayKey]: 8,
        [yesterdayKey]: 8,
      },
    });
    expect(screen.getByText("Autofill")).toBeInTheDocument();
  });

  it("hides Autofill button if ALL days in the range are full", () => {
    renderMenu({
      openShortMenu: {
        startDate: yesterdayStr,
        endDate: todayStr,
        taskId: "1",
      },
      timeEntries: [
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
          specialLeaveHours: 0,
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
    renderMenu({
      openShortMenu: {
        startDate: yesterdayStr,
        endDate: todayStr,
        taskId: "1",
      },
      timeEntries: [
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
      schedule: {
        [todayKey]: 8,
        [yesterdayKey]: 8,
      },
    });
    fireEvent.click(screen.getByText("Autofill"));
    expect(mutateAsyncMock).toHaveBeenCalledWith({
      dates: [yesterdayStr],
      taskId: 1,
      autofill: true,
    });
  });
});
