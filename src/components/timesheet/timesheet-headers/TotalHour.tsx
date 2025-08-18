import { Info } from "lucide-react";
import { TimeEntry } from "../../../restapi/types";
import { normalizeDate } from "../utils/dates";
import {getTileBgColorClass} from "../utils/utils.ts";
import { DoorOpen } from 'lucide-react';

interface Props {
  day: Date;
  timeEntries?: TimeEntry[];
  isMonthView?: boolean;
  isColumnView?: boolean;
  isNoWorkDay?: boolean;
  isInSelectedWeekdays? :boolean
}

export function TotalHourCell({ day, timeEntries, isMonthView, isNoWorkDay, isInSelectedWeekdays }: Props) {
  if (!timeEntries) {
    return <div className="bg-card">0h</div>;
  }

  const formattedDay = normalizeDate(day);

  // Calculate total hours for the current day
  const totalHour = timeEntries.reduce((acc: number, timeEntry: TimeEntry) => {
    const entryDate = normalizeDate(timeEntry.date);

    if (entryDate === formattedDay) {
      return (
        acc +
        (Number(timeEntry.dayShiftHours) || 0) +
        (Number(timeEntry.nightShiftHours) || 0) +
        (Number(timeEntry.leaveHours) || 0) +
        (Number(timeEntry.specialLeaveHours ) || 0) +
        (Number(timeEntry.restHours) || 0) +
        (Number(timeEntry.travelHours) || 0)
      );
    }
    return acc;
  }, 0);

  // Get entries for this day for tooltip display
  

  const getTextColorClass = (totalHours: number): string => {
    if (totalHours > 8) return "text-red-500";
    if (totalHours > 0 && totalHours < 8) return "text-blue-500";
    if (totalHours === 8) return "text-green-500";
    return "text-yellow-500";
  };

  const tooltipId = `tooltip-hours-${formattedDay}`;

  return (
    <div className={`relative flex justify-center items-center h-full w-full `}>
      <div
        data-tooltip-id={tooltipId}
        data-tooltip-hidden={totalHour === 0}
        className={`items-center font-semibold ${
          isMonthView ? "text-[10px]" : "text-sm"
        } flex justify-center  h-full w-full ${getTextColorClass(totalHour)} 
        ${getTileBgColorClass(day, isNoWorkDay)}
        `}
      >
        {totalHour}h
        {totalHour > 0 && !isMonthView && (
          <Info
            size={isMonthView ? 8 : 18}
            color="gray"
            className="cursor-pointer mx-2"
          />
        )}
        {timeEntries.some((timeEntry) => {
          return timeEntry.date.slice(0, 10) == formattedDay &&
              (timeEntry.leaveHours > 0 || timeEntry.specialLeaveHours > 0);
        }) && <DoorOpen data-testid={`leave-icon-${formattedDay}`} size={isMonthView ? 14 : 20}/>}

      </div>
    </div>
  );
}

export const TotalHourForTask = ({ timeEntry }: { timeEntry: TimeEntry }) => {
  const hours = [
    { label: "Daytime", value: timeEntry.dayShiftHours },
    { label: "Nighttime", value: timeEntry.nightShiftHours },
    { label: "On Call", value: timeEntry.onCallHours },
    { label: "Leave", value: timeEntry.leaveHours },
    { label: "Special Leave", value: timeEntry.specialLeaveHours },
    { label: "Travel", value: timeEntry.travelHours },
    { label: "Rest", value: timeEntry.restHours },
  ];

  return (
    <>
      <div className="font-semibold">
        {timeEntry.taskTitle ? `Task: ${timeEntry.taskTitle}` : "Day"}
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm mt-1">
        {hours.map(
          ({ label, value }) =>
            value > 0 && (
              <div key={label} className="flex items-center">
                <span className="font-medium mr-1">{label}:</span>
                <span>{value}h</span>
              </div>
            )
        )}
      </div>
    </>
  );
};
