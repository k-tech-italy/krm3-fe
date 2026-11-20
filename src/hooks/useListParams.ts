import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FilterField,
  FilterValues,
  isEmptyFilterValue,
  isMultiValueField,
} from "../components/commons/Krm3Filter";

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
    (change: (next: URLSearchParams) => void) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        change(next);
        return next;
      });
    },
    [setSearchParams]
  );

  const setFilters = useCallback(
    (values: FilterValues) =>
      update((next) => {
        for (const field of fields) {
          const value = values[field.name];
          if (isEmptyFilterValue(value)) {
            next.delete(field.name);
          } else {
            next.set(field.name, Array.isArray(value) ? value.join(",") : value);
          }
        }
        next.delete("page");
      }),
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

/** Query parameters for a list endpoint: multi-value filters are joined with commas. */
export function toApiParams(
  { filters, ordering, page }: ListParams,
  pageSize: number
): Record<string, string | number> {
  const result: Record<string, string | number> = { page, pageSize };
  for (const [name, value] of Object.entries(filters)) {
    if (!isEmptyFilterValue(value)) {
      result[name] = Array.isArray(value) ? value.join(",") : value;
    }
  }
  if (ordering) result.ordering = ordering;
  return result;
}
