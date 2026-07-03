import { Client, Contact, Page, TitleChoice } from "./types.ts";
import { restapi } from "./restapi.ts";

export function getContacts(params?: {
  active?: boolean;
  page?: number;
  search?: string;
}): Promise<Page<Contact>> {
  return restapi.get(`core/contacts/`, { params }).then((res) => {
    return res.data;
  });
}

export function getContact(id: number): Promise<Contact> {
  return restapi.get(`core/contacts/${id}/`).then((res) => {
    return res.data;
  });
}

export function createContact(data: Partial<Contact>): Promise<Contact> {
  return restapi.post(`core/contacts/`, data).then((res) => {
    return res.data;
  });
}

export function getClients(): Promise<Client[]> {
  return restapi.get(`core/client/`).then((res) => res.data.results);
}

export function getTitles(): Promise<TitleChoice[]> {
  return restapi.get(`core/titles/`).then((res) => res.data);
}
