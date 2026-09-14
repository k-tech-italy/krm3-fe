import React, { useMemo } from "react";
import { Plane } from "lucide-react";
import { Tooltip } from "react-tooltip";

import { Task, TaskEntry, TaskEntryCellType, Timesheet } from "../../../restapi/types";
import { normalizeDate } from "../utils/dates";
import { getTaskColor } from "../utils/utils";
import { ShortHoursMenu } from "./ShortHoursMenu";
import { TaskHeader } from "./TaskCell";
import { TaskEntryCell } from "./TaskEntryCell";

export interface TimeSheetRowProps {
  timesheet: Timesheet;
  index: number;
  scheduledDays: Date[];
  task: Task;
  isMonthView: boolean;
  isColumnView: boolean;
  isCellInDragRange: (day: Date, taskId: number) => boolean;
  isColumnHighlighted: (dayIndex: number) => boolean;
  openTaskEntryModal: (task: Task) => void;
  openShortMenu?: {
    startDate: string;
    endDate: string;
    taskId: string;
  };
  setOpenShortMenu?: (
    value:
      | {
          startDate: string;
          endDate: string;
          taskId: string;
        }
      | undefined
  ) => void;
  readOnly: boolean;
  selectedResourceId: number | null;
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
  openTaskEntryModal,
  openShortMenu,
  setOpenShortMenu,
  readOnly,
  selectedResourceId,
  selectedWeekdays,
}) => {
  const { backgroundColor, borderColor } = useMemo(
    () => getTaskColor(index, task.color),
    [index, task.color]
  );

  const schedule = timesheet.schedule ?? {};
  const dayEntries = timesheet.dayEntries ?? [];

  const taskEntries = timesheet.taskEntries?.filter((entry) => entry.task === task.id) ?? [];

  const getDayEntry = (day: Date | string) => {
    const formattedDay = normalizeDate(day);

    return dayEntries.find((entry) => normalizeDate(entry.day) === formattedDay);
  };

  const getTaskEntry = (day: Date | string): TaskEntry | undefined => {
    const dayEntry = getDayEntry(day);

    if (!dayEntry) return undefined;

    return taskEntries.find((entry) => entry.dayEntry === dayEntry.id);
  };

  const isTaskFinished = (currentDay: Date): boolean => {
    const currentDate = normalizeDate(currentDay);
    const startDate = normalizeDate(task.startDate);
    const endDate = task.endDate ? normalizeDate(task.endDate) : undefined;

    return currentDate < startDate || Boolean(endDate && currentDate >= endDate);
  };

  const totalHours = taskEntries.reduce(
    (total, entry) =>
      total +
      (Number(entry.dayShiftHours) || 0) +
      (Number(entry.nightShiftHours) || 0) +
      (Number(entry.travelHours) || 0),
    0
  );

  const borderColorClass = isColumnView
    ? "border-l-[var(--border-color)]"
    : "border-b-[var(--border-color)]";

  const renderDayCell = (day: Date, dayIndex: number) => {
    const formattedDay = normalizeDate(day);
    const dayEntry = getDayEntry(day);
    const taskEntry = getTaskEntry(day);

    const isLockedDay = dayEntry?.closed ?? false;

    const isNoWorkDay = (schedule[formattedDay] ?? 0) === 0;

    const type: TaskEntryCellType =
      dayEntry?.askedHoliday || dayEntry?.isHoliday
        ? TaskEntryCellType.HOLIDAY
        : dayEntry?.isSick
          ? TaskEntryCellType.SICK
          : isTaskFinished(day)
            ? TaskEntryCellType.FINISHED
            : isLockedDay
              ? TaskEntryCellType.CLOSED
              : TaskEntryCellType.TASK;

    const isInSelectedWeekdays =
      isMonthView ||
      Boolean(selectedWeekdays?.some((selectedDay) => normalizeDate(selectedDay) === formattedDay));

    return (
      <div key={formattedDay} className="w-full h-full cursor-pointer relative">
        {openShortMenu && (
          <ShortHoursMenu
            dayToOpen={day}
            taskId={task.id}
            openShortMenu={openShortMenu}
            setOpenShortMenu={setOpenShortMenu}
            openTaskEntryModal={() => openTaskEntryModal(task)}
            readOnly={readOnly}
            selectedResourceId={selectedResourceId}
            taskEntries={taskEntries}
            dayEntries={dayEntries}
            schedule={schedule}
          />
        )}

        <TaskEntryCell
          day={day}
          taskId={task.id}
          taskEntry={taskEntry}
          type={type}
          isMonthView={isMonthView}
          isColumnView={isColumnView}
          isColumnHighlighted={isColumnHighlighted(dayIndex)}
          isInDragRange={isCellInDragRange(day, task.id)}
          colors={{
            backgroundColor,
            borderColor,
          }}
          readOnly={readOnly}
          isNoWorkDay={isNoWorkDay}
          isLockedDay={isLockedDay}
          isInSelectedWeekdays={isInSelectedWeekdays}
        />
      </div>
    );
  };

  const getTaskEntryDate = (taskEntry: TaskEntry): string | undefined =>
    dayEntries.find((entry) => entry.id === taskEntry.dayEntry)?.day;

  const travelEntries = taskEntries.filter((entry) => Number(entry.travelHours) > 0);

  return (
    <React.Fragment>
      <TaskHeader
        isColumnView={isColumnView}
        colors={{
          backgroundColor,
          borderColor,
        }}
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
          className={`font-semibold flex flex-row justify-start ${
            isMonthView ? "text-[10px] ml-[14px]" : "ml-[20px]"
          }`}
        >
          {totalHours}

          <span className={`mx-1 ${isMonthView ? "w-[14px]" : "w-[20px]"}`}>
            {travelEntries.length > 0 && (
              <>
                <Plane size={isMonthView ? 14 : 20} data-tooltip-id={`plane-tooltip-${task.id}`} />

                <Tooltip id={`plane-tooltip-${task.id}`} place="top" style={{ zIndex: 9999 }}>
                  <div className="text-sm space-y-1">
                    {travelEntries.map((entry) => (
                      <div key={entry.id}>
                        <span>{getTaskEntryDate(entry) ?? "Data sconosciuta"}:</span>{" "}
                        {Number(entry.travelHours)}h
                      </div>
                    ))}
                  </div>
                </Tooltip>
              </>
            )}
          </span>
        </p>
      </div>

      {scheduledDays.map((day, dayIndex) => renderDayCell(day, dayIndex))}
    </React.Fragment>
  );
};
