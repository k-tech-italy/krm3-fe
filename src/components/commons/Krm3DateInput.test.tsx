import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Krm3DateInput from "./Krm3DateInput";
import Krm3Filter, { FilterField } from "./Krm3Filter";

const onChange = vi.fn();

function renderInput(value = "", disabled = false) {
  return render(
    <>
      <label htmlFor="day">Day</label>
      <Krm3DateInput id="day" value={value} onChange={onChange} disabled={disabled} />
    </>
  );
}

describe("Krm3DateInput", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows the date and accepts a typed one", () => {
    renderInput("2025-03-07");
    expect(screen.getByLabelText("Day")).toHaveValue("2025-03-07");

    fireEvent.change(screen.getByLabelText("Day"), { target: { value: "2025-04-15" } });

    expect(onChange).toHaveBeenCalledWith("2025-04-15");
  });

  it("opens a calendar to pick the date", () => {
    renderInput("2025-03-07");

    fireEvent.click(screen.getByLabelText("Day"));
    expect(document.querySelector(".react-datepicker")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("option", { name: /March 20th, 2025/ }));

    expect(onChange).toHaveBeenCalledWith("2025-03-20");
  });

  it("can be cleared", () => {
    renderInput("2025-03-07");

    fireEvent.click(screen.getByRole("button", { name: /close/i }));

    expect(onChange).toHaveBeenCalledWith("");
  });

  it("shows nothing for an empty or invalid value", () => {
    renderInput("not a date");
    expect(screen.getByLabelText("Day")).toHaveValue("");
    expect(screen.getByLabelText("Day")).toHaveAttribute("placeholder", "yyyy-mm-dd");
  });

  it("cannot be changed or cleared when disabled", () => {
    renderInput("2025-03-07", true);

    expect(screen.getByLabelText("Day")).toBeDisabled();
    expect(screen.queryByRole("button", { name: /close/i })).not.toBeInTheDocument();
  });
});

describe("Krm3Filter date fields", () => {
  const fields: FilterField[] = [{ name: "dateFrom", label: "From", type: "date" }];
  const onSubmit = vi.fn();

  beforeEach(() => vi.clearAllMocks());

  it("picks a date from the calendar and applies it", () => {
    render(<Krm3Filter fields={fields} values={{ dateFrom: "2025-03-07" }} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByTestId("filter-button"));

    fireEvent.click(screen.getByLabelText("From"));
    fireEvent.click(screen.getByRole("option", { name: /March 20th, 2025/ }));
    fireEvent.click(screen.getByTestId("filter-submit"));

    expect(onSubmit).toHaveBeenCalledWith({ dateFrom: "2025-03-20" });
  });

  it("closes the calendar with Escape, then the filter panel", () => {
    render(<Krm3Filter fields={fields} values={{}} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByTestId("filter-button"));
    fireEvent.click(screen.getByLabelText("From"));
    expect(document.querySelector(".react-datepicker")).toBeInTheDocument();

    fireEvent.keyDown(screen.getByLabelText("From"), { key: "Escape" });
    expect(document.querySelector(".react-datepicker")).not.toBeInTheDocument();
    expect(screen.getByTestId("filter-panel")).toBeInTheDocument();

    fireEvent.keyDown(screen.getByLabelText("From"), { key: "Escape" });
    expect(screen.queryByTestId("filter-panel")).not.toBeInTheDocument();
  });

  it("keeps the filter panel open while picking in the calendar", async () => {
    render(<Krm3Filter fields={fields} values={{}} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByTestId("filter-button"));
    // the calendar positions itself asynchronously
    await act(async () => {
      fireEvent.click(screen.getByLabelText("From"));
    });

    fireEvent.mouseDown(document.querySelector(".react-datepicker__day") as HTMLElement);

    expect(screen.getByTestId("filter-panel")).toBeInTheDocument();
  });
});
