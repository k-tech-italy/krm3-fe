import React, { useState } from 'react';
import { ExpenseError, ExpenseInterface } from "../../../restapi/types";
import { useEditExpense } from "../../../hooks/useExpense";
import { ExpenseEditForm } from "./ExpenseEditForm";
import { validateExpense } from '../../../utils/validationExpenseForm';
import "react-datepicker/dist/react-datepicker.css";
import "../expense.css";
import Krm3Modal from '../../commons/krm3Modal';

interface Props {
    expense: ExpenseInterface,
    onClose: () => void,
    show: boolean,
}

export function ExpenseEdit(props: Props) {
    const { mutate, isLoading, isError, error } = useEditExpense();
    const [expenseError, setExpenseError] = useState<ExpenseError>();

    function handleExpense(e: ExpenseInterface) {
        mutate({ id: e.id, params: e }, {
            onSuccess: () => props.onClose()
        });
    }

    function saveData() {
        validateExpense(props.expense)
            .then((res) => handleExpense(res))
            .catch((err) => setExpenseError(err));
    }

    if (!props.show) return null;

    return (
        <Krm3Modal open={props.show} onClose={props.onClose} title={!props.expense?.id ? 'Add Expense' : 'Edit Expense'}>
            <>
            <ExpenseEditForm expense={props.expense} error={expenseError} />
            {isError && (
                <div className="alert alert-danger">
                    <p>{error.message}</p>
                </div>
            )}
            <div className="flex justify-end items-center p-6 space-x-4">
                <button
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none"
                    onClick={props.onClose}
                >
                    Close
                </button>
                <button
                    className={`px-4 py-2 text-white rounded-lg focus:outline-none ${isLoading
                        ? 'bg-yellow-400 cursor-not-allowed'
                        : 'bg-krm3-primay hover:bg-krm3-primary-dark'
                        }`}
                    disabled={isLoading}
                    onClick={saveData}
                >
                    {isLoading ? (
                        <div className="flex items-center">
                            <div className="spinner-border animate-spin inline-block w-4 h-4 border-2 rounded-full mr-2" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <>Save</>
                    )}
                </button>
            </div>
            </>
        </Krm3Modal>
    );
}
