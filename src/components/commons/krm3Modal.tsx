import { useState, useEffect } from "react";
import Modal from "react-modal";
import { X } from "lucide-react";

// Make sure to set the app element for accessibility
// This should be done once in your app's entry point (e.g., index.js or App.js)
// Modal.setAppElement('#root');

interface Krm3ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export default function Krm3Modal({
  open,
  onClose,
  children,
  title,
}: Krm3ModalProps) {
  // Handle body scroll lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Modal styles that match your original component
  const customStyles = {
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
      transition: "background-color 300ms",
    },
    content: {
      position: "relative" as const,
      top: "auto",
      left: "auto",
      right: "auto",
      bottom: "auto",
      maxWidth: "44rem",
      width: "100%",
      padding: 0,
      border: "none",
      borderRadius: "0.5rem",
      background: "#fff",
      maxHeight: "90vh",
      overflow: "auto",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
      margin: "0 1rem",
    },
  };

  return (
    <Modal
      isOpen={open}
      onRequestClose={onClose}
      style={customStyles}
      contentLabel={title || "Modal"}
      closeTimeoutMS={300}
      ariaHideApp={false}
    >
      <div className="relative flex flex-col bg-white">
        <div className="flex justify-between items-center p-4 sm:p-6">
          <p className="text-xl sm:text-2xl font-semibold text-gray-800">
            {title}
          </p>
          <button
            className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded p-1"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </Modal>
  );
}