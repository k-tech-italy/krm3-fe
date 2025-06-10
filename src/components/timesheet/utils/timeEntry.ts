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
 * @returns {string[]} An array of 'YYYY-MM-DD' strings
 */
export const getDatesWitTimeEntries = (
    startDate: Date,
    endDate: Date,
    timeEntries: TimeEntry[]
  ): string[] => {
    const dates = getDatesBetween(startDate, endDate);
    const datesWithTimeEntries = dates.filter((date) =>
      timeEntries.some(
        (timeEntry) => normalizeDate(timeEntry.date) === normalizeDate(date)
      )
    );
    return datesWithTimeEntries;
  };