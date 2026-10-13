import React, { useEffect, useMemo, useState } from "react";
import {
  useClearDayEntries,
  useSaveDayEntries,
  useDeleteDayEntries,
  useGetSpecialReason,
} from "../../../hooks/useTimesheet";
import { DayEntry, Days, DayType, Schedule, TaskEntry } from "../../../restapi/types";
import { displayErrorMessage } from "../utils/utils";
import {
  calculateTaskHoursForDay,
  getDatesWithAndWithoutDayEntries,
  getDayType,
} from "../utils/entryUtils";
import {
  formatDate,
  getDateRange,
  getDatesBetween,
  isDayInRange,
  normalizeDate,
} from "../utils/dates";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import LoadSpinner from "../../commons/LoadSpinner";
import ErrorMessage from "./ErrorMessage";
import WarningExistingEntry from "./WarningExistEntry";
import Krm3Button from "../../commons/Krm3Button";
import { CheckIcon, Landmark, MoveRight, TrashIcon, X } from "lucide-react";

interface Props {
  readonly startDate: Date;
  readonly endDate: Date;
  dayEntries?: DayEntry[];
  taskEntries?: TaskEntry[];
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
  dayEntries = [],
  taskEntries = [],
  readOnlyByRole,
  selectedResourceId,
  calendarDays,
  schedule,
}: Readonly<Props>) {
  const {
    mutateAsync: saveDays,
    isLoading: isSaving,
    error: saveError,
  } = useSaveDayEntries(selectedResourceId);
  const {
    mutateAsync: clearDayEntries,
    isLoading: isClearing,
    error: clearError,
  } = useClearDayEntries();
  const {
    mutateAsync: deleteDayEntries,
    isLoading: isDeleting,
    error: deleteError,
  } = useDeleteDayEntries();
  const isLoading = isSaving || isClearing || isDeleting;
  const error = saveError ?? clearError ?? deleteError;

  const [fromDate, setFromDate] = useState<Date>(startDate <= endDate ? startDate : endDate);
  const [toDate, setToDate] = useState<Date>(endDate >= startDate ? endDate : startDate);
  const [overrideEntries, setOverrideEntries] = useState<boolean>(true);
  const [entryType, setEntryType] = useState<string | null>(null);
  const [specialLeaveHours, setSpecialLeaveHours] = useState<number | undefined>();
  const [leaveHours, setLeaveHours] = useState<number | undefined>();
  const [restHours, setRestHours] = useState<number | undefined>();
  const [bankTo, setBankTo] = useState<number | undefined>();
  const [bankFrom, setBankFrom] = useState<number | undefined>();
  const [comment, setComment] = useState<string | undefined>();
  const [protocolNumber, setProtocolNumber] = useState<string | undefined>();
  const [coveredHoursError, setCoveredHoursError] = useState<string | null>(null);
  const [specialReason, setSpecialReason] = useState<string | undefined>();
  const [isDirty, setIsDirty] = useState(false);
  const isSpecialReasonMissing = (specialLeaveHours ?? 0) > 0 && !specialReason;
  const protocolNumberError =
    protocolNumber && !/^\d+$/.test(protocolNumber)
      ? "Protocol number must contain digits only."
      : null;
  const hasBankOperation = (bankTo ?? 0) > 0 || (bankFrom ?? 0) > 0;
  const isHolidayOrSick = entryType === "holiday" || entryType === "sick";
  const hasLeaveRestOrSpecialLeave =
    (leaveHours ?? 0) > 0 || (restHours ?? 0) > 0 || (specialLeaveHours ?? 0) > 0;
  const bankEntryTypeError =
    hasBankOperation && isHolidayOrSick
      ? "Bank hours cannot be used during holidays or sick days."
      : (bankTo ?? 0) > 0 && hasLeaveRestOrSpecialLeave
        ? "Bank hours cannot be deposited during leave, rest, or special leave."
        : null;

  const startEntry = useMemo(() => {
    return dayEntries.find((entry) => normalizeDate(entry.day) === normalizeDate(fromDate));
  }, [dayEntries, fromDate]);

  const hasBankHoursInput = bankFrom !== undefined || bankTo !== undefined;
  const hasHours =
    (leaveHours !== undefined && leaveHours > 0) ||
    (restHours !== undefined && restHours > 0) ||
    (specialLeaveHours !== undefined && specialLeaveHours > 0);
  const hasCommentInput = comment !== undefined;
  const hasSavableData =
    !!entryType || hasBankHoursInput || hasHours || hasCommentInput || (!!startEntry && isDirty);

  const isSubmitted = useMemo(() => {
    // assume the whole month days are closed when the timesheet are submitted
    // we will just check the first one
    return calendarDays[normalizeDate(fromDate)]?.closed ?? false;
  }, [fromDate, calendarDays]);

  const readOnly = useMemo(() => {
    return isSubmitted || readOnlyByRole;
  }, [isSubmitted, readOnlyByRole]);

  const minHoursScheduledForSelectedPeriod = () => {
    const getScheduledHours = (date: Date | string) => {
      const normalizedDate = normalizeDate(date);
      return Number(schedule[normalizedDate] ?? schedule[normalizedDate.replaceAll("-", "_")] ?? 0);
    };

    let minHoursForSelectedPeriod = getScheduledHours(fromDate);
    for (const [day, minHours] of Object.entries(schedule)) {
      if (isDayInRange(fromDate, toDate, day.replaceAll("_", "-"))) {
        if (Number(minHours) < minHoursForSelectedPeriod) {
          minHoursForSelectedPeriod = Number(minHours);
        }
      }
    }
    return minHoursForSelectedPeriod;
  };
  const earliestCalendarDay = () => {
    const dates = Object.keys(calendarDays).map((stringDate) => {
      return new Date(stringDate);
    });
    return new Date(Math.min(...dates.map((d) => d.getTime())));
  };
  const latestCalendarDay = () => {
    const dates = Object.keys(calendarDays).map((stringDate) => {
      return new Date(stringDate);
    });
    return new Date(Math.max(...dates.map((d) => d.getTime())));
  };
  useEffect(() => {
    setEntryType(null);
    setLeaveHours(undefined);
    setSpecialLeaveHours(undefined);
    setRestHours(undefined);
    setSpecialReason(undefined);
    setBankTo(undefined);
    setBankFrom(undefined);
    setComment(undefined);
    setProtocolNumber(undefined);

    if (!startEntry) {
      return;
    }

    if (startEntry.askedHoliday) {
      setEntryType("holiday");
    } else if (startEntry.isSick) {
      setEntryType("sick");
    } else if (Number(startEntry.restHours) > 0) {
      setEntryType("rest");
    } else if (Number(startEntry.leaveHours) > 0 || Number(startEntry.specialLeaveHours) > 0) {
      setEntryType("leave");
    }

    setLeaveHours(Number(startEntry.leaveHours) || undefined);
    setSpecialLeaveHours(Number(startEntry.specialLeaveHours) || undefined);
    setRestHours(Number(startEntry.restHours) || undefined);
    setSpecialReason(startEntry.specialLeaveReason?.toString());

    const bank = Number(startEntry.bank);
    setBankTo(bank > 0 ? bank : undefined);
    setBankFrom(bank < 0 ? Math.abs(bank) : undefined);
    setComment(startEntry.comment ?? undefined);
    setProtocolNumber(startEntry.protocolNumber ?? undefined);
  }, [startEntry]);

  const {
    data: specialReasonOptions,
    isLoading: isSpecialReasonLoading,
    error: specialReasonError,
  } = useGetSpecialReason(normalizeDate(fromDate), normalizeDate(toDate));

  const { withDayEntries: daysWithDayEntries } = getDatesWithAndWithoutDayEntries(
    formatDate(fromDate),
    formatDate(toDate),
    dayEntries,
    calendarDays,
    false,
    false
  );

  function handleChangeDate(selectedDate: Date, dateType: "from" | "to") {
    setIsDirty(true);
    if (dateType === "from") {
      setFromDate(selectedDate);
      if (selectedDate > toDate) {
        setToDate(selectedDate);
      }
    } else if (dateType === "to") {
      setToDate(selectedDate);
      if (selectedDate < fromDate) {
        setFromDate(selectedDate);
      }
    }
  }
  const handleDatesChange = (
    startDate: Date = fromDate,
    endDate: Date = toDate,
    skipNonWorkingDays = true
  ): string[] => {
    const nonClosedDates = getDatesBetween(startDate, endDate, calendarDays, false);

    if (!skipNonWorkingDays) {
      return nonClosedDates;
    }

    return nonClosedDates.filter((date) => {
      if (getDayType(date, calendarDays) === DayType.WORK_DAY) {
        return true;
      }

      const existingDayEntry = dayEntries.find(
        (entry) => normalizeDate(entry.day) === normalizeDate(date)
      );

      return Boolean(existingDayEntry?.askedHoliday && !existingDayEntry.isHoliday);
    });
  };

  const handleEntryTypeChange = (type: string) => {
    if (readOnly) return; // Prevent changes in read-only mode
    setIsDirty(true);
    if (entryType === type) {
      setEntryType(null);
      return;
    }
    setEntryType(type);
  };

  useEffect(() => {
    setCoveredHoursError(null);
    if (bankEntryTypeError) {
      return;
    }
    if (
      (leaveHours === undefined || leaveHours === 0) &&
      (restHours === undefined || restHours === 0) &&
      (specialLeaveHours === undefined || specialLeaveHours === 0) &&
      (bankFrom === undefined || bankFrom === 0) &&
      (bankTo === undefined || bankTo === 0)
    ) {
      return;
    }
    const dates = getDateRange(fromDate, toDate);
    for (const date of dates) {
      const taskHours = calculateTaskHoursForDay(taskEntries, dayEntries, date);
      const absenceHours =
        (restHours ? Number(restHours) : 0) +
        (leaveHours ? Number(leaveHours) : 0) +
        (specialLeaveHours ? Number(specialLeaveHours) : 0);
      const bank = (bankTo ?? 0) - (bankFrom ?? 0);
      const effectiveHours = taskHours + absenceHours - bank;

      const normalizedDate = normalizeDate(date);
      const dayEntry = dayEntries.find((entry) => normalizeDate(entry.day) === normalizedDate);
      const dueHours = Number(
        dayEntry?.dueHours ??
          schedule[normalizedDate] ??
          schedule[normalizedDate.replaceAll("-", "_")] ??
          0
      );
      if (bank > 0 && effectiveHours < dueHours) {
        setCoveredHoursError(
          `Cannot deposit ${bank} bank hours for ${normalizeDate(date)}. Effective hours would be ${effectiveHours}, below the scheduled ${dueHours} hours.`
        );
        return;
      }
      if ((absenceHours > 0 || bank < 0) && dueHours < effectiveHours) {
        setCoveredHoursError(
          `No overtime allowed when logging leave, special leave, rest or bank withdrawal hours. Maximum allowed for ${normalizeDate(date)}
            is ${dueHours} hours, Total hours: ` + effectiveHours
        );
        return;
      }
    }
  }, [
    leaveHours,
    restHours,
    specialLeaveHours,
    bankFrom,
    bankTo,
    fromDate,
    toDate,
    taskEntries,
    dayEntries,
    schedule,
    bankEntryTypeError,
  ]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isSpecialReasonMissing || protocolNumberError || coveredHoursError || bankEntryTypeError)
      return;

    if (!isDirty || !hasSavableData) return;

    const dates = handleDatesChange(fromDate, toDate, !!entryType || hasHours);
    if (dates.length === 0) return;

    const payload = {
      bank: (bankTo || 0) - (bankFrom || 0),
      askedHoliday: entryType === "holiday",
      isSick: entryType === "sick",
      leaveHours: entryType === "holiday" || entryType === "sick" ? 0 : leaveHours || 0,
      specialLeaveHours:
        entryType === "holiday" || entryType === "sick" ? 0 : specialLeaveHours || 0,
      specialLeaveReason:
        entryType === "holiday" || entryType === "sick" || !specialLeaveHours
          ? null
          : specialReason
            ? Number(specialReason)
            : null,
      restHours: entryType === "holiday" || entryType === "sick" ? 0 : restHours || 0,
      comment,
      protocolNumber: entryType === "sick" ? protocolNumber || null : null,
    };

    saveDays({ dates, ...payload }).then(onClose);
  };

  const clearableDayEntries = dayEntries.filter((entry) => {
    const normalizedDay = normalizeDate(entry.day);
    const hasTaskEntries = taskEntries.some((taskEntry) => taskEntry.dayEntry === entry.id);
    return (
      isDayInRange(fromDate, toDate, normalizedDay) &&
      !entry.closed &&
      (!entry.isHoliday || hasTaskEntries)
    );
  });

  const deletableDayEntries = clearableDayEntries.filter(
    (entry) =>
      Number(entry.bank) !== 0 ||
      entry.askedHoliday ||
      entry.isSick ||
      Number(entry.leaveHours) > 0 ||
      Number(entry.specialLeaveHours) > 0 ||
      Number(entry.restHours) > 0 ||
      !!entry.specialLeaveReason ||
      !!entry.protocolNumber ||
      !!entry.comment
  );

  function handleClearEntries(): void {
    clearDayEntries(clearableDayEntries.map((entry) => entry.id)).then(onClose);
  }

  function handleDeleteEntries(): void {
    deleteDayEntries(deletableDayEntries.map((entry) => entry.id)).then(onClose);
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
        <div className="items-start " id="datepickers-container">
          <div className="text-lg font-bold">Days</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="datepickers">
            <div className="w-full  mb-4 md:mb-0">
              <label
                htmlFor="day-entry-from-date-picker"
                className="block text-sm font-medium mb-1"
              >
                From day:
              </label>
              <DatePicker
                dateFormat="yyyy-MM-dd"
                minDate={earliestCalendarDay()}
                maxDate={latestCalendarDay()}
                selected={fromDate}
                id="day-entry-from-date-picker"
                className="w-full border border-app rounded-md p-2"
                onChange={(date: Date | null) => {
                  if (date) {
                    handleChangeDate(date, "from");
                  }
                }}
                disabled={readOnly}
                highlightDates={[toDate]}
              />
            </div>
            <div className="w-full  mb-4 md:mb-0">
              <label htmlFor="day-entry-to-date-picker" className="block text-sm font-medium mb-1">
                To day:
              </label>
              <DatePicker
                dateFormat="yyyy-MM-dd"
                selected={toDate}
                minDate={earliestCalendarDay()}
                maxDate={latestCalendarDay()}
                id={"day-entry-to-date-picker"}
                className="w-full border border-app rounded-md p-2"
                onChange={(date: Date | null) => {
                  if (date) {
                    handleChangeDate(date, "to");
                  }
                }}
                disabled={readOnly}
                highlightDates={[fromDate]}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-app mb-2">Entry Type</label>
          <div className="grid grid-cols-2 gap-3">
            <div
              id="day-entry-holiday-div"
              data-testid="day-entry-holiday-div"
              className={`flex items-center justify-center px-4 py-2 border rounded-md transition-colors ${
                entryType === "holiday"
                  ? "bg-yellow-100 border-krm3-primary text-yellow-700"
                  : "bg-card border-app text-app hover:bg-app"
              }
                  ${
                    minHoursScheduledForSelectedPeriod() == 0
                      ? "cursor-not-allowed btn-striped"
                      : "cursor-pointer"
                  }
                  `}
              onClick={() => {
                if (minHoursScheduledForSelectedPeriod() > 0) handleEntryTypeChange("holiday");
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
                  : "bg-card border-app text-app hover:bg-app"
              }
                  ${
                    minHoursScheduledForSelectedPeriod() == 0
                      ? "cursor-not-allowed btn-striped"
                      : "cursor-pointer"
                  }
                `}
              onClick={() => {
                if (minHoursScheduledForSelectedPeriod() > 0) handleEntryTypeChange("sick");
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
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {!["holiday", "sick"].includes(entryType || "") && (
            <>
              <div className="transition-all duration-300 ease-in-out">
                <label
                  htmlFor="day-entry-leave-hour-input"
                  id="day-entry-leave-hour-label"
                  className="block text-sm font-medium text-app mb-2"
                >
                  Leave Hours
                </label>
                <input
                  id="day-entry-leave-hour-input"
                  type="number"
                  value={leaveHours ?? ""}
                  onChange={(event) => {
                    setLeaveHours(Number(event.target.value));
                    setIsDirty(true);
                  }}
                  min="0"
                  max={`${minHoursScheduledForSelectedPeriod()}`}
                  step={0.25}
                  placeholder="0.00"
                  className="w-full border border-gray-300 rounded-md p-2"
                  disabled={readOnly}
                  data-testid={"day-entry-leave-hour-input"}
                />
              </div>

              <div className="transition-all duration-300 ease-in-out">
                <label
                  htmlFor="day-entry-rest-hour-input"
                  id="day-entry-rest-hour-label"
                  className="block text-sm font-medium text-app mb-2"
                >
                  Rest Hours
                </label>
                <input
                  id="day-entry-rest-hour-input"
                  data-testid="day-entry-rest-hour-input"
                  type="number"
                  value={restHours ?? ""}
                  onChange={(event) => {
                    setRestHours(Number(event.target.value));
                    setIsDirty(true);
                  }}
                  min="0"
                  max={`${minHoursScheduledForSelectedPeriod()}`}
                  step={0.25}
                  placeholder="0.00"
                  className="w-full border border-app rounded-md p-2"
                  disabled={readOnly}
                />
              </div>

              <div className="transition-all duration-300 ease-in-out">
                <label
                  htmlFor="day-entry-special-leave-hour-input"
                  id="day-entry-special-leave-hour-label"
                  className="block text-sm font-medium text-app mb-2"
                >
                  Special Leave Hours
                </label>
                <input
                  id="day-entry-special-leave-hour-input"
                  data-testid="day-entry-special-leave-hour-input"
                  type="number"
                  value={specialLeaveHours ?? ""}
                  onChange={(event) => {
                    const hours = Number(event.target.value);
                    setSpecialLeaveHours(hours);
                    setIsDirty(true);
                    if (hours === 0) {
                      setSpecialReason(undefined);
                    }
                  }}
                  min="0"
                  max={`${minHoursScheduledForSelectedPeriod()}`}
                  step={0.25}
                  placeholder="0.00"
                  className="w-full border border-app rounded-md p-2"
                  disabled={readOnly}
                />
              </div>

              <div>
                <label
                  htmlFor="day-entry-special-reason"
                  id="day-entry-special-reason-label"
                  className="block text-sm font-medium text-app mb-2"
                >
                  Reason
                </label>
                {!!specialReasonOptions && (
                  <select
                    id="day-entry-special-reason"
                    name="specialReason"
                    value={specialReason ?? ""}
                    onChange={(e) => {
                      setSpecialReason(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full border border-app rounded-md p-2.75 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    disabled={readOnly || (specialLeaveHours ?? 0) <= 0}
                  >
                    <option value=""> Select a reason</option>
                    {specialReasonOptions.map((reason) => (
                      <option key={reason.id} value={reason.id}>
                        {reason.title}
                      </option>
                    ))}
                  </select>
                )}
                {isSpecialReasonLoading && <p>Loading...</p>}
              </div>
            </>
          )}
        </div>

        <div className={`flex flex-row justify-between w-full`}>
          <div className="transition-all duration-300 ease-in-out">
            <label
              htmlFor="save-bank-hour-input"
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
                setBankTo(Number(event.target.value));
                setIsDirty(true);
              }}
              min="0"
              max="24"
              step={0.25}
              placeholder="0.00"
              className="border border-app rounded-md py-2 px-5"
              disabled={readOnly}
            />
          </div>

          <MoveRight size={60} stroke-width={1} className="mt-5" />
          <div className={`flex flex-col items-center text-center mt-5`}>
            <p className={`font-bold`}>Bank</p>
            <Landmark size={32} />
          </div>
          <MoveRight size={60} stroke-width={1} className="mt-5" />

          <div className="transition-all duration-300 ease-in-out">
            <label
              htmlFor="from-bank-hour-input"
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
                setBankFrom(Number(event.target.value));
                setIsDirty(true);
              }}
              min="0"
              max={`${minHoursScheduledForSelectedPeriod()}`}
              step={0.25}
              placeholder="0.00"
              className={`border border-app rounded-md py-2 px-5
                  ${
                    minHoursScheduledForSelectedPeriod() == 0
                      ? "cursor-not-allowed btn-striped"
                      : ""
                  }
                `}
              disabled={readOnly || minHoursScheduledForSelectedPeriod() == 0}
            />
          </div>
        </div>
        {entryType === "sick" && (
          <div>
            <label
              htmlFor="day-entry-protocol-number-input"
              id="day-entry-protocol-number-label"
              className="block text-sm font-medium text-app mb-2"
            >
              Protocol Number
            </label>
            <input
              id="day-entry-protocol-number-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="block w-full rounded-md border-app shadow-sm focus:border-krm3-primary focus:ring-krm3-primary sm:text-sm p-2 border"
              placeholder="Insert the protocol number if any..."
              value={protocolNumber || ""}
              required={false}
              onChange={(e) => {
                setProtocolNumber(e.target.value);
                setIsDirty(true);
              }}
              disabled={readOnly}
            />
          </div>
        )}

        <div>
          <label
            htmlFor="day-entry-comments-input"
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
            onChange={(e) => {
              setComment(e.target.value);
              setIsDirty(true);
            }}
            disabled={readOnly}
          ></textarea>
        </div>

        {daysWithDayEntries.length > 0 && (
          <WarningExistingEntry
            daysWithEntries={daysWithDayEntries}
            entryLabel="Day entries"
            isCheckbox={false}
            overrideEntries={overrideEntries}
            setOverrideEntries={setOverrideEntries}
            message="Day locked and no working days will be skipped automatically"
          />
        )}
        {!readOnly && !!entryType && handleDatesChange().length === 0 && (
          <ErrorMessage
            message={"You must select at least one day which is not locked and is a working day"}
          />
        )}

        {isLoading && <LoadSpinner />}
        {coveredHoursError && <ErrorMessage message={coveredHoursError} />}
        {bankEntryTypeError && !coveredHoursError && <ErrorMessage message={bankEntryTypeError} />}
        {protocolNumberError && !coveredHoursError && !bankEntryTypeError && (
          <ErrorMessage message={protocolNumberError} />
        )}
        {isSpecialReasonMissing &&
          !protocolNumberError &&
          !coveredHoursError &&
          !bankEntryTypeError && (
            <ErrorMessage message="Please select a reason for the special leave." />
          )}

        {!!error && <ErrorMessage message={displayErrorMessage(error)} />}
        {!!specialReasonError && <ErrorMessage message={displayErrorMessage(specialReasonError)} />}
        <div className="flex flex-row gap-4">
          <Krm3Button
            disabled={clearableDayEntries.length === 0 || readOnly || isClearing}
            type="button"
            style="danger"
            onClick={handleClearEntries}
            icon={<TrashIcon size={20} />}
            label="Clear Day"
            mobileLabel="Clear"
            additionalStyles={"w-[45%] md:w-[20%]"}
            id="clear-button"
          />

          {deletableDayEntries.length > 0 && !readOnly && (
            <Krm3Button
              disabled={isDeleting}
              type="button"
              style="danger"
              onClick={handleDeleteEntries}
              icon={<TrashIcon size={20} />}
              label="Delete"
              additionalStyles={"w-[45%] md:w-[20%]"}
              id="delete-button"
            />
          )}

          <Krm3Button
            disabled={isLoading}
            type="button"
            onClick={onClose}
            style="secondary"
            label="Cancel"
            icon={<X size={20} />}
            additionalStyles="w-[45%] md:w-[20%] ml-auto"
          />

          <Krm3Button
            disabled={
              !isDirty ||
              !hasSavableData ||
              isLoading ||
              !!coveredHoursError ||
              !!bankEntryTypeError ||
              !!protocolNumberError ||
              isSpecialReasonMissing ||
              readOnly ||
              (!!entryType && handleDatesChange().length === 0)
            }
            type="submit"
            style="primary"
            label="Save"
            icon={<CheckIcon size={20} />}
            disabledTooltipMessage="Please select a valid day"
            additionalStyles={"w-[45%] md:w-[20%] "}
            id="day-entry-submit-button"
          />
        </div>
      </form>
    </div>
  );
}
