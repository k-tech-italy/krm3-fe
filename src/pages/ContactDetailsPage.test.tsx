import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import * as useContacts from "../hooks/useContacts.tsx";
import ContactDetailsPage from "./ContactDetailsPage.tsx";
import { Contact } from "../restapi/types.ts";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

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
    websites: [],
  },
  {
    firstName: "John",
    lastName: "Doe",
    jobTitle: "Software developer",
    internalNotes: "",
    isActive: true,
    id: 1,
    addresses: [],
    phones: [],
    emails: [],
    websites: [],
  },
] as Contact[];

describe("ContactDetailsPage", () => {
  let toggleContactActiveMutate = vi.fn();
  let deleteContactMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    toggleContactActiveMutate = vi.fn((_vars, options) => options?.onSuccess?.());
    deleteContactMutate = vi.fn((_id, options) => options?.onSuccess?.());

    vi.spyOn(useContacts, "useGetContact").mockImplementation((id: number | null) => {
      return {
        data: mockContacts.find((c) => c.id === id),
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useContacts.useGetContact>;
    });

    vi.spyOn(useContacts, "useToggleContactActive").mockImplementation(() => {
      return {
        mutate: toggleContactActiveMutate,
        isLoading: false,
      } as unknown as ReturnType<typeof useContacts.useToggleContactActive>;
    });

    vi.spyOn(useContacts, "useDeleteContact").mockImplementation(() => {
      return {
        mutate: deleteContactMutate,
        isLoading: false,
      } as unknown as ReturnType<typeof useContacts.useDeleteContact>;
    });
  });

  const renderDetails = (id: string) => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/contacts/${id}`]}>
          <Routes>
            <Route
              path="/contacts"
              element={<div data-testid="contacts-list">Contacts list</div>}
            />
            <Route path="/contacts/:id" element={<ContactDetailsPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it("renders contact details correctly when ID is valid", () => {
    renderDetails("2");
    expect(screen.getByText("Jack Sparrow")).toBeInTheDocument();
    expect(screen.getByText("Pirate")).toBeInTheDocument();
  });

  it("renders title before name when present", () => {
    vi.spyOn(useContacts, "useGetContact").mockImplementation(() => {
      return {
        data: { ...mockContacts[0], title: "doctor", id: 2 },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useContacts.useGetContact>;
    });
    renderDetails("2");
    expect(screen.getByRole("heading", { name: /Doctor\.\s+Jack Sparrow/ })).toBeInTheDocument();
  });

  it("shows error or fallback when ID is invalid", () => {
    renderDetails("invalid");
    expect(screen.getByText("Invalid Contact ID")).toBeInTheDocument();
  });

  it("shows Activate button for inactive contact and activates on confirm", async () => {
    renderDetails("2");

    expect(screen.getByTestId("toggle-active-button")).toHaveTextContent("Activate");

    await userEvent.click(screen.getByTestId("toggle-active-button"));
    expect(screen.getByText("Activate Contact")).toBeInTheDocument();

    await userEvent.click(screen.getByTestId("toggle-active-confirm"));

    await waitFor(() => {
      expect(toggleContactActiveMutate).toHaveBeenCalledWith(
        { id: 2, isActive: true },
        expect.any(Object)
      );
    });
  });

  it("shows Deactivate button for active contact and deactivates on confirm", async () => {
    renderDetails("1");

    expect(screen.getByTestId("toggle-active-button")).toHaveTextContent("Deactivate");

    await userEvent.click(screen.getByTestId("toggle-active-button"));
    expect(screen.getByText("Deactivate Contact")).toBeInTheDocument();

    await userEvent.click(screen.getByTestId("toggle-active-confirm"));

    await waitFor(() => {
      expect(toggleContactActiveMutate).toHaveBeenCalledWith(
        { id: 1, isActive: false },
        expect.any(Object)
      );
    });
  });

  it("opens edit contact modal when Edit is clicked", async () => {
    renderDetails("2");

    await userEvent.click(screen.getByTestId("edit-button"));

    expect(screen.getByRole("dialog", { name: "Edit Contact" })).toBeInTheDocument();
    expect(screen.getByText("First Name")).toBeInTheDocument();
  });

  it("deletes contact and navigates back to contacts list on confirm", async () => {
    renderDetails("2");

    await userEvent.click(screen.getByTestId("delete-button"));
    expect(screen.getByText("Delete Contact")).toBeInTheDocument();

    await userEvent.click(screen.getByTestId("delete-confirm"));

    await waitFor(() => {
      expect(deleteContactMutate).toHaveBeenCalledWith(2, expect.any(Object));
    });

    expect(screen.getByTestId("contacts-list")).toBeInTheDocument();
  });
});
