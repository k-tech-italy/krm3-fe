import { render } from "@testing-library/react";
import { SpecialDayCell } from "./SpecialDayCell";
import React from "react";
import { TimeEntryType } from "../../../restapi/types";

describe("SpecialDayCell", () => {
  const baseProps = {
    day: new Date(),
    taskId: 1,
    isMonthView: false,
    colors: { backgroundColor: "#fff", borderColor: "#000" },
  };

  it("renders for holiday", () => {
    const { container } = render(
      <SpecialDayCell {...baseProps} type={TimeEntryType.HOLIDAY} />
    );
    expect(container.querySelector('[id^="holiday-cell-"]')).toBeInTheDocument();
  });

  it("renders for sick", () => {
    const { container } = render(
      <SpecialDayCell {...baseProps} type={TimeEntryType.SICK} />
    );
    expect(container.querySelector('[id^="sick-day-cell-"]')).toBeInTheDocument();
  });

  it("renders for finished", () => {
    const { container } = render(
      <SpecialDayCell {...baseProps} type={TimeEntryType.FINISHED} />
    );
    expect(container.querySelector('[id^="task-finished-cell-"]')).toBeInTheDocument();
    expect(container).toHaveTextContent("N/A");
  });

  it("renders for default (unknown type)", () => {
    const { container } = render(
      <SpecialDayCell {...baseProps} type={"unknown" as TimeEntryType} />
    );
    expect(container.firstChild).toBeInTheDocument();
  });
}); 