import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useDragAndDrop, DragCallbacks } from "./useDragAndDrop";
import { Timesheet, TimeEntry, Task } from "../restapi/types";
import * as dates from "../components/timesheet/utils/dates";

// Mock the dates utility
vi.mock("../components/timesheet/utils/dates", async () => {
  const actual = await vi.importActual<typeof dates>(
    "../components/timesheet/utils/dates"
  );
  return {
    ...actual,
    getDateRange: vi.fn(),
  };
});

describe("useDragAndDrop", () => {
  const scheduledDays = [
    new Date("2024-01-01T12:00:00"),
    new Date("2024-01-02T12:00:00"),
    new Date("2024-01-03T12:00:00"),
    new Date("2024-01-04T12:00:00"),
    new Date("2024-01-05T12:00:00"),
  ];

  const mockTask: Task = {
    id: 1,
    mission: 1,
    name: "Development",
    defaultHours: 8,
    type: "work",
  };

  const mockTimeEntry: TimeEntry = {
    id: 100,
    task: 1,
    date: "2024-01-01",
    hours: 8,
    notes: "",
  };

  const mockTimesheet: Timesheet = {
    id: 1,
    resource: 1,
    startDate: "2024-01-01",
    endDate: "2024-01-05",
    tasks: [mockTask],
    timeEntries: [mockTimeEntry],
    days: {} as any,
  };

  let mockCallbacks: DragCallbacks;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCallbacks = {
      onTimeEntryDrag: vi.fn(),
      onColumnDrag: vi.fn(),
      onDragStart: vi.fn(),
    };
  });

  describe("initialization", () => {
    it("should initialize with default state", () => {
      const { result } = renderHook(() =>
        useDragAndDrop({
          scheduledDays,
          timesheet: mockTimesheet,
          callbacks: mockCallbacks,
        })
      );

      expect(result.current.activeId).toBeNull();
      expect(result.current.dragType).toBeNull();
      expect(result.current.draggedOverCells).toEqual([]);
    });
  });

  describe("column drag", () => {
    it("should handle column drag start", () => {
      const { result } = renderHook(() =>
        useDragAndDrop({
          scheduledDays,
          timesheet: mockTimesheet,
          callbacks: mockCallbacks,
        })
      );

      act(() => {
        result.current.handleDragStart({
          active: { id: "column-0" },
        });
      });

      expect(result.current.activeId).toBe("column-0");
      expect(result.current.dragType).toBe("column");
      expect(result.current.draggedOverCells).toEqual([scheduledDays[0]]);
      expect(mockCallbacks.onDragStart).toHaveBeenCalledWith({
        startDate: scheduledDays[0],
      });
    });

    it("should highlight columns during drag move", () => {
      const { result } = renderHook(() =>
        useDragAndDrop({
          scheduledDays,
          timesheet: mockTimesheet,
          callbacks: mockCallbacks,
        })
      );

      act(() => {
        result.current.handleDragStart({
          active: { id: "column-1" },
        });
      });

      act(() => {
        result.current.handleDragMove({
          over: { id: "column-3" },
        });
      });

      // Should highlight columns from index 1 to 3
      expect(result.current.draggedOverCells).toEqual([
        scheduledDays[1],
        scheduledDays[2],
        scheduledDays[3],
      ]);
    });

    it("should handle column drag backwards", () => {
      const { result } = renderHook(() =>
        useDragAndDrop({
          scheduledDays,
          timesheet: mockTimesheet,
          callbacks: mockCallbacks,
        })
      );

      act(() => {
        result.current.handleDragStart({
          active: { id: "column-3" },
        });
      });

      act(() => {
        result.current.handleDragMove({
          over: { id: "column-1" },
        });
      });

      // Should highlight columns from index 1 to 3 (sorted)
      expect(result.current.draggedOverCells).toEqual([
        scheduledDays[1],
        scheduledDays[2],
        scheduledDays[3],
      ]);
    });

    it("should call onColumnDrag callback on drag end", () => {
      const { result } = renderHook(() =>
        useDragAndDrop({
          scheduledDays,
          timesheet: mockTimesheet,
          callbacks: mockCallbacks,
        })
      );

      act(() => {
        result.current.handleDragStart({
          active: { id: "column-0" },
        });
      });

      act(() => {
        result.current.handleDragEnd({
          over: { id: "column-2" },
        });
      });

      expect(mockCallbacks.onColumnDrag).toHaveBeenCalledWith({
        task: mockTask,
        timeEntries: mockTimesheet.timeEntries,
        endDate: scheduledDays[2],
      });
    });

    it("should reset state after column drag end", () => {
      const { result } = renderHook(() =>
        useDragAndDrop({
          scheduledDays,
          timesheet: mockTimesheet,
          callbacks: mockCallbacks,
        })
      );

      act(() => {
        result.current.handleDragStart({
          active: { id: "column-0" },
        });
      });

      act(() => {
        result.current.handleDragEnd({
          over: { id: "column-2" },
        });
      });

      expect(result.current.activeId).toBeNull();
      expect(result.current.dragType).toBeNull();
      expect(result.current.draggedOverCells).toEqual([]);
    });
  });

  describe("cell drag", () => {
    it("should handle cell drag start with existing time entry", () => {
      const { result } = renderHook(() =>
        useDragAndDrop({
          scheduledDays,
          timesheet: mockTimesheet,
          callbacks: mockCallbacks,
        })
      );

      const cellId = `${new Date("2024-01-01").toDateString()}-1-100`;

      act(() => {
        result.current.handleDragStart({
          active: { id: cellId }, // date-taskId-entryId
        });
      });

      expect(result.current.activeId).toBe(cellId);
      expect(result.current.dragType).toBe("cell");
      expect(result.current.draggedOverCells).toEqual([
        new Date("2024-01-01"),
      ]);
      expect(mockCallbacks.onDragStart).toHaveBeenCalledWith({
        startDate: new Date("2024-01-01"),
      });
    });

    it("should handle cell drag start without existing time entry", () => {
      const { result } = renderHook(() =>
        useDragAndDrop({
          scheduledDays,
          timesheet: mockTimesheet,
          callbacks: mockCallbacks,
        })
      );

      const testDate = new Date("2024-01-02");
      const cellId = `${testDate.toDateString()}-1-999`;

      act(() => {
        result.current.handleDragStart({
          active: { id: cellId }, // non-existent entry
        });
      });

      expect(result.current.activeId).toBe(cellId);
      expect(result.current.dragType).toBe("cell");
      expect(mockCallbacks.onDragStart).toHaveBeenCalledWith({
        startDate: new Date(testDate.toDateString()),
      });
    });

    it("should update dragged cells during cell drag move", () => {
      vi.mocked(dates.getDateRange).mockReturnValue([
        new Date("2024-01-01"),
        new Date("2024-01-02"),
        new Date("2024-01-03"),
      ]);

      const { result } = renderHook(() =>
        useDragAndDrop({
          scheduledDays,
          timesheet: mockTimesheet,
          callbacks: mockCallbacks,
        })
      );

      const startCellId = `${new Date("2024-01-01").toDateString()}-1-100`;
      const targetCellId = `${new Date("2024-01-03").toDateString()}-1`;

      act(() => {
        result.current.handleDragStart({
          active: { id: startCellId },
        });
      });

      act(() => {
        result.current.handleDragMove({
          over: { id: targetCellId },
        });
      });

      expect(dates.getDateRange).toHaveBeenCalledWith(
        "2024-01-01",
        new Date("2024-01-03").toDateString()
      );
      expect(result.current.draggedOverCells).toEqual([
        new Date("2024-01-01"),
        new Date("2024-01-02"),
        new Date("2024-01-03"),
      ]);
    });

    it("should not update dragged cells when dragging to different task", () => {
      const { result } = renderHook(() =>
        useDragAndDrop({
          scheduledDays,
          timesheet: mockTimesheet,
          callbacks: mockCallbacks,
        })
      );

      const startCellId = `${new Date("2024-01-01").toDateString()}-1-100`;
      const differentTaskCellId = `${new Date("2024-01-03").toDateString()}-2`;

      act(() => {
        result.current.handleDragStart({
          active: { id: startCellId },
        });
      });

      const initialCells = result.current.draggedOverCells;

      act(() => {
        result.current.handleDragMove({
          over: { id: differentTaskCellId }, // Different task ID
        });
      });

      expect(result.current.draggedOverCells).toEqual(initialCells);
    });

    it("should call onTimeEntryDrag callback on drag end", () => {
      const { result } = renderHook(() =>
        useDragAndDrop({
          scheduledDays,
          timesheet: mockTimesheet,
          callbacks: mockCallbacks,
        })
      );

      const startCellId = `${new Date("2024-01-01").toDateString()}-1-100`;
      const targetCellId = `${new Date("2024-01-03").toDateString()}-1`;

      act(() => {
        result.current.handleDragStart({
          active: { id: startCellId },
        });
      });

      act(() => {
        result.current.handleDragEnd({
          over: { id: targetCellId },
        });
      });

      expect(mockCallbacks.onTimeEntryDrag).toHaveBeenCalledWith({
        task: mockTask,
        timeEntries: mockTimesheet.timeEntries,
        endDate: new Date(new Date("2024-01-03").toDateString()),
      });
    });

    it("should not call callback when dragging to different task", () => {
      const { result } = renderHook(() =>
        useDragAndDrop({
          scheduledDays,
          timesheet: mockTimesheet,
          callbacks: mockCallbacks,
        })
      );

      const startCellId = `${new Date("2024-01-01").toDateString()}-1-100`;
      const differentTaskCellId = `${new Date("2024-01-03").toDateString()}-2`;

      act(() => {
        result.current.handleDragStart({
          active: { id: startCellId },
        });
      });

      act(() => {
        result.current.handleDragEnd({
          over: { id: differentTaskCellId }, // Different task
        });
      });

      expect(mockCallbacks.onTimeEntryDrag).not.toHaveBeenCalled();
    });

    it("should reset state after cell drag end", () => {
      const { result } = renderHook(() =>
        useDragAndDrop({
          scheduledDays,
          timesheet: mockTimesheet,
          callbacks: mockCallbacks,
        })
      );

      const startCellId = `${new Date("2024-01-01").toDateString()}-1-100`;
      const targetCellId = `${new Date("2024-01-03").toDateString()}-1`;

      act(() => {
        result.current.handleDragStart({
          active: { id: startCellId },
        });
      });

      act(() => {
        result.current.handleDragEnd({
          over: { id: targetCellId },
        });
      });

      expect(result.current.activeId).toBeNull();
      expect(result.current.dragType).toBeNull();
      expect(result.current.draggedOverCells).toEqual([]);
    });
  });

  describe("drag cancellation", () => {
    it("should reset state when drag ends without over target", () => {
      const { result } = renderHook(() =>
        useDragAndDrop({
          scheduledDays,
          timesheet: mockTimesheet,
          callbacks: mockCallbacks,
        })
      );

      act(() => {
        result.current.handleDragStart({
          active: { id: "column-0" },
        });
      });

      act(() => {
        result.current.handleDragEnd({
          over: null,
        });
      });

      expect(result.current.activeId).toBeNull();
      expect(result.current.dragType).toBeNull();
      expect(result.current.draggedOverCells).toEqual([]);
      expect(mockCallbacks.onColumnDrag).not.toHaveBeenCalled();
    });

    it("should handle invalid active id gracefully", () => {
      const { result } = renderHook(() =>
        useDragAndDrop({
          scheduledDays,
          timesheet: mockTimesheet,
          callbacks: mockCallbacks,
        })
      );

      act(() => {
        result.current.handleDragStart({
          active: { id: "invalid-id" },
        });
      });

      expect(result.current.activeId).toBeNull();
      expect(result.current.dragType).toBeNull();
    });

    it("should not process drag move without active drag", () => {
      const { result } = renderHook(() =>
        useDragAndDrop({
          scheduledDays,
          timesheet: mockTimesheet,
          callbacks: mockCallbacks,
        })
      );

      act(() => {
        result.current.handleDragMove({
          over: { id: "column-2" },
        });
      });

      // Should remain in initial state
      expect(result.current.draggedOverCells).toEqual([]);
    });
  });

  describe("utility functions", () => {
    describe("isCellInDragRange", () => {
      it("should return true when cell is in drag range", () => {
        vi.mocked(dates.getDateRange).mockReturnValue([
          new Date("2024-01-01"),
          new Date("2024-01-02"),
        ]);

        const { result } = renderHook(() =>
          useDragAndDrop({
            scheduledDays,
            timesheet: mockTimesheet,
            callbacks: mockCallbacks,
          })
        );

        const startCellId = `${new Date("2024-01-01").toDateString()}-1-100`;
        const targetCellId = `${new Date("2024-01-02").toDateString()}-1`;

        act(() => {
          result.current.handleDragStart({
            active: { id: startCellId },
          });
        });

        act(() => {
          result.current.handleDragMove({
            over: { id: targetCellId },
          });
        });

        expect(
          result.current.isCellInDragRange(new Date("2024-01-01"), 1)
        ).toBe(true);
        expect(
          result.current.isCellInDragRange(new Date("2024-01-02"), 1)
        ).toBe(true);
      });

      it("should return false when cell is not in drag range", () => {
        const { result } = renderHook(() =>
          useDragAndDrop({
            scheduledDays,
            timesheet: mockTimesheet,
            callbacks: mockCallbacks,
          })
        );

        const startCellId = `${new Date("2024-01-01").toDateString()}-1-100`;

        act(() => {
          result.current.handleDragStart({
            active: { id: startCellId },
          });
        });

        expect(
          result.current.isCellInDragRange(new Date("2024-01-05"), 1)
        ).toBe(false);
      });

      it("should return false when task id does not match", () => {
        const { result } = renderHook(() =>
          useDragAndDrop({
            scheduledDays,
            timesheet: mockTimesheet,
            callbacks: mockCallbacks,
          })
        );

        const startCellId = `${new Date("2024-01-01").toDateString()}-1-100`;

        act(() => {
          result.current.handleDragStart({
            active: { id: startCellId },
          });
        });

        expect(
          result.current.isCellInDragRange(new Date("2024-01-01"), 2)
        ).toBe(false);
      });
    });

    describe("isColumnActive", () => {
      it("should return true when column is active", () => {
        const { result } = renderHook(() =>
          useDragAndDrop({
            scheduledDays,
            timesheet: mockTimesheet,
            callbacks: mockCallbacks,
          })
        );

        act(() => {
          result.current.handleDragStart({
            active: { id: "column-2" },
          });
        });

        expect(result.current.isColumnActive(2)).toBe(true);
        expect(result.current.isColumnActive(1)).toBe(false);
      });

      it("should return false when no column is active", () => {
        const { result } = renderHook(() =>
          useDragAndDrop({
            scheduledDays,
            timesheet: mockTimesheet,
            callbacks: mockCallbacks,
          })
        );

        expect(result.current.isColumnActive(0)).toBe(false);
      });
    });

    describe("isColumnHighlighted", () => {
      it("should return true when column is highlighted during column drag", () => {
        const { result } = renderHook(() =>
          useDragAndDrop({
            scheduledDays,
            timesheet: mockTimesheet,
            callbacks: mockCallbacks,
          })
        );

        act(() => {
          result.current.handleDragStart({
            active: { id: "column-1" },
          });
        });

        act(() => {
          result.current.handleDragMove({
            over: { id: "column-3" },
          });
        });

        expect(result.current.isColumnHighlighted(1)).toBe(true);
        expect(result.current.isColumnHighlighted(2)).toBe(true);
        expect(result.current.isColumnHighlighted(3)).toBe(true);
        expect(result.current.isColumnHighlighted(0)).toBe(false);
        expect(result.current.isColumnHighlighted(4)).toBe(false);
      });

      it("should return false when drag type is not column", () => {
        const { result } = renderHook(() =>
          useDragAndDrop({
            scheduledDays,
            timesheet: mockTimesheet,
            callbacks: mockCallbacks,
          })
        );

        const startCellId = `${new Date("2024-01-01").toDateString()}-1-100`;

        act(() => {
          result.current.handleDragStart({
            active: { id: startCellId },
          });
        });

        expect(result.current.isColumnHighlighted(0)).toBe(false);
      });
    });

    describe("resetDragState", () => {
      it("should reset all drag state", () => {
        const { result } = renderHook(() =>
          useDragAndDrop({
            scheduledDays,
            timesheet: mockTimesheet,
            callbacks: mockCallbacks,
          })
        );

        act(() => {
          result.current.handleDragStart({
            active: { id: "column-0" },
          });
        });

        expect(result.current.activeId).not.toBeNull();

        act(() => {
          result.current.resetDragState();
        });

        expect(result.current.activeId).toBeNull();
        expect(result.current.dragType).toBeNull();
        expect(result.current.draggedOverCells).toEqual([]);
      });
    });
  });

  describe("edge cases", () => {
    it("should handle empty timesheet tasks", () => {
      const emptyTimesheet = {
        ...mockTimesheet,
        tasks: [],
      };

      const { result } = renderHook(() =>
        useDragAndDrop({
          scheduledDays,
          timesheet: emptyTimesheet,
          callbacks: mockCallbacks,
        })
      );

      act(() => {
        result.current.handleDragStart({
          active: { id: "column-0" },
        });
      });

      act(() => {
        result.current.handleDragEnd({
          over: { id: "column-2" },
        });
      });

      expect(mockCallbacks.onColumnDrag).not.toHaveBeenCalled();
    });

    it("should handle missing time entries", () => {
      const timesheetNoEntries = {
        ...mockTimesheet,
        timeEntries: [],
      };

      const { result } = renderHook(() =>
        useDragAndDrop({
          scheduledDays,
          timesheet: timesheetNoEntries,
          callbacks: mockCallbacks,
        })
      );

      const startCellId = `${new Date("2024-01-01").toDateString()}-1-100`;
      const targetCellId = `${new Date("2024-01-03").toDateString()}-1`;

      act(() => {
        result.current.handleDragStart({
          active: { id: startCellId },
        });
      });

      act(() => {
        result.current.handleDragEnd({
          over: { id: targetCellId },
        });
      });

      expect(mockCallbacks.onTimeEntryDrag).toHaveBeenCalledWith({
        task: mockTask,
        timeEntries: [],
        endDate: new Date(new Date("2024-01-03").toDateString()),
      });
    });

    it("should handle column drag move to non-column target", () => {
      const { result } = renderHook(() =>
        useDragAndDrop({
          scheduledDays,
          timesheet: mockTimesheet,
          callbacks: mockCallbacks,
        })
      );

      act(() => {
        result.current.handleDragStart({
          active: { id: "column-0" },
        });
      });

      const initialCells = result.current.draggedOverCells;

      act(() => {
        result.current.handleDragMove({
          over: { id: "some-other-target" },
        });
      });

      // Should not change the dragged cells
      expect(result.current.draggedOverCells).toEqual(initialCells);
    });

    it("should handle cell drag move with empty dragged cells", () => {
      const { result } = renderHook(() =>
        useDragAndDrop({
          scheduledDays,
          timesheet: mockTimesheet,
          callbacks: mockCallbacks,
        })
      );

      const startCellId = `${new Date("2024-01-01").toDateString()}-1-100`;
      const targetCellId = `${new Date("2024-01-03").toDateString()}-1`;

      // Manually set dragType without proper initialization
      act(() => {
        result.current.handleDragStart({
          active: { id: startCellId },
        });
      });

      // Clear draggedOverCells to simulate edge case
      act(() => {
        result.current.resetDragState();
      });

      act(() => {
        result.current.handleDragMove({
          over: { id: targetCellId },
        });
      });

      // Should handle gracefully
      expect(result.current.draggedOverCells).toEqual([]);
    });
  });
});
