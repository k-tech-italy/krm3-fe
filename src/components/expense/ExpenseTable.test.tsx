import {vi} from "vitest";
import {ExpenseCard} from "./ExpenseCard.tsx";
import {render, screen} from "@testing-library/react";
import {ExpenseTable} from "./ExpenseTable.tsx";


describe('ExpenseTable', () => {
    const props = {
        expense: {
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
        ShowIdCard: vi.fn()
    }
    it('renders correctly', () => {
        render(<ExpenseTable {...props}/>);
        expect(screen.getByText("some category title")).toBeInTheDocument();
        expect(screen.getByText("2025-01-05")).toBeInTheDocument();
        expect(screen.getByText("123")).toBeInTheDocument();
        expect(screen.getByText("PLN 101")).toBeInTheDocument();
        expect(screen.getByText("some payment type")).toBeInTheDocument();
        expect(screen.getByText("PLN 101")).toBeInTheDocument();
        expect(screen.getByText("PAID")).toBeInTheDocument();
    })
    it('renders correct class when amountReimbursement < 1', () => {
        render(<ExpenseTable {...props} expense={{...props.expense, amountReimbursement: "0" }}/>);
        expect(screen.getByTestId("reimbursement-amount")).toHaveClass("text-danger")
    })
})