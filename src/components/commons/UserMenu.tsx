import { logout } from '../../restapi/oauth';
import { useUserDetails } from '../../hooks/commons';


export function UserMenu() {
	const user = useUserDetails();

	const name = user?.username || '...';

	return (
		<div className="dropdown">
			<a href="#" className="d-flex align-items-center text-decoration-none dropdown-toggle"
			   data-bs-toggle="dropdown" aria-expanded="false">
				<img src="https://avatars.githubusercontent.com/u/6311869?s=40&v=4" alt="" width="32"
					 height="32"
					 className="rounded-circle me-2"/>
				<strong className="d-none d-sm-block">{name}</strong>
			</a>
			{user &&
				<ul className="dropdown-menu dropdown-menu-end shadow">
					<li><a className="dropdown-item" href="#" onClick={logout}>Sign out</a></li>
				</ul>
			}
		</div>
	);
}