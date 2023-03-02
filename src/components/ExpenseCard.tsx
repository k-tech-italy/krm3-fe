import React from 'react';
import {Expense} from "../Utilities";


interface Props {
    props: Expense
}

export function ExpenseCard({props}: Props) {

    return (
        <div className="card mb-3">
            <div className="card-body mt-2">
                <div className="row">
                    <div className="col">
                        <p>{props.dataExpense}</p>
                    </div>
                    <div className="col">
                        <h5 className="card-title">{props.category}</h5>
                    </div>
                    <div className="col">
                        <a href="#" className="btn btn-primary">ticket</a>
                    </div>
                </div>
                <div className="row mt-2">
                    <div className="col">
                        <p><strong>{props.currency} </strong>{props.currencyAmount}</p>
                    </div>
                    <div className="col">
                        <div className="row">
                            <p><strong>EUR </strong>{props.currencyEUR}</p>
                        </div>
                    </div>
                    <div className="col">
                        {props.isPaid ? (
                            <h5>PAID</h5>
                        ):(
                            <h5>NO PAID</h5>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

}
