import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { Home } from "./pages/Home";
import { Mission } from "./components/missions/Mission";
import { Navbar } from "./components/commons/Navbar";
import { Login } from './components/commons/Login';
import { User } from "./pages/User";
import { useMediaQuery } from './hooks/commons';
import BottomTabNavigation from './components/commons/MobileTab';


const queryClient = new QueryClient();

export function App() {
    const isSmallScreen = useMediaQuery('(max-width: 768px)');

    return (
        <QueryClientProvider client={queryClient}>
            {window.location.pathname !== '/login' ? (
                <div className="wrapper">
                    <div className="main bg-slate-50">
                        <Navbar />
                        <div className='pb-14'>
                            <BrowserRouter future={{ v7_startTransition: true }}>
                                <Routes>
                                    <Route path="/" element={<Home />} />
                                    <Route path="/home" element={<Home />} />
                                    <Route path="/user" element={<User />} />
                                    <Route path="/mission/:id" element={<Mission />} />
                                </Routes>
                            </BrowserRouter>
                        </div>
                        {isSmallScreen && <BottomTabNavigation />}
                    </div>
                </div>) : (
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                    </Routes>
                </BrowserRouter>
            )}


        </QueryClientProvider>
    );
}
