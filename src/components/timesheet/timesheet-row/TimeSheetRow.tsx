import React, { useMemo } from "react";
import { TaskHeader } from "./TaskCell";
import { TimeEntryCell } from "./TimeEntryCell";
import { displayErrorMessage, getPastelColor, normalizeDate } from "../utils";
import { Task, TimeEntry } from "../../../restapi/types";
import { useCreateTimeEntry } from "../../../hooks/timesheet";
import { toast, ToastContainer } from "react-toastify";
import { ShortHoursMenu } from "./ShortHoursMenu";

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
  getTimeEntriesForTaskAndDay: (taskId: number, day?: Date) => TimeEntry[];
  openTimeEntryModalHandler: (task: Task) => void;
  openShortMenu?: { selectedCells: Date[]; day: string; taskId: string };
  setOpenShortMenu?: (
    value: { selectedCells: Date[]; day: string; taskId: string } | undefined
  ) => void;
}

export const TimeSheetRow: React.FC<TimeSheetRowProps> = ({
  scheduleDays,
  task,
  isMonthView,
  isColumnView,
  isCellInDragRange,
  isColumnHighlighted,
  isHoliday,
  isSickDay,
  isTaskFinished,
  getTimeEntriesForTaskAndDay,
  openTimeEntryModalHandler,
  openShortMenu,
  setOpenShortMenu,
}) => {
  // Generate color once per task row
  const { backgroundColor, borderColor } = useMemo(
    () => getPastelColor(task.color),
    [task.id]
  );

  const timeEntries = getTimeEntriesForTaskAndDay(task.id);

  const totalHours = timeEntries.reduce(
    (total, entry) => total + Number(entry.dayShiftHours) + Number(entry.nightShiftHours) + Number(entry.restHours),
    0
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
      <div key={dayIndex} className="w-full h-full">
        <div className="w-full h-full cursor-pointer relative">
          <ShortHoursMenu
            day={day}
            taskId={task.id}
            key={dayIndex}
            openShortMenu={openShortMenu}
            setOpenShortMenu={setOpenShortMenu}
            openTimeEntryModalHandler={() => openTimeEntryModalHandler(task)}
          />
          <TimeEntryCell
            day={day}
            taskId={task.id}
            type={type}
            timeEntries={timeEntries}
            isMonthView={isMonthView}
            isColumnView={isColumnView}
            isColumnHighlighted={isColumnHighlighted(dayIndex)}
            isInDragRange={isCellInDragRange(day, task.id)}
            colors={{ backgroundColor, borderColor }}
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
        } ${isMonthView ? "text-[10px]" : ""}`}
      >
       {totalHours}
      </div>
      {scheduleDays.map((day, dayIndex) => renderDayCell(day, dayIndex))}
    </React.Fragment>
  );
};


