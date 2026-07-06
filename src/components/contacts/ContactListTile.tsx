import { Contact } from "../../restapi/types.ts";
import { User, MapPin, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  contact: Contact;
}

const ContactListTile = (props: Props) => {
  const { contact } = props;
  const fullName = `${contact.firstName} ${contact.lastName}`.trim();

  const firstEmail = contact.emails[0]?.address;
  const firstPhone = contact.phones[0]?.number;
  const firstAddress = contact.addresses[0]?.address;

  return (
    <Link
      to={`/contacts/${contact.id}`}
      className={`rounded-xl p-3 border border-app
                 hover:border-krm3-primary hover:bg-card-dim transition-all
                 grid grid-cols-[auto_2fr_2fr] md:grid-cols-[auto_2fr_2fr_2fr_2fr]
                 items-center gap-4 ${contact.isActive ? "bg-card" : "bg-card-dim opacity-70"}`}
      id={`contact-list-tile-${contact.id}`}
      data-testid={`contact-list-tile-${contact.id}`}
    >
      {contact.picture ? (
        <img
          src={contact.picture}
          alt={fullName}
          className="w-10 h-10 sm:w-14 sm:h-14 object-cover rounded-xl"
        />
      ) : (
        <div
          className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-card-dim border border-app flex items-center justify-center"
          data-testid={`user-picture-placeholder-${contact.id}`}
        >
          <User size={24} className="text-muted opacity-50" />
        </div>
      )}

      <div className="min-w-0">
        <p className="font-semibold text-app truncate">{fullName}</p>
        {contact.jobTitle && (
          <p className="text-xs sm:text-sm text-muted truncate">{contact.jobTitle}</p>
        )}
      </div>

      <p className="hidden md:flex items-center gap-2 text-sm text-app truncate">
        <MapPin size={16} className="text-muted shrink-0" />
        <span className="truncate">{firstAddress || "—"}</span>
      </p>

      <p className="flex items-center gap-2 text-sm text-app truncate">
        <Mail size={16} className="text-muted shrink-0" />
        <span className="truncate">{firstEmail || "—"}</span>
      </p>

      <p className="flex items-center gap-2 text-xs sm:text-sm text-app truncate">
        <Phone size={16} className="text-muted shrink-0" />
        <span className="truncate">{firstPhone || "—"}</span>
      </p>
    </Link>
  );
};

export default ContactListTile;
