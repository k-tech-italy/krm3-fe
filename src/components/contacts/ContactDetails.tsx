import React, { useState } from "react";
import { ArrowLeft, User } from "lucide-react";
import { useGetContact } from "../../hooks/useContacts.tsx";

interface Props {
  contactId: number;
  close: () => void;
}

const FieldRow = ({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`flex flex-col sm:flex-row sm:items-baseline mb-2 ${className}`}>
    <span className="text-sm font-bold text-gray-800 sm:w-1/3 min-w-[120px] mb-1 sm:mb-0">
      {label}
    </span>
    <div className="text-gray-900 sm:w-2/3 break-words font-medium">
      {children || <span className="text-gray-400 font-normal">—</span>}
    </div>
  </div>
);

export function ContactDetails({ contactId, close }: Props): React.ReactElement {
  const { data: contact, isLoading, error } = useGetContact(contactId);
  const [activeTab, setActiveTab] = useState<"general" | "notes">("general");

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (error || !contact) return <div className="p-8 text-red-500">Error loading contact</div>;

  const fullName = `${contact.firstName} ${contact.lastName}`.trim();

  return (
    <div className="bg-gray-100 min-h-full p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl mb-4">
        <button
          onClick={close}
          id="back-to-general-view"
          className="flex items-center text-gray-600 hover:text-gray-900 hover:cursor-pointer transition-colors"
        >
          <ArrowLeft size={24} className="mr-2" />
          <span className="font-bold text-lg">Back</span>
        </button>
      </div>

      <div className="w-full max-w-5xl bg-white shadow-sm border border-gray-300 rounded min-h-[600px] flex flex-col">
        <div className="p-6 sm:p-10 pb-0">
          <div className="flex flex-col-reverse sm:flex-row justify-between items-start gap-6">
            <div className="flex-1 w-full">
              <div className="mb-6">
                <h1 className="font-normal text-gray-900 mb-2">
                  {contact.title && (
                    <span className="font-semibold">
                      {contact.title.charAt(0).toUpperCase() + contact.title.slice(1)}.{" "}
                    </span>
                  )}
                  {fullName}
                </h1>
                {contact.company && (
                  <div className="flex items-center text-gray-600 text-lg">
                    <span>{contact.company.name}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="relative group shrink-0">
              {contact.picture ? (
                <img
                  src={contact.picture}
                  alt={fullName}
                  className="w-24 h-24 sm:w-32 sm:h-32 object-cover shadow-sm rounded border border-gray-300"
                />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 border border-gray-300 flex items-center justify-center text-gray-400 rounded">
                  <User size={48} />
                </div>
              )}
              {contact.company?.picture && (
                <img
                  src={contact.company.picture}
                  className="absolute -bottom-2 -right-2 w-10 h-10 border-2 border-white rounded-full object-cover shadow-sm bg-white"
                  alt="Company logo"
                />
              )}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4">
            <div className="space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-start mb-4">
                <FieldRow label="Address">
                  {contact.addresses.map((address, i) => (
                    <div
                      key={address.address || `addr-${i}`}
                      className="flex items-center text-gray-900 mb-1 last:mb-0"
                    >
                      {address.address}
                    </div>
                  ))}
                </FieldRow>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start mb-4">
                <FieldRow label="Tax ID">{contact.taxId}</FieldRow>
              </div>
            </div>

            <div className="space-y-2">
              <FieldRow label="Job Title">{contact.jobTitle}</FieldRow>

              <FieldRow label="Phone">
                {contact.phones.map((p, i) => (
                  <div
                    key={p.number || `phone-${i}`}
                    className="flex items-center text-gray-900 mb-1 last:mb-0"
                  >
                    {p.number}
                  </div>
                ))}
              </FieldRow>

              <FieldRow label="Email">
                {contact.emails.map((e, i) => (
                  <div
                    key={e.address || `email-${i}`}
                    className="flex items-center text-gray-900 mb-1 last:mb-0 break-all"
                  >
                    {e.address}
                  </div>
                ))}
              </FieldRow>

              <FieldRow label="Website">
                {contact.websites.map((w, i) => (
                  <div
                    key={w.url || `site-${i}`}
                    className="flex items-center text-gray-900 mb-1 last:mb-0 break-all"
                  >
                    {w.url}
                  </div>
                ))}
              </FieldRow>
            </div>
          </div>
        </div>

        <div className="mt-12 flex-1 flex flex-col">
          <div className="px-6 sm:px-10 border-b border-gray-200 flex space-x-8">
            <button
              onClick={() => setActiveTab("general")}
              className={`pb-2 text-sm font-bold border-b-2 transition-colors hover:cursor-pointer ${
                activeTab === "general"
                  ? "border-gray-800 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Contacts & Addresses
            </button>
            <button
              onClick={() => setActiveTab("notes")}
              className={`pb-2 text-sm font-bold border-b-2 transition-colors hover:cursor-pointer ${
                activeTab === "notes"
                  ? "border-gray-800 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Internal Notes
            </button>
          </div>

          <div className="p-6 sm:p-10 bg-white flex-1">
            {activeTab === "general" && (
              <div className="text-gray-400 text-sm italic">Additional address details...</div>
            )}

            {activeTab === "notes" && (
              <div className="w-full h-full">
                {contact.internalNotes ? (
                  <p className="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed font-normal">
                    {contact.internalNotes}
                  </p>
                ) : (
                  <p className="text-gray-400 italic text-sm">No internal notes.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
