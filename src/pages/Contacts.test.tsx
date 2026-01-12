
import {fireEvent, render, screen} from "@testing-library/react";
import {vi} from "vitest"
import { MemoryRouter, Route, Routes } from "react-router-dom";

import * as useGetContacts from "../hooks/useContacts.tsx";
import Contacts from "./Contacts.tsx";
import {Contact} from "../restapi/types.ts";

const mockContacts = [
    {
        firstName: "John",
        lastName: "Doe",
        jobTitle: "Software developer",
        internalNotes: "",
        picture: "example.url",
        isActive: true,
        id: 1,
        addresses: [{
            address: "New York, Funny Street 11/222",
        }],
        phones: [],
        emails: [],
        websites: [],
        company: {
            name: "singlewave",
            picture: "path/to/picture.jpg",
        }
    },
    {
        firstName: "Jack",
        lastName: "Sparrow",
        jobTitle: "Pirate",
        internalNotes: "",
        isActive: false,
        id: 2,
        addresses: [],
        phones: [
            {
                number: "+48 111 111 111",
            },
            {
                number: "+48 222 222 222",
            }
        ],
        emails: [
            {
                address: "capitan.jack@gmail.com",
            }
        ],
        websites: []
    }
] as Contact[];

describe('Contact Page', () => {
    beforeEach(() => {
        vi.spyOn(useGetContacts, "useGetContacts").mockReturnValue({
            data: mockContacts
        } as any)

        vi.spyOn(useGetContacts, "useGetContact").mockImplementation((id: number | null) => {
            return {
                data: mockContacts.find(c => c.id === id),
                isLoading: false,
                error: null
            } as any;
        })
    })

    const renderContacts = () => {
        render(
            <MemoryRouter initialEntries={['/contacts']}>
                <Routes>
                    <Route path="/contacts" element={<Contacts />} />
                    <Route path="/contacts/:id" element={<Contacts />} />
                </Routes>
            </MemoryRouter>
        );
    };

    it('renders correctly', () => {
        renderContacts();
        expect(screen.getByTestId("contact-grid-tile-1")).toBeInTheDocument();
        expect(screen.getByTestId("contact-grid-tile-2")).toBeInTheDocument();
        expect(screen.getByText("John Doe")).toBeInTheDocument()
        expect(screen.getByText("Jack Sparrow")).toBeInTheDocument()
        expect(screen.getByText("New York, Funny Street 11/222")).toBeInTheDocument()
        expect(screen.getByText("+48 111 111 111")).toBeInTheDocument()
        expect(screen.getByText("+48 111 111 111")).toBeInTheDocument()
        expect(screen.getByTestId("user-picture-placeholder-2")).toBeInTheDocument();
    })
    it('list view', () => {
        renderContacts();
        fireEvent.click(screen.getByTestId("switch-list-grid"))
        expect(screen.getByTestId("contact-list-tile-1")).toBeInTheDocument();
        expect(screen.getByTestId("contact-list-tile-2")).toBeInTheDocument();
        expect(screen.getByText("John Doe")).toBeInTheDocument()
        expect(screen.getByText("Jack Sparrow")).toBeInTheDocument()
        expect(screen.getByText("capitan.jack@gmail.com")).toBeInTheDocument()
    })
    it('filter active', () => {
        renderContacts();
        fireEvent.click(screen.getByTestId("switch-active"))
        expect(screen.getByText("John Doe")).toBeInTheDocument()
        expect(screen.queryByText("Jack Sparrow")).not.toBeInTheDocument()
    })
    it('opens detailed view from grid view', () => {
        renderContacts();
        fireEvent.click(screen.getByTestId("contact-grid-tile-2"))
        expect(screen.getByText("Jack Sparrow")).toBeInTheDocument()
    })
    it('opens detailed view from list view', () => {
        renderContacts();
        fireEvent.click(screen.getByTestId("switch-list-grid"))
        fireEvent.click(screen.getByTestId("contact-list-tile-1"))
        expect(screen.getByText("John Doe")).toBeInTheDocument()
    })
})