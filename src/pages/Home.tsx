import React, { useState } from 'react';
import { useGetMissions } from "../hooks/mission";
import LoadSpinner from "../components/commons/LoadSpinner";
import FilterResource from '../components/missions/Filter';
import { ExpenseInterface, MissionInterface, Page } from '../restapi/types';
import { CreateMission } from '../components/missions/create/CreateMission';
import { useGetCurrentUser } from '../hooks/commons';
import moment from 'moment';
import BreadcrumbMission from '../components/commons/Breadcrumb';
import { Table } from 'react-bootstrap';
import { useGetExpense } from '../hooks/expense';
import ExpenseFilter from '../components/expense/ExpenseFilter';


export function Home() {
    const { isLoading, data, isError } = useGetMissions();
    const expenseList = useGetExpense();
    const [dataFiltered, setDataFiltered] = useState<MissionInterface[] | undefined>();
    const [expenseFiltered, setExpenseFiltered] = useState<ExpenseInterface[] | undefined>();
    const [openModal, setOpenModal] = useState(false)
    const user = useGetCurrentUser();
    const today = new Date()
    const defaultMission = {
        fromDate: moment(today).format('YYYY-MM-DD'),
        toDate: moment(today).format('YYYY-MM-DD')
    } as MissionInterface

    function handleFilter(e: any) {
        setDataFiltered(e)
    }

    function handleFilterExpense(e: any): void {
        setExpenseFiltered(e)
    }

    return (
        <>
            {isLoading && (
                <LoadSpinner />
            )}
            {isError && (
                <div>
                    <p>errore</p>
                </div>
            )}
            {!!data && (
                <div className="container-fluid p-0 mb-5">
                    <BreadcrumbMission page={[{ title: 'Home', url: '#' }]} />
                    <div className='card p-3 shadow-sm'>
                        <p className='h2'>Trasferte</p>
                        {user?.isStaff && (
                            <div className='d-flex flex-column flex-sm-row align-items-sm-end justify-content-between mb-2'>
                                <FilterResource handleFilter={handleFilter} data={data} />
                                <button type="button" className="btn btn-primary h-50 order-md-2 mt-2 mt-sm-0"
                                    onClick={() => setOpenModal(true)}
                                >+ Add mission</button>
                            </div>
                        )}
                        <Table className="table-hover">
                            <thead>
                                <tr>
                                    <th scope="col ">Id</th>
                                    <th scope="col">Dal</th>
                                    <th scope="col">Al</th>
                                    <th scope="col">Missione</th>
                                    <th scope="col">Risorsa</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(!!dataFiltered ? dataFiltered : data.results).map((item) => (
                                    <tr className='pointer-events' onClick={() => window.location.replace(`/mission/${item.id}`)} key={item.id}>
                                        <td>{item.id}</td>
                                        <td>{item.fromDate}</td>
                                        <td>{item.toDate}</td>
                                        <td>{item.title}</td>
                                        <td>{item.resource.firstName}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </div>
            )}
            {!!expenseList && (
                <div className='card p-3 shadow-sm'>
                    <p className='h2'>Ultime Spese Aggiunte</p>
                    <ExpenseFilter handleFilter={handleFilterExpense} data={expenseList.results}/>
                    <div className='table-scroll'>
                        <Table className="table-hover">
                            <thead>
                                <tr>
                                    <th scope="col ">Id</th>
                                    <th scope="col">Data</th>
                                    <th scope="col">id Missione</th>
                                    <th scope="col">Titolo Missione</th>
                                    <th scope="col">Risorsa</th>
                                    <th scope="col">Importo in EUR</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(!!expenseFiltered ? expenseFiltered : expenseList.results).map((item: ExpenseInterface) => (
                                    <tr onClick={() => window.location.replace(`/mission/${item.mission}`)} key={item.id}>
                                        <td>{item.id}</td>
                                        <td>{item.day}</td>
                                        <td>{item.mission}</td>
                                        <td>{data?.results.filter(m => m.id === item.mission).at(0)?.title || ''}</td>
                                        <td>{data?.results.filter(m => m.id === item.mission).at(0)?.resource.firstName || ''}</td>
                                        <td>{item.amountCurrency}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </div>
            )}
            {openModal && (
                <CreateMission show={openModal} onClose={() => setOpenModal(false)} mission={defaultMission}
                />
            )}
        </>
    );
}
