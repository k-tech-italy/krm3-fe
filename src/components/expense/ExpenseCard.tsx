import React, {useEffect, useState} from 'react';

import {ExpenseInterface} from "../../restapi/types";
import {convertCurrencyTo} from "../../restapi/expense";
import {Card} from "react-bootstrap";


interface Props {
    expense: ExpenseInterface,
    ShowIdCard: () => void,
}

export function ExpenseCard(props: Props) {
    const [amountBase, setAmountBase] = useState('');

    useEffect(() => {
        convertCurrencyTo('2023-08-23', props.expense.currency, props.expense.amountCurrency || '0', 'EUR').then(res => setAmountBase(prev => res))
    }, [props.expense])

    return (
        <Card border="grey" onClick={props.ShowIdCard} className={`mt-3 w-100 ${!!props.expense.amountReimbursement && parseFloat(props.expense.amountReimbursement) < 1 ? 'border border-danger' : ''}`}>
            <Card.Header>
                <div className='d-flex justify-content-between align-items-center'>
                    <p className='m-0 p-1'>{props.expense.day}</p>
                    <p className='m-0 p-1'>id: {props.expense.id}</p>
                </div>
            </Card.Header>
            <Card.Body>
                <Card.Title className='mb-3'>{props.expense.category.title}</Card.Title>
                    <div className="row mt-2">
                        <div className="col-8">
                            <p className='m-0 p-1'>Importo {props.expense.currency} {props.expense.amountCurrency}</p>
                            <p className='m-0 p-1'>Importo EUR {amountBase}</p>
                        </div>
                        <div className='col-4 d-flex justify-content-center align-items-center'>
                            <i className="icon kt-icon-attach"/>
                        </div>
                    </div>
            </Card.Body>
        </Card>

    );
}
