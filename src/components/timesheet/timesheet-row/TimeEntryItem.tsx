import React from "react";
import { Draggable } from "../Draggable";
import { TimeEntry } from "../../../restapi/types";

interface TimeEntryItemProps {
  entry: TimeEntry;
  taskId: number;
  isMonthView: boolean;
  backgroundColor: string;
}

export const TimeEntryItem: React.FC<TimeEntryItemProps> = ({
  entry,
  taskId,
  isMonthView,
  backgroundColor,
}) => {
  const entryId = `${entry.id}-${taskId}`;

  // Get the hours value from the first available hours field
  const hoursValue =
    entry.workHours ||
    entry.onCallHours ||
    entry.restHours ||
    entry.overtimeHours ||
    entry.travelHours;
  return (
    <Draggable id={entryId} className="h-full w-full">
      <div
        style={{ backgroundColor }}
        className={`h-full w-full text-center flex items-center justify-center `}
      >
        <span className={`${isMonthView ? "text-[10px]" : "text-s"} `}>
          {hoursValue}h
        </span>
      </div>
    </Draggable>
  );
};
