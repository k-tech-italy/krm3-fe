import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getContacts } from './contacts';
import { restapi } from './restapi';
import type { Contact } from './types';

vi.mock('./restapi', () => ({
    restapi: {
        get: vi.fn(),
    },
}));

describe('getContacts', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const contactsMock: Contact[] = [
        {
            firstName: "John",
            lastName: "Doe",
            jobTitle: "Software developer",
            internalNotes: "",
            picture: "example.url",
            isActive: true,
            id: 1,
            addresses: [{
                address: "New York, Funny Street 11/222",
            }],
            phones: [],
            emails: [],
            websites: [],
            company: {
                id: 1,
                name: "singlewave",
                picture: "path/to/picture.jpg",
            }
        },
        {
            firstName: "Jack",
            lastName: "Sparrow",
            jobTitle: "Pirate",
            internalNotes: "",
            isActive: false,
            id: 2,
            addresses: [],
            phones: [
                {
                    number: "+48 111 111 111",
                }
            ],
            emails: [
                {
                    address: "capitan.jack@gmail.com",
                }
            ],
            websites: []
        }
    ];

    it('should return contacts from API response', async () => {
        const mockedGet = vi.mocked(restapi.get);
        mockedGet.mockResolvedValueOnce({
            data: { results: contactsMock },
        } as any);

        const result = await getContacts();

        expect(restapi.get).toHaveBeenCalledOnce();
        expect(restapi.get).toHaveBeenCalledWith('core/contacts/');
        expect(result).toEqual(contactsMock);
    });

    it('should throw error when api call fails', async () => {
        const error = new Error('Network error');

        const mockedGet = vi.mocked(restapi.get);
        mockedGet.mockRejectedValueOnce(error);

        await expect(getContacts()).rejects.toThrow('Network error');

        expect(restapi.get).toHaveBeenCalledOnce();
        expect(restapi.get).toHaveBeenCalledWith('core/contacts/');
    });
});
