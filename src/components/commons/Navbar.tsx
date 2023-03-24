import { UserMenu } from './UserMenu';


export function Navbar() {
	return (
		<nav className="navbar sticky-top bg-white text-body shadow">
			<div className="container-fluid">
				<div className="sidebar-toggle">
					<button className="btn btn-primary" type="button" data-bs-toggle="offcanvas"
							data-bs-target="#sidebar">
						<i className="icon kt-icon-menu"/>
					</button>
				</div>
				<UserMenu/>
			</div>
		</nav>
	);
}
