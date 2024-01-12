import { useMutation, useQuery, useQueryClient } from "react-query";
import { MissionInterface } from "../restapi/types";
import { createMission, getMission, getMissions, getResources, getClients, getProjects, getCountries, getCities } from "../restapi/mission";
import { AxiosError } from "axios";
import { useGetCurrentUser } from "./commons";

export function useCreateMission() {
    const queryClient = useQueryClient();
    return useMutation((params: MissionInterface) => createMission(params),
        {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: 'missions' });
            },
            onError: (error: AxiosError) => {
            },
        });
}

export function useGetMissions() {
    const id = useGetCurrentUser()?.resource?.id;
    const isStaff = useGetCurrentUser()?.isStaff
    return useQuery(['missions', id, isStaff], () => {
            return getMissions(isStaff || false, id);
    }, {
        onError: (error) => {
            return 'error';
        }
    });
}

export function useGetResources() {
    const resources = useQuery('resources', () => getResources());
    return resources.data;
}

export function useGetClients() {
    const resources = useQuery('clients', () => getClients());
    return resources.data;
}

export function useGetCountries() {
    const resources = useQuery('countries', () => getCountries());
    return resources.data;
}

export function useGetCitiess() {
    const resources = useQuery('cities', () => getCities());
    return resources.data;
}

export function useGetProjects() {
    const resources = useQuery('projects', () => getProjects());
    return resources.data;
}

export function useGetMission(id: number) {
    return useQuery('mission', () => getMission(id), {
        onError: (error) => {
            return error
        }
    });
}