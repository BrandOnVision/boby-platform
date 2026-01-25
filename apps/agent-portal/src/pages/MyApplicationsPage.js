import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Agent Portal - My Applications Page
 *
 * Shows jobs that the agent has applied to with status tracking
 * Brand-compliant: Gold accents, 2-letter markers, no emojis
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardContent, CircleBadge } from '@boby/ui';
import { useQuery } from '@tanstack/react-query';
import { jobsApi } from '../lib/api';
import { formatCurrency, formatRelativeTime } from '../hooks/useApi';
// Application status styling
const statusConfig = {
    'pending': { label: 'Pending Review', bg: 'bg-warning/10', text: 'text-warning' },
    'viewed': { label: 'Viewed', bg: 'bg-info/10', text: 'text-info' },
    'shortlisted': { label: 'Shortlisted', bg: 'bg-success/10', text: 'text-success' },
    'rejected': { label: 'Not Selected', bg: 'bg-grey-200', text: 'text-text-muted' },
    'accepted': { label: 'Accepted', bg: 'bg-success/10', text: 'text-success' },
};
// Job type markers
const jobTypeConfig = {
    'guard': { label: 'Guard', marker: 'GD' },
    'security_driver': { label: 'Security Driver', marker: 'SD' },
    'bodyguard': { label: 'Bodyguard', marker: 'BG' },
    'locksmith': { label: 'Locksmith', marker: 'LS' },
    'investigator': { label: 'Investigator', marker: 'IV' },
    'firm_contract': { label: 'Firm Contract', marker: 'FC' },
    'neighbourhood_patrol': { label: 'Patrol', marker: 'NP' },
    'property_protection': { label: 'Property Protection', marker: 'PP' },
    'private_investigator': { label: 'PI', marker: 'PI' },
    'other': { label: 'Other', marker: 'OT' },
};
export function MyApplicationsPage() {
    const [filterStatus, setFilterStatus] = useState('all');
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['my-applications'],
        queryFn: () => jobsApi.myApplications(),
    });
    const applications = data?.applications || [];
    // Filter applications
    const filteredApplications = applications.filter(app => {
        if (filterStatus === 'all')
            return true;
        if (filterStatus === 'pending')
            return app.application_status === 'pending' || !app.application_status;
        if (filterStatus === 'active')
            return app.job_status === 'active';
        if (filterStatus === 'closed')
            return app.job_status !== 'active';
        return true;
    });
    // Stats
    const stats = {
        total: applications.length,
        pending: applications.filter(a => a.application_status === 'pending' || !a.application_status).length,
        active: applications.filter(a => a.job_status === 'active').length,
        shortlisted: applications.filter(a => a.application_status === 'shortlisted').length,
    };
    // Format pay rate
    const formatRate = (payType, payMin, payMax) => {
        if (!payMin && !payMax)
            return 'Negotiable';
        if (payMin && payMax) {
            return `${formatCurrency(payMin)} - ${formatCurrency(payMax)}/${payType === 'hourly' ? 'hr' : 'job'}`;
        }
        if (payMin)
            return `From ${formatCurrency(payMin)}/${payType === 'hourly' ? 'hr' : 'job'}`;
        if (payMax)
            return `Up to ${formatCurrency(payMax)}/${payType === 'hourly' ? 'hr' : 'job'}`;
        return 'Negotiable';
    };
    // Get circle level
    const getCircleLevel = (jobType, isUrgent, isFeatured) => {
        if (isFeatured)
            return 'center';
        if (isUrgent)
            return 'inner';
        if (jobType === 'firm_contract' || jobType === 'bodyguard')
            return 'mid';
        return 'outer';
    };
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl sm:text-3xl font-bold text-text-primary", children: "My Applications" }), _jsx("p", { className: "text-text-muted mt-1", children: "Track your job applications" })] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => refetch(), children: "Refresh" })] }), _jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6", children: [_jsx(Card, { variant: "elevated", padding: "md", className: "bg-primary border-none", children: _jsxs(CardContent, { children: [_jsx("p", { className: "text-sm text-text-primary/70 mb-1", children: "Total Applied" }), _jsx("p", { className: "text-3xl font-bold text-text-primary", children: isLoading ? '...' : stats.total })] }) }), _jsx(Card, { variant: "elevated", padding: "md", children: _jsxs(CardContent, { children: [_jsx("p", { className: "text-sm text-text-muted mb-1", children: "Pending Review" }), _jsx("p", { className: "text-3xl font-bold text-warning", children: isLoading ? '...' : stats.pending })] }) }), _jsx(Card, { variant: "elevated", padding: "md", children: _jsxs(CardContent, { children: [_jsx("p", { className: "text-sm text-text-muted mb-1", children: "Active Jobs" }), _jsx("p", { className: "text-3xl font-bold text-success", children: isLoading ? '...' : stats.active })] }) }), _jsx(Card, { variant: "elevated", padding: "md", children: _jsxs(CardContent, { children: [_jsx("p", { className: "text-sm text-text-muted mb-1", children: "Shortlisted" }), _jsx("p", { className: "text-3xl font-bold text-info", children: isLoading ? '...' : stats.shortlisted })] }) })] }), _jsxs("div", { className: "flex gap-2 mb-6 overflow-x-auto pb-2", children: [_jsxs(Button, { variant: filterStatus === 'all' ? 'primary' : 'ghost', size: "sm", onClick: () => setFilterStatus('all'), children: ["All (", stats.total, ")"] }), _jsxs(Button, { variant: filterStatus === 'pending' ? 'primary' : 'ghost', size: "sm", onClick: () => setFilterStatus('pending'), children: ["Pending (", stats.pending, ")"] }), _jsx(Button, { variant: filterStatus === 'active' ? 'primary' : 'ghost', size: "sm", onClick: () => setFilterStatus('active'), children: "Active Jobs" }), _jsx(Button, { variant: filterStatus === 'closed' ? 'primary' : 'ghost', size: "sm", onClick: () => setFilterStatus('closed'), children: "Closed Jobs" })] }), error && (_jsx(Card, { variant: "default", padding: "lg", className: "mb-4 border-danger/30", children: _jsxs(CardContent, { className: "text-center", children: [_jsx("div", { className: "w-12 h-12 bg-danger/10 rounded-lg flex items-center justify-center mx-auto mb-3", children: _jsx("span", { className: "text-sm font-bold text-danger", children: "ER" }) }), _jsx("p", { className: "text-danger mb-2", children: "Failed to load applications" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => refetch(), children: "Try Again" })] }) })), isLoading && (_jsx("div", { className: "space-y-4", children: [1, 2, 3].map((i) => (_jsx(Card, { variant: "default", padding: "none", className: "animate-pulse", children: _jsx(CardContent, { className: "p-4 sm:p-6", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 rounded-lg bg-grey-200" }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsx("div", { className: "h-5 bg-grey-200 rounded w-1/3" }), _jsx("div", { className: "h-4 bg-grey-200 rounded w-1/4" })] })] }) }) }, i))) })), !isLoading && !error && (_jsx("div", { className: "space-y-4", children: filteredApplications.length === 0 ? (_jsx(Card, { variant: "default", padding: "lg", children: _jsxs(CardContent, { className: "text-center py-12", children: [_jsx("div", { className: "w-16 h-16 bg-grey-200 rounded-lg flex items-center justify-center mx-auto mb-4", children: _jsx("span", { className: "text-lg font-bold text-text-muted", children: "AP" }) }), _jsx("p", { className: "text-text-muted mb-4", children: filterStatus === 'all'
                                    ? "You haven't applied to any jobs yet"
                                    : "No applications match this filter" }), _jsx(Link, { to: "/jobs", children: _jsx(Button, { variant: "primary", size: "sm", children: "Browse Jobs" }) })] }) })) : (filteredApplications.map((app) => {
                    const status = statusConfig[app.application_status] || statusConfig['pending'];
                    const jobType = jobTypeConfig[app.job_type] || { label: app.job_type, marker: 'JB' };
                    const isJobClosed = app.job_status !== 'active';
                    return (_jsx(Card, { variant: "default", padding: "none", className: `overflow-hidden transition-colors ${isJobClosed ? 'opacity-60' : 'hover:border-primary/50'}`, children: _jsxs(CardContent, { className: "p-4 sm:p-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: `w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${isJobClosed ? 'bg-grey-200' :
                                                        app.is_featured ? 'bg-primary' :
                                                            app.is_urgent ? 'bg-danger/10' : 'bg-grey-200'}`, children: _jsx("span", { className: `text-sm font-bold ${isJobClosed ? 'text-text-muted' :
                                                            app.is_featured ? 'text-text-primary' :
                                                                app.is_urgent ? 'text-danger' : 'text-text-muted'}`, children: jobType.marker }) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-1 flex-wrap", children: [_jsx("h3", { className: "font-semibold text-text-primary", children: app.job_title }), _jsx(CircleBadge, { level: getCircleLevel(app.job_type, app.is_urgent, app.is_featured), size: "sm" }), isJobClosed && (_jsx("span", { className: "text-xs bg-grey-200 text-text-muted px-2 py-0.5 rounded font-medium", children: "CLOSED" }))] }), _jsxs("p", { className: "text-text-secondary", children: [jobType.label, app.poster_name && ` • ${app.poster_name}`] }), _jsxs("p", { className: "text-sm text-text-muted", children: [app.location_city, ", ", app.location_state] })] })] }), _jsxs("div", { className: "flex flex-col sm:items-end gap-2", children: [_jsx("span", { className: `inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${status.bg} ${status.text}`, children: status.label }), _jsxs("p", { className: "text-sm text-text-muted", children: ["Applied ", formatRelativeTime(app.applied_at)] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-lg font-bold text-success", children: formatRate(app.pay_type, app.pay_min, app.pay_max) }), _jsx(Link, { to: `/jobs/${app.job_slug}`, children: _jsx(Button, { variant: "outline", size: "sm", children: "View Job" }) })] })] })] }), app.message && (_jsx("div", { className: "mt-4 pt-4 border-t border-grey-200", children: _jsxs("p", { className: "text-sm text-text-muted", children: [_jsx("span", { className: "font-medium text-text-secondary", children: "Your message: " }), app.message.length > 150
                                                ? `${app.message.substring(0, 150)}...`
                                                : app.message] }) }))] }) }, app.enquiry_id));
                })) })), !isLoading && filteredApplications.length > 0 && (_jsxs("div", { className: "mt-6 text-center text-sm text-text-muted", children: ["Showing ", filteredApplications.length, " of ", stats.total, " applications"] }))] }));
}
//# sourceMappingURL=MyApplicationsPage.js.map