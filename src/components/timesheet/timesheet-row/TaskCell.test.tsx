import { render, screen } from "@testing-library/react";
import { TaskHeader } from "./TaskCell";
import React from "react";

describe("TaskHeader", () => {
  const baseTask = {
    id: 1,
    title: "Task 1",
    projectName: "Project A",
    startDate: new Date(),
    color: "#fff",
  };
  const colors = { backgroundColor: "#fff", borderColor: "#000" };

  it.each([
    [false, false],
    [true, false],
    [false, true],
    [true, true],
  ])("renders with isMonthView=%s, isColumnView=%s", (isMonthView, isColumnView) => {
    render(
      <TaskHeader
        task={baseTask}
        isMonthView={isMonthView}
        colors={colors}
        isColumnView={isColumnView}
      />
    );
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Project A")).toBeInTheDocument();
  });
}); 