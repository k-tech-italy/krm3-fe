import { DayEntry, Days, Schedule, Task, TaskEntry, WeekRange } from "../../restapi/types";
import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Landmark } from "lucide-react";
import Krm3Modal from "../commons/krm3Modal";
import EditTaskEntry from "./edit-entry/EditTaskEntry";
import { TimeSheetTable } from "./TimesheetTable";
import EditDayEntry from "./edit-entry/EditDayEntry";
import VisualizationActions from "./VisualizationActions";
import { useColumnViewPreference } from "../../hooks/useView";
import {
  formatDate,
  formatDayAndMonth,
  formatMonthName,
  getFirstMondayOfMonth,
  isOverlappingWeek,
  normalizeDate,
} from "./utils/dates";
import { useGetCurrentUser } from "../../hooks/useAuth";
import ErrorMessage from "./edit-entry/ErrorMessage";
import { displayErrorMessage } from "./utils/utils";
import Krm3Button from "../commons/Krm3Button";
import { useSubmitTimesheet } from "../../hooks/useTimesheet";
import { toast } from "react-toastify";
import { useMediaQuery } from "react-responsive";

export default function Krm3Calendar({
  selectedResourceId,
}: Readonly<{
  selectedResourceId: number | null;
}>) {
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [taskEntries, setTaskEntries] = useState<TaskEntry[]>([]);
  const [dayEntries, setDayEntries] = useState<DayEntry[]>([]);
  const [typeDays, setTypeDays] = useState<Days>();
  const [isEntryModalOpen, setIsEntryModalOpen] = useState<boolean>(false);
  const [isDayEntry, setIsDayEntry] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isMonth, setIsMonth] = useState<boolean>(true);
  const [schedule, setSchedule] = useState<Schedule>({});
  const { isColumnView, setColumnView } = useColumnViewPreference();
  const [bankHours, setBankHours] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();

    // First Monday of the current month
    const first_monday = new Date();
    first_monday.setDate(getFirstMondayOfMonth(today));
    return first_monday;
  });
  const bankDelta = dayEntries.reduce((total, dayEntry) => {
    return total + Number(dayEntry.bank);
  }, 0);

  const [selectedWeekRange, setSelectedWeekRange] = useState<WeekRange>(() => {
    const today = new Date();
    if (!isOverlappingWeek(currentWeekStart)) return "whole";
    else if (today.getDate() > 7) return "startOfWeek";
    else return "endOfWeek";
  });
  useEffect(() => {
    if (!isOverlappingWeek(currentWeekStart)) {
      setSelectedWeekRange("whole");
    }
  }, [currentWeekStart]);
  const { data, userCan } = useGetCurrentUser();
  const { mutateAsync: mutateSubmitTimesheet, error: submitTimesheetError } = useSubmitTimesheet();

  const isEditViewAnotherUser = useMemo(() => {
    return data?.resource?.id !== selectedResourceId;
  }, [data?.resource?.id, selectedResourceId]);

  const readOnlyPermission = useMemo(() => {
    if (!isEditViewAnotherUser) {
      return true;
    }
    return userCan(["core.view_any_timesheet"]);
  }, [userCan, isEditViewAnotherUser]);

  const readWritePermission = useMemo(() => {
    if (!isEditViewAnotherUser) {
      return true;
    }
    return userCan(["core.manage_any_timesheet"]);
  }, [userCan, isEditViewAnotherUser]);

  const accessDenied = useMemo(() => {
    return !readOnlyPermission && !readWritePermission;
  }, [readOnlyPermission, readWritePermission]);

  const readOnly = useMemo(() => {
    return readOnlyPermission && !readWritePermission;
  }, [readOnlyPermission, readWritePermission]);

  const scheduledDays = useMemo(() => {
    const days = [];
    const currentMonth =
      selectedWeekRange == "endOfWeek"
        ? currentWeekStart.getMonth() + 1
        : currentWeekStart.getMonth();

    const monthLength = new Date(currentWeekStart.getFullYear(), currentMonth + 1, 0).getDate();
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
      days.push(formatDate(day));
    }
    return { days, numberOfDays };
  }, [currentWeekStart, isMonth]);

  const isDesktop = useMediaQuery({ minWidth: 1024 });

  const isCurrentPeriod = isMonth
    ? currentWeekStart.getMonth() === new Date().getMonth() &&
      currentWeekStart.getFullYear() === new Date().getFullYear()
    : currentWeekStart <= new Date() &&
      new Date() <= new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000);

  const navigatePrev = () => {
    const newDate = new Date(currentWeekStart);
    if (isMonth) {
      newDate.setMonth(currentWeekStart.getMonth() - 1);

      newDate.setDate(getFirstMondayOfMonth(newDate));
    } else if (selectedWeekRange == "whole") {
      const previousWeekStart = new Date(currentWeekStart);
      previousWeekStart.setDate(currentWeekStart.getDate() - 7);

      if (isOverlappingWeek(previousWeekStart)) {
        setSelectedWeekRange("endOfWeek");
      }
      newDate.setDate(currentWeekStart.getDate() - 7);
    } else if (selectedWeekRange == "endOfWeek") {
      setSelectedWeekRange("startOfWeek");
    } else {
      newDate.setDate(currentWeekStart.getDate() - 7);
      setSelectedWeekRange("whole");
    }
    setCurrentWeekStart(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentWeekStart);
    if (isMonth) {
      newDate.setMonth(currentWeekStart.getMonth() + 1);

      newDate.setDate(getFirstMondayOfMonth(newDate));
    } else if (selectedWeekRange == "whole") {
      const nextWeekStart = new Date(currentWeekStart);
      nextWeekStart.setDate(currentWeekStart.getDate() + 7);

      if (isOverlappingWeek(nextWeekStart)) {
        setSelectedWeekRange("startOfWeek");
      }
      newDate.setDate(currentWeekStart.getDate() + 7);
    } else if (selectedWeekRange == "startOfWeek") {
      setSelectedWeekRange("endOfWeek");
    } else {
      newDate.setDate(currentWeekStart.getDate() + 7);
      setSelectedWeekRange("whole");
    }
    setCurrentWeekStart(newDate);
  };
  async function handleSubmitTimesheet() {
    if (data && scheduledDays.days) {
      const promise = mutateSubmitTimesheet({
        resourceId: selectedResourceId || data?.resource.id,
        startDate: normalizeDate(scheduledDays.days[0]),
        endDate: normalizeDate(scheduledDays.days[scheduledDays.days.length - 1]),
      });

      await toast.promise(
        promise,
        {
          pending: "Submitting timesheet...",
          success: "Timesheet submitted successfully",
          error: displayErrorMessage(submitTimesheetError),
        },
        {
          autoClose: 2000,
          theme: "light",
          hideProgressBar: false,
          draggable: true,
        }
      );
    }
  }

  function disabledSubmitButtonText() {
    if (isSubmitted) {
      return "Timesheet is already submitted";
    } else if (!isMonth) {
      return "Only available for month view";
    } else {
      return "";
    }
  }

  function scheduledHoursCompleted() {
    const hoursLeftToLog: Record<string, number> = {};

    for (const date in typeDays) {
      const scheduleKey = normalizeDate(date).replaceAll("-", "_");
      hoursLeftToLog[normalizeDate(date)] = Number(schedule[scheduleKey]) || 0;
    }

    for (const dayEntry of dayEntries) {
      const date = normalizeDate(dayEntry.day);

      if (!(date in hoursLeftToLog)) {
        continue;
      }

      const absenceHours =
        dayEntry.isSick || dayEntry.askedHoliday ? Number(dayEntry.dueHours) || 0 : 0;

      const loggedHours =
        (Number(dayEntry.dayHours) || 0) +
        (Number(dayEntry.nightHours) || 0) +
        (Number(dayEntry.travelHours) || 0) +
        (Number(dayEntry.leaveHours) || 0) +
        (Number(dayEntry.specialLeaveHours) || 0) +
        (Number(dayEntry.restHours) || 0) +
        absenceHours -
        (Number(dayEntry.bank) || 0);

      hoursLeftToLog[date] -= loggedHours;
    }

    return !Object.values(hoursLeftToLog).some((hours) => hours > 0);
  }

  return (
    <>
      {accessDenied ? (
        <ErrorMessage message="Access Denied. You don't have permissions to View/Edit timesheet" />
      ) : (
        <div id="krm3-calendar-container">
          <div className="flex justify-between">
            <div className="flex  items-center justify-between min-w-45" id="calendar-navigation">
              <button id="nav-prev-btn" onClick={navigatePrev} className="cursor-pointer">
                <ChevronLeft />
              </button>
              <span className="font-medium" id="date-range-display">
                {isMonth ? (
                  formatMonthName(scheduledDays.days[0])
                ) : (
                  <div>
                    <span
                      data-testid={"week-start"}
                      className={`${selectedWeekRange == "startOfWeek" ? "font-bold" : ""}`}
                    >
                      {formatDayAndMonth(scheduledDays.days[0])}
                    </span>{" "}
                    -{" "}
                    <span
                      data-testid={"week-end"}
                      className={`${selectedWeekRange == "endOfWeek" ? "font-bold" : ""}`}
                    >
                      {formatDayAndMonth(scheduledDays.days[6])}
                    </span>
                  </div>
                )}
              </span>
              <button onClick={navigateNext} className="cursor-pointer" id="nav-next-btn">
                <ChevronRight />
              </button>
            </div>

            <div className={`flex flex-col md:flex-row items-center gap-2 mr-4 my-0`}>
              <Landmark size={isDesktop ? 40 : 30} data-testid="landmark-icon" />
              <div className={"flex flex-col"}>
                <p
                  data-testid={"bank-total"}
                  className={`font-bold my-0 md:text-2xl ${bankHours >= 0 ? "text-green-500" : "text-red-500"}`}
                >
                  {bankHours.toFixed(2).replace(/\.?0+$/, "")}h
                </p>
                <p
                  className={`font-bold ${bankDelta >= 0 ? "text-green-500" : "text-red-500 hidden md:block"}`}
                  data-testid={"bank-delta"}
                >
                  (𝚫 = {bankDelta >= 0 ? "+" : ""}
                  {bankDelta.toFixed(2).replace(/\.?0+$/, "")}h)
                </p>
              </div>
            </div>
            <Krm3Button
              id="krm3-calendar-current-week-button"
              onClick={() =>
                setCurrentWeekStart(() => {
                  const today = new Date();
                  if (isMonth) {
                    return new Date(
                      today.getFullYear(),
                      today.getMonth(),
                      getFirstMondayOfMonth(today)
                    );
                  } else {
                    const day = today.getDay();
                    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
                    const weekStart = new Date(today.setDate(diff));
                    if (isOverlappingWeek(weekStart)) {
                      setSelectedWeekRange(
                        currentWeekStart > weekStart ? "endOfWeek" : "startOfWeek"
                      );
                    }
                    return weekStart;
                  }
                })
              }
              type="button"
              style="primary"
              label={isMonth ? "This month" : "This week"}
              disabled={isCurrentPeriod}
            />
          </div>
          <VisualizationActions
            isMonth={isMonth}
            setIsMonth={setIsMonth}
            isColumnView={isColumnView}
            setColumnView={setColumnView}
            currentWeekStart={currentWeekStart}
            setCurrentWeekStart={setCurrentWeekStart}
          />
          <TimeSheetTable
            isColumnView={isColumnView}
            setIsEntryModalOpen={setIsEntryModalOpen}
            setSelectedTask={setSelectedTask}
            setTaskEntries={setTaskEntries}
            setDayEntries={setDayEntries}
            setNoWorkingDay={setTypeDays}
            setIsDayEntry={setIsDayEntry}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            scheduledDays={scheduledDays}
            startDate={startDate}
            selectedResourceId={selectedResourceId}
            readOnly={readOnly}
            selectedWeekRange={selectedWeekRange}
            setSchedule={setSchedule}
            setBankHours={setBankHours}
            setIsSubmitted={setIsSubmitted}
          />
          <div className="flex justify-end items-center mt-4">
            <Krm3Button
              onClick={() => handleSubmitTimesheet()}
              style="primary"
              label="Submit Timesheet"
              disabled={!isMonth || isSubmitted || !scheduledHoursCompleted()}
              disabledTooltipMessage={disabledSubmitButtonText()}
            />
          </div>
          {/* The entry modal is opened by drag and drop, which is covered by integration tests. */}
          {/* v8 ignore next 40 */}
          {isEntryModalOpen && (isDayEntry || selectedTask) && startDate && endDate && typeDays && (
            <Krm3Modal
              open={isEntryModalOpen}
              onClose={() => {
                setIsEntryModalOpen(false);
              }}
              children={
                <>
                  {isDayEntry ? (
                    <EditDayEntry
                      onClose={() => {
                        setIsEntryModalOpen(false);
                      }}
                      startDate={startDate}
                      endDate={endDate}
                      dayEntries={dayEntries}
                      taskEntries={taskEntries}
                      readOnlyByRole={readOnly}
                      selectedResourceId={selectedResourceId}
                      calendarDays={typeDays}
                      schedule={schedule}
                    />
                  ) : (
                    selectedTask && (
                      <EditTaskEntry
                        noWorkingDays={typeDays}
                        startDate={startDate}
                        endDate={endDate}
                        task={selectedTask}
                        taskEntries={taskEntries.filter(
                          (taskEntry) => taskEntry.task === selectedTask?.id
                        )}
                        dayEntries={dayEntries}
                        closeModal={() => {
                          setIsEntryModalOpen(false);
                        }}
                        readOnly={readOnly}
                        selectedResourceId={selectedResourceId}
                      />
                    )
                  )}
                </>
              }
              title={
                isDayEntry
                  ? "Day Entry"
                  : `${readOnly ? "View" : "Add"} Task Entry for ${selectedTask?.title}`
              }
            />
          )}
        </div>
      )}
    </>
  );
}
