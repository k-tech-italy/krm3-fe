import { restapi } from "./restapi";
import {
  DayEntry,
  DayEntriesPayload,
  SpecialReason,
  Task,
  TaskEntryPayload,
  Timesheet,
} from "./types";
import { normalizeDate } from "../components/timesheet/utils/dates.ts";

type ApiTask = Omit<Task, "startDate" | "endDate"> & {
  period: string | { lower: string; upper: string | null } | [string, string | null];
};

type ApiTimesheet = Omit<Timesheet, "tasks"> & { tasks: ApiTask[] };

function getTaskPeriod(period: ApiTask["period"]): [string, string | null] {
  if (Array.isArray(period)) return period;

  const parsed = typeof period === "string" ? JSON.parse(period) : period;
  return [parsed.lower, parsed.upper];
}

function normalizeTask({ period, ...task }: ApiTask): Task {
  const [startDate, endDate] = getTaskPeriod(period);

  if (!startDate) {
    throw new Error(`Task ${task.id} has an invalid period`);
  }

  return {
    ...task,
    startDate,
    endDate: endDate ?? undefined,
  };
}

export function getTimesheet(params: {
  resourceId: number;
  startDate: string;
  endDate: string;
}): Promise<Timesheet> {
  return restapi.get<ApiTimesheet>("timesheet/", { params }).then(({ data }) => ({
    ...data,
    tasks: data.tasks.map(normalizeTask),
  }));
}

export function createTaskEntry(params: TaskEntryPayload) {
  return restapi.post("timesheet/task-entry/", params).then((res) => res.data);
}

export function saveDayEntries(params: DayEntriesPayload) {
  const { resourceId, ...dayEntries } = params;
  return restapi
    .post("timesheet/day-entry/", { ...dayEntries, resource: resourceId })
    .then((res) => res.data);
}

export function deleteDayEntry(id: number) {
  return restapi.delete(`timesheet/day-entry/${id}/`);
}

export function deleteDayEntries(ids: number[]) {
  return restapi.post("timesheet/day-entry/delete/", { ids });
}

export function clearDayEntries(ids: number[]) {
  return restapi.post("timesheet/day-entry/clear/", { ids });
}

export function deleteTaskEntries(ids: number[]) {
  return restapi.post("timesheet/task-entry/clear/", { ids });
}

export function getSpecialReason(from: string, to: string): Promise<SpecialReason[]> {
  return restapi
    .get("timesheet/special-leave-reason/", { params: { from, to } })
    .then((res) => res.data);
}

export function submitTimesheet(resourceId: number, startDate: string, endDate: string) {
  return restapi.post(`core/timesheet/`, {
    resource: resourceId,
    period: [startDate, endDate],
  });
}

export function calculateTotalHoursForDay(
  dayEntries: readonly DayEntry[],
  day: Date | string
): number {
  const formattedDay = normalizeDate(day);

  const dayEntry = dayEntries.find((entry) => normalizeDate(entry.day) === formattedDay);

  if (!dayEntry) {
    return 0;
  }

  return (
    (Number(dayEntry.dayHours) || 0) +
    (Number(dayEntry.nightHours) || 0) +
    (Number(dayEntry.leaveHours) || 0) +
    (Number(dayEntry.specialLeaveHours) || 0) +
    (Number(dayEntry.restHours) || 0) +
    (Number(dayEntry.travelHours) || 0) -
    (Number(dayEntry.bank) || 0)
  );
}
