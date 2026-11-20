import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Krm3Table, { nextOrdering } from "./Krm3Table";
import * as useView from "../../hooks/useView";

const columns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "age", header: "Age", sortable: false },
];
// rows arrive already sorted by the server: the table must not re-sort them
const data = [
  { name: "b", age: 2 },
  { name: "a", age: 1 },
];

describe("Krm3Table with server-side sorting and pagination", () => {
  it("cycles the API ordering on header clicks", () => {
    expect(nextOrdering(null, "name")).toBe("name");
    expect(nextOrdering("name", "name")).toBe("-name");
    expect(nextOrdering("-name", "name")).toBeNull();
    expect(nextOrdering("-age", "name")).toBe("name");
  });

  it("shows the server ordering and asks for the next one", () => {
    const onOrderingChange = vi.fn();
    render(
      <Krm3Table
        columns={columns}
        data={data}
        onClickRow={vi.fn()}
        ordering="-name"
        onOrderingChange={onOrderingChange}
      />
    );
    const header = screen.getByTestId("header-name");
    expect(within(header).getByText("↓")).toBeInTheDocument();
    expect(header).toHaveAttribute("aria-sort", "descending");
    expect(screen.getByTestId("row-0")).toHaveTextContent("b");

    fireEvent.click(header);
    expect(onOrderingChange).toHaveBeenCalledWith(null);

    fireEvent.click(screen.getByTestId("header-age"));
    expect(onOrderingChange).toHaveBeenCalledTimes(1);
  });

  it("pages through the server pages", () => {
    const onPageChange = vi.fn();
    render(
      <Krm3Table
        columns={columns}
        data={data}
        onClickRow={vi.fn()}
        pagination={{ page: 2, pageCount: 3, onPageChange }}
      />
    );
    expect(screen.getByText("2 of 3")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Next page"));
    fireEvent.click(screen.getByLabelText("Previous page"));
    fireEvent.click(screen.getByLabelText("Last page"));
    fireEvent.click(screen.getByLabelText("First page"));
    expect(onPageChange.mock.calls).toEqual([[3], [1], [3], [1]]);
  });

  it("shows the server pagination on small screens", () => {
    vi.spyOn(useView, "useMediaQuery").mockReturnValue(true);
    render(
      <Krm3Table
        columns={columns}
        data={data}
        onClickRow={vi.fn()}
        pagination={{ page: 1, pageCount: 1, onPageChange: vi.fn() }}
      />
    );
    expect(screen.getByText("1 of 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Next page")).toBeDisabled();
  });
});
