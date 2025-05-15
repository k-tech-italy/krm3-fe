import React from "react";
import { Draggable } from "../Draggable";
import { TimeEntry } from "../../../restapi/types";
import { Bed, Moon, Plane, Sun } from "lucide-react";

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

  const hoursValue =
    Number(entry.dayShiftHours) +
    Number(entry.nightShiftHours) +
    Number(entry.restHours) +
    Number(entry.travelHours);

  return (
    <Draggable id={entryId} className="h-full w-full">
      <div
        style={{ backgroundColor }}
        className={`h-full w-full text-center flex items-center justify-center `}
      >
        <span className={`${isMonthView ? "text-[10px]" : "text-s"} `}>
          {hoursValue}
        </span>
      </div>
    </Draggable>
  );
};
