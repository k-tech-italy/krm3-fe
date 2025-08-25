import {Days, Schedule, Task, TimeEntry} from "../../restapi/types";
import { useState, useMemo, useEffect } from "react";
import {ChevronLeft, ChevronRight, Landmark} from "lucide-react";
import Krm3Modal from "../commons/krm3Modal";
import EditTimeEntry from "./edit-entry/EditTimeEntry";
import { TimeSheetTable } from "./TimesheetTable";
import EditDayEntry from "./edit-entry/EditDayEntry";
import VisualizationActions from "./VisualizationActions";
import { useColumnViewPreference } from "../../hooks/useView";
import {
  formatDate,
  formatDayAndMonth,
  formatMonthName, getFirstDayOfMonth,
  getFirstMondayOfMonth, getLastDayOfMonth, isDayInRange,
  isOverlappingWeek,
  normalizeDate,
} from "./utils/dates";
import { useGetCurrentUser } from "../../hooks/useAuth";
import ErrorMessage from "./edit-entry/ErrorMessage";
import { WeekRange } from "../../restapi/types";
import { displayErrorMessage, getHolidayAndSickDays } from "./utils/utils";
import Krm3Button from "../commons/Krm3Button";
import {useGetTimesheet, useSubmitTimesheet} from "../../hooks/useTimesheet";
import { toast } from "react-toastify";
import { useMediaQuery } from "react-responsive";

