import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Agent Portal Earnings Page
 *
 * Phase 2: Enhanced with date filtering, earnings chart, mobile-friendly cards
 * Brand-compliant: Gold accents, clean typography, no emojis
 */
import { useState, useMemo } from 'react';
import { Button, Card, CardContent, CardTitle } from '@boby/ui';
import { useEarnings, formatCurrency, formatDate } from '../hooks/useApi';
const DATE_RANGES = [
    { id: 'week', name: 'This Week' },
    { id: 'month', name: 'This Month' },
    { id: '3months', name: 'Last 3 Months' },
    { id: 'year', name: 'This Year' },
    { id: 'all', name: 'All Time' },
];
export function EarningsPage() {
    const { data: earnings, isLoading, error, refetch } = useEarnings();
    const [dateRange, setDateRange] = useState('month');
    // Calculate totals from commissions
    const commissions = earnings?.commissions || [];
    // Summary values
    const thisWeek = earnings?.this_week || 0;
    const totalEarned = earnings?.total_earned || 0;
    const pending = earnings?.pending || 0;
    // Filter commissions by date range
    const filteredCommissions = useMemo(() => {
        if (dateRange === 'all')
            return commissions;
        const now = new Date();
        const ranges = {
            week: 7,
            month: 30,
            '3months': 90,
            year: 365,
            all: Infinity,
        };
        const daysAgo = ranges[dateRange];
        const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
        return commissions.filter(c => new Date(c.created_at) >= cutoffDate);
    }, [commissions, dateRange]);
    // Calculate period totals
    const periodTotal = useMemo(() => {
        return filteredCommissions.reduce((sum, c) => sum + c.amount, 0);
    }, [filteredCommissions]);
    const periodPaid = useMemo(() => {
        return filteredCommissions
            .filter(c => c.status === 'paid' || c.status === 'completed')
            .reduce((sum, c) => sum + c.amount, 0);
    }, [filteredCommissions]);
    // Simple bar chart data - last 6 periods
    const chartData = useMemo(() => {
        if (commissions.length === 0)
            return [];
        // Group by week/month based on date range
        const periods = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const startDate = new Date(now);
            let label = '';
            if (dateRange === 'week') {
                startDate.setDate(startDate.getDate() - (i * 7));
                label = `W${6 - i}`;
            }
            else {
                startDate.setMonth(startDate.getMonth() - i);
                label = startDate.toLocaleDateString('en-AU', { month: 'short' });
            }
            const endDate = new Date(startDate);
            if (dateRange === 'week') {
                endDate.setDate(endDate.getDate() + 7);
            }
            else {
                endDate.setMonth(endDate.getMonth() + 1);
            }
            const amount = commissions
                .filter(c => {
                const date = new Date(c.created_at);
                return date >= startDate && date < endDate;
            })
                .reduce((sum, c) => sum + c.amount, 0);
            periods.push({ label, amount });
        }
        return periods;
    }, [commissions, dateRange]);
    const maxChartValue = Math.max(...chartData.map(d => d.amount), 1);
    // Export to CSV
    const handleExport = () => {
        const headers = ['Date', 'Description', 'Amount', 'Status'];
        const rows = filteredCommissions.map(c => [
            formatDate(c.created_at),
            c.description || 'Commission Payment',
            c.amount.toFixed(2),
            c.status
        ]);
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `earnings-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl sm:text-3xl font-bold text-text-primary", children: "Earnings" }), _jsx("p", { className: "text-text-muted mt-1", children: "Track your income and payment history" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => refetch(), children: "Refresh" }), _jsx(Button, { variant: "outline", size: "sm", onClick: handleExport, children: "Export" })] })] }), _jsx("div", { className: "flex gap-2 mb-6 overflow-x-auto pb-2", children: DATE_RANGES.map((range) => (_jsx(Button, { variant: dateRange === range.id ? 'primary' : 'ghost', size: "sm", onClick: () => setDateRange(range.id), children: range.name }, range.id))) }), _jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8", children: [_jsx(Card, { variant: "elevated", padding: "md", className: "bg-primary border-none", children: _jsxs(CardContent, { children: [_jsx("p", { className: "text-sm text-text-primary/70 mb-1", children: "This Week" }), _jsx("p", { className: "text-2xl sm:text-3xl font-bold text-text-primary", children: isLoading ? '...' : formatCurrency(thisWeek) })] }) }), _jsx(Card, { variant: "elevated", padding: "md", children: _jsxs(CardContent, { children: [_jsx("p", { className: "text-sm text-text-muted mb-1", children: "Period Total" }), _jsx("p", { className: "text-2xl sm:text-3xl font-bold text-text-primary", children: isLoading ? '...' : formatCurrency(periodTotal) })] }) }), _jsx(Card, { variant: "elevated", padding: "md", children: _jsxs(CardContent, { children: [_jsx("p", { className: "text-sm text-text-muted mb-1", children: "Pending" }), _jsx("p", { className: "text-2xl sm:text-3xl font-bold text-warning", children: isLoading ? '...' : formatCurrency(pending) })] }) }), _jsx(Card, { variant: "elevated", padding: "md", children: _jsxs(CardContent, { children: [_jsx("p", { className: "text-sm text-text-muted mb-1", children: "Lifetime" }), _jsx("p", { className: "text-2xl sm:text-3xl font-bold text-success", children: isLoading ? '...' : formatCurrency(totalEarned) })] }) })] }), chartData.length > 0 && (_jsxs(Card, { variant: "default", padding: "lg", className: "mb-8", children: [_jsx(CardTitle, { className: "mb-6", children: "Earnings Trend" }), _jsx("div", { className: "h-40 flex items-end justify-between gap-2", children: chartData.map((period, idx) => (_jsxs("div", { className: "flex-1 flex flex-col items-center", children: [_jsx("div", { className: "w-full bg-primary rounded-t transition-all duration-300 hover:bg-primary-dark", style: {
                                        height: `${Math.max((period.amount / maxChartValue) * 100, 4)}%`,
                                        minHeight: period.amount > 0 ? '8px' : '2px'
                                    }, title: formatCurrency(period.amount) }), _jsx("span", { className: "text-xs text-text-muted mt-2", children: period.label })] }, idx))) })] })), error && (_jsx(Card, { variant: "default", padding: "lg", className: "mb-6 border-danger/30", children: _jsxs(CardContent, { className: "text-center", children: [_jsx("div", { className: "w-12 h-12 bg-danger/10 rounded-lg flex items-center justify-center mx-auto mb-3", children: _jsx("span", { className: "text-sm font-bold text-danger", children: "ER" }) }), _jsx("p", { className: "text-danger", children: "Failed to load earnings data" }), _jsx(Button, { variant: "outline", size: "sm", className: "mt-4", onClick: () => refetch(), children: "Try Again" })] }) })), _jsxs(Card, { variant: "default", padding: "lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx(CardTitle, { children: "Payment History" }), _jsxs("span", { className: "text-sm text-text-muted", children: [filteredCommissions.length, " transactions"] })] }), isLoading ? (_jsx("div", { className: "space-y-4", children: [1, 2, 3].map((i) => (_jsx("div", { className: "h-16 bg-grey-200 rounded animate-pulse" }, i))) })) : filteredCommissions.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "w-16 h-16 bg-grey-200 rounded-lg flex items-center justify-center mx-auto mb-4", children: _jsx("span", { className: "text-lg font-bold text-text-muted", children: "EA" }) }), _jsx("p", { className: "text-text-muted", children: "No payments in this period" })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "hidden sm:block overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-grey-300", children: [_jsx("th", { className: "text-left py-3 px-4 text-sm font-medium text-text-muted", children: "Description" }), _jsx("th", { className: "text-left py-3 px-4 text-sm font-medium text-text-muted", children: "Date" }), _jsx("th", { className: "text-right py-3 px-4 text-sm font-medium text-text-muted", children: "Amount" }), _jsx("th", { className: "text-right py-3 px-4 text-sm font-medium text-text-muted", children: "Status" })] }) }), _jsx("tbody", { children: filteredCommissions.map((commission) => (_jsxs("tr", { className: "border-b border-grey-200 hover:bg-grey-100", children: [_jsx("td", { className: "py-4 px-4 font-medium text-text-primary", children: commission.description || 'Commission Payment' }), _jsx("td", { className: "py-4 px-4 text-text-secondary", children: formatDate(commission.created_at) }), _jsx("td", { className: "py-4 px-4 font-semibold text-text-primary text-right", children: formatCurrency(commission.amount) }), _jsx("td", { className: "py-4 px-4 text-right", children: _jsx("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${commission.status === 'paid' || commission.status === 'completed'
                                                                ? 'bg-success/10 text-success'
                                                                : 'bg-warning/10 text-warning'}`, children: commission.status === 'paid' || commission.status === 'completed' ? 'Paid' : 'Pending' }) })] }, commission.id))) })] }) }), _jsx("div", { className: "sm:hidden space-y-3", children: filteredCommissions.map((commission) => (_jsxs("div", { className: "p-4 bg-grey-100 rounded-lg flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium text-text-primary", children: commission.description || 'Commission Payment' }), _jsx("p", { className: "text-sm text-text-muted", children: formatDate(commission.created_at) })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "font-bold text-text-primary", children: formatCurrency(commission.amount) }), _jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${commission.status === 'paid' || commission.status === 'completed'
                                                        ? 'bg-success/10 text-success'
                                                        : 'bg-warning/10 text-warning'}`, children: commission.status === 'paid' || commission.status === 'completed' ? 'Paid' : 'Pending' })] })] }, commission.id))) })] }))] }), !isLoading && filteredCommissions.length > 0 && (_jsxs("div", { className: "mt-6 p-4 bg-grey-100 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsxs("div", { className: "text-sm text-text-muted", children: [DATE_RANGES.find(r => r.id === dateRange)?.name, " Summary"] }), _jsxs("div", { className: "flex items-center gap-6", children: [_jsxs("div", { children: [_jsx("span", { className: "text-sm text-text-muted mr-2", children: "Paid:" }), _jsx("span", { className: "font-bold text-success", children: formatCurrency(periodPaid) })] }), _jsxs("div", { children: [_jsx("span", { className: "text-sm text-text-muted mr-2", children: "Pending:" }), _jsx("span", { className: "font-bold text-warning", children: formatCurrency(periodTotal - periodPaid) })] }), _jsxs("div", { children: [_jsx("span", { className: "text-sm text-text-muted mr-2", children: "Total:" }), _jsx("span", { className: "font-bold text-text-primary", children: formatCurrency(periodTotal) })] })] })] }))] }));
}
//# sourceMappingURL=EarningsPage.js.map