import React from "react";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
}

const Modal: React.FC<ModalProps> = ({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
}) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                    {title}
                </h2>
                <p className="mb-6 text-gray-700 dark:text-gray-300">
                    {description}
                </p>
                <div className="flex justify-end gap-2">
                    <button
                        className="btn btn-secondary"
                        onClick={onClose}
                        type="button"
                    >
                        {cancelText}
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={onConfirm}
                        type="button"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
