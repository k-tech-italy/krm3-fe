import {BrowserRouter, Route, Routes, Navigate} from "react-router-dom";
import {QueryClient, QueryClientProvider} from "react-query";
import {MissionPage} from "./pages/MissionPage";
import {Mission} from "./components/missions/Mission";
import {Navbar} from "./components/commons/Navbar";
import {Login} from "./components/commons/Login";
import {LogoutPage} from "./pages/Logout";
import {useMediaQuery} from "./hooks/useView";
import {useGetCurrentUser} from "./hooks/useAuth";
import Timesheet from "./pages/Timesheet";
import LoadSpinner from "./components/commons/LoadSpinner";
import {ToastContainer} from "react-toastify";
import "./index.css";
import { Welcome } from "./pages/Welcome";
import React from "react";
import Contacts from "./pages/Contacts.tsx";
import ContactDetailsPage from "./pages/ContactDetailsPage.tsx";
import {AuthProvider} from "./components/commons/AuthContext.tsx";
import {LanguageProvider} from "./components/commons/LanguageContext.tsx";
import {CookiesProvider} from "react-cookie";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
      />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="/*" element={<AuthenticatedRoutes />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function AuthenticatedRoutes() {
    const {data: currentUser, isLoading, isError} = useGetCurrentUser();
    const isSmallScreen = useMediaQuery("(max-width: 768px)");

    if (isLoading) {
        return <LoadSpinner/>;
    }
    // Redirect to login if there's an error or no user
    if (isError || !currentUser) {
        return <Navigate to="/login" replace/>;
    }

    const modules = currentUser.config.modules
    const defaultModule = currentUser.config.defaultModule


  const routeGuards = [
    {
      guard: modules.map(m => m.url).includes('trasferte'),
      route: <Route path="/trasferte/:id" element={<Mission />} />,
    },
    {
      guard: modules.map(m => m.url).includes('timesheet'),
      route: <Route path="/timesheet" element={<Timesheet />} />,
    },
    {
      guard: modules.map(m => m.url).includes('contacts'),
      route: <Route path="/contacts" element={<Contacts />} />,
    },
    {
      guard: modules.map(m => m.url).includes('contacts'),
      route: <Route path="/contacts/:id" element={<ContactDetailsPage />} />,
    },
    {
      guard: true,
      route: <Route path="/" element={defaultModule ? <Navigate to={'/' + defaultModule}  /> : <Welcome/> } />,
    },
    {
      guard: modules.map(m => m.url).includes('trasferte'),
      route: <Route path="/trasferte" element={<MissionPage />} />,
    },
    {
      guard: true,
      route: <Route path="*" element={<Navigate to="/"  />} />,
    },
  ]
  return (
    <div className="wrapper">
      <div className="main bg-app">
        <CookiesProvider><AuthProvider><LanguageProvider><Navbar/></LanguageProvider></AuthProvider></CookiesProvider>
        <div className="pb-16">
          <Routes>
            {routeGuards.map((routeGuard, idx) => (
              <React.Fragment key={idx}>
                {routeGuard.guard && routeGuard.route}
              </React.Fragment>
            ))}
          </Routes>
        </div>
      </div>
    </div>
  );
}
