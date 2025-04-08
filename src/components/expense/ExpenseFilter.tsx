import React, { useState } from 'react';
import { ExpenseInterface } from '../../restapi/types';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

//TODO FIX: when click on button scroll up

interface Props {
    handleFilter: (e: any) => void,
    data: ExpenseInterface[],
}

export default function ExpenseFilter(props: Props) {
    const today = new Date();
    const [fromDate, setFromDate] = useState<Date>();
    const [toDate, setToDate] = useState<Date>();
  
    function handleFilterDate(fromDate: Date, toDate?: Date) {
        const res = props.data.filter((expense) => {
            const dataExpense = new Date(expense.day);
            return dataExpense >= fromDate && dataExpense <= (!!toDate ? toDate : today);
        });
        props.handleFilter(res);
    }

    return (
        <>
            <div className="my-4">
                <form className="flex flex-wrap">
                    <div className="w-full md:w-1/3 px-2 mb-4 md:mb-0">
                        <label className="block text-sm font-medium mb-1">Dal giorno:</label>
                        <DatePicker
                            selected={!!fromDate ? fromDate : today}
                            className="w-full border border-gray-300 rounded-md p-2"
                            onChange={(date: Date | null) => {
                                if (!!date) {
                                    setFromDate(date);
                                }
                            }}
                        />
                    </div>
                    <div className="w-full md:w-1/3 px-2 mb-4 md:mb-0">
                        <label className="block text-sm font-medium mb-1">Al giorno:</label>
                        <DatePicker
                            selected={!!toDate ? toDate : today}
                            className="w-full border border-gray-300 rounded-md p-2"
                            onChange={(date: Date | null) => {
                                if (!!date) {
                                    setToDate(date);
                                }
                            }}
                        />
                    </div>
                    <div className="w-full md:w-1/3 px-2 flex items-end">
                        <button
                            type="button"
                            className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-400"
                            onClick={() => {
                                if (fromDate) {
                                    handleFilterDate(fromDate, toDate);
                                }
                            }}
                        >
                            Filtra
                        </button>
                        <button
                            type="button"
                            className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-400 ml-2"
                            onClick={() => {
                                setFromDate(undefined);
                                setToDate(undefined);
                                props.handleFilter(undefined);
                            }}
                        >
                            Reset
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
