import React from 'react';
import {Expense} from "../Utilities";

interface Props {
    props: Expense
}

export function ExpenseTable({props}: Props) {

    return (
        <tr>
            <th scope="row">{props.id}</th>
            <td>{props.dataExpense}</td>
            <td><h5 className="card-title">{props.category}</h5>
            </td>
            <td><p><strong>{props.currency} </strong>{props.currencyAmount}</p>
            </td>
            <td><p><strong>EUR </strong>{props.currencyEUR}</p>
            </td>
            <td>
                <p>{props.typeOfPayment}</p>
            </td>
            <td>
                <p>{props.isPaid ? (
                    <h5>PAID</h5>
                ) : (
                    <h5>NO PAID</h5>
                )}
                </p>
            </td>
        </tr>

    )


}
