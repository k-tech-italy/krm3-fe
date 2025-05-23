
/** 
 * Create a Date at local noon (to avoid timezone/DST shifts) 
 * @param d input Date or ISO-string 
 */
export function formatDate(d: Date | string): Date {
  const dt = typeof d === 'string' ? new Date(d) : new Date(d.getTime());
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
  locale = 'en-US'
): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  return d.toLocaleDateString(locale, options);
}

// ——— Specific formatters ——————————————————————————————————————————————

/** e.g. “W 3” or “T 12” */
export const formatDay = (d: Date | string, locale?: string) =>
  formatIntl(d, { weekday: 'narrow', day: 'numeric' }, locale);

/** e.g. “Tue 12” */
export const formatDayOfWeek = (d: Date | string, locale?: string) =>
  formatIntl(d, { weekday: 'short', day: 'numeric' }, locale);

/** e.g. “May 2025” */
export const formatMonthName = (d: Date | string, locale?: string) =>
  formatIntl(d, { month: 'long', year: 'numeric' }, locale);

/** e.g. “12 May” */
export const formatDayAndMonth = (d: Date | string, locale?: string) =>
  formatIntl(d, { day: 'numeric', month: 'short' }, locale);

// ——— Range generators ——————————————————————————————————————————————

/**
 * Returns an array of Date objects from `start` → `end` inclusive.
 * Goes forwards or backwards depending on which is earlier.
 */
export function getDateRange(
  start: Date | string,
  end: Date | string
): Date[] {
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
 */
export function getDatesBetween(
  start: Date | string,
  end: Date | string
): string[] {
  return getDateRange(start, end).map(normalizeDate);
}

// ——— Misc ——————————————————————————————————————————————————————————

/** Returns true if the given date is Saturday or Sunday */
export function isWeekendDay(input: Date | string): boolean {
  const d = typeof input === 'string' ? new Date(input) : input;
  const day = d.getDay();
  return day === 0 || day === 6;
}
