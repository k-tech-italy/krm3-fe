import React, { useState } from "react";
import {
  ArrowLeft,
  User,
  MapPin,
  Mail,
  Phone,
  Globe,
  CircleCheck,
  CircleX,
  LucideIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  useGetContact,
  useUpdateContact,
  useDeleteContact,
  useToggleContactActive,
  CreateContactProps,
} from "../../hooks/useContacts.tsx";
import { useGetCurrentUser } from "../../hooks/useAuth.tsx";
import { ContactForm } from "./ContactForm.tsx";
import Krm3Modal from "../commons/krm3Modal.tsx";
import Krm3Button from "../commons/Krm3Button.tsx";
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
    <div className="bg-card-dim rounded-xl p-4 border border-app h-full">
      <h3 className="text-sm font-bold text-muted uppercase tracking-wide !m-0 !mb-3">
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
  const { data: contact, isLoading, error, refetch } = useGetContact(contactId);
  const { userCan } = useGetCurrentUser();
  const { mutate: updateContact } = useUpdateContact();
  const { mutate: deleteContact, isLoading: isDeleting } = useDeleteContact();
  const { mutate: toggleContactActive } = useToggleContactActive();
  const [activeTab, setActiveTab] = useState<"general" | "notes">("general");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isToggleActiveConfirmOpen, setIsToggleActiveConfirmOpen] = useState(false);
  const [toggleActionLabel, setToggleActionLabel] = useState("Deactivate");

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (error || !contact) return <div className="p-8 text-red-500">Error loading contact</div>;

  const canChangeContact = userCan(["core.change_contact"]);
  const canDeleteContact = userCan(["core.delete_contact"]);

  const fullName = `${contact.firstName} ${contact.lastName}`.trim();

  const handleEditSubmit = (data: CreateContactProps) => {
    updateContact(
      { id: contactId, data },
      {
        onSuccess: () => {
          toast.success("Contact updated successfully");
          setIsEditModalOpen(false);
          refetch();
        },
        onError: (err) => {
          toast.error("Failed to update contact");
          console.error(err);
        },
      }
    );
  };

  const handleDeleteConfirm = () => {
    deleteContact(contactId, {
      onSuccess: () => {
        toast.success("Contact deleted successfully");
        close();
      },
      onError: (err) => {
        toast.error("Failed to delete contact");
        console.error(err);
      },
    });
  };

  const handleToggleActiveConfirm = () => {
    setIsToggleActiveConfirmOpen(false);
    toggleContactActive(
      { id: contactId, isActive: !contact.isActive },
      {
        onSuccess: () => {
          toast.success(contact.isActive ? "Contact deactivated" : "Contact activated");
          refetch();
        },
        onError: (err) => {
          toast.error(
            contact.isActive ? "Failed to deactivate contact" : "Failed to activate contact"
          );
          console.error(err);
        },
      }
    );
  };

  return (
    <div className="bg-app min-h-full p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl mb-4 flex justify-between items-center">
        <button
          onClick={close}
          id="back-to-general-view"
          className="flex items-center text-muted hover:text-app transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} className="mr-2" />
          <span className="font-bold text-lg">Back</span>
        </button>
        <div className="flex gap-2">
          {canChangeContact && (
            <>
              <Krm3Button
                id="edit-button"
                label="Edit"
                style="secondary"
                onClick={() => setIsEditModalOpen(true)}
              />
              <Krm3Button
                id="toggle-active-button"
                label={contact.isActive ? "Deactivate" : "Activate"}
                style="primary"
                onClick={() => {
                  setToggleActionLabel(contact.isActive ? "Deactivate" : "Activate");
                  setIsToggleActiveConfirmOpen(true);
                }}
              />
            </>
          )}
          {canDeleteContact && (
            <Krm3Button
              id="delete-button"
              label="Delete"
              style="danger"
              onClick={() => setIsDeleteConfirmOpen(true)}
            />
          )}
        </div>
      </div>

      <div className="w-full max-w-5xl bg-card shadow-sm border border-app rounded-2xl min-h-[600px] flex flex-col overflow-hidden">
        <div className="relative p-6 sm:p-10 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          <div
            className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-1.5 text-sm font-medium"
            data-testid="contact-status-indicator"
          >
            {contact.isActive ? (
              <>
                <CircleCheck size={16} className="text-green-600" />
                <span className="text-green-600">Active</span>
              </>
            ) : (
              <>
                <CircleX size={16} className="text-red-600" />
                <span className="text-red-600">Inactive</span>
              </>
            )}
          </div>

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
                  {contact.title.charAt(0).toUpperCase() + contact.title.slice(1)}{" "}
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
            className={`pb-3 text-sm font-bold border-b-2 hover:transition-colors cursor-pointer ${
              activeTab === "general"
                ? "border-krm3-primary text-app"
                : "border-transparent text-muted hover:text-app"
            }`}
          >
            Contacts & Addresses
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`pb-3 text-sm font-bold border-b-2 hover:transition-colors cursor-pointer ${
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
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
                renderItem={(e: Email) => (
                  <a
                    href={`mailto:${e.address}`}
                    className="text-krm3-primary hover:underline break-all"
                  >
                    {e.address}
                  </a>
                )}
              />
              <ContactSection
                title="Phones"
                icon={Phone}
                items={contact.phones}
                emptyMessage="No phones available."
                renderItem={(p: PhoneType) => (
                  <a href={`tel:${p.number}`} className="text-krm3-primary hover:underline">
                    {p.number}
                  </a>
                )}
              />
              <ContactSection
                title="Websites"
                icon={Globe}
                items={contact.websites}
                emptyMessage="No websites available."
                renderItem={(w: Website) => (
                  <a
                    href={w.url.startsWith("http") ? w.url : `https://${w.url}`}
                    className="text-krm3-primary hover:underline break-all"
                  >
                    {w.url}
                  </a>
                )}
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

      <Krm3Modal
        open={isEditModalOpen}
        title="Edit Contact"
        onClose={() => setIsEditModalOpen(false)}
      >
        <ContactForm
          initialData={contact}
          onSubmit={handleEditSubmit}
          onCancel={() => setIsEditModalOpen(false)}
          onSuccess={() => setIsEditModalOpen(false)}
        />
      </Krm3Modal>

      <Krm3Modal
        open={isDeleteConfirmOpen}
        title="Delete Contact"
        onClose={() => setIsDeleteConfirmOpen(false)}
      >
        <div className="flex flex-col gap-4">
          <p className="text-app">
            Are you sure you want to delete <strong>{fullName}</strong>? This action cannot be
            undone.
          </p>
          <div className="flex gap-2 justify-end">
            <Krm3Button
              label="Cancel"
              style="secondary"
              onClick={() => setIsDeleteConfirmOpen(false)}
            />
            <Krm3Button
              id="delete-confirm"
              label={isDeleting ? "Deleting..." : "Delete"}
              style="danger"
              onClick={handleDeleteConfirm}
            />
          </div>
        </div>
      </Krm3Modal>

      <Krm3Modal
        open={isToggleActiveConfirmOpen}
        title={`${toggleActionLabel} Contact`}
        onClose={() => setIsToggleActiveConfirmOpen(false)}
      >
        <div className="flex flex-col gap-4">
          <p className="text-app">
            Are you sure you want to {toggleActionLabel.toLowerCase()} <strong>{fullName}</strong>?
            {toggleActionLabel === "Deactivate" &&
              " They will no longer appear in active contacts lists."}
          </p>
          <div className="flex gap-2 justify-end">
            <Krm3Button
              label="Cancel"
              style="secondary"
              onClick={() => setIsToggleActiveConfirmOpen(false)}
            />
            <Krm3Button
              id="toggle-active-confirm"
              label={toggleActionLabel}
              style="primary"
              onClick={handleToggleActiveConfirm}
            />
          </div>
        </div>
      </Krm3Modal>
    </div>
  );
}
