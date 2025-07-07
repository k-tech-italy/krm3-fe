import { useEffect, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { TimeEntry, Task, Days } from "../../restapi/types";
import { useGetTimesheet } from "../../hooks/useTimesheet";
import { TimeSheetRow } from "./timesheet-row/TimeSheetRow";
import {
  formatDate,
  getDatesBetween,
  getFilteredWeekDates,
  normalizeDate,
} from "./utils/dates";
import LoadSpinner from "../commons/LoadSpinner";
import { DragCallbacks, useDragAndDrop } from "../../hooks/useDragAndDrop";
import { WeekRange } from "../../restapi/types";
import { DayType } from "../../restapi/types";
import { getDayType, isHoliday, isSickDay } from "./utils/timeEntry";
import { getHolidayAndSickDays } from "./utils/utils";
import TimeSheetHeaders from "./timesheet-headers/TimeSheetHeaders";

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
  selectedWeekRange: WeekRange;
}

export function TimeSheetTable(props: Props) {
  const isMonthView = props.scheduledDays.numberOfDays > 7;
  const startScheduled = normalizeDate(props.scheduledDays.days[0]);
  const endScheduled = normalizeDate(
    props.scheduledDays.days[props.scheduledDays.numberOfDays - 1]
  );
  const selectedWeekdays = getFilteredWeekDates(
    props.selectedWeekRange,
    isMonthView,
    props.scheduledDays.days
  );

  const { data: timesheet, isLoading: isLoadingTimesheet } = useGetTimesheet(
    startScheduled,
    endScheduled,
    props.selectedResourceId
  );

  useEffect(() => {
    if (!isLoadingTimesheet && timesheet) {
      props.setNoWorkingDay(timesheet.days);
    }
  }, [isLoadingTimesheet, timesheet, props.setNoWorkingDay]);

  const [openShortMenu, setOpenShortMenu] = useState<
    { startDate: string; endDate: string; taskId: string } | undefined
  >();

  function handleOpenShortMenu(endDate: Date, task: Task) {
    if (!timesheet || !props.startDate) return;

    const isHolidayOrSickDay = getDatesBetween(
      props.startDate,
      endDate,
      timesheet.days,
      false
    ).every((date) => {
      return (
        isHoliday(date, timesheet.timeEntries) ||
        isSickDay(date, timesheet.timeEntries)
      );
    });

    if (
      formatDate(endDate) >= formatDate(task.startDate) &&
      (!!task.endDate ? formatDate(endDate) <= formatDate(task.endDate) : true) &&
      getDayType(endDate, timesheet?.days) !== DayType.CLOSED_DAY &&
      !isHolidayOrSickDay
    ) {
      setOpenShortMenu({
        startDate: normalizeDate(props.startDate!),
        endDate: normalizeDate(endDate),
        taskId: task.id.toString(),
      });
    }
  }

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
      handleOpenShortMenu(endDate, task);
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
    scheduledDays: props.scheduledDays.days,
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
          <TimeSheetHeaders
            timesheet={timesheet}
            scheduledDays={props.scheduledDays}
            isColumnView={props.isColumnView}
            isMonthView={isMonthView}
            isColumnActive={isColumnActive}
            isColumnHighlighted={isColumnHighlighted}
            selectedWeekdays={selectedWeekdays}
          />

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
                scheduledDays={props.scheduledDays.days}
                isMonthView={isMonthView}
                isCellInDragRange={isCellInDragRange}
                isColumnHighlighted={isColumnHighlighted}
                isColumnView={props.isColumnView}
                openTimeEntryModalHandler={openTimeEntryModalHandler}
                openShortMenu={openShortMenu}
                setOpenShortMenu={setOpenShortMenu}
                readOnly={props.readOnly}
                selectedResourceId={props.selectedResourceId}
                selectedWeekdays={selectedWeekdays}
              />
            ))
          )}
        </div>
      </DndContext>
    </div>
  );
}
