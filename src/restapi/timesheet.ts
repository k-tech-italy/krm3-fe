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
  task?: number;
  dates: string[];
  workHours?: number;
  sickHours?: number;
  holidayHours?: number;
  leaveHours?: number;
  overtimeHours?: number;
  travelHours?: number;
  onCallHours?: number;
  restHours?: number;
}) {
  return restapi.post("timesheet/time-entry/", params).then((res) => res.data);
}

export function deleteTimeEntries(ids: number[]) {
    return new Promise<void>((resolve, reject) => {
        // setTimeout(() => {
        //     reject(new Error("Could not delete time entries"));
        // }, 2000);
        setTimeout(() => {
            resolve();
        }, 5000);
    });
    // return restapi.delete('timesheet/timeentry/', {dates: ids});
}