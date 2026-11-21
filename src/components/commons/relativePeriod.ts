import moment from "moment";

/**
 * A period ending today and going back a number of days, months or years, written as a number followed by
 * d/D (days), m/M (months) or a/A (years, "anni"): e.g. "30d", "3m", "1a".
 */
export interface RelativePeriod {
  amount: number;
  unit: "d" | "m" | "a";
}

const PATTERN = /^\s*(\d{1,4})\s*([dma])\s*$/i;
const MOMENT_UNITS = { d: "days", m: "months", a: "years" } as const;
const UNIT_NAMES = { d: ["day", "days"], m: ["month", "months"], a: ["year", "years"] } as const;

/** The period written in `text`, or null when it is not a valid period. */
export function parseRelativePeriod(text: string): RelativePeriod | null {
  const match = PATTERN.exec(text);
  if (!match) return null;
  const amount = Number(match[1]);
  if (amount < 1) return null;
  return { amount, unit: match[2].toLowerCase() as RelativePeriod["unit"] };
}

/** The canonical way to write a period, e.g. " 3 M " -> "3m"; the text itself when it is not valid. */
export function normalizeRelativePeriod(text: string): string {
  const period = parseRelativePeriod(text);
  return period ? `${period.amount}${period.unit}` : text.trim();
}

/** The period as people read it, e.g. "3m" -> "3 months". */
export function describeRelativePeriod(text: string): string {
  const period = parseRelativePeriod(text);
  if (!period) return text;
  const [singular, plural] = UNIT_NAMES[period.unit];
  return `${period.amount} ${period.amount === 1 ? singular : plural}`;
}

/** The dates (YYYY-MM-DD) from `amount` units before `today` to `today`. */
export function resolveRelativePeriod(
  period: RelativePeriod,
  today: Date = new Date()
): { from: string; to: string } {
  const end = moment(today);
  return {
    from: end.clone().subtract(period.amount, MOMENT_UNITS[period.unit]).format("YYYY-MM-DD"),
    to: end.format("YYYY-MM-DD"),
  };
}
