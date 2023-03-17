import React from 'react';

import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";

import { Home } from "./pages/Home";
import { Mission } from "./components/Mission";
import { Sidebar } from "./components/commons/Sidebar";
import { Navbar } from "./components/commons/Navbar";
import { Login } from './components/commons/Login';


const queryClient = new QueryClient();


function Layout() {
	return (
		<QueryClientProvider client={queryClient}>
			<Outlet/>
		</QueryClientProvider>
	);
}

const router = createBrowserRouter([
	{
		path: "/",
		element: <Layout/>,
		children: [
			{
				path: "/",
				element: <Home/>,
			},
			{
				path: "/login",
				element: <Login/>,
			},
			{
				path: "mission/:id",
				element: <Mission/>,
			},
		],
	},
]);

export function App() {
	return (
		<div className="wrapper">
			<Sidebar/>
			<div className="main">
				<Navbar/>
				<div className="content p-3 pt-4">
					<div className="container-fluid">
						<RouterProvider router={router}/>
					</div>
				</div>
			</div>
		</div>
	);
}
