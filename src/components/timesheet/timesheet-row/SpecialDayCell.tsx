import React from "react";
import { Martini, Stethoscope } from "lucide-react";
import { CellProps } from "./TimeEntryCell";

export interface SpecialDayCellProps extends CellProps {
  type: "holiday" | "sick" | "finished";
}
export const SpecialDayCell: React.FC<SpecialDayCellProps> = ({
  day,
  taskId,
  type,
  isMonthView,
  isColumnHighlighted,
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
        };
      case "finished":
        return {
          id: `task-finished-cell-${cellId}`,
          icon: <span className="text-xs text-gray-600">N/A</span>,
        };
      default:
        return {};
    }
  };

  const { id, icon } = getCellStyles();

  return (
    <div
      id={id}
      style={{ backgroundColor: colors.backgroundColor }}
      className={`h-full w-full text-center flex items-center justify-center cursor-not-allowed `}
    >
      <div
        className={` h-full flex justify-center items-center`}
      >
        {icon}
      </div>
    </div>
  );
};
