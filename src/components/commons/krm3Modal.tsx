import { useEffect } from "react";
import Modal from "react-modal";
import { X } from "lucide-react";

interface Krm3ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
  title?: string;
}

export default function Krm3Modal({
  open,
  onClose,
  children,
  title,
  width,
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

  // Modal styles that match original component
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
      maxWidth: width || "44rem",
      width: "100%",
      padding: 0,
      border: "none",
      borderRadius: "0.5rem",
      background: "var(--color-card-bg)",
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
      <div className="relative flex flex-col bg-card">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b-app">
          <p className="text-xl sm:text-2xl font-semibold text-app">
            {title}
          </p>
          <button
            className="text-app hover:text-krm3-primary focus:outline-none focus:ring-2 focus:ring-krm3-primary rounded p-1"
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