import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as contactsApi from "../restapi/contacts";
import { useGetContacts, useGetContact, useCreateContact } from "./useContacts.tsx";
import { Contact, Page } from "../restapi/types.ts";

vi.mock("../restapi/contacts");

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useContacts", () => {
  it("should fetch contacts successfully", async () => {
    const contactsList = [
      {
        firstName: "John",
        lastName: "Doe",
        jobTitle: "Software developer",
        internalNotes: "",
        picture: "example.url",
        isActive: true,
        id: 1,
        addresses: [{ address: "New York, Funny Street 11/222" }],
        phones: [],
        emails: [],
        websites: [],
        company: { name: "singlewave", picture: "path/to/picture.jpg" },
      },
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
    ] as Contact[];

    const contactsPageMock: Page<Contact> = {
      count: 2,
      next: null,
      previous: null,
      results: contactsList,
    };

    vi.spyOn(contactsApi, "getContacts").mockResolvedValueOnce(contactsPageMock);

    const { result } = renderHook(() => useGetContacts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(contactsApi.getContacts).toHaveBeenCalledOnce();
    expect(result.current.data).toEqual(contactsPageMock);
  });

  it("should handle error correctly", async () => {
    const error = new Error("API error");
    vi.spyOn(contactsApi, "getContacts").mockRejectedValueOnce(error);

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useGetContacts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(contactsApi.getContacts).toHaveBeenCalledOnce();
    expect(consoleSpy).toHaveBeenCalledWith("Contacts fetch failed:", error);

    consoleSpy.mockRestore();
  });
});

describe("useGetContact", () => {
  it("should fetch contact successfully", async () => {
    const contactMock: Contact = {
      firstName: "John",
      lastName: "Doe",
      jobTitle: "Software developer",
      internalNotes: "",
      picture: "example.url",
      isActive: true,
      id: 1,
      addresses: [{ address: "New York, Funny Street 11/222" }],
      phones: [],
      emails: [],
      websites: [],
      company: { id: 1, name: "singlewave", picture: "path/to/picture.jpg" },
    };

    vi.spyOn(contactsApi, "getContact").mockResolvedValueOnce(contactMock);

    const { result } = renderHook(() => useGetContact(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(contactsApi.getContact).toHaveBeenCalledOnce();
    expect(contactsApi.getContact).toHaveBeenCalledWith(1);
    expect(result.current.data).toEqual(contactMock);
  });

  it("should not fetch contact when id is null", async () => {
    const { result } = renderHook(() => useGetContact(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isIdle).toBe(true);
    expect(contactsApi.getContact).not.toHaveBeenCalled();
  });

  it("should handle error correctly", async () => {
    const error = new Error("API error");
    const contactId = 1;

    vi.spyOn(contactsApi, "getContact").mockRejectedValueOnce(error);

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useGetContact(contactId), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(contactsApi.getContact).toHaveBeenCalledOnce();
    expect(contactsApi.getContact).toHaveBeenCalledWith(contactId);
    expect(consoleSpy).toHaveBeenCalledWith(`Contact fetch failed for id ${contactId}:`, error);

    consoleSpy.mockRestore();
  });
});

describe("useCreateContact", () => {
  it('should call createContact and invalidate ["contacts"] cache on success', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const mockContact = { id: 1, firstName: "John", lastName: "Doe" } as Contact;
    vi.spyOn(contactsApi, "createContact").mockResolvedValueOnce(mockContact);

    const { result } = renderHook(() => useCreateContact(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    await act(async () => {
      await result.current.mutateAsync({
        firstName: "John",
        lastName: "Doe",
        phones: [],
        emails: [],
        websites: [],
        addresses: [],
      });
    });

    expect(contactsApi.createContact).toHaveBeenCalledOnce();
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["contacts"] });
  });
});
