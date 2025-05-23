import React from "react";
import { Droppable } from "../Droppable";
import { TimeEntryItem } from "./TimeEntryItem";
import { EmptyCell } from "./EmptyCell";
import { TimeEntry } from "../../../restapi/types";
import { SpecialDayCell } from "./SpecialDayCell";
import { isWeekendDay } from "../utils/utils";

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
  timeEntries: TimeEntry[];
  onClick?: () => void;
  isInDragRange: boolean;
  type: "task" | "holiday" | "sick" | "finished";
  isColumnView: boolean;
}

export const TimeEntryCell: React.FC<TimeEntryCellProps> = ({
  day,
  taskId,
  timeEntries,
  isMonthView,
  isColumnView,
  isColumnHighlighted,
  isInDragRange,
  colors,
  type,
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
    ${isWeekendDay(day) ? "bg-zinc-100" : ""}
  `}
      >
        {(type === "holiday" || type === "sick" || type === "finished") && (
          <div className="h-full w-full flex items-center justify-center">
            <SpecialDayCell
              day={day}
              taskId={taskId}
              type={type}
              isMonthView={isMonthView}
              isColumnHighlighted={isColumnHighlighted}
              colors={colors}
            />
          </div>
        )}
        {timeEntries.length > 0 && (
          <>
            {timeEntries.map((entry) => (
              <div key={entry.id} className={`h-full w-full flex items-center`}>
                <TimeEntryItem
                  entry={entry}
                  taskId={taskId}
                  isMonthView={isMonthView}
                  backgroundColor={colors.backgroundColor}
                />
              </div>
            ))}
          </>
        )}{" "}
        {!timeEntries.length && type === "task" && (
          <EmptyCell day={day} taskId={taskId} isMonthView={isMonthView} />
        )}
      </div>
    </Droppable>
  );
};
