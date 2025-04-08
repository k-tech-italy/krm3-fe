import React, {useEffect, useState} from 'react';

import {ExpenseInterface} from "../../restapi/types";
import {convertCurrencyTo} from "../../restapi/expense";
import "./expense.css";



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
                <p className='m-0'>{props.expense.id}</p>
            </td>
            <td>
                <p className='m-0'>{props.expense.day}</p>
            </td>
            <td>
                <p className='m-0'>{props.expense.category.title}</p>
            </td>
            <td>
                <p className='m-0'>{props.expense.currency} {props.expense.amountCurrency}</p>
            </td>
            <td><p className='m-0'>{amountBase}</p></td>
            <td><p className='m-0'>90</p></td>
            <td><p className={`m-0 ${!!props.expense.amountReimbursement && parseFloat(props.expense.amountReimbursement) < 1 ? 'text-danger' : ''}`}>{props.expense.amountReimbursement}</p></td>
            <td>
                <p className='m-0'>{props.expense.paymentType.title}</p>
            </td>
            <td>
                <div>{props.expense.paymentType.active ? (
                    <p className='m-0 fw-bold'>PAID</p>
                ) : (
                    <p className='m-0 fw-bold'>NO PAID</p>
                )}
                </div>
            </td>
            <td className='align-middle'><a type="button"
                   onClick={props.ShowIdCard}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pen" viewBox="0 0 16 16">
                   <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708l-1.585-1.585z"/>
                 </svg></a></td> 
        </tr>
    );
}