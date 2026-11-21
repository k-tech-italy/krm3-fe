import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FilterField,
  FilterValues,
  isEmptyFilterValue,
  isMultiValueField,
} from "../components/commons/Krm3Filter";
import { parseRelativePeriod, resolveRelativePeriod } from "../components/commons/relativePeriod";

export interface ListParams {
  filters: FilterValues;
  /** API ordering, e.g. "-fromDate"; null for the server default. */
  ordering: string | null;
  /** 1-based page number. */
  page: number;
}

/**
 * Filters, ordering and page of a list, kept in the URL query string so that links can be shared
 * and the state survives reloads and back navigation. Multi-value filters are comma separated.
 * Changing the filters or the ordering goes back to the first page. Other query parameters are kept.
 */
export function useListParams(fields: FilterField[]) {
  const [searchParams, setSearchParams] = useSearchParams();

  const params: ListParams = useMemo(() => {
    const filters: FilterValues = {};
    for (const field of fields) {
      const raw = searchParams.get(field.name);
      if (raw === null || raw === "") continue;
      filters[field.name] = isMultiValueField(field) ? raw.split(",").filter(Boolean) : raw;
    }
    const page = Number(searchParams.get("page"));
    return {
      filters,
      ordering: searchParams.get("ordering"),
      page: Number.isInteger(page) && page > 0 ? page : 1,
    };
  }, [fields, searchParams]);

  const update = useCallback(
    (change: (next: URLSearchParams) => void, options?: { replace?: boolean }) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        change(next);
        return next;
      }, options);
    },
    [setSearchParams]
  );

  /** `replace` changes the URL without adding a history entry (e.g. for the default filter). */
  const setFilters = useCallback(
    (values: FilterValues, options?: { replace?: boolean }) =>
      update((next) => applyFilters(next, fields, values), options),
    [fields, update]
  );

  const setOrdering = useCallback(
    (ordering: string | null) =>
      update((next) => {
        if (ordering) next.set("ordering", ordering);
        else next.delete("ordering");
        next.delete("page");
      }),
    [update]
  );

  const setPage = useCallback(
    (page: number) =>
      update((next) => {
        if (page > 1) next.set("page", String(page));
        else next.delete("page");
      }),
    [update]
  );

  return { ...params, setFilters, setOrdering, setPage };
}

/**
 * Write the filter values into query parameters as `useListParams` reads them, going back to the first page.
 * Parameters that are not filters (e.g. a tab) are kept.
 */
export function applyFilters(
  params: URLSearchParams,
  fields: FilterField[],
  values: FilterValues
): void {
  for (const field of fields) {
    const value = values[field.name];
    if (isEmptyFilterValue(value)) {
      params.delete(field.name);
    } else {
      params.set(field.name, Array.isArray(value) ? value.join(",") : value);
    }
  }
  params.delete("page");
}

/**
 * Query parameters for a list endpoint: multi-value filters are joined with commas.
 * A "Last ..." period among `fields` is sent as its from/to dates, ending `today`; an invalid one is ignored.
 */
export function toApiParams(
  { filters, ordering, page }: ListParams,
  pageSize: number,
  fields: FilterField[] = [],
  today: Date = new Date()
): Record<string, string | number> {
  const result: Record<string, string | number> = { page, pageSize };
  for (const [name, value] of Object.entries(filters)) {
    if (!isEmptyFilterValue(value)) {
      result[name] = Array.isArray(value) ? value.join(",") : value;
    }
  }
  for (const field of fields) {
    if (field.type !== "relativePeriod" || result[field.name] === undefined) continue;
    const period = parseRelativePeriod(String(result[field.name]));
    delete result[field.name];
    if (period) {
      const { from, to } = resolveRelativePeriod(period, today);
      result[field.fromField] = from;
      result[field.toField] = to;
    }
  }
  if (ordering) result.ordering = ordering;
  return result;
}
