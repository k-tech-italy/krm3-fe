import React, { useEffect, useState } from 'react';
import { Card, Row, Col } from "react-bootstrap";
import { ExpenseInterface } from "../../restapi/types";
import { convertCurrencyTo } from "../../restapi/expense";
import "./expense.scss";


interface Props {
  expense: ExpenseInterface,
  ShowIdCard: () => void,
}

export function ExpenseCard(props: Props) {
  const [amountBase, setAmountBase] = useState('');

  useEffect(() => {
    convertCurrencyTo('2023-08-23', props.expense.currency, props.expense.amountCurrency || '0', 'EUR').then(res => setAmountBase(prev => res))
  }, [props.expense])

  return (
          <Card  onClick={props.ShowIdCard} className={`card-stats ${!!props.expense.amountReimbursement && parseFloat(props.expense.amountReimbursement) < 1 ? 'border border-danger' : ''}`}>
            <Card.Header>
              <div className='d-flex justify-content-between align-items-center'>
                <p className='m-0 p-1'>{props.expense.day}</p>
                <p className='m-0 p-1'>id: {props.expense.id}</p>
              </div>
            </Card.Header>
            <Card.Body>
              <Row>
                <Row>
                  <div className="numbers text-start">
                    <p className="card-category">Categoria</p>
                    <Card.Title className='mb-3'>{props.expense.category.title}</Card.Title>
                  </div>
                </Row>
                <Col xs='7'>
                  <div className="d-flex text-left ">
                    <div>
                      <p className='m-0 p-1'>Importo {props.expense.currency} {props.expense.amountCurrency}</p>
                      <p className='m-0 p-1'>Importo EUR {amountBase}</p>
                    </div>
                  </div>
                </Col>
                <Col xs="5">
                  <div className="numbers">
                    <i className="icon kt-icon-attach" />
                  </div>
                </Col>
              </Row>
            </Card.Body>
            <Card.Footer>
              <hr></hr>
              <div className="stats">
                <i className="fas fa-redo mr-1"></i>
                PAID 
              </div>
            </Card.Footer>
          </Card>
      );
}
