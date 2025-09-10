import {render, screen} from "@testing-library/react";
import {TotalsExpense} from "./TotalExpense.tsx";

describe('TotalExpense', () => {
    const props = {
        mission: {
        id: 1,
        number: 2025,
        title: "Business trip to Berlin",
        fromDate: "2025-01-10",
        toDate: "2025-01-15",
        year: 2025,
        city: {
            id: 10,
            name: "Berlin",
            country: {
                id: 1,
                name: "Germany",
            },
        },
        defaultCurrency: {
            iso3: "EUR",
            title: "Euro",
            symbol: "€",
            decimals: "2",
            fractionalUnit: "cent",
            base: 100,
            active: true,
        },
        project: {
            id: 5,
            name: "Migration Project",
            notes: "Data center migration",
            client: {
                id: 3,
                name: "TechCorp GmbH",
            },
        },
        resource: {
            id: 42,
            firstName: "Alice",
            lastName: "Nowak",
            profile: {
                id: 99,
                picture: "/images/alice.png",
                user: 1001,
            },
        },
        expenses: [
            {
                id: 101,
                day: "2025-01-11",
                amountCurrency: "150.00",
                amountBase: "150.00",
                amountReimbursement: "150.00",
                detail: "Hotel stay",
                documentType: {
                    active: true,
                    default: false,
                    id: 1,
                    title: "Invoice",
                },
                image: "/receipts/hotel.png",
                createdTs: "2025-01-11T10:00:00Z",
                modifiedTs: "2025-01-11T10:00:00Z",
                mission: 1,
                currency: "EUR",
                category: {
                    active: true,
                    id: 7,
                    str: "accommodation",
                    title: "Accommodation",
                },
                paymentType: {
                    active: true,
                    id: 1,
                    title: "Credit Card",
                    str: "credit_card",
                } as const,
                reimbursement: 0,
            },
        ],
    }
}
// TODO update test when component is finished
    it("renders correctly", () => {
        render(<TotalsExpense {...props}/>)
    })
})