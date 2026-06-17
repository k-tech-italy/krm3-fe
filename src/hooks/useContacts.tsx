import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  getClients,
  getContacts,
  getContact,
  createContact,
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
    onError: (error) => {
      console.error("Titles fetch failed:", error);
    },
  });
}
