
import {fireEvent, render, screen} from "@testing-library/react";
import {vi} from "vitest"

import * as useGetContacts from "../hooks/useContacts.tsx";
import Contacts from "./Contacts.tsx";
import {Contact} from "../restapi/types.ts";

describe('Contact Page', () => {
    beforeEach(() => {
        vi.spyOn(useGetContacts, "useGetContacts").mockReturnValue({
            data: [
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
                        }
                    ],
                    emails: [
                        {
                            address: "capitan.jack@gmail.com",
                        }
                    ],
                    websites: []
                }
            ] as Contact[]
        } as any)
    })
    it('renders correctly', () => {
        render(<Contacts />);
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
        render(<Contacts />);
        fireEvent.click(screen.getByTestId("switch-list-grid"))
        expect(screen.getByTestId("contact-list-tile-1")).toBeInTheDocument();
        expect(screen.getByTestId("contact-list-tile-2")).toBeInTheDocument();
        expect(screen.getByText("John Doe")).toBeInTheDocument()
        expect(screen.getByText("Jack Sparrow")).toBeInTheDocument()
        expect(screen.getByText("capitan.jack@gmail.com")).toBeInTheDocument()
    })
    it('filter active', () => {
        render(<Contacts />);
        fireEvent.click(screen.getByTestId("switch-active"))
        expect(screen.getByText("John Doe")).toBeInTheDocument()
        expect(screen.queryByText("Jack Sparrow")).not.toBeInTheDocument()
    })
})