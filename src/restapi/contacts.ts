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

export function updateContact(id: number, data: Partial<Contact>): Promise<Contact> {
  return restapi.put(`core/contacts/${id}/`, data).then((res) => {
    return res.data;
  });
}

export function deleteContact(id: number): Promise<void> {
  return restapi.delete(`core/contacts/${id}/`).then((res) => {
    return res.data;
  });
}

export function toggleContactActive(id: number, isActive: boolean): Promise<Contact> {
  return restapi.patch(`core/contacts/${id}/`, { isActive }).then((res) => {
    return res.data;
  });
}

export function getClients(): Promise<Client[]> {
  return restapi.get(`core/client/`).then((res) => res.data.results);
}

export function getTitles(): Promise<TitleChoice[]> {
  return restapi.get(`core/titles/`).then((res) => res.data);
}
