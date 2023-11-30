import React from 'react'
import { Card } from 'react-bootstrap'
import { MissionInterface } from '../../restapi/types';
import { useMediaQuery } from "../../hooks/commons";

interface Props {
  data: MissionInterface
}

export default function MissionSummary(props: Props) {
  const isSmallScreen = useMediaQuery("(max-width: 767.98px)");


  return (
    <Card border="grey" className='m-3 ms-0 w-100 shadow-sm p-3 mb-5 bg-whitesmoke'>
      <Card.Header className='bg-trasparent'>
        <div className='d-flex align-items-center'>
          <Card.Title className='m-0'>{props.data.title}</Card.Title>
        </div>
      </Card.Header>
      <Card.Body>          
        <div className="row mt-2">
          <div className="col-sm-2 d-flex">
            <p className='m-0 p-1 fw-bold'>Numero Trasferta: </p>
            <p className='m-0 p-1'>{props.data.number}</p>
          </div>
          <div className="col-sm-2 offset-sm-2 offset-md-0 d-flex">
            <p className='m-0 p-1 fw-bold'>Risorsa: </p>
            <p className='m-0 p-1'>{props.data.resource.firstName} {props.data.resource.lastName}</p>
          </div>
          <div className="col-sm-2 d-flex">
            <p className='m-0 p-1 fw-bold'>Dal: </p>
            <p className='m-0 p-1'>{props.data.fromDate}</p>
          </div>
          <div className="col-sm-2 d-flex">
            <p className='m-0 p-1 fw-bold'>Al: </p>
            <p className='m-0 p-1 '>{props.data.toDate}</p>
          </div>
          <div className="col-sm-2 d-flex">
            <p className='m-0 p-1 fw-bold'>Numero Giorni: </p>
            <p className='m-0 p-1'>TODO </p>
          </div>
        </div>
        <div className={`row  ${isSmallScreen ? '' : 'mt-2'}`}>
          <div className="col-sm-2 d-flex">
            <p className='m-0 p-1 fw-bold'>Cliente: </p>
            <p className='m-0 p-1'>{props.data.project.client.name}</p>
          </div>
          <div className="col-sm-2 d-flex">
            <p className='m-0 p-1 fw-bold'>Progetto: </p>
            <p className='m-0 p-1'>{props.data.project.name}</p>
          </div>
          <div className="col-sm-2 d-flex">
            <p className='m-0 p-1 fw-bold'>Paese: </p>
            <p className='m-0 p-1'>{props.data.city.country.name}</p>
          </div>
          <div className="col-sm-2 d-flex">
            <p className='m-0 p-1 fw-bold'>Città: </p>
            <p className='m-0 p-1'>{props.data.city.name}</p>
          </div>
          <div className="col-sm-2 d-flex">
            <p className='m-0 p-1 fw-bold'>Stato </p>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
  ;
}