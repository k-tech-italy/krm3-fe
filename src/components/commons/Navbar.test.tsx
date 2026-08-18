import { Navbar } from "./Navbar.tsx";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import * as useView from "../../hooks/useView.tsx";
import * as useAuth from "../../hooks/useAuth";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "./AuthContext.tsx";
import { MemoryRouter } from "react-router-dom";

describe("Navbar", () => {
  beforeEach(() => {
    vi.spyOn(useView, "useMediaQuery").mockReturnValue(false);
    vi.mock("./UserMenu", () => {
      return {
        default: () => {
          return <div>Mocked User Menu</div>;
        },
      };
    });
    vi.mock("./LanguageSwitcher", () => {
      return {
        default: () => {
          return <div>Mocked Language switcher</div>;
        },
      };
    });
    vi.spyOn(useAuth, "useGetCurrentUser").mockReturnValue({
      data: {
        config: {
          modules: [
            {
              url: "module1",
              label: "module1",
            },
            {
              url: "module2",
              label: "module2",
            },
          ],
        },
      },
    } as unknown as ReturnType<typeof useAuth.useGetCurrentUser>);
  });
  function renderNavbar(initialPath = "/") {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <AuthProvider>
          <Navbar />
        </AuthProvider>
      </MemoryRouter>
    );
  }
  it("renders correctly", () => {
    renderNavbar("/module1");
    expect(screen.getByText("module1")).toBeInTheDocument();
    expect(screen.getByText("module2")).toBeInTheDocument();
    expect(screen.getByText("module1")).toHaveClass("text-krm3-primary");
    expect(screen.getByText("module2")).toHaveClass("text-app");
    expect(screen.getByText("module1")).toHaveAttribute("href", "/module1");
    expect(screen.getByText("Mocked User Menu")).toBeInTheDocument();
  });
  it("renders on small screen", () => {
    vi.spyOn(useView, "useMediaQuery").mockReturnValue(true);
    renderNavbar();
    expect(screen.queryByText("module1")).not.toBeInTheDocument();
    expect(screen.queryByText("Mocked User Menu")).not.toBeInTheDocument();
  });
  it("opens mobile menu on hamburger click", () => {
    vi.spyOn(useView, "useMediaQuery").mockReturnValue(true);
    renderNavbar();

    // Initially, menu items should not be visible
    expect(screen.queryByText("module1")).not.toBeInTheDocument();
    expect(screen.queryByText("module2")).not.toBeInTheDocument();
    expect(screen.queryByText("Mocked User Menu")).not.toBeInTheDocument();

    // Click the hamburger menu button
    const hamburgerButton = screen.getByRole("button", { name: /toggle menu/i });
    userEvent.click(hamburgerButton);

    // After clicking, menu items should be visible
    expect(screen.getByText("module1")).toBeInTheDocument();
    expect(screen.getByText("module2")).toBeInTheDocument();
    expect(screen.getByText("Mocked User Menu")).toBeInTheDocument();
  });
  it("renders language switcher in mobile menu after hamburger click", async () => {
    vi.spyOn(useView, "useMediaQuery").mockReturnValue(true);
    renderNavbar();

    // Not visible before menu opens
    expect(screen.queryByText("Mocked Language switcher")).not.toBeInTheDocument();

    const hamburgerButton = screen.getByRole("button", { name: /toggle menu/i });
    await userEvent.click(hamburgerButton);

    // Visible after menu opens
    expect(screen.getByText("Mocked Language switcher")).toBeInTheDocument();
  });
});
