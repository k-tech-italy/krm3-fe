import React from "react";
import { Droppable } from "../Droppable";
import { TimeEntryItem } from "./TimeEntryItem";
import { EmptyCell } from "./EmptyCell";
import { TimeEntry, TimeEntryType } from "../../../restapi/types";
import { SpecialDayCell } from "./SpecialDayCell";
import { Draggable } from "../Draggable";
import { getTileBgColorClass } from "../utils/utils.ts";

export interface CellProps {
  day: Date;
  taskId: number;
  isMonthView: boolean;
  isColumnHighlighted: boolean;
  colors: {
    backgroundColor: string;
    borderColor: string;
  };
}

export interface TimeEntryCellProps extends CellProps {
  timeEntry?: TimeEntry;
  isInDragRange: boolean;
  type: TimeEntryType;
  isColumnView: boolean;
  readOnly: boolean;
  isNoWorkDay: boolean;
  isLockedDay: boolean;
  isInSelectedWeekdays: boolean;

}
export const TimeEntryCell: React.FC<TimeEntryCellProps> = ({
  day,
  taskId,
  timeEntry,
  isMonthView,
  isColumnView,
  isColumnHighlighted,
  isInDragRange,
  colors,
  type,
  readOnly,
  isNoWorkDay,
  isLockedDay,
  isInSelectedWeekdays,
}) => {
  const cellId = `${day.toDateString()}-${taskId}`;
  const draggableId = `${day.toDateString()}-${taskId}-${timeEntry?.id}`;

  const borderColorClass = isColumnView
    ? "border-l-[var(--border-color)]"
    : "border-b-[var(--border-color)]";


  return (
    <Droppable
      id={cellId}
      isDisabled={(!isMonthView && !isInSelectedWeekdays) || isLockedDay}
    >
      <div
        style={{ "--border-color": colors.borderColor } as React.CSSProperties}
        className={`
    h-full w-full cursor-pointer
        ${borderColorClass}

    ${isColumnView ? "border-l-3" : "border-b-3"}
    ${isColumnView ? "hover:border-l-blue-500" : "hover:border-b-blue-500"}
 
    
     ${!isInSelectedWeekdays ? "cursor-not-allowed!" : ""}
     ${getTileBgColorClass(day, isNoWorkDay)}

    ${isInDragRange || isColumnHighlighted ? "bg-blue-50" : ""}
    ${
      (isInDragRange || isColumnHighlighted) &&
      (isColumnView ? "border-l-blue-500" : "border-b-blue-500")
    }

  `}
      >
        <Draggable
          id={draggableId}
          isDisabled={(!isMonthView && !isInSelectedWeekdays) || isLockedDay}
        >
          <div
         
            className="h-full w-full flex items-center justify-center"
          >
            {(type === TimeEntryType.HOLIDAY ||
              type === TimeEntryType.SICK ||
              type === TimeEntryType.FINISHED) && (
              <SpecialDayCell
                day={day}
                taskId={taskId}
                type={type}
                isMonthView={isMonthView}
                colors={colors}
              />
            )}
            {timeEntry && (
              <div
                key={timeEntry.id}
                className={`h-full w-full flex items-center`}
              >
                <TimeEntryItem
                  isDayLocked={isLockedDay}
                  entry={timeEntry}
                  taskId={taskId}
                  isMonthView={isMonthView}
                  backgroundColor={colors.backgroundColor}
                />
              </div>
            )}
            {!timeEntry &&
              (type === TimeEntryType.TASK ||
                type === TimeEntryType.CLOSED) && (
                <EmptyCell
                  isDayLocked={isLockedDay}
                  day={day}
                  taskId={taskId}
                  isMonthView={isMonthView}
                />
              )}
          </div>
        </Draggable>
      </div>
    </Droppable>
  );
};
