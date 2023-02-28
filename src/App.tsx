import React from 'react';

import { Sidebar } from './components/commons/Sidebar';
import { Navbar } from './components/commons/Navbar';
import {Mission} from "./components/Mission";


export function App() {
	return (
		<div className="wrapper">
			<Sidebar/>
			<div className="main">
				<Navbar/>
				<div className="content">
					<div className="container-fluid">
						Router here
						<Mission/>
					</div>
				</div>
			</div>
		</div>
	);
}
