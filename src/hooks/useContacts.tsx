import {useQuery, useQueryClient} from "react-query";
import {getContacts, getContact} from "../restapi/contacts.ts";

export function useGetContacts(){
    return useQuery(
        ['contacts'],
        async () => getContacts(),
        {
            onError: (error) => {
                console.error("Contacts fetch failed:", error);
                return error;
            }
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