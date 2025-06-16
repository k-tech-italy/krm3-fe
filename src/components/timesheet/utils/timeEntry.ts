import { Days, DayType, TimeEntry, Timesheet } from "../../../restapi/types";
import { getDatesBetween, normalizeDate } from "./dates";

export const getDatesWithAndWithoutTimeEntries = (
  startDate: Date,
  endDate: Date,
  timeEntries: TimeEntry[],
  days: Days,
  skipHolidayAndSickDays?: boolean,
  skipNoWorkingDays?: boolean
): {
  allDates: string[];
  withTimeEntries: string[];
  withoutTimeEntries: string[];
} => {
  const dates = getDatesBetween(
    startDate,
    endDate,
    days,
    skipNoWorkingDays
  ).filter((date) =>
    skipHolidayAndSickDays
      ? !isHoliday(date, timeEntries) && !isSickDay(date, timeEntries)
      : true
  );
  const withTimeEntries = dates.filter((date) =>
    timeEntries.some(
      (timeEntry) => normalizeDate(timeEntry.date) === normalizeDate(date)
    )
  );
  const withoutTimeEntries = dates.filter(
    (date) => !withTimeEntries.includes(normalizeDate(date))
  );
  return { allDates: dates, withTimeEntries, withoutTimeEntries };
};

//Calculate the total hours for a list of dates. This function takes a list of
export function calculateTotalHoursForDays(
  timeEntries: TimeEntry[],
  dates: string[]
): number {
  return dates.reduce(
    // Use the maximum total hours for each day.
    // This is done to prevent a situation where a day has both day and night
    // shift hours, and the total hours for the day are calculated as the
    // maximum of the two.
    (totalHours, date) =>
      Math.max(
        totalHours,
        // Filter time entries for the current date
        timeEntries
          .filter((entry) => normalizeDate(entry.date) === date)
          // Calculate the total hours for the day
          .reduce(
            (dailyTotal, entry) =>
              dailyTotal +
              (Number(entry.dayShiftHours) || 0) +
              (Number(entry.nightShiftHours) || 0) +
              (Number(entry.travelHours) || 0) +
              (Number(entry.restHours) || 0) +
              (Number(entry.leaveHours) || 0),
            0
          )
      ),
    0
  );
}

export const isHoliday = (
  day: Date | string,
  timeEntries: TimeEntry[]
): boolean => {
  return (
    timeEntries?.some((entry) => {
      if (!entry.holidayHours || entry.holidayHours <= 0) return false;
      return normalizeDate(entry.date) === normalizeDate(day);
    }) ?? false
  );
};

export const isSickDay = (
  day: Date | string,
  timeEntries: TimeEntry[]
): boolean => {
  return (
    timeEntries?.some((entry) => {
      if (!entry.sickHours || entry.sickHours <= 0) return false;
      return normalizeDate(entry.date) === normalizeDate(day);
    }) ?? false
  );
};

export const getTimeEntriesForTaskAndDay = (
  taskId: number,
  timesheet: Timesheet,
  day?: Date
): TimeEntry[] => {
  if (!timesheet.timeEntries) return [];
  if (!day) {
    return timesheet.timeEntries.filter((entry) => entry.task === taskId);
  }
  return timesheet.timeEntries.filter(
    (entry) =>
      entry.task === taskId && normalizeDate(entry.date) === normalizeDate(day)
  );
};
/**
 * Given a Date or date-string `input` and an optional object of bank holidays and no working days
 * `days`, returns the type of day that `input` is. If `days` is not provided,
 * `input` is assumed to be a work day.
 *
 * @param {Date|string} input A Date or date-string to check
 * @param {Days} [days] An object of bank holidays and no working days, where the keys are the dates
 * in 'YYYY-MM-DD' format, and the values are objects with a single boolean
 * property `hol` indicating whether the date is a bank holiday, and
 * boolean property `nwd` indicating whether the date is a non-working day.
 * @returns {DayType} The type of day that `input` is, which can be one of
 * `DayType.WORK`, `DayType.NO_WORK_DAY`, or `DayType.BANK_HOLIDAY`.
 */

export function getDayType(date: Date | string, days?: Days): DayType {
  const normalizedDate = normalizeDate(date);

  if (!days) {
    return DayType.WORK_DAY;
  }

  const dayEntry = days[normalizedDate];

  if (dayEntry?.nwd && !dayEntry?.hol) {
    return DayType.NO_WORK_DAY;
  }

  if (dayEntry?.hol) {
    return DayType.BANK_HOLIDAY;
  }

  if (dayEntry?.locked) {
    return DayType.LOCKED_DAY;
  }

  return DayType.WORK_DAY;
}
