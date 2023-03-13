import React from 'react';


export function Navbar() {
	return (
		<nav className="navbar bg-white text-body shadow">
			<div className="container-fluid">
				<div className="sidebar-toggle">≡</div>
				<div className="dropdown">
					<a href="#" className="d-flex align-items-center text-decoration-none dropdown-toggle"
					   data-bs-toggle="dropdown" aria-expanded="false">
						<img src="https://avatars.githubusercontent.com/u/6311869?s=40&v=4" alt="" width="32" height="32"
							 className="rounded-circle me-2"/>
						<strong>Saverio Caminiti</strong>
					</a>
					<ul className="dropdown-menu dropdown-menu-end shadow">
						<li><a className="dropdown-item" href="#">New project...</a></li>
						<li><a className="dropdown-item" href="#">Settings</a></li>
						<li><a className="dropdown-item" href="#">Profile</a></li>
						<li>
							<hr className="dropdown-divider"/>
						</li>
						<li><a className="dropdown-item" href="#">Sign out</a></li>
					</ul>
				</div>
			</div>
		</nav>
	);
}
