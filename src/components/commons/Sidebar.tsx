import React from 'react';

import "../../index.scss"


export function Sidebar() {
    return (
        <div className="d-flex flex-column flex-shrink-0 p-3 text-bg-dark offcanvas offcanvas-start sidebar"
             data-bs-scroll="true" data-bs-backdrop="true" id="offcanvasSidebar">
            <div className="sidebar-content sticky-top">

                <a href="/"
                   className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                    <h2>KRM³</h2>
                </a>
                <hr/>
                <ul className="nav nav-pills flex-column mb-auto">
                    <li className="nav-item">
                        <a href="#" className="nav-link active" aria-current="page">
                            😃 Home
                        </a>
                    </li>
                    <li>
                        <a href="#" className="nav-link text-white">
                            😃 Dashboard
                        </a>
                    </li>
                    <li>
                        <a href="#" className="nav-link text-white">
                            😃 Orders
                        </a>
                    </li>
                    <li>
                        <a href="#" className="nav-link text-white">
                            😃 Products
                        </a>
                    </li>
                    <li>
                        <a href="#" className="nav-link text-white">
                            😃 Customers
                        </a>
                    </li>
                </ul>
                <hr/>
                <p className="text-end small">v {process.env.REACT_APP_VERSION}</p>

            </div>

        </div>
    );
}
