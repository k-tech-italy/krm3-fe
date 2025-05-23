// Create a Date at noon to avoid timezone issues
export const formatDate = (date: Date | string): Date => {
  const d = new Date(date);
  return new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    12, // set time to noon
    0,
    0
  );
};

// Convert a date to YYYY-MM-DD string format
export const normalizeDate = (date: Date | string): string => {
  const d = formatDate(date); // ensure consistent day
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// Format a date to display the day of the month and weekday
export const formatDay = (date: Date) =>
  date.toLocaleDateString("en-US", {
    day: "numeric",
    weekday: "narrow",
  });

// Format a date to display the month name and year
export const formatMonthName = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

// Format a date to display the weekday and day of the month
export const formatDayOfWeek = (date: Date) =>
  date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
  });

// Format a date to display the day and month
export const formatDayAndMonth = (date: Date) =>
  date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });

// Get an array of Date objects between two dates, inclusive
export const getDateRange = (start: Date, end: Date): Date[] => {
  const days: Date[] = [];
  for (
    let currentDate = new Date(start);
    currentDate <= end;
    currentDate.setDate(currentDate.getDate() + 1)
  ) {
    days.push(new Date(currentDate));
  }
  return days;
};

// Get an array of Date objects between two string dates, inclusive
export const getDaysBetween = (startDate: string, endDate: string): Date[] => {
  const start = formatDate(new Date(startDate));
  const end = formatDate(new Date(endDate));
  const days: Date[] = [];
  for (
    let currentDate = new Date(start);
    currentDate <= end;
    currentDate.setDate(currentDate.getDate() + 1)
  ) {
    days.push(new Date(currentDate));
  }
  return days;
};

// Get an array of date strings between two dates, inclusive
export function getDatesBetween(fromDate: Date, toDate: Date): string[] {
  const dates: string[] = [];
  const currentDate = formatDate(fromDate);
  const endDate = formatDate(toDate);

  while (currentDate <= endDate) {
    dates.push(normalizeDate(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}

// Check if a date is a weekend
export function isWeekendDay(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

