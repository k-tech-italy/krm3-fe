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

  // Build a Set of all normalized time entry dates for O(1) lookup
  const entryDateSet = new Set(timeEntries.map(e => normalizeDate(e.date)));

  const withTimeEntries = dates.filter(date => entryDateSet.has(normalizeDate(date)));
  const withoutTimeEntries = dates.filter(date => !entryDateSet.has(normalizeDate(date)));

  return { allDates: dates, withTimeEntries, withoutTimeEntries };
};

//Calculate the total hours for a list of dates. This function takes a list of
export function calculateTotalHoursForDays(
  timeEntries: TimeEntry[],
  dates: string[],
  newValue: number,
  changedField: "restHours" | "leaveHours" | "specialLeaveHours"
): number {
  // Group time entries by normalized date for O(1) lookup
  const entriesByDate: Record<string, TimeEntry[]> = {};
  for (const entry of timeEntries) {
    const date = normalizeDate(entry.date);
    if (!entriesByDate[date]) entriesByDate[date] = [];
    if(entry.task === null){
      entry[changedField] = newValue
    }
    entriesByDate[date].push(entry);
  }

  return dates.reduce((totalHours, date) => {
    const entries = entriesByDate[date] || [];
    const dailyTotal = entries.reduce(
      (sum, entry) =>
        sum +
        (Number(entry.dayShiftHours) || 0) +
        (Number(entry.nightShiftHours) || 0) +
        (Number(entry.travelHours) || 0) +
        (Number(entry.restHours) || 0) +
        (Number(entry.specialLeaveHours) || 0) +
        (Number(entry.leaveHours) || 0),
      0
    );
    return Math.max(totalHours, dailyTotal);
  }, 0);
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

export const isToday= (date: Date): boolean => {
  const today = new Date()
  return date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();
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
export function isNonWorkingDay(date: Date | string, days?: Days): boolean {
  const normalizedDate = normalizeDate(date);

  if (!days) {
    return false;
  }
  const dayEntry = days[normalizedDate];

  if (dayEntry?.nwd || dayEntry?.hol) {
    return true;
  }
  return false
}
export function isClosed(date: Date | string, days?: Days): boolean {
  const normalizedDate = normalizeDate(date);

  if (!days) {
    return false;
  }
  const dayEntry = days[normalizedDate];

  if (dayEntry?.closed) {
    return true;
  }
  return false
}

// Optimized batch lookup helpers for use in loops
export function createHolidaySickDayMaps(timeEntries: TimeEntry[]) {
  const holidaySet = new Set<string>();
  const sickSet = new Set<string>();
  const entriesByTaskAndDate: Record<string, Record<string, TimeEntry[]>> = {};

  for (const entry of timeEntries) {
    const date = normalizeDate(entry.date);
    if (entry.holidayHours && entry.holidayHours > 0) holidaySet.add(date);
    if (entry.sickHours && entry.sickHours > 0) sickSet.add(date);
    // For getTimeEntriesForTaskAndDay
    if (!entriesByTaskAndDate[entry.task]) entriesByTaskAndDate[entry.task] = {};
    if (!entriesByTaskAndDate[entry.task][date]) entriesByTaskAndDate[entry.task][date] = [];
    entriesByTaskAndDate[entry.task][date].push(entry);
  }

  return {
    isHoliday: (date: Date | string) => holidaySet.has(normalizeDate(date)),
    isSickDay: (date: Date | string) => sickSet.has(normalizeDate(date)),
    getTimeEntriesForTaskAndDay: (taskId: number, day?: Date) => {
      if (!day) return Object.values(entriesByTaskAndDate[taskId] || {}).flat();
      return entriesByTaskAndDate[taskId]?.[normalizeDate(day)] || [];
    },
  };
}
