import React, {useEffect, useRef, useState} from "react";
import { Task } from "../../../restapi/types";
import {Tooltip} from "react-tooltip";

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
    const projectRef = useRef<HTMLDivElement>(null);
    const clientRef = useRef<HTMLDivElement>(null);
    const taskRef = useRef<HTMLDivElement>(null);

    const [showTooltip, setShowTooltip] = useState(false);

    const isTruncated = (el: HTMLElement | null) => {
        if (!el) return false;
        return el.scrollWidth > el.clientWidth;
    };

    useEffect(() => {
        const truncated =
            isTruncated(projectRef.current) ||
            isTruncated(clientRef.current) ||
            isTruncated(taskRef.current);

        setShowTooltip(truncated);
    }, [task]);

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
          data-tooltip-id={`task-${task.id}-tooltip`}

      >
          <div ref={projectRef}
              className={`font-medium text-sm truncate max-w-full`}>
              {task.projectName}
          </div>
          <div ref={clientRef}
              className={`text-xs text-gray-app truncate max-w-full`}>
              {task.clientName}
          </div>
          <div ref={taskRef}
              className={`text-xs text-gray-app truncate max-w-full`}>
              {task.adminUrl ? (
                  <a href={task.adminUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {task.title}
                  </a>
              ) : (
                  task.title
              )}
          </div>
          {showTooltip && (
              <Tooltip id={`task-${task.id}-tooltip`} style={{ zIndex: 9999 }}>
                  <div className="flex flex-col">
                      <p>{task.projectName}</p>
                      <p>{task.clientName}</p>
                      <p>{task.title}</p>
                  </div>
              </Tooltip>
          )}
      </div>
  );
};
