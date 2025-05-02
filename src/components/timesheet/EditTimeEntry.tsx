import { Task, TimeEntry } from "../../restapi/types";
import React, { useEffect, useState } from "react";
import { ChevronDown, Trash2, LoaderCircle } from "lucide-react";
import { formatDate } from "./Krm3Calendar";
import ConfirmationModal from "../commons/ConfirmationModal.tsx";
import {
  useDeleteTimeEntries,
  useCreateTimeEntry,
} from "../../hooks/timesheet.tsx";
import { normalizeDate } from "./utils.ts";

interface Props {
  selectedDates: Date[];
  task: Task;
  timeEntries: TimeEntry[];
  startDate: Date;
  closeModal: () => void;
}

export default function EditTimeEntry({
  selectedDates,
  task,
  timeEntries,
  closeModal,
  startDate,
}: Props) {
  const formattedStartDate =
    startDate.getFullYear() +
    "-" +
    String(startDate.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(startDate.getDate()).padStart(2, "0");

  const startEntry = timeEntries.find(
    (item) => item.date === formattedStartDate && item.task == task.id
  );

  const [timeEntryData, setTimeEntryData] = useState({
    workHours: startEntry ? startEntry.workHours : "8",
    overtimeHours: startEntry ? startEntry.overtimeHours : "0",
    travelHours: startEntry ? startEntry.travelHours : "0",
    onCallHours: startEntry ? startEntry.onCallHours : "0",
    restHours: startEntry ? startEntry.restHours : "0",
  });

  const hoursLabel: Record<keyof typeof timeEntryData, string> = {
    workHours: "Worked hours",
    overtimeHours: "Overtime hours",
    travelHours: "Travel hours",
    onCallHours: "On-call hours",
    restHours: "Rest hours",
  };
  const [comment, setComment] = useState(startEntry ? startEntry.comment : "");
  const times = [1, 2, 4, 8];

  const shouldDetailedViewBeOpenedOnFormLoad =
    !!startEntry &&
    (!times.includes(Number(startEntry.workHours)) ||
      startEntry.restHours != 0 ||
      startEntry.onCallHours != 0 ||
      startEntry.travelHours != 0 ||
      startEntry.overtimeHours != 0);

  const [isDetailedViewOpened, setIsDetailedViewOpened] = useState<boolean>(
    shouldDetailedViewBeOpenedOnFormLoad
  );

  const [invalidTimeFormat, setInvalidTimeFormat] = useState<string[]>([]);

  const [totalHoursExceeded, setTotalHoursExceeded] = useState(false);

  const [daysWithTimeEntries, setDaysWithTimeEntries] = useState(
    timeEntryData
      ? selectedDates.filter((selectedDate) =>
          timeEntries.find(
            (timeEntry) =>
              timeEntry.date == normalizeDate(selectedDate) &&
              timeEntry.task == task.id
          )
        )
      : []
  );
  //switch to that code when api for overwriting timeentries is ready
  // const isClearButtonVisible =
  //   daysWithTimeEntries.filter(
  //     (day) => normalizeDate(day) != normalizeDate(startDate)
  //   ).length > 0 ||
  //   (daysWithTimeEntries.length == 1 &&
  //     normalizeDate(daysWithTimeEntries[0]) == normalizeDate(startDate));

  const isClearButtonVisible = daysWithTimeEntries.length > 0;

  const timeEntriesToDelete = timeEntries
    .filter((timeEntry) => {
      return (
        selectedDates.find(
          (selectedDate) => normalizeDate(selectedDate) == timeEntry.date
        ) && timeEntry.task == task.id
      );
    })
    .map((timeEntry) => timeEntry.id);

  const [isClearModalOpened, setIsClearModalOpened] = useState(false);

  const {
    mutateAsync: deleteTimeEntries,
    error: deletionError,
    isLoading,
    isSuccess: deletionIsSuccess,
  } = useDeleteTimeEntries();
  const {
    mutateAsync: createTimeEntries,
    error: creationError,
    isSuccess: creationSuccess,
  } = useCreateTimeEntry();

  useEffect(() => {
    if (creationSuccess) {
      closeModal();
    }
  }, [creationSuccess]);

  const validateInput = (
    numberOfHours: string,
    key: keyof typeof timeEntryData
  ) => {
    if (invalidTimeFormat.includes(key)) {
      setInvalidTimeFormat(invalidTimeFormat.filter((item) => item !== key));
    }

    const value = parseFloat(numberOfHours);
    let isFormatValid = true;

    for (const character of numberOfHours) {
      if (!"1234567890.".includes(character)) {
        isFormatValid = false;
      }
    }
    if (isNaN(value)) isFormatValid = false;

    if (!Number.isInteger(value * 4)) {
      isFormatValid = false;
    }

    if (!isFormatValid) {
      setInvalidTimeFormat([...invalidTimeFormat, key]);
    }
  };

  const handleChangeHourInput = (
    value: string,
    key: keyof typeof timeEntryData
  ) => {
    setTimeEntryData({ ...timeEntryData, [key]: value });

    setTotalHoursExceeded(false);

    validateInput(value, key);

    const totalHours = Number(
      Object.values({ ...timeEntryData, [key]: value }).reduce(
        (acc, curr) => Number(acc) + Number(curr),
        0
      )
    );
    if (totalHours > 24) {
      setTotalHoursExceeded(true);
    }
  };

  const submit = async () => {
    await createTimeEntries({
      taskId: task.id,
      dates: selectedDates.map((date) => normalizeDate(date)),
      workHours: Number(timeEntryData.workHours),
      onCallHours: Number(timeEntryData.onCallHours),
      restHours: Number(timeEntryData.restHours),
      travelHours: Number(timeEntryData.travelHours),
      overtimeHours: Number(timeEntryData.overtimeHours),
      comment: comment,
    }).then(() => closeModal);
  };

  return (
    <div className="flex flex-col space-y-6" id="edit-time-entry-container">
      <ConfirmationModal
        open={isClearModalOpened}
        onConfirm={async () => {
          const response = await deleteTimeEntries(timeEntriesToDelete);

          if (response.status == 204) {
            setDaysWithTimeEntries([]);
            setIsClearModalOpened(false);
          }
        }}
        content={
          <>
            {!deletionIsSuccess && (
              <>
                {`Are you sure to clear time entries for these days?:`}
                <div
                  className="flex flex-wrap mt-2"
                  id="clear-confirmation-days"
                >
                  {daysWithTimeEntries.map((day, idx) => (
                    <p
                      className="mr-2.5 mb-2.5 bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-1 rounded"
                      key={idx}
                      id={`clear-day-${idx}`}
                    >
                      {formatDate(day)}
                    </p>
                  ))}
                </div>
              </>
            )}

            <div className="flex justify-center">
              {isLoading && (
                <LoaderCircle
                  className="animate-spin w-4 h-4"
                  id="delete-loader"
                />
              )}
            </div>
            {deletionError && String(deletionError) != "null" && (
              <p className="mt-2 text-red-500" id="deletion-error-message">
                {String(deletionError)}
              </p>
            )}
          </>
        }
        title="Clear days"
        onClose={() => setIsClearModalOpened(false)}
      />
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center"
        id="days-without-entries-section"
      >
        <label
          className="sm:w-1/4 font-semibold mb-2 sm:mb-0"
          id="days-without-entries-label"
        >
          Days without time entries
        </label>
        <div
          className="sm:w-2/4 w-full flex flex-wrap"
          id="days-without-entries-container"
        >
          {selectedDates
            .filter((selectedDate) => {
              if (!daysWithTimeEntries.includes(selectedDate)) return true;
              else return false;
            })
            .map((date, idx) => (
              <p
                key={idx}
                id={`day-without-entry-${idx}`}
                className="mr-2.5 mb-2.5 bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-1 rounded"
              >
                {formatDate(date)}
              </p>
            ))}
        </div>
      </div>

      {isClearButtonVisible && (
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center"
          id="days-with-entries-section"
        >
          <label
            className="sm:w-1/4 font-semibold mb-2 sm:mb-0"
            id="days-with-entries-label"
          >
            Days with time entries
          </label>
          <div
            className="sm:w-2/4 w-full flex flex-wrap"
            id="days-with-entries-container"
          >
            {daysWithTimeEntries.map((day, idx) => (
              <p
                key={idx}
                id={`day-with-entry-${idx}`}
                className="mr-2.5 mb-2.5 bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-1 rounded"
              >
                {formatDate(day)}
              </p>
            ))}
          </div>
          <button
            className="px-4 py-2 text-white rounded-lg focus:outline-none bg-red-500 ml-auto mr-5 hover:bg-red-600"
            id="clear-entries-button"
            onClick={() => {
              setIsClearModalOpened(true);
            }}
          >
            <Trash2 />
          </button>
        </div>
      )}

      <div
        className="flex flex-col sm:flex-row items-start sm:items-center"
        id="worked-hours-section"
      >
        <label
          className="sm:w-1/4 font-semibold mb-2 sm:mb-0"
          id="worked-hours-label"
        >
          Worked hours
        </label>
        <div
          className="sm:w-2/4 w-full justify-between gap-2"
          id="worked-hours-buttons"
        >
          {times.map((time, idx) => (
            <button
              key={idx}
              id={`worked-hours-${time}`}
              className={`border rounded-md py-2 w-[24%] cursor-pointer mr-[1%] border-gray-300
                            ${
                              Number(timeEntryData.workHours) == time
                                ? "bg-yellow-100 border-yellow-500 text-yellow-700"
                                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
              onClick={() => {
                setTimeEntryData({ ...timeEntryData, workHours: String(time) });
              }}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      <div
        className="flex flex-col sm:flex-row items-start"
        id="details-section"
      >
        <label
          className="sm:w-1/4 font-semibold mb-2 sm:mb-0 mt-2"
          id="details-label"
        >
          More
        </label>

        <div
          className="sm:w-2/4 p-2 border mt-3 rounded-md opacity-80 border-gray-300"
          id="details-container"
        >
          <div className="flex flex-column">
            <button
              className="h-full hover:cursor-pointer ml-auto px-4 w-full flex"
              id="toggle-details-button"
              onClick={() => {
                setIsDetailedViewOpened(!isDetailedViewOpened);
              }}
            >
              {!isDetailedViewOpened && (
                <p id="open-details-text">Open for details...</p>
              )}
              <ChevronDown className="ml-auto" />
            </button>
          </div>
          {isDetailedViewOpened && (
            <div className="pb-5" id="detailed-hours-container">
              {(
                Object.keys(timeEntryData) as Array<keyof typeof timeEntryData>
              ).map((key) => (
                <div className="px-3" key={key} id={`${key}-container`}>
                  <p className="font-bold mt-1" id={`${key}-label`}>
                    {hoursLabel[key]}
                  </p>
                  <input
                    className={`border rounded-md p-2 cursor-pointer w-[100%] border-gray-300
                                        ${
                                          invalidTimeFormat.includes(key)
                                            ? "border border-red-500"
                                            : ""
                                        }`}
                    type="text"
                    id={`${key}-input`}
                    value={timeEntryData[key]}
                    onChange={(e) => {
                      handleChangeHourInput(e.target.value, key);
                    }}
                    onBlur={(e) => {
                      if (e.target.value === "") {
                        setTimeEntryData({ ...timeEntryData, [key]: "0" });
                        handleChangeHourInput("0", key);
                      }
                    }}
                  />
                  {invalidTimeFormat.includes(key) && (
                    <p className="text-red-500 mt-2" id={`${key}-error`}>
                      Invalid value (must be 0-0.25 ecc..)
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {totalHoursExceeded && (
        <p className="text-red-500 mt-2" id="total-hours-exceeded-error">
          The total number of hours cannot exceed 24.
        </p>
      )}

      <div
        className="flex flex-col sm:flex-row items-start sm:items-center"
        id="comment-section"
      >
        <label
          className="sm:w-1/4 font-semibold mb-2 sm:mb-0"
          id="comment-label"
        >
          Comment
        </label>
        <div className="sm:w-2/4 w-full">
          <textarea
            className="w-full border rounded-md p-2 border-gray-300"
            id="comment-textarea"
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
            }}
          ></textarea>
        </div>
      </div>
      {/*switch to that code when api for overwriting timeentries is ready*/}
      {/*{isClearButtonVisible &&*/}
      {/*  !(*/}
      {/*    daysWithTimeEntries.length == 1 &&*/}
      {/*    normalizeDate(daysWithTimeEntries[0]) == normalizeDate(startDate)*/}
      {/*  ) && (*/}
      {/*    <p className="text-red-500 mt-2">Please clear time entries first</p>*/}
      {/*  )}*/}
      {isClearButtonVisible && (
        <p className="text-red-500 mt-2" id="clear-entries-warning">
          Please clear time entries first
        </p>
      )}
      {creationError && (
        <p className="text-red-500 mt-2" id="creation-error-message">
          {creationError.status}
          {creationError.message}
        </p>
      )}
      {deletionIsSuccess && (
        <p className="text-green-600" id="deletion-success-message">
          {`You've successfully cleared time entries`}
        </p>
      )}

      <div
        className="flex justify-end items-center p-6 space-x-4"
        id="action-buttons"
      >
        <button
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none"
          id="close-button"
          onClick={closeModal}
        >
          Close
        </button>

        <button
          //switch to that code when api for overwriting timeentries is ready
          // className={`px-4 py-2 text-white rounded-lg focus:outline-none
          //           ${
          //             invalidTimeFormat.length > 0 ||
          //             (isClearButtonVisible &&
          //               !(
          //                 daysWithTimeEntries.length == 1 &&
          //                 normalizeDate(daysWithTimeEntries[0]) ==
          //                   normalizeDate(startDate)
          //               )) || totalHoursExceeded
          //               ? "bg-gray-300 cursor-not-allowed"
          //               : "bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          //           }`}
          className={`px-4 py-2 text-white rounded-lg focus:outline-none
                    ${
                      invalidTimeFormat.length > 0 ||
                      isClearButtonVisible ||
                      totalHoursExceeded
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    }`}
          id="save-button"
          onClick={async () => {
            await submit();
          }}
          // switch to that code when api for overwriting timeentries is ready
          // disabled={
          //     invalidTimeFormat.length > 0 ||
          //     (isClearButtonVisible &&
          //         !(
          //             daysWithTimeEntries.length == 1 &&
          //             normalizeDate(daysWithTimeEntries[0]) ==
          //             normalizeDate(startDate)
          //         )) || totalHoursExceeded
          // }
          disabled={
            invalidTimeFormat.length > 0 ||
            isClearButtonVisible ||
            totalHoursExceeded
          }
        >
          Save
        </button>
      </div>
    </div>
  );
}
