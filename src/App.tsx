import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { Home } from "./pages/Home";
import { Mission } from "./components/missions/Mission";
import { Navbar } from "./components/commons/Navbar";
import { Login } from "./components/commons/Login";
import { User } from "./pages/User";
import { LogoutPage } from "./pages/Logout";
import { useMediaQuery } from "./hooks/useView";
import { useGetCurrentUser } from "./hooks/useAuth";
import BottomTabNavigation from "./components/commons/MobileTab";
import Timesheet from "./pages/Timesheet";
import LoadSpinner from "./components/commons/LoadSpinner";
import { ToastContainer } from "react-toastify";
import "./index.css";

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
  const { data: currentUser, isLoading, isError } = useGetCurrentUser();
  const isSmallScreen = useMediaQuery("(max-width: 768px)");

  if (isLoading) {
    return <LoadSpinner />;
  }
  // Redirect to login if there's an error or no user
  if (isError || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="wrapper">
      <div className="main bg-slate-50">
        <Navbar />
        <div className=" pb-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/user" element={<User />} />
            <Route path="/mission/:id" element={<Mission />} />
            <Route path="/timesheet" element={<Timesheet />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        {isSmallScreen && <BottomTabNavigation />}
      </div>
    </div>
  );
}
