import {Mission} from "./Mission.tsx";
import {render, screen, fireEvent} from "@testing-library/react";
import {vi} from "vitest"
import * as useMissons from "../../hooks/useMissions";
import * as useView from "../../hooks/useView";

vi.mock("../expense/edit/ExpenseEdit", () => {
    return { ExpenseEdit: vi.fn(() => <div>Mocked ExpenseEdit</div>)}
})
import {ExpenseEdit} from "../expense/edit/ExpenseEdit.tsx";
import moment from "moment/moment";
import {City, Currency, ExpenseInterface, MissionInterface, Project, Resource} from "../../restapi/types.ts";
vi.mock("react-router-dom", async () => {
    const actual: any = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useParams: () => ({ id: "1" }),
    };
});
describe('Mission', () => {
    beforeEach(() => {
        vi.spyOn(useMissons, "useGetMission").mockReturnValue({
            dataUpdatedAt: 0,
            error: null,
            errorUpdatedAt: 0,
            failureCount: 0,
            isError: false,
            isFetched: false,
            isFetchedAfterMount: false,
            isFetching: false,
            isIdle: false,
            isLoading: false,
            isLoadingError: false,
            isPlaceholderData: false,
            isPreviousData: false,
            isRefetchError: false,
            isRefetching: false,
            isStale: false,
            isSuccess: true,
            status: 'success',
            refetch: vi.fn(),
            remove: vi.fn(),
            data: {
                city: {
                    id: 1,
                    name: "Warsaw",
                    country: 1,
                } as City,
                defaultCurrency: {
                    iso3: "PLN",
                    title: "zloty",
                    symbol: "zł",
                    fractionalUnit: "grosz",
                    base: 100,
                    active: true,
                } as Currency,
                fromDate: "2025-01-01",
                id: 1,
                number: 1,
                title: "some mission",
                project: {
                    id: 1,
                    name: "example project",
                    notes: "",
                    client: 1,
                } as Project,
                resource: {
                    id: 1,
                    firstName: "Jan",
                    lastName: "Kowal",
                    profile: {
                        id: 1,
                        user: 1,
                        picture: "some/path",
                    }
                } as Resource,
                toDate: "2026-01-01",
                year: 2025,
                expenses: [
                    {
                        active: true,
                        id: 123,
                        currency: "PLN",
                        title: "Example title",
                        amountCurrency: "101",
                        amountReimbursement: "102",
                        day: "2025-01-05",
                        amountBase: "103",
                        detail: "some details",
                        image: "some/image/path",
                        createdTs: "2025-01-01",
                        modifiedTs: "2025-01-02",
                        mission: 1,
                        documentType: {
                            active: true,
                            default: false,
                            id: 1,
                            title: "some document type",
                        },
                        category: {
                            active: true,
                            id: 1,
                            str: "some category",
                            title: "some category title",
                        },
                        paymentType: {
                            active: true,
                            id: 0,
                            title: "some payment type",
                            str: "some payment type",
                        } as const,
                        reimbursement: 0,
                    } as ExpenseInterface
                ]
            } as MissionInterface,
            errorUpdateCount: 0
        })
        vi.spyOn(useView, "useMediaQuery").mockReturnValue(false)
    })
    it('renders correctly', () => {
        render(<Mission />)
        expect(screen.getByText("Warsaw")).toBeInTheDocument()
        expect(screen.getByText("366 days")).toBeInTheDocument()
        expect(screen.getByText("example project")).toBeInTheDocument()
        expect(screen.getByText("Jan Kowal")).toBeInTheDocument()
        expect(screen.getByText("Number Mission: 1")).toBeInTheDocument()
        expect(screen.getByText("some mission")).toBeInTheDocument()
        expect(screen.queryByTestId("add-expense-button")).toBeInTheDocument()
    })
    it('does not render add expense button on small screen', () => {
        vi.spyOn(useView, "useMediaQuery").mockReturnValue(true)
        render(<Mission />)
        expect(screen.queryByTestId("add-expense-button")).not.toBeInTheDocument()
    })
    it('click on expense should render ExpenseEdit with correct params', () => {
        render(<Mission />)
        expect(screen.queryByText("Mocked ExpenseEdit")).not.toBeInTheDocument();
        fireEvent.click(screen.getByText("some payment type"));
        expect(screen.getByText("Mocked ExpenseEdit")).toBeInTheDocument();
        expect(ExpenseEdit).toBeCalledWith(
            {
                show: true,
                expense: expect.objectContaining({
                    active: true,
                    id: 123,
                    currency: "PLN",
                    title: "Example title",
                    amountCurrency: "101",
                    amountReimbursement: "102",
                    day: "2025-01-05",
                    amountBase: "103",
                    detail: "some details",
                    image: "some/image/path",
                    createdTs: "2025-01-01",
                    modifiedTs: "2025-01-02",
                }),
                onClose: expect.any(Function)
            },
            expect.any(Object)
        )
    })
    it('clicking on add expense button opens ExpenseEdit with default parameters', () => {
        render(<Mission />)
        expect(screen.queryByText("Mocked ExpenseEdit")).not.toBeInTheDocument();
        fireEvent.click(screen.getByTestId("add-expense-button"));
        expect(screen.getByText("Mocked ExpenseEdit")).toBeInTheDocument();
        const today = new Date();
        expect(ExpenseEdit).toBeCalledWith(
            {
                show: true,
                expense: {
                    mission: 1,
                    amountCurrency: '0',
                    day: moment(today).format('YYYY-MM-DD')
                },
                onClose: expect.any(Function)
            },
            expect.any(Object)
        )
    })
})