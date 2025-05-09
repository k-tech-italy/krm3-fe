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
  backgroundColor,
}) => {
  const cellId = `${day.toDateString()}-${taskId}`;

  // Define cell styling based on type
  const getCellStyles = () => {
    switch (type) {
      case "holiday":
        return {
          id: `holiday-cell-${cellId}`,
          gradientClasses: "bg-gradient-to-r from-cyan-100 to-blue-300",
          icon: <Martini color="white" size={isMonthView ? 12 : 16} />,
        };
      case "sick":
        return {
          id: `sick-day-cell-${cellId}`,
          gradientClasses: "bg-gradient-to-r from-red-100 to-red-300",
          icon: <Stethoscope color="white" size={isMonthView ? 12 : 16} />,
        };
      case "finished":
        return {
          id: `task-finished-cell-${cellId}`,
          gradientClasses: "bg-gradient-to-r from-gray-100 to-gray-300",
          icon: <span className="text-xs text-gray-400">N/A</span>,
        };
      default:
        return {};
    }
  };

  const { id, gradientClasses, icon } = getCellStyles();

  return (
    <div
      id={id}
      style={{
        borderBottom: "solid 3px",
        borderBottomColor: backgroundColor,
      }}
      className={`border-1 border-gray-300 h-full w-full ${
        isColumnHighlighted ? "bg-blue-50 border-blue-300" : ""
      }`}
    >
      <div
        className={`${gradientClasses}  h-full flex justify-center items-center`}
      >
        {icon}
      </div>
    </div>
  );
};
