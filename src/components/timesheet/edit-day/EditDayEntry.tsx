import React, { useEffect, useState } from "react";
import {
  useCreateTimeEntry,
  useDeleteTimeEntries,
} from "../../../hooks/timesheet";
import { TimeEntry } from "../../../restapi/types";
import {
  calculateTotalHoursForDays,
  displayErrorMessage,
  getDatesBetween,
  normalizeDate,
} from "../utils";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import LoadSpinner from "../../commons/LoadSpinner";
interface Props {
  startDate: Date;
  endDate: Date;
  timeEntries: TimeEntry[];
  onClose: () => void;
}

export default function EditDayEntry({
  onClose,
  startDate,
  endDate,
  timeEntries,
}: Props) {
  const {
    mutateAsync: submitDays,
    isLoading,
    isError,
    error,
  } = useCreateTimeEntry();
  const { mutateAsync: deleteDays } = useDeleteTimeEntries();
  const startEntry = timeEntries.find(
    (item) => normalizeDate(item.date) === normalizeDate(startDate)
  );
  useEffect(() => {
    if (startEntry) {
      if (startEntry.leaveHours > 0) {
        setEntryType("leave");
        setLeaveHours(startEntry.leaveHours);
      }
      if (startEntry.holidayHours > 0) {
        setEntryType("holiday");
      }
      if (startEntry.sickHours > 0) {
        setEntryType("sick");
      }
    }
  }, [startEntry]);

  const [entryType, setEntryType] = useState<string | null>(null);
  const [leaveHours, setLeaveHours] = useState<number | undefined>();
  const [comment, setComment] = useState<string | undefined>(
    startEntry?.comment
  );
  const [leaveHoursError, setLeaveHoursError] = useState<string | null>(null);

  const [fromDate, setFromDate] = useState<Date>(
    startDate <= endDate ? startDate : endDate
  );
  const [toDate, setToDate] = useState<Date>(
    endDate >= startDate ? endDate : startDate
  );
  const updateDaysWithTimeEntries = (
    startDate: Date,
    endDate: Date
  ): string[] => {
    const dates = getDatesBetween(startDate, endDate);
    const datesWithTimeEntries = dates.filter((date) =>
      timeEntries.some(
        (timeEntry) => normalizeDate(timeEntry.date) === normalizeDate(date)
      )
    );
    return datesWithTimeEntries;
  };

  const [daysWithTimeEntries, setDaysWithTimeEntries] = useState<string[]>(
    updateDaysWithTimeEntries(fromDate, toDate)
  );

  function handleChangeDate(selectedDate: Date, dateType: "from" | "to") {
    if (dateType === "from") {
      setFromDate(selectedDate);
      setDaysWithTimeEntries(updateDaysWithTimeEntries(selectedDate, toDate));
    } else if (dateType === "to") {
      setToDate(selectedDate);
      setDaysWithTimeEntries(updateDaysWithTimeEntries(fromDate, selectedDate));
    }
  }

  const handleEntryTypeChange = (type: string) => {
    setEntryType(type);
    if (type !== "leave") {
      setLeaveHours(undefined); // Clear leave hours if not leave
    }
  };

  const handleLeaveHoursChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const totalHours = calculateTotalHoursForDays(
      timeEntries,
      daysWithTimeEntries
    );
    if (totalHours + Number(event.target.value) > 8) {
      setLeaveHoursError(
        "No overtime allowed when logging leave hours. Maximum allowed is 8 hours, Total hours: " +
          (totalHours + Number(event.target.value))
      );
    } else {
      setLeaveHoursError(null);
    }
    setLeaveHours(Number(event.target.value));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (entryType) {
      submitDays({
        dates: getDatesBetween(fromDate, toDate),
        holidayHours: entryType === "holiday" ? 8 : undefined,
        sickHours: entryType === "sick" ? 8 : undefined,
        leaveHours: entryType === "leave" ? leaveHours : undefined,
        dayShiftHours: 0, // Set dayShiftHours to 0 if 'cause is mandatory'
        comment: comment,
      }).then(onClose);
    }
  };

  function handleDeleteEntry(event: any): void {
    event.preventDefault();
    //DELETE API with skippedTaskId
    const skippedTaskId = daysWithTimeEntries.flatMap((day) => {
      return timeEntries
        .filter((item) => normalizeDate(item.date) === normalizeDate(day))
        .map((item) => item.id);
    });
    deleteDays(skippedTaskId).then(() => {
      onClose();
    });
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
        <div className="items-start " id="datepickers-container">
          <div className="text-lg font-bold">Days</div>
          <div className="flex flex-wrap" id="datepickers">
            <div className="w-full md:w-1/3  mb-4 md:mb-0">
              <label className="block text-sm font-medium mb-1">
                Dal giorno:
              </label>
              <DatePicker
                dateFormat="yyyy-MM-dd"
                maxDate={toDate}
                selected={fromDate}
                className="w-full border border-gray-300 rounded-md p-2"
                onChange={(date: Date | null) => {
                  if (!!date) {
                    handleChangeDate(date, "from");
                  }
                }}
              />
            </div>
            <div className="w-full md:w-1/3 px-2 mb-4 md:mb-0">
              <label className="block text-sm font-medium mb-1">
                Al giorno:
              </label>
              <DatePicker
                dateFormat="yyyy-MM-dd"
                selected={toDate}
                minDate={fromDate}
                className="w-full border border-gray-300 rounded-md p-2"
                onChange={(date: Date | null) => {
                  if (!!date) {
                    handleChangeDate(date, "to");
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Entry Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div
              id="day-entry-holiday-radio"
              className={`flex items-center justify-center px-4 py-2 border rounded-md cursor-pointer transition-colors ${
                entryType === "holiday"
                  ? "bg-yellow-100 border-yellow-500 text-yellow-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => handleEntryTypeChange("holiday")}
            >
              <input
                type="radio"
                name="entryType"
                value="holiday"
                checked={entryType === "holiday"}
                onChange={() => handleEntryTypeChange("holiday")}
                className="sr-only"
              />
              <span className="text-sm font-medium">Holiday</span>
            </div>

            <div
              id="day-entry-sick-days-radio"
              className={`flex items-center justify-center px-4 py-2 border rounded-md cursor-pointer transition-colors ${
                entryType === "sick"
                  ? "bg-yellow-100 border-yellow-500 text-yellow-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => handleEntryTypeChange("sick")}
            >
              <input
                type="radio"
                name="entryType"
                value="sick"
                checked={entryType === "sick"}
                onChange={() => handleEntryTypeChange("sick")}
                className="sr-only"
              />
              <span className="text-sm font-medium">Sick Day</span>
            </div>

            <div
              id="day-entry-leave-radio"
              className={`flex items-center justify-center px-4 py-2 border rounded-md cursor-pointer transition-colors ${
                entryType === "leave"
                  ? "bg-yellow-100 border-yellow-500 text-yellow-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => handleEntryTypeChange("leave")}
            >
              <input
                type="radio"
                name="entryType"
                value="leave"
                checked={entryType === "leave"}
                onChange={() => handleEntryTypeChange("leave")}
                className="sr-only"
              />
              <span className="text-sm font-medium">Leave</span>
            </div>
          </div>
        </div>

        {entryType === "leave" && (
          <div className="transition-all duration-300 ease-in-out">
            <label
              id="day-entry-leave-hour-label"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Leave Hours
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                id="day-entry-leave-hour-input"
                type="number"
                value={leaveHours || ""}
                onChange={handleLeaveHoursChange}
                min="1"
                max="8"
                step={0.5}
                required={entryType === "leave"}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm p-2 border"
                placeholder="Enter hours"
              />
            </div>
          </div>
        )}
        <div className="pt-4">
          <label
            id="day-entry-comments-label"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Comments
          </label>
          <textarea
            id="day-entry-comments-input"
            rows={3}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm p-2 border"
            placeholder="Add any notes here..."
            value={comment || ""}
            required={entryType === "leave" || entryType === "sick"}
            onChange={(e) => setComment(e.target.value)}
          ></textarea>
        </div>

        {daysWithTimeEntries.length > 0 && (
          <p className="text-orange-500" id="warning-message">
            <strong>Warning: </strong>

            {"A time entry already exists for the following days: " +
              daysWithTimeEntries.map((day) => day.split("-")[2]).join(", ") +
              ". Save to update"}
          </p>
        )}
        {isLoading && <LoadSpinner />}
        {error && (
          <div className="text-start text-red-500">
            <strong>Error: </strong>
            {displayErrorMessage(error) || "Something went wrong"}
          </div>
        )}
        {leaveHoursError && (
          <div className="text-start text-red-500">
            <strong>Error: </strong>
            {leaveHoursError}
          </div>
        )}

        <div className="pt-4 flex justify-between">
          <div>
            <button
              id="cancel-day-entry-form"
              type="button"
              onClick={handleDeleteEntry}
              disabled={daysWithTimeEntries.length === 0}
              className={`w-full flex justify-center py-2 px-4 mr-4 border border-transparent rounded-md shadow-smfont-medium text-white ${
                daysWithTimeEntries.length === 0
                  ? "cursor-not-allowed bg-gray-300"
                  : " bg-red-500 hover:bg-red-700 focus:outline-none"
              }`}
            >
              Delete
            </button>
          </div>
          <div className="flex justify-around">
            <button
              disabled={isLoading}
              className="px-4 py-2 mr-4 bg-[#4B6478] text-white   rounded-lg hover:bg-gray-500 focus:outline-none"
              id="close-button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              id="submit-day-entry-form"
              type="submit"
              disabled={isLoading || !entryType || !!leaveHoursError}
              className={`
                ${
                  isLoading || !entryType || !!leaveHoursError
                    ? "cursor-not-allowed bg-gray-300"
                    : "bg-yellow-600 hover:bg-yellow-700 focus:outline-none"
                }
                w-full flex justify-center py-2 px-4 ml-4 border border-transparent rounded-md shadow-sm font-medium text-white `}
            >
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
