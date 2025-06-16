import { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { TimeEntry, Task, Timesheet, Days } from "../../restapi/types";
import { Draggable } from "./Draggable";
import { useGetTimesheet } from "../../hooks/useTimesheet";
import { Droppable } from "./Droppable";
import { TotalHourCell } from "./TotalHour";
import { TimeSheetRow } from "./timesheet-row/TimeSheetRow";
import {
  formatDate,
  formatDay,
  formatDayOfWeek,
  normalizeDate,
} from "./utils/dates";
import { DayType } from "../../restapi/types";
import { getDayType } from "./utils/timeEntry";
import LoadSpinner from "../commons/LoadSpinner";
import { DragCallbacks, useDragAndDrop } from "../../hooks/useDragAndDrop";
import { getHolidayAndSickDays } from "./utils/utils";

interface Props {
  setOpenTimeEntryModal: (open: boolean) => void;
  setSelectedTask: (task: Task) => void;
  setIsDayEntry: (isDayEntry: boolean) => void;
  setStartDate: (date: Date) => void;
  setEndDate: (date: Date) => void;
  setTimeEntries: (entries: TimeEntry[]) => void;
  setNoWorkingDay: (days: Days) => void;
  scheduledDays: { days: Date[]; numberOfDays: number };
  isColumnView: boolean;
  startDate?: Date;
  endDate?: Date;
  selectedResourceId: number | null;
  readOnly: boolean;
}

export function TimeSheetTable(props: Props) {
  const isMonthView = props.scheduledDays.numberOfDays > 7;
  const startScheduled = normalizeDate(props.scheduledDays.days[0]);
  const endScheduled = normalizeDate(
    props.scheduledDays.days[props.scheduledDays.numberOfDays - 1]
  );

  const { data: timesheet, isLoading: isLoadingTimesheet } = useGetTimesheet(
    startScheduled,
    endScheduled,
    props.selectedResourceId
  );

  const [openShortMenu, setOpenShortMenu] = useState<
    { startDate: string; endDate: string; taskId: string } | undefined
  >();

  // Drag and drop callbacks
  const dragCallbacks: DragCallbacks = {
    onColumnDrag: ({ task, timeEntries, endDate }) => {
      if (!timesheet) return;
      props.setSelectedTask(task);
      props.setTimeEntries(timeEntries);
      props.setNoWorkingDay(timesheet.days);
      props.setEndDate(endDate);
      if (getDayType(endDate, timesheet.days) === DayType.WORK_DAY) {
        props.setOpenTimeEntryModal(true);
        props.setIsDayEntry(true);
      }
    },
    onTimeEntryDrag: ({ task, timeEntries, endDate }) => {
      props.setSelectedTask(task);
      props.setTimeEntries(timeEntries);
      props.setEndDate(endDate);
      props.setIsDayEntry(false);
      if (
        endDate >= formatDate(task.startDate) &&
        (!!task.endDate ? endDate <= formatDate(task.endDate) : true)
      ) {
        setOpenShortMenu({
          startDate: normalizeDate(props.startDate!),
          endDate: normalizeDate(endDate),
          taskId: task.id.toString(),
        });
      }
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
    scheduleDays: props.scheduledDays.days,
    timesheet: timesheet!, //TODO: Remove !
    callbacks: dragCallbacks,
  });

  // Loading and error states
  if (isLoadingTimesheet) {
    return <LoadSpinner />;
  }

  if (!timesheet) {
    return (
      <div
        id="no-data-timesheet-table"
        className="flex items-center justify-center w-full"
      >
        <h3>No Data</h3>
      </div>
    );
  }
  const holidayOrSickDays = getHolidayAndSickDays(
    timesheet?.timeEntries,
    props.scheduledDays.days
  );
  const openTimeEntryModalHandler = (task: Task) => {
    props.setSelectedTask(task);
    props.setTimeEntries(timesheet.timeEntries);
    props.setNoWorkingDay(timesheet.days);
    props.setOpenTimeEntryModal(true);
  };

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
              : `160px repeat(${props.scheduledDays.numberOfDays + 1}, 1fr)`,
            gridTemplateRows: props.isColumnView
              ? `repeat(${props.scheduledDays.numberOfDays + 2}, auto)`
              : undefined,
            gridAutoFlow: props.isColumnView ? "column" : "row",
          }}
        >
          {/* Table Headers */}
          <div
            id="table-header"
            className={`flex justify-between items-center bg-gray-100 border-b-2 border-gray-300 p-2 font-semibold ${
              isMonthView ? "text-xs" : "text-sm"
            } col-span-1`}
          >
            <div>Task</div>
          </div>

          <div
            className={`flex  items-center bg-gray-100 border-b-2 border-gray-300 p-2 font-semibold ${
              isMonthView ? "text-xs" : "text-sm"
            }
            ${
              isMonthView && !props.isColumnView
                ? "justify-center"
                : "justify-between"
            }
             col-span-1`}
          >
            {isMonthView && !props.isColumnView ? "H" : "Hours"}
          </div>

          {/* Day Headers */}
          {props.scheduledDays.days.map((day, index) => (
            <Droppable key={index} id={`column-${index}`}>
              <Draggable id={`column-${index}`}>
                <div
                  className={`h-full w-fullitems-center ${
                    props.isColumnView
                      ? "flex justify-between py-2"
                      : "flex-col "
                  } bg-gray-100 font-semibold ${
                    isMonthView ? "text-xs p-1" : "text-sm p-2"
                  } text-center cursor-grab
                  ${isColumnActive(index) ? "bg-blue-200" : ""}
                  ${
                    isColumnHighlighted(index)
                      ? "bg-blue-100 border-b-2 border-blue-400"
                      : "border-b-2 border-gray-300 hover:border-blue-400"
                  }
                  ${
                    getDayType(day, timesheet.days) !== DayType.WORK_DAY
                      ? "bg-zinc-200 cursor-not-allowed"
                      : ""
                  }
                  `}
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
                      isNoWorkDay={
                        getDayType(day, timesheet.days) !== DayType.WORK_DAY
                      }
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
                holidayOrSickDays={holidayOrSickDays}
                timesheet={timesheet}
                index={index}
                key={task.id}
                task={task}
                scheduleDays={props.scheduledDays.days}
                isMonthView={isMonthView}
                isCellInDragRange={isCellInDragRange}
                isColumnHighlighted={isColumnHighlighted}
                isColumnView={props.isColumnView}
                openTimeEntryModalHandler={openTimeEntryModalHandler}
                openShortMenu={openShortMenu}
                setOpenShortMenu={setOpenShortMenu}
                readOnly={props.readOnly}
                selectedResourceId={props.selectedResourceId}
              />
            ))
          )}
        </div>
      </DndContext>
    </div>
  );
}
