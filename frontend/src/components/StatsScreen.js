import React from 'react';
import { getCategoryColor, getCategoryIcon } from '../utils/helpers';

const StatsScreen = ({ stats }) => {
    const categories = Object.entries(stats.by_category);
    const total = stats.total;

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Expense Breakdown</h2>

                <div className="space-y-4">
                    {categories.length === 0 ? (
                        <div className="text-center text-gray-400 py-8">
                            No data available
                        </div>
                    ) : (
                        categories.map(([category, amount]) => {
                            const percentage = total > 0 ? (amount / total * 100).toFixed(1) : 0;
                            return (
                                <div key={category} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${getCategoryColor(category)}`}>
                                                {getCategoryIcon(category)}
                                            </div>
                                            <span className="font-medium text-gray-700">{category}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-gray-800">${amount.toFixed(2)}</div>
                                            <div className="text-sm text-gray-500">{percentage}%</div>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatsScreen;
