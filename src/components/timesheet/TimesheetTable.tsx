import { useEffect, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  DayEntry,
  Task,
  Schedule,
  TaskEntry,
  Days,
  Timesheet,
  WeekRange,
  DayType,
} from "../../restapi/types";
import { useGetTimesheet } from "../../hooks/useTimesheet";
import { TimeSheetRow } from "./timesheet-row/TimeSheetRow";
import { formatDate, getDatesBetween, getFilteredWeekDates, normalizeDate } from "./utils/dates";
import LoadSpinner from "../commons/LoadSpinner";
import { DragCallbacks, useDragAndDrop } from "../../hooks/useDragAndDrop";
import { getDayType, isHoliday, isSickDay } from "./utils/entryUtils";
import TimeSheetHeaders from "./timesheet-headers/TimeSheetHeaders";

interface Props {
  setIsEntryModalOpen: (open: boolean) => void;
  setSelectedTask: (task: Task) => void;
  setIsDayEntry: (isDayEntry: boolean) => void;
  setStartDate: (date: Date) => void;
  setEndDate: (date: Date) => void;
  setTaskEntries: (entries: TaskEntry[]) => void;
  setDayEntries: (entries: DayEntry[]) => void;
  setNoWorkingDay: (days: Days) => void;
  setSchedule: (schedule: Schedule) => void;
  scheduledDays: { days: Date[]; numberOfDays: number };
  isColumnView: boolean;
  startDate?: Date;
  selectedResourceId: number | null;
  readOnly: boolean;
  selectedWeekRange: WeekRange;
  setBankHours: (bankHours: number) => void;
}

function buildCalendarDays(timesheet: Timesheet): Days {
  const dates = Array.isArray(timesheet.days) ? timesheet.days : Object.keys(timesheet.days ?? {});

  return Object.fromEntries(
    dates.map((date) => {
      const normalizedDate = normalizeDate(date);
      const dayEntry = timesheet.dayEntries?.find(
        (entry) => normalizeDate(entry.day) === normalizedDate
      );
      const scheduledHours =
        timesheet.schedule?.[normalizedDate] ??
        timesheet.schedule?.[normalizedDate.replaceAll("-", "_")] ??
        0;

      return [
        normalizedDate,
        {
          closed: dayEntry?.closed ?? false,
          hol: Boolean(dayEntry?.isHoliday || dayEntry?.askedHoliday),
          nwd: Number(scheduledHours) === 0,
        },
      ];
    })
  );
}

export function TimeSheetTable(props: Readonly<Props>) {
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
      props.setNoWorkingDay(buildCalendarDays(timesheet));
    }
  }, [isLoadingTimesheet, timesheet, props.setNoWorkingDay]);
  useEffect(() => {
    props.setTaskEntries(timesheet?.taskEntries ?? []);
    props.setDayEntries(timesheet?.dayEntries ?? []);
    if (timesheet?.schedule) {
      props.setSchedule(timesheet.schedule);
      props.setBankHours(Number(timesheet.bankHours));
    }
  }, [timesheet]);

  const [openShortMenu, setOpenShortMenu] = useState<
    { startDate: string; endDate: string; taskId: string } | undefined
  >();

  /*handleOpenShortMenu is used by drag & drop which is not testable in unit test, but it's tested in integration tests*/
  function handleOpenShortMenu(endDate: Date, task: Task) {
    if (!timesheet || !props.startDate) return;
    const calendarDays = buildCalendarDays(timesheet);

    const isHolidayOrSickDay = getDatesBetween(props.startDate, endDate, calendarDays, false).every(
      (date) => {
        const dayEntries = timesheet.dayEntries ?? [];
        return isHoliday(date, dayEntries) || isSickDay(date, dayEntries);
      }
    );

    if (
      formatDate(endDate) >= formatDate(task.startDate) &&
      (task.endDate ? formatDate(endDate) <= formatDate(task.endDate) : true) &&
      getDayType(endDate, calendarDays) !== DayType.CLOSED_DAY &&
      !isHolidayOrSickDay
    ) {
      setOpenShortMenu({
        startDate: normalizeDate(props.startDate!),
        endDate: normalizeDate(endDate),
        taskId: task.id.toString(),
      });
    }
  }

  const openDayEntry = (startDate: Date, endDate: Date = startDate) => {
    props.setStartDate(startDate);
    props.setEndDate(endDate);
    if (timesheet) {
      props.setNoWorkingDay(buildCalendarDays(timesheet));
    }
    props.setIsDayEntry(true);
    props.setIsEntryModalOpen(true);
  };
  /*Drag and drop is not testable in unit test, but it's tested in integration tests*/
  // Drag and drop callbacks
  const dragCallbacks: DragCallbacks = {
    onColumnDrag: ({ startDate, endDate }) => {
      if (!timesheet) return;

      openDayEntry(startDate, endDate);
    },

    onTaskEntryDrag: ({ task, endDate }) => {
      props.setSelectedTask(task);
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
    return <LoadSpinner data-testid="load-spinner-icon" />;
  }

  if (!timesheet) {
    return (
      <div id="no-data-timesheet-table" className="flex items-center justify-center w-full">
        <h3>No Data</h3>
      </div>
    );
  }
  const openTaskEntryModal = (task: Task) => {
    props.setSelectedTask(task);
    props.setNoWorkingDay(buildCalendarDays(timesheet));
    props.setIsDayEntry(false);
    props.setIsEntryModalOpen(true);
  };

  return (
    <div className="flex-col">
      <div className="max-w-200 text-muted mb-1">
        <p className="mt-4">
          Clicking and holding a cell or a column to drag it. Drop it in the desired position to
          place your hours.
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
          className={`grid gap-0 ${props.isColumnView ? "max-w-200" : ""}`}
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
            className={`flex items-center bg-table-header border-b-2 border-app p-2 font-semibold ${
              isMonthView ? "text-xs" : "text-sm"
            }  ${props.isColumnView ? "justify-center" : "justify-between"}
            col-span-1`}
          >
            <div>Task</div>
          </div>

          <div
            className={`flex justify-center items-center bg-table-header border-b-2 border-app p-2 font-semibold  ${
              isMonthView ? "text-xs" : "text-sm"
            }
            ${isMonthView && !props.isColumnView ? "justify-center" : "justify-between"}
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
            onHeaderClick={(day) => openDayEntry(day)}
          />

          {/* Tasks */}
          {!timesheet?.tasks || timesheet.tasks.length === 0 ? (
            <div className="bg-table-row-alt p-2 text-muted">No tasks available</div>
          ) : (
            timesheet.tasks.map((task, index) => (
              <TimeSheetRow
                timesheet={timesheet}
                index={index}
                key={task.id}
                task={task}
                scheduledDays={props.scheduledDays.days}
                isMonthView={isMonthView}
                isCellInDragRange={isCellInDragRange}
                isColumnHighlighted={isColumnHighlighted}
                isColumnView={props.isColumnView}
                openTaskEntryModal={openTaskEntryModal}
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
