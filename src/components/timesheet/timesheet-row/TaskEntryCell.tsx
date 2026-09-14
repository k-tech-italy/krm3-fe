import React from "react";

import { TaskEntry, TaskEntryCellType } from "../../../restapi/types";
import { Draggable } from "../Draggable";
import { Droppable } from "../Droppable";
import { isToday } from "../utils/entryUtils";
import { EmptyCell } from "./EmptyCell";
import { SpecialDayCell } from "./SpecialDayCell";
import { TaskEntryItem } from "./TaskEntryItem";

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

export interface TaskEntryCellProps extends CellProps {
  taskEntry?: TaskEntry;
  isInDragRange: boolean;
  type: TaskEntryCellType;
  isColumnView: boolean;
  readOnly: boolean;
  isNoWorkDay: boolean;
  isLockedDay: boolean;
  isInSelectedWeekdays: boolean;
}

export const TaskEntryCell: React.FC<TaskEntryCellProps> = ({
  day,
  taskId,
  taskEntry,
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

  const draggableId = `${day.toDateString()}-${taskId}-${taskEntry?.id ?? "empty"}`;

  const isDisabled = readOnly || isLockedDay || (!isMonthView && !isInSelectedWeekdays);

  const isSpecialDay =
    type === TaskEntryCellType.HOLIDAY ||
    type === TaskEntryCellType.SICK ||
    type === TaskEntryCellType.FINISHED;

  const borderColorClass = isColumnView
    ? "border-l-[var(--border-color)]"
    : "border-b-[var(--border-color)]";

  const getBgClass = () => {
    if (isToday(day)) {
      return "bg-table-today";
    }

    if (isNoWorkDay) {
      return isLockedDay ? "bg-closed-non-work" : "bg-table-row-alt";
    }

    return "";
  };

  return (
    <Droppable id={cellId} isDisabled={isDisabled}>
      <div
        style={
          {
            "--border-color": colors.borderColor,
          } as React.CSSProperties
        }
        className={`
          h-full w-full cursor-pointer
          ${borderColorClass}
          ${
            isColumnView
              ? "border-l-3 hover:border-l-blue-500"
              : "border-b-3 hover:border-b-blue-500"
          }
          ${!isInSelectedWeekdays ? "cursor-not-allowed!" : ""}
          ${getBgClass()}
          ${isInDragRange || isColumnHighlighted ? "bg-card" : ""}
          ${
            (isInDragRange || isColumnHighlighted) &&
            (isColumnView ? "border-l-blue-500" : "border-b-blue-500")
          }
        `}
      >
        <Draggable id={draggableId} isDisabled={isDisabled}>
          <div className="h-full w-full flex items-center justify-center">
            {isSpecialDay ? (
              <SpecialDayCell
                day={day}
                taskId={taskId}
                type={type}
                isMonthView={isMonthView}
                colors={colors}
              />
            ) : taskEntry ? (
              <div key={taskEntry.id} className="h-full w-full flex items-center">
                <TaskEntryItem
                  isDayLocked={isLockedDay}
                  entry={taskEntry}
                  taskId={taskId}
                  isMonthView={isMonthView}
                  backgroundColor={colors.backgroundColor}
                />
              </div>
            ) : (
              (type === TaskEntryCellType.TASK || type === TaskEntryCellType.CLOSED) && (
                <EmptyCell
                  isDayLocked={isLockedDay}
                  day={day}
                  taskId={taskId}
                  isMonthView={isMonthView}
                />
              )
            )}
          </div>
        </Draggable>
      </div>
    </Droppable>
  );
};
