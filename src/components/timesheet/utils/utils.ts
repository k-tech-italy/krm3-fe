import { TimeEntry } from "../../../restapi/types";
import { normalizeDate } from "./dates";

export const defaultColors: string[] = [
  "#c9e4ca",
  "#f2c5b9",
  "#e5d8b6",
  "#c7f464",
  "#f5c2c7",
  "#f8e231",
  "#d7f0db",
  "#ffd7be",
  "#c5e1a5",
  "#ffe7ce",
];

export function getTaskColor(
  row: number,
  taskColor?: string
): { backgroundColor: string; borderColor: string } {
  const color = taskColor || defaultColors[row % defaultColors.length];
  return {
    backgroundColor: `${color}50`,
    borderColor: color,
  };
}

export const getDaysBetween = (startDate: string, endDate: string): Date[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days: Date[] = [];

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  for (
    let currentDate = new Date(start);
    currentDate <= end;
    currentDate.setDate(currentDate.getDate() + 1)
  ) {
    days.push(new Date(currentDate));
  }
  return days;
};

export function displayErrorMessage(error: any): string | undefined {
  // Check if the error has a response with data and take the first error field
  if (error.response && error.response.data) {
    return error.response.data["error"];
  }
}

export function getDatesBetween(fromDate: Date, toDate: Date): string[] {
  const dates: string[] = [];
  const currentDate = new Date(fromDate.getTime());

  while (normalizeDate(currentDate) <= normalizeDate(toDate)) {
    dates.push(normalizeDate(new Date(currentDate)));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}

export function isWeekendDay(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function calculateTotalHoursForDays(
  timeEntries: TimeEntry[],
  dates: string[]
): number {
  return dates.reduce(
    (totalHours, date) =>
      Math.max(
        totalHours,
        timeEntries
          .filter((entry) => normalizeDate(entry.date) === date)
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
