import {X} from "lucide-react";
import React, {useEffect, useState} from "react";

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
                <div className="relative flex flex-col bg-white ">
                    <div className="flex justify-between items-center border-b-grey px-6">
                        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
                        <button
                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                            onClick={onClose}
                        >
                            <X className="w-5 h-5"/>
                        </button>
                    </div>
                    <div className="p-6">
                        {content}
                    </div>

                    <div className="flex justify-end items-center p-6 space-x-4">
                        <button
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none"
                            onClick={onClose}
                        >Cancel
                        </button>

                        <button
                            className={`px-4 py-2 text-white rounded-lg focus:outline-none
                             bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500`}
                            onClick={() => {onConfirm()}}
                        >Confirm
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
}