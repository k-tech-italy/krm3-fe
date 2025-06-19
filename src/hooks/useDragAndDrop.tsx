import { useState } from "react";
import {
  formatDate,
  getDateRange,
  normalizeDate,
} from "../components/timesheet/utils/dates";
import { TimeEntry, Task, Timesheet } from "../restapi/types";

export interface DragData {
  timeEntry?: TimeEntry;
  taskId?: number;
  startDate?: string;
  columnDay?: Date;
  draggedOverColumns?: string[];
}

export interface DragCallbacks {
  onTimeEntryDrag: (params: {
    task: Task;
    timeEntries: TimeEntry[];
    endDate: Date;
  }) => void;
  onColumnDrag: (params: {
    task: Task;
    timeEntries: TimeEntry[];
    endDate: Date;
  }) => void;
  onDragStart: (params: { startDate: Date }) => void;
}

export interface UseDragAndDropProps {
  scheduleDays: Date[];
  timesheet: Timesheet;
  callbacks: DragCallbacks;
}
/**
 * Provides state and functions for managing drag-and-drop operations.
 *
 * @remarks
 * This hook is used in the Timesheet component to handle drag-and-drop
 * operations. It provides state and functions for managing the drag state,
 * and for handling the different types of drag operations (cell or column).
 *
 * The hook takes the following props:
 *   - `scheduleDays`: an array of dates representing the schedule
 *   - `timesheet`: an object representing the timesheet
 *   - `callbacks`: an object with callback functions for drag and drop events
 *
 * The hook returns an object with the following properties:
 *   - `activeId`: a string representing the currently active cell or column
 *   - `draggedOverCells`: an array of dates representing the cells currently
 *     being dragged over
 *   - `dragType`: a string representing the type of drag operation (cell or column)
 *   - `handleDragStart`: a function to handle the start of a drag operation
 *   - `handleDragMove`: a function to handle the movement of a drag operation
 *   - `handleDragEnd`: a function to handle the end of a drag operation
 *   - `isCellInDragRange`: a function to check if a cell is in the drag range
 *   - `isColumnActive`: a function to check if a column is active
 *   - `isColumnHighlighted`: a function to check if a column is highlighted
 *   - `resetDragState`: a function to reset the drag state
 */
