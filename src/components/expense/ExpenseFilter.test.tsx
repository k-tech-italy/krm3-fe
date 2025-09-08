import ExpenseFilter from "./ExpenseFilter.tsx";
import {fireEvent, render, screen} from "@testing-library/react";
import {vi} from "vitest"
describe('ExpenseFilter Component', () => {
    const mockedHandleFilter = vi.fn()
    const props = {
        handleFilter: mockedHandleFilter,
        data:
        [
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
            },
            {
                active: false,
                id: 456,
                currency: "EUR",
                title: "Second example title",
                amountCurrency: "201",
                amountReimbursement: "202",
                day: "2025-02-10",
                amountBase: "203",
                detail: "different details",
                image: "another/image/path",
                createdTs: "2025-02-01",
                modifiedTs: "2025-02-03",
                mission: 2,
                documentType: {
                    active: true,
                    default: false,
                    id: 2,
                    title: "another document type",
                },
                category: {
                    active: true,
                    id: 2,
                    str: "another category",
                    title: "another category title",
                },
                paymentType: {
                    active: true,
                    id: 1,
                    title: "another payment type",
                    str: "another payment type",
                } as const,
                reimbursement: 50,
            }
        ]

    }
    it('renders correctly', () => {
        render(<ExpenseFilter {...props}/>);
        expect(screen.getByText("Al giorno:")).toBeInTheDocument()
        expect(screen.getByText("Dal giorno:")).toBeInTheDocument()
        expect(screen.getByText("Reset")).toBeInTheDocument()
        expect(screen.getByText("Filtra")).toBeInTheDocument()
    })
    it('filters correctly', () => {
        render(<ExpenseFilter {...props}/>);
        const fromDate = document.getElementById("expense-filter-from-date-picker")
        const toDate = document.getElementById("expense-filter-to-date-picker")

        fireEvent.change(fromDate as HTMLElement, { target : {value : "01/10/2025"}})
        fireEvent.change(toDate as HTMLElement, { target : {value : "01/10/2026"}})
        fireEvent.click(screen.getByText("Filtra"))
        expect(mockedHandleFilter).toBeCalledWith([expect.objectContaining({
            id: 456,
            day: "2025-02-10",
        })]);

        fireEvent.click(screen.getByText("Reset"))
        expect(mockedHandleFilter).toBeCalledWith(undefined);

        fireEvent.change(fromDate as HTMLElement, { target : {value : "01/10/2024"}})
        fireEvent.change(toDate as HTMLElement, { target : {value : "01/10/2025"}})
        fireEvent.click(screen.getByText("Filtra"))
        expect(mockedHandleFilter).toBeCalledWith([expect.objectContaining({
            id: 123
        })])
    })
})