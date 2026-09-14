import { ApiErrorData, DayEntry, HeaderColors, Schedule } from "../../../restapi/types";
import { normalizeDate } from "./dates";
import { isHoliday, isSickDay, isToday } from "./entryUtils";
import { isAxiosError } from "axios";

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
    !taskColor || taskColor === "" ? defaultColors[row % defaultColors.length] : taskColor;
  const backgroundColor = `${color}50`;
  const borderColor = color;
  return { backgroundColor, borderColor };
}

/**
 * Extracts an error message from an Axios API error.
 *
 * Returns the message from `response.data.error` when it is a string.
 * Otherwise, returns a generic fallback message.
 *
 * @param error - The unknown error returned by an API request.
 * @returns The API error message or `"an error occurred"` when unavailable.
 */
export function displayErrorMessage(error?: unknown): string {
  if (isAxiosError<ApiErrorData>(error) && typeof error.response?.data?.error === "string") {
    return error.response.data.error;
  }

  return "an error occurred";
}

export function getHolidayAndSickDays(dayEntries: readonly DayEntry[], dates: Date[]): string[] {
  return dates
    .filter((date) => isHoliday(date, dayEntries) || isSickDay(date, dayEntries))
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
  colors?: HeaderColors,
  isHolidayOrSickDay?: boolean
): { className: string; style?: React.CSSProperties } {
  if (isToday(day)) {
    return { className: "bg-table-today" };
  }
  if (isHolidayOrSickDay) {
    if (colors) {
      return {
        className: `dynamic-header-bg`,
        style: {
          "--header-bg-light": colors.exactScheduleColorBrightTheme,
          "--header-bg-dark": colors.exactScheduleColorDarkTheme,
        } as React.CSSProperties,
      };
    }
    return { className: "bg-table-header" };
  }
  const scheduledHours = schedule[normalizeDate(day).replaceAll("-", "_")] ?? 0;

  const isNoWorkDay = scheduledHours === 0;

  if (isNoWorkDay && totalWorkedHours === 0) {
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
          "--header-bg-light": lightColor,
          "--header-bg-dark": darkColor,
        } as React.CSSProperties,
      };
    }
    return { className: "bg-table-header" };
  }

  return { className: "bg-closed" };
}
