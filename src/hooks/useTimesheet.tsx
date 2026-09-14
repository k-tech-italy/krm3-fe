import { useMutation, useQuery, useQueryClient } from "react-query";

import { AxiosError, AxiosResponse } from "axios";
import { useGetCurrentUser } from "./useAuth";
import {
  getTimesheet,
  getSpecialReason,
  submitTimesheet,
  createTaskEntry,
  clearDayEntries,
  deleteDayEntry,
  deleteDayEntries,
  deleteTaskEntries,
  saveDayEntries,
} from "../restapi/timesheet";
import { DayEntriesPayload, TaskEntryPayload } from "../restapi/types";

export function useCreateTaskEntry(selectedResourceId: number | null) {
  const { data: currentUser } = useGetCurrentUser();
  const resourceId = selectedResourceId || currentUser?.resource.id;

  const queryClient = useQueryClient();

  if (resourceId === undefined) {
    throw new Error("Resource ID is undefined");
  }

  return useMutation(
    (params: Omit<TaskEntryPayload, "resourceId">) =>
      createTaskEntry({
        ...params,
        resourceId,
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["timesheet"] });
      },
    }
  );
}

export function useSaveDayEntries(selectedResourceId: number | null) {
  const { data: currentUser } = useGetCurrentUser();
  const resourceId = selectedResourceId || currentUser?.resource.id;
  const queryClient = useQueryClient();

  if (resourceId === undefined) {
    throw new Error("Resource ID is undefined");
  }

  return useMutation(
    (params: Omit<DayEntriesPayload, "resourceId">) => saveDayEntries({ ...params, resourceId }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["timesheet"] });
      },
    }
  );
}

export function useSubmitTimesheet() {
  const queryClient = useQueryClient();
  return useMutation(
    (params: { resourceId: number; startDate: string; endDate: string }) =>
      submitTimesheet(params.resourceId, params.startDate, params.endDate),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["timesheet"] });
      },
    }
  );
}

export function useGetTimesheet(
  startDate: string,
  endDate: string,
  selectedResourceId: number | null
) {
  const { data } = useGetCurrentUser();
  const resourceId = selectedResourceId || data?.resource?.id;

  return useQuery(
    ["timesheet", resourceId, startDate, endDate],
    async () => {
      if (!resourceId) {
        throw new Error("Resource ID is undefined");
      }

      return getTimesheet({
        resourceId,
        startDate,
        endDate,
      });
    },
    {
      // Don't run the query if resourceId is undefined
      enabled: !!resourceId,
      useErrorBoundary: false,
      onError: (error) => {
        console.error("Timesheet fetch failed:", error);
        return error;
      },
    }
  );
}

export function useDeleteDayEntry() {
  const queryClient = useQueryClient();

  return useMutation<AxiosResponse, AxiosError, number>(
    (dayEntryId) => deleteDayEntry(dayEntryId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["timesheet"] });
      },
    }
  );
}

export function useDeleteDayEntries() {
  const queryClient = useQueryClient();

  return useMutation<AxiosResponse, AxiosError, number[]>(
    (entryIds) => deleteDayEntries(entryIds),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["timesheet"] });
      },
    }
  );
}

export function useClearDayEntries() {
  const queryClient = useQueryClient();

  return useMutation<AxiosResponse, AxiosError, number[]>((entryIds) => clearDayEntries(entryIds), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timesheet"] });
    },
  });
}

export function useDeleteTaskEntries() {
  const queryClient = useQueryClient();

  return useMutation<AxiosResponse, AxiosError, number[]>(
    (entryIds) => deleteTaskEntries(entryIds),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["timesheet"] });
      },
    }
  );
}

export function useGetSpecialReason(fromDate: string, toDate: string) {
  return useQuery(["special-reason", fromDate, toDate], () => getSpecialReason(fromDate, toDate), {
    onError: (error) => {
      return error;
    },
  });
}
