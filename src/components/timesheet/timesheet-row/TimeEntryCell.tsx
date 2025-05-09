import React from "react";
import { Droppable } from "../Droppable";
import { TimeEntryItem } from "./TimeEntryItem";
import { EmptyCell } from "./EmptyCell";
import { TimeEntry } from "../../../restapi/types";

export interface CellProps {
    day: Date;
    taskId: number;
    isMonthView: boolean;
    isColumnHighlighted: boolean;
    backgroundColor: string;
  }
  
export interface TimeEntryCellProps extends CellProps {
    timeEntries: TimeEntry[];
    onClick: () => void;
    isInDragRange: boolean;
  }
  

export const TimeEntryCell: React.FC<TimeEntryCellProps> = ({
  day,
  taskId,
  timeEntries,
  isMonthView,
  isColumnHighlighted,
  isInDragRange,
  backgroundColor,
  onClick,
}) => {
  const cellId = `${day.toDateString()}-${taskId}`;

  return (
    <Droppable id={cellId}>
      <div
        style={{
          borderBottom: "solid 3px",
          borderBottomColor: backgroundColor,
        }}
        onClick={onClick}
        className={`border-1 border-gray-300 h-full w-full cursor-pointer hover:border-blue-400 -grab ${
          isInDragRange ? "border-blue-500 bg-blue-50" : ""
        } ${isColumnHighlighted ? "bg-blue-50 border-blue-300" : ""}`}
      >
        {timeEntries.length > 0 ? (
          <>
            {timeEntries.map((entry) => (
              <div key={entry.id} className={`h-full w-full `}>
                <TimeEntryItem
                  entry={entry}
                  taskId={taskId}
                  isMonthView={isMonthView}
                  backgroundColor={backgroundColor}
                />
              </div>
            ))}
          </>
        ) : (
          <>
            <EmptyCell day={day} taskId={taskId} isMonthView={isMonthView} />
          </>
        )}
      </div>
    </Droppable>
  );
};
