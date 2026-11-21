import {ExpenseCard} from "./ExpenseCard.tsx";
import {render, screen} from "@testing-library/react";
import {vi} from "vitest"
import {ExpenseInterface} from "../../restapi/types.ts";

// The converted amount is set asynchronously after the first render: tests wait for it so the update happens in act()
vi.mock("../../restapi/expense", () => ({
    convertCurrencyTo: vi.fn().mockResolvedValue("42.00"),
}));

describe('ExpenseCard', () => {
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
    it('renders correctly', async () => {
        render(<ExpenseCard {...props}/>);
        expect(await screen.findByText("Importo EUR 42.00")).toBeInTheDocument();
        expect(screen.getByText("some category title")).toBeInTheDocument();
        expect(screen.getByText("2025-01-05")).toBeInTheDocument();
        expect(screen.getByText("id: 123")).toBeInTheDocument();
        expect(screen.getByText("Importo PLN 101")).toBeInTheDocument();
    })
    it('renders border when amountReimbursement < 1', async () => {
        render(<ExpenseCard {...props} expense={{...props.expense, amountReimbursement: "0" }}/>);
        await screen.findByText("Importo EUR 42.00");
        expect(screen.getByTestId("expense-card")).toHaveClass("border border-red-500")
    })
    it('renders default amountCurrency when there is no amountCurrency in props', async () => {
        render(<ExpenseCard {...props} expense={{...props.expense, amountCurrency: "0" }}/>);
        await screen.findByText("Importo EUR 42.00");
    })
})