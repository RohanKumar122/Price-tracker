import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, TrendingUp, Download, Plus, X, Home, PieChart, Users, LogOut, AlertCircle, Check } from 'lucide-react';

const API_URL = 'https://price-tracker-olive-xi.vercel.app';

// API Helper Functions
const api = {
  setToken: (token) => localStorage.setItem('token', token),
  getToken: () => localStorage.getItem('token'),
  clearToken: () => localStorage.removeItem('token'),
  
  request: async (endpoint, options = {}) => {
    const token = api.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }
    
    return data;
  },
  
  signup: (userData) => api.request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  login: (credentials) => api.request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  verify: () => api.request('/auth/verify'),
  
  getExpenses: (month, year) => {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    return api.request(`/expenses?${params}`);
  },
  
  addExpense: (expense) => api.request('/expenses', {
    method: 'POST',
    body: JSON.stringify(expense),
  }),
  
  deleteExpense: (id) => api.request(`/expenses/${id}`, { method: 'DELETE' }),
  
  getStats: (month, year) => {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    return api.request(`/expenses/stats?${params}`);
  },
  
  getLoans: (status) => {
    const params = status ? `?status=${status}` : '';
    return api.request(`/loans${params}`);
  },
  
  addLoan: (loan) => api.request('/loans', {
    method: 'POST',
    body: JSON.stringify(loan),
  }),
  
  updateLoanStatus: (id, status) => api.request(`/loans/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  
  deleteLoan: (id) => api.request(`/loans/${id}`, { method: 'DELETE' }),
  
  getReminders: () => api.request('/loans/reminders'),
};

// Helper Functions
const getCategoryColor = (category) => {
  const colors = {
    Food: 'bg-orange-100 text-orange-600',
    Transport: 'bg-blue-100 text-blue-600',
    Shopping: 'bg-pink-100 text-pink-600',
    Bills: 'bg-red-100 text-red-600',
    Entertainment: 'bg-purple-100 text-purple-600',
    Health: 'bg-green-100 text-green-600',
    Other: 'bg-gray-100 text-gray-600',
  };
  return colors[category] || colors.Other;
};

const getCategoryIcon = (category) => {
  const icons = {
    Food: '🍔',
    Transport: '🚗',
    Shopping: '🛍️',
    Bills: '📄',
    Entertainment: '🎮',
    Health: '⚕️',
    Other: '📦',
  };
  return icons[category] || icons.Other;
};

// Auth Screen
const AuthScreen = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = isLogin 
        ? await api.login({ email: formData.email, password: formData.password })
        : await api.signup(formData);
      
      api.setToken(response.access_token);
      onLogin(response.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mb-4">
            <DollarSign className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Expense Tracker</h1>
          <p className="text-gray-600 mt-2">Manage your finances smartly</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                required={!isLogin}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              required
            />
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Home Screen
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

// Stats Screen
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

// Loans Screen
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

// Bottom Nav
const BottomNav = ({ currentScreen, setCurrentScreen }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'stats', icon: PieChart, label: 'Stats' },
    { id: 'loans', icon: Users, label: 'Loans' },
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
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-all ${
                isActive ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'
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

// Add Modal
const AddModal = ({ currentScreen, onClose, onAdd }) => {
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
            {isLoan ? 'Add Loan' : 'Add Expense'}
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
            {isLoan ? 'Add Loan' : 'Add Expense'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Main App
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
                className={`flex-1 py-2 rounded-xl font-medium transition ${
                  viewMode === 'monthly' ? 'bg-white text-purple-600' : 'text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setViewMode('yearly')}
                className={`flex-1 py-2 rounded-xl font-medium transition ${
                  viewMode === 'yearly' ? 'bg-white text-purple-600' : 'text-white'
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