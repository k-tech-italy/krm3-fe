import React, { useState } from 'react';
import { Link } from "react-router-dom";

import { MissionInterface, missionsDataTest } from "../restapi/types";
import { Login } from "../components/Login";


export function Home() {
	const missions = missionsDataTest;
	const [isLogged, setIsLogged] = useState(false);

	if (!isLogged) {
		return (
			<div>
				<Login SetLogin={() => setIsLogged(true)}/>
			</div>
		);
	}

	return (
		<div className="container-fluid p-0">
			<h1 className="mb-3">Lista Trasferte</h1>
			{missions.map((item: MissionInterface) => (
				<Link to={`mission/${item.id}`}>
					<div><h1>{item.place}</h1></div>
				</Link>
			))}
		</div>
	);
}
