import React from 'react';
import {ExpenseInterface} from "../Utilities";


interface Props {
    props: ExpenseInterface,

}

export function ExpenseEdit({props}: Props) {

    if (props.id != 0) {
        return (
            <div className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false"
                 aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Edit Expense</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"
                                    aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="row">
                                <div className="row">
                                    <div className="col">
                                        <p>Date</p>
                                    </div>
                                    <div className="col">
                                        <p className="card-title">{props.dataExpense}</p>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col">
                                        <p>Category</p>
                                    </div>
                                    <div className="col">
                                        <p className="card-title">{props.category}</p>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col">
                                        <p>Currency Amount</p>
                                    </div>
                                    <div className="col">
                                        <p>{props.currency} {props.currencyAmount}</p>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col">
                                        <p>Currency Eur</p>
                                    </div>
                                    <div className="col">
                                        <p>EUR {props.currencyEUR}</p>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col">
                                        <p>Type of payment</p>
                                    </div>
                                    <div className="col">
                                        <p>{props.typeOfPayment}</p>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col">
                                        {props.isPaid ? (
                                            <h5>PAID</h5>
                                        ) : (
                                            <h5>NO PAID</h5>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close
                                </button>
                                <button type="button" className="btn btn-primary">Save changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        );

    }
    return (
        <div className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false"
             aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="exampleModalLabel">Edit Expense</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div>Form Add Expense</div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary">Save changes</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )


}
