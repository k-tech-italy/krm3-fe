import React from 'react';
import {useGetCurrentUser} from "../../hooks/commons";
import {clearToken} from "../../restapi/oauth";


export function UserMenu() {
    const user = useGetCurrentUser();

    function handleLogout() {
        clearToken();
        window.location.replace('/login');
    }

    return (
        <div className="dropdown">
            <a href="src/components/commons/UserMenu#" className="d-flex align-items-center text-decoration-none dropdown-toggle"
               data-bs-toggle="dropdown" aria-expanded="false">
                <img src="https://avatars.githubusercontent.com/u/6311869?s=40&v=4" alt="" width="32"
                     height="32"
                     className="rounded-circle me-2"/>
                <strong className="d-none d-sm-block">{user?.email}</strong>
            </a>
            <ul className="dropdown-menu dropdown-menu-end shadow">
                <li><a className="dropdown-item" href="#">Settings</a></li>
                <li><a className="dropdown-item" href={`user/`}>Profile</a></li>
                <li>
                    <hr className="dropdown-divider"/>
                </li>
                <li><a className="dropdown-item" onClick={handleLogout}>Sign out</a></li>
            </ul>
        </div>
    );
}
