import { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { TimeEntry, Task } from "../../restapi/types";
import { Draggable } from "./Draggable";
import { useGetTimesheet } from "../../hooks/timesheet";
import { Droppable } from "./Droppable";
import { TotalHourCell } from "./TotalHour";
import { TimeSheetRow } from "./timesheet-row/TimeSheetRow";
import { getDaysBetween, isWeekendDay } from "./utils/dates";
import { formatDay, formatDayOfWeek, normalizeDate } from "./utils/dates";
import LoadSpinner from "../commons/LoadSpinner";

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
}

export function TimeSheetTable(props: Props) {
  const isMonthView = props.scheduleDays.numberOfDays > 7;
  const startDate = normalizeDate(props.scheduleDays.days[0]);
  const endDate = normalizeDate(
    props.scheduleDays.days[props.scheduleDays.numberOfDays - 1]
  );

  const { data: timesheet, isLoading: isLoadingTimesheet } = useGetTimesheet(
    startDate,
    endDate
  );

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeDragData, setActiveDragData] = useState<{
    timeEntry?: TimeEntry;
    taskId?: number;
    startDate?: string;
    columnDay?: Date;
    draggedOverColumns?: string[];
  } | null>(null);
  const [draggedOverCells, setDraggedOverCells] = useState<Date[]>([]);
  const [dragType, setDragType] = useState<"cell" | "column" | null>(null);
  const [highlightedColumnIndexes, setHighlightedColumnIndexes] = useState<
    number[]
  >([]);
  const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(
    null
  );
  const [openShortMenu, setOpenShortMenu] = useState<
    { selectedCells: Date[]; day: string; taskId: string } | undefined
  >();

  // Function to get time entries for a specific task and day
  const getTimeEntriesForTaskAndDay = (
    taskId: number,
    day?: Date
  ): TimeEntry[] => {
    if (!timesheet || !timesheet.timeEntries) return [];
    if (!day)
      return timesheet.timeEntries.filter((entry) => entry.task === taskId);
    return timesheet.timeEntries.filter(
      (entry) =>
        entry.task === taskId &&
        normalizeDate(entry.date) === normalizeDate(day)
    );
  };

  const isHoliday = (day: Date): boolean => {
    for (const entry of timesheet?.timeEntries || []) {
      if (entry.holidayHours && entry.holidayHours > 0) {
        const entryDate = new Date(entry.date);
        if (entryDate.toDateString() === day.toDateString()) {
          return true;
        }
      }
    }
    return false;
  };

  const isSickday = (day: Date): boolean => {
    for (const entry of timesheet?.timeEntries || []) {
      if (entry.sickHours && entry.sickHours > 0) {
        const entryDate = new Date(entry.date);
        if (entryDate.toDateString() === day.toDateString()) {
          return true;
        }
      }
    }
    return false;
  };

  //DRAG AND DROP IMPLEMENTATION
  function handleDragStart(event: any) {
    const { active } = event;
    let taskId: number;
    let date: string = "";
    setDragType("cell");

    // Check if this is a column header drag
    if (active.id.startsWith("column-")) {
      const dayIndex = Number(active.id.replace("column-", ""));
      const columnDay = props.scheduleDays.days[dayIndex];

      setActiveDragData({
        columnDay: columnDay,
      });
      setDragType("column");
      setActiveId(active.id);
      setDraggedColumnIndex(dayIndex);
      setHighlightedColumnIndexes([dayIndex]);
      setDraggedOverCells([columnDay]);
      props.setStartDate(new Date(columnDay));
      return;
    }

    // Check if this is a timeEntry drag or an empty cell drag
    if (active.id.includes("-")) {
      const parts = active.id.split("-");
      if (parts.length === 2) {
        // It's a timeEntry drag: entryId-taskId
        const [entryId, taskIdStr] = parts;
        taskId = Number(taskIdStr);

        // Find the timeEntry being dragged
        if (!timesheet) return;

        const timeEntry = timesheet.timeEntries.find(
          (entry) => entry.id === Number(entryId) && entry.task === taskId
        );

        if (!timeEntry) return;

        date = timeEntry.date;

        props.setStartDate(new Date(date));
        setActiveDragData({
          timeEntry,
          taskId,
          startDate: date,
        });
      } else if (parts.length === 3) {
        // It's an empty cell drag: date-taskId-empty
        date = parts[0];
        taskId = Number(parts[1]);
        props.setStartDate(new Date(date));
        setActiveDragData({
          taskId,
          startDate: date,
        });
      }
    }
    setActiveId(active.id);
    setDraggedOverCells([...draggedOverCells, new Date(date)]);
  }
  function handleDragEnd(event: any) {
    const { over, active } = event;
    if (over && activeDragData && timesheet) {
      if (dragType === "column") {
        // Handle column drag end
        if (over.id.startsWith("column-")) {
          const targetDayIndex = Number(over.id.replace("column-", ""));
          const targetDay = normalizeDate(
            props.scheduleDays.days[targetDayIndex]
          );
          props.setEndDate(new Date(targetDay));

          if (activeDragData.columnDay && targetDay) {
            if (timesheet.tasks && timesheet.tasks.length > 0) {
              // set task only for open modal
              props.setSelectedTask(timesheet.tasks[0]);

              props.setTimeEntries(timesheet.timeEntries);

              props.setSelectedCells(
                draggedOverCells.filter((day) => {
                  const hasTimeEntry = timesheet.timeEntries.some(
                    (entry) => normalizeDate(entry.date) === normalizeDate(day)
                  );
                  return !isHoliday(day) && !hasTimeEntry;
                })
              );

              props.setOpenTimeEntryModal(true);
              props.setIsDayEntry(true);
            }
          }
        }
      } else {
        const [targetDate, targetTaskId] = over.id.split("-");
        // TODO : Handle the case where the target is an n/a cell
        // NOW IT IS NOT POSSIBLE TO DRAG AND DROP TO N/A CELLS

        if (
          activeDragData.taskId &&
          Number(targetTaskId) === activeDragData.taskId
        ) {
          if (activeDragData.startDate) {
            const task = timesheet.tasks?.find(
              (t) => t.id === activeDragData.taskId
            );
            if (task) {
              props.setSelectedTask(task);
              props.setTimeEntries(timesheet.timeEntries);

              props.setSelectedCells(
                draggedOverCells.filter(
                  (day) => !isHoliday(day) && !isSickday(day)
                )
              );

              // props.setOpenTimeEntryModal(true);
              props.setEndDate(new Date(targetDate));
              setOpenShortMenu({
                selectedCells: draggedOverCells,
                day: targetDate,
                taskId: targetTaskId,
              });

              props.setIsDayEntry(false);
            }
          }
        }
      }
    }

    // Reset states
    setActiveId(null);
    setActiveDragData(null);
    setDraggedOverCells([]);
    setDragType(null);
    setDraggedColumnIndex(null);
    setHighlightedColumnIndexes([]);
  }

  function handleDragMove(event: any) {
    const { over } = event;

    if (over && activeDragData) {
      if (dragType === "column") {
        // Highlight column being dragged over
        if (over.id.startsWith("column-")) {
          const targetIndex = Number(over.id.replace("column-", ""));

          if (draggedColumnIndex !== null) {
            const start = Math.min(draggedColumnIndex, targetIndex);
            const end = Math.max(draggedColumnIndex, targetIndex);

            // Highlight all columns between the start and end indexes
            const daysToHighlight = [];
            const columnsToHighlight = [];
            for (let i = start; i <= end; i++) {
              daysToHighlight.push(props.scheduleDays.days[i]);
              columnsToHighlight.push(i);
            }

            setHighlightedColumnIndexes(columnsToHighlight);
            setDraggedOverCells(daysToHighlight);
          }
        }
        return;
      }

      // Handle existing cell drag move logic
      const [targetDate, targetTaskId] = over.id.split("-");
      // Only track if dragging over the same task
      if (
        activeDragData.taskId &&
        Number(targetTaskId) === activeDragData.taskId
      ) {
        const startDate = activeDragData.startDate;
        if (startDate) {
          // Sort dates to ensure they're in chronological order
          let allDays: Date[];
          if (new Date(startDate) <= new Date(targetDate)) {
            allDays = getDaysBetween(startDate, targetDate);
          } else {
            allDays = getDaysBetween(targetDate, startDate);
          }
          setDraggedOverCells(allDays);
        }
      }
    }
  }

  const isCellInDragRange = (day: Date, taskId: number) => {
    // Check if the cell is in the dragged range
    return (
      activeDragData?.taskId === taskId &&
      draggedOverCells.some((draggedDay) => {
        return draggedDay.toDateString() === day.toDateString();
      })
    );
  };

  const isColumnActive = (dayIndex: number) => {
    return activeId === `column-${dayIndex}`;
  };

  const isColumnHighlighted = (dayIndex: number) => {
    if (dragType !== "column") return false;
    return highlightedColumnIndexes.includes(dayIndex);
  };

  const openTimeEntryModalHandler = (task: Task) => {
    props.setSelectedTask(task);
    props.setTimeEntries(timesheet?.timeEntries || []);
    props.setOpenTimeEntryModal(true);
  };

  const isTaskNotInDate = (currentDay: Date, task: Task): boolean => {
    const currentDateString = normalizeDate(currentDay);
    const startDateString = normalizeDate(task.startDate);
    const endDateString = task.endDate ? normalizeDate(task.endDate) : null;

    return (
      currentDateString < startDateString ||
      (endDateString !== null && currentDateString > endDateString)
    );
  };

  if (isLoadingTimesheet) {
    return <LoadSpinner />;
  }
  if (!timesheet) {
    return (
      <div className="flex items-center justify-center w-full ">
        <h3>No Data </h3>
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
              : `160px repeat( ${props.scheduleDays.numberOfDays + 1}, 1fr)`,
            gridTemplateRows: props.isColumnView
              ? `repeat(${props.scheduleDays.numberOfDays + 2}, auto)`
              : undefined,
            gridAutoFlow: props.isColumnView ? "column" : "row",
          }}
        >
          <div
            // border-1 border-gray-300
            className={`flex justify-between items-center bg-gray-100 border-b-2 border-gray-300  p-2 font-semibold  ${
              isMonthView ? "text-xs" : "text-sm"
            } col-span-1`}
          >
            <div>Task</div>
          </div>
          <div
            // border-1 border-gray-300
            className={`flex justify-between items-center bg-gray-100 border-b-2 border-gray-300  p-2 font-semibold  ${
              isMonthView ? "text-xs" : "text-sm"
            } col-span-1`}
          >
            {isMonthView && !props.isColumnView ? "H" : "Hours"}
          </div>
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
                  } text-center 
                                        ${
                                          isColumnActive(index)
                                            ? "bg-blue-200"
                                            : ""
                                        }
                                        ${
                                          isColumnHighlighted(index)
                                            ? "bg-blue-100 border-b-2 border-blue-400"
                                            : "border-b-2 border-gray-300 hover:border-blue-400"
                                        } cursor-grab   ${
                    isWeekendDay(day) ? "bg-zinc-200" : ""
                  }`}
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
          {!timesheet?.tasks ||
            (timesheet.tasks.length === 0 && (
              <div className="bg-gray-50 p-2">No tasks available</div>
            ))}
          {timesheet?.tasks?.map((task, index) => (
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
              isTaskFinished={isTaskNotInDate}
              getTimeEntriesForTaskAndDay={getTimeEntriesForTaskAndDay}
              isColumnView={props.isColumnView}
              openTimeEntryModalHandler={openTimeEntryModalHandler}
              openShortMenu={openShortMenu}
              setOpenShortMenu={setOpenShortMenu}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
