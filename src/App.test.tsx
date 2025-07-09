import { expect, test, vi } from "vitest";
import { Login } from "./components/commons/Login";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";

// Mock the user API
vi.mock("./restapi/user", () => ({
  getCurrentUser: () => Promise.resolve(null),
  logout: () => Promise.resolve(),
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </QueryClientProvider>
  );
}

test("renders login form with username and password fields", () => {
  renderWithProviders(<Login />);
  // Check for username field
  expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
  // Check for password field
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  // Check that both login button is present
  const loginButtons = screen.getAllByRole('button', { name: /login/i });
  expect(loginButtons).toHaveLength(2);
  expect(loginButtons[0]).toBeInTheDocument();
  expect(loginButtons[1]).toBeInTheDocument();
});