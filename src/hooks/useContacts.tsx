import {useQuery, useQueryClient} from "react-query";
import {getContacts} from "../restapi/contacts.ts";

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