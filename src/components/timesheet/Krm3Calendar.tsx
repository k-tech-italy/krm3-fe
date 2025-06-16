import { useState, useMemo } from "react";
import { Days, DayType, Task, TimeEntry } from "../../restapi/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Krm3Modal from "../commons/krm3Modal";
import EditTimeEntry from "./edit-entry/EditTimeEntry";
import { TimeSheetTable } from "./TimesheetTable";
import EditDayEntry from "./edit-entry/EditDayEntry";
import VisualizationActions from "./VisualizationActions";
import { useColumnViewPreference } from "../../hooks/useView";
import {
  formatDate,
  formatDayAndMonth,
  formatMonthName,
  getFirstMondayOfMonth,
} from "./utils/dates";
import { useGetCurrentUser } from "../../hooks/useAuth";
import ErrorMessage from "./edit-entry/ErrorMessage";
import { getHolidayAndSickDays } from "./utils/utils";

export default function Krm3Calendar({
  selectedResourceId,
}: {
  selectedResourceId: number | null;
}) {
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [noWorkingDays, setNoWorkingDay] = useState<Days>();
  const [openTimeEntryModal, setOpenTimeEntryModal] = useState<boolean>(false);
  const [isDayEntry, setIsDayEntry] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isMonth, setIsMonth] = useState<boolean>(true);
  const { isColumnView, setColumnView } = useColumnViewPreference();
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });

  const { data, userCan } = useGetCurrentUser();

  const isEditViewAnotherUser = useMemo(() => {
    return data?.resource?.id !== selectedResourceId;
  }, [data?.resource?.id, selectedResourceId]);

  const readOnlyPermission = useMemo(() => {
    if (!isEditViewAnotherUser) {
      return true;
    }
    return (
      userCan(["core.manage_any_project", "core.view_any_timesheet"]) ||
      userCan(["core.view_any_project", "core.view_any_timesheet"])
    );
  }, [userCan, isEditViewAnotherUser]);

  const readWritePermission = useMemo(() => {
    if (!isEditViewAnotherUser) {
      return true;
    }
    return (
      userCan(["core.manage_any_project", "core.manage_any_timesheet"]) ||
      userCan(["core.view_any_project", "core.manage_any_timesheet"])
    );
  }, [userCan, isEditViewAnotherUser]);

  const accessDenied = useMemo(() => {
    return !readOnlyPermission && !readWritePermission;
  }, [readOnlyPermission, readWritePermission]);

  const readOnly = useMemo(() => {
    return readOnlyPermission && !readWritePermission;
  }, [readOnlyPermission, readWritePermission]);

  const currentMonth = useMemo(() => {
    // currentWeekStart.getMonth();
    const month = new Date();
    month.getMonth();
    return month.getMonth();
  }, [currentWeekStart]);

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
        if (day.getMonth() !== currentMonth) {
          numberOfDays = i;
          break;
        }
        day.setDate(currentWeekStart.getDate() + i);
      }
      days.push(formatDate(day));
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

      newDate.setDate(getFirstMondayOfMonth(newDate));
    } else {
      newDate.setDate(currentWeekStart.getDate() - 7);
    }
    setCurrentWeekStart(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentWeekStart);
    if (isMonth) {
      newDate.setMonth(currentWeekStart.getMonth() + 1);

      newDate.setDate(getFirstMondayOfMonth(newDate));
    } else {
      newDate.setDate(currentWeekStart.getDate() + 7);
    }
    setCurrentWeekStart(newDate);
  };

  const holidayOrSickDays = getHolidayAndSickDays(
    timeEntries,
    scheduledDays.days
  );

  return (
    <>
      {accessDenied ? (
        <ErrorMessage message="Access Denied. You don't have permissions to View/Edit timesheet" />
      ) : (
        <div id="krm3-calendar-container">
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
                  ? formatMonthName(scheduledDays.days[0])
                  : `${formatDayAndMonth(
                      scheduledDays.days[0]
                    )} - ${formatDayAndMonth(scheduledDays.days[6])}`}
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
            setNoWorkingDay={setNoWorkingDay}
            setIsDayEntry={setIsDayEntry}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            scheduledDays={scheduledDays}
            startDate={startDate}
            endDate={endDate}
            selectedResourceId={selectedResourceId}
            readOnly={readOnly}
          />
          {openTimeEntryModal &&
            selectedTask &&
            startDate &&
            endDate &&
            noWorkingDays && (
              <Krm3Modal
                open={openTimeEntryModal}
                onClose={() => {
                  setOpenTimeEntryModal(false);
                }}
                children={
                  <>
                    {isDayEntry ? (
                      <EditDayEntry
                        onClose={() => {
                          setOpenTimeEntryModal(false);
                        }}
                        startDate={startDate}
                        endDate={endDate}
                        timeEntries={timeEntries}
                        readOnly={readOnly}
                        selectedResourceId={selectedResourceId}
                        noWorkingDays={noWorkingDays}
                      />
                    ) : (
                      <EditTimeEntry
                        holidayOrSickDays={holidayOrSickDays}
                        noWorkingDays={noWorkingDays}
                        startDate={startDate}
                        endDate={endDate}
                        task={selectedTask}
                        timeEntries={timeEntries.filter(
                          (timeEntry) => timeEntry.task === selectedTask.id
                        )}
                        closeModal={() => {
                          setOpenTimeEntryModal(false);
                        }}
                        readOnly={readOnly}
                        selectedResourceId={selectedResourceId}
                      />
                    )}
                  </>
                }
                title={
                  isDayEntry
                    ? "Day Entry"
                    : `${readOnly ? "View" : "Add"} Time Entry for ${
                        selectedTask.title
                      }`
                }
              />
            )}
        </div>
      )}
    </>
  );
}
