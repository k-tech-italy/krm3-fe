import {fireEvent, render, screen} from "@testing-library/react";
import {Login} from "./Login.tsx";
import {vi, Mock} from "vitest"
import * as useAuth from "../../hooks/useAuth.tsx";
import * as oauth from  "../../restapi/oauth"
import {useLocation} from "react-router-dom";

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual<any>("react-router-dom");
    return {
        ...actual,
        useLocation: vi.fn(),
        useNavigate: vi.fn()
    };
});
vi.mock("../../restapi/user", () => {
    return {
        logout: vi.fn()
    }
})

describe('Login', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useLocation as Mock).mockReturnValue({
            pathname: "",
            search: "",
            hash: "",
            state: null,
            key: "test-key"
        });
        vi.spyOn(useAuth, "useGetCurrentUser").mockReturnValue({
            data: {
            },
            isAuthenticated: false
        } as any);
    })
    it('renders correctly', () => {
        render(<Login/>)
        expect(screen.getByText("Login with Google")).toBeInTheDocument()
        expect(screen.getByText("Username or Email")).toBeInTheDocument()
        expect(screen.getByText("Password")).toBeInTheDocument()
        expect(screen.getByText("Forgot your password?")).toBeInTheDocument()
    })
    it('login click sends api call', () => {
        const loginMock =
            vi.spyOn(oauth, "loginUser").mockResolvedValue({
            refresh: "fake-refresh",
            access: "fake-access"
            } as any);
        render(<Login/>)
        fireEvent.change(screen.getByTestId("username-input"), { target: { value: "some_username" }})
        fireEvent.change(screen.getByTestId("password-input"), { target: { value: "some_password" }})
        fireEvent.click(screen.getByTestId("login-submit-button"))
        expect(loginMock).toBeCalled()
    })
    it('try to log in without username', () => {
        render(<Login/>)
    fireEvent.change(screen.getByTestId("password-input"), { target: { value: "some_password" }})
    fireEvent.click(screen.getByTestId("login-submit-button"))
    expect(screen.getByText("Username is required"))
    })
    it('try to log in without password', () => {
        render(<Login/>)
        fireEvent.change(screen.getByTestId("username-input"), { target: { value: "some_username" }})
        fireEvent.click(screen.getByTestId("login-submit-button"))
        expect(screen.getByText("Password is required"))
    })
    it('try to log in with incorrect email', () => {
        render(<Login/>)
        fireEvent.change(screen.getByTestId("username-input"), {target: {value: "not@a@valid@email"}})
        fireEvent.change(screen.getByTestId("password-input"), {target: {value: "some_password"}})
        fireEvent.click(screen.getByTestId("login-submit-button"))
        expect(screen.getByText("Please enter a valid email address"))
    })
    it('try to log in with google', () => {
        const googleLoginMock =
            vi.spyOn(oauth, 'loginGoogle').mockResolvedValue({} as any)
        render(<Login/>)
        fireEvent.click(screen.getByTestId("google-login-button"))
        expect(googleLoginMock).toBeCalled()
    })
    it('google authenticate' , () => {
        (useLocation as Mock).mockReturnValue({
            pathname: "",
            search: "?state=abc&code=123",
            hash: "",
            state: null,
            key: "test-key"
        });
        const googleAuthMock =
            vi.spyOn(oauth, 'googleAuthenticate').mockResolvedValue({} as any)
        render(<Login/>)
        expect(googleAuthMock).toBeCalled()
    })
    it('google login error display', async () => {
        vi.spyOn(oauth, 'loginGoogle').mockRejectedValue({
            error: "example error"
        } as any)
        render(<Login/>)
        fireEvent.click(screen.getByTestId("google-login-button"))
        expect(await screen.findByText(/Failed to connect to Google/i)).toBeInTheDocument();
    })
    it('google auth error display', async () => {
        (useLocation as Mock).mockReturnValue({
            pathname: "",
            search: "?state=abc&code=123",
            hash: "",
            state: null,
            key: "test-key"
        });
        vi.spyOn(oauth, 'googleAuthenticate').mockRejectedValue({ error: "example error"})
        render(<Login/>)
        expect(await screen.findByText("Google authentication failed. Please try again.")).toBeInTheDocument()
    })


})