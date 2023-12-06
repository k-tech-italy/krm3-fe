import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import moment from 'moment';
import { MissionError, MissionInterface } from "../../../restapi/types";
import { Alert, Spinner } from "react-bootstrap";
import { CreateMissionForm } from './CreateMissionForm';
import { useCreateMission } from '../../../hooks/mission';
import { validateMission } from '../../../utils/validationMissionForm';
import "react-datepicker/dist/react-datepicker.css";


interface Props {
    onClose: () => void,
    show: boolean
}

export function CreateMission(props: Props) {

    const { mutate, isLoading, isError, error } = useCreateMission();
    const [missionError, setMissionError] = useState<MissionError>();
    const today = new Date()
    const mission = {
        fromDate: moment(today).format('YYYY-MM-DD'),
        toDate: moment(today).format('YYYY-MM-DD')
    } as MissionInterface

    function handleMission(mission: MissionInterface) {
        mutate( mission , {
            onSuccess: () => props.onClose()
        })

    }

    function saveData() {
        console.log(mission)
        validateMission(mission)
            .then(res => handleMission(res))
            .catch((err) => setMissionError(err))
    }


    return (
        <Modal show={props.show} onHide={props.onClose} dialogClassName="modal-80w">
            <Modal.Header closeButton>
                <Modal.Title>Create Mission</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <CreateMissionForm mission={mission} error={missionError}/>
            </Modal.Body>
            {isError && (
                <Alert className='m-3' variant='danger'>
                    <p>{error.message}</p>
                </Alert>
            )}
            <Modal.Footer>
                <Button variant="secondary" onClick={props.onClose}>
                    Close
                </Button>
                <Button variant="primary" disabled={isLoading} onClick={saveData}>
                    {isLoading ?
                        <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                            />
                            <span className='px-1'>Loading...</span>
                        </> : (
                            <>Save</>
                        )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
