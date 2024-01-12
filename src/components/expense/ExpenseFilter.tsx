import React, { useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { ExpenseInterface } from '../../restapi/types';
import DatePicker from "react-datepicker";

//TODO FIX: when click on button scroll up

interface Props {
    handleFilter: (e: any) => void,
    data: ExpenseInterface[],
}

export default function ExpenseFilter(props: Props) {
    const today = new Date();
    const [fromDate, setFromDate] = useState<Date>();
    const [toDate, setToDate] = useState<Date>();
  

    function handleFilterDate(fromDate: Date ,toDate?: Date) {
        const res = props.data.filter((expense) => {
            const dataExpense = new Date(expense.day)
            return dataExpense >= fromDate && dataExpense <= (!!toDate ? toDate : today);
        })
        props.handleFilter(res)
    }

    return (
        <>
            <Row className='my-4'>
            <Form className='d-flex'>
                <Col md="4">
                        <Row>
                            <Col xs="7">
                            <Form.Label>Dal giorno:</Form.Label>
                            <Form.Group>
                                <DatePicker selected={!!fromDate ? fromDate : today}
                                    className="form-control"
                                    onChange={(date) => {
                                        if(!!date){
                                            setFromDate(date)
                                        }
                                    }} /></Form.Group>
                            </Col>
                        </Row>
                </Col>
                <Col md="4">
                        <Row> 
                            <Col xs="7">
                            <Form.Label>Al giorno:</Form.Label>
                                 <Form.Group>
                                <DatePicker selected={!!toDate ? toDate : today}
                                    className="form-control"
                                    onChange={(date) => {
                                        if(!!date){
                                            setToDate(date)
                                        }
                                    }} />
                                    </Form.Group>           
                            </Col>
                        </Row>
                </Col>
                <Col md='4' className='d-flex align-items-end'>
                        <button className='btn btn-primary' onClick={() => {
                            if(fromDate){
                                handleFilterDate(fromDate, toDate)
                            }
                        }}>Filtra</button>
                        <button className='btn btn-primary mx-2' onClick={() => {
                            setFromDate(undefined)
                            setToDate(undefined)
                            props.handleFilter(undefined)
                        }}>Reset</button>
                </Col>
                </Form>
            </Row>
        </>
    );
}

