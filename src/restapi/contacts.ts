import {Contact} from "./types.ts";
import {restapi} from "./restapi.ts";

export function getContacts(params?: { active?: boolean }): Promise<Contact[]> {
    return restapi.get(`core/contacts/`, { params }).then((res) => {
        return res.data.results;
    });
}

export function getContact(id: number): Promise<Contact> {
    return restapi.get(`core/contacts/${id}/`).then((res) => {
        return res.data;
    });
}
