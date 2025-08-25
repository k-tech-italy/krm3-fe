import React, { useMemo } from "react";
import { TaskHeader } from "./TaskCell";
import { TimeEntryCell } from "./TimeEntryCell";
import { getTaskColor } from "../utils/utils";
import { isNonWorkingDay } from "../utils/timeEntry";
import {
  getTimeEntriesForTaskAndDay, isClosed,
  isHoliday,
  isSickDay,
} from "../utils/timeEntry";
import {Schedule, Task, TimeEntryType, Timesheet} from "../../../restapi/types";
import { ShortHoursMenu } from "./ShortHoursMenu";
import { normalizeDate } from "../utils/dates";
import { getDayType } from "../utils/timeEntry";
import { DayType } from "../../../restapi/types";
import {Plane} from "lucide-react";
import {Tooltip} from "react-tooltip";

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
  schedule: Schedule;
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
  schedule
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
      Number(entry.restHours) +
      Number(entry.travelHours),
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
          schedule={schedule}
          isColumnHighlighted={isColumnHighlighted(dayIndex)}
          isInDragRange={isCellInDragRange(day, task.id)}
          colors={{ backgroundColor, borderColor }}
          readOnly={readOnly}
          isNoWorkDay={isNonWorkingDay(day, timesheet.days)}
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
          className={`font-semibold flex flex-row justify-start
          
        ${isMonthView ? "text-[10px] ml-[14px]" : "ml-[20px]"}`}
        >
          {totalHours}

          <span className={`mx-1 ${isMonthView ? "w-[14px]" : "w-[20px]"}`}>
            {timeEntries.some(entry => entry.travelHours > 0) && (
                <>
                  <Plane
                      size={isMonthView ? 14 : 20}
                      data-tooltip-id={`plane-tooltip-${task.id}`}
                  />
                  <Tooltip id={`plane-tooltip-${task.id}`} place="top" style={{ zIndex: 9999 }}>
                    <div className="text-sm space-y-1">
                      {timeEntries
                          .filter(entry => entry.travelHours > 0)
                          .map(entry => (
                              <div key={entry.id}>
                                <span>{entry.date}:</span> {entry.travelHours}h
                              </div>
                          ))}
                    </div>
                  </Tooltip>
                </>
            )}
          </span>
        </p>
      </div>
      {scheduledDays.map((day, dayIndex) =>
          renderDayCell(day, dayIndex, lockedDays)
      )}
    </React.Fragment>
  );
};
