import { DayEntry, Days, DayType, TaskEntry } from "../../../restapi/types";

import { getDatesBetween, normalizeDate } from "./dates";

export const getDatesWithAndWithoutDayEntries = (
  startDate: Date,
  endDate: Date,
  dayEntries: readonly DayEntry[],
  days: Days,
  skipHolidayAndSickDays?: boolean,
  skipNoWorkingDays?: boolean
): {
  allDates: string[];
  withDayEntries: string[];
  withoutDayEntries: string[];
} => {
  const dates = getDatesBetween(startDate, endDate, days, skipNoWorkingDays).filter((date) =>
    skipHolidayAndSickDays ? !isHoliday(date, dayEntries) && !isSickDay(date, dayEntries) : true
  );

  const entryDateSet = new Set(dayEntries.map((entry) => normalizeDate(entry.day)));

  const withDayEntries = dates.filter((date) => entryDateSet.has(normalizeDate(date)));

  const withoutDayEntries = dates.filter((date) => !entryDateSet.has(normalizeDate(date)));

  return {
    allDates: dates,
    withDayEntries,
    withoutDayEntries,
  };
};

export function calculateTaskHoursForDay(
  taskEntries: ReadonlyArray<Readonly<TaskEntry>>,
  dayEntries: ReadonlyArray<Readonly<DayEntry>>,
  date: string | Date
) {
  const dayEntry = dayEntries.find((entry) => normalizeDate(entry.day) === normalizeDate(date));

  if (!dayEntry) return 0;

  return taskEntries
    .filter((entry) => entry.dayEntry === dayEntry.id)
    .reduce(
      (total, entry) =>
        total +
        Number(entry.dayShiftHours || 0) +
        Number(entry.nightShiftHours || 0) +
        Number(entry.travelHours || 0),
      0
    );
}

export const isHoliday = (day: Date | string, dayEntries: readonly DayEntry[]): boolean => {
  const normalizedDay = normalizeDate(day);

  return dayEntries.some(
    (entry) => normalizeDate(entry.day) === normalizedDay && (entry.isHoliday || entry.askedHoliday)
  );
};

export const isSickDay = (day: Date | string, dayEntries: readonly DayEntry[]): boolean => {
  const normalizedDay = normalizeDate(day);

  return dayEntries.some((entry) => normalizeDate(entry.day) === normalizedDay && entry.isSick);
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
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
  return false;
}

export function isClosed(date: Date | string, dayEntries?: DayEntry[]): boolean {
  const normalizedDate = normalizeDate(date);

  return (
    dayEntries?.some((entry) => normalizeDate(entry.day) === normalizedDate && entry.closed) ??
    false
  );
}
