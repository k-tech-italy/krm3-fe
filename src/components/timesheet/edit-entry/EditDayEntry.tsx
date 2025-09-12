import React, { useEffect, useMemo, useState } from "react";
import {
  useCreateTimeEntry,
  useDeleteTimeEntries,
  useGetSpecialReason,
} from "../../../hooks/useTimesheet";
import { Days, Schedule, TimeEntry } from "../../../restapi/types";
import { displayErrorMessage } from "../utils/utils";
import {
  calculateTaskHoursForDay,
  getDatesWithAndWithoutTimeEntries,
} from "../utils/timeEntry";
import {formatDate, getDateRange, getDatesBetween, isDayInRange} from "../utils/dates";
import { normalizeDate } from "../utils/dates";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import LoadSpinner from "../../commons/LoadSpinner";
import ErrorMessage from "./ErrorMessage";
import WarningExistingEntry from "./WarningExistEntry";
import Krm3Button from "../../commons/Krm3Button";
import {CheckIcon, Landmark, MoveRight, TrashIcon, X} from "lucide-react";

interface Props {
  readonly startDate: Date;
  readonly endDate: Date;
  timeEntries: TimeEntry[];
  onClose: () => void;
  readOnlyByRole: boolean;
  selectedResourceId: number | null;
  calendarDays: Days;
  schedule: Schedule;
}

