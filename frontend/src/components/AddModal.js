import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const AddModal = ({ currentScreen, onClose, onAdd, initialData, isEditing }) => {
    const isLoan = currentScreen === 'loans';
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
        description: '',
        person_name: '',
        reminder_date: '',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                amount: initialData.amount || '',
                category: initialData.category || 'Food',
                date: initialData.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0],
                description: initialData.description || '',
                person_name: initialData.person_name || '',
                reminder_date: initialData.reminder_date ? initialData.reminder_date.split('T')[0] : '',
            });
        }
    }, [initialData]);

    const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'];

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = isLoan ? {
            person_name: formData.person_name,
            amount: formData.amount,
            date: new Date(formData.date).toISOString(),
            reminder_date: formData.reminder_date ? new Date(formData.reminder_date).toISOString() : null,
            description: formData.description,
        } : {
            title: formData.title,
            amount: formData.amount,
            category: formData.category,
            date: new Date(formData.date).toISOString(),
            description: formData.description,
        };
        onAdd(data);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
            <div className="bg-white w-full max-w-lg rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {isEditing ? `Edit ${isLoan ? 'Loan' : 'Expense'}` : `Add ${isLoan ? 'Loan' : 'Expense'}`}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isLoan ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Person Name</label>
                            <input
                                type="text"
                                value={formData.person_name}
                                onChange={(e) => setFormData({ ...formData, person_name: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                                required
                            />
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                            required
                        />
                    </div>

                    {!isLoan && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                            required
                        />
                    </div>

                    {isLoan && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Reminder Date (Optional)</label>
                            <input
                                type="date"
                                value={formData.reminder_date}
                                onChange={(e) => setFormData({ ...formData, reminder_date: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none"
                            rows="3"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition"
                    >
                        {isEditing ? 'Update' : (isLoan ? 'Add Loan' : 'Add Expense')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddModal;
