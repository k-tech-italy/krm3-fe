import React, { useEffect, useState } from "react";
import { formatDate } from "../Krm3Calendar";
import { useCreateTimeEntry } from "../../../hooks/timesheet";
import { TimeEntry } from "../../../restapi/types";
import { normalizeDate } from "../utils";
import { Trash } from "lucide-react";

interface Props {
  selectedDays: Date[];
  skippedDays: Date[];
  startDate: Date;
  timeEntries: TimeEntry[];
  onClose: () => void;
}

export default function EditDayEntry({
  selectedDays,
  skippedDays,
  onClose,
  startDate,
  timeEntries,
}: Props) {
  const [entryType, setEntryType] = useState<string | null>(null);
  const [leaveHours, setLeaveHours] = useState<number | undefined>();
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [days, setDays] = useState({
    selDays: selectedDays,
    skipDays: skippedDays,
  });

  const { mutate, isLoading, isError, error } = useCreateTimeEntry(onClose);

  const startEntry = timeEntries.find(
    (item) => item.date === normalizeDate(startDate)
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

  const handleEntryTypeChange = (type: string) => {
    setEntryType(type);
    if (type !== "leave") {
      setLeaveHours(undefined); // Clear leave hours if not leave
    }
  };

  const handleLeaveHoursChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setLeaveHours(Number(event.target.value));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log(event);
    if (entryType) {
      const entryData = days.selDays.map((day) => ({
        day,
        type: entryType,
        hours: entryType === "leave" ? leaveHours : undefined,
      }));
      
      mutate({
        dates: days.selDays.map((day) => day.toLocaleDateString('sv-SE')),
        holidayHours: entryType === "holiday" ? 8 : undefined,
        sickHours: entryType === "sick" ? 8 : undefined,
        leaveHours: entryType === "leave" ? leaveHours : undefined,
        workHours: 0,
      });
    }
  };

  function handleDeleteEntry(event: any): void {
    // Handle the deletion of entries TODO - DELETE API
    event.preventDefault();
    // TODO - DELETE API with skippedTaskId
    const skippedTaskId = days.skipDays.map((day) => {
        const entry = timeEntries.find(
            (item) => item.date === normalizeDate(day)
        );
        return entry?.id;
        }
    );
    setDays((prev) => ({
      selDays: [...prev.selDays, ...prev.skipDays],
      skipDays: [],
    }));
    setIsOpenConfirmModal(false);
    
  }

  return (
    <div>
      {days && days.selDays.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Selected Days:
          </h3>
          <div className="flex flex-wrap gap-2">
            {days.selDays.map((day, index) => (
              <span
                key={index}
                className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-1 rounded"
              >
                {formatDate(day)}
              </span>
            ))}
          </div>
        </div>
      )}
      {days.skipDays && days.skipDays.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Days with existing entries:
            </h3>
            <button
              type="button"
              className="text-red-500  hover:text-red-700 cursor-pointer flex items-center"
              onClick={() => setIsOpenConfirmModal(!isOpenConfirmModal)}
            >
              <span className="mr-1">Clear Days</span>
              <Trash size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {days.skipDays.map((day, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded"
              >
                {formatDate(day)}
              </span>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="pb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Entry Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Leave Hours
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                type="number"
                value={leaveHours || ""}
                onChange={handleLeaveHoursChange}
                min="1"
                max="24"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm p-2 border"
                placeholder="Enter hours"
              />
            </div>
          </div>
        )}
        <div className="pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comments
          </label>
          <textarea
            rows={3}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm p-2 border"
            placeholder="Add any notes here..."
          ></textarea>
        </div>
        {days.skipDays.length > 0 && (
          <div className="pt-4">
            <label className="block text-sm font-medium text-red-500 mb-2">
              Warning: You have selected days with existing entries. Please
              Clear it if you want to proceed.
            </label>
          </div>
        )}

        <div className="pt-4 flex justify-around">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading || isOpenConfirmModal}
            className={`w-full flex justify-center py-2 px-4 mr-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              !isOpenConfirmModal
                ? "bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            cancel
          </button>
          <button
            type="submit"
            disabled={
              !entryType ||
              isLoading ||
              isError ||
              isOpenConfirmModal ||
              !!days.skipDays.length
            }
            className={`w-full flex justify-center py-2 px-4 ml-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              entryType &&
              !isLoading &&
              !isError &&
              !isOpenConfirmModal &&
              !days.skipDays.length
                ? "bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Submit
          </button>
        </div>
      </form>

      {isLoading && (
        <div className="text-center text-yellow-500">Loading...</div>
      )}
      {isError && (
        <div className="text-center text-red-500">
          Error: {error?.message || "Something went wrong"}
        </div>
      )}
      {isOpenConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 "/>
              Are you sure you want to delete this entry?
              <br />
              <div className="flex flex-wrap gap-2 mb-4">
                {days.skipDays.map((day, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded"
                  >
                    {formatDate(day)}
                  </span>
                ))}
              </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                className="mr-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                onClick={() => setIsOpenConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={handleDeleteEntry}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
