import {Contact} from "../../restapi/types.ts";
import {User} from "lucide-react";

interface Props {
    contact: Contact;
}
const ContactGridTile = (props: Props) => {
    return (
        <div className="bg-gray-200 rounded-xl shadow-xl p-3 sm:p-8 m-2 flex flex-row border border-1 border-gray-500 items-center"
             id={`contact-grid-tile-${props.contact.id}`}
             data-testid={`contact-grid-tile-${props.contact.id}`}
        >

            <div className="relative flex-shrink-0">
                {props.contact.picture ?
                    <img
                        src={props.contact.picture}
                        className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl"
                    />
                    :
                    <div className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl bg-gray-100 flex items-center justify-center"
                         data-testid={`user-picture-placeholder-${props.contact.id}`}>
                        <User size={48} className="opacity-25"/>
                    </div>

                }
                {props.contact.company && props.contact.company.picture &&
                    <img
                        src={props.contact.company.picture}
                        className="sm:w-16 sm:h-16 w-12 h-12 object-cover rounded-xl absolute left-1 bottom-1 opacity-60"
                    />
                }
            </div>

            <div className="flex flex-col w-full mt-0 pt-0 ml-5 break-words min-w-0 break-word">
                <p className="font-bold sm:text-xl text-l">
                    {props.contact.firstName} {props.contact.lastName}
                </p>
                <p>{props.contact.addresses.length > 0 ? props.contact.addresses[0].address : ""}</p>
                <p>{props.contact.emails.length > 0 ? props.contact.emails[0].address : ""}</p>
                <p>{props.contact.phones.length > 0 ? props.contact.phones[0].number : ""}</p>
            </div>
        </div>
    )
}
export default ContactGridTile