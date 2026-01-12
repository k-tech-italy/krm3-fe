import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import * as useGetContacts from "../hooks/useContacts.tsx";
import ContactDetailsPage from "./ContactDetailsPage.tsx";
import { Contact } from "../restapi/types.ts";

const mockContacts = [
    {
        firstName: "Jack",
        lastName: "Sparrow",
        jobTitle: "Pirate",
        internalNotes: "",
        isActive: false,
        id: 2,
        addresses: [],
        phones: [{ number: "+48 111 111 111" }],
        emails: [{ address: "capitan.jack@gmail.com" }],
        websites: []
    }
] as Contact[];

describe('ContactDetailsPage', () => {
    beforeEach(() => {
        vi.spyOn(useGetContacts, "useGetContact").mockImplementation((id: number | null) => {
            return {
                data: mockContacts.find(c => c.id === id),
                isLoading: false,
                error: null
            } as any;
        });
    });

    const renderDetails = (id: string) => {
        render(
            <MemoryRouter initialEntries={[`/contacts/${id}`]}>
                <Routes>
                    <Route path="/contacts/:id" element={<ContactDetailsPage />} />
                </Routes>
            </MemoryRouter>
        );
    };

    it('renders contact details correctly when ID is valid', () => {
        renderDetails("2");
        expect(screen.getByText("Jack Sparrow")).toBeInTheDocument();
        expect(screen.getByText("Pirate")).toBeInTheDocument();
    });

    it('shows error or fallback when ID is invalid', () => {
        
        renderDetails("invalid");
        expect(screen.getByText("Invalid Contact ID")).toBeInTheDocument();
    });
});
