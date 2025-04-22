import { Info } from "lucide-react";
import { Task, TimeEntry } from "../../restapi/types";
import { useState } from "react";

interface Props {
    day: Date;
    timeEntries?: TimeEntry[];
    isMonthView?: boolean;
    isColumnView?: boolean;
}

export function TotalHourCell({ day, timeEntries, isMonthView, isColumnView }: Props) {
    const [showTooltip, setShowTooltip] = useState<boolean>(false);

    if (!timeEntries) {
        return <div className="bg-gray-100">0h</div>;
    }

    const totalHour = timeEntries.reduce((acc: number, timeEntry: TimeEntry) => {
        if (timeEntry.date === day.toISOString().split('T')[0]) {
            return acc
                + (Number(timeEntry.workHours) || 0)
                + (Number(timeEntry.overtimeHours) || 0)
                + (Number(timeEntry.onCallHours) || 0);
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
            className="relative bg-gray-100 justify-center flex flex-col h-full w-full"
        >
            <div className={`bg-gray-100 font-semibold ${isMonthView ? 'text-xs' : 'text-sm'} flex  justify-center items-center h-full w-full`}>
            
                {totalHour} h
                {totalHour > 0 && !isMonthView && (
                    <Info size={isMonthView ? 8 : 20} color="blue"
                        className="cursor-pointer mx-2"
                    />
                )}
            </div>
            {showTooltip && (
                <div className="absolute left-0 bottom-full mt-2 w-64 bg-white border border-gray-300 shadow-lg rounded z-10">
                    {timeEntries.map((timeEntry: TimeEntry, index: number) => {
                        if (timeEntry.date === day.toISOString().split('T')[0]) {
                            return (
                                <div key={index} className="mb-2">
                                    <div className="font-semibold">Task</div>
                                    <div className="text-sm">
                                        Work: {timeEntry.workHours || 0}h, Overtime: {timeEntry.overtimeHours || 0}h, On Call: {timeEntry.onCallHours || 0}h
                                    </div>
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