export function useDragAndDrop({
  scheduleDays,
  timesheet,
  callbacks,
}: UseDragAndDropProps) {
  // State management
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeDragData, setActiveDragData] = useState<DragData | null>(null);
  const [draggedOverCells, setDraggedOverCells] = useState<Date[]>([]);
  const [dragType, setDragType] = useState<"cell" | "column" | null>(null);
  const [highlightedColumnIndexes, setHighlightedColumnIndexes] = useState<
    number[]
  >([]);
  const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(
    null
  );

  // Helper functions
  const resetDragState = () => {
    setActiveId(null);
    setActiveDragData(null);
    setDraggedOverCells([]);
    setDragType(null);
    setDraggedColumnIndex(null);
    setHighlightedColumnIndexes([]);
  };

  /**
   * Parses the given activeId string to determine the type of drag operation and its associated data.
   *
   * @param {string} activeId - The ID representing the current active item being dragged.
   * @returns {Object|null} An object containing the type of drag operation and relevant information:
   *   - If the ID starts with "column-", returns an object with type "column" and the dayIndex.
   *   - If the ID has two parts separated by "-", returns an object with type "timeEntry", entryId, and taskId.
   *   - If the ID has three parts separated by "-", returns an object with type "emptyCell", date, and taskId.
   *   - Returns null if the ID does not match any expected format.
   */

  const parseActiveId = (activeId: string) => {
    if (activeId.startsWith("column-")) {
      return {
        type: "column" as const,
        dayIndex: Number(activeId.replace("column-", "")),
      };
    }

    const parts = activeId.split("-");
    if (parts.length === 3) {
      // TimeEntry drag: date-taskId-entryId
      // Empty cell drag: date-taskId-undefined
      return {
        date: parts[0],
        taskId: Number(parts[1]),
        entryId: Number(parts[2]),
      };
    }
    return null;
  };

  /**
   * Finds a time entry in the timesheet by entryId and taskId.
   *
   * @param {number} entryId - The ID of the time entry to find.
   * @param {number} taskId - The ID of the task associated with the time entry.
   * @returns {TimeEntry | undefined} The matching TimeEntry object, or undefined if not found.
   */
  const findTimeEntry = (
    entryId: number,
    taskId: number
  ): TimeEntry | undefined => {
    // Search for the time entry in the timesheet's timeEntries array
    return timesheet?.timeEntries?.find(
      (entry: TimeEntry) => entry.id === entryId && entry.task === taskId
    );
  };

  const handleColumnDragStart = (dayIndex: number) => {
    const columnDay = scheduleDays[dayIndex];

    setActiveDragData({ columnDay });
    setDragType("column");
    setDraggedColumnIndex(dayIndex);
    setHighlightedColumnIndexes([dayIndex]);
    setDraggedOverCells([columnDay]);

    // Notify parent component about start date
    callbacks.onDragStart({ startDate: columnDay });
  };

  const handleCellDragStart = (parsedId: any) => {
    let dragData: DragData = {};
    let startDate = "";
    

    const timeEntry = findTimeEntry(parsedId.entryId, parsedId.taskId);
    if (timeEntry) {
      startDate = timeEntry.date;
      dragData = {
        timeEntry,
        taskId: parsedId.taskId,
        startDate,
      };
    } else {
      startDate = parsedId.date;
      dragData = {
        taskId: parsedId.taskId,
        startDate,
      };
    }

    setActiveDragData(dragData);
    setDragType("cell");
    setDraggedOverCells([new Date(startDate)]);

    // Notify parent component about start date
    callbacks.onDragStart({ startDate: new Date(startDate) });

    return true;
  };

  // Main drag handlers
  const handleDragStart = (event: any) => {
    const { active } = event;
    const parsedId = parseActiveId(active.id);

    if (!parsedId) return;

    setActiveId(active.id);

    if (parsedId.type === "column") {
      handleColumnDragStart(parsedId.dayIndex);
    } else {
      const success = handleCellDragStart(parsedId);
      if (!success) {
        resetDragState();
      }
    }
  };

  const handleDragMove = (event: any) => {
    const { over } = event;
    if (!over || !activeDragData) return;

    if (dragType === "column") {
      handleColumnDragMove(over);
    } else {
      handleCellDragMove(over);
    }
  };

  const handleColumnDragMove = (over: any) => {
    if (!over.id.startsWith("column-") || draggedColumnIndex === null) return;

    const targetIndex = Number(over.id.replace("column-", ""));
    const start = Math.min(draggedColumnIndex, targetIndex);
    const end = Math.max(draggedColumnIndex, targetIndex);

    const daysToHighlight = [];
    const columnsToHighlight = [];

    for (let i = start; i <= end; i++) {
      daysToHighlight.push(scheduleDays[i]);
      columnsToHighlight.push(i);
    }

    setHighlightedColumnIndexes(columnsToHighlight);
    setDraggedOverCells(daysToHighlight);
  };

  const handleCellDragMove = (over: any) => {
    const [targetDate, targetTaskId] = over.id.split("-");

    if (
      !activeDragData?.taskId ||
      Number(targetTaskId) !== activeDragData.taskId
    ) {
      return;
    }

    const startDate = activeDragData.startDate;
    if (!startDate) return;

    const allDays =
      new Date(startDate) <= new Date(targetDate)
        ? getDateRange(startDate, targetDate)
        : getDateRange(targetDate, startDate);

    setDraggedOverCells(allDays);
  };

  const handleDragEnd = (event: any) => {
    const { over } = event;

    if (!over || !activeDragData || !timesheet) {
      resetDragState();
      return;
    }

    try {
      if (dragType === "column") {
        handleColumnDragEnd(over);
      } else {
        handleCellDragEnd(over);
      }
    } finally {
      resetDragState();
    }
  };

  const handleColumnDragEnd = (over: any) => {
    if (!over.id.startsWith("column-") || !activeDragData?.columnDay) return;

    const targetDayIndex = Number(over.id.replace("column-", ""));
    const targetDay = normalizeDate(scheduleDays[targetDayIndex]);

    if (!timesheet.tasks?.length) return;

    // const filteredCells = draggedOverCells.filter((day) => {
    //   const hasTimeEntry = timesheet.timeEntries?.some(
    //     (entry: TimeEntry) => normalizeDate(entry.date) === normalizeDate(day)
    //   );
    //   return !isHoliday(day) && !hasTimeEntry;
    // });

    callbacks.onColumnDrag({
      task: timesheet.tasks[0],
      timeEntries: timesheet.timeEntries || [],
      endDate: formatDate(targetDay),
    });
  };

  const handleCellDragEnd = (over: any) => {
    const [targetDate, targetTaskId] = over.id.split("-");

    if (
      !activeDragData?.taskId ||
      Number(targetTaskId) !== activeDragData.taskId
    ) {
      return;
    }

    const task = timesheet.tasks?.find(
      (t: Task) => t.id === activeDragData.taskId
    );
    if (!task || !activeDragData.startDate) return;

    // const filteredCells = draggedOverCells.filter(
    //   (day) => !isHoliday(day) && !isSickday(day)
    // );
    callbacks.onTimeEntryDrag({
      task,
      timeEntries: timesheet.timeEntries || [],
      endDate: formatDate(targetDate),
    });
  };

  // Utility functions for component
  const isCellInDragRange = (day: Date, taskId: number): boolean => {
    return (
      activeDragData?.taskId === taskId &&
      draggedOverCells.some(
        (draggedDay) => draggedDay.toDateString() === day.toDateString()
      )
    );
  };

  const isColumnActive = (dayIndex: number): boolean => {
    return activeId === `column-${dayIndex}`;
  };

  const isColumnHighlighted = (dayIndex: number): boolean => {
    return dragType === "column" && highlightedColumnIndexes.includes(dayIndex);
  };

  return {
    // State
    activeId,
    draggedOverCells,
    dragType,

    // Handlers
    handleDragStart,
    handleDragMove,
    handleDragEnd,

    // Utility functions
    isCellInDragRange,
    isColumnActive,
    isColumnHighlighted,

    // Reset function (useful for cleanup)
    resetDragState,
  };
}
