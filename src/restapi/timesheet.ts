import { restapi } from "./restapi";
import { Task, Timesheet } from "./types";

export function getTask(params: { resourceId: number, startDate: string, endDate: string }): Promise<Timesheet> {
    // return restapi.get<Task[]>(`timesheet/task/`, {params}).then(res => res.data);
    return Promise.resolve({
        tasks: [{
            id: 1,
            title: 'Task 1',
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-05-31'),
        }, {
            id: 2,
            title: 'Task 2',
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-05-31'),
        }] as Task[],
        timeEntries: [
            {
                id: 1,
                date: '2025-04-01',
                taskId: 1,
                workHours: 8,
            }, {
                id: 2,
                date: '2025-04-05',
                taskId: 1,
                workHours: 4,
            }, {
                id: 3,
                date: '2025-04-20',
                taskId: 2,
                workHours: 6,
            },
            {
                id: 4,
                date: '2025-04-21',
                holidayHours: 8,
            }
        ]
    } as Timesheet);
}

export function createTimeEntry(params: { resourceId: number, task: number, dates: string[], workHours: number }) {
    return restapi.post('timesheet/timeentry/', params).then(res => res.data);
}

