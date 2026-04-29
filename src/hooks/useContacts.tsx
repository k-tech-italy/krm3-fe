import {useMutation, useQuery, useQueryClient} from "react-query";
import {getContacts, getContact, createContact} from "../restapi/contacts.ts";
import {Email, Phone} from "../restapi/types.ts";
import {AxiosError} from "axios";

export interface CreateContactProps {
  firstName: string;
  lastName: string;
  phone?: Phone[];
  email?: Email[];
}

export function useGetContacts(params?: { active?: boolean, page?: number, search?: string }){
    return useQuery(
        ['contacts', params],
        async () => getContacts(params),
        {
            onError: (error) => {
                console.error("Contacts fetch failed:", error);
                return error;
            },
            keepPreviousData: true
        }
    )
}

export function useGetContact(id: number | null) {
    return useQuery(
        ['contact', id],
        async () => {
             if (id === null) return null;
             return getContact(id)
        },
        {
            enabled: !!id,
            onError: (error) => {
                console.error(`Contact fetch failed for id ${id}:`, error);
                return error;
            }
        }
    )
}


export function useCreateContact() {
    const queryClient = useQueryClient();

    return useMutation(
        (contact: CreateContactProps) => createContact(contact),
        {
            onSuccess: () => {
                queryClient.invalidateQueries({queryKey: ["contacts"]});
            },
            onError: (error: AxiosError) => {
            },
        }
    );
}