import { restapi } from "./restapi";
import { Days, SpecialReason, Timesheet } from "./types";

const sanitzeDays = (days: Days) => {
  const newDays: Days = {};
  Object.keys(days).forEach((key) => {
    const [year, month, day] = key.split("_");
    newDays[`${year}-${month}-${day}`] = days[key];
  });
  return newDays;
};

export function getTimesheet(params: {
  resourceId: number;
  startDate: string;
  endDate: string;
}): Promise<Timesheet> {
  return restapi.get<Timesheet>(`timesheet/`, { params }).then((res) => {
    res.data.days = sanitzeDays(res.data.days);
    return res.data;
  });
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
  return restapi.post("timesheet/time-entry/clear/", { ids: ids });
}

export function getSpecialReason(
  from: string,
  to: string
): Promise<SpecialReason[]> {
  return restapi
    .get("timesheet/special-leave-reason/", { params: { from, to } })
    .then((res) => res.data);
}

export function submitTimesheet(
  resourceId: number,
  startDate: string,
  endDate: string
) {
  return restapi.post(`timesheet/timesheet/`, {
    resource: resourceId,
    period: [startDate, endDate],
  });
}
