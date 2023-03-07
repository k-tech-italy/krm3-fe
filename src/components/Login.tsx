import React from 'react';


interface Props {
    SetLogin: () => void,
}

export function Login({SetLogin}: Props) {

    return (
        <form>
            <div className="mb-3">
                <label htmlFor="Email" className="form-label">Email</label>
                <input type="email" className="form-control" id="Email" aria-describedby="emailHelp"/>
            </div>
            <div className="mb-3">
                <label htmlFor="Password" className="form-label">Password</label>
                <input type="password" className="form-control" id="Password"/>
            </div>
            <button type="submit" onClick={SetLogin} className="btn btn-primary">Login</button>
        </form>
    );

}
