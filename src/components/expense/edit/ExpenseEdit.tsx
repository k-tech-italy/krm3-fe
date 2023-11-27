import React, { useState } from 'react';
import { ExpenseError, ExpenseInterface } from "../../../restapi/types";
import { useEditExpense } from "../../../hooks/expense";
import { ExpenseEditForm } from "./ExpenseEditForm";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import "react-datepicker/dist/react-datepicker.css";
import "../expense.scss"
import { Alert, Spinner } from "react-bootstrap";
import moment from 'moment';
import { validateExpense } from '../../../utils/validationExpenseForm';

interface Props {
    expense: ExpenseInterface,
    onClose: () => void,
    show: boolean,

}


export function ExpenseEdit(props: Props) {

    const { mutate, isLoading, isSuccess, isError, error } = useEditExpense();
    const [expenseError, setExpenseError] = useState<ExpenseError>();



    function handleExpense(e: ExpenseInterface) {
        mutate({ id: e.id, params: e })
        if (isSuccess) {
            props.onClose()//TODO: CHECK THIS (first call don't close)
        }
    }



    function saveData() {
        if (!props.expense.day) {
            const today = new Date()
            props.expense.day = moment(today).format('YYYY-MM-DD')
        }
        validateExpense(props.expense)
            .then((res) => handleExpense(res))
            .catch((err) => setExpenseError(err))
    }


    return (
        <Modal show={props.show} onHide={props.onClose} dialogClassName="modal-80w">
            <Modal.Header closeButton>
                <Modal.Title>{!props.expense?.id ? 'Add Expense' : 'Edit Expense'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ExpenseEditForm expense={props.expense} error={expenseError} />
            </Modal.Body>
            {isError && (
                <Alert className='m-3' variant='danger'>
                    <p>{error.message}</p>
                </Alert>
            )}
            <Modal.Footer>
                <Button variant="secondary" onClick={props.onClose}>
                    Close
                </Button>
                <Button variant="primary" disabled={isLoading} onClick={saveData}>
                    {isLoading ?
                        <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                            />
                            <span className='px-1'>Loading...</span>
                        </> : (
                            <>Save</>
                        )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
