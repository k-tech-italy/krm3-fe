import React, {useState} from 'react';
import {useParams} from "react-router-dom";

import {ExpenseCard} from "./ExpenseCard";
import {useMediaQuery, ExpenseInterface, missionsDataTest, MissionInterface} from "../Utilities";
import {ExpenseTable} from "./ExpenseTable";
import {ExpenseEdit} from "./ExpenseEdit";


const missionDefault = {
    id: 0,
    place: 'string',
    dataStartMission: 'string',
    dataEndMission: 'string',
    costumer: 'string',
    expense: [{
        id: 0,
        dataExpense: '',
        category: '',
        currency: '',
        currencyAmount: 0,
        currencyEUR: 0,
        isPaid: false,
        typeOfPayment: ''
    }],
}  //for fix undefined default return value of .find method


export function Mission() {
    const missionId = Number(useParams().id);
    const isSmallScreen = useMediaQuery("(max-width: 767.98px)");
    const dataMission: MissionInterface = missionsDataTest.find(data => data.id === missionId) || missionDefault;
    const [expenseId, setExpenseId] = useState(0);


    if (isSmallScreen) {
        return (
            <div className="container-fluid p-0">
                <ExpenseEdit
                    props={dataMission.expense.find(data => data.id === expenseId) || missionDefault.expense[0]}/>

                <h2> Trasferta {dataMission.place}</h2>
                <div className="d-grid gap-2 d-md-block mb-2">
                    <a type="button" className="btn btn-primary" data-bs-toggle="modal"
                       data-bs-target="#staticBackdrop" onClick={() => setExpenseId(0)}>Add Expense</a>
                </div>
                {
                    dataMission.expense.slice(0).reverse().map((item: ExpenseInterface) => (
                        <ExpenseCard ShowIdCard={() => setExpenseId(item.id)} props={item} key={item.id}/>
                    ))
                }
            </div>
        )
            ;
    }
    return (
        <div className="container-fluid p-0">
            <ExpenseEdit props={dataMission.expense.find(data => data.id === expenseId) || missionDefault.expense[0]}/>
            <h1>Trasferta {dataMission.place}</h1>
            <div className="d-grid gap-2 d-md-block mb-2">
                <a type="button" className="btn btn-primary" data-bs-toggle="modal"
                   data-bs-target="#staticBackdrop" onClick={() => setExpenseId(0)}>Add Expense</a></div>
            <table className="table">
                <thead>
                <tr>
                    <th scope="col"></th>
                    <th scope="col">Data</th>
                    <th scope="col">Categoria</th>
                    <th scope="col">Importo in valuta</th>
                    <th scope="col">Importo in EUR</th>
                    <th scope="col">Tipo di pagamento</th>

                </tr>
                </thead>
                <tbody>
                {dataMission.expense.map((item: ExpenseInterface) => (
                    <ExpenseTable ShowIdCard={() => setExpenseId(item.id)} props={item} key={item.id}/>
                ))}
                </tbody>
            </table>
        </div>
    );

}
