import { restapi } from "./restapi";
import { Task } from "./types";

export function getTask(params: { resourceId: number, startDate: string, endDate: string }): Promise<Task[]> {
    return restapi.get<Task[]>(`timesheet/task/`, {params}).then(res => res.data);
}

export function createTimeEntry(params: { resourceId: number, task: number, dates: string[], workHours: number }) {
    return restapi.post('timesheet/timeentry/', params).then(res => res.data);
}

