import React from "react";
import { Martini, Stethoscope, Lock } from "lucide-react";
import { Tooltip } from "react-tooltip";
import { DayType, TimeEntryType } from "../../../restapi/types";

interface Props {
  day: Date;
  taskId: number;
  isMonthView: boolean;
  colors: {
    backgroundColor: string;
    borderColor: string;
  };
  type: TimeEntryType;
}

export const SpecialDayCell: React.FC<Props> = ({
  day,
  taskId,
  type,
  isMonthView,
  colors,
}) => {
  const cellId = `${day.toDateString()}-${taskId}`;

  // Define cell styling based on type
  const getCellStyles = () => {
    switch (type) {
      case "holiday":
        return {
          id: `holiday-cell-${cellId}`,
          icon: (
            <Martini
              strokeWidth={2.25}
              color="black"
              size={isMonthView ? 12 : 20}
            />
          ),
          style: { backgroundColor: colors.backgroundColor },
        };
      case "sick":
        return {
          id: `sick-day-cell-${cellId}`,
          icon: (
            <Stethoscope
              strokeWidth={2.25}
              color="black"
              size={isMonthView ? 12 : 20}
            />
          ),
          style: { backgroundColor: colors.backgroundColor },
        };
      case "finished":
        return {
          id: `task-finished-cell-${cellId}`,
          icon: <span className="text-xs text-gray-600">N/A</span>,
          style: { backgroundColor: "#e5e7eb" },
        };
      default:
        return {};
    }
  };

  const { id, icon, style } = getCellStyles();

  return (
    <div
      id={id}
      style={style}
      className={`h-full w-full text-center flex items-center justify-center cursor-not-allowed`}
    >
      <div className={` h-full flex justify-center items-center`}>
        {icon}
      </div>
    </div>
  );
};
