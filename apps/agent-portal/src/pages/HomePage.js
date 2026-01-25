import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Agent Portal Dashboard - Home Page
 *
 * Shows agent stats, upcoming shifts, and quick actions
 * Uses API hooks to fetch real data from the server
 * Brand-compliant: Gold accents, 2-letter markers, no emojis
 */
import { Button, Card, CardContent, CardTitle } from '@boby/ui';
import { useAuth } from '../context/AuthContext';
import { useJobs, useEarnings, formatCurrency } from '../hooks/useApi';
export function HomePage() {
    const { user } = useAuth();
    const { data: jobsData, isLoading: jobsLoading } = useJobs({ limit: 5 });
    const { data: earningsData, isLoading: earningsLoading } = useEarnings();
    // Build stats from API data
    const stats = [
        {
            label: 'Available Jobs',
            value: jobsLoading ? '...' : String(jobsData?.total || 0),
            change: 'Active listings'
        },
        {
            label: 'Hours This Week',
            value: '24', // TODO: Fetch from shifts API
            change: '6 remaining'
        },
        {
            label: 'Earnings (MTD)',
            value: earningsLoading ? '...' : formatCurrency(earningsData?.total_earned || 0),
            change: `${formatCurrency(earningsData?.this_week || 0)} this week`
        },
        {
            label: 'Trust Score',
            value: '94', // TODO: Fetch from profile
            change: '+2 points'
        },
    ];
    // Get display name from user
    const displayName = user?.firstName || user?.email?.split('@')[0] || 'Agent';
    // Mock shifts - TODO: Replace with API call
    const upcomingShifts = [
        { id: 1, venue: 'The Grand Hotel', date: 'Today', time: '6:00 PM - 2:00 AM', role: 'Door Security' },
        { id: 2, venue: 'Riverside Events', date: 'Tomorrow', time: '4:00 PM - 12:00 AM', role: 'Event Security' },
        { id: 3, venue: 'Metro Club', date: 'Sat, Jan 25', time: '9:00 PM - 4:00 AM', role: 'Crowd Control' },
    ];
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in", children: [_jsxs("div", { className: "mb-8", children: [_jsxs("h1", { className: "text-2xl sm:text-3xl font-bold text-text-primary", children: ["Welcome back, ", _jsx("span", { className: "text-primary-dark", children: displayName })] }), _jsx("p", { className: "text-text-muted mt-1", children: "Here's what's happening with your shifts today." })] }), _jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8", children: stats.map((stat) => (_jsx(Card, { variant: "elevated", padding: "md", children: _jsxs(CardContent, { children: [_jsx("p", { className: "text-sm text-text-muted mb-1", children: stat.label }), _jsx("p", { className: "text-2xl font-bold text-text-primary", children: stat.value }), _jsx("p", { className: "text-xs text-success mt-1", children: stat.change })] }) }, stat.label))) }), _jsxs(Card, { variant: "default", padding: "lg", className: "mb-8", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx(CardTitle, { children: "Upcoming Shifts" }), _jsx(Button, { variant: "ghost", size: "sm", children: "View All" })] }), _jsx("div", { className: "space-y-3", children: upcomingShifts.length === 0 ? (_jsx("p", { className: "text-text-muted text-center py-8", children: "No upcoming shifts scheduled" })) : (upcomingShifts.map((shift) => (_jsxs("div", { className: "flex items-center justify-between p-4 rounded-lg bg-grey-100 hover:bg-grey-200 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0", children: _jsx("span", { className: "text-xs font-bold text-text-primary", children: "VN" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-text-primary", children: shift.venue }), _jsx("p", { className: "text-sm text-text-muted", children: shift.role })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "font-medium text-text-primary", children: shift.date }), _jsx("p", { className: "text-sm text-text-muted", children: shift.time })] })] }, shift.id)))) })] }), _jsxs("div", { className: "grid sm:grid-cols-2 gap-4", children: [_jsx(Card, { variant: "default", padding: "md", interactive: true, className: "border-2 border-danger/20 hover:border-danger/40", children: _jsxs(CardContent, { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 rounded-lg bg-danger/10 flex items-center justify-center", children: _jsx("span", { className: "text-sm font-bold text-danger", children: "SOS" }) }), _jsxs("div", { children: [_jsx(CardTitle, { className: "text-danger", children: "Emergency Assistance" }), _jsx("p", { className: "text-sm text-text-muted", children: "Request immediate support" })] })] }) }), _jsx(Card, { variant: "default", padding: "md", interactive: true, className: "border-2 border-success/20 hover:border-success/40", children: _jsxs(CardContent, { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center", children: _jsx("span", { className: "text-sm font-bold text-success", children: "IN" }) }), _jsxs("div", { children: [_jsx(CardTitle, { className: "text-success", children: "Check In" }), _jsx("p", { className: "text-sm text-text-muted", children: "Start your shift at current location" })] })] }) })] })] }));
}
//# sourceMappingURL=HomePage.js.map