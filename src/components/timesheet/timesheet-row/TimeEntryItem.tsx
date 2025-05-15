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

  const getHoursValue = () => {
    if (entry.dayShiftHours > 0) {
      return {
        hoursValue: (
          <span className="flex items-center">
            {entry.dayShiftHours}
            <Sun size={isMonthView ? 12 : 18} />
          </span>
        ),
      };
    } else if (entry.nightShiftHours > 0) {
      return {
        hoursValue: (
          <span className="flex items-center">
            {entry.nightShiftHours}
            <Moon size={isMonthView ? 12 : 18} />
          </span>
        ),
      };
    } else if (entry.restHours > 0) {
      return {
        hoursValue: (
          <span className="flex items-center">
            {entry.restHours}
            <Bed size={isMonthView ? 12 : 18} />
          </span>
        ),
      };
    } else if (entry.travelHours > 0) {
      return {
        hoursValue: (
          <span className="flex items-center">
            {entry.travelHours}
            <Plane size={isMonthView ? 12 : 18} />
          </span>
        ),
      };
    } else {
      return {
        hoursValue: (
          <span className="flex items-center">
            {entry.dayShiftHours}
            <Sun />
          </span>
        ),
      };
    }
  };
  const { hoursValue } = getHoursValue();
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
