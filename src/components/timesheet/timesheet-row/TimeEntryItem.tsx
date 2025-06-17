import React from "react";
import { Draggable } from "../Draggable";
import { TimeEntry } from "../../../restapi/types";
import { Lock } from "lucide-react";

interface TimeEntryItemProps {
  entry: TimeEntry;
  taskId: number;
  isMonthView: boolean;
  backgroundColor: string;
  isDayLocked: boolean;
}

export const TimeEntryItem: React.FC<TimeEntryItemProps> = ({
  entry,
  taskId,
  isMonthView,
  backgroundColor,
  isDayLocked,
}) => {

  const hoursValue =
    Number(entry.dayShiftHours) +
    Number(entry.nightShiftHours) +
    Number(entry.restHours) +
    Number(entry.travelHours);

  return (

      <div
        style={{ backgroundColor }}
        className={`h-full w-full text-center flex items-center justify-center `}
      >
        <span className={`${isMonthView ? "text-[10px]" : "text-s"} `}>
          {hoursValue}
        </span>
      </div>
  );
};
