import {vi} from "vitest"
import * as useAuth from "../../hooks/useAuth.tsx";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import UserMenu from "./UserMenu.tsx";
import {AuthProvider} from "./AuthContext.tsx";
describe('UserMenu', () => {
    const logoutFunction = vi.fn()
    beforeEach(() => {
        vi.clearAllMocks();

        vi.spyOn(useAuth, "useGetCurrentUser").mockReturnValue({
            data: {
                id: 123,
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
        render(<AuthProvider><UserMenu/></AuthProvider>);
        fireEvent.click(screen.getByTestId('toggle-menu-button'))
        expect(screen.getByText("test@test.com")).toBeInTheDocument();
        expect(screen.getByText("Django Admin")).toBeInTheDocument();
        expect(screen.getByTestId("user-profile-picture")).toHaveAttribute("src", "https://profile.jpg");
        const dropDown = await screen.findByTestId('user-menu')
        await waitFor(() => {
            expect(dropDown).toHaveTextContent('BE: v0.1.23');
            expect(dropDown).toHaveTextContent('FE: v1.2.22');
        });
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
        fireEvent.click(screen.getByTestId('toggle-menu-button'))
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
    it('renders Profile, Documents and Sign Out links', () => {
        render(<AuthProvider><UserMenu /></AuthProvider>);
        fireEvent.click(screen.getByTestId('toggle-menu-button'))

        const profileLink = screen.getByRole('link', { name: /profile/i })
        expect(profileLink).toBeInTheDocument()
        expect(profileLink).toHaveAttribute('href', 'be/resource/123/')

        const documentsLink = screen.getByRole('link', { name: /documents/i })
        expect(documentsLink).toBeInTheDocument()
        expect(documentsLink).toHaveAttribute('href', 'be/documents/')

        const signOutButton = screen.getByRole('button', { name: /sign out/i })
        expect(signOutButton).toBeInTheDocument()
    })
})