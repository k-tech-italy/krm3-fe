import { render, screen } from "@testing-library/react";
import { TaskEntry } from "../../../restapi/types";
import { TaskEntryItem } from "./TaskEntryItem";

describe("TaskEntryItem", () => {
  const entry: TaskEntry = {
    id: 1,
    task: 1,
    taskTitle: null,
    dayEntry: 1,
    dayShiftHours: 2,
    nightShiftHours: 1,
    onCallHours: 0,
    travelHours: 0,
    comment: null,
    metadata: {},
  };

  it("renders with isMonthView false", () => {
    render(
      <TaskEntryItem
        entry={entry}
        taskId={1}
        isMonthView={false}
        backgroundColor="#fff"
        isDayLocked={false}
      />
    );
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders with isMonthView true", () => {
    render(
      <TaskEntryItem
        entry={entry}
        taskId={1}
        isMonthView={true}
        backgroundColor="#fff"
        isDayLocked={false}
      />
    );
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
