import { useState, useCallback } from "react";
import { createContact } from "../restapi/contacts.ts";

export interface PhoneRow {
  id: string;
  number: string;
  type: "mobile" | "landline";
}

export interface EmailRow {
  id: string;
  email: string;
}

export interface ContactFormState {
  name: string;
  type: string;
  phones: PhoneRow[];
  emails: EmailRow[];
}

export interface ContactFormErrors {
  name?: string;
  emails?: Record<string, string>;
  phones?: Record<string, string>;
  general?: string;
}

const EMPTY_FORM: ContactFormState = {
  name: "",
  type: "Individual",
  phones: [],
  emails: [],
};

const uid = () => Math.random().toString(36).slice(2, 9);

function validate(form: ContactFormState): ContactFormErrors {
  const errors: ContactFormErrors = {};

  if (!form.name.trim()) {
    errors.name = "Name is required.";
  }

  const emailErrors: Record<string, string> = {};
  form.emails.forEach((row) => {
    if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
      emailErrors[row.id] = "Invalid email format.";
    }
  });
  if (Object.keys(emailErrors).length) errors.emails = emailErrors;

  const phoneErrors: Record<string, string> = {};
  form.phones.forEach((row) => {
    if (!row.number.trim()) {
      phoneErrors[row.id] = "Phone number cannot be empty.";
    }
  });
  if (Object.keys(phoneErrors).length) errors.phones = phoneErrors;

  return errors;
}

function hasErrors(errors: ContactFormErrors): boolean {
  return !!(
    errors.name ||
    (errors.emails && Object.keys(errors.emails).length > 0) ||
    (errors.phones && Object.keys(errors.phones).length > 0)
  );
}

export interface UseContactFormReturn {
  form: ContactFormState;
  isDirty: boolean;
  isSubmitting: boolean;
  errors: ContactFormErrors;
  setName: (v: string) => void;
  setType: (v: string) => void;
  addPhone: () => void;
  updatePhone: (id: string, field: keyof Omit<PhoneRow, "id">, value: string) => void;
  removePhone: (id: string) => void;
  addEmail: () => void;
  updateEmail: (id: string, value: string) => void;
  removeEmail: (id: string) => void;
  handleSaveAndClose: (onClose: () => void) => Promise<void>;
  handleSaveAndNew: () => Promise<void>;
  resetForm: () => void;
}

export function useContactForm(): UseContactFormReturn {
  const [form, setForm] = useState<ContactFormState>(EMPTY_FORM);
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ContactFormErrors>({});

  const markDirty = () => setIsDirty(true);

  const resetForm = useCallback(() => {
    setForm(EMPTY_FORM);
    setIsDirty(false);
    setErrors({});
  }, []);

  const setName = (v: string) => {
    setForm((f) => ({ ...f, name: v }));
    markDirty();
  };

  const setType = (v: string) => {
    setForm((f) => ({ ...f, type: v }));
    markDirty();
  };

  const addPhone = () => {
    setForm((f) => ({
      ...f,
      phones: [...f.phones, { id: uid(), number: "", type: "mobile" }],
    }));
    markDirty();
  };

  const updatePhone = (id: string, field: keyof Omit<PhoneRow, "id">, value: string) => {
    setForm((f) => ({
      ...f,
      phones: f.phones.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    }));
    markDirty();
  };

  const removePhone = (id: string) => {
    setForm((f) => ({ ...f, phones: f.phones.filter((p) => p.id !== id) }));
    markDirty();
  };

  const addEmail = () => {
    setForm((f) => ({
      ...f,
      emails: [...f.emails, { id: uid(), email: "" }],
    }));
    markDirty();
  };

  const updateEmail = (id: string, value: string) => {
    setForm((f) => ({
      ...f,
      emails: f.emails.map((e) => (e.id === id ? { ...e, email: value } : e)),
    }));
    markDirty();
  };

  const removeEmail = (id: string) => {
    setForm((f) => ({ ...f, emails: f.emails.filter((e) => e.id !== id) }));
    markDirty();
  };

  const submit = async (): Promise<boolean> => {
    const validationErrors = validate(form);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return false;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await createContact({
        firstName: form.name.trim(),
        // type: form.type,
        phones: form.phones.map(({ number, type }) => ({ number, type })),
        // emails: form.emails.map(({ email }) => ({ email })),
      });
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrors({ general: message });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAndClose = async (onClose: () => void) => {
    const ok = await submit();
    if (ok) {
      resetForm();
      onClose();
    }
  };

  const handleSaveAndNew = async () => {
    const ok = await submit();
    if (ok) {
      resetForm();
    }
  };

  return {
    form,
    isDirty,
    isSubmitting,
    errors,
    setName,
    setType,
    addPhone,
    updatePhone,
    removePhone,
    addEmail,
    updateEmail,
    removeEmail,
    handleSaveAndClose,
    handleSaveAndNew,
    resetForm,
  };
}
