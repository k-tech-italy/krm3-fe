import { useState, useMemo } from "react";
import { Task } from "../../restapi/types";
import { ArrowBigLeft, ArrowBigRight } from "lucide-react";
import Krm3Modal from "../commons/krm3Modal";
import EditTimeEntry from "./EditTimeEntry";
import { TimeSheetTable } from "./TimesheetTable";
import EditDayEntry from "./edit-day/EditDayEntry";

export const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
};

export default function Krm3Calendar() {
    const [selectedCells, setSelectedCells] = useState<Date[] | undefined>();
    const [skippedDays, setSkippedDays] = useState<Date[]>([]);
    const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
    const [openTimeEntryModal, setOpenTimeEntryModal] = useState<boolean>(false);
    const [isDayEntry, setIsDayEntry] = useState<boolean>(false);
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);

    const [currentWeekStart, setCurrentWeekStart] = useState(() => {
        const today = new Date();
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(today.setDate(diff));
    });


    const weekDays = useMemo(() => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(currentWeekStart);
            day.setDate(currentWeekStart.getDate() + i);
            days.push(day);
        }
        return days;
    }, [currentWeekStart]);

    const navigatePrev = () => {
        const newDate = new Date(currentWeekStart);
        newDate.setDate(currentWeekStart.getDate() - 7);
        setCurrentWeekStart(newDate);
    };

    const navigateNext = () => {
        const newDate = new Date(currentWeekStart);
        newDate.setDate(currentWeekStart.getDate() + 7);
        setCurrentWeekStart(newDate);
    };

    // TODO: implement the possibility to add a new task for Staff user
    // const addNewTask = () => {
    //     const newTask: Task = {
    //         id: tasks.length + 1,
    //         title: `New Task ${tasks.length + 1}`,
    //         projectName: "WFP",
    //         startDate: new Date(),
    //         endDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24),
    //         timeEntries: []
    //     };
    //     setTasks([...tasks, newTask]);
    // };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={navigatePrev}
                    className="px-3 py-1 bg-gray-200 rounded cursor-pointer"
                >
                    <ArrowBigLeft />
                </button>
                <span className="font-medium">
                    {formatDate(weekDays[0])} - {formatDate(weekDays[6])}
                </span>
                <button
                    onClick={navigateNext}
                    className="px-3 py-1 bg-gray-200 rounded cursor-pointer"
                >
                    <ArrowBigRight />
                </button>
            </div>

            {/* <div className="flex justify-between items-center mb-4">
                <button
                    onClick={addNewTask}
                    className="px-4 py-2 bg-yellow-500 text-white rounded"
                >
                    Add New Task
                </button>
            </div> */}
            <TimeSheetTable
                setOpenTimeEntryModal={setOpenTimeEntryModal}
                setSelectedTask={setSelectedTask}
                setSelectedCells={setSelectedCells}
                setSkippedDays={setSkippedDays}
                setIsDayEntry={setIsDayEntry}
                setStartDate={setStartDate}
                weekDays={weekDays}
            />
            {openTimeEntryModal && selectedCells && selectedTask && startDate && (
                <Krm3Modal
                    open={openTimeEntryModal}
                    onClose={() => { setOpenTimeEntryModal(false); setSelectedCells(undefined) }}
                    children={
                        <>
                            {
                                isDayEntry ? (
                                    <EditDayEntry selectedDays={selectedCells} skippedDays={skippedDays} onClose={() => { setOpenTimeEntryModal(false); setSelectedCells(undefined) }} />
                                ) : (
                                    <EditTimeEntry selectedDate={selectedCells} startDate={startDate} task={selectedTask} closeModal={() => { setOpenTimeEntryModal(false) }} />
                                )}
                        </>
                    }
                    title={isDayEntry ? "Day Entry" : "Time Entry"}
                />
            )}
        </div>
    );
}