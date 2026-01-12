import React from 'react';
import { Home, PieChart, Users } from 'lucide-react';

const BottomNav = ({ currentScreen, setCurrentScreen }) => {
    const navItems = [
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'loans', icon: Users, label: 'Loans' },
        { id: 'stats', icon: PieChart, label: 'Stats' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 rounded-t-3xl shadow-2xl">
            <div className="flex justify-around items-center max-w-md mx-auto">
                {navItems.map(item => {
                    const Icon = item.icon;
                    const isActive = currentScreen === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setCurrentScreen(item.id)}
                            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-all ${isActive ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            <span className={`text-xs font-medium ${isActive ? 'font-bold' : ''}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;
