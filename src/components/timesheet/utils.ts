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

export const getPastelColor = (index: number): { backgroundColor: string; borderColor: string } => {
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