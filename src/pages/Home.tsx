import React, { useState } from 'react';
import { useGetMissions } from "../hooks/mission";
import LoadSpinner from "../components/commons/LoadSpinner";
import FilterResource from '../components/missions/Filter';
import { MissionInterface, Page } from '../restapi/types';
import { CreateMission } from '../components/missions/create/CreateMission';


export function Home() {
    const { isLoading, data, isError } = useGetMissions();
    const [dataFiltered, setDataFiltered] = useState<MissionInterface[] | undefined>();
    const [openModal, setOpenModal] = useState(false)

    function handleFilter(e: any) {
        setDataFiltered(e)
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
                    <h1 className="mb-3">Lista Trasferte</h1>
                    <div className='d-flex flex-column flex-sm-row align-items-sm-end justify-content-between mb-5'>
                        <FilterResource handleFilter={handleFilter} data={data} />
                        <button type="button" className="btn btn-primary h-50 order-md-2 mt-2 mt-sm-0"
                        onClick={() => setOpenModal(true)}
                               >Create mission</button>
                    </div>
                    {(!!dataFiltered ? dataFiltered : data.results).map((item) => (
                        <div className='grid' key={item.number}>
                            <div className="d-flex align-items-end">
                                <a className='icon-link icon-link-hover display-6 text-decoration-none'
                                    href={`mission/${item.number}`}>
                                    <p className='mb-1'>{item.title}</p>
                                    <svg width="28" height="28" fill="currentColor"
                                        className="bi mx-2" viewBox="0 0 16 16">
                                        <path fillRule="evenodd"
                                            d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z" />
                                    </svg>
                                </a>
                            </div>
                            <div className='d-flex'>
                                <p className='mb-3 me-1'>{item.fromDate}</p>
                                <p className='mb-3 fw-bold'>{item.resource.firstName} {item.resource.lastName}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {openModal && (
                <CreateMission show = {openModal} onClose={() => setOpenModal(false)}
                />
            )}
        </>
    );
}
