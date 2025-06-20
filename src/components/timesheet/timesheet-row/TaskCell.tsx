import React from "react";
import { Task, TimeEntry } from "../../../restapi/types";

export interface TaskHeaderProps {
  task: Task;
  isMonthView: boolean;
}

export const TaskHeader: React.FC<TaskHeaderProps> = ({
  task,
  isMonthView,
}) => {
  return (
    <div
      className={`p-2 ${
        isMonthView ? "text-sm" : ""
      } flex justify-between items-center`}
    >
      <div className={`${isMonthView ? "font-medium truncate" : ""}`}>
        {task.title}
      </div>
      <div className={`text-xs text-gray-500`}>{task.projectName}</div>
    </div>
  );
};