export default function Krm3Calendar({
  selectedResourceId,
}: {
  selectedResourceId: number | null;
}) {
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [typeDays, setTypeDays] = useState<Days>();
  const [openTimeEntryModal, setOpenTimeEntryModal] = useState<boolean>(false);
  const [isDayEntry, setIsDayEntry] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isMonth, setIsMonth] = useState<boolean>(true);
  const [schedule, setSchedule] = useState<Schedule>({})
  const { isColumnView, setColumnView } = useColumnViewPreference();
  const [bankHours, setBankHours] = useState(0)
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    if (isMonth) {
      // First Monday of the current month
      let first_monday = new Date();
      first_monday.setDate(getFirstMondayOfMonth(today));
      return first_monday;
    } else {
      // First Monday of the current week
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(today.setDate(diff));
    }
  });
  const bankDelta = timeEntries.reduce((acc, timeEntry) => {
    return acc + Number(timeEntry.bankTo) - Number(timeEntry.bankFrom)
  }, 0)
  const [selectedWeekRange, setSelectedWeekRange] = useState<WeekRange>(
    isOverlappingWeek(currentWeekStart) ? "startOfWeek" : "whole"
  );
  useEffect(() => {
    if (!isOverlappingWeek(currentWeekStart)) {
      setSelectedWeekRange("whole");
    }
  }, [currentWeekStart]);
  const { data, userCan } = useGetCurrentUser();
  const { mutateAsync: mutateSubmitTimesheet, error: submitTimesheetError } =
    useSubmitTimesheet();

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

  const isDesktop = useMediaQuery({ minWidth: 1024 });

  const isCurrentPeriod = isMonth
    ? currentWeekStart.getMonth() === new Date().getMonth() &&
      currentWeekStart.getFullYear() === new Date().getFullYear()
    : currentWeekStart <= new Date() &&
      new Date() <=
        new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000);

  const navigatePrev = () => {
    const newDate = new Date(currentWeekStart);
    if (isMonth) {
      newDate.setMonth(currentWeekStart.getMonth() - 1);

      newDate.setDate(getFirstMondayOfMonth(newDate));
    } else {
      if (selectedWeekRange == "whole") {
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
    }
    setCurrentWeekStart(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentWeekStart);
    if (isMonth) {
      newDate.setMonth(currentWeekStart.getMonth() + 1);

      newDate.setDate(getFirstMondayOfMonth(newDate));
    } else {
      if (selectedWeekRange == "whole") {
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
    }
    setCurrentWeekStart(newDate);
  };

  const holidayOrSickDays = getHolidayAndSickDays(
    timeEntries,
    scheduledDays.days
  );

  async function handleSubmitTimesheet() {
    if (data && scheduledDays.days) {
      const promise = mutateSubmitTimesheet({
        resourceId: selectedResourceId || data?.resource.id,
        startDate: normalizeDate(scheduledDays.days[0]),
        endDate: normalizeDate(
          scheduledDays.days[scheduledDays.days.length - 1]
        ),
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
    if (
      !!typeDays &&
      Object.values(typeDays).every((day) => day.closed === true)
    ) {
      return "Timesheet is already submitted";
    } else if (!isMonth) {
      return "Only available for month view";
    } else {
      return "";
    }
  }

  function scheduledHoursCompleted(){
    let hoursLeftToLog: Record<string, number> = {}
    for(const date in typeDays){
      const formattedDate = normalizeDate(date).replaceAll('-', '_')
      hoursLeftToLog[date] = schedule[formattedDate]
    }
    const hoursKeys: (keyof TimeEntry)[] = [
      'travelHours',
      'holidayHours',
      'specialLeaveHours',
      'restHours',
      'sickHours',
      'nightShiftHours',
      'dayShiftHours',
      'leaveHours',
      'onCallHours',
    ];
    for (const timeEntry of timeEntries) {
      for (const hoursType of hoursKeys) {
        hoursLeftToLog[timeEntry.date] -= Number(timeEntry[hoursType]) || 0
      }
    }

    return !Object.values(hoursLeftToLog).some(hours => hours > 0)
  }
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
                {isMonth ? (
                  formatMonthName(scheduledDays.days[0])
                ) : (
                  <div>
                    <span
                      className={`${
                        selectedWeekRange == "startOfWeek" ? "font-bold" : ""
                      }`}
                    >
                      {formatDayAndMonth(scheduledDays.days[0])}
                    </span>{" "}
                    -{" "}
                    <span
                      className={`${
                        selectedWeekRange == "endOfWeek" ? "font-bold" : ""
                      }`}
                    >
                      {formatDayAndMonth(scheduledDays.days[6])}
                    </span>
                  </div>
                )}
              </span>
              <button
                onClick={navigateNext}
                className="cursor-pointer"
                id="nav-next-btn"
              >
                <ChevronRight />
              </button>
            </div>

            <div className={`flex flex-col md:flex-row items-center gap-2 mr-4 my-0`}>
              <Landmark size={isDesktop ? 40 : 30}/>
              <div className={'flex flex-col'}>
                <p data-testid={"bank-total"}
                   className={`font-bold my-0 md:text-2xl ${bankHours >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {bankHours.toFixed(2).replace(/\.?0+$/, "")}h
                </p>
                <p className={`font-bold ${bankDelta >= 0 ? 'text-green-500': 'text-red-500 hidden md:block'}`}
                data-testid={"bank-delta"}>
                  (𝚫 = {bankDelta >= 0 ? '+' : ''}{bankDelta.toFixed(2).replace(/\.?0+$/, "")}h)</p>
              </div>
            </div>
            <Krm3Button
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
                        currentWeekStart > weekStart
                          ? "endOfWeek"
                          : "startOfWeek"
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
          />
          <TimeSheetTable
            isColumnView={isColumnView}
            setOpenTimeEntryModal={setOpenTimeEntryModal}
            setSelectedTask={setSelectedTask}
            setTimeEntries={setTimeEntries}
            setNoWorkingDay={setTypeDays}
            setIsDayEntry={setIsDayEntry}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            scheduledDays={scheduledDays}
            startDate={startDate}
            endDate={endDate}
            selectedResourceId={selectedResourceId}
            readOnly={readOnly}
            selectedWeekRange={selectedWeekRange}
            setSchedule={setSchedule}
            setBankHours={setBankHours}
            schedule={schedule}
          />
          <div className="flex justify-end items-center mt-4">
            <Krm3Button
              onClick={() => handleSubmitTimesheet()}
              style="primary"
              label="Submit Timesheet"
              disabled={
                !isMonth ||
                (!!typeDays &&
                  Object.values(typeDays).every((day) => day.closed === true))
                  || !scheduledHoursCompleted()
              }
              disabledTooltipMessage={disabledSubmitButtonText()}
            />
          </div>

          {openTimeEntryModal &&
            selectedTask &&
            startDate &&
            endDate &&
            typeDays && (
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
                        calendarDays={typeDays}
                        schedule={schedule}
                      />
                    ) : (
                      <EditTimeEntry
                        holidayOrSickDays={holidayOrSickDays}
                        noWorkingDays={typeDays}
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
