import { CreateContactProps, useCreateContact } from "../../hooks/useContacts.tsx";
import { useState } from "react";
import Krm3Button from "../commons/Krm3Button.tsx";

interface ContactFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ContactForm({ onSuccess, onCancel }: ContactFormProps) {
  const { mutate, isLoading } = useCreateContact();
  const [form, setForm] = useState<CreateContactProps>({
    firstName: "",
    lastName: "",
    email: { address: "", kind: "" },
    phone: { number: "", kind: "" },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(form, {
      onSuccess: () => {
        setForm({
          firstName: "",
          lastName: "",
          email: { address: "", kind: "" },
          phone: { number: "", kind: "" },
        });
        onSuccess?.();
      },
    });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, email: { ...prev.email, [e.target.name]: e.target.value } }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, phone: { ...prev.phone, [e.target.name]: e.target.value } }));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="justify-between flex gap-2">
        <div className="justify-start-safe flex gap-4">
          <label className="font-semibold">First Name:</label>
          <input name="firstName" value={form.firstName} onChange={handleChange} />
        </div>

        <div className="justify-start-safe flex gap-4">
          <label className="font-semibold">Last Name:</label>
          <input name="lastName" value={form.lastName} onChange={handleChange} />
        </div>
      </div>

      <label className="font-semibold">Email Address(es):</label>
      <input name="email" type="email" value={form.email?.address} onChange={handleEmailChange} />

      <label className="font-semibold">Telephone Number(s):</label>
      <input name="phone" type="tel" value={form.phone?.number} onChange={handlePhoneChange} />
      <div className="flex gap-2 justify-end-safe">
        <Krm3Button label="Cancel" style="secondary" onClick={onCancel} />
        <Krm3Button label={isLoading ? "Creating..." : "Create contact"} />
      </div>
    </form>
  );
}
