import React from "react";
import { TimeEntry } from "../../../restapi/types";

interface TimeEntryItemProps {
  entry: TimeEntry;
  taskId: number;
  isMonthView: boolean;
  backgroundColor: string;
  isDayLocked: boolean;
}

export const TimeEntryItem: React.FC<TimeEntryItemProps> = ({
  entry,
  isMonthView,
  backgroundColor,
}) => {
  const hoursValue =
    Number(entry.dayShiftHours) +
    Number(entry.nightShiftHours) +
    Number(entry.restHours)

  return (
    <div
      style={{ backgroundColor }}
      className={`h-full w-full text-center flex items-center justify-center font-bold`}
    >
      <span className={`${isMonthView ? "text-[14px]" : "text-[20px]"} `}>
        {hoursValue}
      </span>
    </div>
  );
};
