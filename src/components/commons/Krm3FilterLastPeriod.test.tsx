import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Krm3Filter, { compact, FilterField, lastPeriodField, validateFilter } from "./Krm3Filter";

const fields: FilterField[] = [
  { name: "dateFrom", label: "From", type: "date" },
  { name: "dateTo", label: "To", type: "date" },
  lastPeriodField(),
];

const onSubmit = vi.fn();

function openFilter() {
  render(<Krm3Filter fields={fields} values={{ dateFrom: "2020-01-01" }} onSubmit={onSubmit} />);
  fireEvent.click(screen.getByTestId("filter-button"));
}

describe("Last period field", () => {
  beforeEach(() => vi.clearAllMocks());

  it("is declared for the given from/to fields", () => {
    expect(lastPeriodField("start", "end")).toMatchObject({
      name: "last",
      label: "Last",
      type: "relativePeriod",
      fromField: "start",
      toField: "end",
    });
  });

  it("replaces the from/to dates in the applied values", () => {
    expect(
      compact(fields, { dateFrom: "2020-01-01", dateTo: "2020-12-31", last: " 3 M " })
    ).toEqual({
      last: "3m",
    });
    expect(compact(fields, { dateFrom: "2020-01-01" })).toEqual({ dateFrom: "2020-01-01" });
  });

  it("reports an invalid period", () => {
    expect(validateFilter(fields, { last: "3w" })).toEqual({
      last: "Use a number followed by d (days), m (months) or a (years), e.g. 30d.",
    });
    expect(validateFilter(fields, { last: "3m" })).toEqual({});
    expect(validateFilter(fields, { last: " " })).toEqual({});
  });

  it("disables the dates while a period is entered and applies the period", () => {
    openFilter();
    expect(screen.getByLabelText("From")).toBeEnabled();

    fireEvent.change(screen.getByLabelText("Last"), { target: { value: "30D" } });

    expect(screen.getByLabelText("From")).toBeDisabled();
    expect(screen.getByLabelText("To")).toBeDisabled();
    expect(screen.getAllByText('Replaced by the "Last" period.')).toHaveLength(2);

    fireEvent.click(screen.getByTestId("filter-submit"));
    expect(onSubmit).toHaveBeenCalledWith({ last: "30d" });
  });

  it("does not apply an invalid period", () => {
    openFilter();
    fireEvent.change(screen.getByLabelText("Last"), { target: { value: "30 weeks" } });

    fireEvent.click(screen.getByTestId("filter-submit"));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("Use a number followed by d (days)");
    expect(screen.getByLabelText("Last")).toHaveAttribute("aria-invalid", "true");

    fireEvent.change(screen.getByLabelText("Last"), { target: { value: "30d" } });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
