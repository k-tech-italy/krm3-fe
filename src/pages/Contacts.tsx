import {useGetContacts} from "../hooks/useContacts.tsx";
import React, {useState} from "react";
import ContactGridTile from "../components/contacts/ContactGridTile.tsx";
import ContactListTile from "../components/contacts/ContactListTile.tsx";

export default function Contacts() {
    const [isGridView, setIsGridView] = useState(true);
    const [onlyActiveSelected, setOnlyActiveSelected] = useState(false);
    
    const { data: contactsData, isLoading } = useGetContacts({
        active: onlyActiveSelected ? true : undefined
    })

    const contacts = contactsData || [];

    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex flex-row p-5">
                <div className="flex flex-row mt-2 ml-2">
                    Grid
                    <div className="relative inline-block w-11 h-5 mx-1">
                        <input
                            id="switch-list-grid"
                            data-testid="switch-list-grid"
                            type="checkbox"
                            className="peer appearance-none w-11 h-5 bg-slate-200 rounded-full checked:bg-slate-400 cursor-pointer transition-colors duration-300"
                            checked={!isGridView}
                            onChange={() => {
                                setIsGridView(!isGridView)
                            }}/>
                        <label
                            htmlFor="switch-list-grid"
                            className="absolute top-0 left-0 w-5 h-5 bg-card rounded-full border border-app shadow-sm transition-transform duration-300 peer-checked:translate-x-6 peer-checked:border-slate-800 cursor-pointer"
                        />
                    </div>
                    Row
                </div>
                <div className="flex flex-row mt-2 ml-10">
                    All
                    <div className="relative inline-block w-11 h-5 mx-1">
                        <input
                            id="switch-active"
                            data-testid="switch-active"
                            type="checkbox"
                            className="peer appearance-none w-11 h-5 bg-slate-200 rounded-full checked:bg-slate-400 cursor-pointer transition-colors duration-300"
                            checked={onlyActiveSelected}
                            onChange={() => {
                                setOnlyActiveSelected(!onlyActiveSelected)
                            }}/>
                        <label
                            htmlFor="switch-active"
                            className="absolute top-0 left-0 w-5 h-5 bg-card rounded-full border border-app shadow-sm transition-transform duration-300 peer-checked:translate-x-6 peer-checked:border-slate-800 cursor-pointer"
                        />
                    </div>
                    Active
                </div>
            </div>

            <div className="flex-grow">
                {isLoading && <div className="p-5 text-center">Loading...</div>}
                
                {isGridView ?
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 grid-cols-1 p-5">
                        {contacts.map(contact => (
                            <ContactGridTile key={contact.id} contact={contact} />
                        ))}
                    </div>
                    :
                    <div className="relative p-5">
                        <div className="grid grid-cols-[auto_auto_2fr_2fr_2fr] md:grid-cols-[auto_auto_2fr_2fr_2fr_2fr] items-center
                        gap-2 m-2 font-bold bg-gray-300 rounded-lg sticky top-0 border-2 border-white">
                            <div className="w-8 h-8 sm:w-16 sm:h-16"/>
                            <div className="w-8 h-8 sm:w-16 sm:h-16"/>
                            <p className="ml-8">Name</p>
                            <p className="hidden md:block">Address</p>
                            <p>Email</p>
                            <p>Phone</p>
                        </div>
                        {contacts.map(contact => (
                            <ContactListTile key={contact.id} contact={contact} />
                        ))}
                    </div>
                }
            </div>
        </div>
    )
}