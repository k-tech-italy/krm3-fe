import { useEffect, useState } from "react";
import { useMediaQuery } from "../../hooks/commons";
import { DndContext, DragOverlay, closestCenter } from "@dnd-kit/core";
import { TimeEntry, Task } from "../../restapi/types";
import { Draggable } from "./Draggable";
import { useGetTask } from "../../hooks/timesheet";
import { Martini } from "lucide-react";
import React from "react";
import { Droppable } from "./Droppable";
import { formatDate } from "./Krm3Calendar";
import { TotalHourCell } from "./TotalHour";

interface Props {
    setOpenTimeEntryModal: (open: boolean) => void;
    setSelectedTask: (task: Task) => void;
    setSelectedCells: (cells: Date[] | undefined) => void;
    setSkippedDays: (days: Date[]) => void;
    setIsDayEntry: (isDayEntry: boolean) => void;
    weekDays: Date[];
}
export function TimeSheetTable(props: Props) {
    const defaultView = localStorage.getItem("isColumnView");
    const isSmallScreen = useMediaQuery('(max-width: 768px)');
    const [isColumnView, setIsColumnView] = useState((defaultView === "true") || false);

    const startDate = props.weekDays[0].toISOString().split('T')[0]; // Start date
    const endDate = props.weekDays[props.weekDays.length - 1].toISOString().split('T')[0]; // End date
    const { data: tasks, isLoading: isLoadingTasks } = useGetTask(startDate, endDate);

    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeDragData, setActiveDragData] = useState<{
        timeEntry?: TimeEntry,
        taskId?: number,
        startDate?: string,
        columnDay?: Date,
        draggedOverColumns?: string[]
    } | null>(null);
    const [draggedOverCells, setDraggedOverCells] = useState<Date[]>([]);
    const [dragType, setDragType] = useState<'cell' | 'column' | null>(null);
    const [highlightedColumnIndexes, setHighlightedColumnIndexes] = useState<number[]>([]);
    const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(null);

    //IMPLEMENT HOLIDAY FUNCTIONALITY
    const [holidayDays, setHolidayDays] = useState<Date[]>([]) //TODO: implement this

    useEffect(() => {
        if (isSmallScreen) {
            setIsColumnView(true);
        } else {
            setIsColumnView(false);
        }
    }, [isSmallScreen]);

    if (isLoadingTasks) {
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

        let currentDate = new Date(start);
        while (currentDate <= end) {
            days.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return days;
    };


    const isHoliday = (task: Task, day: Date) => {
        if (!task.timeEntries) return false;
        return holidayDays.includes(day);
    };


    //DRAG AND DROP IMPLEMENTATION
    function handleDragStart(event: any) {
        const { active } = event;
        let taskId: number;
        let date: string = '';
        setDragType('cell');

        // Check if this is a column header drag
        if (active.id.startsWith('column-')) {
            const dayIndex = Number(active.id.replace('column-', ''));
            const columnDay = props.weekDays[dayIndex];

            setActiveDragData({
                columnDay: columnDay
            });
            setDragType('column');
            setActiveId(active.id);
            setDraggedColumnIndex(dayIndex);
            setHighlightedColumnIndexes([dayIndex]);
            return;
        }
        // Check if this is a timeEntry drag or an empty cell drag
        if (active.id.includes('-')) {
            const parts = active.id.split('-');
            if (parts.length === 2) {
                // It's a timeEntry drag: entryId-taskId
                const [entryId, taskIdStr] = parts;
                taskId = Number(taskIdStr);

                // Find the timeEntry being dragged
                const task = tasks?.find(t => t.id === taskId);
                if (!task) return;

                const timeEntry = task.timeEntries.find(entry => entry.id === Number(entryId));
                if (!timeEntry) return;

                date = timeEntry.date;

                setActiveDragData({
                    timeEntry,
                    taskId,
                    startDate: date
                });
            } else if (parts.length === 3) {
                // It's an empty cell drag: date-taskId-empty
                date = parts[0];
                taskId = Number(parts[1]);

                setActiveDragData({
                    taskId,
                    startDate: date
                });
            }
        }

        setActiveId(active.id);
        setDraggedOverCells([...draggedOverCells, new Date(date)]);
    }

    function handleDragEnd(event: any) {
        const { over } = event;

        if (over && activeDragData) {
            if (dragType === 'column') {
                // Handle column drag end
                if (over.id.startsWith('column-')) {
                    const targetDayIndex = Number(over.id.replace('column-', ''));
                    const targetDay = props.weekDays[targetDayIndex].toISOString().split('T')[0];

                    if (activeDragData.columnDay && targetDay) {
                        if (tasks && tasks.length > 0) {
                            // Select the first task as representative (modal will apply to all)
                            props.setSelectedTask(tasks[0]);
                            // TODO LOGIC FOR AVOID HOLIDAY COLUMNS?
                            props.setSkippedDays(
                                draggedOverCells.filter(day => {
                                    const hasTimeEntry = tasks.some(task =>
                                        task.timeEntries.some(entry => new Date(entry.date).toDateString() === day.toDateString())
                                    );
                                    return holidayDays.includes(day) || hasTimeEntry;
                                })
                            );                            
                            props.setSelectedCells(
                                draggedOverCells.filter(day => {
                                    const hasTimeEntry = tasks.some(task =>
                                        task.timeEntries.some(entry => new Date(entry.date).toDateString() === day.toDateString())
                                    );
                                    return !holidayDays.includes(day) && !hasTimeEntry;
                                })
                            );


                            props.setOpenTimeEntryModal(true);
                            props.setIsDayEntry(true);
                        }
                    }
                }
            } else {
                const [targetDate, targetTaskId] = over.id.split('-');
                // Only open modal if taskId matches
                if (activeDragData.taskId && Number(targetTaskId) === activeDragData.taskId) {
                    if (activeDragData.startDate) {
                        const task = tasks?.find(t => t.id === activeDragData.taskId);
                        if (task) {
                            props.setSelectedTask(task);
                            props.setSelectedCells(draggedOverCells.filter(day => !holidayDays.includes(day)));
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
            if (dragType === 'column') {
                // Highlight column being dragged over
                if (over.id.startsWith('column-')) {
                    const targetIndex = Number(over.id.replace('column-', ''));

                    if (draggedColumnIndex !== null) {
                        const start = Math.min(draggedColumnIndex, targetIndex);
                        const end = Math.max(draggedColumnIndex, targetIndex);

                        // Highlight all columns between the start and end indexes
                        const daysToHighlight = [];
                        const columnsToHighlight = [];
                        for (let i = start; i <= end; i++) {
                            // TODO LOGIC FOR AVOID HOLIDAY COLUMNS?
                            daysToHighlight.push(props.weekDays[i]);
                            columnsToHighlight.push(i);
                        }

                        setHighlightedColumnIndexes(columnsToHighlight);
                        setDraggedOverCells(daysToHighlight);
                    }
                }
                return;
            }

            // Handle existing cell drag move logic
            const [targetDate, targetTaskId] = over.id.split('-');

            // Only track if dragging over the same task
            if (activeDragData.taskId && Number(targetTaskId) === activeDragData.taskId) {
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
        // Check if the cell is in the dragged range, only for date because the time can
        return (
            activeDragData?.taskId === taskId &&
            draggedOverCells.some((draggedDay) => {
                return draggedDay.toDateString() === day.toDateString();
            })
        );
    };

    const isColumnActive = (dayIndex: number) => {
        return activeId === `column-${dayIndex}`;
    }

    const isColumnHighlighted = (dayIndex: number) => {
        if (dragType !== 'column') return false;
        return highlightedColumnIndexes.includes(dayIndex);
    }

    const openTimeEntryModalHandler = (task: Task, day: Date) => {
        props.setSelectedTask(task);
        props.setSelectedCells([day]);
        props.setOpenTimeEntryModal(true);
    }

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
                            <label htmlFor="switch-component-on" className="text-slate-600 text-sm cursor-pointer">
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
                            <label htmlFor="switch-component-on" className="text-slate-600 text-sm cursor-pointer">
                                Column
                            </label>
                        </div>
                    </div>
                )}
                <div className={`grid gap-2 ${isColumnView ? "grid-flow-column" : "grid-flow-row"}`}>
                    <div className={`grid ${isColumnView ? "grid-rows-8 grid-flow-col" : "grid-cols-8 grid-flow-row"} gap-0`}>
                        <div className="bg-gray-100 p-2 font-semibold">Tasks</div>
                        {props.weekDays.map((day, index) => (
                            <Droppable key={index} id={`column-${index}`}>
                                <Draggable id={`column-${index}`}>
                                    <div className={`bg-gray-100 p-2 font-semibold
                                    ${isColumnActive(index) ? 'bg-blue-200' : ''}
                                    ${isColumnHighlighted(index) ? 'bg-blue-100 border-t-1 border-x-1 border-blue-400' : ''}`}>
                                        {formatDate(day)}
                                    </div>
                                    <div className={`bg-gray-100 p-2 font-semibold 
                                    ${isColumnActive(index) ? 'bg-blue-200' : ''}
                                    ${isColumnHighlighted(index) ? 'bg-blue-100 border-b-1 border-x-1 border-blue-400' : ''}`}>
                                        <TotalHourCell day={day} tasks={tasks} />
                                    </div>
                                </Draggable>
                            </Droppable>
                        ))}
                        {tasks?.length === 0 && (
                            <div className="bg-gray-50 p-2">
                                No tasks available
                            </div>
                        )}
                        {tasks?.map((task) => (
                            <React.Fragment key={task.id}>
                                <div className="bg-gray-50 p-2">
                                    <div>{task.title}</div>
                                    <div className="text-xs text-gray-500">{task.projectName}</div>
                                </div>

                                {props.weekDays.map((day, dayIndex) => {
                                    const cellId = `${day.toDateString()}-${task.id}`;
                                    const isInDragRange = isCellInDragRange(day, task.id);
                                    const isInColumnHighlight = isColumnHighlighted(dayIndex);
                                    if (isHoliday(task, day)) {
                                        return (
                                            <div key={dayIndex} className="border border-gray-200 p-2 min-h-16">
                                                <div className="bg-gradient-to-r from-cyan-100 to-blue-300 p-2 h-full rounded flex justify-center items-center">
                                                    <Martini color="white" />
                                                </div>
                                            </div>
                                        );
                                    }
                                    // Check if the cell is outside the task's date range   
                                    const currentDay = new Date(day);
                                    currentDay.setHours(0, 0, 0, 0);
                                    if (currentDay.getTime() < new Date(task.startDate).getTime() || (task.endDate && currentDay.getTime() > new Date(task.endDate).getTime())) {
                                        return (
                                            <div key={dayIndex} className="border border-gray-200 p-2 min-h-16">
                                                <div className="bg-gradient-to-r from-gray-100 to-gray-300 p-2 h-full rounded flex justify-center items-center">
                                                    <span className="text-xs text-gray-400">Task Finished</span>
                                                </div>
                                            </div>
                                        );
                                    }

                                    const timeEntries = task.timeEntries.filter(
                                        entry => entry.date === day.toISOString().split('T')[0]
                                    );
                                    return (
                                        <Droppable key={dayIndex} id={cellId}>
                                            <div
                                                onClick={() => openTimeEntryModalHandler(task, day)}
                                                className={`border p-2 min-h-16 cursor-pointer
                                                    ${isInDragRange ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                                                    ${isInColumnHighlight ? 'bg-blue-50 border-blue-300' : ''}`}
                                            >
                                                {timeEntries.length > 0 ? (
                                                    timeEntries.map(entry => (
                                                        <div key={entry.id}>
                                                            {renderTimeEntry(entry, task)}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="h-full w-full">
                                                        {renderEmptyCell(day, task)}
                                                    </div>
                                                )}
                                            </div>
                                        </Droppable>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <DragOverlay>
                    {activeId && dragType === 'cell' && (
                        <div className="bg-blue-300 p-2 h-full rounded opacity-80">
                            <span className="text-xs">
                                {activeDragData?.timeEntry ? `${activeDragData.timeEntry.workHours}h` : ''}
                            </span>
                        </div>
                    )}
                    {activeId && dragType === 'column' && (
                        <div className=" p-2 rounded opacity-80 font-semibold">
                            {activeDragData?.columnDay && formatDate(activeDragData.columnDay)}
                        </div>
                    )}
                </DragOverlay>
            </DndContext>
        </>
    );
}

const renderTimeEntry = (entry: TimeEntry, task: Task) => {
    const entryId = `${entry.id}-${task.id}`;

    return (
        <Draggable id={entryId}>
            <div className="bg-blue-100 p-2 h-full rounded">
                <span className="text-xs">{entry.workHours}h</span>
            </div>
        </Draggable>
    );
};

const renderEmptyCell = (day: Date, task: Task) => {
    const emptyCellId = `${day.toDateString()}-${task.id}-empty`;

    return (
        <Draggable id={emptyCellId}>
            <div className="h-full w-full border-2 border-dashed border-gray-200 rounded-md flex items-center justify-center">
                <span className="text-gray-400 text-xs">+</span>
            </div>
        </Draggable>
    );
};

