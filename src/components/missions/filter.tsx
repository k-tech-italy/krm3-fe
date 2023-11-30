import React from 'react'
import {Form} from 'react-bootstrap'
import { Page, MissionInterface } from '../../restapi/types';

interface Props {
    handleFilter: (e:any) => void,
    data: Page<MissionInterface>
}

export default function FilterResource(props: Props) {


    function handleFilterName(e: any) {
        const wordArray: string[] = e.target.value.toLowerCase().split(' ')
        const res = props.data?.results.filter((mission) => 
        wordArray.every(
            word => mission.resource.firstName.toLowerCase().includes(word) || mission.resource.lastName.toLowerCase().includes(word)
        ))
        props.handleFilter(res)
}
 
    return (
      <Form>
        <Form.Group controlId="filterInput">
          <Form.Label>Filtro:</Form.Label>
          <Form.Control
            type="text"
            placeholder="Inserisci nome"
            onChange={handleFilterName}
          />
        </Form.Group>
      </Form>
    );
  ;
}