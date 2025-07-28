import React, { useEffect, useMemo, useState } from "react";
import {
  useCreateTimeEntry,
  useDeleteTimeEntries,
  useGetSpecialReason,
} from "../../../hooks/useTimesheet";
import { Days, TimeEntry } from "../../../restapi/types";
import { displayErrorMessage } from "../utils/utils";
import {
  calculateTotalHoursForDays,
  getDatesWithAndWithoutTimeEntries,
} from "../utils/timeEntry";
import {formatDate,  getDatesBetween, isDayInRange} from "../utils/dates";
import { normalizeDate } from "../utils/dates";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import LoadSpinner from "../../commons/LoadSpinner";
import ErrorMessage from "./ErrorMessage";
import WarningExistingEntry from "./WarningExistEntry";
import Krm3Button from "../../commons/Krm3Button";
import { CheckIcon, TrashIcon, X } from "lucide-react";

interface Props {
  startDate: Date;
  endDate: Date;
  timeEntries: TimeEntry[];
  onClose: () => void;
  readOnly: boolean;
  selectedResourceId: number | null;
  noWorkingDays: Days;
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
  const { mutateAsync: deleteTimeEntries } = useDeleteTimeEntries();

  const startEntry = useMemo(() => {
    return timeEntries.find(
      (item) =>
        normalizeDate(item.date) === normalizeDate(startDate) &&
        item.task === null
    );
  }, [timeEntries, startDate]);

  useEffect(() => {
    if (startEntry) {
      if (startEntry.leaveHours > 0) {
        setEntryType("leave");
        setLeaveHours(startEntry.leaveHours);
      }
      if (startEntry.specialLeaveHours > 0) {
        setEntryType("leave");
        setSpecialLeaveHours(startEntry.specialLeaveHours);
        setSpecialReason(startEntry.specialLeaveReason)
      }
      if (startEntry.holidayHours > 0) {
        setEntryType("holiday");
      }
      if (startEntry.sickHours > 0) {
        setEntryType("sick");
      }
      if (startEntry.restHours > 0) {
        setEntryType("rest");
        setRestHours(startEntry.restHours);
      }
    }
  }, [startEntry]);
  const [overrideEntries, setOverrideEntries] = useState<boolean>(true);
  const [entryType, setEntryType] = useState<string | null>(null);
  const [specialLeaveHours, setSpecialLeaveHours] = useState<number | undefined>();
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

  const {
    allDates,
    withTimeEntries: daysWithTimeEntries,
    withoutTimeEntries: daysWithoutTimeEntries,
  } = getDatesWithAndWithoutTimeEntries(
    formatDate(fromDate),
    formatDate(toDate),
    timeEntries,
    noWorkingDays
  );

  function handleChangeDate(selectedDate: Date, dateType: "from" | "to") {
    if (dateType === "from") {
      setFromDate(selectedDate);
    } else if (dateType === "to") {
      setToDate(selectedDate);
    }
  }

  const handleDatesChange = (
    startDate: Date = fromDate,
    endDate: Date = toDate
  ): string[] => {
    return getDatesBetween(startDate, endDate, noWorkingDays, true);
  };

  const handleEntryTypeChange = (type: string) => {
    if (readOnly) return; // Prevent changes in read-only mode
    if (entryType === "holiday" || entryType === "sick") {
      setSpecialLeaveHours(undefined);
      setRestHours(undefined);
      setLeaveHoursError(null);
    }
    setEntryType(type);
  };

