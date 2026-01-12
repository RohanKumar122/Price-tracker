import React, { useState, useEffect } from 'react';
import { LogOut, Plus } from 'lucide-react';
import { api } from './api';
import AuthScreen from './components/AuthScreen';
import HomeScreen from './components/HomeScreen';
import StatsScreen from './components/StatsScreen';
import LoansScreen from './components/LoansScreen';
import BottomNav from './components/BottomNav';
import AddModal from './components/AddModal';

export default function ExpenseTracker() {
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [expenses, setExpenses] = useState([]);
  const [loans, setLoans] = useState([]);
  const [stats, setStats] = useState({ total: 0, by_category: {}, count: 0 });
  const [reminders, setReminders] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState('monthly');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, selectedMonth, selectedYear, viewMode, currentScreen]);

  const checkAuth = async () => {
    const token = api.getToken();
    if (token) {
      try {
        const response = await api.verify();
        setUser(response.user);
      } catch (err) {
        api.clearToken();
      }
    }
    setLoading(false);
  };

  const loadData = async () => {
    try {
      if (currentScreen === 'home') {
        const [expensesRes, statsRes, remindersRes] = await Promise.all([
          api.getExpenses(viewMode === 'monthly' ? selectedMonth : null, selectedYear),
          api.getStats(viewMode === 'monthly' ? selectedMonth : null, selectedYear),
          api.getReminders(),
        ]);
        setExpenses(expensesRes.expenses);
        setStats(statsRes);
        setReminders(remindersRes.reminders);
      } else if (currentScreen === 'loans') {
        const loansRes = await api.getLoans();
        setLoans(loansRes.loans);
      } else if (currentScreen === 'stats') {
        const statsRes = await api.getStats(viewMode === 'monthly' ? selectedMonth : null, selectedYear);
        setStats(statsRes);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const handleLogout = () => {
    api.clearToken();
    setUser(null);
    setCurrentScreen('home');
  };

  const downloadCSV = () => {
    const headers = ['Date', 'Title', 'Category', 'Amount', 'Description'];
    const rows = expenses.map(exp => [
      new Date(exp.date).toLocaleDateString(),
      exp.title,
      exp.category,
      exp.amount,
      exp.description
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_${viewMode}_${selectedYear}${viewMode === 'monthly' ? `_${selectedMonth}` : ''}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">Hi, {user.name}! 👋</h1>
            <p className="text-purple-100 text-sm">Track your expenses</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-white/20 rounded-xl transition"
          >
            <LogOut size={24} />
          </button>
        </div>

        {currentScreen === 'home' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 mt-4">
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setViewMode('monthly')}
                className={`flex-1 py-2 rounded-xl font-medium transition ${viewMode === 'monthly' ? 'bg-white text-purple-600' : 'text-white'
                  }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setViewMode('yearly')}
                className={`flex-1 py-2 rounded-xl font-medium transition ${viewMode === 'yearly' ? 'bg-white text-purple-600' : 'text-white'
                  }`}
              >
                Yearly
              </button>
            </div>

            <div className="flex gap-2">
              {viewMode === 'monthly' && (
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="flex-1 px-3 py-2 rounded-xl bg-white/20 text-white border-0 outline-none"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1} className="text-gray-800">
                      {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              )}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="flex-1 px-3 py-2 rounded-xl bg-white/20 text-white border-0 outline-none"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <option key={year} value={year} className="text-gray-800">
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        {currentScreen === 'home' && <HomeScreen
          stats={stats}
          expenses={expenses}
          reminders={reminders}
          onDelete={async (id) => {
            await api.deleteExpense(id);
            loadData();
          }}
          onDownload={downloadCSV}
          onMarkPaid={async (id) => {
            await api.updateLoanStatus(id, 'paid');
            loadData();
          }}
        />}

        {currentScreen === 'stats' && <StatsScreen stats={stats} />}

        {currentScreen === 'loans' && <LoansScreen
          loans={loans}
          onDelete={async (id) => {
            await api.deleteLoan(id);
            loadData();
          }}
          onUpdateStatus={async (id, status) => {
            await api.updateLoanStatus(id, status);
            loadData();
          }}
        />}
      </div>

      <button
        onClick={() => setShowAddModal(true)}
        className="fixed right-6 bottom-24 w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
      >
        <Plus size={28} />
      </button>

      <BottomNav currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />

      {showAddModal && (
        <AddModal
          currentScreen={currentScreen}
          onClose={() => setShowAddModal(false)}
          onAdd={async (data) => {
            if (currentScreen === 'loans') {
              await api.addLoan(data);
            } else {
              await api.addExpense(data);
            }
            loadData();
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}