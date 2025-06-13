import { Days } from "../../../restapi/types";

/**
 * Create a Date at local noon (to avoid timezone/DST shifts)
 * @param d input Date or ISO-string
 */
export function formatDate(d: Date | string): Date {
  const dt = typeof d === "string" ? new Date(d) : new Date(d.getTime());
  return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 12, 0, 0, 0);
}

/**
 * Format a Date (or date-string) into 'YYYY-MM-DD'
 */
export function normalizeDate(input: Date | string): string {
  const d = formatDate(input);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Generic wrapper around Intl.DateTimeFormat
 * @param input Date or date-string
 * @param options Intl formatting options
 * @param locale BCP-47 locale (default 'en-US')
 */
export function formatIntl(
  input: Date | string,
  options: Intl.DateTimeFormatOptions,
  locale = "en-US"
): string {
  const d = typeof input === "string" ? new Date(input) : input;
  return d.toLocaleDateString(locale, options);
}

// ——— Specific formatters ——————————————————————————————————————————————

/** e.g. “W 3” or “T 12” */
export const formatDay = (d: Date | string, locale?: string) =>
  formatIntl(d, { weekday: "narrow", day: "numeric" }, locale);

/** e.g. “Tue 12” */
export const formatDayOfWeek = (d: Date | string, locale?: string) =>
  formatIntl(d, { weekday: "short", day: "numeric" }, locale);

/** e.g. “May 2025” */
export const formatMonthName = (d: Date | string, locale?: string) =>
  formatIntl(d, { month: "long", year: "numeric" }, locale);

/** e.g. “12 May” */
export const formatDayAndMonth = (d: Date | string, locale?: string) =>
  formatIntl(d, { day: "numeric", month: "short" }, locale);

// ——— Range generators ——————————————————————————————————————————————

/**
 * Returns an array of Date objects from `start` → `end` inclusive.
 * Goes forwards or backwards depending on which is earlier.
 */
export function getDateRange(start: Date | string, end: Date | string): Date[] {
  const s = formatDate(start);
  const e = formatDate(end);
  const step = s <= e ? 1 : -1;
  const result: Date[] = [];
  const cur = new Date(s);

  while ((step > 0 && cur <= e) || (step < 0 && cur >= e)) {
    result.push(new Date(cur));
    cur.setDate(cur.getDate() + step);
  }

  return result;
}

/**
 * Returns an array of 'YYYY-MM-DD' strings from `start` → `end` inclusive.
 * If `skipBankHolidays` is true and `noWorkingDays` is provided, excludes bank holidays.
 */
export function getDatesBetween(
  start: Date | string,
  end: Date | string,
  skipNoWorkingDays?: boolean,
  noWorkingDays?: Days
): string[] {
  if (skipNoWorkingDays && noWorkingDays) {
    return getDateRange(start, end).filter(
      (date) => isNoWorkOrBankHol(date, noWorkingDays) === DayType.WORK_DAY
    ).map(normalizeDate);
  }
  return getDateRange(start, end).map(normalizeDate);
}

//if is nwd true and hol false is nwd
//if is nwd ture adn hol true is bank holiday
//if is nwd false and hol true is bank holiday
export const enum DayType {
  WORK_DAY = "work",
  NO_WORK_DAY = "nwd",
  BANK_HOLIDAY = "hol",
}

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
export function isNoWorkOrBankHol(input: Date | string, days?: Days): DayType {
  const d = normalizeDate(input);
  if (!days) return DayType.WORK_DAY;
  if (days[d]?.nwd && !days[d]?.hol) return DayType.NO_WORK_DAY;
  if (days[d]?.hol) return DayType.BANK_HOLIDAY;
  return DayType.WORK_DAY;
}

export function getFirstMondayOfMonth(inputDate: Date): number
{
  const firstDayOfMonth = new Date(inputDate.getFullYear(), inputDate.getMonth(), 1)

  const addToGetMonday = {
    0: 1,
    1: 0,
    2: 6,
    3: 5,
    4: 4,
    5: 3,
    6: 2
  } as const
  type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

  return firstDayOfMonth.getDate() + addToGetMonday[firstDayOfMonth.getDay() as Weekday]
}