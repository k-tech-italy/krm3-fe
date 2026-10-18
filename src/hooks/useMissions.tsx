import { useMutation, useQuery, useQueryClient } from "react-query";
import type { AxiosError } from "axios";
import { MissionInterface } from "../restapi/types";
import {
  createMission,
  submitMission,
  getMission,
  getMissions,
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

export function useGetMissions() {
  const { data } = useGetCurrentUser();
  const id = data?.resource?.id;
  const isStaff = data?.isStaff;

  return useQuery(["missions", data?.id, data?.isStaff], () => {
    return getMissions(isStaff || false, id);
  });
}

export function useGetResources(enabled = true) {
  const resources = useQuery("resources", () => getResources(), { enabled });
  return resources.data;
}

export function useGetActiveResources() {
  const { data: user } = useGetCurrentUser();
  const resources = useQuery("activeResources", () => getActiveResources(), {
    enabled: !!user?.isSuperuser,
  });
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
