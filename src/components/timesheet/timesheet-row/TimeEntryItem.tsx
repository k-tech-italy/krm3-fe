import React from "react";
import { Draggable } from "../Draggable";
import { TimeEntry } from "../../../restapi/types";
import { Lock } from "lucide-react";

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

  const isClosed = entry.state === "CLOSED";

  return (
    <Draggable
      id={entryId}
      className={`h-full w-full ${isClosed ? "cursor-not-allowed" : ""}`}
    >
      <div
        style={{ backgroundColor }}
        className={`h-full w-full text-center flex items-center justify-center `}
      >
        {isClosed && (
          <Lock
            className="absolute -translate-y-[8px] translate-x-[8px]"
            size={10}
          />
        )}
        <span className={`${isMonthView ? "text-[10px]" : "text-s"} `}>
          {hoursValue}
        </span>
      </div>
    </Draggable>
  );
};
