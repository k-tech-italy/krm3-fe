import React from 'react';

import { Sidebar } from './components/commons/Sidebar';
import { Navbar } from './components/commons/Navbar';


export function App() {
	return (
		<div className="wrapper">
			<Sidebar/>
			<div className="main">
				<Navbar/>
				<div className="content">
					<div className="container">
						Router here
						<div className="p-3 mb-2 bg-primary text-white">.bg-primary</div>
						<div className="p-3 mb-2 bg-primary-subtle text-emphasis-primary">.bg-primary-subtle</div>
						<div className="p-3 mb-2 bg-secondary text-white">.bg-secondary</div>
						<div className="p-3 mb-2 bg-secondary-subtle text-emphasis-secondary">.bg-secondary-subtle</div>
						<div className="p-3 mb-2 bg-success text-white">.bg-success</div>
						<div className="p-3 mb-2 bg-success-subtle text-emphasis-success">.bg-success-subtle</div>
						<div className="p-3 mb-2 bg-danger text-white">.bg-danger</div>
						<div className="p-3 mb-2 bg-danger-subtle text-emphasis-danger">.bg-danger-subtle</div>
						<div className="p-3 mb-2 bg-warning text-dark">.bg-warning</div>
						<div className="p-3 mb-2 bg-warning-subtle text-emphasis-warning">.bg-warning-subtle</div>
						<div className="p-3 mb-2 bg-info text-dark">.bg-info</div>
						<div className="p-3 mb-2 bg-info-subtle text-emphasis-info">.bg-info-subtle</div>
						<div className="p-3 mb-2 bg-light text-dark">.bg-light</div>
						<div className="p-3 mb-2 bg-light-subtle text-emphasis-light">.bg-light-subtle</div>
						<div className="p-3 mb-2 bg-dark text-white">.bg-dark</div>
						<div className="p-3 mb-2 bg-dark-subtle text-emphasis-dark">.bg-dark-subtle</div>
						<p className="p-3 mb-2 bg-body-secondary">.bg-body-secondary</p>
						<p className="p-3 mb-2 bg-body-tertiary">.bg-body-tertiary</p>

						<div className="p-3 mb-2 bg-body text-body">.bg-body</div>
						<div className="p-3 mb-2 bg-black text-white">.bg-black</div>
						<div className="p-3 mb-2 bg-white text-dark">.bg-white</div>
						<div className="p-3 mb-2 bg-transparent text-body">.bg-transparent</div>
					</div>
				</div>
			</div>
		</div>
	);
}
