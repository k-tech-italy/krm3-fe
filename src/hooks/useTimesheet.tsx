import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  getMission,
  getResources,
  getClients,
  getProjects,
  getCountries,
  getCities,
} from "../restapi/mission";
import { AxiosError, AxiosResponse } from "axios";
import { useGetCurrentUser } from "./useAuth";
import {
  createTimeEntry,
  getTimesheet,
  deleteTimeEntries,
  getSpecialReason,
} from "../restapi/timesheet";

export function useCreateTimeEntry() {
  const { data: currentUser } = useGetCurrentUser();
  const resourceId = currentUser?.resource.id;
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

export function useGetTimesheet(startDate: string, endDate: string) {
  const { data } = useGetCurrentUser();
  const resourceId = data?.resource?.id;

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
export function useGetResources() {
  const resources = useQuery("resources", () => getResources());
  return resources.data;
}

export function useGetClients() {
  const resources = useQuery("clients", () => getClients());
  return resources.data;
}

export function useGetCountries() {
  const resources = useQuery("countries", () => getCountries());
  return resources.data;
}

export function useGetCitiess() {
  const resources = useQuery("cities", () => getCities());
  return resources.data;
}

export function useGetProjects() {
  const resources = useQuery("projects", () => getProjects());
  return resources.data;
}

export function useGetMission(id: number) {
  return useQuery("mission", () => getMission(id), {
    onError: (error) => {
      return error;
    },
  });
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