  const handleHoursChange = (event: React.ChangeEvent<HTMLInputElement>, isSpecialLeave=false) => {
    const newValue = Number(event.target.value);
    const changedField = entryType === "rest" ? "restHours" : isSpecialLeave ? "specialLeaveHours" : "leaveHours";
    const totalHours = calculateTotalHoursForDays(
      timeEntries,
      daysWithTimeEntries,
      newValue,
      changedField
    );
    if (totalHours > 8 && entryType === "leave") {
      setLeaveHoursError(
        "No overtime allowed when logging leave hours. Maximum allowed is 8 hours, Total hours: " +
          (totalHours + newValue)
      );
    } else {
      setLeaveHoursError(null);
    }
    if (entryType === "rest") {
      setRestHours(newValue);
    } else {
      if(isSpecialLeave)
        setSpecialLeaveHours(newValue);
      else
        setLeaveHours(newValue)
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (entryType) {
      submitDays({
        dates: handleDatesChange(),
        nightShiftHours: 0,
        holidayHours: entryType === "holiday" ? 8 : undefined,
        sickHours: entryType === "sick" ? 8 : undefined,
        leaveHours:
          entryType === "holiday" || entryType === "sick" ? 0 : leaveHours,
        specialLeaveHours:
            entryType === "holiday" || entryType === "sick" ? 0 : specialLeaveHours,
        restHours:
          entryType === "holiday" || entryType === "sick" ? 0 : restHours,
        specialLeaveReason: specialReason,
        dayShiftHours: 0, // Set dayShiftHours to 0 if 'cause is mandatory'
        comment: comment,
      }).then(onClose);
    }
  };

  function handleDeleteEntries(event: any): void {
    event.preventDefault();

    const timeEntriesIdsToDelete = daysWithTimeEntries.flatMap((day) =>
      timeEntries
        .filter((item) => normalizeDate(item.date) === normalizeDate(day))
        .map((item) => item.id)
    );
    deleteTimeEntries(timeEntriesIdsToDelete).then(() => {
      onClose();
    });
  }
  function handleDeleteFilteredEntries(event: any, selectedEntries: TimeEntry[]): void {
    event.preventDefault();

    const timeEntriesIdsToDelete = daysWithTimeEntries.flatMap((day) =>
        timeEntries
            .filter((item) => normalizeDate(item.date) === normalizeDate(day) &&
                selectedEntries.includes(item))
            .map((item) => item.id)
    );
    deleteTimeEntries(timeEntriesIdsToDelete).then(() => {
      onClose();
    });
    }
    const isDeleteButtonVisible = timeEntries.filter(
        (entry) => {
          return (entry.leaveHours != 0 || entry.restHours != 0 || entry.specialLeaveHours)
              && isDayInRange(startDate, endDate, entry.date)
        }).length > 0

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
                className="w-full border border-app rounded-md p-2"
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
                className="w-full border border-app rounded-md p-2"
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
          <label className="block text-sm font-medium text-app mb-2">
            Entry Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div
              id="day-entry-holiday-radio"
              className={`flex items-center justify-center px-4 py-2 border rounded-md cursor-pointer transition-colors ${
                entryType === "holiday"
                  ? "bg-yellow-100 border-krm3-primary text-yellow-700"
                  : "bg-card border-app text-app hover:bg-app"
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
                  ? "bg-yellow-100 border-krm3-primary text-yellow-700"
                  : "bg-card border-app text-app hover:bg-app"
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
                  ? "bg-yellow-100 border-krm3-primary text-yellow-700"
                  : "bg-card border-app text-app hover:bg-app"
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
                  ? "bg-yellow-100 border-krm3-primary text-yellow-700"
                  : "bg-card border-app text-app hover:bg-app"
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
          {(entryType === "leave" ) && (
              <div className="transition-all duration-300 ease-in-out col-span-full pr-1.5 w-1/2">
                <label
                    id="day-entry-leave-hour-label"
                    className="block text-sm font-medium text-app mb-2"
                >
                  Leave Hours
                </label>
                <input
                    id="day-entry-leave-hour-input"
                    type="number"
                    value={
                      leaveHours
                    }
                    onChange={handleHoursChange}
                    min="0"
                    max="8"
                    step={0.25}
                    placeholder="0.00"
                    className="w-full border  border-gray-300 rounded-md p-2"
                    disabled={readOnly}
                />
              </div>
          )}
          {(entryType === "leave" || entryType === "rest") && (
            <div className="transition-all duration-300 ease-in-out">
              <label
                id="day-entry-leave-hour-label"
                className="block text-sm font-medium text-app mb-2"
              >
                {entryType === "rest" ? "Rest Hours *" : "Special Leave Hours"}
              </label>
              <input
                id="day-entry-special-leave-hour-input"
                type="number"
                value={
                  entryType === "leave" ? specialLeaveHours ?? "" : restHours ?? ""
                }
                onChange={(event) => {
                  if(entryType === "rest")
                    handleHoursChange(event);
                  else
                    handleHoursChange(event, true)
                }}
                min="0"
                max="8"
                step={0.25}
                placeholder="0.00"
                required={entryType === "rest" ? true : undefined}
                className="w-full border  border-app rounded-md p-2"
                disabled={readOnly}
              />
            </div>
          )}

          {entryType === "leave" && (
            <div>
              <label
                id="day-entry-special-reason-label"
                className="block text-sm font-medium text-app mb-2"
              >
                Reason
              </label>
              {!!specialReasonOptions && (
                <select
                  id="day-entry-special-reason"
                  name="specialReason"
                  value={specialReason}
                  onChange={(e) => setSpecialReason(e.target.value)}
                  className="w-full border border-app rounded-md p-[0.6875rem] "
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
            className="block text-sm font-medium text-app mb-2"
          >
            Comments{entryType === "sick" && " *"}
          </label>
          <textarea
            id="day-entry-comments-input"
            rows={3}
            className="block w-full rounded-md border-app shadow-sm focus:border-krm3-primary focus:ring-krm3-primary sm:text-sm p-2 border"
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
            overrideEntries={overrideEntries}
            setOverrideEntries={setOverrideEntries}
            message="Day locked and no working days will be skipped automatically"
          />
        )}
        {!!entryType && handleDatesChange().length === 0 && (
          <ErrorMessage
            message={
              "You must select at least one day which is not locked and is a working day"
            }
          />
        )}

        {isLoading && <LoadSpinner />}
        {leaveHoursError && <ErrorMessage message={leaveHoursError} />}

        {!!error && <ErrorMessage message={displayErrorMessage(error)} />}
        {!!specialReasonError && <ErrorMessage message={displayErrorMessage(specialReasonError)} />}
        <div className={`${isDeleteButtonVisible ? 
            'flex flex-wrap pt-6 border-t border-gray-200 gap-4 justify-between' :
            'flex flex-row gap-4'
        }`}>

            <Krm3Button
              disabled={daysWithTimeEntries.length === 0 || readOnly}
              type="button"
              style="danger"
              onClick={handleDeleteEntries}
              icon={<TrashIcon size={20} />}
              label="Clear Day"
              mobileLabel={`${isDeleteButtonVisible ? "Clear Day" : "Clear"}`}
              additionalStyles={'w-[45%] md:w-[20%]'}
            />
            { isDeleteButtonVisible
                &&
              <Krm3Button
                  disabled={timeEntries.map(
                      (entry) => entry.leaveHours == 0 && entry.restHours == 0).length === 0 || readOnly}
                  type="button"
                  style="danger"
                  onClick={ (event) => {
                    handleDeleteFilteredEntries(event, timeEntries.filter(
                        (entry) => {
                          return (entry.leaveHours != 0 || entry.restHours != 0 || entry.specialLeaveHours != 0)
                              && isDayInRange(startDate, endDate, entry.date)
                        }))}}
                  icon={<TrashIcon size={20} />}
                  label="Delete"
                  additionalStyles={'w-[45%] md:w-[20%] md:mr-auto'}
              />
            }

            <Krm3Button
              disabled={isLoading}
              type="button"
              onClick={onClose}
              style="secondary"
              label="Cancel"
              icon={<X size={20} />}
              additionalStyles={`w-[45%] md:w-[20%] ${!isDeleteButtonVisible ? 'ml-auto': ''}`}
            />

            <Krm3Button
              disabled={
                isLoading ||
                !entryType ||
                !!leaveHoursError ||
                readOnly ||
                (!!entryType && handleDatesChange().length === 0)
              }
              type="submit"
              style="primary"
              label="Save"
              icon={<CheckIcon size={20} />}
              disabledTooltipMessage="Please select a valid day"
              additionalStyles={'w-[45%] md:w-[20%] '}
            />

        </div>
      </form>
    </div>
  );
}
