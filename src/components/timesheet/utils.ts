export const normalizeDate = (date: Date | string): string => {
  // Normalize the date to YYYY-MM-DD format
  // Take care of user Location

  const d = typeof date === "string" ? new Date(date) : date;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
};

export const generatePastelColor = (): string => {
  // Generate a random pastel color
  const randomValue = () => Math.floor(Math.random() * 128 + 127);
  const r = randomValue();
  const g = randomValue();
  const b = randomValue();
  return `rgb(${r}, ${g}, ${b})`;
};
