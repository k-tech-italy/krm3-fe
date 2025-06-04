import { Task, TimeEntry } from "../../../restapi/types.ts";
import { useEffect, useState } from "react";
import {
  useDeleteTimeEntries,
  useCreateTimeEntry,
} from "../../../hooks/useTimesheet.tsx";
import { displayErrorMessage } from "../utils/utils.ts";
import { getDatesBetween } from "../utils/dates.ts";
import { normalizeDate } from "../utils/dates.ts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import WarningExistingEntry from "./WarningExistEntry.tsx";
import ErrorMessage from "./ErrorMessage.tsx";
import Krm3Button from "../../commons/Krm3Button.tsx";
import { CheckIcon, SaveIcon, TrashIcon } from "lucide-react";

interface Props {
  task: Task;
  timeEntries: TimeEntry[];
  startDate: Date;
  endDate: Date;
  closeModal: () => void;
  readOnly: boolean;
  selectedResourceId: number | null;
}

export default function EditTimeEntry({
  task,
  timeEntries,
  closeModal,
  startDate,
  endDate,
  readOnly,
  selectedResourceId,
}: Props) {
  const startEntry = timeEntries.find(
    (item) => item.date === normalizeDate(startDate) && item.task == task.id
  );
  const [fromDate, setFromDate] = useState<Date>(
    startDate <= endDate ? startDate : endDate
  );
  const [toDate, setToDate] = useState<Date>(
    endDate >= startDate ? endDate : startDate
  );
  const [keepEntries, setKeepEntries] = useState<boolean>(true);
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

  function handleChangeDate(date: Date, type: "from" | "to") {
    if (type === "from") {
      setFromDate(date);
      setDaysWithTimeEntries(updateDaysWithTimeEntries(date, toDate));
    } else {
      setToDate(date);
      setDaysWithTimeEntries(updateDaysWithTimeEntries(fromDate, date));
    }
  }

  const [totalHours, setTotalHours] = useState(
    startEntry
      ? Number(startEntry.dayShiftHours) +
      Number(startEntry.nightShiftHours) +
      Number(startEntry.travelHours) +
      Number(startEntry.onCallHours)
      : 0
  ); // SHOULD ON CALL HOURS BE ADDED TO TOTAL HOURS???

  const [dayShiftHours, setDayShiftHours] = useState(
    startEntry ? Number(startEntry.dayShiftHours) : 0
  );
  const [nightShiftHours, setNightShiftHours] = useState(
    startEntry ? Number(startEntry.nightShiftHours) : 0
  );
  const [onCallHours, setOnCallHours] = useState(
    startEntry ? Number(startEntry.onCallHours) : 0
  );
  const [travelHours, setTravelHours] = useState(
    startEntry ? Number(startEntry.travelHours) : 0
  );

  const [comment, setComment] = useState(
    startEntry && startEntry.comment ? startEntry.comment : ""
  );

  const {
    mutateAsync: deleteTimeEntries,
    error: deletionError,
    isLoading,
  } = useDeleteTimeEntries();
  const { mutateAsync: createTimeEntries, error: creationError } =
    useCreateTimeEntry(selectedResourceId);

  function getDatesToSave() {
    if (keepEntries) {
      return getDatesBetween(fromDate, toDate);
    } else {
      const datesWithNoTimeEntries = getDatesBetween(fromDate, toDate).filter(
        (date) => !daysWithTimeEntries.includes(normalizeDate(date))
      );
      return datesWithNoTimeEntries;
    }
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
          normalizeDate(toDate) >= normalizeDate(timeEntry.date)
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
      {/* Header
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-xl font-semibold text-gray-900">Edit Time Entry</h2>
          <p className="text-sm text-gray-600 mt-1">Task: {task.title}</p>
        </div> */}

      {/* Date Selection Section */}
      <div className="space-y-4" id="datepickers-container">
        <h3 className="text-lg font-medium text-gray-900">Date Range</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="datepickers">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <DatePicker
              dateFormat="yyyy-MM-dd"
              maxDate={toDate}
              selected={fromDate}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(date: Date | null) => {
                if (!!date) {
                  handleChangeDate(date, "from");
                }
              }}
              disabled={readOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <DatePicker
              dateFormat="yyyy-MM-dd"
              selected={toDate}
              minDate={fromDate}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <h3 className="text-lg font-medium text-gray-900">Hours</h3>
          {/* <div className="text-sm text-gray-600">
            Total:{" "}
            <span
              className={`font-medium ${
                totalHours > 24 ? "text-red-600" : "text-gray-900"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Daytime Hours
            </label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nighttime Hours
            </label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Travel Hours
            </label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              On Call Hours
            </label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          className="block text-sm font-medium text-gray-700"
          id="comment-label"
        >
          Comment
        </label>
        <textarea
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
          daysWithTimeEntries={daysWithTimeEntries}
          keepEntries={keepEntries}
          setKeepEntries={setKeepEntries}
          isCheckbox
        />
      )}
      {totalHours > 24 && (
        <ErrorMessage message="Total hours cannot exceed 24 hours per day." />
      )}

      {creationError && (
        <ErrorMessage
          message={displayErrorMessage(creationError) || "Creation Error"}
        />
      )}

      {/* Action Buttons */}
      <div
        id="action-buttons"
        className="flex items-center justify-between pt-6 border-t border-gray-200"
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
