import { Info } from "lucide-react";
import { TimeEntry } from "../../restapi/types";
import { useState } from "react";
import { normalizeDate } from "./utils";
import { useColumnViewPreference } from "../../hooks/commons";

interface Props {
  day: Date;
  timeEntries?: TimeEntry[];
  isMonthView?: boolean;
  isColumnView?: boolean;
}

export function TotalHourCell({
  day,
  timeEntries,
  isMonthView,
  isColumnView,
}: Props) {
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

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
        (Number(timeEntry.workHours) || 0) +
        (Number(timeEntry.overtimeHours) || 0) +
        (Number(timeEntry.onCallHours) || 0) +
        (Number(timeEntry.leaveHours) || 0)
      );
    }
    return acc;
  }, 0);

  // Get entries for this day for tooltip display
  const dayEntries = timeEntries.filter(
    (entry) => normalizeDate(entry.date) === formattedDay
  );

  function handleShowTooltip() {
    if (totalHour > 0) {
      setShowTooltip(!showTooltip);
    }
  }

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

  return (
    <div className={`relative flex justify-center items-center h-full w-full`}>
      <div
        id="total-hour-label"
        className={`bg-gray-100 font-semibold ${
          isMonthView ? "text-[10px]" : "text-sm"
        } flex justify-center items-center h-full w-full text-${colorClass()}-500`}
      >
        {totalHour}h
        {totalHour > 0 && !isMonthView && (
          <Info
            onMouseEnter={handleShowTooltip}
            onMouseLeave={handleShowTooltip}
            size={isMonthView ? 8 : 20}
            color="gray"
            className="cursor-pointer mx-2"
          />
        )}
      </div>
      {showTooltip && dayEntries.length > 0 && (
        <div className="absolute left-0 bottom-full w-64 bg-white border border-gray-300 shadow-lg rounded z-10">
          {dayEntries.map((timeEntry: TimeEntry, index: number) => (
            <div key={index} className="">
              <div className="font-semibold">
                {" "}
                {timeEntry.task ? `Task id: ${timeEntry.task}` : "Day"}
              </div>
              <div className="text-sm">
                Work: {timeEntry.workHours || 0}h, Overtime:{" "}
                {timeEntry.overtimeHours || 0}h, On Call:{" "}
                {timeEntry.onCallHours || 0}h leave: {timeEntry.leaveHours || 0}
                h
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
