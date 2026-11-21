import { act, renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { FilterField } from "../components/commons/Krm3Filter";
import { toApiParams, useListParams } from "./useListParams";

const fields: FilterField[] = [
  { name: "search", label: "Search", type: "text" },
  { name: "status", label: "Status", type: "multiselect", options: [] },
];

function setup(url: string) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>
  );
  return renderHook(() => ({ list: useListParams(fields), location: useLocation() }), { wrapper });
}

describe("useListParams", () => {
  it("reads filters, ordering and page from the URL", () => {
    const { result } = setup("/x?search=rome&status=A,B&other=1&ordering=-day&page=3");
    expect(result.current.list.filters).toEqual({ search: "rome", status: ["A", "B"] });
    expect(result.current.list.ordering).toBe("-day");
    expect(result.current.list.page).toBe(3);
  });

  it("defaults to page 1 and no ordering", () => {
    const { result } = setup("/x?page=abc");
    expect(result.current.list).toMatchObject({ filters: {}, ordering: null, page: 1 });
  });

  it("writes filters to the URL, keeping unrelated parameters and resetting the page", () => {
    const { result } = setup("/x?tab=spese&search=old&page=4");
    act(() => result.current.list.setFilters({ status: ["A", "B"] }));
    expect(result.current.location.search).toBe("?tab=spese&status=A%2CB");
  });

  it("writes ordering and page", () => {
    const { result } = setup("/x?page=2");
    act(() => result.current.list.setOrdering("day"));
    expect(result.current.location.search).toBe("?ordering=day");
    act(() => result.current.list.setPage(5));
    expect(result.current.location.search).toBe("?ordering=day&page=5");
    act(() => result.current.list.setPage(1));
    act(() => result.current.list.setOrdering(null));
    expect(result.current.location.search).toBe("");
  });
});

describe("toApiParams", () => {
  it("joins multi-value filters and adds paging and ordering", () => {
    expect(
      toApiParams(
        { filters: { status: ["A", "B"], search: "x", empty: [] }, ordering: "-day", page: 2 },
        25
      )
    ).toEqual({ page: 2, pageSize: 25, status: "A,B", search: "x", ordering: "-day" });
  });
});

describe("toApiParams with a Last period", () => {
  const periodFields: FilterField[] = [
    { name: "dateFrom", label: "From", type: "date" },
    { name: "dateTo", label: "To", type: "date" },
    {
      name: "last",
      label: "Last",
      type: "relativePeriod",
      fromField: "dateFrom",
      toField: "dateTo",
    },
  ];
  const today = new Date(2025, 4, 31);
  const list = (filters: Record<string, string>) => ({ filters, ordering: null, page: 1 });

  it("sends the period as from/to dates ending today", () => {
    expect(toApiParams(list({ last: "3m" }), 10, periodFields, today)).toEqual({
      page: 1,
      pageSize: 10,
      dateFrom: "2025-02-28",
      dateTo: "2025-05-31",
    });
  });

  it("replaces the dates of the URL", () => {
    const params = toApiParams(
      list({ dateFrom: "2020-01-01", dateTo: "2020-12-31", last: "1a" }),
      10,
      periodFields,
      today
    );
    expect(params).toMatchObject({ dateFrom: "2024-05-31", dateTo: "2025-05-31" });
  });

  it("ignores an invalid period and keeps the dates", () => {
    const params = toApiParams(
      list({ dateFrom: "2020-01-01", last: "soon" }),
      10,
      periodFields,
      today
    );
    expect(params).toEqual({ page: 1, pageSize: 10, dateFrom: "2020-01-01" });
  });
});
