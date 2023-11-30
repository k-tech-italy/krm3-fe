import React, {useEffect, useState} from 'react';

import {ExpenseInterface} from "../../restapi/types";
import {convertCurrencyTo} from "../../restapi/expense";



interface Props {
    expense: ExpenseInterface,
    ShowIdCard: () => void,

}

export function ExpenseTable(props: Props) {

    const [amountBase, setAmountBase] = useState('');

    useEffect(() =>{
        convertCurrencyTo('2023-08-23', props.expense.currency, props.expense.amountCurrency || '0', 'EUR').then(res => setAmountBase(prev => res))
    },[props.expense])

    return (
        <tr>
            <td scope="row">
                <p className='mt-3'>{props.expense.id}</p>
            </td>
            <td>
                <p className='mt-3'>{props.expense.day}</p>
            </td>
            <td>
                <p className='mt-3'>{props.expense.category.str}</p>
            </td>
            <td>
                <p className='mt-3'>{props.expense.currency} {props.expense.amountCurrency}</p>
            </td>
            <td><p className='mt-3'>{amountBase}</p></td>
            <td><p className='mt-3'>90</p></td>
            <td><p className={`mt-3 ${!!props.expense.amountReimbursement && parseFloat(props.expense.amountReimbursement) < 1 ? 'text-danger' : ''}`}>{props.expense.amountReimbursement}</p></td>
            <td>
                <p className='mt-3'>{props.expense.paymentType.str}</p>
            </td>
            <td>
                <div>{props.expense.paymentType.active ? (
                    <p className='mt-3 fw-bold'>PAID</p>
                ) : (
                    <p className='mt-3 fw-bold'>NO PAID</p>
                )}
                </div>
            </td>
            <td className='align-middle'><a type="button" className="btn btn-primary"
                   onClick={props.ShowIdCard}> Edit Expense</a></td>
        </tr>
    );
}