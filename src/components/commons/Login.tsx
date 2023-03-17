import React, { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom";
import queryString from "query-string";

import { getToken, googleAuthenticate, login } from '../../restapi/oauth';


export function Login() {
	const location = useLocation();
	const [showLogin, setShowLogin] = useState(false);

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

	return (
		<div className="container-fluid p-0">
			{showLogin ?
				<button className="btn btn-primary"
						onClick={login}
				>Login with Google
				</button>
				:
				<p>Checking login data...</p>
			}
		</div>
	);
}