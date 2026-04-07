import {Contact, Page} from "./types.ts";
import {restapi} from "./restapi.ts";

export function getContacts(params?: { active?: boolean, page?: number, search?: string }): Promise<Page<Contact>> {
    return restapi.get(`core/contacts/`, { params }).then((res) => {
        return res.data;
    });
}

export function getContact(id: number): Promise<Contact> {
    return restapi.get(`core/contacts/${id}/`).then((res) => {
        return res.data;
    });
}
