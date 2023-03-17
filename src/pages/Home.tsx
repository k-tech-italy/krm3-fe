import React from 'react';
import { Link } from "react-router-dom";

import { MissionInterface, missionsDataTest } from "../restapi/types";


export function Home() {
	const missions = missionsDataTest;

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
