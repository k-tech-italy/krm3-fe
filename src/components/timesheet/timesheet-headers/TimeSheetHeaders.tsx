import React from "react";
import { Tooltip } from "react-tooltip";
import { DayType, TimeEntry, Timesheet } from "../../../restapi/types";
import { Draggable } from "../Draggable";
import { Droppable } from "../Droppable";
import {formatDay, formatDayOfWeek, formatIntl, normalizeDate} from "../utils/dates";
import {getDayType, isClosed, isNonWorkingDay, isToday} from "../utils/timeEntry";
import { TotalHourCell, TotalHourForTask } from "./TotalHour";
import { getTileBgColorClass } from "../utils/utils.ts";
import {locale} from "moment";

interface Props {
  timesheet: Timesheet;
  scheduledDays: { days: Date[]; numberOfDays: number };
  isColumnView: boolean;
  isMonthView: boolean;
  isColumnActive: (index: number) => boolean;
  isColumnHighlighted: (index: number) => boolean;
  selectedWeekdays?: Date[];
}

function TimeSheetHeaders({
  timesheet,
  scheduledDays,
  isColumnView,
  isMonthView,
  isColumnActive,
  isColumnHighlighted,
  selectedWeekdays,
}: Props) {
  return (
    <>
      {scheduledDays.days.map((day, index) => (
        <React.Fragment key={index}>
          <Droppable
            key={index}
            id={`column-${index}`}
            isDisabled={
              getDayType(day, timesheet.days) === DayType.CLOSED_DAY ||
              (!isMonthView &&
                !selectedWeekdays?.some(
                  (date) => date.getTime() === day.getTime()
                ))
            }
          >
            <Draggable
              id={`column-${index}`}
              isDisabled={
                getDayType(day, timesheet.days) === DayType.CLOSED_DAY ||
                (!isMonthView &&
                  !selectedWeekdays?.some(
                    (date) => date.getTime() === day.getTime()
                  ))
              }
            >
              <div
                className={`h-full w-fullitems-center ${
                  isColumnView ? "flex justify-between p-2" : "flex-col "
                } font-semibold ${
                  isMonthView ? "text-xs py-2 flex-row whitespace-nowrap" : "text-sm p-2"
                } text-center cursor-grab  active:cursor-grabbing
   
              ${
                getDayType(day, timesheet.days) !== DayType.WORK_DAY
                  ? "cursor-not-allowed" : ""
              }
              ${getTileBgColorClass(day, isNonWorkingDay(day, timesheet.days), isClosed(day, timesheet.days))}
              
               ${isColumnActive(index) ? "bg-blue-200" : ""}
              ${
                isColumnHighlighted(index)
                  ? "bg-blue-100 border-b-2 border-blue-400"
                  : "border-b-2 border-gray-300 hover:border-blue-400"
              }
              `}
              >
                <div className={`${isMonthView ? "text-sm" : "text-md"}`}>
                  {isMonthView && !isColumnView
                    ? day.getDate()
                    : formatDayOfWeek(day)}
                  <br/>
                  {isMonthView && !isColumnView ? formatIntl(day, { weekday: "short" }) : ""}
                </div>
                <div
                  className={`bg-gray-100 font-semibold ${
                    isMonthView ? "text-[10px]" : "text-sm"
                  } text-center`}
                >
                  <TotalHourCell
                    day={day}
                    timeEntries={timesheet?.timeEntries || []}
                    isMonthView={isMonthView}
                    isColumnView={isColumnView}
                    isNoWorkDay={
                      isNonWorkingDay(day, timesheet.days)
                    }
                    isClosedDay={isClosed(day, timesheet.days)}
                  />
                </div>
              </div>
            </Draggable>
          </Droppable>
          <Tooltip id={`tooltip-hours-${normalizeDate(day)}`} className="z-50">
            <div className="">
              {timesheet?.timeEntries
                .filter(
                  (entry) => normalizeDate(entry.date) === normalizeDate(day)
                )
                .map((timeEntry: TimeEntry, index: number) => (
                  <div key={index} className="mb-2 last:mb-0">
                    <TotalHourForTask timeEntry={timeEntry} />
                  </div>
                ))}
            </div>
          </Tooltip>
        </React.Fragment>
      ))}
    </>
  );
}

export default TimeSheetHeaders;
