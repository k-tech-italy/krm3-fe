import { render, screen } from "@testing-library/react";
import { TaskHeader } from "./TaskCell";
import React from "react";

describe("TaskHeader", () => {
  const baseTask = {
    id: 1,
    title: "Task 1",
    projectName: "Project A",
    clientName: "Client 1",
    startDate: new Date(),
    color: "#fff",
  };

  const baseTaskStaffUser = {
    id: 1,
    title: "Task 1",
    projectName: "Project A",
    clientName: "Client 1",
    startDate: new Date(),
    color: "#fff",
    adminUrl: "change/task/admin"
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
    expect(screen.getByText("Client 1")).toBeInTheDocument();
  });

  it("renders title as plain text when adminUrl is not provided", () => {
    render(
      <TaskHeader
        task={baseTask}
        isMonthView={false}
        colors={colors}
        isColumnView={false}
      />
    );

    const titleElement = screen.getByText("Task 1");
    expect(titleElement).toBeInTheDocument();
    expect(titleElement.tagName).not.toBe("A"); // Ensure it's not a link
  });

  it("renders title as a link when adminUrl is provided", () => {
    render(
      <TaskHeader
        task={baseTaskStaffUser}
        isMonthView={false}
        colors={colors}
        isColumnView={false}
      />
    );

    const linkElement = screen.getByRole("link", { name: "Task 1" });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute("href", "change/task/admin");
    expect(linkElement).toHaveAttribute("target", "_blank");
    expect(linkElement).toHaveAttribute("rel", "noopener noreferrer");
  });
});