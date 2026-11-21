import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Krm3Filter, { countActiveFilters, FilterField, FilterValues } from "./Krm3Filter";

const fields: FilterField[] = [
  { name: "search", label: "Search", type: "text" },
  { name: "year", label: "Year", type: "number" },
  { name: "from", label: "From", type: "date" },
  {
    name: "kind",
    label: "Kind",
    type: "select",
    options: [
      { value: "a", label: "Kind A" },
      { value: "b", label: "Kind B" },
    ],
  },
  {
    name: "status",
    label: "Status",
    type: "multiselect",
    options: [
      { value: "OPEN", label: "Open" },
      { value: "CLOSED", label: "Closed" },
    ],
  },
];

const onSubmit = vi.fn();
const renderFilter = (values: FilterValues = {}) =>
  render(
    <div>
      <Krm3Filter fields={fields} values={values} onSubmit={onSubmit} />
      <p>outside</p>
    </div>
  );
const open = () => fireEvent.click(screen.getByTestId("filter-button"));

describe("Krm3Filter", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows only the funnel until it is clicked", () => {
    renderFilter();
    expect(screen.queryByTestId("filter-panel")).not.toBeInTheDocument();
    expect(screen.queryByTestId("filter-badge")).not.toBeInTheDocument();
    expect(screen.getByTestId("filter-button")).toHaveAttribute("aria-expanded", "false");

    open();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByTestId("filter-button")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByLabelText("Search")).toHaveFocus();
  });

  it("submits the entered values, without empty ones, and closes", () => {
    renderFilter();
    open();
    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "  rome " } });
    fireEvent.change(screen.getByLabelText("Year"), { target: { value: "2025" } });
    fireEvent.change(screen.getByLabelText("Kind"), { target: { value: "b" } });
    fireEvent.click(screen.getByLabelText("Open"));
    fireEvent.click(screen.getByLabelText("Closed"));
    fireEvent.click(screen.getByLabelText("Open"));
    fireEvent.click(screen.getByTestId("filter-submit"));

    expect(onSubmit).toHaveBeenCalledWith({
      search: "rome",
      year: "2025",
      kind: "b",
      status: ["CLOSED"],
    });
    expect(screen.queryByTestId("filter-panel")).not.toBeInTheDocument();
    expect(screen.getByTestId("filter-button")).toHaveFocus();
  });

  it("starts from the applied values", () => {
    renderFilter({ search: "rome", status: ["OPEN"] });
    open();
    expect(screen.getByLabelText("Search")).toHaveValue("rome");
    expect(screen.getByLabelText("Open")).toBeChecked();
    expect(screen.getByLabelText("Closed")).not.toBeChecked();
  });

  it("shows the number of active filters on the funnel", () => {
    renderFilter({ search: "rome", status: ["OPEN", "CLOSED"], year: "" });
    expect(screen.getByTestId("filter-badge")).toHaveTextContent("2");
    expect(screen.getByTestId("filter-button")).toHaveAccessibleName("Filters (2 active)");
  });

  it("clears all the filters", () => {
    renderFilter({ search: "rome" });
    open();
    fireEvent.click(screen.getByTestId("filter-clear"));
    expect(onSubmit).toHaveBeenCalledWith({});
    expect(screen.queryByTestId("filter-panel")).not.toBeInTheDocument();
  });

  it("closes with Escape without applying", () => {
    renderFilter();
    open();
    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "rome" } });
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByTestId("filter-panel")).not.toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();

    open();
    expect(screen.getByLabelText("Search")).toHaveValue("");
  });

  it("closes on a click outside without applying", () => {
    renderFilter();
    open();
    fireEvent.mouseDown(screen.getByText("outside"));
    expect(screen.queryByTestId("filter-panel")).not.toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("toggles with the funnel", () => {
    renderFilter();
    open();
    open();
    expect(screen.queryByTestId("filter-panel")).not.toBeInTheDocument();
  });

  it("supports autocomplete fields, where Escape closes the suggestions first", () => {
    const people: FilterField[] = [
      {
        name: "who",
        label: "Who",
        type: "autocomplete",
        options: [
          { value: "1", label: "Alice" },
          { value: "2", label: "Bob" },
        ],
      },
    ];
    render(<Krm3Filter fields={people} values={{ who: ["2"] }} onSubmit={onSubmit} />);
    open();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Who"), { target: { value: "ali" } });

    fireEvent.keyDown(screen.getByLabelText("Who"), { key: "Escape" });
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
    expect(screen.getByTestId("filter-panel")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Who"), { target: { value: "alic" } });
    fireEvent.mouseDown(screen.getByRole("option", { name: "Alice" }));
    fireEvent.click(screen.getByTestId("filter-submit"));
    expect(onSubmit).toHaveBeenCalledWith({ who: ["2", "1"] });
  });

  it("counts only the declared, non-empty filters", () => {
    expect(countActiveFilters(fields, { search: " ", status: [], other: "x", year: "1" })).toBe(1);
  });
});