export default function EditDayEntry({
  onClose,
  startDate,
  endDate,
  timeEntries,
  readOnlyByRole,
  selectedResourceId,
  calendarDays,
  schedule,
}: Props) {
  const {
    mutateAsync: submitDays,
    isLoading,
    isError,
    error,
  } = useCreateTimeEntry(selectedResourceId);
  const { mutateAsync: deleteTimeEntries } = useDeleteTimeEntries();

  const [fromDate, setFromDate] = useState<Date>(
    startDate <= endDate ? startDate : endDate
  );
  const [toDate, setToDate] = useState<Date>(
    endDate >= startDate ? endDate : startDate
  );

  const startEntry = useMemo(() => {
    return timeEntries.find(
      (item) =>
        normalizeDate(item.date) === normalizeDate(fromDate) &&
        item.task === null
    );
  }, [timeEntries, fromDate]);

  const isSubmitted = useMemo(() => {
    // assume the whole month days are closed when the timesheet are submitted
    // we will just check the first one
    return calendarDays[normalizeDate(fromDate)].closed;
  }, [fromDate, calendarDays]);

  const readOnly = useMemo(() => {
    return isSubmitted || readOnlyByRole;
  }, [isSubmitted, readOnlyByRole]);

  const minHoursScheduledForSelectedPeriod = () => {
    let minHoursForSelectedPeriod = Number(schedule[normalizeDate(fromDate).replaceAll("-", '_')])
    for (const [day, minHours] of Object.entries(schedule)) {
      if (isDayInRange(fromDate, toDate, day.replaceAll("_", '-')))
      {
        if(Number(minHours) < minHoursForSelectedPeriod)
        {
          minHoursForSelectedPeriod = Number(minHours);
        }
      }
    }
    return minHoursForSelectedPeriod
  }

  useEffect(() => {
    if (startEntry) {
      if (minHoursScheduledForSelectedPeriod() > 0)
      {
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
        if (startEntry.bankFrom > 0){
          setBankFrom(startEntry.bankFrom)
        }
      }
      if (startEntry.bankTo > 0)
      {
        setBankTo(startEntry.bankTo)
      }
    }
  }, [startEntry]);
  const [overrideEntries, setOverrideEntries] = useState<boolean>(true);
  const [entryType, setEntryType] = useState<string | null>(null);
  const [specialLeaveHours, setSpecialLeaveHours] = useState<number | undefined>();
  const [leaveHours, setLeaveHours] = useState<number | undefined>();
  const [restHours, setRestHours] = useState<number | undefined>();
  const [bankTo, setBankTo] = useState<number | undefined>();
  const [bankFrom, setBankFrom] = useState<number | undefined>();

  const [comment, setComment] = useState<string | undefined>(
    startEntry?.comment
  );
    const [protocolNumber, setProtocolNumber] = useState<string | undefined>(
    startEntry?.protocolNumber
  );
  const [leaveHoursError, setLeaveHoursError] = useState<string | null>(null);
  const [specialReason, setSpecialReason] = useState<string | undefined>();

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
    calendarDays,
    false,
    false
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
      endDate: Date = toDate,
      skipNonWorkingDays = true
  ): string[] => {

    return getDatesBetween(startDate, endDate, calendarDays, skipNonWorkingDays);
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

  useEffect(() =>
  {
    setLeaveHoursError(null);
    if((leaveHours === undefined || leaveHours === 0)
      && (restHours === undefined || restHours === 0)
      && (specialLeaveHours === undefined || specialLeaveHours === 0))
    {
      return;
    }
    const dates = getDateRange(fromDate, toDate);
    for(const date of dates)
    {
      const taskHours = calculateTaskHoursForDay(timeEntries, date)
      const dayHours = (restHours ? Number(restHours) : 0) + (leaveHours ? Number(leaveHours) : 0) + (specialLeaveHours ? Number(specialLeaveHours) : 0);
      const totalHours = taskHours + dayHours

      if(schedule[normalizeDate(date).replaceAll("-", "_")] < totalHours)
      {
        setLeaveHoursError(
            `No overtime allowed when logging leave, special leave or rest hours. Maximum allowed for ${normalizeDate(date)}
            is ${schedule[normalizeDate(date).replaceAll("-", "_")]} hours, Total hours: ` + totalHours
        );
        return
      }
    }
  }, [leaveHours, restHours, specialLeaveHours, fromDate, toDate]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const bankHoursNotEmpty = (bankFrom && bankFrom > 0) || (bankTo && bankTo > 0)
    if (entryType || bankHoursNotEmpty) {
      submitDays({
        dates: handleDatesChange(fromDate, toDate, !!entryType),
        nightShiftHours: 0,
        holidayHours: entryType === "holiday" ? minHoursScheduledForSelectedPeriod() : undefined,
        sickHours: entryType === "sick" ? minHoursScheduledForSelectedPeriod() : undefined,
        leaveHours:
          entryType === "holiday" || entryType === "sick" ? 0 : leaveHours,
        specialLeaveHours:
            entryType === "holiday" || entryType === "sick" ? 0 : specialLeaveHours,
        restHours:
          entryType === "holiday" || entryType === "sick" ? 0 : restHours,
        specialLeaveReason: specialReason,
        bankFrom: bankFrom,
        bankTo: bankTo,
        dayShiftHours: 0, // Set dayShiftHours to 0 if 'cause is mandatory'
        comment: comment,
        protocolNumber: protocolNumber
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
          return (entry.leaveHours != 0 || entry.restHours != 0 || entry.specialLeaveHours != 0
              || entry.bankFrom != 0 || entry.bankTo != 0)
              && isDayInRange(fromDate, toDate, entry.date)
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
                  id="day-entry-from-date-picker"
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
                  id={"day-entry-to-date-picker"}
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
                id="day-entry-holiday-div"
                data-testid="day-entry-holiday-div"
                className={`flex items-center justify-center px-4 py-2 border rounded-md transition-colors ${
                    entryType === "holiday"
                        ? "bg-yellow-100 border-krm3-primary text-yellow-700"
                        : "bg-card border-app text-app hover:bg-app"}
                  ${minHoursScheduledForSelectedPeriod() == 0
                    ? 'cursor-not-allowed btn-striped' :
                    'cursor-pointer'}
                  `}
                onClick={() => {
                  if (minHoursScheduledForSelectedPeriod() > 0)
                    handleEntryTypeChange("holiday")
                }}
            >
              <input
                  type="radio"
                  name="entryType"
                  value="holiday"
                  checked={entryType === "holiday"}
                  onChange={() => handleEntryTypeChange("holiday")}
                  className="sr-only"
                  data-testid="day-entry-holiday-radio"
              />
              <span className="text-sm font-medium">Holiday</span>
            </div>

            <div
                id="day-entry-sick-days-div"
                data-testid="day-entry-sick-div"
                className={`flex items-center justify-center px-4 py-2 border rounded-md transition-colors ${
                    entryType === "sick"
                        ? "bg-yellow-100 border-krm3-primary text-yellow-700"
                        : "bg-card border-app text-app hover:bg-app"}
                  ${minHoursScheduledForSelectedPeriod() == 0
                    ? 'cursor-not-allowed btn-striped' :
                    'cursor-pointer'}
                `}
                onClick={() => {
                  if (minHoursScheduledForSelectedPeriod() > 0)
                    handleEntryTypeChange("sick")
                }}

            >
              <input
                  data-testid="day-entry-sick-radio"
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
                id="day-entry-leave-div"
                data-testid="day-entry-leave-div"
                className={`flex items-center justify-center px-4 py-2 border rounded-md transition-colors ${
                    entryType === "leave"
                        ? "bg-yellow-100 border-krm3-primary text-yellow-700"
                        : "bg-card border-app text-app hover:bg-app"}
                  ${minHoursScheduledForSelectedPeriod() == 0
                    ? 'cursor-not-allowed btn-striped' :
                    'cursor-pointer'}
              `}
                onClick={() => {
                  if (minHoursScheduledForSelectedPeriod() > 0)
                    handleEntryTypeChange("leave")
                }}
            >
              <input
                  type="radio"
                  name="entryType"
                  value="leave"
                  checked={entryType === "leave"}
                  onChange={() => handleEntryTypeChange("leave")}
                  className="sr-only"
                  data-testid="day-entry-leave-radio"
              />
              <span className="text-sm font-medium">Leave</span>
            </div>
            <div
                id="day-entry-rest-div"
                data-testid="day-entry-rest-div"
                className={`flex items-center justify-center px-4 py-2 border rounded-md transition-colors ${
                    entryType === "rest"
                        ? "bg-yellow-100 border-krm3-primary text-yellow-700"
                        : "bg-card border-app text-app hover:bg-app"}
                  ${minHoursScheduledForSelectedPeriod() == 0
                    ? 'cursor-not-allowed btn-striped' :
                    'cursor-pointer'}
                `}
                onClick={() => {
                  if (minHoursScheduledForSelectedPeriod() > 0)
                    handleEntryTypeChange("rest")
                }}
            >
              <input
                  type="radio"
                  name="entryType"
                  value="rest"
                  checked={entryType === "rest"}
                  onChange={() => handleEntryTypeChange("rest")}
                  className="sr-only"
                  data-testid="day-entry-rest-radio"
              />
              <span className="text-sm font-medium">Rest</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(entryType === "leave") && (
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
                    onChange={(event) => setLeaveHours(Number(event.target.value))}
                    min="0"
                    max={`${minHoursScheduledForSelectedPeriod()}`}
                    step={0.25}
                    placeholder="0.00"
                    className="w-full border  border-gray-300 rounded-md p-2"
                    disabled={readOnly}
                    data-testid={"day-entry-leave-hour-input"}
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
                    id={`day-entry-${entryType == "rest" ? "rest" : "special-leave"}-hour-input`}
                    data-testid={`day-entry-${entryType == "rest" ? "rest" : "special-leave"}-hour-input`}
                    type="number"
                    value={
                      entryType === "leave" ? specialLeaveHours ?? "" : restHours ?? ""
                    }
                    onChange={(event) => {
                      if (entryType === "rest")
                        setRestHours(Number(event.target.value))
                      else
                        setSpecialLeaveHours(Number(event.target.value))
                    }}
                    min="0"
                    max={`${minHoursScheduledForSelectedPeriod()}`}
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

        <div className={`flex flex-row justify-between w-full`}>
          <div className="transition-all duration-300 ease-in-out">
            <label
                id="save-bank-hour-label"
                className="block text-sm font-medium text-app mb-2"
            >
              Save
            </label>
            <input
                id="save-bank-hour-input"
                data-testid={"save-bank-hour-input"}
                type="number"
                value={bankTo}
                onChange={(event) => {
                  setBankTo(Number(event.target.value))
                }}
                min="0"
                max="24"
                step={0.25}
                placeholder="0.00"
                className="border border-app rounded-md py-2 px-5"
                disabled={readOnly}
            />
          </div>

          <MoveRight size={60} stroke-width={1} className="mt-5"/>
          <div className={`flex flex-col items-center text-center mt-5`}>
            <p className={`font-bold`}>Bank</p>
            <Landmark size={32}/>
          </div>
          <MoveRight size={60} stroke-width={1} className="mt-5"/>

          <div className="transition-all duration-300 ease-in-out">
            <label
                id="from-bank-hour-label"
                className="block text-sm font-medium text-app mb-2"
            >
              Use
            </label>
            <input
                id="from-bank-hour-input"
                data-testid={"get-from-bank-hour-input"}
                type="number"
                value={bankFrom}
                onChange={(event) => {
                  setBankFrom(Number(event.target.value))
                }}
                min="0"
                max={`${minHoursScheduledForSelectedPeriod()}`}
                step={0.25}
                placeholder="0.00"
                className={`border border-app rounded-md py-2 px-5 
                  ${minHoursScheduledForSelectedPeriod() == 0
                    ? 'cursor-not-allowed btn-striped'
                    : ''}
                `}
                disabled={readOnly || minHoursScheduledForSelectedPeriod() == 0}
            />
          </div>
        </div>
        {entryType === "sick" && (
          <div>
            <label
              id="day-entry-comments-label"
              className="block text-sm font-medium text-app mb-2"
            >
              Protocol Number
            </label>
            <textarea
              id="day-entry-protocol-number-input"
              rows={3}
              className="block w-full rounded-md border-app shadow-sm focus:border-krm3-primary focus:ring-krm3-primary sm:text-sm p-2 border"
              placeholder="Insert the protocol number if any..."
              value={protocolNumber || ""}
              required={false}
              onChange={(e) => setProtocolNumber(e.target.value)}
              disabled={readOnly}
            ></textarea>
          </div>
        )}

        <div>
          <label
            id="day-entry-comments-label"
            className="block text-sm font-medium text-app mb-2"
          >
            Comments
          </label>
          <textarea
            id="day-entry-comments-input"
            rows={3}
            className="block w-full rounded-md border-app shadow-sm focus:border-krm3-primary focus:ring-krm3-primary sm:text-sm p-2 border"
            placeholder="Add any notes here..."
            value={comment || ""}
            required={false}
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

        {isLoading && <LoadSpinner/>}
        {leaveHoursError && <ErrorMessage message={leaveHoursError}/>}

        {!!error && <ErrorMessage message={displayErrorMessage(error)}/>}
        {!!specialReasonError && <ErrorMessage message={displayErrorMessage(specialReasonError)}/>}
        <div className={`${isDeleteButtonVisible ?
            'flex flex-wrap pt-6 border-t border-gray-200 gap-4 justify-between' :
            'flex flex-row gap-4'
        }`}>

          <Krm3Button
              disabled={daysWithTimeEntries.length === 0 || readOnly}
              type="button"
              style="danger"
              onClick={handleDeleteEntries}
              icon={<TrashIcon size={20}/>}
              label="Clear Day"
              mobileLabel={`${isDeleteButtonVisible ? "Clear Day" : "Clear"}`}
              additionalStyles={'w-[45%] md:w-[20%]'} id="clear-button"
          />
          {isDeleteButtonVisible
              &&
              <Krm3Button
                  disabled={readOnly}
                  type="button"
                  style="danger"
                  onClick={(event) => {
                    handleDeleteFilteredEntries(event, timeEntries.filter(
                        (entry) => {
                          return (entry.leaveHours != 0 || entry.restHours != 0 || entry.specialLeaveHours != 0
                                  || entry.bankTo != 0 || entry.bankFrom != 0)
                              && isDayInRange(fromDate, toDate, entry.date)
                        }))
                  }}
                  icon={<TrashIcon size={20}/>}
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
              icon={<X size={20}/>}
              additionalStyles={`w-[45%] md:w-[20%] ${!isDeleteButtonVisible ? 'ml-auto' : ''}`}
          />

          <Krm3Button
              disabled={
                  isLoading ||
                  !!leaveHoursError ||
                  readOnly ||
                  (!!entryType && handleDatesChange().length === 0)
              }
              type="submit"
              style="primary"
              label="Save"
              icon={<CheckIcon size={20}/>}
              disabledTooltipMessage="Please select a valid day"
              additionalStyles={'w-[45%] md:w-[20%] '}
              id="day-entry-submit-button"
          />

        </div>
      </form>
    </div>
  );
}