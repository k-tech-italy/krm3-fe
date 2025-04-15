import React, { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom";
import queryString from "query-string";
import { getToken, googleAuthenticate, loginGoogle, loginUser } from '../../restapi/oauth';
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
        <div className="flex mt-5 mx-2 justify-center">
            {showLogin ? (
                <div className={`p-3 bg-white shadow-md rounded ${isSmallScreen ? 'w-full' : 'w-1/2'}`}>
                    <form className="flex flex-col">
                        {!!error?.detail && (
                            <label className="text-red-500">{error.detail}</label>
                        )}
                        <label className="mb-1">Username</label>
                        <input
                            className={`form-control ${!!error?.username ? 'border-red-500' : 'border-gray-300'} border rounded px-3 py-2`}
                            type="text"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setError({ ...error, username: undefined, detail: undefined });
                            }}
                        />
                        {!!error?.username && (
                            <label className="text-red-500">{error.username}</label>
                        )}
                        <label className="mt-4 mb-1">Password</label>
                        <input
                            className={`form-control ${!!error?.password ? 'border-red-500' : 'border-gray-300'} border rounded px-3 py-2`}
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError({ ...error, password: undefined, detail: undefined });
                            }}
                        />
                        {!!error?.password && (
                            <label className="text-red-500">{error.password}</label>
                        )}
                    </form>
                    <div className="flex justify-between">

                        <button
                            className="btn border border-yellow-500 text-yellow-500 mt-5 w-1/2 py-2 px-4 rounded hover:bg-yellow-100"
                            onClick={loginGoogle}
                        >
                            Login with Google
                        </button>
                        <button
                            onClick={handleLogin}
                            className="btn bg-yellow-500 text-white mt-3 py-2 px-4 rounded hover:bg-yellow-400"
                        >
                            Login
                        </button>
                    </div>

                </div>
            ) : (
                <p>Checking login data...</p>
            )}
        </div>
    );
}