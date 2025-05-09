import React, { useMemo } from "react";
import { SpecialDayCell } from "./SpecialDayCell";
import { TaskHeader } from "./TaskCell";
import { TimeEntryCell } from "./TimeEntryCell";
import { generatePastelColor } from "../utils";
import { Task, TimeEntry } from "../../../restapi/types";

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
  openTimeEntryModalHandler
}) => {
  // Generate color once per task row
  const backgroundColor = useMemo(() => generatePastelColor(), []);

  /**
   * Renders the appropriate cell based on day type
   */
  const renderDayCell = (day: Date, dayIndex: number) => {
    // First check if it's a special day
    if (isHoliday(day)) {
      return (
        <SpecialDayCell
          key={dayIndex}
          day={day}
          taskId={task.id}
          type="holiday"
          isMonthView={isMonthView}
          isColumnHighlighted={isColumnHighlighted(dayIndex)}
          backgroundColor={backgroundColor}
        />
      );
    }
    
    if (isSickDay(day)) {
      return (
        <SpecialDayCell
          key={dayIndex}
          day={day}
          taskId={task.id}
          type="sick"
          isMonthView={isMonthView}
          isColumnHighlighted={isColumnHighlighted(dayIndex)}
          backgroundColor={backgroundColor}
        />
      );
    }
    
    if (isTaskFinished(day, task)) {
      return (
        <SpecialDayCell
          key={dayIndex}
          day={day}
          taskId={task.id}
          type="finished"
          isMonthView={isMonthView}
          isColumnHighlighted={isColumnHighlighted(dayIndex)} 
          backgroundColor={backgroundColor}
        />
      );
    }
    
    const timeEntries = getTimeEntriesForTaskAndDay(task.id, day);
    return (
      <TimeEntryCell
        key={dayIndex}
        day={day}
        taskId={task.id}
        timeEntries={timeEntries}
        isMonthView={isMonthView}
        isColumnHighlighted={isColumnHighlighted(dayIndex)}
        isInDragRange={isCellInDragRange(day, task.id)}
        backgroundColor={backgroundColor}
        onClick={() => openTimeEntryModalHandler(task, day)}
      />
    );
  };

  return (
    <React.Fragment key={task.id}>
      <TaskHeader 
        task={task} 
        isMonthView={isMonthView} 
        backgroundColor={backgroundColor}
      />
      {scheduleDays.map((day, dayIndex) => renderDayCell(day, dayIndex))}
    </React.Fragment>
  );
};