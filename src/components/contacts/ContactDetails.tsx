import React, { useState } from "react";
import { ArrowLeft, User, MapPin, Mail, Phone, Globe, LucideIcon } from "lucide-react";
import { useGetContact } from "../../hooks/useContacts.tsx";
import { Address, Email, Phone as PhoneType, Website } from "../../restapi/types.ts";

interface Props {
  contactId: number;
  close: () => void;
}

interface SectionProps<T> {
  title: string;
  icon: LucideIcon;
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyMessage: string;
}

function ContactSection<T>({
  title,
  icon: Icon,
  items,
  renderItem,
  emptyMessage,
}: SectionProps<T>) {
  return (
    <div className="bg-card-dim rounded-xl p-4 border border-app self-start">
      <h3 className="text-sm font-bold text-muted uppercase tracking-wide mb-3">
        <Icon size={18} className="inline-block mr-2 align-text-bottom" />
        {title}
      </h3>
      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i}>{renderItem(item, i)}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted italic">{emptyMessage}</p>
      )}
    </div>
  );
}

export function ContactDetails({ contactId, close }: Props): React.ReactElement {
  const { data: contact, isLoading, error } = useGetContact(contactId);
  const [activeTab, setActiveTab] = useState<"general" | "notes">("general");

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (error || !contact) return <div className="p-8 text-red-500">Error loading contact</div>;

  const fullName = `${contact.firstName} ${contact.lastName}`.trim();

  return (
    <div className="bg-app min-h-full p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl mb-4">
        <button
          onClick={close}
          id="back-to-general-view"
          className="flex items-center text-muted hover:text-app transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          <span className="font-bold text-lg">Back</span>
        </button>
      </div>

      <div className="w-full max-w-5xl bg-card shadow-sm border border-app rounded-2xl min-h-[600px] flex flex-col overflow-hidden">
        <div className="p-6 sm:p-10 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          <div className="relative shrink-0">
            {contact.picture ? (
              <img
                src={contact.picture}
                alt={fullName}
                className="w-28 h-28 sm:w-36 sm:h-36 object-cover rounded-2xl shadow-sm border border-app"
              />
            ) : (
              <div className="w-28 h-28 sm:w-36 sm:h-36 bg-card-dim border border-app flex items-center justify-center text-muted rounded-2xl">
                <User size={56} />
              </div>
            )}
            {contact.company?.picture && (
              <img
                src={contact.company.picture}
                className="absolute -bottom-2 -right-2 w-12 h-12 border-2 border-card rounded-full object-cover shadow-sm bg-card"
                alt="Company logo"
              />
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="font-normal text-app mb-2">
              {contact.title && (
                <span className="text-muted text-2xl font-light mr-1">
                  {contact.title.charAt(0).toUpperCase() + contact.title.slice(1)}.{" "}
                </span>
              )}
              {fullName}
            </h1>
            {contact.jobTitle && <p className="text-lg text-muted">{contact.jobTitle}</p>}
            {contact.company && <p className="text-lg text-muted">{contact.company.name}</p>}
            {contact.taxId && <p className="text-sm text-muted mt-2">Tax ID: {contact.taxId}</p>}
          </div>
        </div>

        <div className="border-b border-app flex px-6 sm:px-10 gap-8">
          <button
            onClick={() => setActiveTab("general")}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "general"
                ? "border-krm3-primary text-app"
                : "border-transparent text-muted hover:text-app"
            }`}
          >
            Contacts & Addresses
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "notes"
                ? "border-krm3-primary text-app"
                : "border-transparent text-muted hover:text-app"
            }`}
          >
            Internal Notes
          </button>
        </div>

        <div className="p-6 sm:p-10 bg-card">
          {activeTab === "general" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <ContactSection
                title="Addresses"
                icon={MapPin}
                items={contact.addresses}
                emptyMessage="No addresses available."
                renderItem={(a: Address) => <span className="text-app">{a.address}</span>}
              />
              <ContactSection
                title="Emails"
                icon={Mail}
                items={contact.emails}
                emptyMessage="No emails available."
                renderItem={(e: Email) => <span className="text-app break-all">{e.address}</span>}
              />
              <ContactSection
                title="Phones"
                icon={Phone}
                items={contact.phones}
                emptyMessage="No phones available."
                renderItem={(p: PhoneType) => <span className="text-app">{p.number}</span>}
              />
              <ContactSection
                title="Websites"
                icon={Globe}
                items={contact.websites}
                emptyMessage="No websites available."
                renderItem={(w: Website) => <span className="text-app break-all">{w.url}</span>}
              />
            </div>
          )}

          {activeTab === "notes" && (
            <div className="w-full h-full">
              {contact.internalNotes ? (
                <p className="whitespace-pre-wrap text-app text-sm leading-relaxed font-normal">
                  {contact.internalNotes}
                </p>
              ) : (
                <p className="text-muted italic text-sm">No internal notes.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
