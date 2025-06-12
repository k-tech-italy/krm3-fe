import React from "react";
import { Droppable } from "../Droppable";
import { TimeEntryItem } from "./TimeEntryItem";
import { EmptyCell } from "./EmptyCell";
import { TimeEntry, TimeEntryType } from "../../../restapi/types";
import { SpecialDayCell } from "./SpecialDayCell";
import { isNoWorkOrBankHol } from "../utils/dates";

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
  onClick?: () => void;
  isInDragRange: boolean;
  type: TimeEntryType;
  isColumnView: boolean;
  readOnly: boolean;
  isNoWorkDay: boolean;
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
  onClick,
}) => {
  const cellId = `${day.toDateString()}-${taskId}`;

  const borderColorClass = isColumnView
    ? "border-l-[var(--border-color)]"
    : "border-b-[var(--border-color)]";

  return (
    <Droppable id={cellId}>
      <div
        onClick={onClick}
        style={{ "--border-color": colors.borderColor } as React.CSSProperties}
        className={`
    h-full w-full cursor-pointer
        ${borderColorClass}

    ${isColumnView ? "border-l-3" : "border-b-3"}
    ${isColumnView ? "hover:border-l-blue-500" : "hover:border-b-blue-500"}
    ${isInDragRange || isColumnHighlighted ? "bg-blue-50" : ""}
    ${
      (isInDragRange || isColumnHighlighted) &&
      (isColumnView ? "border-l-blue-500" : "border-b-blue-500")
    }
     ${isNoWorkDay ? "bg-zinc-100" : ""}
  `}
      >
        {(type === TimeEntryType.HOLIDAY || type === TimeEntryType.SICK || type === TimeEntryType.FINISHED || type === TimeEntryType.CLOSED) && (
          <div className="h-full w-full flex items-center justify-center">
            <SpecialDayCell
              day={day}
              taskId={taskId}
              type={type}
              isMonthView={isMonthView}
              colors={colors}
            />
          </div>
        )}
        {timeEntry && (
          <div key={timeEntry.id} className={`h-full w-full flex items-center`}>
            <TimeEntryItem
              entry={timeEntry}
              taskId={taskId}
              isMonthView={isMonthView}
              backgroundColor={colors.backgroundColor}
            />
          </div>
        )}
        {!timeEntry && type === TimeEntryType.TASK && (
          <EmptyCell day={day} taskId={taskId} isMonthView={isMonthView} />
        )}
      </div>
    </Droppable>
  );
};
