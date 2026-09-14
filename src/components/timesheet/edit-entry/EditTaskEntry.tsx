import { useState } from "react";
import { toast } from "react-toastify";
import "react-datepicker/dist/react-datepicker.css";
import { DayEntry, Days, Task, TaskEntry } from "../../../restapi/types.ts";
import { useCreateTaskEntry, useDeleteTaskEntries } from "../../../hooks/useTimesheet.tsx";
import { displayErrorMessage } from "../utils/utils.ts";
import { getDatesBetween, normalizeDate } from "../utils/dates.ts";
import DatePicker from "react-datepicker";
import WarningExistingEntry from "./WarningExistEntry.tsx";
import ErrorMessage from "./ErrorMessage.tsx";
import Krm3Button from "../../commons/Krm3Button.tsx";
import { CheckIcon, TrashIcon } from "lucide-react";

interface Props {
  task: Task;
  taskEntries: TaskEntry[];
  dayEntries: DayEntry[];
  startDate: Date;
  endDate: Date;
  closeModal: () => void;
  readOnly: boolean;
  selectedResourceId: number | null;
  holidayOrSickDays: string[];
  noWorkingDays: Days;
}

export default function EditTaskEntry({
  task,
  taskEntries,
  dayEntries,
  closeModal,
  startDate,
  endDate,
  readOnly,
  selectedResourceId,
  holidayOrSickDays,
  noWorkingDays,
}: Readonly<Props>) {
  const getTaskEntryDate = (entry: TaskEntry): string | undefined =>
    dayEntries.find((dayEntry) => dayEntry.id === entry.dayEntry)?.day;

  const getDatesByEntryPresence = (rangeStart: Date, rangeEnd: Date) => {
    const isMultiDaySelection = normalizeDate(rangeStart) !== normalizeDate(rangeEnd);

    const allDates = getDatesBetween(
      rangeStart,
      rangeEnd,
      noWorkingDays,
      isMultiDaySelection
    ).filter((date) => !holidayOrSickDays.includes(normalizeDate(date)));

    const entryDates = new Set(
      taskEntries
        .map(getTaskEntryDate)
        .filter((date): date is string => date !== undefined)
        .map(normalizeDate)
    );

    return {
      allDates,
      withTaskEntries: allDates.filter((date) => entryDates.has(normalizeDate(date))),
      withoutTaskEntries: allDates.filter((date) => !entryDates.has(normalizeDate(date))),
    };
  };

  const startEntry = taskEntries.find((entry) => {
    const entryDate = getTaskEntryDate(entry);
    return entryDate && normalizeDate(entryDate) === normalizeDate(startDate);
  });
  const [fromDate, setFromDate] = useState<Date>(startDate <= endDate ? startDate : endDate);
  const [toDate, setToDate] = useState<Date>(endDate >= startDate ? endDate : startDate);

  const [daysWithTaskEntries, setDaysWithTaskEntries] = useState<string[]>(
    () => getDatesByEntryPresence(fromDate, toDate).withTaskEntries
  );
  const [overrideEntries, setOverrideEntries] = useState<boolean>(true);

  function handleChangeDate(date: Date, type: "from" | "to") {
    if (type === "from") {
      setFromDate(date);
      setDaysWithTaskEntries(getDatesByEntryPresence(date, toDate).withTaskEntries);
      if (date > toDate) {
        setToDate(date);
      }
    } else {
      setToDate(date);
      setDaysWithTaskEntries(getDatesByEntryPresence(fromDate, date).withTaskEntries);
      if (date < fromDate) {
        setFromDate(date);
      }
    }
  }

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
  const totalHours = dayShiftHours + nightShiftHours + travelHours + onCallHours;

  const [comment, setComment] = useState<string>(startEntry?.comment ? startEntry.comment : "");

  const {
    mutateAsync: deleteTaskEntries,
    error: deletionError,
    isLoading,
  } = useDeleteTaskEntries();
  const { mutateAsync: createTaskEntries, error: creationError } =
    useCreateTaskEntry(selectedResourceId);

  const { withoutTaskEntries, allDates } = getDatesByEntryPresence(fromDate, toDate);

  function getDatesToSave() {
    if (!overrideEntries) {
      return withoutTaskEntries.filter(filterDatesToSave);
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
    const datesToSave = getDatesToSave();
    const entryPayload = {
      nightShiftHours,
      dayShiftHours,
      onCallHours,
      travelHours,
      comment,
      metadata: {},
    };
    const promise = createTaskEntries({
      taskId: task.id,
      dates: datesToSave,
      ...entryPayload,
    });

    toast.promise(
      promise,
      {
        pending: "Saving hours...",
        success: "Hours saved successfully",
        error: {
          render({ data }) {
            return <div>{displayErrorMessage(data)}</div>;
          },
        },
      },
      {
        autoClose: 2000,
        theme: "light",
        hideProgressBar: false,
        draggable: true,
      }
    );

    promise.then(() => closeModal()).catch(() => {});
  };

  function handleDeleteEntries() {
    const taskEntryIds = taskEntries
      .filter((taskEntry) => {
        const entryDate = getTaskEntryDate(taskEntry);
        return (
          entryDate !== undefined &&
          normalizeDate(fromDate) <= normalizeDate(entryDate) &&
          normalizeDate(toDate) >= normalizeDate(entryDate)
        );
      })
      .map((taskEntry) => taskEntry.id);
    const promise = deleteTaskEntries(taskEntryIds);

    toast.promise(
      promise,
      {
        pending: "Deleting hours...",
        success: "Hours deleted successfully",
        error: {
          render({ data }) {
            return <div>{displayErrorMessage(data)}</div>;
          },
        },
      },
      {
        autoClose: 2000,
        theme: "light",
        hideProgressBar: false,
        draggable: true,
      }
    );

    promise.then(() => closeModal()).catch(() => {});
  }

  return (
    <form onSubmit={submit} className="space-y-6" id="edit-task-entry-container">
      {/* Date Selection Section */}
      <div className="space-y-4" id="datepickers-container">
        <h3 className="text-lg font-medium text-app">Date Range</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="datepickers">
          <div>
            <label
              htmlFor="task-entry-from-date-picker"
              className="block text-sm font-medium text-app mb-2"
            >
              From Date
            </label>
            <DatePicker
              id="task-entry-from-date-picker"
              dateFormat="yyyy-MM-dd"
              selected={fromDate}
              className="w-full border border-app rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(date: Date | null) => {
                if (date) {
                  handleChangeDate(date, "from");
                }
              }}
              disabled={readOnly}
              highlightDates={[toDate]}
            />
          </div>
          <div>
            <label
              htmlFor="task-entry-to-date-picker"
              className="block text-sm font-medium text-app mb-2"
            >
              To Date
            </label>
            <DatePicker
              id="task-entry-to-date-picker"
              dateFormat="yyyy-MM-dd"
              selected={toDate}
              className="w-full border border-app rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label htmlFor="daytime-input" className="block text-sm font-medium text-app mb-2">
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
              }}
              disabled={readOnly}
            />
          </div>

          <div>
            <label htmlFor="nightime-input" className="block text-sm font-medium text-app mb-2">
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
              }}
              disabled={readOnly}
            />
          </div>

          <div>
            <label htmlFor="travelHours-input" className="block text-sm font-medium text-app mb-2">
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
              }}
              disabled={readOnly}
            />
          </div>

          <div>
            <label htmlFor="oncall-input" className="block text-sm font-medium text-app mb-2">
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
          htmlFor="comment-textarea"
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
          disabled={withoutTaskEntries.filter(filterDatesToSave).length === 0}
          disabledTooltipMessage="No empty Days, you can only overwrite existing entries"
          message="Holiday, Sick days and N/A entries will be skipped automatically."
          daysWithEntries={daysWithTaskEntries}
          entryLabel="Task entries"
          overrideEntries={overrideEntries}
          setOverrideEntries={setOverrideEntries}
          isCheckbox
        />
      )}

      {totalHours > 24 && <ErrorMessage message="Total hours cannot exceed 24 hours per day." />}

      {!!creationError && (
        <ErrorMessage message={displayErrorMessage(creationError) || "Creation Error"} />
      )}

      {!!deletionError && (
        <ErrorMessage message={displayErrorMessage(deletionError) || "Deletion Error"} />
      )}

      {/* Action Buttons */}
      <div
        id="action-buttons"
        className="flex items-center justify-between pt-6 border-t border-app"
      >
        <Krm3Button
          disabled={daysWithTaskEntries.length === 0 || readOnly}
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
