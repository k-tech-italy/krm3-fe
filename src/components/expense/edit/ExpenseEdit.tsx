import React, { useState } from 'react';
import { Alert, Spinner } from "react-bootstrap";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { ExpenseError, ExpenseInterface } from "../../../restapi/types";
import { useEditExpense } from "../../../hooks/expense";
import { ExpenseEditForm } from "./ExpenseEditForm";
import { validateExpense } from '../../../utils/validationExpenseForm';
import "react-datepicker/dist/react-datepicker.css";
import "../expense.scss"

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
        })

    }

    function saveData() {
        validateExpense(props.expense)
            .then((res) => handleExpense(res))
            .catch((err) => setExpenseError(err))
    }


    return (
        <Modal className='modal' show={props.show} onHide={props.onClose} dialogClassName="modal-80w">
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
