import React, { useState } from 'react';
import { Target, CheckCircle2, TrendingUp, Calendar, Trash2 } from 'lucide-react';

const categoryColors = {
    'Electronics': 'bg-blue-100 text-blue-600',
    'Furniture': 'bg-orange-100 text-orange-600',
    'Vehicle': 'bg-purple-100 text-purple-600',
    'Property': 'bg-green-100 text-green-600',
    'Travel': 'bg-pink-100 text-pink-600',
    'Other': 'bg-gray-100 text-gray-600'
};

const getCategoryColor = (category) => categoryColors[category] || categoryColors['Other'];

const BigExpensesScreen = ({ expenses = [], onDelete, onUpdateStatus }) => {
    // Separate expenses into 'planned' and 'paid'
    const planned = expenses.filter(e => e.status === 'planned');
    const paid = expenses.filter(e => e.status === 'paid');

    const totalPlanned = planned.reduce((sum, item) => sum + item.amount, 0);

    return (
        <div className="space-y-6 pb-24">
            {/* Header Card */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-700 rounded-[2.5rem] p-6 shadow-xl text-white relative overflow-hidden animate-fade-in">
                <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <h2 className="text-white/80 text-xs font-black uppercase tracking-widest mb-1">Financial Goals</h2>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black tracking-tight">{planned.length}</span>
                        <span className="text-white/60 font-bold">targets active</span>
                    </div>

                    <div className="mt-6 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <p className="text-xs text-emerald-100 font-bold uppercase tracking-wider mb-1">Total Goal Value</p>
                                <p className="text-xl font-black">₹ {totalPlanned.toLocaleString()}</p>
                            </div>
                            <Target className="text-emerald-200" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content List */}
            <div className="px-1 space-y-8 animate-slide-up">

                {/* Planned Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-2">
                        <TrendingUp size={16} className="text-gray-400" />
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">In Progress</h3>
                    </div>

                    {planned.length === 0 ? (
                        <div className="py-8 text-center bg-white rounded-[2rem] border border-dashed border-gray-200">
                            <p className="text-gray-400 font-bold text-sm">No active goals</p>
                        </div>
                    ) : (
                        planned.map(item => (
                            <div key={item._id} className="bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 relative group overflow-hidden">
                                <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-emerald-50/50 to-transparent pointer-events-none"></div>

                                <div className="flex justify-between items-start mb-3 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${getCategoryColor(item.category)}`}>
                                            <Target size={18} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 leading-tight">{item.title}</h4>
                                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-400 font-medium">
                                                <Calendar size={10} />
                                                <span>Planned: {new Date(item.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-lg text-gray-900">₹{item.amount.toLocaleString()}</p>
                                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-500`}>
                                            Planned
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2 relative z-10 mt-4">
                                    <button
                                        onClick={() => onUpdateStatus(item._id, 'paid')}
                                        className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-200 transition"
                                    >
                                        Mark Achieved
                                    </button>
                                    <button
                                        onClick={() => onDelete(item._id)}
                                        className="p-2 bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Completed Section */}
                {paid.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest">Achieved</h3>
                        </div>

                        {paid.map(item => (
                            <div key={item._id} className="bg-gray-50/50 p-4 rounded-[2rem] border border-gray-100 opacity-80 hover:opacity-100 transition">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                            <CheckCircle2 size={18} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 line-through decoration-gray-300">{item.title}</h4>
                                            <p className="text-xs text-gray-400 font-black uppercase tracking-wider">Completed</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-gray-900">₹{item.amount.toLocaleString()}</p>
                                        <button
                                            onClick={() => onDelete(item._id)}
                                            className="text-xs text-red-400 hover:text-red-600 font-medium mt-1"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BigExpensesScreen;
