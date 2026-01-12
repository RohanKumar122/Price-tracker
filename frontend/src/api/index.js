const API_URL = process.env.REACT_APP_API_URL || 'https://price-tracker-olive-xi.vercel.app/api';

export const api = {
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
