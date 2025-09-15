import {fireEvent, render, screen} from "@testing-library/react";
import FilterResource from "./filter.tsx";
import {vi} from "vitest"
describe('FilterResource Component', () => {
    const mockedHandleFilter = vi.fn();
    const props = {
        handleFilter: mockedHandleFilter,
        isAdmin: true,
        data: {
            count: 1,
            next: null,
            previous: null,
            results: [{
                city: {
                    id: 1,
                    name: "Warsaw",
                    country: 1,
                },
                defaultCurrency: {
                    iso3: "PLN",
                    title: "zloty",
                    symbol: "zł",
                    fractionalUnit: "grosz",
                    base: 100,
                    active: true,
                },
                fromDate: "2025-01-01",
                toDate: "2025-02-02",
                id: 1,
                number: 1,
                title: "some mission",
                project: {
                    id: 1,
                    name: "example project",
                    notes: "",
                    client: 1,
                },
                resource: {
                    id: 1,
                    firstName: "Jan",
                    lastName: "Kowal",
                    profile: {
                        id: 1,
                        user: 1,
                        picture: "some/path",
                    }
                },
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
                    }
                ]
            },
                {
                    city: {
                        id: 2,
                        name: "Krakow",
                        country: 1,
                    },
                    defaultCurrency: {
                        iso3: "EUR",
                        title: "euro",
                        symbol: "€",
                        fractionalUnit: "cent",
                        base: 100,
                        active: true,
                    },
                    fromDate: "2026-06-01",
                    toDate: "2026-06-03",
                    id: 2,
                    number: 2,
                    title: "another mission",
                    project: {
                        id: 2,
                        name: "another project",
                        notes: "notes",
                        client: 2,
                    },
                    resource: {
                        id: 2,
                        firstName: "Anna",
                        lastName: "Nowak",
                        profile: {
                            id: 2,
                            user: 2,
                            picture: "another/path",
                        },
                    },
                    year: 2025,
                    expenses: [],
                }]
        }
    }
    it('renders correctly for Admin', () => {
        render(<FilterResource {...props} />)
        expect(screen.getByText("Filtro:")).toBeInTheDocument()
    })
    it('renders correctly for no Admin', () => {
        render(<FilterResource {...props} isAdmin={false}/>)
        expect(screen.queryByText("Filtro:")).not.toBeInTheDocument()
        expect(screen.getByText("Reset")).toBeInTheDocument()
        expect(screen.getByText("Filter")).toBeInTheDocument()
    })
    it('filters correctly by resource', () => {
        render(<FilterResource {...props} />)
        fireEvent.change(screen.getByTestId("filter-input"), {target: {value : "Jan"}})
        expect(mockedHandleFilter).toBeCalledTimes(1)
        expect(mockedHandleFilter).toBeCalledWith([
            expect.objectContaining({
                title: "some mission"
            })
        ])
        fireEvent.change(screen.getByTestId("filter-input"), {target: {value : ""}})
        expect(mockedHandleFilter).toBeCalledWith([
            expect.objectContaining({
                title: "some mission"
            }),
            expect.objectContaining({
                title: "another mission"
            }),
        ])
        fireEvent.change(screen.getByTestId("filter-input"), {target: {value : "Nowak"}})
        expect(mockedHandleFilter).toBeCalledWith([
            expect.objectContaining({
                title: "another mission"
            })
        ])
    })
    it('filters correctly by date', () => {
        render(<FilterResource {...props} isAdmin={false}/>)
        fireEvent.change(document.getElementById("dateFrom") as HTMLElement, {target: {value : "2025-01-01"}})
        fireEvent.change(document.getElementById("dateTo") as HTMLElement, {target: {value : "2025-03-01"}})
        fireEvent.click(screen.getByTestId("filter-button"))
        expect(mockedHandleFilter).toBeCalledWith([
            expect.objectContaining({
                title: "some mission"
            })
        ])
        fireEvent.click(screen.getByTestId("reset-button"))
        expect(mockedHandleFilter).toBeCalledWith([
            expect.objectContaining({
                title: "some mission"
            }),
            expect.objectContaining({
                title: "another mission"
            }),
        ])
    })
})