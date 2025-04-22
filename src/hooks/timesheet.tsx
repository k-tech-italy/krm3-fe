import { useMutation, useQuery, useQueryClient } from "react-query";
import { getMission, getMissions, getResources, getClients, getProjects, getCountries, getCities } from "../restapi/mission";
import { AxiosError } from "axios";
import { useGetCurrentUser } from "./commons";
import { createTimeEntry, getTask } from "../restapi/timesheet";

export function useCreateTimeEntry() {
    const queryClient = useQueryClient();
    return useMutation((params: { resourceId: number, task: number, dates: string[], workHours: number }) => createTimeEntry(params),
        {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: 'task' });
            },
            onError: (error: AxiosError) => {
            },
        });
}

export function useGetTimesheet(startDate: string, endDate: string) {
    const resourceId = useGetCurrentUser()?.resource.id;
    return useQuery(['task', resourceId, startDate, endDate], () => {
        if (resourceId !== undefined) {
            return getTask({
                resourceId,
                startDate,
                endDate
            });
        }

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