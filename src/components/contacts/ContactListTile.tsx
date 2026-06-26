import { Contact } from "../../restapi/types.ts";
import { Home, User } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  contact: Contact;
}
const ContactListTile = (props: Props) => {
  return (
    <Link
      to={`/contacts/${props.contact.id}`}
      className="bg-card rounded-xl p-2 sm:p-3 m-2 border-2 border-gray-300 grid grid-cols-[auto_auto_2fr_2fr_2fr]
            md:grid-cols-[auto_auto_2fr_2fr_2fr_2fr] items-center gap-2 cursor-pointer hover:border-gray-600 hover:brightness-110 transition-colors text-app"
      id={`contact-list-tile-${props.contact.id}`}
      data-testid={`contact-list-tile-${props.contact.id}`}
    >
      {props.contact.picture ? (
        <img
          src={props.contact.picture}
          className="w-8 h-8 sm:w-16 sm:h-16 object-cover rounded-xl"
        />
      ) : (
        <div
          className="w-8 h-8 sm:w-16 sm:h-16 rounded-xl bg-card border border-gray-400 transition-none flex items-center justify-center"
          data-testid={`user-picture-placeholder-${props.contact.id}`}
        >
          <User className="opacity-25" />
        </div>
      )}
      {props.contact.company && props.contact.company.picture ? (
        <img
          src={props.contact.company.picture}
          className="w-8 h-8 sm:w-16 sm:h-16 object-cover rounded-xl ml-2 sm:ml-5"
        />
      ) : (
        <div className="w-8 h-8 sm:w-16 sm:h-16 rounded-xl ml-2 sm:ml-5 bg-card border border-gray-400 transition-none flex items-center justify-center">
          <Home data-testid="company-picture-placeholder" className="opacity-25" />
        </div>
      )}

      <p className="font-bold sm:text-l text-sm">
        {props.contact.firstName} {props.contact.lastName}
      </p>
      <p className="hidden md:block text-xs sm:text-base">
        {props.contact.addresses.length > 0 ? props.contact.addresses[0].address : ""}
      </p>
      <p className="text-xs sm:text-base">
        {props.contact.emails.length > 0 ? props.contact.emails[0].address : ""}
      </p>
      <p className="text-xs sm:text-base">
        {props.contact.phones.length > 0 ? props.contact.phones[0].number : ""}
      </p>
    </Link>
  );
};
export default ContactListTile;
