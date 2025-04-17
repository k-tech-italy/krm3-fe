import { Info } from "lucide-react";
import { Task } from "../../restapi/types";
import { useState } from "react";

interface Props {
    day: Date;
    tasks?: Task[];
}

export function TotalHourCell({ day, tasks }: Props) {
    const [showTooltip, setShowTooltip] = useState<boolean>(false);

    if (!tasks) {
        return <div className="bg-gray-100">0h</div>;
    }

    const totalHour = tasks.reduce((acc, task) => {
        const timeEntry = task.timeEntries.filter((entry) => entry.date === day.toISOString().split('T')[0]);
        if (timeEntry.length > 0) {
            return acc + timeEntry.reduce((sum, entry) => sum
                + (Number(entry.workHours) || 0)
                + (Number(entry.overtimeHours) || 0)
                + (Number(entry.onCallHours) || 0)
                , 0);
        }

        return acc;
    }, 0);

    function handleShowTooltip() {
        if (totalHour > 0) {
            setShowTooltip(!showTooltip);
        }

    }


    return (
        <div
            onMouseEnter={handleShowTooltip}
            onMouseLeave={handleShowTooltip}
            className="relative bg-gray-100"
        >
            <div className="flex justify-between"

            >
                {totalHour} h
                {totalHour > 0 && (
                    <Info size={20} color="blue"
                        className="cursor-pointer"
                    />
                )}
            </div>
            {showTooltip && (
                <div className="absolute left-0 bottom-full mt-2 w-64 bg-white border border-gray-300 shadow-lg rounded p-2 z-10">
                    {tasks.map((task, index) => {
                        const timeEntry = task.timeEntries.filter((entry) => entry.date === day.toISOString().split('T')[0]);
                        if (timeEntry.length > 0) {
                            return (
                                <div key={index} className="mb-2">
                                    <div className="font-semibold">{task.title}</div>
                                    {timeEntry.map((entry, idx) => (
                                        <div key={idx} className="text-sm">
                                            Work: {entry.workHours || 0}h, Overtime: {entry.overtimeHours || 0}h, On Call: {entry.onCallHours || 0}h
                                        </div>
                                    ))}
                                </div>
                            );
                        }
                        return null;
                    })}
                </div>
            )}
        </div>
    );
}
