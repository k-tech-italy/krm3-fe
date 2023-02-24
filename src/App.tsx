import React from 'react';
import { Alert, Dropdown, Tooltip } from 'bootstrap';


export function App() {
	console.log(Alert.VERSION);
	console.log(Dropdown.VERSION);
	console.log(Tooltip.VERSION);
	return (
		<div>
			<nav className="navbar navbar-expand-lg bg-body-tertiary">
				<div className="container-fluid">
					<a className="navbar-brand" href="#">Navbar</a>
					<button className="navbar-toggler" type="button" data-bs-toggle="collapse"
							data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
							aria-expanded="false" aria-label="Toggle navigation">
						<span className="navbar-toggler-icon"></span>
					</button>
					<div className="collapse navbar-collapse" id="navbarSupportedContent">
						<ul className="navbar-nav me-auto mb-2 mb-lg-0">
							<li className="nav-item">
								<a className="nav-link active" aria-current="page" href="#">Home</a>
							</li>
							<li className="nav-item">
								<a className="nav-link" href="#">Link</a>
							</li>
							<li className="nav-item dropdown">
								<a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
								   aria-expanded="false">
									Dropdown
								</a>
								<ul className="dropdown-menu">
									<li><a className="dropdown-item" href="#">Action</a></li>
									<li><a className="dropdown-item" href="#">Another action</a></li>
									<li>
										<hr className="dropdown-divider"/>
									</li>
									<li><a className="dropdown-item" href="#">Something else here</a></li>
								</ul>
							</li>
							<li className="nav-item">
								<a className="nav-link disabled">Disabled</a>
							</li>
						</ul>
						<form className="d-flex" role="search">
							<input className="form-control me-2" type="search" placeholder="Search"
								   aria-label="Search"/>
							<button className="btn btn-outline-success" type="submit">Search</button>
						</form>
					</div>
				</div>
			</nav>
			<h1>
				Krm3 v{process.env.REACT_APP_VERSION}
				<button type="button" className="btn btn-primary">Primary</button>
			</h1>
			<div className="alert alert-warning alert-dismissible fade show" role="alert">
				<strong>Holy guacamole!</strong> You should check in on some of those fields below.
				<button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"/>
			</div>
		</div>
	);
}
