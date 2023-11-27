import React from 'react';
import {useGetCurrentUser} from "../hooks/commons";
import LoadSpinner from "../components/commons/LoadSpinner";

export function User() {
    const user = useGetCurrentUser();

    return (
        !!user ? (
            <div className="card text-center" style={{width: '18rem'}}>
                <img src="https://avatars.githubusercontent.com/u/6311869?s=40&v=4" className="card-img-top" alt="..."/>
                <div className="card-body">
                    <h5 className="card-title">{}</h5>
                    <p className="card-text"><strong>Email </strong>{user.email}</p>
                </div>
            </div>
        ) : (
            <LoadSpinner/>
        )
    );
}
