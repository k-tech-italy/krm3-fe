import React, { useEffect, useState } from 'react';
import DatePicker from "react-datepicker";
import moment from "moment";
import { MissionError, MissionInterface, Project } from "../../../restapi/types";
import { useGetClients, useGetResources, useGetProjects, useGetCountries, useGetCitiess } from '../../../hooks/mission';
import { useGetCurrencies } from '../../../hooks/expense';
import "react-datepicker/dist/react-datepicker.css";
import { Card } from 'react-bootstrap';

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
        console.log(props.mission)
    }, [props.mission])

    useEffect(() => {
        setError(prev => props.error)
        console.log(props.error)
    }, [props.error])



    function handleChangeResource(e: any): void {
        if (!!resources) {
            const selected = resources.results.filter(res => res.id === Number(e.target.value)).at(0) || props.mission.resource;
            props.mission.resource = selected;
            console.log(selected)
            delete error?.resource
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
                <form>
                    <div className="mb-3 d-sm-flex align-items-center ">
                        <label className="col-sm-4 col-form-label fw-semibold">Titolo</label>
                        <div className="col-sm-5">
                            <input className={`form-control ${!!error?.resource ? 'is-invalid' : ''} `} onChange={(e) => {
                                props.mission.title = e.target.value
                                delete error?.title
                            }} />
                            {!!error?.title && (
                                <div className="invalid-feedback">
                                    {error.title}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mb-3 d-sm-flex align-items-center">
                        <label className="col-sm-4 col-form-label fw-semibold">Risorsa</label>
                        <div className="col-sm-5">
                            <select className={`form-select ${!!error?.resource ? 'is-invalid' : ''} `}//TODO CHANGE ERROR
                                value={mission?.resource?.id}
                                onChange={handleChangeResource}>
                                {[{ id: 0, firstName: "Risorsa" }, ...(resources?.results || [])].map((res) => (
                                    <option
                                        key={res.id}
                                        value={res.id}>{res.firstName}</option>
                                ))}
                            </select>
                            {!!error?.resource && (
                                <div className="invalid-feedback">
                                    {error.resource}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mb-3 d-sm-flex align-items-center">
                        <label className="col-sm-4 col-form-label fw-semibold">Progetto</label>
                        <div className="col-sm-5">
                            <select className={`form-select ${!!error?.project ? 'is-invalid' : ''} `}//TODO CHANGE ERROR
                                value={mission?.project?.id}
                                onChange={handleChangeProject}>
                                {[{ id: 0, name: "progetto" } as Project, ...(projects?.results || [])].map((res) => (
                                    <option
                                        key={res.id}
                                        value={res.id}>{res.name} ({clients?.results.filter(c => c.id === res.client).at(0)?.name})</option>
                                ))}
                            </select>
                            {!!error?.project && (
                                <div className="invalid-feedback">
                                    {error.project}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mb-3 d-sm-flex align-items-center">
                        <label className="col-sm-4 col-form-label fw-semibold">Paese</label>
                        <div className="col-sm-5">
                            <select className={`form-select`}//TODO CHANGE ERROR
                                value={country}
                                onChange={handleChangeCountry}>
                                {[{ id: 0, name: "Paese" }, ...(countries?.results || [])].map((res) => (
                                    <option
                                        key={res.id}
                                        value={res.id}>{res.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="mb-3 d-sm-flex align-items-center">
                        <label className="col-sm-4 col-form-label fw-semibold">Città</label>
                        <div className="col-sm-5">
                            <select className={`form-select ${!!error?.city ? 'is-invalid' : ''} `}//TODO CHANGE ERROR
                                value={props.mission?.city?.id}
                                onChange={handleChangeCity}>
                                {[{ id: 0, name: "Città" }, ...(cities?.results.filter(c => c.country === Number(country)) || [])].map((res) => (
                                    <option
                                        key={res.id}
                                        value={res.id}>{res.name}
                                    </option>
                                ))}
                            </select>
                            {!!error?.city && (
                                <div className="invalid-feedback">
                                    {error.city}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mb-3 d-sm-flex align-items-center">
                        <label className="col-sm-4 col-form-label fw-semibold">valuta di base</label>
                        <div className="col-sm-5">
                            <select className={`form-select ${!!error?.defaultCurrency ? 'is-invalid' : ''} `}//TODO CHANGE ERROR
                                value={props.mission?.defaultCurrency?.iso3}
                                onChange={handleChangeCurrency}>
                                {[{ iso3: "valuta", title: "valuta" }, ...(currencies?.results || [])].map((res) => (
                                    <option
                                        key={res.iso3}
                                        value={res.iso3}>{res.iso3}
                                    </option>
                                ))}
                            </select>
                            {!!error?.defaultCurrency && (
                                <div className="invalid-feedback">
                                    {error.defaultCurrency}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mb-3 d-sm-flex">
                        <label className="col-sm-4 col-form-label fw-semibold">Dal giorno</label>
                        <div className="col-sm-3">
                            <DatePicker selected={!!mission.fromDate ? new Date(mission.fromDate) : new Date()}
                                className="form-control"
                                onChange={(date) => {
                                    setMission({ ...mission, fromDate: moment(date).format('YYYY-MM-DD') })
                                    props.mission.fromDate = moment(date).format('YYYY-MM-DD')
                                }} />
                        </div>
                    </div>
                    <div className="mb-3 d-sm-flex">
                        <label className="col-sm-4 col-form-label fw-semibold">Al giorno</label>
                        <div className="col-sm-3">
                            <DatePicker selected={!!mission.toDate ? new Date(mission.toDate) : new Date()}
                                className="form-control"
                                onChange={(date) => {
                                    setMission({ ...mission, toDate: moment(date).format('YYYY-MM-DD') })
                                    props.mission.toDate = moment(date).format('YYYY-MM-DD')
                                }} />
                        </div>
                    </div>
                </form>
    );
}
