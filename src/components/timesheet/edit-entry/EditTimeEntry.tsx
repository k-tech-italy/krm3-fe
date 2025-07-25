import { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { Days, Task, TimeEntry } from "../../../restapi/types.ts";
import {
  useDeleteTimeEntries,
  useCreateTimeEntry,
} from "../../../hooks/useTimesheet.tsx";
import { displayErrorMessage } from "../utils/utils.ts";
import { formatDate, getDatesBetween, normalizeDate } from "../utils/dates.ts";
import DatePicker from "react-datepicker";
import WarningExistingEntry from "./WarningExistEntry.tsx";
import ErrorMessage from "./ErrorMessage.tsx";
import Krm3Button from "../../commons/Krm3Button.tsx";
import { CheckIcon, TrashIcon } from "lucide-react";
import { getDatesWithAndWithoutTimeEntries } from "../utils/timeEntry.ts";

interface Props {
  task: Task;
  timeEntries: TimeEntry[];
  startDate: Date;
  endDate: Date;
  closeModal: () => void;
  readOnly: boolean;
  selectedResourceId: number | null;
  holidayOrSickDays: String[];
  noWorkingDays: Days;
}

export default function EditTimeEntry({
  task,
  timeEntries,
  closeModal,
  startDate,
  endDate,
  readOnly,
  selectedResourceId,
  holidayOrSickDays,
  noWorkingDays,
}: Props) {
  const startEntry: TimeEntry | undefined = timeEntries.find(
    (item) =>
      normalizeDate(item.date) === normalizeDate(startDate) &&
      item.task == task.id
  );
  const [fromDate, setFromDate] = useState<Date>(
    startDate <= endDate ? startDate : endDate
  );
  const [toDate, setToDate] = useState<Date>(
    endDate >= startDate ? endDate : startDate
  );

  const [daysWithTimeEntries, setDaysWithTimeEntries] = useState<string[]>(
    getDatesWithAndWithoutTimeEntries(
      formatDate(fromDate),
      formatDate(toDate),
      timeEntries,
      noWorkingDays,
      true,
      false
    ).withTimeEntries.filter(
      (date) => !holidayOrSickDays.includes(normalizeDate(date))
    )
  );
  const [overrideEntries, setOverrideEntries] = useState<boolean>(true);

  function handleChangeDate(date: Date, type: "from" | "to") {
    if (type === "from") {
      setFromDate(date);
      setDaysWithTimeEntries(
        getDatesWithAndWithoutTimeEntries(
          date,
          formatDate(toDate),
          timeEntries,
          noWorkingDays,
          true,
          false
        ).withTimeEntries.filter(
          (date) => !holidayOrSickDays.includes(normalizeDate(date))
        )
      );
    } else {
      setToDate(date);
      setDaysWithTimeEntries(
        getDatesWithAndWithoutTimeEntries(
          formatDate(fromDate),
          date,
          timeEntries,
          noWorkingDays,
          true,
          false
        ).withTimeEntries.filter(
          (date) => !holidayOrSickDays.includes(normalizeDate(date))
        )
      );
    }
  }

  const [totalHours, setTotalHours] = useState<number>(
    startEntry
      ? Number(startEntry.dayShiftHours) +
          Number(startEntry.nightShiftHours) +
          Number(startEntry.travelHours) +
          Number(startEntry.onCallHours)
      : 0
  );

  const [dayShiftHours, setDayShiftHours] = useState<number>(
    startEntry ? Number(startEntry.dayShiftHours) : 0
  );
  const [nightShiftHours, setNightShiftHours] = useState<number>(
    startEntry ? Number(startEntry.nightShiftHours) : 0
  );
  const [onCallHours, setOnCallHours] = useState<number>(
    startEntry ? Number(startEntry.onCallHours) : 0
  );
  const [travelHours, setTravelHours] = useState<number>(
    startEntry ? Number(startEntry.travelHours) : 0
  );

  const [comment, setComment] = useState<string>(
    startEntry && startEntry.comment ? startEntry.comment : ""
  );

  const {
    mutateAsync: deleteTimeEntries,
    error: deletionError,
    isLoading,
  } = useDeleteTimeEntries();
  const { mutateAsync: createTimeEntries, error: creationError } =
    useCreateTimeEntry(selectedResourceId);

  const { withoutTimeEntries, allDates } = getDatesWithAndWithoutTimeEntries(
    formatDate(fromDate),
    formatDate(toDate),
    timeEntries,
    noWorkingDays,
    true,
    false
  );

  function getDatesToSave() {
    if (!overrideEntries) {
      return withoutTimeEntries.filter(filterDatesToSave);
    } else {
      return allDates.filter(filterDatesToSave);
    }
  }

  function filterDatesToSave(date: string) {
    if (holidayOrSickDays.includes(normalizeDate(date))) {
      return false;
    }
    if (normalizeDate(date) < normalizeDate(task.startDate)) {
      return false;
    }
    if (!!task.endDate && normalizeDate(date) > normalizeDate(task.endDate)) {
      return false;
    }
    return true;
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    createTimeEntries({
      taskId: task.id,
      dates: getDatesToSave(),
      nightShiftHours: nightShiftHours,
      dayShiftHours: dayShiftHours,
      onCallHours: onCallHours,
      travelHours: travelHours,
      comment: comment,
    }).then(() => closeModal());
  };

  function handleDeleteEntries() {
    const timeEntriesIds = timeEntries
      .filter(
        (timeEntry) =>
          normalizeDate(fromDate) <= normalizeDate(timeEntry.date) &&
          normalizeDate(toDate) >= normalizeDate(timeEntry.date) &&
          task.id === timeEntry.task
      )
      .map((timeEntry) => timeEntry.id);
    deleteTimeEntries(timeEntriesIds).then(() => closeModal());
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-6"
      id="edit-time-entry-container"
    >
      {/* Date Selection Section */}
      <div className="space-y-4" id="datepickers-container">
        <h3 className="text-lg font-medium text-app">Date Range</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="datepickers">
          <div>
            <label className="block text-sm font-medium text-app mb-2">
              From Date
            </label>
            <DatePicker
              dateFormat="yyyy-MM-dd"
              maxDate={toDate}
              selected={fromDate}
              className="w-full border border-app rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(date: Date | null) => {
                if (!!date) {
                  handleChangeDate(date, "from");
                }
              }}
              disabled={readOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-app mb-2">
              To Date
            </label>
            <DatePicker
              dateFormat="yyyy-MM-dd"
              selected={toDate}
              minDate={fromDate}
              className="w-full border border-app rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

      {/* Hours Section */}
      <div className="space-y-4" id="details-section">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-app">Hours</h3>
          {/* <div className="text-sm text-app">
            Total:{" "}
            <span
              className={`font-medium ${
                totalHours > 24 ? "text-red-600" : "text-app"
              }`}
            >
              {totalHours}h
            </span>
          </div> */}
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          id="details-container"
        >
          <div>
            <label className="block text-sm font-medium text-app mb-2">
              Daytime Hours
            </label>
            <input
              className="w-full border border-app rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              type="number"
              id="daytime-input"
              step={0.25}
              min="0"
              max="16"
              value={dayShiftHours || ""}
              placeholder="0.00"
              onChange={(e) => {
                setDayShiftHours(Number(e.target.value));
                setTotalHours(
                  Number(e.target.value) + nightShiftHours + travelHours
                );
              }}
              disabled={readOnly}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-app mb-2">
              Nighttime Hours
            </label>
            <input
              className="w-full border border-app rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              type="number"
              step={0.25}
              min="0"
              max="8"
              id="nightime-input"
              value={nightShiftHours || ""}
              placeholder="0.00"
              onChange={(e) => {
                setNightShiftHours(Number(e.target.value));
                setTotalHours(
                  Number(e.target.value) + dayShiftHours + travelHours
                );
              }}
              disabled={readOnly}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-app mb-2">
              Travel Hours
            </label>
            <input
              className="w-full border border-app rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              type="number"
              step={0.25}
              min="0"
              max="24"
              id="travelHours-input"
              value={travelHours || ""}
              placeholder="0.00"
              onChange={(e) => {
                setTravelHours(Number(e.target.value));
                setTotalHours(
                  dayShiftHours + Number(e.target.value) + nightShiftHours
                );
              }}
              disabled={readOnly}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-app mb-2">
              On Call Hours
            </label>
            <input
              className="w-full border border-app rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              type="number"
              step={0.25}
              min="0"
              max="24"
              id="oncall-input"
              value={onCallHours || ""}
              placeholder="0.00"
              onChange={(e) => {
                setOnCallHours(Number(e.target.value));
              }}
              disabled={readOnly}
            />
          </div>
        </div>
      </div>

      {/* Comment Section */}
      <div className="space-y-2" id="comment-section">
        <label
          className="block text-sm font-medium text-app"
          id="comment-label"
        >
          Comment
        </label>
        <textarea
          className="w-full border border-app rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          id="comment-textarea"
          rows={3}
          value={comment}
          placeholder="Add any additional notes..."
          onChange={(e) => {
            setComment(e.target.value);
          }}
          disabled={readOnly}
        />
      </div>

      {!readOnly && (
        <WarningExistingEntry
          disabled={withoutTimeEntries.filter(filterDatesToSave).length === 0}
          disabledTooltipMessage="No empty Days, you can only overwrite existing entries"
          message="Holiday, Sick days and N/A entries will be skipped automatically."
          daysWithTimeEntries={daysWithTimeEntries}
          overrideEntries={overrideEntries}
          setOverrideEntries={setOverrideEntries}
          isCheckbox
        />
      )}

      {totalHours > 24 && (
        <ErrorMessage message="Total hours cannot exceed 24 hours per day." />
      )}

      {!!creationError && (
        <ErrorMessage
          message={displayErrorMessage(creationError) || "Creation Error"}
        />
      )}

      {!!deletionError && (
        <ErrorMessage
          message={displayErrorMessage(deletionError) || "Deletion Error"}
        />
      )}

      {/* Action Buttons */}
      <div
        id="action-buttons"
        className="flex items-center justify-between pt-6 border-t border-app"
      >
        <Krm3Button
          disabled={daysWithTimeEntries.length === 0 || readOnly}
          type="button"
          style="danger"
          onClick={handleDeleteEntries}
          icon={<TrashIcon size={20} />}
          label="Delete"
        />

        <div className="flex space-x-3">
          <Krm3Button
            disabled={isLoading}
            type="button"
            onClick={closeModal}
            style="secondary"
            label="Cancel"
          />
          <Krm3Button
            disabled={totalHours > 24 || totalHours === 0 || readOnly}
            type="submit"
            style="primary"
            label="Save"
            icon={<CheckIcon size={20} />}
          />
        </div>
      </div>
    </form>
  );
}
