import React, { useMemo } from "react";
import { TaskHeader } from "./TaskCell";
import { TimeEntryCell } from "./TimeEntryCell";
import {
  getTaskColor,
  getTimeEntriesForTaskAndDay,
  isHoliday,
  isSickDay,
} from "../utils/utils";
import { Task, TimeEntry, Timesheet } from "../../../restapi/types";
import { ShortHoursMenu } from "./ShortHoursMenu";
import { normalizeDate } from "../utils/dates";

export interface TimeSheetRowProps {
  timesheet: Timesheet;
  index: number;
  scheduleDays: Date[];
  task: Task;
  isMonthView: boolean;
  isColumnView: boolean;
  isCellInDragRange: (day: Date, taskId: number) => boolean;
  isColumnHighlighted: (dayIndex: number) => boolean;
  openTimeEntryModalHandler: (task: Task) => void;
  openShortMenu?: { startDate: string; endDate: string; taskId: string };
  setOpenShortMenu?: (
    value: { startDate: string; endDate: string; taskId: string } | undefined
  ) => void;
  readOnly: boolean;
  selectedResourceId: number | null;
}

export const TimeSheetRow: React.FC<TimeSheetRowProps> = ({
  timesheet,
  index,
  scheduleDays,
  task,
  isMonthView,
  isColumnView,
  isCellInDragRange,
  isColumnHighlighted,
  openTimeEntryModalHandler,
  openShortMenu,
  setOpenShortMenu,
  readOnly,
  selectedResourceId,
}) => {
  // Generate color once per task row
  const { backgroundColor, borderColor } = useMemo(
    () => getTaskColor(index, task.color),
    [task.id]
  );
  const timeEntries = getTimeEntriesForTaskAndDay(task.id, timesheet);

  const isTaskFinished = (currentDay: Date, task: Task): boolean => {
    const currentDateString = normalizeDate(currentDay);
    const startDateString = normalizeDate(task.startDate);
    const endDateString = task.endDate ? normalizeDate(task.endDate) : null;

    return (
      currentDateString < startDateString ||
      (endDateString !== null && currentDateString > endDateString)
    );
  };

  const totalHours = timeEntries.reduce(
    (total, entry) =>
      total +
      Number(entry.dayShiftHours) +
      Number(entry.nightShiftHours) +
      Number(entry.restHours),
    0
  );

  const borderColorClass = isColumnView
    ? "border-l-[var(--border-color)]"
    : "border-b-[var(--border-color)]";

  const renderDayCell = (day: Date, dayIndex: number) => {
    const type = isHoliday(day, timesheet)
      ? "holiday"
      : isSickDay(day, timesheet)
      ? "sick"
      : isTaskFinished(day, task)
      ? "finished"
      : "task";

    const timeEntry = timeEntries.find(
      (entry) => normalizeDate(entry.date) === normalizeDate(day)
    );

    return (
      <div key={dayIndex} className="w-full h-full">
        <div className="w-full h-full cursor-pointer relative">
          <ShortHoursMenu
            day={day}
            taskId={task.id}
            key={dayIndex}
            openShortMenu={openShortMenu}
            setOpenShortMenu={setOpenShortMenu}
            openTimeEntryModalHandler={() => openTimeEntryModalHandler(task)}
            readOnly={readOnly}
            selectedResourceId={selectedResourceId}
            timeEntries={timeEntries}
          />
          <TimeEntryCell
            day={day}
            taskId={task.id}
            type={type}
            timeEntry={timeEntry}
            isMonthView={isMonthView}
            isColumnView={isColumnView}
            isColumnHighlighted={isColumnHighlighted(dayIndex)}
            isInDragRange={isCellInDragRange(day, task.id)}
            colors={{ backgroundColor, borderColor }}
            readOnly={readOnly}
          />
        </div>
      </div>
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
        } ${isMonthView ? "text-[10px] text-center" : ""}`}
      >
        {totalHours}
      </div>
      {scheduleDays.map((day, dayIndex) => renderDayCell(day, dayIndex))}
    </React.Fragment>
  );
};
