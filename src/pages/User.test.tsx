import { render, screen } from "@testing-library/react";
import { User } from "./User";
import { vi } from "vitest";
import { User as UserType } from "../restapi/types";
import {isValidUrl} from "../components/timesheet/utils/utils.ts";

let mockUseGetCurrentUserImpl: () => any = () => ({ data: null });
vi.mock("../hooks/useAuth", () => ({
  useGetCurrentUser: () => mockUseGetCurrentUserImpl(),
}));
vi.mock("../components/commons/LoadSpinner", () => ({ default: () => <div>Loading...</div> }));
vi.mock("lucide-react", () => ({ CircleUserRound: () => <svg data-testid="user-icon" /> }));
vi.mock('../components/timesheet/utils/utils.ts', () => ({
  isValidUrl: vi.fn(),
}))

describe("User", () => {
  it("renders loading spinner if no user", () => {
    mockUseGetCurrentUserImpl = () => ({ data: null });
    render(<User />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
  it("renders user profile info", () => {
    mockUseGetCurrentUserImpl = () => ({
      data: { id: 1, username: "test", email: "test@test.com", firstName: "Test", lastName: "User",
        profile: {}} as UserType
    });
    render(<User />);
    expect(screen.getByDisplayValue("test")).toBeInTheDocument();
    expect(screen.getByDisplayValue("test@test.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test")).toBeInTheDocument();
    expect(screen.getByDisplayValue("User")).toBeInTheDocument();
    expect(screen.getByTestId("user-icon")).toBeInTheDocument();
  });
  it('renders image when valid URL is provided', () => {
    mockUseGetCurrentUserImpl = () => ({
      data: { id: 1, username: "test", email: "test@test.com", firstName: "Test", lastName: "User",
        profile: {picture: 'http://example_url'}} as UserType
    });
    const mockIsValidUrl = isValidUrl as unknown as { mockReturnValue: (v: boolean) => void }
    mockIsValidUrl.mockReturnValue(true)

    render(<User />)
    const img = screen.getByAltText('user profile picture')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'http://example_url')
  })
}); 