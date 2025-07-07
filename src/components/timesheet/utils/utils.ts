import { AxiosError } from "axios";
import { TimeEntry } from "../../../restapi/types";
import { normalizeDate } from "./dates";
import { isHoliday, isSickDay } from "./timeEntry";

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
export function displayErrorMessage(error?: any): string {
  // Check if the error has a response with data and take the first error field
  if (!!error && error.response && error.response.data && error.response.data["error"]) {
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

export function isValidUrl(url: string)
{
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}