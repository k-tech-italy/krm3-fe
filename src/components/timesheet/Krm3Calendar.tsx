import { useState, useMemo } from "react";
import { Task, TimeEntry } from "../../restapi/types";
import { ArrowBigLeft, ArrowBigRight } from "lucide-react";
import Krm3Modal from "../commons/krm3Modal";
import EditTimeEntry from "./EditTimeEntry";
import { TimeSheetTable } from "./TimesheetTable";
import EditDayEntry from "./edit-day/EditDayEntry";

export const formatDate = (
  date: Date,
  isDay?: boolean,
  isMonthName?: boolean
) => {
  if (isDay) {
    return date.toLocaleDateString("en-US", {
      day: "numeric",
    });
  }
  if (isMonthName) {
    return date.toLocaleDateString("en-US", {
      month: "long",
    });
  }
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

export default function Krm3Calendar() {
  const [selectedCells, setSelectedCells] = useState<Date[] | undefined>();
  const [skippedDays, setSkippedDays] = useState<Date[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [openTimeEntryModal, setOpenTimeEntryModal] = useState<boolean>(false);
  const [isDayEntry, setIsDayEntry] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [isMonth, setIsMonth] = useState<boolean>(false);

  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });

  const scheduledDays = useMemo(() => {
    const days = [];
    const currentMonth = currentWeekStart.getMonth();
    const monthLength = new Date(
      currentWeekStart.getFullYear(),
      currentMonth + 1,
      0
    ).getDate();
    let numberOfDays = 7;

    if (isMonth) {
      numberOfDays = monthLength;
    }
    for (let i = 0; i < numberOfDays; i++) {
      const day = isMonth
        ? new Date(currentWeekStart.getFullYear(), currentMonth, i + 1)
        : new Date(currentWeekStart);

      if (!isMonth) {
        day.setDate(currentWeekStart.getDate() + i);
      }
      days.push(day);
    }
    return { days, numberOfDays };
  }, [currentWeekStart, isMonth]);

  const isToday =
    currentWeekStart <= new Date() &&
    new Date() <=
      new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000);

  const navigatePrev = () => {
    const newDate = new Date(currentWeekStart);
    if (isMonth) {
      newDate.setMonth(currentWeekStart.getMonth() - 1);
    } else {
      newDate.setDate(currentWeekStart.getDate() - 7);
    }
    setCurrentWeekStart(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentWeekStart);
    if (isMonth) {
      newDate.setMonth(currentWeekStart.getMonth() + 1);
    } else {
      newDate.setDate(currentWeekStart.getDate() + 7);
    }
    setCurrentWeekStart(newDate);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={navigatePrev}
          className="px-3 py-1 bg-gray-200 rounded cursor-pointer"
        >
          <ArrowBigLeft />
        </button>
        <span className="font-medium">
          {isMonth
            ? formatDate(scheduledDays.days[0], false, isMonth)
            : `${formatDate(scheduledDays.days[0])} - ${formatDate(
                scheduledDays.days[6]
              )}`}
        </span>
        <button
          onClick={navigateNext}
          className="px-3 py-1 bg-gray-200 rounded cursor-pointer"
        >
          <ArrowBigRight />
        </button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => {
            setIsMonth(!isMonth);
          }}
          className="px-4 py-2 bg-yellow-500 text-white rounded"
        >
          {isMonth ? "Week" : "Month"}
        </button>
        <button
          onClick={() =>
            setCurrentWeekStart(() => {
              const today = new Date();
              const day = today.getDay();
              const diff = today.getDate() - day + (day === 0 ? -6 : 1);
              return new Date(today.setDate(diff));
            })
          }
          className={`${
            isToday ? "bg-gray-500 cursor-not-allowed " : "bg-yellow-500"
          } rounded px-4 py-2  text-white `}
          disabled={isToday}
        >
          Today
        </button>
      </div>
      <TimeSheetTable
        setOpenTimeEntryModal={setOpenTimeEntryModal}
        setSelectedTask={setSelectedTask}
        setTimeEntries={setTimeEntries}
        setSelectedCells={setSelectedCells}
        setSkippedDays={setSkippedDays}
        setIsDayEntry={setIsDayEntry}
        setStartDate={setStartDate}
        scheduleDays={scheduledDays}
      />
      {openTimeEntryModal && selectedCells && selectedTask && startDate && (
        <Krm3Modal
          open={openTimeEntryModal}
          onClose={() => {
            setOpenTimeEntryModal(false);
            setSelectedCells(undefined);
          }}
          children={
            <>
              {isDayEntry ? (
                <EditDayEntry
                  selectedDays={selectedCells}
                  skippedDays={skippedDays}
                  onClose={() => {
                    setOpenTimeEntryModal(false);
                    setSelectedCells(undefined);
                  }}
                  startDate={startDate}
                  timeEntries={timeEntries}
                />
              ) : (
                <EditTimeEntry
                  selectedDates={selectedCells}
                  startDate={startDate}
                  task={selectedTask}
                  timeEntries={timeEntries}
                  closeModal={() => {
                    setOpenTimeEntryModal(false);
                  }}
                />
              )}
            </>
          }
          title={isDayEntry ? "Day Entry" : "Time Entry"}
        />
      )}
    </div>
  );
}
