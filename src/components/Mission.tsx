import React, {useState} from 'react';

import {ExpenseCard} from "./ExpenseCard";
import {useMediaQuery, ExpenseInterface, MissionInterface} from "../Utilities";
import {ExpenseTable} from "./ExpenseTable";
import {ExpenseEdit} from "./ExpenseEdit";

const missionDataTest = {
    id: 1,
    place: 'Roma',
    dataStartMission: '01/07/2023',
    dataEndMission: '31/07/2023',
    costumer: 'World Food Program',
    expense: [
        {
            id: 0,
            dataExpense: '01/07/2023',
            category: 'Taxi',
            currency: 'GBP',
            currencyAmount: 14,
            currencyEUR: 16,
            isPaid: true,
            typeOfPayment: 'CCA Aziendale'
        },
        {
            id: 1,
            dataExpense: '01/07/2023',
            category: 'Taxi',
            currency: 'GBP',
            currencyAmount: 14,
            currencyEUR: 16,
            isPaid: true,
            typeOfPayment: 'CCA Aziendale'
        },
        {
            id: 2,
            dataExpense: '03/07/2023',
            category: 'Hotel',
            currency: 'GBP',
            currencyAmount: 140,
            currencyEUR: 160,
            isPaid: false,
            typeOfPayment: 'Conto risorsa'
        }, {
            id: 3,
            dataExpense: '08/07/2023',
            category: 'Colazione',
            currency: 'GBP',
            currencyAmount: 14,
            currencyEUR: 16,
            isPaid: false,
            typeOfPayment: 'CCA Aziendale'
        }, {
            id: 4,
            dataExpense: '10/07/2023',
            category: 'Pranzo',
            currency: 'GBP',
            currencyAmount: 30,
            currencyEUR: 33,
            isPaid: true,
            typeOfPayment: 'CCA Aziendale'
        }, {
            id: 5,
            dataExpense: '12/07/2023',
            category: 'Metro',
            currency: 'GBP',
            currencyAmount: 3,
            currencyEUR: 5,
            isPaid: false,
            typeOfPayment: 'CCA Aziendale'
        },]
};




export function Mission() {

    const isSmallScreen = useMediaQuery("(max-width: 767.98px)");
    const dataMission = missionDataTest;
    const dataExpense: ExpenseInterface[] = dataMission.expense;
    const [expenseId, setExpenseId] = useState(0);


    if (isSmallScreen) {
        return (
            <div className="container-fluid p-0">
                  <ExpenseEdit props={dataExpense[expenseId]}/>

                <h2>Trasferta {dataMission.place}</h2>
                <div className="d-grid gap-2 d-md-block mb-2">
                    <a type="button" className="btn btn-primary" data-bs-toggle="modal"
                       data-bs-target="#staticBackdrop" onClick={() => setExpenseId(0)} >Add Expense</a>
                </div>
                {dataExpense.slice(0).reverse().map((item: ExpenseInterface) => (
                    <ExpenseCard ShowIdCard={()=>setExpenseId(item.id)} props={item} key={item.id}/>
                ))}
            </div>
        );
    }
    return (
        <div className="container-fluid p-0">
            <h1>Trasferta {dataMission.place}</h1>
            <div className="d-grid gap-2 d-md-block mb-2">
                <button className="btn btn-primary" type="button">Add Expense</button>
            </div>
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
                {dataExpense.map((item: ExpenseInterface) => (
                    <ExpenseTable props={item} key={item.id}/>
                ))}
                </tbody>
            </table>
        </div>
    );

}
