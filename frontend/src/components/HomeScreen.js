import React, { useState } from 'react';
import { Download, AlertCircle, X, IndianRupee, Trash2, CheckCircle2, Pencil } from 'lucide-react';
import { getCategoryColor, getCategoryIcon } from '../utils/helpers';
import ConfirmModal from './ConfirmModal';

const HomeScreen = ({ stats, expenses, reminders, onDelete, onEdit, onDownload, onMarkPaid }) => {
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [deleteId, setDeleteId] = useState(null); // For single delete confirmation
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // Generic confirm flag
    const [isMultiDelete, setIsMultiDelete] = useState(false);

    const toggleSelection = (id) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleLongPress = (id) => {
        if (!isSelectionMode) {
            setIsSelectionMode(true);
            toggleSelection(id);
        }
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
            // Sequential delete for multiple items
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
        <div className="space-y-3 pb-20">
            {/* Top Stats Card */}
            <div className="bg-white rounded-2xl p-5 shadow-lg relative">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-bold text-gray-800">Total Expenses</h2>
                    <div className="flex gap-2">
                        {isSelectionMode ? (
                            <div className="flex gap-2 animate-fade-in">
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
                            <>
                                <button
                                    onClick={() => setIsSelectionMode(true)}
                                    className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium"
                                >
                                    Select
                                </button>
                                <button
                                    onClick={onDownload}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition"
                                >
                                    <Download size={16} />
                                    <span className="text-sm font-medium">CSV</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex items-center text-4xl font-bold text-purple-600">
                    <IndianRupee size={32} strokeWidth={2.5} />
                    <span>{stats.total.toFixed(2)}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">{stats.count} transactions</div>
            </div>

            {/* Reminders Card */}
            {reminders.length > 0 && (
                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 shadow-lg">
                    <div className="flex items-center gap-2 text-white mb-2">
                        <AlertCircle size={20} />
                        <h3 className="font-bold">Payment Reminders</h3>
                    </div>
                    {reminders.map(reminder => (
                        <div key={reminder._id} className="bg-white/20 backdrop-blur rounded-xl p-3 mb-2 last:mb-0">
                            <div className="flex justify-between items-center text-white">
                                <div>
                                    <div className="font-semibold">{reminder.person_name}</div>
                                    <div className="flex items-center text-sm opacity-90">
                                        <IndianRupee size={14} />
                                        <span>{reminder.amount}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onMarkPaid(reminder._id)}
                                    className="px-3 py-1 bg-white text-orange-600 rounded-lg text-sm font-medium hover:bg-opacity-90 transition"
                                >
                                    Mark Paid
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Recent Expenses List */}
           <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-lg min-h-[50vh]">
    <h3 className="font-bold text-gray-800 mb-4 text-base sm:text-lg">
        Recent Expenses
    </h3>

    <div className="space-y-3">
        {expenses.length === 0 ? (
            <div className="text-center text-gray-400 py-16 text-sm">
                No expenses yet. Add your first expense!
            </div>
        ) : (
            expenses.map(expense => (
                <div
                    key={expense._id}
                    onClick={() => isSelectionMode && toggleSelection(expense._id)}
                    className={`flex items-start sm:items-center justify-between p-3 sm:p-4 rounded-xl transition cursor-pointer gap-3
                        ${isSelectionMode && selectedIds.has(expense._id)
                            ? 'bg-purple-50 border border-purple-200'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                >
                    {/* Left Section */}
                    <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                        {isSelectionMode ? (
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0
                                ${selectedIds.has(expense._id)
                                    ? 'bg-purple-500 border-purple-500'
                                    : 'border-gray-300'
                                }`}>
                                {selectedIds.has(expense._id) && (
                                    <CheckCircle2 size={14} className="text-white" />
                                )}
                            </div>
                        ) : (
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getCategoryColor(expense.category)}`}>
                                {getCategoryIcon(expense.category)}
                            </div>
                        )}

                        <div className="min-w-0">
                            <div className="font-semibold text-gray-800 leading-tight truncate">
                                {expense.title}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {new Date(expense.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} • {expense.category}
                            </div>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <div className="text-right">
                            <div className="font-bold text-gray-800 flex items-center justify-end text-sm sm:text-base">
                                <IndianRupee size={14} strokeWidth={2.5} />
                                {expense.amount}
                            </div>
                        </div>

                        {!isSelectionMode && (
                            <div className="flex gap-1 sm:gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(expense);
                                    }}
                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        confirmSingleDelete(expense._id);
                                    }}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ))
        )}
    </div>
</div>


            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={executeDelete}
                title={isMultiDelete ? "Delete Items" : "Delete Expense"}
                message={isMultiDelete
                    ? `Are you sure you want to delete ${selectedIds.size} items ? `
                    : "Are you sure you want to delete this expense?"
                }
            />
        </div>
    );
};

export default HomeScreen;
