import React, { useMemo } from "react";
import { TaskHeader } from "./TaskCell";
import { TimeEntryCell } from "./TimeEntryCell";
import { getPastelColor, normalizeDate } from "../utils";
import { Task, TimeEntry } from "../../../restapi/types";
import { useCreateTimeEntry } from "../../../hooks/timesheet";

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
  openTimeEntryModalHandler: (task: Task) => void;
  openShortMenu?: {selectedCells: Date[]; day: string; taskId: string };
  setOpenShortMenu?: (
    value: {selectedCells: Date[]; day: string; taskId: string } | undefined
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
    () => getPastelColor(task.id),
    [task.id]
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
        0h
      </div>
      {scheduleDays.map((day, dayIndex) => renderDayCell(day, dayIndex))}
    </React.Fragment>
  );
};

const ShortHoursMenu = (props: {
  day: Date;
  taskId: number;
  openShortMenu: {selectedCells: Date[]; day: string; taskId: string } | undefined;
  setOpenShortMenu?: (
    value: {selectedCells: Date[]; day: string; taskId: string } | undefined
  ) => void;
  openTimeEntryModalHandler: () => void;
}) => {
  const isTooltipVisible =
    !!props.openShortMenu &&
    normalizeDate(props.openShortMenu.day) === normalizeDate(props.day) &&
    Number(props.openShortMenu.taskId) === props.taskId;
  const { mutate: createTimeEntries } = useCreateTimeEntry();

  const selectedCells = (props.openShortMenu?.selectedCells || []).map(
    (date) => normalizeDate(date)
  )

  const options = [
    { label: "2h", value: 2 },
    { label: "4h", value: 4 },
    { label: "8h", value: 8 },
    { label: "More", value: 99 },
  ];

  function handleButtonClick(value: number) {
    //DO THE API CALL
    if (value === 99) {
      props.openTimeEntryModalHandler();
    } else {
      createTimeEntries({
        dates: selectedCells,
        taskId: props.taskId,
        dayShiftHours: value,
      });
    }
    props.setOpenShortMenu?.(undefined);
  }
  return (
    <div
      onMouseLeave={() => props.setOpenShortMenu?.(undefined)}
      className={`absolute  z-50 left-0 mt-2 w-56 origin-top-right bg-white  divide-y divide-gray-100 rounded-md shadow  focus:outline-none  transition-all duration-200 ease-out transform ${
        isTooltipVisible
          ? "opacity-100 scale-100"
          : "opacity-0 scale-95 pointer-events-none"
      }`}
    >
      {isTooltipVisible && (
        <div className="flex flex-col gap-2">
          {options.map(({ label: option, value }) => (
            <button
              key={value}
              onClick={() => handleButtonClick(value)}
              className="px-4 py-2"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
