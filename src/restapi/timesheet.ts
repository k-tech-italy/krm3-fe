import { restapi } from "./restapi";
import { Timesheet } from "./types";

export function getTimesheet(params: {
  resourceId: number;
  startDate: string;
  endDate: string;
}): Promise<Timesheet> {
  return restapi
    .get<Timesheet>(`timesheet/`, { params })
    .then((res) => res.data);
}

export function createTimeEntry(params: {
  resourceId: number;
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
  comment?: string;
}) {
  return restapi.post("timesheet/time-entry/", params).then((res) => res.data);
}

export function deleteTimeEntries(ids: number[]) {

  return restapi.post('timesheet/time-entry/clear/', {ids: ids});
}