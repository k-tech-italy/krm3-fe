import {HeaderColors, Schedule, TimeEntry} from "../../../restapi/types";
import {isDayInRange, normalizeDate} from "./dates";
import {isHoliday, isSickDay, isToday} from "./timeEntry";


export const defaultColors: string[] = [
  "#A7C7E7", // Soft blue
  "#FFD6A5", // Soft orange
  "#B5EAD7", // Soft teal
  "#F6DFEB", // Pale pink
  "#C7CEEA", // Soft lavender
  "#FFFACD", // Lemon chiffon
  "#E2F0CB", // Light green
  "#FFDAC1", // Peach
  "#D4A5A5", // Muted rose
  "#B5B9FF", // Periwinkle
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
export function displayErrorMessage(error?: any): string {
  // Check if the error has a response with data and take the first error field
  if (
    !!error &&
    error.response &&
    error.response.data &&
    error.response.data["error"]
  ) {
    return error.response.data["error"] as string;
  } else {
    return "an error occurred";
  }
}

export function getHolidayAndSickDays(
  timeEntries: TimeEntry[],
  dates: Date[]
): string[] {
  return dates
    .filter(
      (date) => isHoliday(date, timeEntries) || isSickDay(date, timeEntries)
    )
    .map(normalizeDate);
}

export function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function getTileBgColorProps(
    day: Date,
    totalWorkedHours: number,
    schedule: Schedule,
    isClosed?: boolean,
    colors?: HeaderColors
): { className: string; style?: React.CSSProperties } {
  if (isToday(day)) {
    return { className: "bg-table-today" };
  }
  const scheduledHours = schedule[normalizeDate(day).replaceAll("-", "_")] ?? 0;

  const isNoWorkDay = scheduledHours === 0;

  if (isNoWorkDay) {
    if (isClosed) {
      return { className: "bg-closed-non-work" };
    }
    return { className: "bg-table-row-alt" };
  }

  if (!isClosed) {
    if (colors && schedule) {
      let lightColor: string;
      let darkColor: string;

      if (totalWorkedHours > scheduledHours) {
        lightColor = colors.moreThanScheduleColorBrightTheme;
        darkColor = colors.moreThanScheduleColorDarkTheme;
      } else if (totalWorkedHours === scheduledHours) {
        lightColor = colors.exactScheduleColorBrightTheme;
        darkColor = colors.exactScheduleColorDarkTheme;
      } else {
        lightColor = colors.lessThanScheduleColorBrightTheme;
        darkColor = colors.lessThanScheduleColorDarkTheme;
      }
      
      return {
        className: `dynamic-header-bg`,
        style: {
          '--header-bg-light': lightColor,
          '--header-bg-dark': darkColor,
        } as React.CSSProperties,
      };
    }
    return { className: "bg-table-header" };
  }

  return { className: "bg-closed" };
}

export function getTimeEntriesForSelectedPeriod(
    timeEntries: TimeEntry[],
    start_date: string,
    end_date: string,
    taskId: number | null = null
) {
  return timeEntries.filter((timeEntry) =>
      isDayInRange(start_date, end_date, timeEntry.date) &&
      (taskId === null || timeEntry.task === taskId)
  );
}