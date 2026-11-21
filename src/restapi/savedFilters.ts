import type { FilterValues } from "../components/commons/Krm3Filter";
import { restapi } from "./restapi.ts";

/** A filter saved by the logged-in user for one page or table (see the SavedFilter glossary term). */
export interface SavedFilter {
  id: number;
  page: string;
  name: string;
  values: FilterValues;
  /** The filter as people read it, shown in the user profile. */
  summary: string;
  /** Frontend address that opens the page with this filter applied. */
  url: string;
  /** Applied when the page is opened without filters; at most one per page. */
  isDefault: boolean;
}

export type SavedFilterPayload = Omit<SavedFilter, "id">;

export function listSavedFilters(page: string): Promise<SavedFilter[]> {
  return restapi
    .get<SavedFilter[]>("core/saved-filter/", { params: { page } })
    .then((res) => res.data);
}

/** Save a filter; one with the same page and name is replaced. */
export function saveFilter(payload: SavedFilterPayload): Promise<SavedFilter> {
  return restapi.post<SavedFilter>("core/saved-filter/", payload).then((res) => res.data);
}
