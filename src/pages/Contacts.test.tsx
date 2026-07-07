import { fireEvent, render, screen, act } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import * as useGetContacts from "../hooks/useContacts.tsx";
import Contacts from "./Contacts.tsx";
import { Contact, Page } from "../restapi/types.ts";
import { UseQueryResult } from "react-query";

const mockContacts = [
  {
    firstName: "John",
    lastName: "Doe",
    jobTitle: "Software developer",
    internalNotes: "",
    picture: "example.url",
    isActive: true,
    id: 1,
    addresses: [
      {
        address: "New York, Funny Street 11/222",
      },
    ],
    phones: [],
    emails: [],
    websites: [],
    company: {
      id: 1,
      name: "singlewave",
      picture: "path/to/picture.jpg",
    },
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
    ],
    emails: [
      {
        address: "capitan.jack@gmail.com",
      },
    ],
    websites: [],
  },
] as Contact[];

describe("Contact Page", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(useGetContacts, "useGetContacts").mockImplementation((params) => {
      let results = [...mockContacts];
      if (params?.active) {
        results = results.filter((c) => c.isActive);
      }
      if (params?.search) {
        const query = params.search.toLowerCase();
        results = results.filter(
          (c) =>
            c.firstName.toLowerCase().includes(query) ||
            c.lastName.toLowerCase().includes(query) ||
            `${c.firstName} ${c.lastName}`.toLowerCase().includes(query)
        );
      }

      const page = params?.page || 1;
      const next = page === 1 ? "http://api/contacts?page=2" : null;
      const previous = page > 1 ? "http://api/contacts?page=1" : null;

      return {
        data: { results, count: 20, next, previous } as Page<Contact>,
        isLoading: false,
      } as UseQueryResult<Page<Contact>>;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const renderContacts = () => {
    render(
      <MemoryRouter initialEntries={["/contacts"]}>
        <Routes>
          <Route path="/contacts" element={<Contacts />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it("renders correctly with active filter by default", () => {
    renderContacts();
    expect(screen.getByTestId("contact-grid-tile-1")).toBeInTheDocument();
    expect(screen.queryByTestId("contact-grid-tile-2")).not.toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.queryByText("Jack Sparrow")).not.toBeInTheDocument();
  });

  it("list view shows active contacts by default", () => {
    renderContacts();
    fireEvent.click(screen.getByTestId("switch-list-grid"));
    expect(screen.getByTestId("contact-list-tile-1")).toBeInTheDocument();
    expect(screen.queryByTestId("contact-list-tile-2")).not.toBeInTheDocument();
  });

  it("filter all contacts", () => {
    renderContacts();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.queryByText("Jack Sparrow")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("switch-active"));
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jack Sparrow")).toBeInTheDocument();
  });

  it("pagination next page", () => {
    renderContacts();

    const nextButton = screen.getByLabelText("Next Page");
    expect(nextButton).not.toBeDisabled();

    fireEvent.click(nextButton);

    expect(screen.getByText("Page 2")).toBeInTheDocument();
  });

  it("pagination previous page", () => {
    renderContacts();

    fireEvent.click(screen.getByLabelText("Next Page"));
    expect(screen.getByText("Page 2")).toBeInTheDocument();

    const prevButton = screen.getByLabelText("Previous Page");
    expect(prevButton).not.toBeDisabled();

    fireEvent.click(prevButton);

    expect(screen.getByText("Page 1")).toBeInTheDocument();
  });

  it("Search works first name", () => {
    renderContacts();
    const searchBar = screen.getByRole("textbox");
    fireEvent.change(searchBar, { target: { value: "John" } });

    // Flush the 300ms debounce
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.queryByText("Jack Sparrow")).not.toBeInTheDocument();
  });

  it("Search works last name across all contacts", () => {
    renderContacts();
    fireEvent.click(screen.getByTestId("switch-active"));

    const searchBar = screen.getByRole("textbox");
    fireEvent.change(searchBar, { target: { value: "Sparrow" } });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    expect(screen.getByText("Jack Sparrow")).toBeInTheDocument();
  });

  it("Search works first name and last name", () => {
    renderContacts();
    const searchBar = screen.getByRole("textbox");
    fireEvent.change(searchBar, { target: { value: "John Doe" } });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.queryByText("Jack Sparrow")).not.toBeInTheDocument();
  });

  it("Can see all contacts if search cleared again", () => {
    renderContacts();
    fireEvent.click(screen.getByTestId("switch-active"));
    const searchBar = screen.getByRole("textbox");

    // Type a search query
    fireEvent.change(searchBar, { target: { value: "John" } });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.queryByText("Jack Sparrow")).not.toBeInTheDocument();

    // Clear the search
    fireEvent.change(searchBar, { target: { value: "" } });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jack Sparrow")).toBeInTheDocument();
  });

  it("Search resets pagination to page 1", () => {
    renderContacts();

    // Navigate to page 2
    fireEvent.click(screen.getByLabelText("Next Page"));
    expect(screen.getByText("Page 2")).toBeInTheDocument();

    // Typing in the search bar should reset to page 1
    const searchBar = screen.getByRole("textbox");
    fireEvent.change(searchBar, { target: { value: "John" } });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText("Page 1")).toBeInTheDocument();
  });

  it("Search works in list view", () => {
    renderContacts();
    fireEvent.click(screen.getByTestId("switch-list-grid"));

    const searchBar = screen.getByRole("textbox");
    fireEvent.change(searchBar, { target: { value: "John" } });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.queryByText("Jack Sparrow")).not.toBeInTheDocument();
  });
});
