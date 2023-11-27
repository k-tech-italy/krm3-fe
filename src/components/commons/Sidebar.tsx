import React from 'react';

import "../../index.scss"


export function Sidebar() {
	return (
		<div id="sidebar"
			 className="d-flex flex-column flex-shrink-0 p-3 text-bg-dark offcanvas offcanvas-start sidebar"
			 data-bs-scroll="true" data-bs-backdrop="true" style={{width: 280}}>
			<div className="sidebar-content sticky-top">

				<a href="/"
				   className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
					<h2>KRM³</h2>
				</a>
				<hr/>
				<ul className="nav nav-pills flex-column mb-auto">
					<li className="nav-item">
						<a href={`/`} className="nav-link active" aria-current="page">
							<i className="icon kt-icon-mission"/> Trasferte
						</a>
					</li>
					<li>
						<a href="#" className="nav-link text-white">
							<i className="icon kt-icon-refund"/> Rimborsi
						</a>
					</li>
					<li>
						<a href="https://krm.k-tech.it/" className="nav-link text-white">
							<i className="icon kt-icon-timesheet"/> Foglio ore
						</a>
					</li>
				</ul>
				<hr/>
				<p className="text-end small">v {process.env.REACT_APP_VERSION}</p>
			</div>
		</div>
	);
}
