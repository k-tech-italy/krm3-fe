import {Contact} from "../../restapi/types.ts";
import {ArrowLeft, User} from "lucide-react";

interface Props {
    contact: Contact;
    close: () => void;
}
export function ContactDetails({ contact, close }: Props): JSX.Element {
    const singeValueTile = (title: string, value: string) => {
        return (
            <div className="flex flex-col col-span-3 font-bold">
                <p>{title}</p>
                <div className="flex bg-gray-200 rounded-l w-full h-full items-center p-2 justify-center font-bold">
                   {value}
                </div>
            </div>
        )
    }
    const multipleValueTile = (title: string, values: string[]) => {
        return (
            <div className="flex flex-col col-span-3 font-bold row-span-2 h-full">
                <p>{title}</p>
                <div className="flex flex-col bg-gray-200 rounded-l w-full h-full items-center p-2 justify-center font-bold">
                    {values.map((value, index) => (
                        <p key={index} className="flex flex-col font-bold">{value}</p>
                    ))}
                </div>
            </div>
        )
    }
    return (
        <div className="grid sm:grid-cols-7 grid-cols-1 gap-[2%] p-10 h-full auto-rows-fr">
            <div className="row-span-2">
                <ArrowLeft onClick={close} size={40} className="cursor-pointer" id="back-to-general-view"/>
                <div className="relative w-full aspect-square overflow-hidden rounded-xl">
                    {contact.picture ? (
                        <img
                            src={contact.picture}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div
                            className="w-full h-full bg-gray-100 flex items-center justify-center"
                            data-testid={`user-picture-placeholder-${contact.id}`}
                        >
                            <User size={48} className="opacity-25"/>
                        </div>
                    )}

                    {contact.company?.picture && (
                        <img
                            src={contact.company.picture}
                            className="absolute left-1 bottom-1 w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-xl opacity-60"
                        />
                    )}
                </div>
            </div>
            {singeValueTile('Name', contact.firstName)}
            {singeValueTile('Last Name', contact.lastName)}
            {singeValueTile('Company', contact.company ? contact.company.name : "")}
            {singeValueTile('Job Title', contact.jobTitle)}
            <div className="flex flex-col row-span-2 font-bold col-span-3 md:col-span-1">
                <p>Internal Notes</p>
                <div className="flex bg-gray-200 rounded-l w-full h-full items-center p-2 justify-center font-bold">
                    <p className="flex flex-col font-bold">{contact.internalNotes}</p>
                </div>
            </div>
            {multipleValueTile('Emails', contact.emails.map((email) => email.address))}
            {multipleValueTile('Addresses', contact.addresses.map((address) => address.address))}
            <div className="hidden md:block md:col-span-1 md:row-span-2"/>
            {multipleValueTile('Telephone numbers', contact.phones.map((phone) => phone.number))}
            {multipleValueTile('Websites', contact.websites.map((website) => website.url))}
        </div>
    )
}