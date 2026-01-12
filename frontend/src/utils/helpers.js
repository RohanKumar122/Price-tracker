export const getCategoryColor = (category) => {
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

export const getCategoryIcon = (category) => {
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
