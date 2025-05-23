import { toast } from "react-toastify";
import { useCreateTimeEntry } from "../../../hooks/timesheet";
import { displayErrorMessage, normalizeDate } from "../utils/utils";
import { useRef, useState, useEffect } from "react";

export const ShortHoursMenu = (props: {
  day: Date;
  taskId: number;
  openShortMenu?: { selectedCells: Date[]; day: string; taskId: string };
  setOpenShortMenu?: (
    value: { selectedCells: Date[]; day: string; taskId: string } | undefined
  ) => void;
  openTimeEntryModalHandler: () => void;
}) => {
  const isTooltipVisible =
    !!props.openShortMenu &&
    normalizeDate(props.openShortMenu.day) === normalizeDate(props.day) &&
    Number(props.openShortMenu.taskId) === props.taskId;
  const { mutateAsync: createTimeEntries, error } = useCreateTimeEntry();

  const selectedCells = (props.openShortMenu?.selectedCells || []).map((date) =>
    normalizeDate(date)
  );
  const [isMenuRight, setIsMenuRight] = useState(true);

  const options = [
    { label: "2h", value: 2 },
    { label: "4h", value: 4 },
    { label: "8h", value: 8 },
    { label: "More", value: 0 },
  ];

  function handleButtonClick(label: string, value: number) {
    if (label === "More") {
      props.openTimeEntryModalHandler();
    } else {
      toast.promise(
        createTimeEntries({
          dates: selectedCells,
          taskId: props.taskId,
          dayShiftHours: value,
        }).then(() => {
          props.setOpenShortMenu?.(undefined);
        }),
        {
          pending: "Adding hours...",
          success: "Hours added successfully",
          error:
            (!!error && displayErrorMessage(error)) || "Error adding hours",
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
      className={`absolute z-50 ${
        isMenuRight ? "right-0" : "left-0"
      } mt-2 w-56 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow focus:outline-none transition-all duration-200 ease-out transform ${
        isTooltipVisible
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
