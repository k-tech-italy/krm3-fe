import { UseContactFormReturn } from "../../hooks/useContactForm";

const CONTACT_TYPES = ["Individual", "Company", "Lead", "Supplier"];

interface ContactFormFieldsProps {
  form: UseContactFormReturn["form"];
  errors: UseContactFormReturn["errors"];
  setName: UseContactFormReturn["setName"];
  setType: UseContactFormReturn["setType"];
  addPhone: UseContactFormReturn["addPhone"];
  updatePhone: UseContactFormReturn["updatePhone"];
  removePhone: UseContactFormReturn["removePhone"];
  addEmail: UseContactFormReturn["addEmail"];
  updateEmail: UseContactFormReturn["updateEmail"];
  removeEmail: UseContactFormReturn["removeEmail"];
}

export default function ContactFormFields({
  form,
  errors,
  setName,
  setType,
  addPhone,
  updatePhone,
  removePhone,
  addEmail,
  updateEmail,
  removeEmail,
}: ContactFormFieldsProps) {
  return (
    <div className="px-6 py-5 space-y-5">
      {/* Name */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1" htmlFor="contact-name">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          id="contact-name"
          type="text"
          value={form.name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name or company name"
          className={`w-full px-3 py-2 text-sm rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
            errors.name
              ? "border-red-300 focus:ring-red-200"
              : "border-slate-200 focus:ring-indigo-200 focus:border-indigo-400"
          }`}
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
      </div>

      {/* Type */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1" htmlFor="contact-type">
          Type
        </label>
        <select
          id="contact-type"
          value={form.type}
          onChange={(e) => setType(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
        >
          {CONTACT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Phone rows */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-600">Phone numbers</span>
          <button
            type="button"
            onClick={addPhone}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add phone
          </button>
        </div>

        {form.phones.length === 0 && (
          <p className="text-xs text-slate-400 italic">No phone numbers added.</p>
        )}

        <div className="space-y-2">
          {form.phones.map((phone) => (
            <div key={phone.id} className="flex gap-2 items-start">
              <input
                type="tel"
                value={phone.number}
                onChange={(e) => updatePhone(phone.id, "number", e.target.value)}
                placeholder="Phone number"
                className={`flex-1 px-3 py-2 text-sm rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.phones?.[phone.id]
                    ? "border-red-300 focus:ring-red-200"
                    : "border-slate-200 focus:ring-indigo-200 focus:border-indigo-400"
                }`}
              />
              <select
                value={phone.type}
                onChange={(e) => updatePhone(phone.id, "type", e.target.value)}
                className="px-2 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
              >
                <option value="mobile">Mobile</option>
                <option value="landline">Landline</option>
              </select>
              <button
                type="button"
                onClick={() => removePhone(phone.id)}
                aria-label="Remove phone"
                className="mt-0.5 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {errors.phones?.[phone.id] && (
                <p className="text-xs text-red-500 mt-1">{errors.phones[phone.id]}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Email rows */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-600">Email addresses</span>
          <button
            type="button"
            onClick={addEmail}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add email
          </button>
        </div>

        {form.emails.length === 0 && (
          <p className="text-xs text-slate-400 italic">No email addresses added.</p>
        )}

        <div className="space-y-2">
          {form.emails.map((emailRow) => (
            <div key={emailRow.id} className="flex gap-2 items-start">
              <input
                type="email"
                value={emailRow.email}
                onChange={(e) => updateEmail(emailRow.id, e.target.value)}
                placeholder="email@example.com"
                className={`flex-1 px-3 py-2 text-sm rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.emails?.[emailRow.id]
                    ? "border-red-300 focus:ring-red-200"
                    : "border-slate-200 focus:ring-indigo-200 focus:border-indigo-400"
                }`}
              />
              <button
                type="button"
                onClick={() => removeEmail(emailRow.id)}
                aria-label="Remove email"
                className="mt-0.5 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {errors.emails?.[emailRow.id] && (
                <p className="text-xs text-red-500 mt-1">{errors.emails[emailRow.id]}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
