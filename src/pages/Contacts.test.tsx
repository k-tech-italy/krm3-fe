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
            id: 1,
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
        vi.spyOn(useGetContacts, "useGetContacts").mockImplementation((params) => {
            let results = [...mockContacts];
            if (params?.active) {
                results = results.filter(c => c.isActive);
            }
            return {
                data: results,
                isLoading: false
            } as any;
        });
    })

    const renderContacts = () => {
        render(
            <MemoryRouter initialEntries={['/contacts']}>
                <Routes>
                    <Route path="/contacts" element={<Contacts />} />
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
    })

    it('list view', () => {
        renderContacts();
        fireEvent.click(screen.getByTestId("switch-list-grid"))
        expect(screen.getByTestId("contact-list-tile-1")).toBeInTheDocument();
        expect(screen.getByTestId("contact-list-tile-2")).toBeInTheDocument();
    })

    it('filter active', () => {
        renderContacts();
        fireEvent.click(screen.getByTestId("switch-active"))
        expect(screen.getByText("John Doe")).toBeInTheDocument()
        expect(screen.queryByText("Jack Sparrow")).not.toBeInTheDocument()
    })

})