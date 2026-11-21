import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Krm3ColumnChooser from "./Krm3ColumnChooser";

const columns = [
  { accessorKey: "id", header: "Id" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "day", header: "Day" },
];
const onChange = vi.fn();
const onReset = vi.fn();

const renderChooser = (visible: string[]) =>
  render(
    <div>
      <Krm3ColumnChooser
        columns={columns}
        visible={visible}
        onChange={onChange}
        onReset={onReset}
      />
      <p>outside</p>
    </div>
  );
const open = () => fireEvent.click(screen.getByTestId("columns-button"));

describe("Krm3ColumnChooser", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lists the columns with the visible ones checked", () => {
    renderChooser(["name", "day"]);
    expect(screen.queryByTestId("columns-panel")).not.toBeInTheDocument();
    open();
    expect(screen.getByLabelText("Id")).not.toBeChecked();
    expect(screen.getByLabelText("Name")).toBeChecked();
    expect(screen.getByLabelText("Day")).toBeChecked();
  });

  it("shows a column in the table order", () => {
    renderChooser(["name", "day"]);
    open();
    fireEvent.click(screen.getByLabelText("Id"));
    expect(onChange).toHaveBeenCalledWith(["id", "name", "day"]);
  });

  it("hides a column, but not the last one", () => {
    renderChooser(["name", "day"]);
    open();
    fireEvent.click(screen.getByLabelText("Name"));
    expect(onChange).toHaveBeenCalledWith(["day"]);
  });

  it("does not allow hiding the last visible column", () => {
    renderChooser(["day"]);
    open();
    expect(screen.getByLabelText("Day")).toBeDisabled();
  });

  it("resets to the default columns", () => {
    renderChooser(["day"]);
    open();
    fireEvent.click(screen.getByTestId("columns-reset"));
    expect(onReset).toHaveBeenCalled();
  });

  it("closes with Escape and on a click outside", () => {
    renderChooser(["day"]);
    open();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByTestId("columns-panel")).not.toBeInTheDocument();
    expect(screen.getByTestId("columns-button")).toHaveFocus();
    open();
    fireEvent.mouseDown(screen.getByText("outside"));
    expect(screen.queryByTestId("columns-panel")).not.toBeInTheDocument();
  });
});
