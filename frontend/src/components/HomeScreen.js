import React from 'react';
import { Download, AlertCircle, X } from 'lucide-react';
import { getCategoryColor, getCategoryIcon } from '../utils/helpers';

const HomeScreen = ({ stats, expenses, reminders, onDelete, onDownload, onMarkPaid }) => (
    <div className="space-y-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">Total Expenses</h2>
                <button
                    onClick={onDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition"
                >
                    <Download size={18} />
                    <span className="text-sm font-medium">CSV</span>
                </button>
            </div>
            <div className="text-4xl font-bold text-purple-600">${stats.total.toFixed(2)}</div>
            <div className="text-sm text-gray-500 mt-1">{stats.count} transactions</div>
        </div>

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
                                <div className="text-sm opacity-90">${reminder.amount}</div>
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

        <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="font-bold text-gray-800 mb-4">Recent Expenses</h3>
            <div className="space-y-3">
                {expenses.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                        No expenses yet. Add your first expense!
                    </div>
                ) : (
                    expenses.map(expense => (
                        <div key={expense._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getCategoryColor(expense.category)}`}>
                                    {getCategoryIcon(expense.category)}
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-800">{expense.title}</div>
                                    <div className="text-sm text-gray-500">
                                        {new Date(expense.date).toLocaleDateString()} • {expense.category}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <div className="font-bold text-gray-800">${expense.amount}</div>
                                </div>
                                <button
                                    onClick={() => onDelete(expense._id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    </div>
);

export default HomeScreen;
