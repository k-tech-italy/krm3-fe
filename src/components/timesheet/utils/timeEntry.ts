import { TimeEntry } from "../../../restapi/types";
import { getDatesBetween, normalizeDate } from "./dates";

/**
 * Given a start date, an end date, and an array of TimeEntry objects,
 * returns an array of 'YYYY-MM-DD' strings representing the dates
 * between the start and end date (inclusive) for which there is at least
 * one TimeEntry object.
 *
 * @param {Date} startDate The start date
 * @param {Date} endDate The end date
 * @param {TimeEntry[]} timeEntries An array of TimeEntry objects
 * @param {boolean} [skipClosedTimeEntries=false] If true, skip TimeEntry objects with state === "CLOSED"
 * @returns {string[]} An array of 'YYYY-MM-DD' strings
 */
export const getDatesWithTimeEntries = (
  startDate: Date,
  endDate: Date,
  timeEntries: TimeEntry[],
  skipClosedTimeEntries: boolean = false
): string[] => {
    const filteredTimeEntries = skipClosedTimeEntries
    ? timeEntries.filter((timeEntry) => timeEntry.state !== "CLOSED")
    : timeEntries;
  const dates = getDatesBetween(startDate, endDate);
  return dates.filter((date) =>
    filteredTimeEntries.some(
      (timeEntry) => normalizeDate(timeEntry.date) === normalizeDate(date)
    )
  );
};

export const getDatesWithoutClosedTimeEntries = (startDate: Date,
  endDate: Date, timeEntries: TimeEntry[]) => {
    const dates = getDatesBetween(startDate, endDate);
    const filteredTimeEntries = timeEntries.filter((timeEntry) => timeEntry.state !== "CLOSED")
    if (filteredTimeEntries.length === 0) {
      return dates;
    }
    return dates.filter((date) =>
      filteredTimeEntries.some(
        (timeEntry) => normalizeDate(timeEntry.date) === normalizeDate(date)
      )
    );
   

}