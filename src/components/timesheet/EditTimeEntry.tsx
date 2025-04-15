import { Task, TimeEntry } from "../../restapi/types";

interface Props {
    selectedDate: string[]
    task: Task
}

export default function EditTimeEntry({ selectedDate, task }: Props) {
    const timeEntries = task.timeEntries.filter((entry) =>
        selectedDate.includes(entry.date)
    );
    return (
        <div>
            {/* {timeEntries.map((entry) => (
                <div key={entry.id} className="p-4 border-b">
                    <p className="text-lg font-semibold">{entry.date}</p>
                </div>
            ))} */}
            {selectedDate.map((date, idx) => (
                <p key={idx}>{date}</p>))}
        </div>
    );
}