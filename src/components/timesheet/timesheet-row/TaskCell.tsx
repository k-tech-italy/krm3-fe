import React from "react";
import { Task } from "../../../restapi/types";

export interface TaskHeaderProps {
    task: Task;
    isMonthView: boolean;
    backgroundColor: string;
  }
  
export const TaskHeader: React.FC<TaskHeaderProps> = ({ 
  task, 
  isMonthView, 
  backgroundColor 
}) => (
  <div
    style={{
      backgroundColor: backgroundColor,
      border: "solid 1px",
      borderColor: backgroundColor,
    }}
    className={`p-2 ${isMonthView ? "py-1" : ""} border-1 border-gray-300 relative group`}
  >
    <div className={`${isMonthView ? "text-xs font-medium truncate" : ""}`}>
      {task.title}
    </div>
    <div className={`text-xs ${isMonthView ? "hidden" : "text-gray-500"}`}>
      {task.projectName}
    </div>
    <div
      className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-white border-1 border-gray-300 text-xs  px-2 py-1 z-10`}
    >
      {task.title} - {task.projectName}
    </div>
  </div>
);