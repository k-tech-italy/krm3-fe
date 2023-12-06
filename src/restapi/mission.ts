import {
    City,
    Client,
    Country,
    MissionInterface,
    Page,
    Project,
    Resource,
} from "./types";
import { restapi } from "./restapi";


export function createMission(params: MissionInterface) {
    const paramsRefactored = {...params, project: params.project.id, city: params.city.id, resource: params.resource.id}
    return restapi.post<MissionInterface>('missions/mission/', paramsRefactored)
}

export function getMissions(resourceId?: number): Promise<Page<MissionInterface>> {
    let params = {}
    if (resourceId !== undefined) {
        params = { resource_id: resourceId };

    }
    return restapi.get<Page<MissionInterface>>(`missions/mission/`, {params}).then(res => res.data);
}

export function getMission(id: number): Promise<MissionInterface> {
    return restapi.get<MissionInterface>(`missions/mission/${id}/`).then(res => res.data);
}

export function getResources(): Promise<Page<Resource>>  {
    return restapi.get<Page<Resource>>(`core/resource/`).then(res => res.data);
}

export function getClients(): Promise<Page<Client>>  {
    return restapi.get<Page<Client>>(`core/client/`).then(res => res.data);
}

export function getCountries(): Promise<Page<Country>>  {
    return restapi.get<Page<Country>>(`core/country/`).then(res => res.data);
}

export function getCities(): Promise<Page<City>>  {
    return restapi.get<Page<City>>(`core/city/`).then(res => res.data);
}

export function getProjects(): Promise<Page<Project>>  {
    return restapi.get<Page<Project>>(`core/project/`).then(res => res.data);
}