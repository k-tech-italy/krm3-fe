import {Navbar} from "./Navbar.tsx";
import {render, screen} from "@testing-library/react";
import {vi} from "vitest";
import * as useView from "../../hooks/useView.tsx";
import * as useAuth from "../../hooks/useAuth";

describe('Navbar', () => {
    beforeEach(() => {
        vi.spyOn(useView, 'useMediaQuery').mockReturnValue(false);
        vi.mock("./UserMenu", () => {
            return {
                UserMenu: () => <div>Mocked User Menu</div>
            }
        })
        vi.mock("react-router-dom", async () => {
            const actual = await vi.importActual<any>("react-router-dom");
            return {
                ...actual,
                useLocation: () => ({
                    pathname: "/module1",
                    search: "",
                    hash: "",
                    state: null,
                    key: "test-key"
                })
            };
        });
        vi.spyOn(useAuth, "useGetCurrentUser").mockReturnValue({
            data: {
                config: {
                    modules: ["module1", "module2"],
                },
            },
        } as any);
    })
    it('renders correctly', () => {
        render(<Navbar />);
        expect(screen.getByText("module1")).toBeInTheDocument();
        expect(screen.getByText("module2")).toBeInTheDocument();
        expect(screen.getByText("module1")).toHaveClass("text-krm3-primary");
        expect(screen.getByText("module2")).toHaveClass("text-app");
        expect(screen.getByText("module1")).toHaveAttribute("href", "module1");
        expect(screen.getByText("Mocked User Menu")).toBeInTheDocument();
    })
    it('renders on small screen', () => {
        vi.spyOn(useView, 'useMediaQuery').mockReturnValue(true);
        render(<Navbar />);
        expect(screen.queryByText("module1")).not.toBeInTheDocument();
        expect(screen.getByText("Mocked User Menu")).toBeInTheDocument();
    })
})