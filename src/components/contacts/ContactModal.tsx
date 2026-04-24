import { useState } from "react";
import ContactFormFields from "./ContactFormFields";
import { useContactForm } from "../../hooks/useContactForm";
import BaseModal from "../commons/Modal.tsx";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export default function ContactModal({ isOpen, onClose, onSuccess }: ContactModalProps) {
  const {
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
  } = useContactForm();

  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Guarded close — if dirty, show inline confirm instead
  const guardedClose = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    resetForm();
    setShowDiscardConfirm(false);
    onClose();
  };

  const handleSaveAndCloseWithSuccess = async () => {
    await handleSaveAndClose(() => {
      setShowDiscardConfirm(false);
      onClose();
      onSuccess?.();
    });
  };

  const handleSaveAndNewWithSuccess = async () => {
    await handleSaveAndNew();
    onSuccess?.();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={guardedClose} title="Add Contact">
      <ContactFormFields
        form={form}
        errors={errors}
        setName={setName}
        setType={setType}
        addPhone={addPhone}
        updatePhone={updatePhone}
        removePhone={removePhone}
        addEmail={addEmail}
        updateEmail={updateEmail}
        removeEmail={removeEmail}
      />

      {/* Footer */}
      <div className="px-6 pb-5 space-y-3">
        {/* Inline general error */}
        {errors.general && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
            <svg
              className="w-4 h-4 text-red-500 mt-0.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <p className="text-xs text-red-700">{errors.general}</p>
          </div>
        )}

        {/* Inline discard confirm */}
        {showDiscardConfirm && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
            <p className="text-sm font-medium text-amber-800 mb-2">Discard unsaved changes?</p>
            <div className="flex gap-2">
              <button
                onClick={handleClose}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-amber-600 text-white hover:bg-amber-700 transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowDiscardConfirm(false)}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-white border border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {!showDiscardConfirm && (
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={guardedClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              Discard
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveAndNewWithSuccess}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50"
              >
                {isSubmitting && <Spinner />}
                Save & New
              </button>

              <button
                type="button"
                onClick={handleSaveAndCloseWithSuccess}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
              >
                {isSubmitting && <Spinner />}
                Save & Close
              </button>
            </div>
          </div>
        )}
      </div>
    </BaseModal>
  );
}
