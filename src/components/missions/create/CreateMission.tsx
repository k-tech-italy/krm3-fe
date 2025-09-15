import React, { useEffect, useState } from 'react';
import { MissionError, MissionInterface } from "../../../restapi/types";
import { CreateMissionForm } from './CreateMissionForm';
import { useCreateMission } from '../../../hooks/useMissions';
import { validateMission } from '../../../utils/validationMissionForm';
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import Krm3Modal from '../../commons/krm3Modal';

const today = new Date();
const mission = {
    fromDate: moment(today).format('YYYY-MM-DD'),
    toDate: moment(today).format('YYYY-MM-DD')
} as MissionInterface;

interface Props {
    onClose: () => void;
    show: boolean;
}

export function CreateMission(props: Props) {
    const { mutate, isLoading, isError, error } = useCreateMission();
    const [missionError, setMissionError] = useState<MissionError>();

    function handleMission(mission: MissionInterface) {
        mutate(mission, {
            onSuccess: () => props.onClose()
        });
    }

    function saveData() {
        console.log(mission, 'save');
        validateMission(mission)
            .then(res => handleMission(res))
            .catch((err) => setMissionError(err));
    }

    if (!props.show) return null;

    return (
        <Krm3Modal open={props.show} onClose={props.onClose} title={'Create Mission'} children={
            <>
                <CreateMissionForm mission={mission} error={missionError} />
                {isError && (
                    <div className="m-4 p-4 bg-red-100 text-red-700 rounded-lg">
                        <p>{error.message}</p>
                    </div>
                )}
                <div className="flex justify-end items-center p-6 space-x-4">
                    <button
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none"
                        onClick={props.onClose}
                    >
                        Close
                    </button>
                    <button
                        data-testid="save-button"
                        className={`px-4 py-2 text-white rounded-lg focus:outline-none ${isLoading
                                ? 'bg-yellow-400 cursor-not-allowed'
                                : 'bg-krm3-primary hover:bg-krm3-primary-dark'
                            }`}
                        disabled={isLoading}
                        onClick={saveData}
                    >
                        {isLoading ? (
                            <div className="flex items-center">
                                <div className="spinner-border animate-spin inline-block w-4 h-4 border-2 rounded-full mr-2" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : (
                            <>Save</>
                        )}
                    </button>
                </div>
            </>} />
    );


}
