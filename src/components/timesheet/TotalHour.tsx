import { Info } from "lucide-react";
import { TimeEntry } from "../../restapi/types";
import { normalizeDate } from "./utils/dates";
import { Tooltip } from "react-tooltip";

interface Props {
  day: Date;
  timeEntries?: TimeEntry[];
  isMonthView?: boolean;
  isColumnView?: boolean;
  isNoWorkDay?: boolean;
}

export function TotalHourCell({ day, timeEntries, isMonthView, isNoWorkDay }: Props) {
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
        (Number(timeEntry.leaveHours) || 0) +
        (Number(timeEntry.restHours) || 0)
      );
    }
    return acc;
  }, 0);

  // Get entries for this day for tooltip display
  const dayEntries = timeEntries.filter(
    (entry) => normalizeDate(entry.date) === formattedDay
  );

  const getTextColorClass = (totalHours: number): string => {
    if (totalHours > 8) return "text-red-500";
    if (totalHours > 0 && totalHours < 8) return "text-blue-500";
    if (totalHours === 8) return "text-green-500";
    return "text-yellow-500";
  };

  const tooltipId = `tooltip-hours-${formattedDay}`;

  return (
    <div className={`relative flex justify-center items-center h-full w-full`}>
      <div
        data-tooltip-id={tooltipId}
        className={`bg-gray-100 items-center font-semibold ${
          isMonthView ? "text-[10px]" : "text-sm"
        } flex justify-center  h-full w-full ${getTextColorClass(totalHour)} ${
          isNoWorkDay ? "bg-zinc-200" : ""
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
          className="z-10 !bg-white !text-black !opacity-100  rounded shadow-lg border border-gray-300"
          style={{ width: "16rem", maxWidth: "20rem" }}
          delayShow={300}
        >
          <div className="">
            {dayEntries.map((timeEntry: TimeEntry, index: number) => (
              <div key={index} className="mb-2 last:mb-0">
                <TotalHourForTask timeEntry={timeEntry} />
              </div>
            ))}
          </div>
        </Tooltip>
      )}
    </div>
  );
}

const TotalHourForTask = ({ timeEntry }: { timeEntry: TimeEntry }) => {
  const hours = [
    { label: "Daytime", value: timeEntry.dayShiftHours },
    { label: "Nighttime", value: timeEntry.nightShiftHours },
    { label: "On Call", value: timeEntry.onCallHours },
    { label: "Leave", value: timeEntry.leaveHours },
    { label: "Travel", value: timeEntry.travelHours },
    { label: "Rest", value: timeEntry.restHours },
  ];

  return (
    <>
      <div className="font-semibold">
        {timeEntry.task ? `Task ID: ${timeEntry.task}` : "Day"}
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
