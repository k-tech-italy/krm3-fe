import { toast } from "react-toastify";
import { useCreateTimeEntry } from "../../../hooks/useTimesheet";
import { displayErrorMessage } from "../utils/utils";
import { formatDate, getDatesBetween, normalizeDate } from "../utils/dates";
import { useMemo, useState } from "react";

export const ShortHoursMenu = (props: {
  day: Date;
  taskId: number;
  openShortMenu?: { startDate: string; endDate: string; taskId: string };
  readOnly: boolean;
  selectedResourceId: number | null;
  setOpenShortMenu?: (
    value: { startDate: string; endDate: string; taskId: string } | undefined
  ) => void;
  openTimeEntryModalHandler: () => void;
}) => {
  const isTooltipVisible =
    !!props.openShortMenu &&
    normalizeDate(props.openShortMenu.endDate) === normalizeDate(props.day) &&
    Number(props.openShortMenu.taskId) === props.taskId;
  const { mutateAsync: createTimeEntries, error } = useCreateTimeEntry(props.selectedResourceId);
  const selectedDates = getDatesBetween(
    formatDate(props.openShortMenu?.startDate || ''),
    formatDate(props.openShortMenu?.endDate || ''),
  );
  const [isMenuRight, setIsMenuRight] = useState(true);

  const options = useMemo(() => {
    if (props.readOnly) {
      return [{ label: "Details", value: 0 }];
    }
    return [
      { label: "2h", value: 2 },
      { label: "4h", value: 4 },
      { label: "8h", value: 8 },
      { label: "More", value: 0 },
    ];
  }, [props.readOnly]);

  function handleButtonClick(label: string, value: number) {
    if (value === 0) {
      props.openTimeEntryModalHandler();
    } else {
      toast.promise(
        createTimeEntries({
          dates: selectedDates,
          taskId: props.taskId,
          dayShiftHours: value,
        }).then(() => {
          props.setOpenShortMenu?.(undefined);
        }),
        {
          pending: "Adding hours...",
          success: "Hours added successfully",
          error:
            (displayErrorMessage(error)),
        },
        {
          autoClose: 2000,
          theme: "light",
          hideProgressBar: false,
          draggable: true,
        }
      );
    }
    props.setOpenShortMenu?.(undefined);
  }
  return (
    <div
      onMouseLeave={() => props.setOpenShortMenu?.(undefined)}
      className={`absolute z-50 ${isMenuRight ? "right-0" : "left-0"
        } mt-2 w-56 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow focus:outline-none transition-all duration-200 ease-out transform ${isTooltipVisible
          ? "opacity-100 scale-100"
          : "opacity-0 scale-95 pointer-events-none"
        }`}
    >
      {isTooltipVisible && (
        <div className="flex flex-col gap-2">
          {options.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => handleButtonClick(label, value)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
