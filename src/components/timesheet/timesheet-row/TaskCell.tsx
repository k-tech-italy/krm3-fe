import React from "react";
import { Task } from "../../../restapi/types";

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
          className={`p-2 flex flex-col justify-between  ${
              isMonthView ? "text-sm" : ""
          } ${isColumnView ? "border-l-3 items-center" : "border-b-3 items-start"}
      `}
      >
          <div className={`${isMonthView ? "font-medium truncate" : ""}`}>
              {task.projectName}
          </div>
          <div className={`text-xs text-gray-500`}>
              {task.clientName}
          </div>
          <div className={`text-xs text-gray-500`}>{task.title}</div>

      </div>
  );
};
