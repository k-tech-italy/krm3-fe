import { Contact } from "../../restapi/types.ts";
import { User } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  contact: Contact;
}
const ContactGridTile = (props: Props) => {
  return (
    <Link
      to={`/contacts/${props.contact.id}`}
      className="bg-card-dim rounded-xl p-3 sm:p-8 m-2 flex flex-row border-2 border-gray-300 items-center cursor-pointer hover:border-gray-600 hover:brightness-110 transition-colors"
      id={`contact-grid-tile-${props.contact.id}`}
      data-testid={`contact-grid-tile-${props.contact.id}`}
    >
      <div className="relative flex-shrink-0">
        {props.contact.picture ? (
          <img
            src={props.contact.picture}
            className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl"
          />
        ) : (
          <div
            className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl bg-card-dim border border-gray-400 transition-none flex items-center justify-center"
            data-testid={`user-picture-placeholder-${props.contact.id}`}
          >
            <User size={48} className="opacity-25" />
          </div>
        )}
        {props.contact.company && props.contact.company.picture && (
          <img
            src={props.contact.company.picture}
            className="sm:w-16 sm:h-16 w-12 h-12 object-cover rounded-xl absolute left-1 bottom-1 opacity-60"
          />
        )}
      </div>

      <div className="flex flex-col w-full mt-0 pt-0 ml-5 break-words min-w-0 break-word text-app">
        <p className="font-bold sm:text-xl text-l">
          {props.contact.firstName} {props.contact.lastName}
        </p>
        <p>{props.contact.addresses.length > 0 ? props.contact.addresses[0].address : ""}</p>
        <p>{props.contact.emails.length > 0 ? props.contact.emails[0].address : ""}</p>
        <p>{props.contact.phones.length > 0 ? props.contact.phones[0].number : ""}</p>
      </div>
    </Link>
  );
};
export default ContactGridTile;
