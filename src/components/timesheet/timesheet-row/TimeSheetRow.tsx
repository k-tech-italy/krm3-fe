import React, { useEffect, useMemo } from "react";
import { SpecialDayCell } from "./SpecialDayCell";
import { TaskHeader } from "./TaskCell";
import { TimeEntryCell } from "./TimeEntryCell";
import { getPastelColor } from "../utils";
import { Task, TimeEntry } from "../../../restapi/types";
import { useColumnViewPreference } from "../../../hooks/commons";

export interface TimeSheetRowProps {
  scheduleDays: Date[];
  task: Task;
  isMonthView: boolean;
  isColumnView: boolean;
  isCellInDragRange: (day: Date, taskId: number) => boolean;
  isColumnHighlighted: (dayIndex: number) => boolean;
  isHoliday: (day: Date) => boolean;
  isSickDay: (day: Date) => boolean;
  isTaskFinished: (currentDay: Date, task: Task) => boolean | undefined;
  getTimeEntriesForTaskAndDay: (taskId: number, day: Date) => TimeEntry[];
  openTimeEntryModalHandler: (task: Task, day: Date) => void;
}

export const TimeSheetRow: React.FC<TimeSheetRowProps> = ({
  scheduleDays,
  task,
  isMonthView,
  isColumnView, // Kept for future use
  isCellInDragRange,
  isColumnHighlighted,
  isHoliday,
  isSickDay,
  isTaskFinished,
  getTimeEntriesForTaskAndDay,
  openTimeEntryModalHandler,
}) => {
  // Generate color once per task row
  const { backgroundColor, borderColor } = useMemo(
    () => getPastelColor(task.id),
    []
  );

  const borderColorClass = isColumnView
    ? "border-l-[var(--border-color)]"
    : "border-b-[var(--border-color)]";

  const renderDayCell = (day: Date, dayIndex: number) => {
    const type = isHoliday(day)
      ? "holiday"
      : isSickDay(day)
      ? "sick"
      : isTaskFinished(day, task)
      ? "finished"
      : "task";
    const timeEntries = getTimeEntriesForTaskAndDay(task.id, day);
    return (
      <TimeEntryCell
        key={dayIndex}
        day={day}
        taskId={task.id}
        type={type}
        timeEntries={timeEntries}
        isMonthView={isMonthView}
        isColumnView={isColumnView}
        isColumnHighlighted={isColumnHighlighted(dayIndex)}
        isInDragRange={isCellInDragRange(day, task.id)}
        colors={{ backgroundColor, borderColor }}
        onClick={() => openTimeEntryModalHandler(task, day)}
      />
    );
  };

  return (
    <React.Fragment key={task.id}>
      <div
        style={
          {
            "--border-color": borderColor,
            backgroundColor,
          } as React.CSSProperties
        }
        className={`${borderColorClass} ${
          isColumnView ? "border-l-3" : "border-b-3"
        }`}
      >
        <TaskHeader task={task} isMonthView={isMonthView} />
      </div>
      <div
        style={
          {
            "--border-color": borderColor,
            backgroundColor,
          } as React.CSSProperties
        }
        className={`p-2 ${borderColorClass} ${
          isColumnView ? "border-l-3" : "border-b-3"
        } ${isMonthView ? "text-[10px]" : ""}`}
      >
        0h
      </div>
      {scheduleDays.map((day, dayIndex) => renderDayCell(day, dayIndex))}
    </React.Fragment>
  );
};
