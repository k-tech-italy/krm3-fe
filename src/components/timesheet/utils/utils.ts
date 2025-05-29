import { TimeEntry, Timesheet } from "../../../restapi/types";
import { normalizeDate } from "./dates";

export const defaultColors: string[] = [
  "#fd8a8a",
  "#9ea1d4",
  "#ffcbcb",
  "#f1f7b5",
  "#a8d1d1",
  "#dfebeb",
  "#d7f0db",
  "#ffd7be",
  "#c5e1a5",
  "#ffe7ce",
];

/**
 * Generates a color for a task based on the row it is in or the specified color.
 * The color will be a lighter version of the specified color. If no color is
 * specified, it will use the next color in the default color array.
 */
export function getTaskColor(
  row: number,
  taskColor?: string
): { backgroundColor: string; borderColor: string } {
  const color =
    !taskColor || taskColor === ""
      ? defaultColors[row % defaultColors.length]
      : taskColor;
  const backgroundColor = `${color}50`;
  const borderColor = color;
  return { backgroundColor, borderColor };
}

/**
 * Display the error message from the API response.
 * @param error The error object that is passed from the API call.
 * @returns The error message as a string or undefined if it is not available.
 */
export function displayErrorMessage(error: any): string | undefined {
  // Check if the error has a response with data and take the first error field
  if (error.response) {
    return error.response.data["error"];
  }
}

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
              (Number(entry.travelHours) || 0),
            0
          )
      ),
    0
  );
}

export const isHoliday = (day: Date, timesheet: Timesheet): boolean => {
  return (
    timesheet.timeEntries?.some((entry) => {
      if (!entry.holidayHours || entry.holidayHours <= 0) return false;
      const entryDate = new Date(entry.date);
      return entryDate.toDateString() === day.toDateString();
    }) ?? false
  );
};

export const isSickDay = (day: Date, timesheet: Timesheet): boolean => {
  return (
    timesheet?.timeEntries?.some((entry) => {
      if (!entry.sickHours || entry.sickHours <= 0) return false;
      const entryDate = new Date(entry.date);
      return entryDate.toDateString() === day.toDateString();
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
