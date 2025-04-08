import React, { useEffect, useState } from 'react';
import DatePicker from "react-datepicker";
import moment from "moment";
import { MissionError, MissionInterface, Project } from "../../../restapi/types";
import { useGetClients, useGetResources, useGetProjects, useGetCountries, useGetCitiess } from '../../../hooks/mission';
import { useGetCurrencies } from '../../../hooks/expense';
import "react-datepicker/dist/react-datepicker.css";

interface Props {
    mission: MissionInterface,
    error?: MissionError
}

export function CreateMissionForm(props: Props) {

    const [mission, setMission] = useState<MissionInterface>(props.mission);
    const [error, setError] = useState<MissionError | undefined>(props.error)
    const [country, setCountry] = useState();
    const resources = useGetResources();
    const clients = useGetClients();
    const projects = useGetProjects();
    const countries = useGetCountries();
    const cities = useGetCitiess();
    const currencies = useGetCurrencies();

    useEffect(() => {
        setMission(prev => props.mission)
    }, [JSON.stringify(props.mission)])

    useEffect(() => {
        setError(prev => props.error)
    }, [props.error])

    function handleChangeResource(e: any): void {
        if (!!resources) {
            const selected = resources.results.filter(res => res.id === Number(e.target.value)).at(0) || props.mission.resource;
            props.mission.resource = selected;
            console.log(selected);
            delete error?.resource;
            setMission({ ...mission, resource: selected });
        }
    }

    function handleChangeProject(e: any): void {
        if (!!projects) {
            const selected = projects.results.filter(res => res.id === Number(e.target.value)).at(0) || props.mission.project;
            props.mission.project = selected;
            console.log(selected)
            delete error?.project
            setMission({ ...mission, project: selected });
        }
    }

    function handleChangeCountry(e: any): void {
        if (!!countries) {
            setCountry(prev => e.target.value)
        }
    }

    function handleChangeCity(e: any): void {
        if (!!cities) {
            const selected = cities.results.filter(c => c.id === Number(e.target.value)).at(0) || props.mission.city;
            props.mission.city = selected;
            delete error?.city
            setMission({ ...mission, city: selected });
        }
    }
    function handleChangeCurrency(e: any): void {
        if (!!currencies) {
            const selected = currencies.results.filter(c => c.iso3 === e.target.value).at(0) || props.mission.defaultCurrency;
            props.mission.defaultCurrency = selected;
            delete error?.defaultCurrency
            setMission({ ...mission, defaultCurrency: selected });
        }
    }

    return (
        <form className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center">
                <label className="sm:w-1/4 font-semibold mb-2 sm:mb-0">Titolo</label>
                <div className="sm:w-2/4 w-full">
                    <input
                        className={`w-full border rounded-md p-2 ${!!error?.resource ? 'border-red-500' : 'border-gray-300'} `}
                        onChange={(e) => {
                            props.mission.title = e.target.value;
                            delete error?.title;
                        }}
                    />
                    {!!error?.title && (
                        <p className="text-red-500 text-sm mt-1">{error.title}</p>
                    )}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center">
                <label className="sm:w-1/4 font-semibold mb-2 sm:mb-0">Risorsa</label>
                <div className="sm:w-2/4 w-full">
                    <select
                        className={`w-full border rounded-md p-2 ${!!error?.resource ? 'border-red-500' : 'border-gray-300'} `}
                        value={mission?.resource?.id}
                        onChange={handleChangeResource}
                    >
                        {[{ id: 0, firstName: "Risorsa" }, ...(resources?.results || [])].map((res) => (
                            <option key={res.id} value={res.id}>
                                {res.firstName}
                            </option>
                        ))}
                    </select>
                    {!!error?.resource && (
                        <p className="text-red-500 text-sm mt-1">{error.resource}</p>
                    )}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center">
                <label className="sm:w-1/4 font-semibold mb-2 sm:mb-0">Progetto</label>
                <div className="sm:w-2/4 w-full">
                    <select
                        className={`w-full border rounded-md p-2 ${!!error?.project ? 'border-red-500' : 'border-gray-300'} `}
                        value={mission?.project?.id}
                        onChange={handleChangeProject}
                    >
                        {[{ id: 0, name: "progetto" } as Project, ...(projects?.results || [])].map((res) => (
                            <option key={res.id} value={res.id}>
                                {res.name} ({clients?.results.filter(c => c.id === res.client).at(0)?.name})
                            </option>
                        ))}
                    </select>
                    {!!error?.project && (
                        <p className="text-red-500 text-sm mt-1">{error.project}</p>
                    )}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center">
                <label className="sm:w-1/4 font-semibold mb-2 sm:mb-0">Paese</label>
                <div className="sm:w-2/4 w-full">
                    <select
                        className="w-full border rounded-md p-2 border-gray-300"
                        value={country}
                        onChange={handleChangeCountry}
                    >
                        {[{ id: 0, name: "Paese" }, ...(countries?.results || [])].map((res) => (
                            <option key={res.id} value={res.id}>
                                {res.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center">
                <label className="sm:w-1/4 font-semibold mb-2 sm:mb-0">Città</label>
                <div className="sm:w-2/4 w-full">
                    <select
                        className={`w-full border rounded-md p-2 ${!!error?.city ? 'border-red-500' : 'border-gray-300'} `}
                        value={props.mission?.city?.id}
                        onChange={handleChangeCity}
                    >
                        {[{ id: 0, name: "Città" }, ...(cities?.results.filter(c => c.country === Number(country)) || [])].map((res) => (
                            <option key={res.id} value={res.id}>
                                {res.name}
                            </option>
                        ))}
                    </select>
                    {!!error?.city && (
                        <p className="text-red-500 text-sm mt-1">{error.city}</p>
                    )}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center">
                <label className="sm:w-1/4 font-semibold mb-2 sm:mb-0">Valuta di base</label>
                <div className="sm:w-2/4 w-full">
                    <select
                        className={`w-full border rounded-md p-2 ${!!error?.defaultCurrency ? 'border-red-500' : 'border-gray-300'} `}
                        value={props.mission?.defaultCurrency?.iso3}
                        onChange={handleChangeCurrency}
                    >
                        {[{ iso3: "valuta", title: "valuta" }, ...(currencies?.results || [])].map((res) => (
                            <option key={res.iso3} value={res.iso3}>
                                {res.iso3}
                            </option>
                        ))}
                    </select>
                    {!!error?.defaultCurrency && (
                        <p className="text-red-500 text-sm mt-1">{error.defaultCurrency}</p>
                    )}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center">
                <label className="sm:w-1/4 font-semibold mb-2 sm:mb-0">Dal giorno</label>
                <div className="sm:w-2/4 w-full">
                    <DatePicker
                        selected={!!mission.fromDate ? new Date(mission.fromDate) : new Date()}
                        className="w-full border rounded-md p-2 border-gray-300"
                        onChange={(date: Date | null) => {
                            setMission({ ...mission, fromDate: moment(date).format('YYYY-MM-DD') });
                            props.mission.fromDate = moment(date).format('YYYY-MM-DD');
                        }}
                    />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center">
                <label className="sm:w-1/4 font-semibold mb-2 sm:mb-0">Al giorno</label>
                <div className="sm:w-2/4 w-full">
                    <DatePicker
                        selected={!!mission.toDate ? new Date(mission.toDate) : new Date()}
                        className="w-full border rounded-md p-2 border-gray-300"
                        onChange={(date: Date | null) => {
                            setMission({ ...mission, toDate: moment(date).format('YYYY-MM-DD') });
                            props.mission.toDate = moment(date).format('YYYY-MM-DD');
                        }}
                    />
                </div>
            </div>
        </form>
    );
}
