import {X} from "lucide-react";
import React from "react";
import Krm3Button from "./Krm3Button";

interface Props {
    open: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    content: React.ReactNode;
    title?: string;
}
export default function ConfirmationModal({ open, onClose, onConfirm, content, title }: Props) {

    return (
        <div
            onClick={onClose}
            className={`fixed inset-0 z-[100] flex justify-center items-center transition-colors duration-300 ${open ? "visible bg-black/20" : "invisible bg-transparent"
            }`}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative mx-auto w-full max-w-[25rem] rounded-lg overflow-auto shadow-sm max-h-[90vh]"
            >
                <div className="relative flex flex-col bg-card ">
                    <div className="flex justify-between items-center border-b-app px-6">
                        <h2 className="text-xl font-semibold text-app">{title}</h2>
                        <button
                            className="text-app hover:text-krm3-primary focus:outline-none"
                            onClick={onClose}
                        >
                            <X className="w-5 h-5"/>
                        </button>
                    </div>
                    <div className="p-6">
                        {content}
                    </div>

                    <div className="flex justify-end items-center p-6 space-x-4">
                        <Krm3Button
                            label="Cancel"
                            onClick={onClose}
                            style="secondary"
                        />

                        <Krm3Button
                            label="Confirm"
                            onClick={() => {onConfirm()}}
                            style="primary"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}