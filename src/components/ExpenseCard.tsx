import React from 'react';

import {ExpenseInterface} from "../Utilities";


interface Props {
    props: ExpenseInterface,
    ShowIdCard: () => void,
}

export function ExpenseCard({props, ShowIdCard}: Props) {


    return (
        <div className="card mb-3">
            <a data-bs-toggle="modal"
               data-bs-target="#staticBackdrop"
               onClick={ShowIdCard}>
                <div className="card-body mt-2">
                    <div className="row">
                        <div className="col">
                            <p>{props.dataExpense}</p>
                        </div>
                        <div className="col">
                            <h5 className="card-title">{props.category}</h5>
                        </div>
                        <div className="col">

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
                            ) : (
                                <h5>NO PAID</h5>
                            )}
                        </div>
                    </div>
                </div>
            </a>
        </div>
    );

}
