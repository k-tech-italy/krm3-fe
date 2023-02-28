import React from 'react';
import useMediaQuery from "../Utilities";


export function Expense() {

    const result = useMediaQuery("(max-width: 767.98px)");

    if (result) {
        return (
            <div className="card mb-3">
                <div className="card-body mt-2">
                    <div className="row">
                        <div className="col">
                            <p>13/13/2023</p>
                        </div>
                        <div className="col">
                            <h5 className="card-title">Taxi</h5>
                        </div>
                        <div className="col">
                            <a href="#" className="btn btn-primary">ticket</a>
                        </div>
                    </div>
                    <div className="row mt-2">
                        <div className="col">
                            <p><strong>GBP</strong> 15,00</p>
                        </div>
                        <div className="col">
                            <div className="row">
                                <p><strong>EUR</strong> 16,80</p>
                            </div>
                        </div>
                        <div className="col">
                            <h5>PAID</h5>
                        </div>
                    </div>
                </div>
            </div>
        )
            ;
    }
    return (
        <table className="table">
            <tbody>
            <tr>
                <th scope="row">1</th>
                <td>13/13/2023</td>
                <td><h5 className="card-title">Taxi</h5>
                </td>
                <td><p><strong>GBP</strong> 15,00</p>
                </td>
                <td><p><strong>EUR</strong> 16,80</p>
                </td>
            </tr>
            </tbody>
        </table>
    )


}
