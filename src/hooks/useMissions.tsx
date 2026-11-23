import { useMutation, useQuery, useQueryClient } from "react-query";
import type { AxiosError } from "axios";
import { MissionInterface } from "../restapi/types";
import {
  createMission,
  submitMission,
  getMission,
  listMissions,
  getResources,
  getActiveResources,
  getClients,
  getProjects,
  getCountries,
  getCities,
} from "../restapi/mission";
import { useGetCurrentUser } from "./useAuth";

export function useCreateMission() {
  const queryClient = useQueryClient();
  return useMutation<Awaited<ReturnType<typeof createMission>>, AxiosError, MissionInterface>(
    (params: MissionInterface) => createMission(params),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: "missions" });
      },
    }
  );
}

export function useSubmitMission() {
  const queryClient = useQueryClient();
  return useMutation<MissionInterface, AxiosError, number>((id: number) => submitMission(id), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: "mission" });
      queryClient.invalidateQueries({ queryKey: "missions" });
    },
  });
}

/** A page of missions for the given list parameters (see `toApiParams`). */
export function useMissionList(params: Record<string, string | number>) {
  return useQuery(["missions", "list", params], () => listMissions(params), {
    keepPreviousData: true,
  });
}

export function useGetResources(enabled = true) {
  const resources = useQuery("resources", () => getResources(), { enabled });
  return resources.data;
}

export function useGetActiveResources(period?: { from: string; to: string }) {
  const { userCan } = useGetCurrentUser();
  const canViewOtherTimesheets =
    userCan(["core.view_any_timesheet"]) || userCan(["core.manage_any_timesheet"]);
  const resources = useQuery(
    ["activeResources", period?.from, period?.to],
    () => getActiveResources(period?.from, period?.to),
    { enabled: canViewOtherTimesheets, keepPreviousData: true }
  );
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

/** All projects, or with a resource only those it is involved in today or later. */
export function useGetProjects(resourceId?: number, enabled = true) {
  const projects = useQuery(["projects", resourceId], () => getProjects(resourceId), { enabled });
  return projects.data;
}

export function useGetMission(id: number) {
  return useQuery("mission", () => getMission(id), {
    onError: (error) => {
      return error;
    },
  });
}
