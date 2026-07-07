import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  getClients,
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  toggleContactActive,
  getTitles,
} from "../restapi/contacts.ts";
import { Address, Contact, Email, Phone, Website } from "../restapi/types.ts";

export interface CreateContactProps {
  firstName: string;
  lastName: string;
  jobTitle?: string;
  title?: string;
  taxId?: string;
  picture?: string;
  company?: number | null;
  internalNotes?: string;
  phones: Phone[];
  emails: Email[];
  websites: Website[];
  addresses: Address[];
}

export function useGetContacts(params?: { active?: boolean; page?: number; search?: string }) {
  return useQuery(["contacts", params], async () => getContacts(params), {
    onError: (error) => {
      console.error("Contacts fetch failed:", error);
      return error;
    },
    keepPreviousData: true,
  });
}

export function useGetContact(id: number | null) {
  return useQuery(
    ["contact", id],
    async () => {
      if (id === null) return null;
      return getContact(id);
    },
    {
      enabled: !!id,
      onError: (error) => {
        console.error(`Contact fetch failed for id ${id}:`, error);
        return error;
      },
    }
  );
}

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation((contact: CreateContactProps) => createContact(contact as Partial<Contact>), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
    onError: () => {},
  });
}

export function useGetClients() {
  return useQuery(["clients"], () => getClients(), {
    onError: (error) => {
      console.error("Clients fetch failed:", error);
    },
  });
}

export function useGetTitles() {
  return useQuery(["titles"], () => getTitles(), {
    staleTime: Infinity,
    onError: (error) => {
      console.error("Titles fetch failed:", error);
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, data }: { id: number; data: CreateContactProps }) =>
      updateContact(id, data as Partial<Contact>),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: ["contacts"] });
        queryClient.invalidateQueries({ queryKey: ["contact", id] });
      },
      onError: (error) => {
        console.error("Contact update failed:", error);
      },
    }
  );
}

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation((id: number) => deleteContact(id), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
    onError: (error) => {
      console.error("Contact delete failed:", error);
    },
  });
}

export function useToggleContactActive() {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, isActive }: { id: number; isActive: boolean }) => toggleContactActive(id, isActive),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: ["contacts"] });
        queryClient.invalidateQueries({ queryKey: ["contact", id] });
      },
      onError: (error) => {
        console.error("Contact toggle active failed:", error);
      },
    }
  );
}
