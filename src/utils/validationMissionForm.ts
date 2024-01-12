import { MissionError, MissionInterface } from "../restapi/types";


export function validateMission(mission: MissionInterface): Promise<MissionInterface> {
    const error = {} as MissionError;

    if (!mission.title) {
        error.title =  ['this field is required'];
    }    
    if (!mission.fromDate) {
        error.fromDate =  ['this field is required'];
    }
    if (!mission.toDate) {
        error.toDate =  ['this field is required'];
    }
    if (!mission.project) {
        error.project =  ['this field is required'];
    }
    if (!mission.resource) {
        error.resource =  ['this field is required'];
    }
    if (!mission.city) {
        error.city =  ['this field is required'];
    }
   
    const isValid = Object.values(error).every(f => !f);
    return isValid ? Promise.resolve(mission) : Promise.reject(error);
}
