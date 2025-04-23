import { useEffect, useState } from "react";
import { useMediaQuery } from "../../hooks/commons";
import { DndContext, DragOverlay, closestCenter } from "@dnd-kit/core";
import { TimeEntry, Task } from "../../restapi/types";
import { Draggable } from "./Draggable";
import { useGetTimesheet } from "../../hooks/timesheet"; // Changed hook name to match new structure
import { Droppable } from "./Droppable";
import { formatDate } from "./Krm3Calendar";
import { TotalHourCell } from "./TotalHour";
import { TimeSheetRow } from "./TimeSheetRow";
import { normalizeDate } from "./utils";

interface Props {
  setOpenTimeEntryModal: (open: boolean) => void;
  setSelectedTask: (task: Task) => void;
  setSelectedCells: (cells: Date[] | undefined) => void;
  setSkippedDays: (days: Date[]) => void;
  setIsDayEntry: (isDayEntry: boolean) => void;
  setStartDate: (date: Date) => void;
  setTimeEntries: (entries: TimeEntry[]) => void;
  scheduleDays: { days: Date[]; numberOfDays: number };
}

export function TimeSheetTable(props: Props) {
  const defaultView = localStorage.getItem("isColumnView");
  const isMonthView = props.scheduleDays.numberOfDays > 7;
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const [isColumnView, setIsColumnView] = useState(
    defaultView === "true" || false
  );

  const startDate = props.scheduleDays.days[0].toISOString().split("T")[0]; // Start date
  const endDate = props.scheduleDays.days[props.scheduleDays.numberOfDays - 1]
    .toISOString()
    .split("T")[0]; // End date
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

  useEffect(() => {
    if (isSmallScreen) {
      setIsColumnView(true);
    } else {
      setIsColumnView(false);
    }
  }, [isSmallScreen]);

  if (isLoadingTimesheet) {
    return <div>Loading...</div>;
  }

  const toggleView = () => {
    localStorage.setItem("isColumnView", JSON.stringify(!isColumnView));
    setIsColumnView(!isColumnView);
  };

  const getDaysBetween = (startDate: string, endDate: string): Date[] => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days: Date[] = [];

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    for (
      let currentDate = new Date(start);
      currentDate <= end;
      currentDate.setDate(currentDate.getDate() + 1)
    ) {
      days.push(new Date(currentDate));
    }
    return days;
  };

  // Function to get time entries for a specific task and day
  const getTimeEntriesForTaskAndDay = (
    taskId: number,
    day: Date
  ): TimeEntry[] => {
    if (!timesheet || !timesheet.timeEntries) return [];

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
      props.setSkippedDays([]);
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
          const targetDay = props.scheduleDays.days[targetDayIndex]
            .toISOString()
            .split("T")[0];

          if (activeDragData.columnDay && targetDay) {
            if (timesheet.tasks && timesheet.tasks.length > 0) {
              props.setSelectedTask(timesheet.tasks[0]);
              const dayEntries = timesheet.timeEntries.filter(
                (entry) => entry.task === null
              );
              props.setTimeEntries(dayEntries);
              props.setSkippedDays(
                draggedOverCells.filter((day) => {
                  const hasTimeEntry = timesheet.timeEntries.some(
                    (entry) => normalizeDate(entry.date) === normalizeDate(day)
                  );
                  return isHoliday(day) || hasTimeEntry;
                })
              );

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
                draggedOverCells.filter((day) => !isHoliday(day))
              );

              props.setOpenTimeEntryModal(true);
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

  const openTimeEntryModalHandler = (task: Task, day: Date) => {
    props.setSelectedTask(task);
    props.setTimeEntries(timesheet?.timeEntries || []);
    props.setSelectedCells([day]);
    props.setOpenTimeEntryModal(true);
  };

  const isTaskFinished = (currentDay: Date, task: Task) => {
    // Check if the task is finished based on the current date and task dates
    return (
      currentDay.getTime() < new Date(task.startDate).getTime() ||
      (task.endDate && currentDay.getTime() > new Date(task.endDate).getTime())
    );
  };

  return (
    <>
      <DndContext
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        collisionDetection={closestCenter}
      >
        {!isSmallScreen && (
          <div className="flex justify-end mb-4">
            <div className="inline-flex items-end gap-2">
              <label
                htmlFor="switch-component-on"
                className="text-slate-600 text-sm cursor-pointer"
              >
                Row
              </label>
              <div className="relative inline-block w-11 h-5">
                <input
                  id="switch-component-on"
                  type="checkbox"
                  className="peer appearance-none w-11 h-5 bg-slate-100 rounded-full checked:bg-slate-800 cursor-pointer transition-colors duration-300"
                  checked={isColumnView}
                  onChange={toggleView}
                />
                <label
                  htmlFor="switch-component-on"
                  className="absolute top-0 left-0 w-5 h-5 bg-white rounded-full border border-slate-300 shadow-sm transition-transform duration-300 peer-checked:translate-x-6 peer-checked:border-slate-800 cursor-pointer"
                ></label>
              </div>
              <label
                htmlFor="switch-component-on"
                className="text-slate-600 text-sm cursor-pointer"
              >
                Column
              </label>
            </div>
          </div>
        )}
        <div
          className={`grid gap-2 ${
            isColumnView ? "grid-flow-column" : "grid-flow-row"
          }`}
        >
          <div
            className={`grid ${
              isColumnView
                ? `grid-rows-${
                    props.scheduleDays.numberOfDays + 1
                  } grid-flow-col`
                : `grid-cols-${
                    props.scheduleDays.numberOfDays + 1
                  } grid-flow-row`
            } gap-0`}
          >
            <div
              className={`bg-gray-100 p-2 font-semibold border-1 border-gray-300 ${
                isMonthView ? "text-xs" : "text-sm"
              }`}
            >
              Tasks
            </div>
            {props.scheduleDays.days.map((day, index) => (
              <Droppable key={index} id={`column-${index}`}>
                <Draggable id={`column-${index}`}>
                  <div
                    className={`bg-gray-100 font-semibold ${
                      isMonthView ? "text-xs p-1" : "text-sm p-2"
                    } text-center 
                                        ${
                                          isColumnActive(index)
                                            ? "bg-blue-200"
                                            : ""
                                        }
                                        ${
                                          isColumnHighlighted(index)
                                            ? "bg-blue-100 border-blue-400"
                                            : "border-gray-300"
                                        } border-t-1 border-x-1`}
                  >
                    <div>{formatDate(day, isMonthView && !isColumnView)}</div>
                    <div
                      className={`bg-gray-100 font-semibold ${
                        isMonthView ? "text-xs pb-2" : "text-sm"
                      } text-center`}
                    >
                      <TotalHourCell
                        day={day}
                        timeEntries={timesheet?.timeEntries || []}
                        isMonthView={isMonthView}
                        isColumnView={isColumnView}
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
            {timesheet?.tasks?.map((task) => (
              <TimeSheetRow
                key={task.id}
                task={task}
                scheduleDays={props.scheduleDays.days}
                isMonthView={isMonthView}
                isCellInDragRange={isCellInDragRange}
                isColumnHighlighted={isColumnHighlighted}
                isHoliday={isHoliday}
                isSickDay={isSickday}
                isTaskFinished={isTaskFinished}
                getTimeEntriesForTaskAndDay={getTimeEntriesForTaskAndDay}
                isColumnView={isColumnView}
                openTimeEntryModalHandler={openTimeEntryModalHandler}
              />
            ))}
          </div>
        </div>
        <DragOverlay>
          {activeId && dragType === "cell" && (
            <div className="bg-blue-300 p-2 h-full rounded opacity-10"></div>
          )}
        </DragOverlay>
      </DndContext>
    </>
  );
}
