import React, {useEffect, useState} from 'react';
import {useLocation} from "react-router-dom";
import queryString from "query-string";
import {getToken, googleAuthenticate, loginGoogle, loginUser} from '../../restapi/oauth';
import { useMediaQuery } from "../../hooks/commons";


interface LoginError {
    username?: string,
    password?: string,
    detail?: string,
}

export function Login() {
    const isSmallScreen = useMediaQuery("(max-width: 767.98px)");
    const location = useLocation();
    const [showLogin, setShowLogin] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<LoginError>();

    useEffect(() => {
        const values = queryString.parse(location.search);
        const state = values.state ? values.state : null;
        const code = values.code ? values.code : null;
        console.log('Login state, code =', state, code);
        if (state && code) {
            googleAuthenticate(state.toString(), code.toString()).then(() => {
                console.log("Login done", getToken());
            });
        } else {
            // we can call login() directly and avoid the button
            setShowLogin(true);
        }
    }, [location]);

    function handleLogin() {
        if (!username || !password) {
            setError({
                ...error,
                username: !username ? "this field is required" : undefined,
                password: !password ? "this field is required" : undefined,
            });
        }
        if (!!username && !!password) {
            loginUser(username, password)
                .then(() => window.location.href = '/')
                .catch((error) => {
                    setError({
                        ...error,
                        detail: error.response.data.detail,
                    });
                });
        }
    }


    return (
        <div className='d-flex h-100 justify-content-center'>
            {showLogin ? <div className={`p-3 card ${isSmallScreen ? 'w-100' : 'w-50'}`}>
                    <form className='d-flex flex-column'>
                        {!!error?.detail && (
                            <label className={'text-danger'}>{error.detail}</label>
                        )}
                        <label>username</label>
                        <input
                            className={`form-control col-sm-4  ${!!error?.username ? 'is-invalid' : ''}`}
                            type='text'
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setError({...error, username: undefined, detail: undefined})
                            }}
                        />
                        {!!error?.username && (
                            <label className={'text-danger'}>{error.username}</label>
                        )}
                        <label>password</label>
                        <input
                            className={`form-control col-sm-4  ${!!error?.password ? 'is-invalid' : ''}`}
                            type='password'
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError({...error, password: undefined, detail: undefined})
                            }}
                        />
                        {!!error?.password && (
                            <label className={'text-danger'}>{error.password}</label>
                        )}
                    </form>
                    <button onClick={handleLogin} className="btn btn-primary mt-3"
                    >Login
                    </button>
                    <button className="btn btn-outline-warning mt-5 w-50"
                            onClick={loginGoogle}
                    >Login with Google
                    </button>
                </div>
                :
                <p>Checking login data...</p>
            }
        </div>
    );
}