import { Info } from "lucide-react";
import {HeaderColors, Schedule, TimeEntry} from "../../../restapi/types";
import { normalizeDate } from "../utils/dates";

import { DoorOpen } from 'lucide-react';
import {calculateTotalHoursForDay} from "../../../restapi/timesheet.ts";

interface Props {
  day: Date;
  timeEntries?: TimeEntry[];
  isMonthView?: boolean;
  isColumnView?: boolean;
  colorClassName?: string;
}

export function TotalHourCell({ day, timeEntries, isMonthView, colorClassName }: Props) {
  if (!timeEntries) {
    return <div className="bg-card">0h</div>;
  }
  const formattedDay = normalizeDate(day);

  // Calculate total hours for the current day
  const totalHour = calculateTotalHoursForDay(timeEntries, day)

  const tooltipId = `tooltip-hours-${formattedDay}`;

  return (
    <div className={`relative flex justify-center items-center h-full w-full `}>
      <div
        data-tooltip-id={tooltipId}
        data-tooltip-hidden={totalHour === 0}
        className={`items-center font-semibold ${
          isMonthView ? "text-sm" : "text-md"
        } flex justify-center  h-full w-full 
          ${colorClassName}
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
    { label: "Bank To", value: timeEntry.bankTo },
    { label: "Bank From", value: timeEntry.bankFrom },
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
