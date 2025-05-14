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
  // const getTotalHours = (timeEntries: TimeEntry[] | undefined) => {
  //   if (!timeEntries) return 0;
  //   return timeEntries.reduce((acc, timeEntry) => {
  //     return (
  //       acc +
  //       (Number(timeEntry.workHours) || 0) +
  //       (Number(timeEntry.overtimeHours) || 0) +
  //       (Number(timeEntry.onCallHours) || 0) +
  //       (Number(timeEntry.leaveHours) || 0)
  //     );
  //   }, 0);
  // };

  const getTotalHours = () => {
    return 0;
  };

  return (
    <div
      className={`p-2 ${isMonthView ? "text-sm" : ""} flex justify-between items-center`}
    >
      <div className={`${isMonthView ? "font-medium truncate" : ""}`}>
        {task.title}
      </div>
      <div className={`text-xs ${isMonthView ? "hidden" : "text-gray-500"}`}>
        {task.projectName}
      </div>
    </div>
  );
};
