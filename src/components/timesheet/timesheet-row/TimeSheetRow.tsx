import React, { useMemo } from "react";
import { TaskHeader } from "./TaskCell";
import { TimeEntryCell } from "./TimeEntryCell";
import { getTaskColor } from "../utils/utils";
import {
  getTimeEntriesForTaskAndDay,
  isHoliday,
  isSickDay,
} from "../utils/timeEntry";
import { Task, TimeEntryType, Timesheet } from "../../../restapi/types";
import { ShortHoursMenu } from "./ShortHoursMenu";
import { normalizeDate } from "../utils/dates";
import { getDayType } from "../utils/timeEntry";
import { DayType } from "../../../restapi/types";

export interface TimeSheetRowProps {
  timesheet: Timesheet;
  index: number;
  scheduledDays: Date[];
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
  holidayOrSickDays: String[];
  selectedWeekdays?: Date[];
}

export const TimeSheetRow: React.FC<TimeSheetRowProps> = ({
  timesheet,
  index,
  scheduledDays,
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
  holidayOrSickDays,
  selectedWeekdays,
}) => {
  // Generate color once per task row
  const { backgroundColor, borderColor } = useMemo(
    () => getTaskColor(index, task.color),
    [task.id]
  );
  const timeEntries = getTimeEntriesForTaskAndDay(task.id, timesheet);

  const lockedDays = scheduledDays.filter((day) => {
    return getDayType(day, timesheet.days) === DayType.CLOSED_DAY;
  });

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

  const renderDayCell = (day: Date, dayIndex: number, lockedDays: Date[]) => {
    const timeEntry = timeEntries.find(
      (entry) => normalizeDate(entry.date) === normalizeDate(day)
    );
    const isNoWorkDay = getDayType(day, timesheet.days);

    const isLockedDay = lockedDays.some(
      (lockedDay) => normalizeDate(lockedDay) === normalizeDate(day)
    );

    const type: TimeEntryType = isHoliday(day, timesheet.timeEntries)
      ? TimeEntryType.HOLIDAY
      : isSickDay(day, timesheet.timeEntries)
      ? TimeEntryType.SICK
      : isTaskFinished(day, task)
      ? TimeEntryType.FINISHED
      : isLockedDay
      ? TimeEntryType.CLOSED
      : TimeEntryType.TASK;

    return (
      <div key={dayIndex} className="w-full h-full cursor-pointer relative">
        {openShortMenu && (
          <ShortHoursMenu
            holidayOrSickDays={holidayOrSickDays}
            days={timesheet.days}
            dayToOpen={day}
            taskId={task.id}
            key={dayIndex}
            openShortMenu={openShortMenu}
            setOpenShortMenu={setOpenShortMenu}
            openTimeEntryModalHandler={() => openTimeEntryModalHandler(task)}
            readOnly={readOnly}
            selectedResourceId={selectedResourceId}
            timeEntries={timesheet.timeEntries.filter(
              (timeEntry) => timeEntry.task === task.id
            )}
          />
        )}
        <TimeEntryCell
          isLockedDay={isLockedDay}
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
          isNoWorkDay={isNoWorkDay !== DayType.WORK_DAY}
          isInSelectedWeekdays={
            isMonthView ||
            (!!selectedWeekdays &&
              !!selectedWeekdays.find(
                (d) => normalizeDate(d) === normalizeDate(day)
              ))
          }
        />
      </div>
    );
  };
  return (
    <React.Fragment key={task.id}>
      <TaskHeader
        isColumnView={isColumnView}
        colors={{ backgroundColor, borderColor }}
        task={task}
        isMonthView={isMonthView}
      />
      <div
        style={
          {
            "--border-color": borderColor,
            backgroundColor,
          } as React.CSSProperties
        }
        className={`flex items-center justify-center text-center ${borderColorClass} ${
          isColumnView ? "border-l-3" : "border-b-3"
        }`}
      >
        <p
          className={`font-semibold
        ${isMonthView ? "text-[10px] " : ""}`}
        >
          {totalHours}
        </p>
      </div>
      {scheduledDays.map((day, dayIndex) =>
        renderDayCell(day, dayIndex, lockedDays)
      )}
    </React.Fragment>
  );
};
