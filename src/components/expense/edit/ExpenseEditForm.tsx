import React, { useEffect, useState } from 'react';
import { ExpenseError, ExpenseInterface, TypeOfDocument } from "../../../restapi/types";
import DatePicker from "react-datepicker";
import { useGetCategories, useGetCurrencies, useGetDocumentType, useGetTypeOfPayment } from "../../../hooks/expense";

import "react-datepicker/dist/react-datepicker.css";
import "../expense.scss"
import moment from "moment";
import { convertCurrencyTo } from "../../../restapi/expense";
import LimitBudget from "./LimitBudget";

interface Props {
    expense: ExpenseInterface,
    error?: ExpenseError
}

export function ExpenseEditForm(props: Props) {

    const [expenseEdit, setExpenseEdit] = useState<ExpenseInterface>(props.expense);
    const [error, setError] = useState<ExpenseError | undefined>(props.error)
    const [amountError, setAmountError] = useState(false);
    const [amountBase, setAmountBase] = useState('');
    const [uploadedImage, setUploadedImage] = useState<FileList | null>();
    const currencyList = useGetCurrencies();
    const typeOfPaymentList = useGetTypeOfPayment();
    const categoryList = useGetCategories();
    const typeOfDocumentList = useGetDocumentType();



    useEffect(() => {
        setExpenseEdit(prev => props.expense)
    }, [props.expense])
    useEffect(() => {
        setError(prev => props.error)
    }, [props.error])


    function handleCurrencyAmount(e: any) {
        //convert currency and check error refund < amount
        const today = new Date()
        console.log(e.target.value)
        convertCurrencyTo('2023-08-23', props.expense.currency, e.target.value, 'EUR').then(res => {
            setAmountBase(prev => res);
            setAmountError(false);
        }).catch(() => setAmountError(true))

        props.expense.amount_currency = e.target.value
        props.expense.amount_base = amountBase
        delete error?.amount_currency
        setExpenseEdit({ ...expenseEdit, amount_currency: e.target.value });
        /*if (parseInt(e.target.value) > parseInt(props.expense?.amount_reimbursement || '')) {
            setAmountError(true);
        } else {
            setAmountError(false);
        }*/
    }


    function handleSelectTypeOfPayment(e: any) {
        if (!!typeOfPaymentList) {
            const selected = typeOfPaymentList.results.filter(payment => payment.id === Number(e.target.value)).at(0) || props.expense.payment_type;
            props.expense.payment_type = selected;
            delete error?.payment_type
            setExpenseEdit({ ...expenseEdit, payment_type: selected });
        }
    }

    function handleSelectTypeOfDocument(e: any) {
        if (!!typeOfDocumentList) {
            const selected = typeOfDocumentList.results.filter(document => document.id === Number(e.target.value)).at(0) || props.expense.document_type;
            props.expense.document_type = selected; // { id: selected.id } as TypeOfDocument
            delete error?.document_type
            setExpenseEdit({ ...expenseEdit, document_type: selected });
        }
    }

    function handleSelectCategory(e: any) {
        if (!!categoryList) {
            const selected = categoryList.results.filter(category => category.id === Number(e.target.value)).at(0) || props.expense.category;
            props.expense.category = selected;
            delete error?.category
            setExpenseEdit({ ...expenseEdit, category: selected });
        }
    }

    function handleCurrency(e: any) {
        props.expense.currency = e.target.value;
        setExpenseEdit({ ...expenseEdit, currency: e.target.value });
        if (!!props.expense.amount_currency) {
            convertCurrencyTo('2023-08-23', e.target.value, props.expense.amount_currency, 'EUR').then(res => {
                props.expense.amount_base = res;
                setAmountBase(prev => res);
                setAmountError(false);
            }).catch(() => setAmountError(true))
        }
    }

    function handleLimitBudget() {
        return (
            <>ciao ciao</>
        )
    }


    return (
        <form>
            <div className="mb-3 d-sm-flex">
                <label className="col-sm-4 col-form-label fw-semibold">Data spesa</label>
                <div className="col-sm-3">
                    <DatePicker selected={!!expenseEdit.day ? new Date(expenseEdit.day) : new Date()}
                        className="form-control"
                        onChange={(date) => {
                            setExpenseEdit({ ...expenseEdit, day: moment(date).format('YYYY-MM-DD') })
                            props.expense.day = moment(date).format('YYYY-MM-DD')
                        }} />
                </div>
            </div>
            <div className="mb-3 d-sm-flex align-items-center">
                <label className="col-sm-4 col-form-label fw-semibold">Categoria</label>
                <div className="col-sm-3">
                    <select className={`form-select ${!!error?.category ? 'is-invalid' : ''} `}
                        onChange={handleSelectCategory}
                        value={expenseEdit.category?.id}>
                        {[{ id: 0, title: "Scegli la categoria" }, ...(categoryList?.results || [])].map((category) => (
                            <option
                                key={category.id}
                                value={category.id}>{category?.title}</option>
                        ))}
                    </select>
                    {!!error?.category && (
                        <div className="invalid-feedback">
                            {error.category}
                        </div>
                    )}
                </div>
                <div className='col-sm-4 text-center'>
                    <LimitBudget amountCurrency={Number(expenseEdit.amount_currency)}
                        category={expenseEdit.category?.title} />
                </div>
            </div>
            <div className="mb-3 d-sm-flex align-items-center ">
                <label className="col-sm-4 col-form-label fw-semibold">Tipo
                    Documento</label>
                <div className="col-sm-4">
                    <select className={`form-select ${!!error?.document_type ? 'is-invalid' : ''} `}
                        onChange={handleSelectTypeOfDocument}
                        value={expenseEdit.document_type?.id || 0}>
                        {[{ id: 0, title: "Scegli un documento" }, ...(typeOfDocumentList?.results || [])].map((doc) => (
                            <option
                                key={doc.id}
                                value={doc.id}>{doc?.title}</option>
                        ))}
                    </select>
                    {!!error?.document_type && (
                        <div className="invalid-feedback">
                            {error.document_type}
                        </div>
                    )}
                </div>
            </div>
            <div className="mb-3 d-sm-flex align-items-center">
                <label className="col-sm-4 col-form-label fw-semibold">Dettaglio</label>
                <div className="col-sm-8">
                    <input className="form-control"
                        onChange={(e) => {
                            setExpenseEdit({ ...expenseEdit, detail: e.target.value })
                            props.expense.detail = e.target.value
                        }}
                        value={expenseEdit.detail || ''} />
                </div>
            </div>
            <div className="mb-3 d-sm-flex align-items-center">
                <label className="col-sm-4 col-form-label fw-semibold">Tipo di
                    Pagamento</label>
                <div className="col-sm-5 ">
                    <select className={`form-select ${!!error?.payment_type ? 'is-invalid' : ''} `}
                        onChange={handleSelectTypeOfPayment}
                        value={expenseEdit.payment_type?.id}>
                        {[{ id: 0, title: 'Scegli il tipo di pagamento' }, ...(typeOfPaymentList?.results || [])].map((c,) => (
                            <option
                                key={c.id}
                                value={c.id}>{c.title || ''}</option>
                        ))}
                    </select>
                    {!!error?.payment_type && (
                        <div className="invalid-feedback">
                            {error.payment_type}
                        </div>
                    )}
                </div>
            </div>
            <div className="mb-3 d-sm-flex align-items-center">
                <label className="col-sm-4 col-form-label fw-semibold">Importo</label>
                <div className="d-flex col-sm-4">
                    <div className="col-sm-5">
                        <input type="number" step="0.01"
                            className={`form-control text-end ${!!error?.amount_currency ? 'is-invalid' : ''}`}
                            onChange={handleCurrencyAmount}
                            value={expenseEdit.amount_currency || 0}
                        />
                    </div>
                    <div className="col-sm-5 mx-2">
                    <select className={`form-select ${!!error?.category ? 'is-invalid' : ''} `}
                            onChange={handleCurrency} //TODO: change when update API
                            value={expenseEdit.currency}>
                            {[{id:0, iso3:'scegli'}, ...currencyList?.results || []].map((c) => (
                                <option value={c.iso3} key={c.iso3}>{c.iso3}</option>
                            ))}
                        </select>
                        {!!error?.currency && (
                        <div className="invalid-feedback">
                            {error.currency}
                        </div>
                    )}
                    </div>
                </div>

            </div>
            <div className="mb-3 d-sm-flex align-items-center">
                <label className="col-sm-4 col-form-label fw-semibold">Importo in €</label>
                <div className="col-sm-3">
                    <input disabled type="number" step="0.01" className="form-control text-end"
                        value={amountBase || 0} />
                </div>
                {amountError && (
                    <div className="d-flex col-sm-4 col-form-label align-items-center"><i
                        className="kt-icon-warning align-middle mx-2" />Massimale superato
                    </div>
                )}
            </div>
            <div className="mb-3 d-sm-flex align-items-center">
                <label htmlFor="disabledTextInput"
                    className="col-sm-4 col-form-label fw-semibold">Importo
                    rimborso in €</label>
                <div className="col-sm-3">
                    <input className="form-control text-end" id="disabledTextInput"
                        placeholder="Disabled input"
                        onChange={(e) => {
                            setExpenseEdit({ ...expenseEdit, amount_reimbursement: e.target.value })
                            props.expense.amount_reimbursement = e.target.value
                        }}
                        value={expenseEdit.amount_reimbursement || 0} />
                </div>
                <label
                    className={`col-sm-4 mx-2 col-form-label fw-semibold ${!!props.expense.amount_reimbursement && parseFloat(props.expense.amount_reimbursement) < 1 ? 'text-danger' : ''}`}>Azienda {!!props.expense.amount_reimbursement ? expenseEdit.amount_reimbursement : ''} €</label>
            </div>
            <div className="mb-3 d-flex align-items-center justify-content-end">
                <div className="col-sm-4">
                    <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" />
                        <label className="form-check-label fw-semibold">Approvazione</label>
                    </div>
                </div>
            </div>
            <div className="custom-file">
                <label className="form-check-label fw-semibold mb-1" htmlFor="inputGroupFile04">Allegato</label>
                <input type="file" className="form-control " id="inputGroupFile04" onChange={(e) => {
                    setUploadedImage(e.target.files)
                }}></input>
            </div>
        </form>
    );
}
