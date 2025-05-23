import { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { TimeEntry, Task } from "../../restapi/types";
import { Draggable } from "./Draggable";
import { useGetTimesheet } from "../../hooks/timesheet";
import { Droppable } from "./Droppable";
import { TotalHourCell } from "./TotalHour";
import { TimeSheetRow } from "./timesheet-row/TimeSheetRow";
import {
  formatDate,
  formatDay,
  formatDayOfWeek,
  normalizeDate,
} from "./utils/dates";
import { isWeekendDay } from "./utils/dates";
import LoadSpinner from "../commons/LoadSpinner";
import { DragCallbacks, useDragAndDrop } from "../../hooks/useDragAndDrop";
import { format } from "path";

interface Props {
  setOpenTimeEntryModal: (open: boolean) => void;
  setSelectedTask: (task: Task) => void;
  setSelectedCells: (cells: Date[] | undefined) => void;
  setIsDayEntry: (isDayEntry: boolean) => void;
  setStartDate: (date: Date) => void;
  setEndDate: (date: Date) => void;
  setTimeEntries: (entries: TimeEntry[]) => void;
  scheduleDays: { days: Date[]; numberOfDays: number };
  isColumnView: boolean;
  startDate?: Date;
  endDate?: Date;
}

export function TimeSheetTable(props: Props) {
  const isMonthView = props.scheduleDays.numberOfDays > 7;
  const startScheduled = normalizeDate(props.scheduleDays.days[0]);
  const endScheduled = normalizeDate(
    props.scheduleDays.days[props.scheduleDays.numberOfDays - 1]
  );


  const { data: timesheet, isLoading: isLoadingTimesheet } = useGetTimesheet(
    startScheduled,
    endScheduled
  );

  const [openShortMenu, setOpenShortMenu] = useState<
    { startDate: string; endDate: string; taskId: string } | undefined
  >();

  // Helper functions
  const getTimeEntriesForTaskAndDay = (
    taskId: number,
    day?: Date
  ): TimeEntry[] => {
    if (!timesheet?.timeEntries) return [];
    if (!day) {
      return timesheet.timeEntries.filter((entry) => entry.task === taskId);
    }
    return timesheet.timeEntries.filter(
      (entry) =>
        entry.task === taskId &&
        normalizeDate(entry.date) === normalizeDate(day)
    );
  };

  const isHoliday = (day: Date): boolean => {
    return (
      timesheet?.timeEntries?.some((entry) => {
        if (!entry.holidayHours || entry.holidayHours <= 0) return false;
        const entryDate = new Date(entry.date);
        return entryDate.toDateString() === day.toDateString();
      }) ?? false
    );
  };

  const isSickday = (day: Date): boolean => {
    return (
      timesheet?.timeEntries?.some((entry) => {
        if (!entry.sickHours || entry.sickHours <= 0) return false;
        const entryDate = new Date(entry.date);
        return entryDate.toDateString() === day.toDateString();
      }) ?? false
    );
  };

  const openTimeEntryModalHandler = (task: Task) => {
    props.setSelectedTask(task);
    props.setTimeEntries(timesheet?.timeEntries || []);
    props.setOpenTimeEntryModal(true);
  };

  // Drag and drop callbacks
  const dragCallbacks: DragCallbacks = {
    onColumnDrag: ({ task, timeEntries, endDate }) => {
      props.setSelectedTask(task);
      props.setTimeEntries(timeEntries);

      props.setEndDate(endDate);
      props.setOpenTimeEntryModal(true);
      props.setIsDayEntry(true);
    },
    onTimeEntryDrag: ({ task, timeEntries, endDate }) => {
      props.setSelectedTask(task);
      props.setTimeEntries(timeEntries);
      props.setEndDate(endDate);
      props.setIsDayEntry(false);
      setOpenShortMenu({
        startDate: normalizeDate(props.startDate!),
        endDate: normalizeDate(endDate),
        taskId: task.id.toString(),
      });
    },
    onDragStart: ({ startDate }) => {
      props.setStartDate(formatDate(startDate));
    },
  };

  // Initialize drag and drop hook
  const {
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    isCellInDragRange,
    isColumnActive,
    isColumnHighlighted,
  } = useDragAndDrop({
    scheduleDays: props.scheduleDays.days,
    timesheet,
    isHoliday,
    isSickday,
    callbacks: dragCallbacks,
  });

  // Loading and error states
  if (isLoadingTimesheet) {
    return <LoadSpinner />;
  }

  if (!timesheet) {
    return (
      <div className="flex items-center justify-center w-full">
        <h3>No Data</h3>
      </div>
    );
  }

  return (
    <div className="flex-col">
      <div className="max-w-200 text-gray-500 mb-1">
        <p className="mt-4">
          Clicking and holding a cell or a column to drag it. Drop it in the
          desired position to place your hours.
        </p>
      </div>

      <DndContext
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        collisionDetection={closestCenter}
      >
        <div
          id="timesheet-table"
          className={`grid gap-0 ${props.isColumnView ? "max-w-[800px]" : ""}`}
          style={{
            gridTemplateColumns: props.isColumnView
              ? undefined
              : `160px repeat(${props.scheduleDays.numberOfDays + 1}, 1fr)`,
            gridTemplateRows: props.isColumnView
              ? `repeat(${props.scheduleDays.numberOfDays + 2}, auto)`
              : undefined,
            gridAutoFlow: props.isColumnView ? "column" : "row",
          }}
        >
          {/* Table Headers */}
          <div
            className={`flex justify-between items-center bg-gray-100 border-b-2 border-gray-300 p-2 font-semibold ${
              isMonthView ? "text-xs" : "text-sm"
            } col-span-1`}
          >
            <div>Task</div>
          </div>

          <div
            className={`flex justify-between items-center bg-gray-100 border-b-2 border-gray-300 p-2 font-semibold ${
              isMonthView ? "text-xs" : "text-sm"
            } col-span-1`}
          >
            {isMonthView && !props.isColumnView ? "H" : "Hours"}
          </div>

          {/* Day Headers */}
          {props.scheduleDays.days.map((day, index) => (
            <Droppable key={index} id={`column-${index}`}>
              <Draggable id={`column-${index}`}>
                <div
                  className={`h-full w-full ${
                    props.isColumnView
                      ? "flex justify-between items-center py-2"
                      : "flex-col items-center"
                  } bg-gray-100 font-semibold ${
                    isMonthView ? "text-xs p-1" : "text-sm p-2"
                  } text-center cursor-grab
                  ${isColumnActive(index) ? "bg-blue-200" : ""}
                  ${
                    isColumnHighlighted(index)
                      ? "bg-blue-100 border-b-2 border-blue-400"
                      : "border-b-2 border-gray-300 hover:border-blue-400"
                  }
                  ${isWeekendDay(day) ? "bg-zinc-200" : ""}`}
                >
                  <div className={`${isMonthView ? "text-[10px]" : "text-sm"}`}>
                    {isMonthView && !props.isColumnView
                      ? formatDay(day)
                      : formatDayOfWeek(day)}
                  </div>
                  <div
                    className={`bg-gray-100 font-semibold ${
                      isMonthView ? "text-[10px]" : "text-sm"
                    } text-center`}
                  >
                    <TotalHourCell
                      day={day}
                      timeEntries={timesheet?.timeEntries || []}
                      isMonthView={isMonthView}
                      isColumnView={props.isColumnView}
                    />
                  </div>
                </div>
              </Draggable>
            </Droppable>
          ))}

          {/* Tasks */}
          {!timesheet?.tasks || timesheet.tasks.length === 0 ? (
            <div className="bg-gray-50 p-2">No tasks available</div>
          ) : (
            timesheet.tasks.map((task, index) => (
              <TimeSheetRow
                index={index}
                key={task.id}
                task={task}
                scheduleDays={props.scheduleDays.days}
                isMonthView={isMonthView}
                isCellInDragRange={isCellInDragRange}
                isColumnHighlighted={isColumnHighlighted}
                isHoliday={isHoliday}
                isSickDay={isSickday}
                getTimeEntriesForTaskAndDay={getTimeEntriesForTaskAndDay}
                isColumnView={props.isColumnView}
                openTimeEntryModalHandler={openTimeEntryModalHandler}
                openShortMenu={openShortMenu}
                setOpenShortMenu={setOpenShortMenu}
              />
            ))
          )}
        </div>
      </DndContext>
    </div>
  );
}
