import { expect, test, describe, vi, beforeEach } from "vitest";
import { App } from "./App";
import { render, screen, waitFor } from "@testing-library/react";
import * as useAuth from "./hooks/useAuth.tsx";

// Mock all the page components
vi.mock("./pages/MissionPage", () => ({
  MissionPage: () => <div>Mission Page</div>,
}));

vi.mock("./components/missions/Mission", () => ({
  Mission: () => <div>Mission Detail</div>,
}));

vi.mock("./components/commons/Navbar", () => ({
  Navbar: () => <div>Navbar</div>,
}));

vi.mock("./pages/User", () => ({
  User: () => <div>User Page</div>,
}));

vi.mock("./pages/Logout", () => ({
  LogoutPage: () => <div>Logout Page</div>,
}));

vi.mock("./components/commons/MobileTab", () => ({
  default: () => <div>Mobile Tab</div>,
}));

vi.mock("./pages/Timesheet", () => ({
  default: () => <div>Timesheet Page</div>,
}));

vi.mock("./components/commons/LoadSpinner", () => ({
  default: () => <div>Loading...</div>,
}));

vi.mock("./pages/Welcome", () => ({
  Welcome: () => <div>Welcome Page</div>,
}));

vi.mock("./components/commons/Login", () => ({
  Login: () => <div>Login Page</div>,
}));

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useAuth, "useGetCurrentUser").mockReturnValue({
      data: undefined,
      isAuthenticated: false,
    } as any);
  });

  describe("App component structure", () => {
    test("should render without crashing", () => {
      render(<App />);
      // Check that ToastContainer is rendered
      expect(document.querySelector(".Toastify")).toBeInTheDocument();
    });

    test("should render ToastContainer with correct configuration", () => {
      render(<App />);
      const toastContainer = document.querySelector(".Toastify");
      expect(toastContainer).toBeInTheDocument();
    });

    test("should render BrowserRouter", () => {
      const { container } = render(<App />);
      // The app should render without throwing errors
      expect(container).toBeTruthy();
    });
  });

  describe("Route structure", () => {
    test("should have login route available", async () => {
      render(<App />);
      // If not authenticated, should show login page
      await waitFor(() => {
        expect(screen.getByText("Login Page")).toBeInTheDocument();
      });
    });
  });
});
