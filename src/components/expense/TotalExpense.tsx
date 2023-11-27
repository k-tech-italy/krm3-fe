import React, {useState} from 'react';
import {MissionInterface} from "../../restapi/types";


interface Props {
    Mission: MissionInterface,
}

export function TotalsExpense(props: Props) {

    const [totalRefund, setTotalRefund] = useState<number>();
    const [totalAnticipated, setTotalAnticipated] = useState<number>();


    return (
        <div className="row justify-content-around mt-5">
            <div className="col col-sm-2 card text-center p-3 bg-light shadow-sm">
                <h5>Total Refund</h5>
                <p>{totalRefund}</p>
            </div>
            <div className="col col-sm-2 card text-center p-3 bg-light shadow-sm">
                <h5>Total Anticipated</h5>
                <p>{totalAnticipated}</p>
            </div>
            <div className="col col-sm-2 card text-center p-3 bg-light shadow-sm">
                <h5>Totals</h5>
                {!!totalRefund && !!totalAnticipated && (
                    <p>{totalRefund + totalAnticipated}</p>
                )}
            </div>
        </div>
    );
}
