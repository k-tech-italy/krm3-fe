import { X } from "lucide-react";

interface Props {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
}

export default function Krm3Modal({ open, onClose, children, title }: Props) {
    return (
        <div
            id='time-entry-modal'
            onClick={onClose}
            className={`fixed inset-0 flex justify-center items-center transition-colors duration-300 ${open ? "visible bg-black/20" : "invisible bg-transparent"
                }`}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative mx-auto w-full max-w-[44rem] rounded-lg overflow-auto shadow-sm max-h-[90vh]"
            >
                <div className="relative flex flex-col bg-white ">
                    <div className="flex justify-between items-center border-b-grey p-6">
                        <p className="text-[1.6rem] font-semibold text-gray-800">{title}</p>
                        <button
                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                            onClick={onClose}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="p-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}