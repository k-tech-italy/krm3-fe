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
import moment from "moment";


export function createMission(params: MissionInterface) {
    const year: number = moment(params.toDate).year();
    const paramsRefactored = { ...params, project: params.project.id, year: year, city: params.city.id, defaultCurrency: params.defaultCurrency?.iso3, resource: params.resource.id }
    return restapi.post<MissionInterface>('missions/mission/', paramsRefactored)
}

export function getMissions(isStaff: boolean, resourceId?: number): Promise<Page<MissionInterface>> {
    let params = {}
    if (resourceId !== undefined) {
        params = { resource_id: resourceId, is_staff: isStaff };
    }
    return restapi.get<Page<MissionInterface>>('missions/mission/', { params }).then(res => res.data);
}

export function getMission(id: number): Promise<MissionInterface> {
    return restapi.get<MissionInterface>(`missions/mission/${id}/`).then(res => res.data);
}

export function getResources(profile?: number): Promise<Page<Resource>> {
    let params = {}
    if (profile !== undefined) {
        params = { profile_id: profile }
    }
    return restapi.get<Page<Resource>>(`core/resource/`, { params }).then(res => res.data);
}

export function getActiveResources(): Promise<Resource[]> {
    return restapi.get<Resource[]>(`core/resource/active/`)
        .then(res => res.data)
        .catch((): Resource[] => []);
}

export function getClients(): Promise<Page<Client>> {
    return restapi.get<Page<Client>>(`core/client/`).then(res => res.data);
}

export function getCountries(): Promise<Page<Country>> {
    return restapi.get<Page<Country>>(`core/country/`).then(res => res.data);
}

export function getCities(): Promise<Page<City>> {
    return restapi.get<Page<City>>(`core/city/`).then(res => res.data);
}

export function getProjects(): Promise<Page<Project>> {
    return restapi.get<Page<Project>>(`core/project/`).then(res => res.data);
}