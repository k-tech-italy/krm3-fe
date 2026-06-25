import { Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  CreateContactProps,
  useCreateContact,
  useGetClients,
  useGetTitles,
} from "../../hooks/useContacts.tsx";
import Krm3Button from "../commons/Krm3Button.tsx";

interface ContactFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormErrors {
  detail?: string[];
  emails?: { address?: string[] }[];
  phones?: { number?: string[] }[];
  picture?: string[];
}

export function ContactForm({ onSuccess, onCancel }: ContactFormProps) {
  const { mutate, isLoading } = useCreateContact();
  const { data: clients, isLoading: clientsLoading } = useGetClients();
  const { data: titles, isLoading: titlesLoading } = useGetTitles();
  const submitModeRef = useRef<"close" | "add_another">("close");
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [form, setForm] = useState<CreateContactProps>({
    firstName: "",
    lastName: "",
    jobTitle: "",
    title: "",
    taxId: "",
    picture: "",
    company: null,
    internalNotes: "",
    emails: [{ address: "", kind: "" }],
    phones: [{ number: "", kind: "" }],
    websites: [],
    addresses: [{ address: "", kind: "" }],
  });

  const validateForm = (form: CreateContactProps): FormErrors => {
    const errors: FormErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = form.emails.filter(
      (e) => e.address.trim() !== "" && emailRegex.test(e.address)
    );
    if (validEmails.length === 0) {
      const firstEmpty = form.emails.find((e) => e.address.trim() === "");
      const firstInvalid = form.emails.find(
        (e) => e.address.trim() !== "" && !emailRegex.test(e.address)
      );
      if (firstEmpty) {
        errors.emails = [{ address: ["At least one valid email is required"] }];
      } else if (firstInvalid) {
        errors.emails = [{ address: ["At least one valid email is required"] }];
      } else {
        errors.emails = [{ address: ["At least one valid email is required"] }];
      }
    }

    const phoneRegex = /^[+\d\s-]+$/;
    const phoneErrors: { number?: string[] }[] = form.phones.map((phone) => {
      if (phone.number.trim() !== "" && !phoneRegex.test(phone.number)) {
        return { number: ["Invalid phone format. Use digits, +, spaces, or hyphens only."] };
      }
      return {};
    });
    if (phoneErrors.some((e) => e.number)) errors.phones = phoneErrors;

    if (form.picture && form.picture.trim() !== "") {
      const urlRegex = /^https?:\/\/.+/;
      if (!urlRegex.test(form.picture)) {
        errors.picture = ["Invalid URL. Must start with http:// or https://"];
      }
    }

    return errors;
  };

  const getFieldError = (
    fieldName: keyof FormErrors,
    index?: number,
    subField?: string
  ): string | undefined => {
    if (!formErrors[fieldName]) return;
    if (index !== undefined && Array.isArray(formErrors[fieldName])) {
      const arr = formErrors[fieldName] as Array<Record<string, string[] | undefined>>;
      const item = arr[index];
      if (item && subField && item[subField]) return item[subField].join(", ");
    }
    return undefined;
  };

  const setField = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setField(e.target.name, e.target.value);
    const name = e.target.name as keyof FormErrors;
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const addEmail = () => {
    setForm((prev) => ({ ...prev, emails: [...prev.emails, { address: "", kind: "" }] }));
  };

  const removeEmail = (index: number) => {
    setForm((prev) => ({ ...prev, emails: prev.emails.filter((_, i) => i !== index) }));
  };

  const handleEmailChange = (index: number, value: string) => {
    setForm((prev) => {
      const emails = [...prev.emails];
      emails[index] = { ...emails[index], address: value };
      return { ...prev, emails };
    });
    if (formErrors.emails?.[index]?.address) {
      setFormErrors((prev) => {
        const next: FormErrors = { ...prev };
        const emailErrors = [...(next.emails ?? [])];
        emailErrors[index] = { ...emailErrors[index], address: [] };
        next.emails = emailErrors;
        return next;
      });
    }
  };

  const addPhone = () => {
    setForm((prev) => ({ ...prev, phones: [...prev.phones, { number: "", kind: "" }] }));
  };

  const removePhone = (index: number) => {
    setForm((prev) => ({ ...prev, phones: prev.phones.filter((_, i) => i !== index) }));
  };

  const handlePhoneChange = (index: number, value: string) => {
    setForm((prev) => {
      const phones = [...prev.phones];
      phones[index] = { ...phones[index], number: value };
      return { ...prev, phones };
    });
    if (formErrors.phones?.[index]?.number) {
      setFormErrors((prev) => {
        const next: FormErrors = { ...prev };
        const phoneErrors = [...(next.phones ?? [])];
        phoneErrors[index] = { ...phoneErrors[index], number: [] };
        next.phones = phoneErrors;
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setFormErrors({});

    const cleaned = {
      ...form,
      company: form.company || null,
      emails: form.emails.filter((e) => e.address.trim() !== ""),
      phones: form.phones.filter((p) => p.number.trim() !== ""),
      addresses: form.addresses.filter((a) => a.address.trim() !== ""),
      websites: form.websites.filter((w) => w.url.trim() !== ""),
    };
    mutate(cleaned, {
      onSuccess: () => {
        toast.success("Contact created successfully");
        setForm({
          firstName: "",
          lastName: "",
          title: "",
          jobTitle: "",
          taxId: "",
          picture: "",
          company: null,
          internalNotes: "",
          emails: [{ address: "", kind: "" }],
          phones: [{ number: "", kind: "" }],
          websites: [],
          addresses: [{ address: "", kind: "" }],
        });
        setFormErrors({});
        if (submitModeRef.current === "close") {
          onSuccess?.();
        }
      },
      onError: (err: unknown) => {
        const axiosError = err as { response?: { data?: FormErrors } };
        setFormErrors(axiosError?.response?.data || { detail: ["An error occurred"] });
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {formErrors.detail && (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
          {Array.isArray(formErrors.detail) ? formErrors.detail.join(", ") : formErrors.detail}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-sm">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-sm">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-semibold text-sm">Title</label>
        <select
          name="title"
          value={form.title || ""}
          onChange={handleChange}
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        >
          <option value="">Select title</option>
          {titlesLoading && <option disabled>Loading...</option>}
          {titles?.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-sm">Job Title</label>
          <input
            name="jobTitle"
            value={form.jobTitle || ""}
            onChange={handleChange}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-sm">Tax ID</label>
          <input
            name="taxId"
            value={form.taxId || ""}
            onChange={handleChange}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-semibold text-sm">Company</label>
        <select
          name="company"
          value={form.company ?? ""}
          onChange={handleChange}
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        >
          <option value="">Select company</option>
          {clientsLoading && <option disabled>Loading...</option>}
          {clients?.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-semibold text-sm">Picture URL</label>
        <input
          name="picture"
          value={form.picture || ""}
          onChange={handleChange}
          placeholder="https://example.com/photo.jpg"
          className={`border rounded px-2 py-1 text-sm ${
            formErrors.picture ? "border-red-500" : "border-gray-300"
          }`}
        />
        {formErrors.picture && (
          <p className="text-red-500 text-xs">{formErrors.picture.join(", ")}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-semibold text-sm">Internal Notes</label>
        <textarea
          name="internalNotes"
          value={form.internalNotes || ""}
          onChange={handleChange}
          rows={3}
          className="border border-gray-300 rounded px-2 py-1 text-sm resize-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="font-semibold text-sm">
            Emails <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={addEmail}
            className="text-krm3-primary hover:text-krm3-primary-dark text-sm flex items-center gap-1"
          >
            <Plus size={14} /> Add email
          </button>
        </div>
        {form.emails.map((email, i) => (
          <div key={`email-${i}`} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={email.address}
                onChange={(e) => handleEmailChange(i, e.target.value)}
                placeholder="email@example.com"
                required={i === 0}
                className={`border rounded px-2 py-1 text-sm flex-1 ${
                  getFieldError("emails", i, "address") ? "border-red-500" : "border-gray-300"
                }`}
              />
              {form.emails.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEmail(i)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            {getFieldError("emails", i, "address") && (
              <p className="text-red-500 text-xs">{getFieldError("emails", i, "address")}</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="font-semibold text-sm">Phones</label>
          <button
            type="button"
            onClick={addPhone}
            className="text-krm3-primary hover:text-krm3-primary-dark text-sm flex items-center gap-1"
          >
            <Plus size={14} /> Add phone
          </button>
        </div>
        {form.phones.map((phone, i) => (
          <div key={`phone-${i}`} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <input
                type="tel"
                value={phone.number}
                onChange={(e) => handlePhoneChange(i, e.target.value)}
                placeholder="+1234567890"
                className={`border rounded px-2 py-1 text-sm flex-1 ${
                  getFieldError("phones", i, "number") ? "border-red-500" : "border-gray-300"
                }`}
              />
              {form.phones.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePhone(i)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            {getFieldError("phones", i, "number") && (
              <p className="text-red-500 text-xs">{getFieldError("phones", i, "number")}</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-semibold text-sm">Address</label>
        <input
          value={form.addresses[0]?.address || ""}
          onChange={(e) => {
            const addresses = [{ ...form.addresses[0], address: e.target.value }];
            setField("addresses", addresses);
          }}
          placeholder="123 Main St, City"
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-semibold text-sm">Website</label>
        <input
          value={form.websites[0]?.url || ""}
          onChange={(e) => {
            const websites = e.target.value ? [{ url: e.target.value }] : [];
            setField("websites", websites);
          }}
          placeholder="https://example.com"
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        />
      </div>

      <div className="text-xs text-gray-500 mt-2">
        <span className="text-red-500">*</span> Required fields
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Krm3Button label="Cancel" style="secondary" onClick={onCancel} />
        <Krm3Button
          type="submit"
          style="secondary"
          label={isLoading ? "Creating..." : "Create and add another"}
          onClick={() => (submitModeRef.current = "add_another")}
        />
        <Krm3Button
          type="submit"
          label={isLoading ? "Creating..." : "Create contact"}
          onClick={() => (submitModeRef.current = "close")}
        />
      </div>
    </form>
  );
}
