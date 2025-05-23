import { Info } from "lucide-react";
import { TimeEntry } from "../../restapi/types";
import { isWeekendDay, normalizeDate } from "./utils/utils";
import { Tooltip } from "react-tooltip";

interface Props {
  day: Date;
  timeEntries?: TimeEntry[];
  isMonthView?: boolean;
  isColumnView?: boolean;
}

export function TotalHourCell({ day, timeEntries, isMonthView }: Props) {
  if (!timeEntries) {
    return <div className="bg-gray-100">0h</div>;
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
        (Number(timeEntry.onCallHours) || 0) +
        (Number(timeEntry.leaveHours) || 0) +
        (Number(timeEntry.restHours) || 0) +
        (Number(timeEntry.travelHours) || 0)
      );
    }
    return acc;
  }, 0);

  // Get entries for this day for tooltip display
  const dayEntries = timeEntries.filter(
    (entry) => normalizeDate(entry.date) === formattedDay
  );

  function colorClass() {
    if (totalHour > 8) {
      return "red";
    }
    if (totalHour > 0 && totalHour < 8) {
      return "blue";
    }
    if (totalHour === 8) {
      return "green";
    }
    return "yellow";
  }

  const tooltipId = `tooltip-hours-${formattedDay}`;

  return (
    <div className={`relative flex justify-center items-center h-full w-full`}>
      <div
        data-tooltip-id={tooltipId}
        className={`bg-gray-100 items-center font-semibold ${
          isMonthView ? "text-[10px]" : "text-sm"
        } flex justify-center  h-full w-full text-${colorClass()}-500   ${
          isWeekendDay(day) ? "bg-zinc-200" : ""
        }`}
      >
        {totalHour}h
        {totalHour > 0 && !isMonthView && (
          <Info
            size={isMonthView ? 8 : 18}
            color="gray"
            className="cursor-pointer mx-2"
          />
        )}
      </div>

      {totalHour > 0 && dayEntries.length > 0 && (
        <Tooltip
          id={tooltipId}
          place="top"
          clickable={true}
          className="z-10 !bg-white !text-black !opacity-100 rounded shadow-lg border border-gray-300"
          style={{ width: "16rem", maxWidth: "20rem" }}
          delayShow={300}
        >
          <div className="p-2">
            {dayEntries.map((timeEntry: TimeEntry, index: number) => (
              <div key={index} className="mb-2 last:mb-0">
                <div className="font-semibold">
                  {timeEntry.task ? `Task id: ${timeEntry.task}` : "Day"}
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm mt-1">
                  <div className="flex items-center">
                    <span className="font-medium mr-1">Daytime:</span>
                    <span>{timeEntry.dayShiftHours || 0}h</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium mr-1">Nighttime:</span>
                    <span>{timeEntry.nightShiftHours || 0}h</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium mr-1">On Call:</span>
                    <span>{timeEntry.onCallHours || 0}h</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium mr-1">Leave:</span>
                    <span>{timeEntry.leaveHours || 0}h</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium mr-1">Travel:</span>
                    <span>{timeEntry.travelHours || 0}h</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium mr-1">Rest:</span>
                    <span>{timeEntry.restHours || 0}h</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Tooltip>
      )}
    </div>
  );
}
