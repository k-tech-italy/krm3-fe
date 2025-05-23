
export const normalizeDate = (date: Date | string): string => {
  // Normalize the date to YYYY-MM-DD format
  // Take care of user Location
  const d = typeof date === "string" ? new Date(date) : date;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
};



export const formatDay = (date: Date) =>
  date.toLocaleDateString("en-US", {
    day: "numeric",
    weekday: "narrow",
  });

export const formatMonthName = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

export const formatDayOfWeek = (date: Date) =>
  date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
  });

  export const formatDayAndMonth = (date: Date) =>
  date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
