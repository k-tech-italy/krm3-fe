import {Contact} from "./types.ts";
import {restapi} from "./restapi.ts";

export function getContacts(): Promise<Contact[]> {
    return restapi.get(`core/contacts/`).then((res) => {
        return res.data.results;
    });
}