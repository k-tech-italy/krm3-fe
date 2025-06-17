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
   * Get the DayType for a given date, using the provided days.
   *
   * If no days are provided, WORK_DAY is returned.
   *
   * @param date the date to get the DayType for
   * @param days the days to check against
   * @returns the DayType for the given date
   */
export function getDayType(date: Date | string, days?: Days): DayType {
  const normalizedDate = normalizeDate(date);

  if (!days) {
    return DayType.WORK_DAY;
  }

  const dayEntry = days[normalizedDate];

  if (dayEntry?.closed) {
    return DayType.CLOSED_DAY;
  }

  if (dayEntry?.nwd && !dayEntry?.hol) {
    return DayType.NO_WORK_DAY;
  }

  if (dayEntry?.hol) {
    return DayType.BANK_HOLIDAY;
  }

 

  return DayType.WORK_DAY;
}
