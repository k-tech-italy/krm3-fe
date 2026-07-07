import { Contact } from "../../restapi/types.ts";
import { User, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  contact: Contact;
}

const InfoRow = ({
  icon: Icon,
  text,
  fallback,
}: {
  icon: typeof User;
  text?: string;
  fallback: string;
}) => (
  <div className="flex items-center gap-2 text-sm text-app">
    <Icon size={16} className="text-muted shrink-0" />
    {text ? (
      <span className="truncate">{text}</span>
    ) : (
      <span className="text-muted italic">{fallback}</span>
    )}
  </div>
);

const ContactGridTile = (props: Props) => {
  const { contact } = props;
  const fullName = `${contact.firstName} ${contact.lastName}`.trim();

  const firstEmail = contact.emails[0]?.address;
  const firstPhone = contact.phones[0]?.number;
  const firstAddress = contact.addresses[0]?.address;

  return (
    <Link
      to={`/contacts/${contact.id}`}
      className={`rounded-2xl p-4 sm:p-6 border border-app shadow-sm
                 hover:border-krm3-primary hover:shadow-md transition-all
                 flex flex-col gap-4 ${contact.isActive ? "bg-card" : "bg-card-dim opacity-70"}`}
      id={`contact-grid-tile-${contact.id}`}
      data-testid={`contact-grid-tile-${contact.id}`}
    >
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          {contact.picture ? (
            <img
              src={contact.picture}
              alt={fullName}
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl"
            />
          ) : (
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-card-dim border border-app flex items-center justify-center"
              data-testid={`user-picture-placeholder-${contact.id}`}
            >
              <User size={32} className="text-muted opacity-50" />
            </div>
          )}
          {contact.company?.picture && (
            <img
              src={contact.company.picture}
              alt={contact.company.name}
              className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 border-2 border-card rounded-full object-cover bg-card"
            />
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-app truncate">{fullName}</h3>
          {contact.jobTitle && <p className="text-sm text-muted truncate">{contact.jobTitle}</p>}
          {contact.company && <p className="text-sm text-muted truncate">{contact.company.name}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <InfoRow icon={Mail} text={firstEmail} fallback="No email" />
        <InfoRow icon={Phone} text={firstPhone} fallback="No phone" />
        <InfoRow icon={MapPin} text={firstAddress} fallback="No address" />
      </div>
    </Link>
  );
};

export default ContactGridTile;
