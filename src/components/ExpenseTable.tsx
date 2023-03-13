import React from 'react';

import { ExpenseInterface } from "../restapi/types";


interface Props {
	props: ExpenseInterface,
	ShowIdCard: () => void,

}

export function ExpenseTable({props, ShowIdCard}: Props) {
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
			<td><a type="button" className="btn btn-primary" data-bs-toggle="modal"
				   data-bs-target="#staticBackdrop"
				   onClick={ShowIdCard}> Edit Expense</a></td>
		</tr>
	);
}
