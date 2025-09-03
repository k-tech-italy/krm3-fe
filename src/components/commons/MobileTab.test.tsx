import MobileTab from "./MobileTab.tsx";
import {fireEvent, queryByTestId, render, screen} from "@testing-library/react";
import {vi} from "vitest";
import { CreateMission } from "../missions/create/CreateMission";
import { ExpenseEdit } from "../expense/edit/ExpenseEdit";

describe('MobileTab', () => {
    const mockedWindowLocationReplace = vi.fn()
    beforeEach(() => {
        Object.defineProperty(window, 'location', {
            writable: true,
            value: {
                pathname: '/trasferte',
                replace: mockedWindowLocationReplace,
            },
        });

    });

    it('renders correctly for /transferte', () => {
        render(<MobileTab />);
        expect(screen.getByTestId("home-icon")).toBeInTheDocument();
        expect(screen.getByTestId("file-icon")).toBeInTheDocument();
        expect(screen.getByTestId("plus-icon")).toBeInTheDocument();
        expect(screen.getByTestId("clock-icon")).toBeInTheDocument();
        expect(screen.getByTestId("settings-icon")).toBeInTheDocument();
    })
    it('renders correctly for /timesheet', () => {
        Object.defineProperty(window, 'location', {
            writable: true,
            value: { pathname: '/timesheet' },
        });
        render(<MobileTab />);
        expect(screen.getByTestId("home-icon")).toBeInTheDocument();
        expect(screen.getByTestId("file-icon")).toBeInTheDocument();
        expect(screen.queryByTestId("plus-icon")).not.toBeInTheDocument();
        expect(screen.getByTestId("clock-icon")).toBeInTheDocument();
        expect(screen.getByTestId("settings-icon")).toBeInTheDocument();
    })
    it('check icons click', () => {
        vi.mock("../missions/create/CreateMission", () => {
            return {
                CreateMission: () => <div>Mocked Create Mission</div>
            }
        })
        render(<MobileTab />);
        fireEvent.click(screen.getByTestId("home-icon"))
        expect(mockedWindowLocationReplace).toBeCalledWith("/")
        fireEvent.click(screen.getByTestId("file-icon"))
        expect(mockedWindowLocationReplace).toBeCalledWith("/")
        fireEvent.click(screen.getByTestId("plus-icon"))
        expect(screen.getByText("Mocked Create Mission")).toBeInTheDocument();
        fireEvent.click(screen.getByTestId("settings-icon"))
        expect(mockedWindowLocationReplace).toBeCalledWith("/")
        fireEvent.click(screen.getByTestId("clock-icon"))
        expect(mockedWindowLocationReplace).toBeCalledWith("/timesheet")
    })
    it('opens expense modal from home view', () => {
        Object.defineProperty(window, 'location', {
            value: {
                pathname: '/',
            }
        })
        vi.mock("../expense/edit/ExpenseEdit", () => {
            return { ExpenseEdit: () => <div>Mocked Expense Edit</div> }
        })
        render(<MobileTab />);
        fireEvent.click(screen.getByTestId("plus-icon"))
        expect(screen.getByText("Mocked Expense Edit")).toBeInTheDocument();
    })
})