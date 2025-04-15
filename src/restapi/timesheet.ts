import { restapi } from "./restapi";
import { Task, TimeEntry } from "./types";

export function getTask(params: { resourceId: number, startDate: string, endDate: string }): Promise<Task[]> {
    // return restapi.get<Task[]>(`timesheet/task/`, {params}).then(res => res.data);
    return Promise.resolve([
        {
            id: 1,
            title: 'Task 1',
            basketTitle: 'Basket 1',
            color: '#FF0000',
            startDate: new Date(),
            endDate: new Date(),
            timeEntries: [
                { id: 1, date: '2025-04-18', workHours: 4, taskId: 1 },
                { id: 2, date: '2023-10-02', workHours: 6, taskId: 1 },
            ] as TimeEntry[],
        },
        {
            id: 2,
            title: 'Task 2',
            basketTitle: 'Basket 2',
            color: '#00FF00',
            startDate: new Date(),
            endDate: new Date(),
            timeEntries: [
                { id: 3, date: '2025-04-18', workHours: 4, taskId: 2 },
                { id: 4, date: '2023-10-02', workHours: 5, taskId: 2 },
            ] as TimeEntry[],
        },
    ] as Task[]);
}

export function createTimeEntry(params: { resourceId: number, task: number, dates: string[], workHours: number }) {
    return restapi.post('timesheet/timeentry/', params).then(res => res.data);
}

