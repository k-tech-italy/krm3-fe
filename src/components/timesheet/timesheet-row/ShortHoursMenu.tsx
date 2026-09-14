import React, { useMemo, useState, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { useCreateTaskEntry, useDeleteTaskEntries } from "../../../hooks/useTimesheet";
import { displayErrorMessage } from "../utils/utils";
import { formatDate, getDateRange, normalizeDate } from "../utils/dates";
import { DayEntry, Schedule, TaskEntry } from "../../../restapi/types";
import Krm3Modal from "../../commons/krm3Modal";
import Krm3Button from "../../commons/Krm3Button";
import WarningExistingEntry from "../edit-entry/WarningExistEntry";
import { TrashIcon } from "lucide-react";
import { useGetCurrentUser } from "../../../hooks/useAuth";

interface ShortHoursMenuProps {
  dayToOpen: Date;
  taskId: number;
  openShortMenu?: {
    startDate: string;
    endDate: string;
    taskId: string;
  } | null;
  readOnly: boolean;
  selectedResourceId: number | null;
  setOpenShortMenu?: (
    value: { startDate: string; endDate: string; taskId: string } | undefined
  ) => void;
  openTaskEntryModal: () => void;
  taskEntries: TaskEntry[];
  dayEntries: DayEntry[];
  schedule: Schedule;
}

interface HourOption {
  readonly label: string;
  readonly value: number;
}

const QUICK_HOUR_OPTIONS: readonly HourOption[] = [
  { label: "2h", value: 2 },
  { label: "4h", value: 4 },
  { label: "8h", value: 8 },
] as const;

const ACTION_OPTIONS: readonly HourOption[] = [
  { label: "Autofill", value: -1 },
  { label: "More", value: 0 },
  { label: "Delete", value: 0 },
] as const;

const READ_ONLY_OPTIONS: readonly HourOption[] = [{ label: "Details", value: 0 }] as const;

export const ShortHoursMenu = React.memo<ShortHoursMenuProps>((props) => {
  const {
    dayToOpen: day,
    taskId,
    openShortMenu,
    readOnly,
    selectedResourceId,
    setOpenShortMenu,
    openTaskEntryModal,
    taskEntries = [],
    dayEntries = [],
    schedule,
  } = props;

  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState<{
    label: string;
    value: number;
  } | null>(null);
  const [hoursInput, setHoursInput] = useState<string>("");
  const [hoursError, setHoursError] = useState<string>("");
  const menuRef = useRef<HTMLDivElement>(null);
  const { data: currentUser } = useGetCurrentUser();
  const resourceId = selectedResourceId || currentUser?.resource.id;
  const { mutateAsync: createTaskEntries, error } = useCreateTaskEntry(selectedResourceId);

  const menuData = useMemo(() => {
    if (!openShortMenu) {
      return null;
    }

    const startDate = formatDate(openShortMenu.startDate);
    const endDate = formatDate(openShortMenu.endDate);

    const isMultiDaySelection = normalizeDate(startDate) !== normalizeDate(endDate);

    const isVisible =
      normalizeDate(openShortMenu.endDate) === normalizeDate(day) &&
      Number(openShortMenu.taskId) === taskId;
    const dayEntryByDate = new Map(dayEntries.map((entry) => [normalizeDate(entry.day), entry]));
    const taskEntryDates = new Set(
      taskEntries
        .map((entry) => dayEntries.find((dayEntry) => dayEntry.id === entry.dayEntry)?.day)
        .filter((entryDay): entryDay is string => Boolean(entryDay))
        .map(normalizeDate)
    );

    const allDates = getDateRange(startDate, endDate)
      .map(normalizeDate)
      .filter((date) => {
        const dayEntry = dayEntryByDate.get(date);

        const scheduledHours = schedule[date] ?? schedule[date.replaceAll("-", "_")] ?? 0;

        if (isMultiDaySelection && Number(scheduledHours) === 0) {
          return false;
        }

        return (
          !dayEntry?.closed && !dayEntry?.askedHoliday && !dayEntry?.isHoliday && !dayEntry?.isSick
        );
      });

    const daysWithTaskEntries = allDates.filter((date) => taskEntryDates.has(date));
    const datesWithoutTaskEntries = allDates.filter((date) => !taskEntryDates.has(date));

    return {
      startDate,
      endDate,
      isVisible,
      daysWithTaskEntries,
      datesWithoutTaskEntries,
      selectedDates: allDates,
    };
  }, [openShortMenu, day, taskId, taskEntries, dayEntries, schedule]);

  const isDateAutofillable = useCallback(
    (date: string) => {
      const dayEntry = dayEntries.find((entry) => normalizeDate(entry.day) === normalizeDate(date));
      const loggedHours = dayEntry
        ? (Number(dayEntry.dayHours) || 0) +
          (Number(dayEntry.nightHours) || 0) +
          (Number(dayEntry.leaveHours) || 0) +
          (Number(dayEntry.specialLeaveHours) || 0) +
          (Number(dayEntry.restHours) || 0) +
          (Number(dayEntry.travelHours) || 0) -
          (Number(dayEntry.bank) || 0)
        : 0;

      const scheduleKey = normalizeDate(date).replaceAll("-", "_");
      return (schedule[scheduleKey] ?? 0) > loggedHours;
    },
    [dayEntries, schedule]
  );

  const getEntriesInSelectedPeriod = useCallback(() => {
    if (!openShortMenu) return [];

    const selectedDates = new Set(
      getDateRange(openShortMenu.startDate, openShortMenu.endDate).map(normalizeDate)
    );
    const dayEntryIds = new Set(
      dayEntries
        .filter((entry) => selectedDates.has(normalizeDate(entry.day)))
        .map((entry) => entry.id)
    );

    return taskEntries.filter(
      (entry) => entry.task === Number(openShortMenu.taskId) && dayEntryIds.has(entry.dayEntry)
    );
  }, [dayEntries, openShortMenu, taskEntries]);

  const submitHours = useCallback(
    async (value: number, selectedDates?: string[]) => {
      if (resourceId === undefined) {
        throw new Error("Resource ID is undefined");
      }
      if (!menuData) {
        toast.error("Invalid configuration");
        return;
      }
      if (selectedDates?.length === 0) {
        toast.warning("All selected dates already have entries. You can only overwrite it.");
        return;
      }

      const datesToSave = selectedDates ?? menuData.selectedDates;
      const promise = createTaskEntries({
        dates: datesToSave,
        taskId,
        dayShiftHours: value,
      });

      await toast.promise(
        promise,
        {
          pending: "Adding hours...",
          success: "Hours added successfully",
          error: {
            render({ data }) {
              // When the promise reject, data will contains the error
              return <div> {displayErrorMessage(data)} </div>;
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
      setOpenShortMenu?.(undefined);
    },
    [menuData, resourceId, createTaskEntries, taskId, error, setOpenShortMenu]
  );

  const { mutateAsync: deleteTaskEntries, error: deletionError } = useDeleteTaskEntries();

  const deleteHours = useCallback(
    async (taskEntryIdsToDelete: number[]) => {
      if (!menuData) {
        toast.error("Invalid configuration");
        return;
      }
      const promise = deleteTaskEntries(taskEntryIdsToDelete);

      await toast.promise(
        promise,
        {
          pending: "Deleting hours...",
          success: "Hours deleted successfuly",
          error: {
            render({ data }) {
              return <div>{displayErrorMessage(data)} </div>;
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
    },
    [menuData, selectedResourceId, deleteTaskEntries, taskId, deletionError, setOpenShortMenu]
  );

  const handleFillHours = useCallback(
    async (selectedDates?: string[]) => {
      if (!menuData) {
        toast.error("Invalid configuration");
        return;
      }

      const datesToProcess = selectedDates || menuData.selectedDates;

      const autofillDates = datesToProcess.filter(isDateAutofillable);

      if (autofillDates.length === 0) {
        toast.error("No dates in the selected range require autofilling.");
        return;
      }

      if (resourceId === undefined) {
        throw new Error("Resource ID is undefined");
      }

      const autofillTaskEntriesPromise = createTaskEntries({
        dates: autofillDates,
        taskId,
        autofill: true,
        // We are setting dayShiftHours to 0 here because the backend requires a value for dayShiftHours when creating task entries, even if it's an autofill operation. The actual hours will be determined by the backend logic based on the schedule and existing entries.
        dayShiftHours: 0,
      });

      await toast.promise(autofillTaskEntriesPromise, {
        pending: "Filling hours...",
        success: "Hours filled successfully",
        error: {
          render({ data }) {
            return <div> {displayErrorMessage(data)} </div>;
          },
        },
      });

      setOpenShortMenu?.(undefined);
    },
    [menuData, resourceId, taskId, createTaskEntries, setOpenShortMenu, isDateAutofillable]
  );

  const handleButtonClick = useCallback(
    (label: string, value: number) => {
      if (label === "More") {
        openTaskEntryModal();
        setOpenShortMenu?.(undefined);
        return;
      } else if (label === "Delete") {
        if (openShortMenu) {
          const taskEntriesToDelete = getEntriesInSelectedPeriod();
          deleteHours(taskEntriesToDelete.map((taskEntry) => taskEntry.id));
          setOpenShortMenu?.(undefined);
        }
        return;
      } else if (label === "Autofill") {
        handleFillHours();
        return;
      }

      const hasExistingEntries =
        menuData?.daysWithTaskEntries && menuData.daysWithTaskEntries.length > 0;

      if (hasExistingEntries) {
        setPendingSubmission({ label, value });
        setOpenConfirmModal(true);
      } else {
        submitHours(value);
      }
    },
    [
      menuData?.daysWithTaskEntries,
      openTaskEntryModal,
      setOpenShortMenu,
      submitHours,
      handleFillHours,
      openShortMenu,
      taskEntries,
      deleteHours,
      getEntriesInSelectedPeriod,
    ]
  );

  const handleHoursInputSubmit = useCallback(() => {
    const parsed = Number.parseFloat(hoursInput);
    if (Number.isNaN(parsed) || parsed < 0.5 || parsed > 8 || parsed % 0.5 !== 0) {
      setHoursError("Enter a value from 0.5 to 8 in 0.5 increments");
      return;
    }
    setHoursError("");
    handleButtonClick(`${parsed}h`, parsed);
  }, [hoursInput, handleButtonClick]);

  const handleConfirmSubmission = useCallback(
    (overwrite: boolean) => {
      if (!menuData) {
        return;
      }
      if (pendingSubmission) {
        if (overwrite) {
          submitHours(pendingSubmission.value, menuData.selectedDates);
        } else {
          submitHours(pendingSubmission.value, menuData.datesWithoutTaskEntries);
          setOpenConfirmModal(false);
          setOpenShortMenu?.(undefined);
        }
      }

      handleCloseConfirmModal();
    },
    [pendingSubmission, submitHours, setOpenShortMenu]
  );

  const handleCloseConfirmModal = useCallback(() => {
    setPendingSubmission(null);
    setOpenConfirmModal(false);
    setOpenShortMenu?.(undefined);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!openConfirmModal) {
      setOpenShortMenu?.(undefined);
    }
  }, [openConfirmModal, setOpenShortMenu]);

  if (!menuData?.isVisible) {
    return null;
  }

  const isDeleteButtonVisible = () => {
    if (openShortMenu == null) return false;
    return getEntriesInSelectedPeriod().length > 0;
  };

  const isAutofillButtonVisible = () => {
    if (openShortMenu == null || !menuData) return false;

    return menuData.selectedDates.some(isDateAutofillable);
  };

  return (
    <div className="relative" ref={menuRef}>
      <div
        onMouseLeave={handleMouseLeave}
        className="absolute z-50 right-0 mt-2 w-64 origin-top-right bg-card rounded-2xl shadow-2xl border border-app overflow-hidden animate-in slide-in-from-top-2 duration-200"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="options-menu"
      >
        <div>
          {readOnly ? (
            READ_ONLY_OPTIONS.map((option) => (
              <button
                key={`menu-option-${option.label}-${option.value}`}
                onClick={() => handleButtonClick(option.label, option.value)}
                className="block w-full px-4 py-2 cursor-pointer text-center text-m text-app hover:bg-card-dim hover:text-app focus:bg-app focus:text-app focus:outline-none"
                role="menuitem"
                type="button"
                id={`short-menu-${option.label.toLowerCase()}-button`}
                data-testid={`short-menu-${option.label.toLowerCase()}-button`}
              >
                {option.label}
              </button>
            ))
          ) : (
            <>
              {/* 1. Quick hour buttons */}
              <div className="flex flex-col">
                {QUICK_HOUR_OPTIONS.map((option) => (
                  <button
                    key={`quick-${option.label}`}
                    type="button"
                    onClick={() => handleButtonClick(option.label, option.value)}
                    className="w-full py-2 text-sm text-app hover:bg-card-dim hover:text-app hover:cursor-pointer focus:outline-none"
                    data-testid={`short-menu-${option.label.toLowerCase()}-button`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {/* 2. Custom hours input */}
              <div className="px-4 pt-2 pb-2 hover:bg-card-dim">
                <div className="flex items-center justify-center gap-2">
                  <input
                    type="number"
                    min={0.5}
                    max={8}
                    step={0.5}
                    value={hoursInput}
                    onChange={(e) => {
                      setHoursInput(e.target.value);
                      setHoursError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleHoursInputSubmit()}
                    placeholder="e.g. 2.5"
                    className="w-20 border border-app rounded-lg px-1 py-1 text-sm text-center bg-card text-app focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleHoursInputSubmit}
                    className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 hover:cursor-pointer text-white text-sm font-medium"
                  >
                    Add
                  </button>
                </div>
                {hoursError && (
                  <p className="text-xs text-red-500 mt-1 text-center">{hoursError}</p>
                )}
              </div>

              {/* 3. Autofill, More, Delete */}
              {ACTION_OPTIONS.map((option) => {
                if (option.label === "Delete" && !isDeleteButtonVisible()) return null;
                if (option.label === "Autofill" && !isAutofillButtonVisible()) return null;
                return (
                  <button
                    key={`menu-option-${option.label}-${option.value}`}
                    onClick={() => handleButtonClick(option.label, option.value)}
                    className={`block w-full px-4 py-2 cursor-pointer text-center text-m text-app hover:bg-card-dim hover:cursor-pointer hover:text-app focus:bg-app focus:text-app focus:outline-none
                    ${option.label === "Delete" ? "bg-red-600 hover:bg-red-800" : ""}`}
                    role="menuitem"
                    type="button"
                    id={`short-menu-${option.label.toLowerCase()}-button`}
                    data-testid={`short-menu-${option.label.toLowerCase()}-button`}
                  >
                    {option.label === "Delete" ? (
                      <TrashIcon className="mx-auto text-white" />
                    ) : (
                      option.label
                    )}
                  </button>
                );
              })}
            </>
          )}
        </div>

        <div className="px-4 py-2 bg-card rounded-b-md">
          <p className="text-xs text-app text-center cursor-default">
            {normalizeDate(menuData.startDate)} to {normalizeDate(menuData.endDate)}
          </p>
        </div>
      </div>

      {openConfirmModal && (
        <Krm3Modal
          open={true}
          onClose={handleCloseConfirmModal}
          width="30rem"
          title="Overwrite existing entries?"
        >
          <div className="text-sm">
            <p>
              Selected days from <strong>{normalizeDate(menuData?.startDate)}</strong> to{" "}
              <strong>{normalizeDate(menuData?.endDate)}</strong>
            </p>
            <p className="my-2">
              Do you want to proceed with adding <strong>{pendingSubmission?.label}</strong> to all
              selected dates?
            </p>

            <WarningExistingEntry
              style="my-5"
              daysWithEntries={menuData.daysWithTaskEntries}
              entryLabel="Task entries"
              message="Holiday, Sick days and N/A entries will be skipped automatically."
              isCheckbox={false}
              overrideEntries={false}
            />
            <div className="flex justify-between mt-2">
              <Krm3Button
                label="No, Don't Overwrite"
                onClick={() => handleConfirmSubmission(false)}
                style="secondary"
                disabled={menuData.datesWithoutTaskEntries.length === 0}
                disabledTooltipMessage="No empty Days, you can only overwrite existing entries"
              />
              <Krm3Button label="Yes, Overwrite" onClick={() => handleConfirmSubmission(true)} />
            </div>
          </div>
        </Krm3Modal>
      )}
    </div>
  );
});
