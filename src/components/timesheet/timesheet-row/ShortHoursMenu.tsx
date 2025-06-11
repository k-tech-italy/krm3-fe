import React, {
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { toast } from "react-toastify";
import { useCreateTimeEntry } from "../../../hooks/useTimesheet";
import { displayErrorMessage } from "../utils/utils";
import { formatDate, getDatesBetween, normalizeDate } from "../utils/dates";
import { TimeEntry } from "../../../restapi/types";
import { getDatesWithTimeEntries } from "../utils/timeEntry";
import Krm3Modal from "../../commons/krm3Modal";
import Krm3Button from "../../commons/Krm3Button";
import WarningExistingEntry from "../edit-entry/WarningExistEntry";

interface ShortHoursMenuProps {
  day: Date;
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
  openTimeEntryModalHandler: () => void;
  timeEntries: TimeEntry[];
}

interface HourOption {
  readonly label: string;
  readonly value: number;
}

const HOUR_OPTIONS: readonly HourOption[] = [
  { label: "2h", value: 2 },
  { label: "4h", value: 4 },
  { label: "8h", value: 8 },
  { label: "More", value: 0 },
] as const;

const READ_ONLY_OPTIONS: readonly HourOption[] = [
  { label: "Details", value: 0 },
] as const;

export const ShortHoursMenu = React.memo<ShortHoursMenuProps>((props) => {
  const {
    day,
    taskId,
    openShortMenu,
    readOnly,
    selectedResourceId,
    setOpenShortMenu,
    openTimeEntryModalHandler,
    timeEntries,
  } = props;

  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState<{
    label: string;
    value: number;
  } | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const { mutateAsync: createTimeEntries, error } =
    useCreateTimeEntry(selectedResourceId);

  const menuData = useMemo(() => {
    if (!openShortMenu) {
      return null;
    }

    const startDate = formatDate(openShortMenu.startDate);
    const endDate = formatDate(openShortMenu.endDate);
    const isVisible =
      normalizeDate(openShortMenu.endDate) === normalizeDate(day) &&
      Number(openShortMenu.taskId) === taskId;

    const daysWithTimeEntries = getDatesWithTimeEntries(
      startDate,
      endDate,
      timeEntries,
      true
    );

    const datesWithNoTimeEntries = getDatesBetween(startDate, endDate).filter(
      (date) => !daysWithTimeEntries.includes(normalizeDate(date))
    );

    return {
      startDate,
      endDate,
      isVisible,
      daysWithTimeEntries,
      datesWithNoTimeEntries,
      selectedDates: getDatesBetween(startDate, endDate),
    };
  }, [openShortMenu, day, taskId, timeEntries]);

  const options = useMemo(() => {
    return readOnly ? READ_ONLY_OPTIONS : HOUR_OPTIONS;
  }, [readOnly]);

  const submitHours = useCallback(
    async (value: number, selectedDates?: string[]) => {
      if (!menuData || !selectedResourceId) {
        toast.error("Invalid configuration");
        return;
      }
      if (selectedDates && selectedDates.length === 0) {
        toast.warning(
          "All selected dates already have entries. You can only overwrite it."
        );
        return;
      }
      try {
        const promise = createTimeEntries({
          dates: selectedDates ? selectedDates : menuData.selectedDates,
          taskId,
          dayShiftHours: value,
        });

        await toast.promise(
          promise,
          {
            pending: "Adding hours...",
            success: "Hours added successfully",
            error: displayErrorMessage(error),
          },
          {
            autoClose: 2000,
            theme: "light",
            hideProgressBar: false,
            draggable: true,
          }
        );

        setOpenShortMenu?.(undefined);
      } catch (err) {
        console.error("Failed to submit hours:", err);
        toast.error("Failed to add hours");
      }
    },
    [
      menuData,
      selectedResourceId,
      createTimeEntries,
      taskId,
      error,
      setOpenShortMenu,
    ]
  );

  const handleButtonClick = useCallback(
    (label: string, value: number) => {
      if (value === 0) {
        openTimeEntryModalHandler();
        setOpenShortMenu?.(undefined);
        return;
      }

      const hasExistingEntries =
        menuData?.daysWithTimeEntries &&
        menuData.daysWithTimeEntries.length > 0;

      if (hasExistingEntries) {
        setPendingSubmission({ label, value });
        setOpenConfirmModal(true);
      } else {
        submitHours(value);
      }
    },
    [
      menuData?.daysWithTimeEntries,
      openTimeEntryModalHandler,
      setOpenShortMenu,
      submitHours,
    ]
  );

  const handleConfirmSubmission = useCallback(
    (overwrite: boolean) => {
      if (!menuData) {
        return;
      }
      if (pendingSubmission) {
        if (overwrite) {
          submitHours(pendingSubmission.value);
        } else {
          submitHours(pendingSubmission.value, menuData.datesWithNoTimeEntries);
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

  if (!menuData || !menuData.isVisible) {
    return null;
  }

  return (
    <div className="relative" ref={menuRef}>
      <div
        onMouseLeave={handleMouseLeave}
        className="absolute z-50 right-0 mt-2 w-64 origin-top-right bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-top-2 duration-200"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="options-menu"
      >
        <div>
          {options.map((option, index) => (
            <button
              key={`menu-option-${index}-${option.label}-${option.value}`}
              onClick={() => handleButtonClick(option.label, option.value)}
              className="block w-full px-4 py-2 cursor-pointer text-center text-m text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none"
              role="menuitem"
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="px-4 py-2 bg-gray-50 rounded-b-md">
          <p className="text-xs text-gray-500 text-center">
            {normalizeDate(menuData.startDate)} to{" "}
            {normalizeDate(menuData.endDate)}
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
              Selected days from{" "}
              <strong>{normalizeDate(menuData?.startDate)}</strong> to{" "}
              <strong>{normalizeDate(menuData?.endDate)}</strong>
            </p>
            <p className="my-2">
              Do you want to proceed with adding{" "}
              <strong>{pendingSubmission?.label}</strong> to all selected dates?
            </p>

            <WarningExistingEntry
              style="my-5"
              daysWithTimeEntries={menuData.daysWithTimeEntries}
              isCheckbox={false}
              keepEntries={false}
            />
            <div className="flex justify-between mt-2">
              <Krm3Button
                label="No, Don't Overwrite"
                onClick={() => handleConfirmSubmission(false)}
                style="secondary"
                disabled={menuData.datesWithNoTimeEntries.length === 0}
                disabledTooltipMessage="No empty Days, you can only overwrite existing entries"
              />
              <Krm3Button
                label="Yes, Overwrite"
                onClick={() => handleConfirmSubmission(true)}
              />
            </div>
          </div>
        </Krm3Modal>
      )}
    </div>
  );
});
