import React from "react";
import { TaskEntry } from "../../../restapi/types";

interface TaskEntryItemProps {
  entry: TaskEntry;
  taskId: number;
  isMonthView: boolean;
  backgroundColor: string;
  isDayLocked: boolean;
}

export const TaskEntryItem: React.FC<TaskEntryItemProps> = ({
  entry,
  isMonthView,
  backgroundColor,
}) => {
  const hoursValue = (Number(entry.dayShiftHours) || 0) + (Number(entry.nightShiftHours) || 0);

  return (
    <div
      style={{ backgroundColor }}
      className={`h-full w-full text-center flex items-center justify-center font-bold`}
    >
      <span className={`${isMonthView ? "text-[14px]" : "text-[20px]"} `}>{hoursValue}</span>
    </div>
  );
};
