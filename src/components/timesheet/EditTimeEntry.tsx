import { Task, TimeEntry } from "../../restapi/types";
import React, { useState } from "react";
import { ChevronDown, Trash2 } from 'lucide-react';
import { formatDate } from "./Krm3Calendar";
import ConfirmationModal from "../commons/ConfirmationModal.tsx";

interface Props {
    selectedDates: Date[]
    task: Task
    timeEntries: TimeEntry[]
    startDate: Date
    closeModal: () => void
}

export default function EditTimeEntry({ selectedDates, task, timeEntries, closeModal, startDate }: Props) {

    const formattedStartDate = startDate.getFullYear() + "-" +
        String(startDate.getMonth() + 1).padStart(2, '0') + "-" +
        String(startDate.getDate()).padStart(2, '0');

    const startEntry = timeEntries.find(item => item.date === formattedStartDate);

    const [timeEntryData, setTimeEntryData] = useState(
        {
            workHours: startEntry ? startEntry.workHours : '8',
            overtimeHours: startEntry ? startEntry.overtimeHours : '0',
            travelHours: startEntry ? startEntry.travelHours : '0',
            onCallHours: startEntry ? startEntry.onCallHours : '0',
            restHours: startEntry ? startEntry.restHours : '0'
        })
    const hoursLabel: Record<keyof typeof timeEntries, string> = {
        workHours: 'Worked hours',
        overtimeHours: 'Overtime hours',
        travelHours: 'Travel hours',
        onCallHours: 'On-call hours',
        restHours: 'Rest hours'
    }

    const [comment, setComment] = useState(startEntry ? startEntry.comment : '')
    const times = [1, 2, 4, 8];

    const shouldDetailedViewBeOpenedOnFormLoad = (!!startEntry && (!times.includes(Number(startEntry.workHours)) ||
    startEntry.restHours != 0 || startEntry.onCallHours != 0 || startEntry.travelHours != 0 || startEntry.overtimeHours != 0))

    const [isDetailedViewOpened, setIsDetailedViewOpened] = useState<boolean>(shouldDetailedViewBeOpenedOnFormLoad)

    const [invalidTimeFormat, setInvalidTimeFormat] = useState<string[]>([]);

    const [totalHoursExceeded, setTotalHoursExceeded] = useState(false);

    const [daysWithTimeEntries, setDaysWithTimeEntries] = useState(
        timeEntries ? selectedDates.filter(selectedDate => timeEntries.find(
            timeEntry => timeEntry.date == selectedDate.toLocaleDateString('sv-SE').slice(0, 10))) : []
    )

    const isClearButtonVisible = (
        daysWithTimeEntries.filter(day => day.toLocaleDateString('sv-SE') != startDate.toLocaleDateString('sv-SE')).length > 0 ||
        daysWithTimeEntries.length == 1 && daysWithTimeEntries[0].toLocaleDateString('sv-SE') == startDate.toLocaleDateString('sv-SE')
    )

    const [isClearModalOpened, setIsClearModalOpened] = useState(false)


    const validateInput = (numberOfHours: string, key: keyof typeof timeEntries) =>
    {
        if (invalidTimeFormat.includes(key)) {
            setInvalidTimeFormat(invalidTimeFormat.filter((item) => item !== key))
        }

        const value = parseFloat(numberOfHours);
        let isFormatValid = true;

        for (const character of numberOfHours)
        {
            if (!'1234567890.'.includes(character))
            {
                isFormatValid = false;
            }
        }
        if (isNaN(value)) isFormatValid = false;

        if(!Number.isInteger(value * 4))
        {
            isFormatValid = false;
        }

        if (!isFormatValid)
        {
            setInvalidTimeFormat([...invalidTimeFormat, key])
        }

    }

    const handleChangeHourInput = (value: string, key: keyof typeof timeEntries) => {
        setTimeEntries({ ...timeEntries, [key]: value })

        setTotalHoursExceeded(false)

        validateInput(value, key);

        const totalHours = Number(Object.values({ ...timeEntries, [key]: value }).reduce((acc, curr) => Number(acc) + Number(curr), 0))
        if (totalHours > 24) {
            setTotalHoursExceeded(true)
        }

    }

    const submit = async () => {
        //TODO add api call when be is ready
    }

    return (
        <div className="flex flex-col space-y-6">
            <ConfirmationModal
                open={isClearModalOpened}
                onConfirm={() => setIsClearModalOpened(false)}
                content={`Are you sure to clear time entries for these days?:
                ${daysWithTimeEntries.map(day => formatDate(day)).join(', ')}
                `}
                title="Clear days"
                onClose={() => setIsClearModalOpened(false)}/>
            <div className="flex flex-col sm:flex-row items-start sm:items-center">
                <label className="sm:w-1/4 font-semibold mb-2 sm:mb-0">Selected days</label>
                <div className="sm:w-2/4 w-full flex flex-wrap">
                    {selectedDates.map((date, idx) => (
                        <p key={idx}
                           className='mr-3'>{formatDate(date)}{idx !== selectedDates.length - 1 ? ',' : ''}
                        </p>))}
                </div>
            </div>

            {isClearButtonVisible &&
                <div className="flex flex-col sm:flex-row items-start sm:items-center">
                    <label className="sm:w-1/4 font-semibold mb-2 sm:mb-0">Days with time entries</label>
                    <div className="sm:w-2/4 w-full flex flex-wrap">
                        {daysWithTimeEntries.map((day, idx) => (
                            <p key={idx}
                               className='mr-3'>{formatDate(day)}{idx !== selectedDates.length - 1 ? ',' : ''}
                            </p>))}
                    </div>
                    <button className='px-4 py-2 text-white rounded-lg focus:outline-none bg-red-500 ml-auto mr-5 hover:bg-red-600'
                    onClick={() => {setIsClearModalOpened(true)}}>
                        <Trash2/>
                    </button>
                </div>
            }

            <div className="flex flex-col sm:flex-row items-start sm:items-center">
                <label className="sm:w-1/4 font-semibold mb-2 sm:mb-0">Worked hours</label>
                <div className="sm:w-2/4 w-full justify-between gap-2">
                    {times.map((time, idx) => (
                        <button
                            key={idx}
                            className={`border rounded-md py-2 w-[24%] cursor-pointer mr-[1%] border-gray-300
                            ${Number(timeEntries.workHours) == time ? "bg-yellow-100 border-yellow-500 text-yellow-700" : 
                                "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                            onClick={() => {
                                setTimeEntries({...timeEntries, workHours: String(time)})
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
                            <ChevronDown className="ml-auto"/>
                        </button>
                    </div>
                    {isDetailedViewOpened && (
                        <div className="pb-5">
                            {(Object.keys(timeEntries) as Array<keyof typeof timeEntries>).map((key) => (
                                <div className="px-3" key={key}>
                                    <p className="font-bold mt-1">{hoursLabel[key]}</p>
                                    <input
                                        className={`border rounded-md p-2 cursor-pointer w-[100%] border-gray-300
                                        ${(invalidTimeFormat.includes(key)) ? 'border border-red-500' : ''}`}
                                        type="text"
                                        value={timeEntries[key]}
                                        onChange={(e) => {
                                            handleChangeHourInput(e.target.value, key)
                                        }
                                        }
                                        onBlur={(e) => {
                                            if (e.target.value === '') {
                                                setTimeEntries({...timeEntries, [key]: '0'})
                                                handleChangeHourInput('0', key)
                                            }
                                        }}
                                    />
                                    {invalidTimeFormat.includes(key) && (
                                        <p className='text-red-500 mt-2'>
                                            Invalid value (must be 0-0.25 ecc..)
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
            {isClearButtonVisible && !(daysWithTimeEntries.length == 1 && daysWithTimeEntries[0].toLocaleDateString('sv-SE') == startDate.toLocaleDateString('sv-SE'))
                && <p className='text-red-500 mt-2'>
                Please clear time entries first
            </p>}

            <div className="flex justify-end items-center p-6 space-x-4">
                <button
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none"
                    onClick={closeModal}
                >Close
                </button>

                <button
                    className={`px-4 py-2 text-white rounded-lg focus:outline-none
                    ${(invalidTimeFormat.length > 0 ||
                    (isClearButtonVisible &&
                        !(daysWithTimeEntries.length == 1 && daysWithTimeEntries[0].toLocaleDateString('sv-SE') == startDate.toLocaleDateString('sv-SE')))) 
                        ? 'bg-gray-300 cursor-not-allowed' :
                        'bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500'}`}

                    onClick={async () => {
                        await submit()
                    }}
                    disabled={invalidTimeFormat.length > 0 || (isClearButtonVisible
                && daysWithTimeEntries.length == 1 && daysWithTimeEntries[0].toLocaleDateString('sv-SE') == startDate.toLocaleDateString('sv-SE'))}
                >Save
                </button>
            </div>

        </div>
    );
}