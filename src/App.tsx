import React from 'react';

import {BrowserRouter, Route, Routes} from "react-router-dom";
import {QueryClient, QueryClientProvider} from "react-query";

import {Home} from "./pages/Home";
import {Mission} from "./components/missions/Mission";
import {Sidebar} from "./components/commons/Sidebar";
import {Navbar} from "./components/commons/Navbar";
import {Login} from './components/commons/Login';
import {User} from "./pages/User";


const queryClient = new QueryClient();

export function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <div className="wrapper">
                <Sidebar/>
                <div className="main">
                    <Navbar/>
                        <div className="container-fluid  p-3 pt-4">
                            <BrowserRouter>
                                <Routes>
                                    <Route path="/" element={<Home/>}/>
                                    <Route path="/home" element={<Home/>}/>
                                    <Route path="/login" element={<Login/>}/>
                                    <Route path="/user" element={<User/>}/>
                                    <Route path="/mission/:id" element={<Mission/>}/>
                                </Routes>
                            </BrowserRouter>
                        </div>
                </div>
            </div>
        </QueryClientProvider>
    );
}
