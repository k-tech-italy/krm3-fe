import React from 'react';

import {ExpenseCard} from "./ExpenseCard";
import {useMediaQuery, Expense} from "../Utilities";
import {ExpenseTable} from "./ExpenseTable";


const missionDataTest = {
    id: 1,
    place: 'Roma',
    dataStartMission: '01/07/2023',
    dataEndMission: '31/07/2023',
    costumer: 'World Food Program',
    expense: [
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
        },
    ]
}

export function Mission() {

    const isSmallScreen = useMediaQuery("(max-width: 767.98px)");
    const dataMission = missionDataTest;

    const dataExpense: Expense[] = dataMission.expense;


    if (isSmallScreen) {
        return (
            <div className="container-fluid p-0">
                <h1>Trasferta {dataMission.place}</h1>
                <div className="d-grid gap-2 d-md-block mb-2">
                    <button className="btn btn-primary" type="button">Add Expense</button>
                </div>
                {dataExpense.slice(0).reverse().map((item: Expense) => (
                    <ExpenseCard props={item} key={item.id}/>
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
                {dataExpense.map((item: Expense) => (
                    <ExpenseTable props={item} key={item.id}/>
                ))}
                </tbody>
            </table>
        </div>
    );

}
