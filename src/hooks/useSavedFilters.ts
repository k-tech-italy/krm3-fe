import { useMutation, useQuery, useQueryClient } from "react-query";
import type { AxiosError } from "axios";
import {
  listSavedFilters,
  saveFilter,
  SavedFilter,
  SavedFilterPayload,
} from "../restapi/savedFilters";

const queryKey = (page: string) => ["savedFilters", page];

/** The filters the logged-in user saved for a page. */
export function useSavedFilters(page: string) {
  return useQuery(queryKey(page), () => listSavedFilters(page), { staleTime: 60 * 1000 });
}

export function useSaveFilter(page: string) {
  const queryClient = useQueryClient();
  return useMutation<SavedFilter, AxiosError, Omit<SavedFilterPayload, "page">>(
    (payload) => saveFilter({ ...payload, page }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKey(page));
      },
    }
  );
}
