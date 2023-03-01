import React from 'react';
import {Expense} from "./Expense";


export function Mission() {
    return (
        <div className="container-fluid p-0">
            <h1>Trasferta Roma</h1>
            <div className="d-grid gap-2 d-md-block mb-2">
                <button className="btn btn-primary" type="button">Add Expense</button>
            </div>
            <Expense/>
        </div>
    );
}
