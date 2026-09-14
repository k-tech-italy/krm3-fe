import React from "react";
import { Tooltip } from "react-tooltip";
import { Timesheet } from "../../../restapi/types";
import { Draggable } from "../Draggable";
import { Droppable } from "../Droppable";
import { formatDayOfWeek, formatIntl, normalizeDate } from "../utils/dates";
import {
  calculateDayEntryTotal,
  TotalHourCell,
  TotalHourForDay,
  TotalHourForTask,
} from "./TotalHour";
import { getTileBgColorProps } from "../utils/utils.ts";

interface Props {
  timesheet: Timesheet;
  scheduledDays: { days: Date[]; numberOfDays: number };
  isColumnView: boolean;
  isMonthView: boolean;
  isColumnActive: (index: number) => boolean;
  isColumnHighlighted: (index: number) => boolean;
  selectedWeekdays?: Date[];
  onHeaderClick?: (day: Date) => void;
}

function TimeSheetHeaders({
  timesheet,
  scheduledDays,
  isColumnView,
  isMonthView,
  isColumnActive,
  isColumnHighlighted,
  selectedWeekdays,
  onHeaderClick,
}: Readonly<Props>) {
  const customStyle = `
      .dynamic-header-bg {
        background-color: var(--header-bg-light);
      }
      .dark .dynamic-header-bg {
        background-color: var(--header-bg-dark);
      }
    `;

  return (
    <>
      <style>{customStyle}</style>
      {scheduledDays.days.map((day, index) => {
        const formattedDay = normalizeDate(day);
        const dayEntry = timesheet.dayEntries?.find(
          (entry) => normalizeDate(entry.day) === formattedDay
        );
        const totalHours = calculateDayEntryTotal(dayEntry);
        const isHolidayOrSick = Boolean(
          dayEntry?.isHoliday || dayEntry?.askedHoliday || dayEntry?.isSick
        );
        const tileBgProps = getTileBgColorProps(
          day,
          totalHours,
          timesheet.schedule ?? {},
          dayEntry?.closed ?? false,
          timesheet.timesheetColors,
          isHolidayOrSick
        );
        return (
          <React.Fragment key={formattedDay}>
            <Droppable
              id={`column-${index}`}
              isDisabled={
                !isMonthView && !selectedWeekdays?.some((date) => date.getTime() === day.getTime())
              }
            >
              <Draggable
                id={`column-${index}`}
                isDisabled={
                  !isMonthView &&
                  !selectedWeekdays?.some((date) => date.getTime() === day.getTime())
                }
              >
                <div
                  onClick={() => onHeaderClick?.(day)}
                  style={tileBgProps.style}
                  data-testid={`header-${normalizeDate(day)}`}
                  className={`h-full w-fullitems-center ${
                    isColumnView ? "flex justify-between p-2" : "flex-col "
                  } font-semibold ${
                    isMonthView ? "text-xs py-2 flex-row whitespace-nowrap" : "text-sm p-2"
                  } text-center cursor-grab  active:cursor-grabbing
                    ${tileBgProps.className}
                    ${isColumnActive(index) ? "bg-blue-200" : ""}
                    ${
                      isColumnHighlighted(index)
                        ? "bg-blue-100 border-b-2 border-blue-400"
                        : "border-b-2 border-gray-300 hover:border-blue-400"
                    }
                  `}
                >
                  <div className={`${isMonthView ? "text-sm" : "text-md"}`}>
                    {isMonthView && !isColumnView ? day.getDate() : formatDayOfWeek(day)}
                    <br />
                    {isMonthView && !isColumnView ? formatIntl(day, { weekday: "short" }) : ""}
                  </div>
                  <div
                    className={`bg-gray-100 font-semibold ${
                      isMonthView ? "text-[10px]" : "text-sm"
                    } text-center`}
                  >
                    <TotalHourCell
                      day={day}
                      dayEntry={dayEntry}
                      isMonthView={isMonthView}
                      colorClassName={tileBgProps.className}
                    />
                  </div>
                </div>
              </Draggable>
            </Droppable>
            <Tooltip id={`tooltip-hours-${formattedDay}`} className="z-50">
              <div>
                {dayEntry && <TotalHourForDay dayEntry={dayEntry} />}
                {timesheet.taskEntries
                  ?.filter((taskEntry) => taskEntry.dayEntry === dayEntry?.id)
                  .map((taskEntry) => (
                    <div key={taskEntry.id} className="mb-2 last:mb-0">
                      <TotalHourForTask taskEntry={taskEntry} />
                    </div>
                  ))}
              </div>
            </Tooltip>
          </React.Fragment>
        );
      })}
    </>
  );
}

export default TimeSheetHeaders;
