import React from 'react';
import { X, Check } from 'lucide-react';

const LoansScreen = ({ loans, onDelete, onUpdateStatus }) => {
    const pendingLoans = loans.filter(l => l.status === 'pending');
    const paidLoans = loans.filter(l => l.status === 'paid');
    const totalPending = pendingLoans.reduce((sum, l) => sum + l.amount, 0);

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-lg font-bold text-gray-800 mb-2">Money Lent Out</h2>
                <div className="text-3xl font-bold text-orange-600">${totalPending.toFixed(2)}</div>
                <div className="text-sm text-gray-500 mt-1">{pendingLoans.length} pending</div>
            </div>

            {pendingLoans.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <h3 className="font-bold text-gray-800 mb-4">Pending Returns</h3>
                    <div className="space-y-3">
                        {pendingLoans.map(loan => (
                            <div key={loan._id} className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="font-bold text-gray-800">{loan.person_name}</div>
                                        <div className="text-2xl font-bold text-orange-600">${loan.amount}</div>
                                    </div>
                                    <button
                                        onClick={() => onDelete(loan._id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                                <div className="text-sm text-gray-600 mb-3">
                                    <div>Lent on: {new Date(loan.date).toLocaleDateString()}</div>
                                    {loan.reminder_date && (
                                        <div>Reminder: {new Date(loan.reminder_date).toLocaleDateString()}</div>
                                    )}
                                    {loan.description && <div className="mt-1">{loan.description}</div>}
                                </div>
                                <button
                                    onClick={() => onUpdateStatus(loan._id, 'paid')}
                                    className="w-full py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition flex items-center justify-center gap-2"
                                >
                                    <Check size={18} />
                                    Mark as Paid
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {paidLoans.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <h3 className="font-bold text-gray-800 mb-4">Paid Back</h3>
                    <div className="space-y-2">
                        {paidLoans.map(loan => (
                            <div key={loan._id} className="p-3 bg-green-50 rounded-xl border border-green-200 flex justify-between items-center">
                                <div>
                                    <div className="font-semibold text-gray-800">{loan.person_name}</div>
                                    <div className="text-sm text-gray-600">${loan.amount}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check size={18} className="text-green-600" />
                                    <button
                                        onClick={() => onDelete(loan._id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                    >
                                        <X size={16} />
                                    </button>
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
        </div>
    );
};

export default LoansScreen;
