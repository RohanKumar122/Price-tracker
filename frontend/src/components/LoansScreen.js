import React, { useState } from 'react';
import { X, Check, IndianRupee, Trash2, CheckCircle2, Pencil } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

const LoansScreen = ({ loans, onDelete, onEdit, onUpdateStatus }) => {
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [deleteId, setDeleteId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isMultiDelete, setIsMultiDelete] = useState(false);

    const pendingLoans = loans.filter(l => l.status === 'pending');
    const paidLoans = loans.filter(l => l.status === 'paid');
    const totalPending = pendingLoans.reduce((sum, l) => sum + l.amount, 0);

    const toggleSelection = (id) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const confirmSingleDelete = (id) => {
        setDeleteId(id);
        setIsMultiDelete(false);
        setShowDeleteConfirm(true);
    };

    const confirmMultiDelete = () => {
        setIsMultiDelete(true);
        setShowDeleteConfirm(true);
    };

    const executeDelete = async () => {
        if (isMultiDelete) {
            for (const id of selectedIds) {
                await onDelete(id);
            }
            setSelectedIds(new Set());
            setIsSelectionMode(false);
        } else if (deleteId) {
            await onDelete(deleteId);
        }
        setShowDeleteConfirm(false);
        setDeleteId(null);
    };

    return (
        <div className="space-y-4 pb-20">
            {/* Summary Card */}
            <div className="bg-white rounded-2xl p-5 shadow-lg relative">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-bold text-gray-800">Money Lent Out</h2>
                    {isSelectionMode ? (
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setIsSelectionMode(false);
                                    setSelectedIds(new Set());
                                }}
                                className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmMultiDelete}
                                disabled={selectedIds.size === 0}
                                className="px-3 py-1.5 bg-red-100 text-red-600 rounded-xl text-sm font-medium flex items-center gap-1 disabled:opacity-50"
                            >
                                <Trash2 size={16} />
                                <span>Delete ({selectedIds.size})</span>
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsSelectionMode(true)}
                            className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium"
                        >
                            Select
                        </button>
                    )}
                </div>
                <div className="flex items-center text-3xl font-bold text-orange-600">
                    <IndianRupee size={28} strokeWidth={2.5} />
                    <span>{totalPending.toFixed(2)}</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">{pendingLoans.length} pending</div>
            </div>

            {/* Pending Loans List */}
            {pendingLoans.length > 0 && (
                <div className="bg-white rounded-2xl p-5 shadow-lg">
                    <h3 className="font-bold text-gray-800 mb-3">Pending Returns</h3>
                    <div className="space-y-2">
                        {pendingLoans.map(loan => (
                            <div
                                key={loan._id}
                                onClick={() => isSelectionMode && toggleSelection(loan._id)}
                                className={`p-3 rounded-xl border transition cursor-pointer ${isSelectionMode && selectedIds.has(loan._id)
                                    ? 'bg-orange-50 border-orange-300'
                                    : 'bg-orange-50 border-orange-200'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-start gap-3">
                                        {isSelectionMode && (
                                            <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedIds.has(loan._id)
                                                ? 'bg-orange-500 border-orange-500'
                                                : 'border-gray-400'
                                                }`}>
                                                {selectedIds.has(loan._id) && <CheckCircle2 size={14} className="text-white" />}
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-bold text-gray-800">{loan.person_name}</div>
                                            <div className="text-xl font-bold text-orange-600 flex items-center">
                                                <IndianRupee size={18} strokeWidth={2.5} />
                                                {loan.amount}
                                            </div>
                                        </div>
                                    </div>
                                    {!isSelectionMode && (
                                        <div className="flex gap-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit(loan);
                                                }}
                                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    confirmSingleDelete(loan._id);
                                                }}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="text-sm text-gray-600 mb-2 pl-8">
                                    <div>Lent on: {new Date(loan.date).toLocaleDateString()}</div>
                                    {loan.reminder_date && (
                                        <div>Reminder: {new Date(loan.reminder_date).toLocaleDateString()}</div>
                                    )}
                                    {loan.description && <div className="mt-1 italic">{loan.description}</div>}
                                </div>
                                {!isSelectionMode && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onUpdateStatus(loan._id, 'paid');
                                        }}
                                        className="w-full py-1.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Check size={16} />
                                        Mark as Paid
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Paid Loans List */}
            {paidLoans.length > 0 && (
                <div className="bg-white rounded-2xl p-5 shadow-lg">
                    <h3 className="font-bold text-gray-800 mb-3">Paid Back</h3>
                    <div className="space-y-2">
                        {paidLoans.map(loan => (
                            <div
                                key={loan._id}
                                onClick={() => isSelectionMode && toggleSelection(loan._id)}
                                className={`p-2.5 rounded-xl border flex justify-between items-center transition cursor-pointer ${isSelectionMode && selectedIds.has(loan._id)
                                    ? 'bg-green-50 border-green-300'
                                    : 'bg-green-50 border-green-200'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {isSelectionMode && (
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedIds.has(loan._id)
                                            ? 'bg-green-500 border-green-500'
                                            : 'border-gray-400'
                                            }`}>
                                            {selectedIds.has(loan._id) && <CheckCircle2 size={14} className="text-white" />}
                                        </div>
                                    )}
                                    <div>
                                        <div className="font-semibold text-gray-800">{loan.person_name}</div>
                                        <div className="text-sm text-gray-600 flex items-center">
                                            <IndianRupee size={12} />
                                            {loan.amount}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!isSelectionMode && (
                                        <>
                                            <Check size={18} className="text-green-600" />
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    confirmSingleDelete(loan._id);
                                                }}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                                            >
                                                <X size={16} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {loans.length === 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-lg text-center text-gray-400 py-12">
                    No loans recorded yet
                </div>
            )}

            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={executeDelete}
                title={isMultiDelete ? "Delete Loans" : "Delete Loan"}
                message={isMultiDelete
                    ? `Are you sure you want to delete ${selectedIds.size} loans?`
                    : "Are you sure you want to delete this loan?"
                }
            />
        </div>
    );
};

export default LoansScreen;
