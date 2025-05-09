import React from "react";
import { Draggable } from "../Draggable";

export interface EmptyCellProps {
    day: Date;
    taskId: number;
    isMonthView: boolean;
  }
  
export const EmptyCell: React.FC<EmptyCellProps> = ({
  day,
  taskId,
  isMonthView,
}) => {
  const emptyCellId = `${day.toDateString()}-${taskId}-empty`;

  return (
    <Draggable className="h-full w-full" id={emptyCellId}>
      <div className="flex justify-center">
        <span className="text-gray-400 text-xs">+</span>
      </div>
    </Draggable>
  );
};
