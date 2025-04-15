import { Task } from "../../restapi/types";

export function totalHourCell(day: Date, tasks?: Task[],) {

    if (!tasks) {
        return <div className="bg-gray-100">0h</div>;
    }


    const totalHour = tasks.reduce((acc, task) => {
        const timeEntry = task.timeEntries.filter((entry) => entry.date === day.toISOString().split('T')[0]);
        if (timeEntry.length > 0) {
            return acc + timeEntry.reduce((sum, entry) => sum
                + (entry.workHours || 0)
                + (entry.leaveHours || 0)
                + (entry.overtimeHours || 0)
                + (entry.onCallHours || 0)
                , 0);
        }

        return 0;
    }, 0);

    return (
        <div className="bg-gray-100">
            {totalHour} h
        </div>
    );
}