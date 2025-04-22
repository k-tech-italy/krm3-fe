import { Martini } from "lucide-react";
import React from "react";
import { Task, TimeEntry } from "../../restapi/types";
import { Droppable } from "./Droppable";
import { Draggable } from "./Draggable";

interface Props {
    scheduleDays: Date[]
    task: Task
    isMonthView: boolean
    isColumnView: boolean
    isCellInDragRange: (day: Date, taskId: number) => boolean
    isColumnHighlighted: (dayIndex: number) => boolean
    isHoliday: (day: Date) => boolean
    isTaskFinished: (currentDay: Date, task: Task) => boolean | undefined
    getTimeEntriesForTaskAndDay: (taskId: number, day: Date) => TimeEntry[]
    openTimeEntryModalHandler: (task: Task, day: Date) => void
}

export function TimeSheetCell(props: Props) {
    return <React.Fragment key={props.task.id}>
        <div className={`p-2 ${props.isMonthView ? "min-w-10 py-1" : "bg-gray-50"} border-1 border-gray-300 relative group`}>
            <div className={`${props.isMonthView ? "text-xs font-medium truncate" : ""}`}>{props.task.title}</div>
            <div className={`text-xs ${props.isMonthView ? "hidden" : "text-gray-500"}`}>{props.task.projectName}</div>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-white border-1 border-gray-300 text-xs rounded px-2 py-1 z-10">
                {props.task.title} - {props.task.projectName}
            </div>
        </div>
        {props.scheduleDays.map((day, dayIndex) => {
            const cellId = `${day.toDateString()}-${props.task.id}`;
            const isInDragRange = props.isCellInDragRange(day, props.task.id);
            const isInColumnHighlight = props.isColumnHighlighted(dayIndex);

            if (props.isHoliday(day)) {
                return (
                    <div key={dayIndex} className={`border border-gray-200 ${props.isMonthView ? 'p-1' : 'p-2'} h-full w-full`}>
                        <div className={`bg-gradient-to-r from-cyan-100 to-blue-300 ${props.isMonthView ? 'p-1 min-h-6' : 'p-2'} h-full rounded flex justify-center items-center`}>
                            <Martini color="white" size={props.isMonthView ? 12 : 16} />
                        </div>
                    </div>
                );
            }

            const currentDay = new Date(day);
            currentDay.setHours(0, 0, 0, 0);

            if (props.isTaskFinished(currentDay, props.task)) {
                return (
                    <div key={dayIndex} className={`border border-gray-200 ${props.isMonthView ? 'p-1' : 'p-2'} h-full w-full`}>
                        <div className={`bg-gradient-to-r from-gray-100 to-gray-300 ${props.isMonthView ? 'min-h-6' : ''} h-full rounded flex justify-center items-center`}>
                            <span className={`text-xs text-gray-400`}>N/A</span>
                        </div>
                    </div>
                );
            }

            const timeEntries = props.getTimeEntriesForTaskAndDay(props.task.id, day);

            return (
                <Droppable key={dayIndex} id={cellId}>
                    <div
                        onClick={() => props.openTimeEntryModalHandler(props.task, day)}
                        className={`border ${props.isMonthView ? 'p-1' : 'p-2'} h-full w-full cursor-pointer 
                                                            ${isInDragRange ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                                                            ${isInColumnHighlight ? 'bg-blue-50 border-blue-300' : ''}`}
                    >
                        {timeEntries.length > 0 ? (
                            <div className={`h-full w-full ${props.isMonthView ? 'space-y-0.5' : 'space-y-1'}`}>
                                {timeEntries.map(entry => (
                                    <div key={entry.id}>
                                        {renderTimeEntry(entry, props.task.id, props.isMonthView)}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full w-full">
                                {renderEmptyCell(day, props.task.id, props.isMonthView)}
                            </div>
                        )}
                    </div>
                </Droppable>
            );
        })}
    </React.Fragment>;
}


const renderTimeEntry = (entry: TimeEntry, taskId: number, isMonthView = false) => {
    const entryId = `${entry.id}-${taskId}`;
    return (
        <Draggable id={entryId}>
            <div className={`bg-blue-100 ${isMonthView ? 'p-1' : 'p-2'} h-full rounded`}>
                <span className="text-xs">{entry.workHours}h</span>
            </div>
        </Draggable>
    );
};

const renderEmptyCell = (day: Date, taskId: number, isMonthView = false) => {
    const emptyCellId = `${day.toDateString()}-${taskId}-empty`;
    return (
        <Draggable id={emptyCellId}>
            <div className={`h-full w-full border-2 border-dashed border-gray-200 rounded-md flex items-center justify-center ${isMonthView ? 'min-h-6' : ''}`}>
                <span className="text-gray-400 text-xs">+</span>
            </div>
        </Draggable>
    );
};
