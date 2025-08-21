import React from "react";
import { Plus } from "lucide-react";

export interface EmptyCellProps {
  day: Date;
  taskId: number;
  isMonthView: boolean;
  isDayLocked?: boolean;
}

export const EmptyCell: React.FC<EmptyCellProps> = ({
  day,
  taskId,
  isMonthView,
  isDayLocked,
}) => {
  return (
    <div className="flex justify-center text-app hover:text-app">
      <Plus size={16} strokeWidth={3}/>
    </div>
  );
};
