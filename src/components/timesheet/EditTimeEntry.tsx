import { Task, TimeEntry } from "../../restapi/types";
import React, { useRef, useState } from "react";
import { ChevronDown } from 'lucide-react';
import { formatDate } from "./Krm3Calendar";

interface Props {
    selectedDate: Date[]
    task: Task
    startDate: Date
    closeModal: () => void
}

export default function EditTimeEntry({ selectedDate, task, closeModal, startDate }: Props) {
    // const timeEntries = task.timeEntries.filter((entry) =>
    //     selectedDate.includes(entry.date)
    // );

    const [timeEntries, setTimeEntries] = useState(
        {
            workHours: '8',
            overtimeHours: '0',
            travelHours: '0',
            onCallHours: '0',
            restHours: '0'
        })
    const hoursLabel: Record<keyof typeof timeEntries, string> = {
        workHours: 'Worked hours',
        overtimeHours: 'Overtime hours',
        travelHours: 'Travel hours',
        onCallHours: 'On-call hours',
        restHours: 'Rest hours'
    }

    const [comment, setComment] = React.useState('')


    const [isDetailedViewOpened, setIsDetailedViewOpened] = React.useState(false)

    const times = [1, 2, 4, 8];


    const [invalidTimeFormat, setInvalidTimeFormat] = useState<string[]>([]);
    const [invalidTimeRange, setInvalidTimeRange] = useState<string[]>([]);


    const [totalHoursExceeded, setTotalHoursExceeded] = useState(false);


    const validateHoursFormat = (numberOfHours: string): boolean => {
        const value = parseFloat(numberOfHours);

        for (const character of numberOfHours) {
            if (!'1234567890.'.includes(character)) {
                return false;
            }
        }
        if (isNaN(value)) return false;

        return Number.isInteger(value * 4);
    }
    const validateHoursRange = (numberOfHours: string): boolean => {
        const value = parseFloat(numberOfHours);

        if (value < 0 || value > 24)
            return false;
        else
            return true
    }

    const handleChangeHourInput = (value: string, key: keyof typeof timeEntries) => {
        setTimeEntries({ ...timeEntries, [key]: value })

        setTotalHoursExceeded(false)

        if (invalidTimeFormat.includes(key)) {
            setInvalidTimeFormat(invalidTimeFormat.filter((item) => item !== key))
        }
        if (invalidTimeRange.includes(key)) {
            setInvalidTimeRange(invalidTimeRange.filter((item) => item !== key))
        }

        const totalHours = Object.values({ ...timeEntries, [key]: value }).reduce((acc, curr) => acc + Number(curr), 0)
        if (totalHours > 24) {
            setTotalHoursExceeded(true)
        }

        if (!validateHoursFormat(value)) {
            setInvalidTimeFormat([...invalidTimeFormat, key])
        }
        else if (!validateHoursRange(value)) {
            setInvalidTimeRange([...invalidTimeRange, key])
        }

    }

    const submit = async () => {
        //TODO add api call when be is ready
    }

    return (
        <div className="flex flex-col space-y-6">

            <div className="flex flex-col sm:flex-row items-start sm:items-center">
                <label className="sm:w-1/4 font-semibold mb-2 sm:mb-0">Selected days</label>
                <div className="sm:w-2/4 w-full flex flex-wrap">
                    {selectedDate.map((date, idx) => (
                        <p key={idx} className='mr-3'>{formatDate(date)}{idx !== selectedDate.length - 1 ? ',' : ''}</p>))}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center">
                <label className="sm:w-1/4 font-semibold mb-2 sm:mb-0">Worked hours</label>
                <div className="sm:w-2/4 w-full justify-between gap-2">
                    {times.map((time, idx) => (
                        <button
                            key={idx}
                            className={`border rounded-md py-2 w-[24%] cursor-pointer mr-[1%] border-gray-300
                            ${Number(timeEntries.workHours) == time ? "bg-yellow-100 border-yellow-500 text-yellow-700" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                            onClick={() => {
                                setTimeEntries({ ...timeEntries, workHours: String(time) })
                            }}>
                            {time}
                        </button>
                    ))}

                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start">
                <label className="sm:w-1/4 font-semibold mb-2 sm:mb-0 mt-2">More</label>

                <div className="sm:w-2/4 p-2 border mt-3 rounded-md opacity-80 border-gray-300 ">
                    <div className="flex flex-column">
                        <button className="h-full hover:cursor-pointer ml-auto px-4 w-full flex"
                            onClick={() => {
                                setIsDetailedViewOpened(!isDetailedViewOpened)
                            }}>
                            {!isDetailedViewOpened && (
                                <p>Open for details...</p>
                            )}
                            <ChevronDown className="ml-auto" />
                        </button>
                    </div>
                    {isDetailedViewOpened && (
                        <div className="pb-5">
                            {(Object.keys(timeEntries) as Array<keyof typeof timeEntries>).map((key) => (
                                <div className="px-3" key={key}>
                                    <p className="font-bold mt-1">{hoursLabel[key]}</p>
                                    <input
                                        className={`border rounded-md p-2 cursor-pointer w-[100%]
                                        ${(invalidTimeFormat.includes(key) || invalidTimeRange.includes(key)) ? 'border border-red-500' : ''}`}
                                        type="text"
                                        value={timeEntries[key]}
                                        onChange={(e) => {
                                            handleChangeHourInput(e.target.value, key)
                                        }
                                        }
                                        onBlur={(e) => {
                                            if (e.target.value === '') {
                                                setTimeEntries({ ...timeEntries, [key]: '0' })
                                                handleChangeHourInput('0', key)
                                            }
                                        }}
                                    />
                                    {invalidTimeFormat.includes(key) && (
                                        <p className='text-red-500 mt-2'>
                                            Invalid value (must be 0-0.25 ecc..)
                                        </p>)}
                                    {invalidTimeRange.includes(key) && (
                                        <p className='text-red-500 mt-2'>
                                            Invalid value (must be &gt;= 0 and &lt;= 24)
                                        </p>)}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>



            {totalHoursExceeded && (
                <p className='text-red-500 mt-2'>
                    The total number of hours cannot exceed 24.
                </p>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center">
                <label className="sm:w-1/4 font-semibold mb-2 sm:mb-0">Comment</label>
                <div className="sm:w-2/4 w-full">
                    <textarea className=" w-full border rounded-md p-2 border-gray-300"
                        value={comment}
                        onChange={(e) => {
                            setComment(e.target.value)
                        }}>
                    </textarea>

                </div>
            </div>


            <div className="flex justify-end items-center p-6 space-x-4">
                <button
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none"
                    onClick={closeModal}
                >Close
                </button>

                <button
                    className={`px-4 py-2 text-white rounded-lg focus:outline-none
                    ${(invalidTimeFormat.length > 0) ? 'bg-gray-300 cursor-not-allowed' :
                            'bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500'}`}

                    onClick={async () => {
                        await submit()
                    }}
                    disabled={invalidTimeFormat.length > 0}
                >Save
                </button>
            </div>

        </div>
    );
}