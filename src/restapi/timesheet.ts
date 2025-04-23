import { restapi } from "./restapi";
import { Timesheet } from "./types";

export function getTimesheet(params: { resourceId: number, startDate: string, endDate: string }): Promise<Timesheet> {
    return restapi.get<Timesheet>(`timesheet/`, { params }).then(res => res.data);
}

export function createTimeEntry(params: {
    resourceId: number,
    task?: number,
    dates: string[],
    workHours?: number,
    sickHours?: number,
    holidayHours?: number,
    leaveHours?: number,
    overtimeHours?: number,
    travelHours?: number,
    onCallHours?: number,
    restHours?: number,
}) {
    console.log('createTimeEntry', params);
    return restapi.post('timesheet/time-entry/', params).then(res => res.data);
}

