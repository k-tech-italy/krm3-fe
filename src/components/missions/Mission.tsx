import React, { useState } from 'react';
import { useParams } from "react-router-dom";
import { ExpenseCard } from "../expense/ExpenseCard";
import { ExpenseInterface, MissionInterface } from "../../restapi/types";
import { useMediaQuery } from "../../hooks/commons";
import { ExpenseTable } from "../expense/ExpenseTable";
import { ExpenseEdit } from "../expense/edit/ExpenseEdit";
import { TotalsExpense } from "../expense/TotalExpense";
import LoadSpinner from "../commons/LoadSpinner";
import { useGetMission } from "../../hooks/expense";
import MissionSummary from './Summary';
import moment from 'moment';


export function Mission() {
    const isSmallScreen = useMediaQuery("(max-width: 767.98px)");
    const [selectedExpense, setSelectedExpense] = useState<ExpenseInterface | null>();
    const id = Number(useParams().id);
    const { isLoading, data, isError } = useGetMission(id);
    const today = new Date()

    const defaultExpense = {
        mission: id,
        amountCurrency: '0',
        day: moment(today).format('YYYY-MM-DD')
    } as ExpenseInterface


    return (
        <div className="container-fluid p-0">
            {isLoading && (
                <LoadSpinner />
            )}
            {isError && (
                <div>
                    <p>errore</p>
                </div>
            )}
            {!!data && (
                <>
                    <MissionSummary data={data} />
                    {isSmallScreen ? (
                        <div className="d-flex justify-content-center fixed-bottom pb-2 gradient">
                            <button type="button" className="btn btn-primary rounded-circle"
                                onClick={() => setSelectedExpense(defaultExpense)}>
                                <p className='m-0 fw-bold'>+</p>
                            </button>
                        </div>
                    ) : (
                        <div className="d-grid gap-2 d-md-block mb-2">
                            <button type="button" className="btn btn-primary"
                                onClick={() => setSelectedExpense(defaultExpense)}>Add Expense</button>
                        </div>
                    )}
                    {selectedExpense && (
                        <ExpenseEdit
                            show={selectedExpense ? true : false}
                            onClose={() => setSelectedExpense(null)}
                            expense={selectedExpense} />
                    )}
                    {isSmallScreen ? (
                        data.expenses?.slice(0).reverse().map((item: ExpenseInterface) => (
                            <ExpenseCard ShowIdCard={() => setSelectedExpense(item)} expense={item}
                                key={item.id} />
                        ))
                    ) : (
                        <>
                            <div className='card p-3 shadow-sm '>
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th scope="col ">Id</th>
                                            <th scope="col">Data</th>
                                            <th scope="col">Categoria</th>
                                            <th scope="col">Importo in valuta</th>
                                            <th scope="col">Importo in EUR</th>
                                            <th scope="col">Importo azienda</th>
                                            <th scope="col">Importo rimborso</th>
                                            <th scope="col">Tipo di pagamento</th>
                                            <th></th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.expenses?.map((item: ExpenseInterface) => (
                                            <ExpenseTable ShowIdCard={() => setSelectedExpense(prev => item)} expense={item}
                                                key={item.id} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <TotalsExpense Mission={{} as MissionInterface} />
                        </>
                    )}
                </>
            )
            }
        </div >
    );
}
