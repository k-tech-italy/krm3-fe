import React, { useEffect, useState } from "react";
import {
  useCreateTimeEntry,
  useDeleteTimeEntries,
  useGetSpecialReason,
} from "../../../hooks/useTimesheet";
import { Days, TimeEntry } from "../../../restapi/types";
import {
  calculateTotalHoursForDays,
  displayErrorMessage,
} from "../utils/utils";
import { getDatesBetween } from "../utils/dates";
import { normalizeDate } from "../utils/dates";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import LoadSpinner from "../../commons/LoadSpinner";
import ErrorMessage from "./ErrorMessage";
import WarningExistingEntry from "./WarningExistEntry";
import Krm3Button from "../../commons/Krm3Button";
import { CheckIcon, TrashIcon } from "lucide-react";
import { getDatesWithTimeEntries } from "../utils/timeEntry";

interface Props {
  startDate: Date;
  endDate: Date;
  timeEntries: TimeEntry[];
  onClose: () => void;
  readOnly: boolean;
  selectedResourceId: number | null;
  noWorkingDays?: Days;
}

export default function EditDayEntry({
  onClose,
  startDate,
  endDate,
  timeEntries,
  readOnly,
  selectedResourceId,
  noWorkingDays,
}: Props) {
  const {
    mutateAsync: submitDays,
    isLoading,
    isError,
    error,
  } = useCreateTimeEntry(selectedResourceId);
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
      if (startEntry.specialLeaveHours > 0) {
        setEntryType("special");
        //setSpecialReason(startEntry.specialReason);
      }
      if (startEntry.restHours > 0) {
        setEntryType("rest");
        setRestHours(startEntry.restHours);
      }
    }
  }, [startEntry]);

  const [entryType, setEntryType] = useState<string | null>(null);
  const [leaveHours, setLeaveHours] = useState<number | undefined>();
  const [restHours, setRestHours] = useState<number | undefined>();
  const [comment, setComment] = useState<string | undefined>(
    startEntry?.comment
  );
  const [leaveHoursError, setLeaveHoursError] = useState<string | null>(null);
  const [specialReason, setSpecialReason] = useState<string | undefined>();
  const [fromDate, setFromDate] = useState<Date>(
    startDate <= endDate ? startDate : endDate
  );
  const [toDate, setToDate] = useState<Date>(
    endDate >= startDate ? endDate : startDate
  );

  const {
    data: specialReasonOptions,
    isLoading: isSpecialReasonLoading,
    error: specialReasonError,
  } = useGetSpecialReason(normalizeDate(fromDate), normalizeDate(toDate));

  const [daysWithTimeEntries, setDaysWithTimeEntries] = useState<string[]>(
    getDatesWithTimeEntries(fromDate, toDate, timeEntries, true)
  );

  function handleChangeDate(selectedDate: Date, dateType: "from" | "to") {
    if (dateType === "from") {
      setFromDate(selectedDate);
      setDaysWithTimeEntries(
        getDatesWithTimeEntries(selectedDate, toDate, timeEntries, true)
      );
    } else if (dateType === "to") {
      setToDate(selectedDate);
      setDaysWithTimeEntries(
        getDatesWithTimeEntries(fromDate, selectedDate, timeEntries, true)
      );
    }
  }

  const handleEntryTypeChange = (type: string) => {
    if (readOnly) return; // Prevent changes in read-only mode
    setEntryType(type);
    if (type !== "leave") {
      setLeaveHours(undefined); // Clear leave hours if not leave
    }
    if (type !== "rest") {
      setRestHours(undefined); // Clear rest hours if not rest
    }
  };

  const handleHoursChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const totalHours = calculateTotalHoursForDays(
      timeEntries,
      daysWithTimeEntries
    );
    if ((totalHours + Number(event.target.value) > 8) && entryType === "leave") {
      setLeaveHoursError(
        "No overtime allowed when logging leave hours. Maximum allowed is 8 hours, Total hours: " +
          (totalHours + Number(event.target.value))
      );
    } else {
      setLeaveHoursError(null);
    }
    if (entryType === "rest") {
      setRestHours(Number(event.target.value));
    } else {
      setLeaveHours(Number(event.target.value));
    }
  };

  const handleDatesChange = (entryType: string) => {
    const closedEntries = timeEntries.filter(
      (entry) => entry.state === "CLOSED"
    );
    const dates = getDatesBetween(startDate, endDate, true, noWorkingDays);
    if (entryType === "leave" || entryType === "rest") {
      return dates;
    } else {
      return dates.filter((date) => {
        return !closedEntries.map((entry) => entry.date).includes(date);
      });
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (entryType) {
      submitDays({
        dates: handleDatesChange(entryType),
        nightShiftHours: 0,
        holidayHours: entryType === "holiday" ? 8 : undefined,
        sickHours: entryType === "sick" ? 8 : undefined,
        leaveHours: leaveHours,
        restHours: restHours,
        specialReason: specialReason,
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
        .filter(
          (item) =>
            item.state !== "CLOSED" &&
            normalizeDate(item.date) === normalizeDate(day)
        )
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
                From day:
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
                disabled={readOnly}
              />
            </div>
            <div className="w-full md:w-1/3 mb-4 md:mb-0">
              <label className="block text-sm font-medium mb-1">To day:</label>
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
                disabled={readOnly}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Entry Type
          </label>
          <div className="grid grid-cols-2 gap-3">
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
            <div
              id="day-entry-leave-radio"
              className={`flex items-center justify-center px-4 py-2 border rounded-md cursor-pointer transition-colors ${
                entryType === "rest"
                  ? "bg-yellow-100 border-yellow-500 text-yellow-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => handleEntryTypeChange("rest")}
            >
              <input
                type="radio"
                name="entryType"
                value="rest"
                checked={entryType === "rest"}
                onChange={() => handleEntryTypeChange("rest")}
                className="sr-only"
              />
              <span className="text-sm font-medium">Rest</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(entryType === "leave" || entryType === "rest") && (
            <div className="transition-all duration-300 ease-in-out">
              <label
                id="day-entry-leave-hour-label"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Hours *
              </label>
              <input
                id="day-entry-leave-hour-input"
                type="number"
                value={
                  entryType === "leave"
                    ? leaveHours || 0
                    : entryType === "rest"
                    ? restHours || 0
                    : 0
                }
                onChange={handleHoursChange}
                min="0"
                max="8"
                step={0.25}
                required
                className="w-full border  border-gray-300 rounded-md p-2"
                placeholder="Enter hours"
                disabled={readOnly}
              />
            </div>
          )}

          {entryType === "leave" && (
            <div>
              <label
                id="day-entry-special-reason-label"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Reason
              </label>
              {!!specialReasonOptions && (
                <select
                  id="day-entry-special-reason"
                  name="specialReason"
                  value={specialReason}
                  onChange={(e) => setSpecialReason(e.target.value)}
                  className="w-full border   border-gray-300 rounded-md p-2"
                  disabled={readOnly}
                >
                  <option value=""> Select a reason</option>
                  {specialReasonOptions.map((reason, idx) => (
                    <option key={reason.id} value={reason.id}>
                      {reason.title}
                    </option>
                  ))}
                </select>
              )}
              {isSpecialReasonLoading && <p>Loading...</p>}
            </div>
          )}
        </div>

        <div className="">
          <label
            id="day-entry-comments-label"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Comments{entryType === "sick" && " *"}
          </label>
          <textarea
            id="day-entry-comments-input"
            rows={3}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm p-2 border"
            placeholder="Add any notes here..."
            value={comment || ""}
            required={entryType === "sick"}
            onChange={(e) => setComment(e.target.value)}
            disabled={readOnly}
          ></textarea>
        </div>

        {daysWithTimeEntries.length > 0 && (
          <WarningExistingEntry
            daysWithTimeEntries={daysWithTimeEntries}
            isCheckbox={false}
            message="Time Entries with closed will be skipped"
          />
        )}
        {!!entryType && handleDatesChange(entryType).length === 0 && (
          <ErrorMessage
            message={
              "You must select at least one day without closed time entries"
            }
          />
        )}

        {isLoading && <LoadSpinner />}
        {error && (
          <ErrorMessage
            message={displayErrorMessage(error) || "Something went wrong"}
          />
        )}
        {leaveHoursError && <ErrorMessage message={leaveHoursError} />}

        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <Krm3Button
            disabled={daysWithTimeEntries.length === 0 || readOnly}
            type="button"
            style="danger"
            onClick={handleDeleteEntry}
            icon={<TrashIcon size={20} />}
            label="Delete"
          />
          <div className="flex space-x-3">
            <Krm3Button
              disabled={isLoading}
              type="button"
              onClick={onClose}
              style="secondary"
              label="Cancel"
            />

            <Krm3Button
              disabled={
                isLoading ||
                !entryType ||
                !!leaveHoursError ||
                readOnly ||
                (!!entryType && handleDatesChange(entryType).length === 0)
              }
              type="submit"
              style="primary"
              label="Save"
              icon={<CheckIcon size={20} />}
              disabledTooltipMessage="Please select a valid day"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
