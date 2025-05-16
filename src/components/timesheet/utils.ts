import { TimeEntry } from "../../restapi/types";

export const normalizeDate = (date: Date | string): string => {
  // Normalize the date to YYYY-MM-DD format
  // Take care of user Location

  const d = typeof date === "string" ? new Date(date) : date;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
};

export const pastelColors: string[] = [
  "#c9e4ca",
  "#f2c5b9",
  "#e5d8b6",
  "#c7f464",
  "#f5c2c7",
  "#f8e231",
  "#d7f0db",
  "#ffd7be",
  "#c5e1a5",
];

export const getPastelColor = (
  index: number
): { backgroundColor: string; borderColor: string } => {
  const color = pastelColors[index % pastelColors.length];
  return {
    backgroundColor: `${color}50`,
    borderColor: color,
  };
};

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

export function displayErrorMessage(error: any): string[] | undefined {
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


export function calculateTotalHoursForDays(timeEntries: TimeEntry[], dates: string[]): number {
  return dates.reduce((totalHours, date) => {
    const dailyEntries = timeEntries.filter(
      (entry) => normalizeDate(entry.date) === date
    );
    const dailyTotal = dailyEntries.reduce((sum, entry) => {
      return sum + (Number(entry.dayShiftHours) || 0) + 
                   (Number(entry.nightShiftHours) || 0) + 
                   (Number(entry.travelHours) || 0);
    }, 0);
    return totalHours + dailyTotal;
  }, 0);
}
