import {vi} from "vitest"
import * as useAuth from "../../hooks/useAuth.tsx";
import {fireEvent, render, screen, within} from "@testing-library/react";
import {UserMenu} from "./UserMenu.tsx";
describe('UserMenu', () => {
    const logoutFunction = vi.fn()
    beforeEach(() => {
        vi.clearAllMocks();

        vi.spyOn(useAuth, "useGetCurrentUser").mockReturnValue({
            data: {
                email: "test@test.com",
                isStaff: true,
                profile: { picture: "https://profile.jpg" },
            },
        } as any);

        vi.spyOn(useAuth, "useLogout").mockReturnValue({
            mutate: logoutFunction,
        } as any);

        vi.spyOn(global, "fetch").mockResolvedValue({
            ok: true,
            json: async () => ({
                fe: { version: "1.2.22" },
                be: { version: "0.1.23" },
            }),
        } as any);
    });

    it('renders correctly', async () => {
        render(<UserMenu />);
        expect(screen.getByText("test@test.com")).toBeInTheDocument();
        expect(screen.getByText("Django Admin")).toBeInTheDocument();
        expect(screen.getByTestId("user-profile-picture")).toHaveAttribute("src", "https://profile.jpg");
        const beVersionDiv = await screen.findByTestId('be-version')
        const feVersionDiv = await screen.findByTestId('fe-version')
        expect(beVersionDiv).toHaveTextContent('BE: v0.1.23');
        expect(feVersionDiv).toHaveTextContent('FE: v1.2.22');
    })
    it('does not render profile picture if url format is not correct', () => {
        vi.spyOn(useAuth, "useGetCurrentUser").mockReturnValue({
            data: {
                email: "test@test.com",
                isStaff: true,
                profile: { picture: "incorrect-url" },
            },
        } as any);
        render(<UserMenu />);
        expect(screen.queryByTestId("user-profile-picture")).not.toBeInTheDocument();
        expect(screen.queryByTestId("user-default-picture")).toBeInTheDocument();
    })
    it('renders information when version info is unavailable', () => {
        vi.spyOn(global, "fetch").mockResolvedValue({
            ok: true,
            json: async () => ({
            }),
        } as any);
        render(<UserMenu />);
        expect(screen.getByText("Version info unavailable")).toBeInTheDocument();
    })
    it('logout button calls logout function', async () => {
        render(<UserMenu />);
        fireEvent.click(screen.getByTestId('logout-button'))
        expect(logoutFunction).toBeCalled()
    })
    it('check toggle menu', () => {
        render(<UserMenu />);
        expect(screen.getByTestId('user-menu')).toHaveClass("opacity-0")
        fireEvent.click(screen.getByTestId('toggle-menu-button'))
        expect(screen.getByTestId('user-menu')).toHaveClass("opacity-100")
    })
    it('user menu should disappear when mouse leaves it', () => {
        render(<UserMenu />);
        fireEvent.click(screen.getByTestId('toggle-menu-button'))
        expect(screen.getByTestId('user-menu')).toHaveClass("opacity-100")
        fireEvent.mouseLeave(screen.getByTestId('user-menu'))
        expect(screen.getByTestId('user-menu')).toHaveClass("opacity-0")
    })
})