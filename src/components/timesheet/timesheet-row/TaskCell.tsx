import React from "react";
import { Task, TimeEntry } from "../../../restapi/types";

export interface TaskHeaderProps {
  task: Task;
  isMonthView: boolean;
  colors: { backgroundColor: string; borderColor: string };
  isColumnView: boolean;
}

export const TaskHeader: React.FC<TaskHeaderProps> = ({
  task,
  isMonthView,
  colors,
  isColumnView,
}) => {
  return (
    <div
      style={
        {
          "--border-color": colors.borderColor,
          backgroundColor: colors.backgroundColor,
          borderLeft: isColumnView
            ? "3px solid var(--border-color)"
            : undefined,
          borderBottom: !isColumnView
            ? "3px solid var(--border-color)"
            : undefined,
        } as React.CSSProperties
      }
      className={`p-2 flex justify-between items-center ${
        isMonthView ? "text-sm" : ""
      } ${isColumnView ? "border-l-3" : "border-b-3"}
      `}
    >
      <div className={`${isMonthView ? "font-medium truncate" : ""}`}>
        {task.title}
      </div>
      <div className={`text-xs text-gray-500`}>{task.projectName}</div>
    </div>
  );
};
