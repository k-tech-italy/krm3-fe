import {vi} from "vitest";
import * as useMissions from "../../../hooks/useMissions.tsx";
import * as useExpense from "../../../hooks/useExpense.tsx";
import {fireEvent, render, screen} from "@testing-library/react";
import {CreateMissionForm} from "./CreateMissionForm.tsx";
import {City, Currency, ExpenseInterface, MissionInterface, Project, Resource} from "../../../restapi/types.ts";

describe('CreateMissionFrom', () => {
    const props = {
        mission: {
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
        error: {
            title: ["mission error"],
            fromDate: undefined,
            toDate: undefined,
            project: ["project error"],
            resource: ["resource error"],
            city: ["city error"],
            defaultCurrency: ["defaultCurrency error"],
        }
    }
    beforeEach(() => {
        vi.spyOn(useMissions, "useGetResources").mockReturnValue({
            count: 2,
            next: null,
            previous: null,
            results:
                [
                    {
                        id: 1,
                        firstName: "Jan",
                        lastName: "Kowal",
                        profile: {
                            id: 1,
                            user: 1,
                            picture: "some/path",
                        }
                    },
                    {
                        id: 2,
                        firstName: "Anna",
                        lastName: "Nowak",
                        profile: {
                            id: 2,
                            user: 2,
                            picture: "another/path",
                        },
                    }
                ]
        })
        vi.spyOn(useMissions, "useGetClients").mockReturnValue({
            count: 2,
            next: null,
            previous: null,
            results:
                [
                    {
                        id: 1,
                        name: "client 1"
                    },
                    {
                        id: 2,
                        name: "client 2"
                    }
                ]
        })
        vi.spyOn(useMissions, "useGetProjects").mockReturnValue({
            count: 2,
            next: null,
            previous: null,
            results:
                [
                    {
                        id: 1,
                        name: "example project",
                        notes: "",
                        client: 1,
                    },
                    {
                        id: 2,
                        name: "another project",
                        notes: "notes",
                        client: 2,
                    }
                ]
        })
        vi.spyOn(useMissions, "useGetCountries").mockReturnValue({
            count: 2,
            next: null,
            previous: null,
            results:
                [
                    {
                        id: 1,
                        name: "Poland",
                    },
                    {
                        id: 2,
                        name: "Italy",
                    },
                ]
        })
        vi.spyOn(useMissions, "useGetCitiess").mockReturnValue({
            count: 2,
            next: null,
            previous: null,
            results:
                [
                    {
                        id: 1,
                        name: "Warsaw",
                        country: 1
                    },
                    {
                        id: 2,
                        name: "Rome",
                        country: 2,
                    },
                    {
                        id: 3,
                        name: "Venice",
                        country: 2,
                    },
                ]
        })
        vi.spyOn(useExpense, "useGetCurrencies").mockReturnValue({
            count: 1,
            next: null,
            previous: null,
            results:
                [
                    {
                        iso3: "PLN",
                        title: "zloty",
                        symbol: "zł",
                        fractionalUnit: "grosz",
                        base: 100,
                        active: true,
                    },
                    {
                        iso3: "EUR",
                        title: "euro",
                        symbol: "€",
                        fractionalUnit: "cent",
                        base: 100,
                        active: true
                    }
                ]
        })
    })
    it('renders errors', () => {
        render(<CreateMissionForm {...props}/>)
        expect(screen.getByText("mission error")).toBeInTheDocument()
        expect(screen.getByText("resource error")).toBeInTheDocument()
        expect(screen.getByText("project error")).toBeInTheDocument()
        expect(screen.getByText("city error")).toBeInTheDocument()
        expect(screen.getByText("defaultCurrency error")).toBeInTheDocument()
    })
    it('clears errors', () => {
        render(<CreateMissionForm {...props}/>)

        fireEvent.change(screen.getByTestId("title-input"), { target: {value: "changed title"}} )
        fireEvent.change(screen.getByTestId("first-name-select"), { target: {value: "2"}} )
        fireEvent.change(screen.getByTestId("project-select"), { target: {value: "2"}} )
        fireEvent.change(screen.getByTestId("country-select"), { target: {value: "2"}} )
        fireEvent.change(screen.getByTestId("city-select"), { target: {value: "3"}} )
        fireEvent.change(screen.getByTestId("currency-select"), { target: {value: "EUR"}} )

        expect(screen.queryByText("mission error")).not.toBeInTheDocument()
        expect(screen.queryByText("resource error")).not.toBeInTheDocument()
        expect(screen.queryByText("project error")).not.toBeInTheDocument()
        expect(screen.queryByText("city error")).not.toBeInTheDocument()
        expect(screen.queryByText("defaultCurrency error")).not.toBeInTheDocument()
    })

})