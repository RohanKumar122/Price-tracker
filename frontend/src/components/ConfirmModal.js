import React from 'react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => { onConfirm(); onClose(); }}
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;