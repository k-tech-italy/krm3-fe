import React from "react";
import { Draggable } from "../Draggable";
import { Plus } from "lucide-react";

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
    <Draggable className="h-full w-full items-center flex  justify-center" id={emptyCellId}>
      <div className="flex  justify-center text-gray-400 hover:text-gray-600">
        <Plus size={16} />
      </div>
    </Draggable>
  );
};
