import { Task, TimeEntry } from "../../restapi/types";
import { useEffect, useState } from "react";
import {
  useDeleteTimeEntries,
  useCreateTimeEntry,
} from "../../hooks/timesheet.tsx";
import { displayErrorMessage } from "./utils/utils.ts";
import { getDatesBetween } from "./utils/dates.ts";
import { normalizeDate } from "./utils/dates.ts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Props {
  task: Task;
  timeEntries: TimeEntry[];
  startDate: Date;
  endDate: Date;
  closeModal: () => void;
}

export default function EditTimeEntry({
  task,
  timeEntries,
  closeModal,
  startDate,
  endDate,
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
          Number(startEntry.travelHours)
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

  const [totalHoursExceeded, setTotalHoursExceeded] = useState(false);

  useEffect(() => {
    setTotalHoursExceeded(totalHours > 24);
  }, [totalHours]);

  const {
    mutateAsync: deleteTimeEntries,
    error: deletionError,
    isLoading,
  } = useDeleteTimeEntries();
  const { mutateAsync: createTimeEntries, error: creationError } =
    useCreateTimeEntry();

  const submit = () => {
    createTimeEntries({
      taskId: task.id,
      dates: getDatesBetween(fromDate, toDate),
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
    <div className="flex flex-col space-y-4" id="edit-time-entry-container">
      <div className="items-start" id="datepickers-container">
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
          <div className="w-full md:w-1/3 mb-4 md:mb-0">
            <label className="block text-sm font-medium mb-1">Al giorno:</label>
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

      <div className="items-start" id="details-section">
        <div className="flex justify-between items-baseline my-4">
          <div className="text-lg font-bold" id="details-label">
            Hours
          </div>
          <div className="text-sm font-bold" id="details-label">
            Total Hours: {totalHours}h
          </div>
        </div>
        <div
          className="grid grid-cols-3 gap-4 items-end"
          id="details-container"
        >
          <div>
            <p>Daytime hours</p>
            <input
              className={`border rounded-md p-2 cursor-pointer w-[100%] border-gray-300`}
              type="number"
              id={`daytime-input`}
              step={0.5}
              value={dayShiftHours || ""}
              onChange={(e) => {
                setDayShiftHours(Number(e.target.value));
                setTotalHours(
                  Number(e.target.value) + nightShiftHours + travelHours
                );
              }}
            />
          </div>
          <div>
            <p>Nighttime hours</p>
            <input
              className={`border rounded-md p-2 cursor-pointer w-[100%] border-gray-300`}
              type="number"
              step={0.5}
              id={`daytime-input`}
              value={nightShiftHours || ""}
              onChange={(e) => {
                setNightShiftHours(Number(Number(e.target.value).toFixed(1)));
                setTotalHours(
                  Number(e.target.value) + dayShiftHours + travelHours
                );
              }}
            />
          </div>
          <div>
            <p>Travel hours</p>
            <input
              className={`border rounded-md p-2 cursor-pointer w-[100%] border-gray-300`}
              type="number"
              step={0.5}
              id={`travelHours-input`}
              value={travelHours || ""}
              onChange={(e) => {
                setTravelHours(Number(e.target.value));
                setTotalHours(
                  dayShiftHours + Number(e.target.value) + nightShiftHours
                );
              }}
            />
          </div>
          <div>
            <p>On Call hours</p>
            <input
              className={`border rounded-md p-2 cursor-pointer w-[100%] border-gray-300`}
              type="number"
              step={0.5}
              id={`oncall-input`}
              value={onCallHours || ""}
              onChange={(e) => {
                setOnCallHours(Number(e.target.value));
              }}
            />
          </div>
        </div>
      </div>

      {totalHoursExceeded && (
        <p className="text-red-500 mt-2" id="total-hours-exceeded-error">
          The total number of hours cannot exceed 24.
        </p>
      )}

      <div className="items-start" id="comment-section">
        <label id="comment-label">Comment</label>
        <div className="w-full">
          <textarea
            className="w-full border rounded-md p-2 border-gray-300 resize-none"
            id="comment-textarea"
            rows={2}
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
            }}
          />
        </div>
      </div>
      {creationError && (
        <p className="text-red-500 mt-2" id="creation-error-message">
          {displayErrorMessage(creationError) ||
            "Creation failed. Please try again."}
        </p>
      )}
      {daysWithTimeEntries.length > 0 && (
        <p className="text-orange-500" id="warning-message">
          <strong>Warning: </strong>

          {"A time entry already exists for the following days: " +
            daysWithTimeEntries.map((day) => day.split("-")[2]).join(", ") +
            ". Save for update"}
        </p>
      )}
      <div className="flex justify-between items-center ">
        <div>
          <button
            className={`px-4 py-2 text-white rounded-lg  ${
              daysWithTimeEntries.length === 0
                ? "cursor-not-allowed bg-gray-300"
                : " bg-red-500 hover:bg-red-700 focus:outline-none"
            }`}
            id="delete-button"
            onClick={handleDeleteEntries}
            disabled={daysWithTimeEntries.length === 0}
          >
            Delete
          </button>
        </div>
        <div className="flex justify-end" id="action-buttons">
          <button
            disabled={isLoading}
            className="px-4 py-2 mr-4 bg-[#4B6478] text-white   rounded-lg hover:bg-gray-400 focus:outline-none"
            id="close-button"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 text-white rounded-lg focus:outline-none
                    ${
                      totalHoursExceeded ||
                      totalHours === 0 ||
                      onCallHours === 0
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-yellow-500 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    }`}
            id="save-button"
            disabled={
              totalHoursExceeded || totalHours === 0 || onCallHours === 0
            }
            onClick={submit}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
