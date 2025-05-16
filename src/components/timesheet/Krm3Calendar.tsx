import { useState, useMemo } from "react";
import { Task, TimeEntry } from "../../restapi/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Krm3Modal from "../commons/krm3Modal";
import EditTimeEntry from "./EditTimeEntry";
import { TimeSheetTable } from "./TimesheetTable";
import EditDayEntry from "./edit-day/EditDayEntry";
import VisualizationActions from "./VisualizationActions";
import { useColumnViewPreference } from "../../hooks/commons";

export const formatDate = (
  date: Date,
  isDay?: boolean,
  isMonthName?: boolean
) => {
  if (isDay) {
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      weekday: "narrow",
    });
  }
  if (isMonthName) {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }
  return date.toLocaleDateString("en-US", {
    weekday: "short",
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
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isMonth, setIsMonth] = useState<boolean>(false);
  const { isColumnView, setColumnView } = useColumnViewPreference();
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
    <div  id="krm3-calendar-container">
      <div className="flex justify-between">
        <div
          className="flex  items-center justify-between min-w-[180px]"
          id="calendar-navigation"
        >
          <button
            id="nav-prev-btn"
            onClick={navigatePrev}
            className="cursor-pointer"
          >
            <ChevronLeft />
          </button>
          <span className="font-medium" id="date-range-display">
            {isMonth
              ? formatDate(scheduledDays.days[0], false, isMonth)
              : `${formatDate(scheduledDays.days[0])} - ${formatDate(
                  scheduledDays.days[6]
                )}`}
          </span>
          <button
            onClick={navigateNext}
            className="cursor-pointer"
            id="nav-next-btn"
          >
            <ChevronRight />
          </button>
        </div>
        <button
          id="today-btn"
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
          {isMonth ? "This month" : "This week"}
        </button>
      </div>
      <VisualizationActions
        isMonth={isMonth}
        setIsMonth={setIsMonth}
        isColumnView={isColumnView}
        setColumnView={setColumnView}
      />
      <TimeSheetTable
        isColumnView={isColumnView}
        setOpenTimeEntryModal={setOpenTimeEntryModal}
        setSelectedTask={setSelectedTask}
        setTimeEntries={setTimeEntries}
        setSelectedCells={setSelectedCells}
        setSkippedDays={setSkippedDays}
        setIsDayEntry={setIsDayEntry}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        scheduleDays={scheduledDays}
      />
      {openTimeEntryModal &&
        selectedCells &&
        selectedTask &&
        startDate &&
        endDate && (
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
                    endDate={endDate}
                    timeEntries={timeEntries}
                  />
                ) : (
                  <EditTimeEntry
                    startDate={startDate}
                    endDate={endDate}
                    task={selectedTask}
                    timeEntries={timeEntries}
                    closeModal={() => {
                      setOpenTimeEntryModal(false);
                      setSelectedCells(undefined);
                    }}
                  />
                )}
              </>
            }
            title={
              isDayEntry
                ? "Day Entry"
                : `Add Time Entry for ${selectedTask.title}`
            }
          />
        )}
    </div>
  );
}
