import {Contact} from "../../restapi/types.ts";
import { Home, User } from 'lucide-react';
import {Link} from "react-router-dom";

interface Props {
    contact: Contact;
}
const ContactListTile = (props: Props) => {
    return (
        <Link to={`/contacts/${props.contact.id}`}
            className="bg-gray-200 rounded-xl shadow-xl p-2 sm:p-3 m-2 border border-1 border-gray-500 grid grid-cols-[auto_auto_2fr_2fr_2fr]
            md:grid-cols-[auto_auto_2fr_2fr_2fr_2fr] items-center gap-2 cursor-pointer hover:bg-gray-300 transition-colors text-gray-900"
            id={`contact-list-tile-${props.contact.id}`}
            data-testid={`contact-list-tile-${props.contact.id}`}>
            {props.contact.picture ?
                <img
                    src={props.contact.picture}
                    className="w-8 h-8 sm:w-16 sm:h-16 object-cover rounded-xl"
                />
                :
                <div className="w-8 h-8 sm:w-16 sm:h-16 rounded-xl bg-gray-100 flex items-center justify-center"
                     data-testid={`user-picture-placeholder-${props.contact.id}`}>
                    <User className="opacity-25"/>
                </div>

            }
            {props.contact.company && props.contact.company.picture ?
                <img
                    src={props.contact.company.picture}
                    className="w-8 h-8 sm:w-16 sm:h-16 object-cover rounded-xl ml-2 sm:ml-5"
                />
                :
                <div className="w-8 h-8 sm:w-16 sm:h-16 rounded-xl ml-2 sm:ml-5 bg-gray-100 flex items-center justify-center">
                    <Home data-testid="company-picture-placeholder" className="opacity-25"/>
                </div>

            }


            <p className="font-bold sm:text-l text-sm">
                {props.contact.firstName} {props.contact.lastName}
            </p>
            <p className="hidden md:block text-xs sm:text-base">{props.contact.addresses.length > 0 ? props.contact.addresses[0].address : ""}</p>
            <p className="text-xs sm:text-base">{props.contact.emails.length > 0 ? props.contact.emails[0].address : ""}</p>
            <p className="text-xs sm:text-base">{props.contact.phones.length > 0 ? props.contact.phones[0].number : ""}</p>

        </Link>
    )
}
export default ContactListTile