import { useMutation, useQuery, useQueryClient } from "react-query";

import { AxiosError, AxiosResponse } from "axios";
import { useGetCurrentUser } from "./useAuth";
import {
  createTimeEntry,
  getTimesheet,
  deleteTimeEntries,
  getSpecialReason,
} from "../restapi/timesheet";
import { TimeEntry, Timesheet } from "../restapi/types";

export function useCreateTimeEntry(selectedResourceId: number | null) {
  const { data: currentUser } = useGetCurrentUser();
  const resourceId = selectedResourceId ? selectedResourceId : currentUser?.resource.id;
  const queryClient = useQueryClient();
  if (resourceId === undefined) {
    throw new Error("Resource ID is undefined");
  }
  return useMutation(
    (params: {
      taskId?: number;
      dates: string[];
      dayShiftHours?: number;
      sickHours?: number;
      holidayHours?: number;
      leaveHours?: number;
      nightShiftHours?: number;
      travelHours?: number;
      onCallHours?: number;
      restHours?: number;
      specialLeaveHours?: number;
      specialReason?: string;
      comment?: string;
    }) => createTimeEntry({ ...params, resourceId }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["timesheet"] });
      },
      onError: (error: AxiosError) => {},
    }
  );
}

export function useGetTimesheet(
  startDate: string, 
  endDate: string, 
  selectedResourceId: number | null
) {
  const { data } = useGetCurrentUser();
  const resourceId = selectedResourceId ? selectedResourceId : data?.resource?.id;

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
        return "error";
      },
    }
  );
}
export function useDeleteTimeEntries() {
  const queryClient = useQueryClient();

  return useMutation<AxiosResponse, AxiosError, number[]>(
    (entryIds) => deleteTimeEntries(entryIds),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["timesheet"] });
      },
      onError: (error: AxiosError) => {},
    }
  );
}

export function useGetSpecialReason(fromDate: string, toDate: string) {
  return useQuery(
    ["special-reason", fromDate, toDate],
    () => getSpecialReason(fromDate, toDate),
    {
      onError: (error) => {
        return error;
      },
    }
  );
}