import React, {useEffect, useState} from 'react';

import {ExpenseInterface} from "../restapi/types";


interface Props {
    props: ExpenseInterface,
}


export function ExpenseEdit({props}: Props) {

    const [dataExpense, setDataExpense] = useState(props.dataExpense);
    const [category, setCategory] = useState(props.category);
    const [currency, setCurrency] = useState(props.currency);
    const [currencyAmount, setCurrencyAmount] = useState(props.currencyAmount);
    const [currencyEUR, setCurrencyEUR] = useState(props.currencyEUR);
    const [isPaid, setIsPaid] = useState(props.isPaid);
    const [typeOfPayment, setTypeOfPayment] = useState(props.typeOfPayment);


    useEffect(() => {
        setDataExpense(props.dataExpense);
        setCurrency(props.currency);
        setCategory(props.category);
        setCurrencyAmount(props.currencyAmount);
        setCurrencyEUR(props.currencyEUR);
        setIsPaid(props.isPaid);
        setTypeOfPayment(props.typeOfPayment);
    }, [props])


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
                        <div>
                            <form>
                                <div className="mb-3 row">
                                    <label className="col-sm-4 col-form-label">Data spesa</label>
                                    <div className="col-sm-5">
                                        <input className="form-control" onChange={(e) => setDataExpense(e.target.value)}
                                               value={dataExpense}/>
                                    </div>
                                </div>
                                <div className="mb-3 row d-flex align-items-center">
                                    <label className="col-sm-4 col-form-label">Categoria</label>
                                    <div className="col-sm-5  ">
                                        <input className="form-control" onChange={(e) => setCategory(e.target.value)}
                                               value={category}/>
                                    </div>
                                </div>
                                <div className="mb-3 row d-flex align-items-center ">
                                    <label className="col-sm-4 col-form-label">Tipo Documento</label>
                                    <div className="col-sm-5 ">
                                        <input className="form-control" value='scontrino'/>
                                    </div>
                                </div>
                                <div className="mb-3 row d-flex align-items-center">
                                    <label className="col-sm-4 col-form-label">Dettaglio</label>
                                    <div className="col-sm-8">
                                        <input className="form-control"/>
                                    </div>
                                </div>
                                <div className="mb-3 row d-flex align-items-center">
                                    <label className="col-sm-4 col-form-label">Conto d'uscita</label>
                                    <div className="col-sm-3">
                                        <input className="form-check-input" type="radio"
                                        />
                                        <label className="form-check-label" htmlFor="flexRadioDefault1">
                                            Azienda
                                        </label>
                                    </div>
                                    <div className="col-sm-4 d-flex align-items-center">
                                        <input className="form-check-input" type="radio"
                                        />
                                        <label className="form-check-label" htmlFor="flexRadioDefault1">
                                            Risorsa
                                        </label>
                                    </div>
                                </div>
                                <div className="mb-3 row d-flex align-items-center ">
                                    <label className="col-sm-4 col-form-label">Tipo di Pagamento</label>
                                    <div className="col-sm-5 ">
                                        <input className="form-control"
                                               onChange={(e) => setTypeOfPayment(e.target.value)}
                                               value={typeOfPayment}/>
                                    </div>
                                </div>
                                <div className="mb-3 row d-flex align-items-center">
                                    <label className="col-sm-4 col-form-label">Importo</label>
                                    <div className="col-sm-3 ">
                                        <input type="number" step="0.01" className="form-control text-end"
                                               value={currencyAmount}/>
                                    </div>
                                    <div className="col-sm-2 ">
                                        <input className="form-control" onChange={(e) => setCurrency(e.target.value)}
                                               value={currency}/>
                                    </div>
                                </div>
                                <div className="mb-3 row d-flex align-items-center">
                                    <label className="col-sm-4 col-form-label">Importo in €</label>
                                    <div className="col-sm-3 ">
                                        <input type="number" step="0.01" className="form-control text-end"

                                               value={currencyEUR}/>
                                    </div>
                                </div>
                                <div className="mb-3 row d-flex align-items-center">
                                    <label htmlFor="disabledTextInput" className="col-sm-4 col-form-label">Importo
                                        rimborso in €</label>
                                    <div className="col-sm-3 ">
                                        <input className="form-control text-end" id="disabledTextInput"
                                               placeholder="Disabled input"
                                               value={currencyEUR}/>
                                    </div>
                                    <label className="col-sm-4 col-form-label">Azienda {currencyEUR} €</label>
                                </div>
                                <div className="mb-3 row d-flex align-items-center justify-content-md-end">
                                    <div className="col-sm-4">
                                        <div className="form-check form-switch">
                                            <input className="form-check-input" type="checkbox"/>
                                            <label className="form-check-label">Approvazione</label>
                                        </div>

                                    </div>

                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close
                                    </button>
                                    <button type="button" className="btn btn-primary">Save changes</button>
                                </div>


                            </form>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
