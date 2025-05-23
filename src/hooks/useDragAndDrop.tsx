import { useState } from "react";
import {
  formatDate,
  getDateRange,
  normalizeDate,
} from "../components/timesheet/utils/dates";
import { TimeEntry, Task } from "../restapi/types";
import { format } from "path";

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
  timesheet: any; // Replace with proper timesheet type
  isHoliday: (day: Date) => boolean;
  isSickday: (day: Date) => boolean;
  callbacks: DragCallbacks;
}

export function useDragAndDrop({
  scheduleDays,
  timesheet,
  isHoliday,
  isSickday,
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

  const parseActiveId = (activeId: string) => {
    if (activeId.startsWith("column-")) {
      return {
        type: "column" as const,
        dayIndex: Number(activeId.replace("column-", "")),
      };
    }

    const parts = activeId.split("-");
    if (parts.length === 2) {
      // TimeEntry drag: entryId-taskId
      return {
        type: "timeEntry" as const,
        entryId: Number(parts[0]),
        taskId: Number(parts[1]),
      };
    }

    if (parts.length === 3) {
      // Empty cell drag: date-taskId-empty
      return {
        type: "emptyCell" as const,
        date: parts[0],
        taskId: Number(parts[1]),
      };
    }

    return null;
  };

  const findTimeEntry = (
    entryId: number,
    taskId: number
  ): TimeEntry | undefined => {
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

    if (parsedId.type === "timeEntry") {
      const timeEntry = findTimeEntry(parsedId.entryId, parsedId.taskId);
      if (!timeEntry) return false;

      startDate = timeEntry.date;
      dragData = {
        timeEntry,
        taskId: parsedId.taskId,
        startDate,
      };
    } else if (parsedId.type === "emptyCell") {
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

    const filteredCells = draggedOverCells.filter((day) => {
      const hasTimeEntry = timesheet.timeEntries?.some(
        (entry: TimeEntry) => normalizeDate(entry.date) === normalizeDate(day)
      );
      return !isHoliday(day) && !hasTimeEntry;
    });

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
