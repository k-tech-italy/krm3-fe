import { useState, useRef } from "react";
import type { UniqueIdentifier } from "@dnd-kit/core";
import { getDateRange } from "../components/timesheet/utils/dates";
import { Task, TaskEntry, Timesheet } from "../restapi/types";

export interface DragData {
  taskEntry?: TaskEntry;
  taskId?: number;
  startDate?: string;
  columnDay?: Date;
}

export interface DragCallbacks {
  onTaskEntryDrag: (params: { task: Task; endDate: Date }) => void;

  onColumnDrag: (params: { startDate: Date; endDate: Date }) => void;

  onDragStart: (params: { startDate: Date }) => void;
}

export interface UseDragAndDropProps {
  scheduledDays: Date[];
  timesheet: Timesheet;
  callbacks: DragCallbacks;
}

type ParsedDragId =
  | { type: "column"; dayIndex: number }
  | { type: "cell"; date: string; taskId: number; entryId: number };

type DragStartEventData = { active: { id: UniqueIdentifier } };
type DragEventData = { over: { id: UniqueIdentifier } | null };
type DragOverData = NonNullable<DragEventData["over"]>;

/**
 * Minimal, performant drag-and-drop hook for timesheet.
 * Only keeps state that must trigger a re-render.
 * Uses refs for transient drag data.
 */
export function useDragAndDrop({ scheduledDays, timesheet, callbacks }: UseDragAndDropProps) {
  // State for UI
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragType, setDragType] = useState<"cell" | "column" | null>(null);
  const [draggedOverCells, setDraggedOverCells] = useState<Date[]>([]);

  // Refs for transient drag data
  const activeDragData = useRef<DragData | null>(null);
  const draggedColumnIndex = useRef<number | null>(null);

  // Parse drag id (column or cell)
  const parseActiveId = (activeId: string): ParsedDragId | null => {
    if (activeId.startsWith("column-")) {
      return {
        type: "column" as const,
        dayIndex: Number(activeId.replace("column-", "")),
      };
    }
    const parts = activeId.split("-");
    if (parts.length === 3) {
      return {
        type: "cell",
        date: parts[0],
        taskId: Number(parts[1]),
        entryId: Number(parts[2]),
      };
    }
    return null;
  };

  // Find a task entry by entryId and taskId
  const findTaskEntry = (entryId: number, taskId: number): TaskEntry | undefined =>
    timesheet.taskEntries?.find((entry) => entry.id === entryId && entry.task === taskId);

  // Reset all drag state
  const resetDragState = () => {
    setActiveId(null);
    setDragType(null);
    setDraggedOverCells([]);
    activeDragData.current = null;
    draggedColumnIndex.current = null;
  };

  // --- Drag Start ---
  const handleColumnDragStart = (dayIndex: number) => {
    const columnDay = scheduledDays[dayIndex];
    activeDragData.current = { columnDay };
    setDragType("column");
    draggedColumnIndex.current = dayIndex;
    setDraggedOverCells([columnDay]);
    callbacks.onDragStart({ startDate: columnDay });
  };

  const handleCellDragStart = (parsedId: Extract<ParsedDragId, { type: "cell" }>) => {
    const taskEntry = findTaskEntry(parsedId.entryId, parsedId.taskId);

    const dayEntry = taskEntry
      ? timesheet.dayEntries?.find((entry) => entry.id === taskEntry.dayEntry)
      : undefined;

    const startDate = dayEntry?.day ?? parsedId.date;

    const dragData: DragData = {
      taskEntry,
      taskId: parsedId.taskId,
      startDate,
    };

    activeDragData.current = dragData;
    setDragType("cell");
    setDraggedOverCells([new Date(startDate)]);
    callbacks.onDragStart({ startDate: new Date(startDate) });

    return true;
  };

  // --- Main Drag Handlers ---
  const handleDragStart = (event: DragStartEventData) => {
    const { active } = event;
    const parsedId = parseActiveId(String(active.id));
    if (!parsedId) return;
    setActiveId(String(active.id));
    if (parsedId.type === "column") {
      handleColumnDragStart(parsedId.dayIndex);
    } else if (!handleCellDragStart(parsedId)) resetDragState();
  };

  const handleDragMove = (event: DragEventData) => {
    const { over } = event;
    if (!over || !activeDragData.current) return;
    if (dragType === "column") {
      handleColumnDragMove(over);
    } else {
      handleCellDragMove(over);
    }
  };

  // --- Drag Move Logic ---
  const handleColumnDragMove = (over: DragOverData) => {
    const overId = String(over.id);
    if (!overId.startsWith("column-") || draggedColumnIndex.current === null) return;
    const targetIndex = Number(overId.replace("column-", ""));
    const start = Math.min(draggedColumnIndex.current, targetIndex);
    const end = Math.max(draggedColumnIndex.current, targetIndex);
    const daysToHighlight = scheduledDays.slice(start, end + 1);
    setDraggedOverCells(daysToHighlight);
  };

  const handleCellDragMove = (over: DragOverData) => {
    const [targetDate, targetTaskId] = String(over.id).split("-");
    if (draggedOverCells.length === 0) {
      return;
    }

    if (!activeDragData.current?.taskId || Number(targetTaskId) !== activeDragData.current.taskId)
      return;
    const startDate = activeDragData.current.startDate;
    if (!startDate) return;
    const allDays = getDateRange(startDate, targetDate);
    setDraggedOverCells(allDays);
  };

  // --- Drag End ---
  const handleDragEnd = (event: DragEventData) => {
    const { over } = event;
    if (!over || !activeDragData.current || !timesheet) {
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

  const handleColumnDragEnd = (over: DragOverData) => {
    const overId = String(over.id);
    if (!overId.startsWith("column-") || !activeDragData.current?.columnDay) return;
    const targetDayIndex = Number(overId.replace("column-", ""));
    const targetDay = scheduledDays[targetDayIndex];
    callbacks.onColumnDrag({
      startDate: activeDragData.current.columnDay,
      endDate: targetDay,
    });
  };

  const handleCellDragEnd = (over: DragOverData) => {
    const [targetDate, targetTaskId] = String(over.id).split("-");
    const dragData = activeDragData.current;
    if (!dragData?.taskId || Number(targetTaskId) !== dragData.taskId) return;
    const task = timesheet.tasks?.find((t: Task) => t.id === dragData.taskId);
    if (!task || !dragData.startDate) return;
    callbacks.onTaskEntryDrag({
      task,
      endDate: new Date(targetDate),
    });
  };

  // --- Utilities for UI ---
  const isCellInDragRange = (day: Date, taskId: number): boolean => {
    return (
      !!activeDragData.current?.taskId &&
      activeDragData.current.taskId === taskId &&
      draggedOverCells.some((draggedDay) => draggedDay.toDateString() === day.toDateString())
    );
  };

  const isColumnActive = (dayIndex: number): boolean => activeId === `column-${dayIndex}`;
  const isColumnHighlighted = (dayIndex: number): boolean => {
    // A column is highlighted if its day is in draggedOverCells
    return (
      dragType === "column" &&
      draggedOverCells.some((day) => scheduledDays[dayIndex].toDateString() === day.toDateString())
    );
  };

  return {
    activeId,
    draggedOverCells,
    dragType,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    isCellInDragRange,
    isColumnActive,
    isColumnHighlighted,
    resetDragState,
  };
}
